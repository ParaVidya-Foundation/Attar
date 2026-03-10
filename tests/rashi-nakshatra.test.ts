import { describe, expect, it } from "vitest";

import { getRashiFromLongitude, RASHIS } from "@/lib/astrology/rashi";
import { getNakshatraFromLongitude, getNakshatraPadaFromLongitude } from "@/lib/astrology/nakshatra";

describe("Rashi mapping", () => {
  it("uses canonical ordered rashi array", () => {
    expect(RASHIS).toEqual([
      "Aries",
      "Taurus",
      "Gemini",
      "Cancer",
      "Leo",
      "Virgo",
      "Libra",
      "Scorpio",
      "Sagittarius",
      "Capricorn",
      "Aquarius",
      "Pisces",
    ]);
  });

  it("handles boundaries and normalization safely", () => {
    expect(getRashiFromLongitude(0)).toBe("Aries");
    expect(getRashiFromLongitude(29.9999)).toBe("Aries");
    expect(getRashiFromLongitude(30)).toBe("Taurus");
    expect(getRashiFromLongitude(300)).toBe("Aquarius");
    expect(getRashiFromLongitude(-1)).toBe("Pisces");
    expect(getRashiFromLongitude(361)).toBe("Aries");
  });

  it("calculates Sun sign index using floor(longitude / 30)", () => {
    const sunLongitude = 45.2; // Taurus span
    expect(getRashiFromLongitude(sunLongitude)).toBe("Taurus");
  });

  it("calculates Moon sign index using floor(longitude / 30)", () => {
    const moonLongitude = 301.1; // Aquarius span
    expect(getRashiFromLongitude(moonLongitude)).toBe("Aquarius");
  });
});

describe("Nakshatra and pada mapping", () => {
  it("maps sample longitudes correctly", () => {
    expect(getNakshatraFromLongitude(0)).toBe("Ashwini");
    expect(getNakshatraPadaFromLongitude(0)).toBe(1);

    // Dhanishta spans 293.333... to 306.666...
    expect(getNakshatraFromLongitude(304)).toBe("Dhanishta");
    expect(getNakshatraPadaFromLongitude(304)).toBe(4);
  });

  it("handles exact boundary with next-segment tie-break", () => {
    const boundary = 360 / 27;
    expect(getNakshatraFromLongitude(boundary)).toBe("Bharani");
  });
});
