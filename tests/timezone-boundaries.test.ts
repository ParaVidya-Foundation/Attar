import { describe, expect, it } from "vitest";

import { toUtcDateParts } from "@/lib/astrology/julianDay";

describe("Timezone and date boundaries", () => {
  it("handles leap day conversion", () => {
    const utc = toUtcDateParts("2024-02-29", "23:30", 330);
    expect(utc.year).toBe(2024);
    expect(utc.month).toBe(2);
    expect(utc.day).toBe(29);
  });

  it("handles timezone rollover to previous UTC date", () => {
    const utc = toUtcDateParts("2024-01-01", "00:15", 600);
    expect(utc.year).toBe(2023);
    expect(utc.month).toBe(12);
    expect(utc.day).toBe(31);
  });
});
