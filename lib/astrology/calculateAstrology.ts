import type SwissEPH from "sweph-wasm";

import { toJulianDay } from "@/lib/astrology/julianDay";
import { getNakshatraFromLongitude, getNakshatraPadaFromLongitude } from "@/lib/astrology/nakshatra";
import { normalizeDegrees, getRashiFromLongitude } from "@/lib/astrology/rashi";
import { getSwissEngine } from "@/lib/astrology/swiss";
import type {
  AstrologyCalculationResult,
  AstrologyEngineInput,
  PlanetLongitudes,
} from "@/lib/types/astrology";

function round(value: number): number {
  return Math.round(value * 10000) / 10000;
}

function getPlanetRaw(swe: SwissEPH, jd: number, planetId: number, flags: number): { lon: number; speed: number } {
  const calc = swe.swe_calc_ut(jd, planetId, flags);
  return {
    lon: normalizeDegrees(calc[0]),
    speed: calc[3] ?? 0,
  };
}

export async function calculateAstrology(input: AstrologyEngineInput): Promise<AstrologyCalculationResult> {
  const swe = await getSwissEngine();

  // Bugfix (b): explicit sidereal Lahiri mode before any sidereal calculations.
  swe.swe_set_sid_mode(swe.SE_SIDM_LAHIRI, 0, 0);

  const julianDayUt = toJulianDay(swe, input.dob, input.time, input.timezoneOffsetMinutes);

  // Bugfix (i,r): true node chosen and used consistently across API calculations.
  const flags = swe.SEFLG_SWIEPH | swe.SEFLG_SIDEREAL | swe.SEFLG_SPEED;

  const sun = getPlanetRaw(swe, julianDayUt, swe.SE_SUN, flags);
  const moon = getPlanetRaw(swe, julianDayUt, swe.SE_MOON, flags);

  const planets: PlanetLongitudes = {
    sun: round(sun.lon),
    moon: round(moon.lon),
  };

  return {
    sunSign: getRashiFromLongitude(planets.sun),
    moonSign: getRashiFromLongitude(planets.moon),
    nakshatra: getNakshatraFromLongitude(planets.moon),
    nakshatraPada: getNakshatraPadaFromLongitude(planets.moon),
    planets,
  };
}
