import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/rate-limit", () => ({
  getClientIdentifier: () => "test-ip",
  rateLimit: async () => ({ allowed: true, remaining: 10, resetAt: Date.now() + 60000 }),
}));

vi.mock("@/lib/redis", () => ({
  cacheGet: async () => null,
  cacheSet: async () => undefined,
}));

vi.mock("@/lib/geography/resolveBirthLocation", () => ({
  resolveBirthLocation: async () => ({ latitude: 19.076, longitude: 72.8777, timezoneOffsetMinutes: 330 }),
}));

vi.mock("@/lib/astrology/calculateAstrology", () => ({
  calculateAstrology: async () => ({
    sunSign: "Aquarius",
    moonSign: "Aquarius",
    nakshatra: "Dhanishta",
    nakshatraPada: 2,
    planets: {
      sun: 305,
      moon: 307,
    },
  }),
}));

vi.mock("@/lib/astrology/recommendations", () => ({
  buildAstroApiResponse: async () => ({
    sunSign: "Aquarius",
    moonSign: "Aquarius",
    nakshatra: "Dhanishta",
    nakshatraPada: 2,
    planets: {
      sun: 305,
      moon: 307,
    },
    recommendedProducts: [],
    recommendationReasons: [],
  }),
}));

import { POST } from "@/app/api/astrology/route";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("Astrology API", () => {
  it("returns required response fields", async () => {
    const req = new Request("http://localhost/api/astrology", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Test",
        email: "test@example.com",
        dob: "2002-08-12",
        time: "14:30",
        city: "Mumbai",
        gender: "male",
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.sunSign).toBeDefined();
    expect(data.moonSign).toBeDefined();
    expect(data.nakshatra).toBeDefined();
    expect(data.nakshatraPada).toBeDefined();
    expect(data.planets).toBeDefined();
    expect(data.recommendedProducts).toBeDefined();
    expect(data.recommendationReasons).toBeDefined();
  });

  it("returns 400 on missing city and missing manual coordinates", async () => {
    const req = new Request("http://localhost/api/astrology", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Test",
        email: "test@example.com",
        dob: "2002-08-12",
        time: "14:30",
        city: "",
        gender: "male",
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
  });
});
