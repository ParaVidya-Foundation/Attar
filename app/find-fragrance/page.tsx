import type { Metadata } from "next";

import FindFragranceExperience from "@/components/find-fragrance/FindFragranceExperience";

export const metadata: Metadata = {
  title: "Astro Fragrance Finder | Astrology Perfume & Birth Chart Fragrance Discovery",
  description:
    "Discover your astrology perfume through a luxury Vedic consultation. Explore zodiac fragrance, birth chart perfume, and nakshatra perfume recommendations aligned with your Sun, Moon, and Venus energies.",
  keywords: [
    "astrology perfume",
    "zodiac fragrance",
    "birth chart perfume",
    "nakshatra perfume",
    "vedic astrology perfume",
  ],
};

export default function FindFragrancePage() {
  return <FindFragranceExperience />;
}
