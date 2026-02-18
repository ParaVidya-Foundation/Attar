import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import PerfumeZodiac from "@/components/Zodiac/PerfumeZodiac";
import PerfumeZodiacGrid from "@/components/Zodiac/PerfumeZodiacGrid";

export const metadata: Metadata = pageMetadata({
  title: "Zodiac",
  description: "A gentle zodiac fragrance guide: choose note families with intention and elemental rhythm.",
  path: "/collections/zodiac",
  type: "website",
});

export default function ZodiacPage() {
  return (
    <main className="w-full bg-white">
      {/* Zodiac Selector / Interactive Section */}
      <PerfumeZodiac />

      {/* Editorial Section */}
      <section className="mx-auto max-w-6xl px-6 py-16 sm:py-20">
        <header className="text-center">
          <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl text-[#1e2023]">
            Find Your Signature Zodiac Scent
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-sm sm:text-base leading-7 text-gray-600">
            From fiery confidence to calm earth tones, each fragrance reflects the emotional rhythm and
            natural strength of your sign. Explore the collection and choose a scent that feels uniquely
            yours.
          </p>
        </header>
      </section>

      {/* Product Grid */}
      <PerfumeZodiacGrid />
    </main>
  );
}
