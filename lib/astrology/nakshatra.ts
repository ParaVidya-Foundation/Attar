// Bugfix (d,j): derive spans from exact 360/27 and 360/108 values; consistent boundary handling.
export const NAKSHATRAS = [
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

const NAKSHATRA_SPAN = 360 / 27;
const PADA_SPAN = NAKSHATRA_SPAN / 4;
const EPSILON = 1e-9;

function normalizeDegrees(value: number): number {
  return ((value % 360) + 360) % 360;
}

export function getNakshatraIndex(longitude: number): number {
  const normalized = normalizeDegrees(longitude);
  // Tie-break rule: exact boundary belongs to next segment (except 360 -> 0 after normalize).
  return Math.floor((normalized + EPSILON) / NAKSHATRA_SPAN) % 27;
}

export function getNakshatraFromLongitude(longitude: number): (typeof NAKSHATRAS)[number] {
  return NAKSHATRAS[getNakshatraIndex(longitude)] ?? NAKSHATRAS[0];
}

export function getNakshatraPadaFromLongitude(longitude: number): 1 | 2 | 3 | 4 {
  const normalized = normalizeDegrees(longitude);
  const withinNakshatra = normalized % NAKSHATRA_SPAN;
  const padaIndex = Math.floor((withinNakshatra + EPSILON) / PADA_SPAN);
  return (Math.min(3, Math.max(0, padaIndex)) + 1) as 1 | 2 | 3 | 4;
}
