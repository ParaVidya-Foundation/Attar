import type { Metadata } from "next";
import FindFragranceExperience from "@/components/find-fragrance/FindFragranceExperience";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = {
  ...pageMetadata({
    title: "Astro Fragrance Finder — Zodiac Perfume & Birth Chart Discovery",
    description:
      "Discover your astrology perfume through a luxury Vedic consultation. Explore zodiac fragrance, birth chart perfume, and nakshatra perfume recommendations aligned with your Sun, Moon, and Venus energies.",
    path: "/find-fragrance",
    type: "website",
    keywords: [
      "astrology perfume",
      "zodiac fragrance",
      "birth chart perfume",
      "nakshatra perfume",
      "vedic astrology perfume",
      "zodiac perfume finder",
    ],
  }),
};

export default function FindFragrancePage() {
  return <FindFragranceExperience />;
}
