import type { BirthLocation } from "@/lib/types/astrology";

interface NominatimPlace {
  lat: string;
  lon: string;
  importance?: number;
  display_name?: string;
}

interface TimeApiResponse {
  timeZone?: string;
  currentUtcOffset?: { seconds?: number };
}

const NOMINATIM_URL = "https://nominatim.openstreetmap.org/search";
const TIMEZONE_URL = "https://timeapi.io/api/TimeZone/coordinate";
const REQUEST_TIMEOUT_MS = 8000;
const RETRIES = 3;

function normalizeCity(city: string): string {
  return city.trim().replace(/\s+/g, " ");
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchWithRetry(url: string, init: RequestInit, retries = RETRIES): Promise<Response> {
  let lastError: unknown;
  for (let attempt = 0; attempt < retries; attempt += 1) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    try {
      const response = await fetch(url, { ...init, signal: controller.signal });
      if (response.status === 429 || response.status === 403) {
        await sleep(250 * 2 ** attempt);
        continue;
      }
      return response;
    } catch (error) {
      lastError = error;
      await sleep(250 * 2 ** attempt);
    } finally {
      clearTimeout(timeout);
    }
  }
  throw lastError instanceof Error ? lastError : new Error("Network request failed");
}

async function fetchLocationCandidates(query: string): Promise<NominatimPlace[]> {
  const url = new URL(NOMINATIM_URL);
  url.searchParams.set("q", query);
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("addressdetails", "1");
  url.searchParams.set("limit", "5");

  const response = await fetchWithRetry(url.toString(), {
    method: "GET",
    cache: "no-store",
    headers: {
      Accept: "application/json",
      // Bugfix (g): Nominatim requires a meaningful user-agent.
      "User-Agent": "anand-ras-astrology/1.0 (support@anandras.com)",
    },
  });

  if (!response.ok) {
    throw new Error(`Location lookup failed with status ${response.status}`);
  }

  const payload = (await response.json()) as NominatimPlace[];
  return Array.isArray(payload) ? payload : [];
}

export async function suggestBirthLocations(queryInput: string): Promise<string[]> {
  const query = normalizeCity(queryInput);
  if (query.length < 2) {
    return [];
  }

  const candidates = await fetchLocationCandidates(query);
  return candidates
    .map((candidate) => candidate.display_name?.trim() ?? "")
    .filter(Boolean)
    .slice(0, 5);
}

function parseCoordinates(latitude: number, longitude: number): BirthLocation | null {
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return null;
  }

  if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
    return null;
  }

  return { latitude, longitude };
}

async function resolveTimezoneFromCoordinates(latitude: number, longitude: number): Promise<{ timezone?: string; timezoneOffsetMinutes: number }> {
  try {
    const url = new URL(TIMEZONE_URL);
    url.searchParams.set("latitude", String(latitude));
    url.searchParams.set("longitude", String(longitude));

    const response = await fetchWithRetry(url.toString(), {
      method: "GET",
      cache: "no-store",
      headers: { Accept: "application/json" },
    });

    if (response.ok) {
      const payload = (await response.json()) as TimeApiResponse;
      const offsetSeconds = payload.currentUtcOffset?.seconds;
      if (typeof offsetSeconds === "number" && Number.isFinite(offsetSeconds)) {
        return {
          timezone: payload.timeZone,
          timezoneOffsetMinutes: Math.round(offsetSeconds / 60),
        };
      }
    }
  } catch {
    // fallback below
  }

  // Bugfix (h): resilient fallback when timezone services are unavailable.
  const estimatedMinutes = Math.round(longitude / 15) * 60;
  const clamped = Math.max(-12 * 60, Math.min(14 * 60, estimatedMinutes));
  return { timezoneOffsetMinutes: clamped };
}

export async function resolveBirthLocation(input: {
  city?: string;
  latitude?: number;
  longitude?: number;
}): Promise<BirthLocation> {
  if (typeof input.latitude === "number" && typeof input.longitude === "number") {
    const manual = parseCoordinates(input.latitude, input.longitude);
    if (!manual) {
      throw new Error("Invalid manual coordinates");
    }

    const timezone = await resolveTimezoneFromCoordinates(manual.latitude, manual.longitude);
    return {
      ...manual,
      timezone: timezone.timezone,
      timezoneOffsetMinutes: timezone.timezoneOffsetMinutes,
    };
  }

  const city = normalizeCity(input.city ?? "");
  if (!city) {
    throw new Error("Missing city and coordinates");
  }

  const fallbackQueries = [city, `${city}, India`, `${city}, Asia`];

  for (const query of fallbackQueries) {
    let candidates: NominatimPlace[] = [];
    try {
      candidates = await fetchLocationCandidates(query);
    } catch {
      continue;
    }

    const sorted = candidates.sort((a, b) => (b.importance ?? 0) - (a.importance ?? 0));

    for (const candidate of sorted) {
      const latitude = Number.parseFloat(candidate.lat);
      const longitude = Number.parseFloat(candidate.lon);
      const coordinates = parseCoordinates(latitude, longitude);
      if (!coordinates) {
        continue;
      }

      const timezone = await resolveTimezoneFromCoordinates(coordinates.latitude, coordinates.longitude);
      return {
        ...coordinates,
        timezone: timezone.timezone,
        timezoneOffsetMinutes: timezone.timezoneOffsetMinutes,
      };
    }
  }

  throw new Error("Unable to resolve birth location for the provided city");
}
