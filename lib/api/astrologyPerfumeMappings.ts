import { createStaticClient } from "@/lib/supabase/server";
import { serverError } from "@/lib/security/logger";
import type { ProductDisplay } from "@/types/product";

type PerfumeRow = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  image_url: string | null;
  is_active: boolean;
  created_at: string | null;
};

type PlanetMappingRow = {
  planet_id: number;
  perfumes: PerfumeRow | PerfumeRow[] | null;
};

type ZodiacMappingRow = {
  zodiac_id: number;
  perfumes: PerfumeRow | PerfumeRow[] | null;
};

type NakshatraMappingRow = {
  nakshatra_id: number;
  perfumes: PerfumeRow | PerfumeRow[] | null;
};

const ZODIAC_NAMES = [
  "Aries",
  "Taurus",
  "Gemini",
  "Cancer",
  "Leo",
  "Virgo",
  "Libra",
  "Scorpio",
  "Sagittarius",
  "Capricorn",
  "Aquarius",
  "Pisces",
] as const;

const NAKSHATRA_NAMES = [
  "Ashwini",
  "Bharani",
  "Krittika",
  "Rohini",
  "Mrigashira",
  "Ardra",
  "Punarvasu",
  "Pushya",
  "Ashlesha",
  "Magha",
  "Purva Phalguni",
  "Uttara Phalguni",
  "Hasta",
  "Chitra",
  "Swati",
  "Vishakha",
  "Anuradha",
  "Jyeshtha",
  "Mula",
  "Purva Ashadha",
  "Uttara Ashadha",
  "Shravana",
  "Dhanishta",
  "Shatabhisha",
  "Purva Bhadrapada",
  "Uttara Bhadrapada",
  "Revati",
] as const;

function normalizeName(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

const NAKSHATRA_ALIASES = new Map<string, string>([
  ["dhanishtha", "Dhanishta"],
  ["jyestha", "Jyeshtha"],
  ["purvashada", "Purva Ashadha"],
  ["uttarashada", "Uttara Ashadha"],
  ["purvabhadrapada", "Purva Bhadrapada"],
  ["uttarabhadrapada", "Uttara Bhadrapada"],
]);

function toProductDisplay(row: PerfumeRow): ProductDisplay {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    short_description: null,
    price: row.price,
    original_price: null,
    images: [{ url: row.image_url ?? "" }],
    category_slug: "astrology-perfume",
    variants: [],
    meta_title: null,
    meta_description: null,
    featured: false,
    is_active: row.is_active,
    created_at: row.created_at,
  };
}

function extractPerfume(value: PerfumeRow | PerfumeRow[] | null): PerfumeRow | null {
  if (value == null) return null;
  if (Array.isArray(value)) return value[0] ?? null;
  return value;
}

function getNakshatraId(name: string): number | null {
  const normalized = normalizeName(name);
  const aliasResolved = NAKSHATRA_ALIASES.get(normalized.replace(/\s+/g, "")) ?? name;
  const idx = NAKSHATRA_NAMES.findIndex((item) => normalizeName(item) === normalizeName(aliasResolved));
  if (idx < 0) return null;
  return idx + 1;
}

function getZodiacId(name: string): number | null {
  const idx = ZODIAC_NAMES.findIndex((item) => normalizeName(item) === normalizeName(name));
  if (idx < 0) return null;
  return idx + 1;
}

export type DeterministicMappedPerfumes = {
  sunSign: ProductDisplay | null;
  moonSign: ProductDisplay | null;
  venus: ProductDisplay | null;
  nakshatra: ProductDisplay | null;
};

export async function getDeterministicMappedPerfumes(params: {
  sunSignName: string;
  moonSignName: string;
  nakshatraName: string;
}): Promise<DeterministicMappedPerfumes> {
  const supabase = createStaticClient();
  const sunZodiacId = getZodiacId(params.sunSignName);
  const moonZodiacId = getZodiacId(params.moonSignName);
  const nakshatraId = getNakshatraId(params.nakshatraName);
  const zodiacIds = [sunZodiacId, moonZodiacId].filter((id): id is number => id != null);

  const [planetRes, zodiacRes, nakshatraRes] = await Promise.all([
    supabase
      .from("perfume_planet_mapping")
      .select("planet_id, perfumes:perfume_id (id,name,slug,description,price,image_url,is_active,created_at)")
      .eq("planet_id", 6),
    zodiacIds.length === 0
      ? Promise.resolve({ data: [], error: null })
      : supabase
          .from("perfume_zodiac_mapping")
          .select("zodiac_id, perfumes:perfume_id (id,name,slug,description,price,image_url,is_active,created_at)")
          .in("zodiac_id", zodiacIds),
    nakshatraId == null
      ? Promise.resolve({ data: [], error: null })
      : supabase
          .from("perfume_nakshatra_mapping")
          .select("nakshatra_id, perfumes:perfume_id (id,name,slug,description,price,image_url,is_active,created_at)")
          .eq("nakshatra_id", nakshatraId),
  ]);

  if (planetRes.error) {
    serverError("astrology/mappings venus query", planetRes.error);
  }
  if (zodiacRes.error) {
    serverError("astrology/mappings zodiac query", zodiacRes.error);
  }
  if (nakshatraRes.error) {
    serverError("astrology/mappings nakshatra query", nakshatraRes.error);
  }

  const planetRows = (planetRes.data ?? []) as PlanetMappingRow[];
  const zodiacRows = (zodiacRes.data ?? []) as ZodiacMappingRow[];
  const nakshatraRows = (nakshatraRes.data ?? []) as NakshatraMappingRow[];

  let venusPerfume: ProductDisplay | null = null;
  for (const row of planetRows) {
    const perfume = extractPerfume(row.perfumes);
    if (!perfume || !perfume.is_active) continue;
    venusPerfume = toProductDisplay(perfume);
    break;
  }

  const zodiacMap = new Map<number, ProductDisplay>();
  for (const row of zodiacRows) {
    const perfume = extractPerfume(row.perfumes);
    if (!perfume || !perfume.is_active) continue;
    if (!zodiacMap.has(row.zodiac_id)) {
      zodiacMap.set(row.zodiac_id, toProductDisplay(perfume));
    }
  }

  let nakshatraPerfume: ProductDisplay | null = null;
  for (const row of nakshatraRows) {
    const perfume = extractPerfume(row.perfumes);
    if (!perfume || !perfume.is_active) continue;
    nakshatraPerfume = toProductDisplay(perfume);
    break;
  }

  return {
    sunSign: sunZodiacId == null ? null : zodiacMap.get(sunZodiacId) ?? null,
    moonSign: moonZodiacId == null ? null : zodiacMap.get(moonZodiacId) ?? null,
    venus: venusPerfume,
    nakshatra: nakshatraPerfume,
  };
}
