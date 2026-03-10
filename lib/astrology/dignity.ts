import { getRashiFromLongitude, getRashiIndex, RASHIS } from "@/lib/astrology/rashi";
import type { DignityStatus, PlanetName } from "@/lib/types/astrology";

const MOVABLE = new Set([0, 3, 6, 9]);
const FIXED = new Set([1, 4, 7, 10]);

const DIGNITY_RULES: Record<PlanetName, { exalted: string; debilitated: string; own: string[]; friendly: string[]; enemy: string[] }> = {
  sun: {
    exalted: "Aries",
    debilitated: "Libra",
    own: ["Leo"],
    friendly: ["Cancer", "Aries", "Scorpio", "Sagittarius", "Pisces"],
    enemy: ["Taurus", "Libra", "Capricorn", "Aquarius"],
  },
  moon: {
    exalted: "Taurus",
    debilitated: "Scorpio",
    own: ["Cancer"],
    friendly: ["Leo", "Gemini", "Virgo"],
    enemy: [],
  },
  mercury: {
    exalted: "Virgo",
    debilitated: "Pisces",
    own: ["Gemini", "Virgo"],
    friendly: ["Taurus", "Libra", "Leo"],
    enemy: ["Cancer"],
  },
  venus: {
    exalted: "Pisces",
    debilitated: "Virgo",
    own: ["Taurus", "Libra"],
    friendly: ["Gemini", "Capricorn", "Aquarius"],
    enemy: ["Leo", "Cancer"],
  },
  mars: {
    exalted: "Capricorn",
    debilitated: "Cancer",
    own: ["Aries", "Scorpio"],
    friendly: ["Leo", "Cancer", "Sagittarius", "Pisces"],
    enemy: ["Gemini", "Virgo"],
  },
  jupiter: {
    exalted: "Cancer",
    debilitated: "Capricorn",
    own: ["Sagittarius", "Pisces"],
    friendly: ["Aries", "Leo", "Scorpio", "Cancer"],
    enemy: ["Gemini", "Virgo", "Taurus", "Libra"],
  },
  saturn: {
    exalted: "Libra",
    debilitated: "Aries",
    own: ["Capricorn", "Aquarius"],
    friendly: ["Gemini", "Virgo", "Taurus", "Libra"],
    enemy: ["Cancer", "Leo", "Aries", "Scorpio"],
  },
  rahu: {
    exalted: "Taurus",
    debilitated: "Scorpio",
    own: ["Aquarius"],
    friendly: ["Gemini", "Virgo", "Taurus", "Libra", "Capricorn", "Aquarius"],
    enemy: ["Cancer", "Leo", "Aries", "Scorpio"],
  },
  ketu: {
    exalted: "Scorpio",
    debilitated: "Taurus",
    own: ["Scorpio"],
    friendly: ["Aries", "Leo", "Sagittarius", "Pisces"],
    enemy: ["Cancer", "Leo", "Gemini", "Virgo"],
  },
};

export function getDignityStatus(planet: PlanetName, longitude: number): DignityStatus {
  const sign = getRashiFromLongitude(longitude);
  const rule = DIGNITY_RULES[planet];
  if (sign === rule.exalted) return "exalted";
  if (sign === rule.debilitated) return "debilitated";
  if (rule.own.includes(sign)) return "own";
  if (rule.friendly.includes(sign)) return "friendly";
  if (rule.enemy.includes(sign)) return "enemy";
  return "neutral";
}

export function getDignityNumeric(status: DignityStatus): number {
  switch (status) {
    case "exalted":
      return 1;
    case "own":
      return 0.9;
    case "friendly":
      return 0.72;
    case "neutral":
      return 0.58;
    case "enemy":
      return 0.36;
    case "debilitated":
      return 0.2;
    default:
      return 0.5;
  }
}

export function getNavamsaSignIndex(longitude: number): number {
  const signIndex = getRashiIndex(longitude);
  const withinSign = ((longitude % 30) + 30) % 30;
  const navamsaWithinSign = Math.floor(withinSign / (30 / 9));

  let startIndex = signIndex;
  if (FIXED.has(signIndex)) {
    startIndex = (signIndex + 8) % 12;
  } else if (!MOVABLE.has(signIndex)) {
    startIndex = (signIndex + 4) % 12;
  }

  return (startIndex + navamsaWithinSign) % 12;
}

export function getNavamsaSign(longitude: number): string {
  return RASHIS[getNavamsaSignIndex(longitude)] ?? RASHIS[0];
}

export function getNavamsaDignityStatus(planet: PlanetName, longitude: number): DignityStatus {
  const navamsaSign = getNavamsaSign(longitude);
  const rule = DIGNITY_RULES[planet];
  if (navamsaSign === rule.exalted) return "exalted";
  if (navamsaSign === rule.debilitated) return "debilitated";
  if (rule.own.includes(navamsaSign)) return "own";
  if (rule.friendly.includes(navamsaSign)) return "friendly";
  if (rule.enemy.includes(navamsaSign)) return "enemy";
  return "neutral";
}
