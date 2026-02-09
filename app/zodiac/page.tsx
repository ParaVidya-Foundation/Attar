import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { Container } from "@/components/ui/Container";

export const metadata: Metadata = pageMetadata({
  title: "Zodiac",
  description: "A gentle zodiac fragrance guide: choose note families with intention and elemental rhythm.",
  path: "/zodiac",
  type: "website",
});

export default function ZodiacPage() {
  return (
    <Container className="py-12 sm:py-16">
      <p className="text-xs font-semibold tracking-[0.26em] text-charcoal/70">ZODIAC</p>
      <h1 className="mt-4 font-serif text-4xl tracking-tight text-ink sm:text-5xl">Zodiac fragrances</h1>
      <p className="mt-4 max-w-2xl text-sm leading-7 text-charcoal/85 sm:text-base">
        Not rules—rhythm. Use elemental cues to choose florals, woods, and resins that support your season.
      </p>

      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[
          { k: "Fire", v: "Spice, amber, radiant florals." },
          { k: "Earth", v: "Woods, vetiver, resins, structure." },
          { k: "Air", v: "Green notes, clean musk, clarity." },
          { k: "Water", v: "Soft florals, incense, skin musks." },
        ].map((x) => (
          <div key={x.k} className="rounded-3xl border border-ash/50 bg-white/55 p-6">
            <p className="font-serif text-xl text-ink">{x.k}</p>
            <p className="mt-2 text-sm leading-7 text-charcoal/85">{x.v}</p>
          </div>
        ))}
      </div>
    </Container>
  );
}
