import type { Metadata } from "next";
import { Suspense } from "react";
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

/** Required: AstroForm uses useSearchParams — must be under Suspense for static generation / build. */
function FindFragranceFallback() {
  return (
    <main className="min-h-screen bg-white">
      <div className="border-b border-neutral-200 py-20">
        <div className="mx-auto max-w-6xl px-6 text-center">
          <p className="text-sm font-medium uppercase tracking-[0.14em] text-neutral-400">Loading…</p>
        </div>
      </div>
    </main>
  );
}

export default function FindFragrancePage() {
  return (
    <Suspense fallback={<FindFragranceFallback />}>
      <FindFragranceExperience />
    </Suspense>
  );
}
