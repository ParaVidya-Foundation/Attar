import type SwissEPH from "sweph-wasm";

import type { PlanetLongitudes } from "@/lib/types/astrology";

export function normalizeDegrees(value: number): number {
  return ((value % 360) + 360) % 360;
}

export function calculatePlanetaryPositions(
  swe: SwissEPH,
  julianDayUt: number,
): PlanetLongitudes {
  const iflag = swe.SEFLG_SWIEPH | swe.SEFLG_SIDEREAL | swe.SEFLG_SPEED;

  const sun = normalizeDegrees(swe.swe_calc_ut(julianDayUt, swe.SE_SUN, iflag)[0]);
  const moon = normalizeDegrees(swe.swe_calc_ut(julianDayUt, swe.SE_MOON, iflag)[0]);
  const mercury = normalizeDegrees(swe.swe_calc_ut(julianDayUt, swe.SE_MERCURY, iflag)[0]);
  const venus = normalizeDegrees(swe.swe_calc_ut(julianDayUt, swe.SE_VENUS, iflag)[0]);
  const mars = normalizeDegrees(swe.swe_calc_ut(julianDayUt, swe.SE_MARS, iflag)[0]);
  const jupiter = normalizeDegrees(swe.swe_calc_ut(julianDayUt, swe.SE_JUPITER, iflag)[0]);
  const saturn = normalizeDegrees(swe.swe_calc_ut(julianDayUt, swe.SE_SATURN, iflag)[0]);
  const rahu = normalizeDegrees(swe.swe_calc_ut(julianDayUt, swe.SE_MEAN_NODE, iflag)[0]);
  const ketu = normalizeDegrees(rahu + 180);

  return {
    sun,
    moon,
    mercury,
    venus,
    mars,
    jupiter,
    saturn,
    rahu,
    ketu,
  };
}

export function calculateAscendant(
  swe: SwissEPH,
  julianDayUt: number,
  latitude: number,
  longitude: number,
): number {
  const houses = swe.swe_houses(julianDayUt, latitude, longitude, "P");
  return normalizeDegrees(houses.ascmc[0] ?? 0);
}
