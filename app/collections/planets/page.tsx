import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import ProductCard from "@/components/shop/ProductCard";
import { getProductsByCategory } from "@/lib/api/products";
import { COLLECTION_SLUGS } from "@/lib/constants/collections";
import { mapToCardProduct } from "@/lib/productMapper";
import PlanetHero from "@/components/Planets/PlanetHero";
import { pageMetadata, breadcrumbJsonLd } from "@/lib/seo";

export const revalidate = 60;

export const metadata: Metadata = pageMetadata({
  title: "Navagraha Planet Attars — Astrology Perfume Oils",
  description:
    "Discover 9 Navagraha planet attars crafted for Vedic astrology rituals. Sun, Moon, Mars, Mercury, Jupiter, Venus, Saturn, Rahu & Ketu perfume oils — handcrafted in India.",
  path: "/collections/planets",
  type: "website",
  keywords: ["planet attar", "navagraha perfume", "astrology fragrance", "Vedic perfume oil", "planet perfume"],
});

export default async function PlanetsPage() {
  let products: Awaited<ReturnType<typeof getProductsByCategory>> = [];
  try {
    products = await getProductsByCategory(COLLECTION_SLUGS.planets);
  } catch {
    products = [];
  }
  const mappedProducts = products.map(mapToCardProduct);

  return (
    <section className="w-full bg-white">
      <PlanetHero />
      {/* Grid */}
      <section className="mx-auto max-w-[1400px] px-6 sm:px-8 md:px-12 lg:px-16 py-14">
        <header className="mb-10 text-center">
          <h2 className="font-heading text-3xl sm:text-4xl text-[#1e2023]">Planet Attars</h2>
        </header>

        <div className="grid gap-y-14 gap-x-8 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
          {mappedProducts.length === 0 ? (
            <p className="col-span-full text-center text-black/60 py-12">No products available.</p>
          ) : (
            mappedProducts.map((product) => <ProductCard key={product.id} product={product} />)
          )}
        </div>
      </section>

      {/* SEO Editorial Content */}
      <section className="mx-auto max-w-3xl px-6 py-16">
        <h2 className="font-heading text-2xl text-center text-[#1e2023]">About Navagraha Planet Attars</h2>
        <div className="mx-auto mt-4 h-[2px] w-12 bg-[#d4b07a]" />
        <p className="mt-6 text-sm sm:text-base leading-7 text-gray-600 text-center">
          In Vedic astrology, the Navagraha—the nine celestial bodies including the Sun, Moon, Mars, Mercury, Jupiter, Venus, Saturn, Rahu, and Ketu—shape karma, timing, and temperament. Our planet attars translate each graha into a concentrated, alcohol-free perfume oil you can wear with intention. Whether you honour a weekday deity, balance a planetary dasha, or simply love the symbolism of Jyotish, these handcrafted oils offer a fragrant bridge between ritual and everyday life.
        </p>
      </section>

      {/* FAQ Section */}
      <section className="mx-auto max-w-3xl px-6 pb-16">
        <h2 className="font-heading text-2xl text-center text-[#1e2023]">Frequently Asked Questions</h2>
        <div className="mx-auto mt-4 h-[2px] w-12 bg-[#d4b07a]" />
        <div className="mt-8 space-y-3">
          <details className="group border border-neutral-200 bg-white p-5">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-left text-sm font-medium text-neutral-800">
              <span>What are Navagraha attars?</span>
              <svg className="h-4 w-4 shrink-0 transition-transform duration-200 group-open:rotate-180" viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M5 8l5 5 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </summary>
            <p className="mt-3 text-sm text-neutral-600 leading-relaxed">Navagraha attars are nine planet-inspired fragrance oils aligned with Vedic astrology’s grahas—Sun (Surya), Moon (Chandra), Mars (Mangal), Mercury (Budha), Jupiter (Guru), Venus (Shukra), Saturn (Shani), Rahu, and Ketu. Each attar is composed to echo the symbolic mood and traditional associations of that planet, so you can wear or anoint with a scent that resonates with the graha you wish to honour.</p>
          </details>
          <details className="group border border-neutral-200 bg-white p-5">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-left text-sm font-medium text-neutral-800">
              <span>How do I use planet attars for spiritual practice?</span>
              <svg className="h-4 w-4 shrink-0 transition-transform duration-200 group-open:rotate-180" viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M5 8l5 5 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </summary>
            <p className="mt-3 text-sm text-neutral-600 leading-relaxed">Apply a drop to pulse points—the wrists, throat, or heart—before japa, pooja, or quiet meditation. Many practitioners pair a graha’s attar with that planet’s weekday (for example, Thursday for Jupiter or Saturday for Saturn) to reinforce rhythm and focus. Treat the oil as a mindful anchor: a few breaths with the scent can help settle attention before mantra or silent sitting.</p>
          </details>
          <details className="group border border-neutral-200 bg-white p-5">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-left text-sm font-medium text-neutral-800">
              <span>Can planet attars help with astrological remedies?</span>
              <svg className="h-4 w-4 shrink-0 transition-transform duration-200 group-open:rotate-180" viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M5 8l5 5 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </summary>
            <p className="mt-3 text-sm text-neutral-600 leading-relaxed">Planet attars complement—rather than replace—traditional remedies such as gemstones, mantras, charity, and guidance from a qualified astrologer. Wearing a graha-aligned fragrance can support intention and daily discipline around those practices, but serious remedial measures should always follow personalised Jyotish advice.</p>
          </details>
        </div>
      </section>

      {/* Internal Links */}
      <nav className="mx-auto max-w-3xl px-6 pb-16 flex flex-wrap justify-center gap-3" aria-label="Related pages">
        <Link href="/collections/zodiac" className="border border-neutral-300 px-5 py-2.5 text-sm text-neutral-700 transition-colors hover:border-black hover:text-black">Zodiac Attars</Link>
        <Link href="/find-fragrance" className="border border-neutral-300 px-5 py-2.5 text-sm text-neutral-700 transition-colors hover:border-black hover:text-black">Find Your Fragrance</Link>
        <Link href="/collections/nakshatra" className="border border-neutral-300 px-5 py-2.5 text-sm text-neutral-700 transition-colors hover:border-black hover:text-black">Nakshatra Attars</Link>
        <Link href="/shop" className="border border-neutral-300 px-5 py-2.5 text-sm text-neutral-700 transition-colors hover:border-black hover:text-black">Shop All</Link>
      </nav>
    </section>
  );
}
