// Bugfix (a,c,k,p): canonical rashi array, normalized [0,360), floating-point safe indexing.
export const RASHIS = ["Aries","Taurus","Gemini","Cancer","Leo","Virgo","Libra","Scorpio","Sagittarius","Capricorn","Aquarius","Pisces"] as const;

export function normalizeDegrees(value: number): number {
  return ((value % 360) + 360) % 360;
}

export function getRashiIndex(longitude: number): number {
  const normalized = normalizeDegrees(longitude);
  return Math.floor(normalized / 30);
}

export function getRashiFromLongitude(longitude: number): (typeof RASHIS)[number] {
  const index = getRashiIndex(longitude);
  return RASHIS[index] ?? RASHIS[0];
}
