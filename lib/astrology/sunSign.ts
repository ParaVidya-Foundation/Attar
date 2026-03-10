const SUN_SIGN_BOUNDARIES = [
  { sign: "Aries", start: [3, 21], end: [4, 19] },
  { sign: "Taurus", start: [4, 20], end: [5, 20] },
  { sign: "Gemini", start: [5, 21], end: [6, 20] },
  { sign: "Cancer", start: [6, 21], end: [7, 22] },
  { sign: "Leo", start: [7, 23], end: [8, 22] },
  { sign: "Virgo", start: [8, 23], end: [9, 22] },
  { sign: "Libra", start: [9, 23], end: [10, 22] },
  { sign: "Scorpio", start: [10, 23], end: [11, 21] },
  { sign: "Sagittarius", start: [11, 22], end: [12, 21] },
  { sign: "Capricorn", start: [12, 22], end: [1, 19] },
  { sign: "Aquarius", start: [1, 20], end: [2, 18] },
  { sign: "Pisces", start: [2, 19], end: [3, 20] },
] as const;

function parseDob(dob: string): { month: number; day: number } {
  const parts = dob.split("-").map((part) => Number.parseInt(part, 10));
  if (parts.length !== 3 || parts.some((part) => Number.isNaN(part))) {
    throw new Error("Invalid DOB format");
  }

  const [, month, day] = parts;
  return { month, day };
}

function isInRange(month: number, day: number, start: readonly [number, number], end: readonly [number, number]): boolean {
  const value = month * 100 + day;
  const startValue = start[0] * 100 + start[1];
  const endValue = end[0] * 100 + end[1];

  if (startValue <= endValue) {
    return value >= startValue && value <= endValue;
  }

  return value >= startValue || value <= endValue;
}

export function getSunSignFromDob(dob: string): string {
  const { month, day } = parseDob(dob);

  const match = SUN_SIGN_BOUNDARIES.find((entry) => isInRange(month, day, entry.start, entry.end));
  return match?.sign ?? "Aries";
}
