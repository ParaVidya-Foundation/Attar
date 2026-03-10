import type { BirthLocation } from "@/lib/types/astrology";

interface NominatimResponseItem {
  lat: string;
  lon: string;
}

const NOMINATIM_URL = "https://nominatim.openstreetmap.org/search";

export async function getCoordinates(city: string): Promise<BirthLocation> {
  const url = new URL(NOMINATIM_URL);
  url.searchParams.set("q", city);
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("limit", "1");

  const response = await fetch(url.toString(), {
    headers: {
      Accept: "application/json",
      "User-Agent": "astrology-app",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Geocoding request failed with status ${response.status}`);
  }

  const data = (await response.json()) as NominatimResponseItem[];
  const first = data[0];

  if (!first) {
    throw new Error("City not found in geocoding service");
  }

  const latitude = Number.parseFloat(first.lat);
  const longitude = Number.parseFloat(first.lon);

  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    throw new Error("Invalid geocoding coordinates");
  }

  return { latitude, longitude };
}
