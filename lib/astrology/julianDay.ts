import type SwissEPH from "sweph-wasm";

const MIN_TIMEZONE_OFFSET = -12 * 60;
const MAX_TIMEZONE_OFFSET = 14 * 60;

export function parseDob(dob: string): { year: number; month: number; day: number } {
  const parts = dob.split("-").map((part) => Number.parseInt(part, 10));
  if (parts.length !== 3 || parts.some((part) => Number.isNaN(part))) {
    throw new Error("Invalid DOB format");
  }

  const [year, month, day] = parts;
  return { year, month, day };
}

export function parseTime(time: string): { hour: number; minute: number } {
  const parts = time.split(":").map((part) => Number.parseInt(part, 10));
  if (parts.length !== 2 || parts.some((part) => Number.isNaN(part))) {
    throw new Error("Invalid time format");
  }

  const [hour, minute] = parts;
  return { hour, minute };
}

export function estimateTimezoneOffsetMinutesFromLongitude(longitude: number): number {
  const estimatedHours = Math.round(longitude / 15);
  const offset = estimatedHours * 60;

  return Math.max(MIN_TIMEZONE_OFFSET, Math.min(MAX_TIMEZONE_OFFSET, offset));
}

export function toUtcDateParts(
  dob: string,
  time: string,
  timezoneOffsetMinutes: number,
): { year: number; month: number; day: number; hourDecimal: number } {
  const { year, month, day } = parseDob(dob);
  const { hour, minute } = parseTime(time);

  const utcMillis = Date.UTC(year, month - 1, day, hour, minute, 0) - timezoneOffsetMinutes * 60_000;
  const utcDate = new Date(utcMillis);

  return {
    year: utcDate.getUTCFullYear(),
    month: utcDate.getUTCMonth() + 1,
    day: utcDate.getUTCDate(),
    hourDecimal: utcDate.getUTCHours() + utcDate.getUTCMinutes() / 60 + utcDate.getUTCSeconds() / 3600,
  };
}

export function toJulianDay(
  swe: SwissEPH,
  dob: string,
  time: string,
  timezoneOffsetMinutes: number,
): number {
  const utc = toUtcDateParts(dob, time, timezoneOffsetMinutes);
  return swe.swe_julday(utc.year, utc.month, utc.day, utc.hourDecimal, swe.SE_GREG_CAL);
}
