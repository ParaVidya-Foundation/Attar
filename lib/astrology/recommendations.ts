import { createHash } from "node:crypto";

import { getDeterministicMappedPerfumes } from "@/lib/api/astrologyPerfumeMappings";
import { getAllProducts } from "@/lib/api/products";
import { cacheGet, cacheSet } from "@/lib/redis";
import { serverError, serverWarn } from "@/lib/security/logger";
import type { AstrologyCalculationResult, AstroApiResponse, RecommendationReason } from "@/lib/types/astrology";
import type { ProductDisplay } from "@/types/product";

const CORE_RECOMMENDATION_COUNT = 4;
type RecommendationSlot = "sun" | "moon" | "nakshatra" | "venus";

function hashKey(astrology: AstrologyCalculationResult): string {
  return createHash("sha1")
    .update(
      JSON.stringify({
        sunSign: astrology.sunSign,
        moonSign: astrology.moonSign,
        nakshatra: astrology.nakshatra,
        nakshatraPada: astrology.nakshatraPada,
        planets: astrology.planets,
      }),
    )
    .digest("hex");
}

function normalize(value: string | null | undefined): string {
  if (!value) return "";
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function searchableText(product: ProductDisplay): string {
  return normalize(`${product.slug} ${product.name} ${product.category_slug ?? ""}`);
}

function matchesAny(product: ProductDisplay, patterns: string[]): boolean {
  const target = searchableText(product);
  return patterns.some((pattern) => target.includes(normalize(pattern)));
}

function pickUnique(
  preferred: ProductDisplay | null,
  fallbackPool: ProductDisplay[],
  seenIds: Set<string>,
  matcher: (product: ProductDisplay) => boolean,
): ProductDisplay | null {
  if (preferred && !seenIds.has(preferred.id)) {
    seenIds.add(preferred.id);
    return preferred;
  }

  const fallback = fallbackPool.find((product) => !seenIds.has(product.id) && matcher(product)) ?? null;
  if (!fallback) return null;
  seenIds.add(fallback.id);
  return fallback;
}

function buildReasons(
  slots: Partial<Record<RecommendationSlot, ProductDisplay>>,
  astrology: AstrologyCalculationResult,
): RecommendationReason[] {
  const orderedSlots: RecommendationSlot[] = ["sun", "moon", "nakshatra", "venus"];

  return orderedSlots.flatMap((slot) => {
    const product = slots[slot];
    if (!product) return [];

    if (slot === "nakshatra") {
      return {
        productId: product.id,
        reason: `You were born in ${astrology.nakshatra} Nakshatra. This perfume matches your birth star energy.`,
      };
    }
    if (slot === "sun") {
      return {
        productId: product.id,
        reason: `This is your Sun sign perfume for ${astrology.sunSign}. It supports confidence and daily vitality.`,
      };
    }
    if (slot === "moon") {
      return {
        productId: product.id,
        reason: `This is your Moon sign perfume for ${astrology.moonSign}. It supports calm emotions and mental comfort.`,
      };
    }
    if (slot === "venus") {
      return {
        productId: product.id,
        reason: "This Venus (Shukra) perfume supports attraction, harmony, and relationship energy.",
      };
    }

    return {
      productId: product.id,
      reason: "This perfume is aligned with your chart signals.",
    };
  });
}

export async function buildAstroApiResponse(astrology: AstrologyCalculationResult): Promise<AstroApiResponse> {
  const cacheKey = `astro:products:${hashKey(astrology)}`;
  const cached = await cacheGet<string>(cacheKey);
  if (typeof cached === "string" && cached.length > 0) {
    try {
      return JSON.parse(cached) as AstroApiResponse;
    } catch {
      // ignore corrupted cache data
    }
  }

  const mapped = await getDeterministicMappedPerfumes({
    sunSignName: astrology.sunSign,
    moonSignName: astrology.moonSign,
    nakshatraName: astrology.nakshatra,
  });

  const allProducts = await getAllProducts();
  if (allProducts.length === 0) {
    serverError("astrology/recommendations", "Product list is empty. Check Supabase products query.");
  }

  const seenIds = new Set<string>();
  const slotProducts: Partial<Record<RecommendationSlot, ProductDisplay>> = {};

  slotProducts.sun = pickUnique(
    mapped.sunSign,
    allProducts,
    seenIds,
    (product) => matchesAny(product, [astrology.sunSign]),
  ) ?? undefined;

  slotProducts.moon = pickUnique(
    mapped.moonSign,
    allProducts,
    seenIds,
    (product) => matchesAny(product, [astrology.moonSign]),
  ) ?? undefined;

  slotProducts.nakshatra = pickUnique(
    mapped.nakshatra,
    allProducts,
    seenIds,
    (product) => matchesAny(product, [astrology.nakshatra]),
  ) ?? undefined;

  slotProducts.venus = pickUnique(
    mapped.venus,
    allProducts,
    seenIds,
    (product) => matchesAny(product, ["venus", "shukra"]),
  ) ?? undefined;

  const orderedSlots: RecommendationSlot[] = ["sun", "moon", "nakshatra", "venus"];
  const recommendedProducts = orderedSlots
    .map((slot) => slotProducts[slot])
    .filter((product): product is ProductDisplay => Boolean(product));

  const reasons = buildReasons(slotProducts, astrology);

  if (mapped.sunSign == null) {
    serverWarn("astrology/recommendations", `No zodiac mapping found for Sun sign ${astrology.sunSign}`);
  }
  if (mapped.moonSign == null) {
    serverWarn("astrology/recommendations", `No zodiac mapping found for Moon sign ${astrology.moonSign}`);
  }
  if (mapped.nakshatra == null) {
    serverWarn("astrology/recommendations", `No strict Nakshatra mapping row found for ${astrology.nakshatra}`);
  }
  if (mapped.venus == null) {
    serverWarn("astrology/recommendations", "No Venus mapping found for planet_id=6");
  }

  serverWarn(
    "astrology/recommendations",
    JSON.stringify({
      event: "match_summary",
      productCount: allProducts.length,
      matched: {
        sun: slotProducts.sun?.slug ?? null,
        moon: slotProducts.moon?.slug ?? null,
        nakshatra: slotProducts.nakshatra?.slug ?? null,
        venus: slotProducts.venus?.slug ?? null,
      },
    }),
  );

  const response: AstroApiResponse = {
    sunSign: astrology.sunSign,
    moonSign: astrology.moonSign,
    nakshatra: astrology.nakshatra,
    nakshatraPada: astrology.nakshatraPada,
    planets: astrology.planets,
    recommendedProducts,
    recommendationReasons: reasons,
    message:
      recommendedProducts.length < CORE_RECOMMENDATION_COUNT
        ? "Some recommendations may be unavailable at the moment."
        : undefined,
  };

  await cacheSet(cacheKey, JSON.stringify(response), 300);
  return response;
}
