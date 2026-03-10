import type { PlanetLongitudes, PlanetStrength, PlanetStrengthScores } from "@/lib/types/astrology";
import { RASHIS, getRashiFromLongitude } from "@/lib/astrology/rashi";

type PlanetKey = keyof PlanetLongitudes;

const STRENGTH_VALUES = {
  exalted: 100,
  own: 90,
  friendly: 75,
  neutral: 60,
  enemy: 40,
  debilitated: 20,
} as const;

const PLANET_DIGNITIES: Record<
  PlanetKey,
  {
    exalted: string;
    debilitated: string;
    own: string[];
    friendly: string[];
    enemy: string[];
  }
> = {
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

function getSignFromLongitude(longitude: number): string {
  return getRashiFromLongitude(longitude);
}

function evaluateStrength(planet: PlanetKey, longitude: number): PlanetStrength {
  const sign = getSignFromLongitude(longitude);
  const cfg = PLANET_DIGNITIES[planet];

  if (sign === cfg.exalted) {
    return { sign, grade: "exalted", score: STRENGTH_VALUES.exalted };
  }
  if (sign === cfg.debilitated) {
    return { sign, grade: "debilitated", score: STRENGTH_VALUES.debilitated };
  }
  if (cfg.own.includes(sign)) {
    return { sign, grade: "own", score: STRENGTH_VALUES.own };
  }
  if (cfg.friendly.includes(sign)) {
    return { sign, grade: "friendly", score: STRENGTH_VALUES.friendly };
  }
  if (cfg.enemy.includes(sign)) {
    return { sign, grade: "enemy", score: STRENGTH_VALUES.enemy };
  }

  if (RASHIS.includes(sign as (typeof RASHIS)[number])) {
    return { sign, grade: "neutral", score: STRENGTH_VALUES.neutral };
  }

  return { sign, grade: "neutral", score: STRENGTH_VALUES.neutral };
}

export function calculatePlanetStrengths(planets: PlanetLongitudes): PlanetStrengthScores {
  return {
    sun: evaluateStrength("sun", planets.sun),
    moon: evaluateStrength("moon", planets.moon),
    mercury: evaluateStrength("mercury", planets.mercury ?? 0),
    venus: evaluateStrength("venus", planets.venus ?? 0),
    mars: evaluateStrength("mars", planets.mars ?? 0),
    jupiter: evaluateStrength("jupiter", planets.jupiter ?? 0),
    saturn: evaluateStrength("saturn", planets.saturn ?? 0),
    rahu: evaluateStrength("rahu", planets.rahu ?? 0),
    ketu: evaluateStrength("ketu", planets.ketu ?? 0),
  };
}
