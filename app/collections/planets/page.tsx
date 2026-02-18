import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { Container } from "@/components/ui/Container";

export const metadata: Metadata = pageMetadata({
  title: "Planets",
  description:
    "Navagraha-inspired fragrance mood cues: Venus for grace, Saturn for discipline, Moon for calm mind.",
  path: "/planets",
  type: "website",
});

export default function PlanetsPage() {
  return (
    <Container className="py-12 sm:py-16">
      <p className="text-xs font-semibold tracking-[0.26em] text-charcoal/70">PLANETS</p>
      <h1 className="mt-4 font-serif text-4xl tracking-tight text-ink sm:text-5xl">Navagraha cues</h1>
      <p className="mt-4 max-w-2xl text-sm leading-7 text-charcoal/85 sm:text-base">
        A minimalist interpretation of planetary moods—choose notes that support how you want to show up.
      </p>

      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[
          { k: "Venus", v: "Grace, harmony: rose, soft amber, refined florals." },
          { k: "Saturn", v: "Discipline, structure: vetiver, woods, dry resins." },
          { k: "Moon", v: "Calm mind: jasmine, powder, clean musk." },
          { k: "Sun", v: "Vitality: saffron warmth, golden woods." },
          { k: "Mercury", v: "Clarity: green notes, fresh woods." },
          { k: "Ketu", v: "Meditation: incense, frankincense, sandalwood." },
        ].map((x) => (
          <div key={x.k} className="rounded-3xl border border-ash/50 bg-white/55 p-6">
            <p className="font-serif text-xl text-ink" id={x.k}>
              {x.k}
            </p>
            <p className="mt-2 text-sm leading-7 text-charcoal/85">{x.v}</p>
          </div>
        ))}
      </div>
    </Container>
  );
}
