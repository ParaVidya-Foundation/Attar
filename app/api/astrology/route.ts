import { NextResponse } from "next/server";

import { calculateAstrology } from "@/lib/astrology/calculateAstrology";
import { buildAstroApiResponse } from "@/lib/astrology/recommendations";
import { cacheGet, cacheSet } from "@/lib/redis";
import { resolveBirthLocation } from "@/lib/geography/resolveBirthLocation";
import { getClientIdentifier, rateLimit } from "@/lib/rate-limit";
import { sendAstroLeadEmail } from "@/lib/email/sendAstroLead";
import { serverError, serverWarn } from "@/lib/security/logger";
import { astroSchema } from "@/lib/validation/astroSchema";

export const runtime = "nodejs";

const localCache = new Map<string, { expiresAt: number; value: string }>();

function localCacheGet(key: string): string | null {
  const value = localCache.get(key);
  if (!value) return null;
  if (value.expiresAt < Date.now()) {
    localCache.delete(key);
    return null;
  }
  return value.value;
}

function localCacheSet(key: string, value: string): void {
  localCache.set(key, { value, expiresAt: Date.now() + 5 * 60_000 });
}

function sanitizeText(value: string): string {
  return value.replace(/[\u0000-\u001F\u007F]/g, "").trim();
}

export async function POST(req: Request) {
  const identifier = `astrology:${getClientIdentifier(req)}`;
  const limit = await rateLimit(identifier, 20, 60_000);
  if (!limit.allowed) {
    serverWarn(
      "api/astrology",
      JSON.stringify({ event: "rate_limited", identifier, remaining: limit.remaining, resetAt: limit.resetAt }),
    );
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  let payload: unknown;

  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = astroSchema.safeParse(payload);
  if (!parsed.success) {
    serverWarn(
      "api/astrology",
      JSON.stringify({
        event: "validation_failed",
        identifier,
        issues: parsed.error.issues.map((issue) => ({
          path: issue.path.join("."),
          code: issue.code,
          message: issue.message,
        })),
      }),
    );
    return NextResponse.json({ error: "Please check your birth details and try again." }, { status: 400 });
  }

  try {
    const sanitizedInput = {
      ...parsed.data,
      name: sanitizeText(parsed.data.name),
      email: sanitizeText(parsed.data.email),
      city: sanitizeText(parsed.data.city),
    };

    serverWarn(
      "api/astrology",
      JSON.stringify({
        event: "request_received",
        identifier,
        hasEmail: Boolean(sanitizedInput.email),
        city: sanitizedInput.city,
      }),
    );

    const location = await resolveBirthLocation({
      city: sanitizedInput.city,
      latitude: parsed.data.latitude,
      longitude: parsed.data.longitude,
    });

    if (typeof location.timezoneOffsetMinutes !== "number") {
      serverWarn(
        "api/astrology",
        JSON.stringify({ event: "timezone_resolution_failed", identifier, city: sanitizedInput.city }),
      );
      return NextResponse.json({ error: "Unable to resolve timezone for this location." }, { status: 400 });
    }

    const requestCacheKey = `astro:result:${parsed.data.dob}:${parsed.data.time}:${location.latitude.toFixed(4)}:${location.longitude.toFixed(4)}`;

    // Bugfix (n): short-term cache, Redis first then local fallback.
    const redisCached = await cacheGet<string>(requestCacheKey);
    if (typeof redisCached === "string" && redisCached.length > 0) {
      try {
        return NextResponse.json(JSON.parse(redisCached));
      } catch {
        serverWarn("api/astrology", JSON.stringify({ event: "invalid_redis_cache", identifier }));
      }
    }

    const memoryCached = localCacheGet(requestCacheKey);
    if (memoryCached) {
      try {
        return NextResponse.json(JSON.parse(memoryCached));
      } catch {
        serverWarn("api/astrology", JSON.stringify({ event: "invalid_memory_cache", identifier }));
      }
    }

    const astrology = await calculateAstrology({
      dob: parsed.data.dob,
      time: parsed.data.time,
      location,
      timezoneOffsetMinutes: location.timezoneOffsetMinutes,
    });

    serverWarn(
      "api/astrology",
      JSON.stringify({
        event: "astrology_calculated",
        identifier,
        sunSign: astrology.sunSign,
        moonSign: astrology.moonSign,
        nakshatra: astrology.nakshatra,
      }),
    );

    const response = await buildAstroApiResponse(astrology);
    if (response.recommendedProducts.length === 0) {
      serverError(
        "api/astrology",
        `No recommendations returned for ${astrology.sunSign}/${astrology.moonSign}/${astrology.nakshatra}`,
      );
    }
    const serialized = JSON.stringify(response);

    await cacheSet(requestCacheKey, serialized, 300);
    localCacheSet(requestCacheKey, serialized);

    // Best-effort lead capture; never block or fail the main response.
    void sendAstroLeadEmail({
      name: sanitizedInput.name,
      email: sanitizedInput.email,
      dob: parsed.data.dob,
      time: parsed.data.time,
      city: sanitizedInput.city,
      astrology: {
        sunSign: astrology.sunSign,
        moonSign: astrology.moonSign,
        nakshatra: astrology.nakshatra,
      },
    });

    return NextResponse.json(response);
  } catch (error) {
    const rawMessage = error instanceof Error ? error.message.toLowerCase() : "";

    if (
      rawMessage.includes("resolve birth location") ||
      rawMessage.includes("location") ||
      rawMessage.includes("city") ||
      rawMessage.includes("manual coordinates") ||
      rawMessage.includes("unable to resolve")
    ) {
      return NextResponse.json(
        { error: "We could not find that city. Please try again." },
        { status: 400 },
      );
    }

    serverError("api/astrology", error);
    return NextResponse.json(
      { error: "Something went wrong while calculating your chart. Please try again." },
      { status: 500 },
    );
  }
}
