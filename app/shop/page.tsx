import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { pageMetadata } from "@/lib/seo";
import { getAttars } from "@/lib/fetchers";
import { Container } from "@/components/ui/Container";

export const revalidate = 3600;

export const metadata: Metadata = pageMetadata({
  title: "Shop",
  description:
    "Shop luxury attars: alcohol-free perfume oils crafted with heritage discipline. Minimal cards, clear notes, and calm longevity.",
  path: "/shop",
  type: "website",
});

export default async function ShopPage() {
  const attars = await getAttars();
  return (
    <Container className="py-12 sm:py-16">
      <header className="max-w-2xl">
        <p className="text-xs font-semibold tracking-[0.26em] text-charcoal/70">SHOP</p>
        <h1 className="mt-4 font-serif text-4xl tracking-tight text-ink sm:text-5xl">Attars</h1>
        <p className="mt-4 text-sm leading-7 text-charcoal/85 sm:text-base">
          Heritage perfume oils, designed for calm projection and modern restraint.
        </p>
      </header>

      <section className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-label="Attar grid">
        {attars.map((a) => (
          <Link
            key={a.id}
            href={`/product/${a.slug}`}
            className="group rounded-3xl border border-ash/50 bg-white/55 p-5 transition hover:-translate-y-1 hover:shadow-card"
          >
            <div className="relative aspect-[4/3] overflow-hidden rounded-3xl bg-white">
              <Image
                src={a.images[0]?.url ?? ""}
                alt={a.images[0]?.alt ?? a.name}
                fill
                className="object-cover transition duration-300 group-hover:scale-[1.02]"
                sizes="(min-width: 1024px) 320px, (min-width: 640px) 45vw, 92vw"
                loading="lazy"
              />
            </div>
            <div className="mt-5">
              <p className="font-serif text-xl text-ink">{a.name}</p>
              <p className="mt-2 text-sm text-charcoal/85">{a.origin}</p>
              <p className="mt-3 text-xs font-semibold tracking-[0.22em] text-charcoal/70">
                FROM ₹{a.price} • {a.longevity}
              </p>
            </div>
          </Link>
        ))}
      </section>
    </Container>
  );
}
