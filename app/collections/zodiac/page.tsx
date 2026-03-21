import type { Metadata } from "next";
import Link from "next/link";
import { pageMetadata } from "@/lib/seo";
import PerfumeZodiac from "@/components/Zodiac/PerfumeZodiac";
import ProductCard from "@/components/shop/ProductCard";
import { getProductsByCategory } from "@/lib/api/products";
import { COLLECTION_SLUGS } from "@/lib/constants/collections";
import { mapToCardProduct } from "@/lib/productMapper";
import ComingSoon from "@/components/comingsoon";

export const revalidate = 60;

export const metadata: Metadata = pageMetadata({
  title: "Zodiac",
  description: "A gentle zodiac fragrance guide: choose note families with intention and elemental rhythm.",
  path: "/collections/zodiac",
  type: "website",
});

export default async function ZodiacPage() {
  let products: Awaited<ReturnType<typeof getProductsByCategory>> = [];
  try {
    products = await getProductsByCategory(COLLECTION_SLUGS.zodiac);
  } catch {
    products = [];
  }
  const mappedProducts = products.map(mapToCardProduct);

  return (
    <main className="w-full bg-white">
      <ComingSoon />
      {/*      
      <PerfumeZodiac />
      <section className="mx-auto max-w-6xl px-6 py-16 sm:py-20">
        <header className="text-center">
          <h2 className="font-heading text-2xl sm:text-3xl md:text-4xl text-[#1e2023]">
            Find Your Signature Zodiac Scent
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-sm sm:text-base leading-7 text-gray-600">
            From fiery confidence to calm earth tones, each fragrance reflects the emotional rhythm and
            natural strength of your sign. Explore the collection and choose a scent that feels uniquely
            yours.
          </p>
        </header>
      </section>


      <section className="mx-auto max-w-[1400px] px-6 sm:px-8 md:px-12 lg:px-16 py-14">
        <div className="grid gap-y-14 gap-x-8 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
          {mappedProducts.length === 0 ? (
            <p className="col-span-full text-center text-black/60 py-12">No products available.</p>
          ) : (
            mappedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))
          )}
        </div>
      </section>

     
      <section className="mx-auto max-w-3xl px-6 py-16">
        <h2 className="font-heading text-2xl text-center text-[#1e2023]">About Zodiac Attars</h2>
        <div className="mx-auto mt-4 h-[2px] w-12 bg-[#d4b07a]" />
        <p className="mt-6 text-sm sm:text-base leading-7 text-gray-600 text-center">
          Our zodiac perfumes are crafted to match the elemental energy of each astrological sign. From the fiery confidence of Aries to the dreamy intuition of Pisces, each zodiac attar translates cosmic symbolism into wearable, skin-close fragrance. Whether you follow Western astrology or Vedic jyotish, these alcohol-free perfume oils offer a deeply personal way to connect with your celestial identity.
        </p>
      </section>

    
      <section className="mx-auto max-w-3xl px-6 pb-16">
        <h2 className="font-heading text-2xl text-center text-[#1e2023]">Frequently Asked Questions</h2>
        <div className="mx-auto mt-4 h-[2px] w-12 bg-[#d4b07a]" />
        <div className="mt-8 space-y-3">
          <details className="group border border-neutral-200 bg-white p-5">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-left text-sm font-medium text-neutral-800">
              <span>What is a zodiac perfume?</span>
              <svg className="h-4 w-4 shrink-0 transition-transform duration-200 group-open:rotate-180" viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M5 8l5 5 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </summary>
            <p className="mt-3 text-sm text-neutral-600 leading-relaxed">A zodiac perfume is a fragrance formulated to reflect the personality, elemental energy, and emotional qualities of a specific zodiac sign. For example, an Aries perfume features bold, fiery notes, while a Cancer perfume leans toward soft, nurturing florals.</p>
          </details>
          <details className="group border border-neutral-200 bg-white p-5">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-left text-sm font-medium text-neutral-800">
              <span>Which zodiac perfume should I wear?</span>
              <svg className="h-4 w-4 shrink-0 transition-transform duration-200 group-open:rotate-180" viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M5 8l5 5 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </summary>
            <p className="mt-3 text-sm text-neutral-600 leading-relaxed">Choose the attar that matches your Sun sign for daily confidence, or your Moon sign for emotional comfort. Our Astro Fragrance Finder can recommend the ideal scent based on your birth chart.</p>
          </details>
          <details className="group border border-neutral-200 bg-white p-5">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-left text-sm font-medium text-neutral-800">
              <span>Are zodiac perfumes suitable for both men and women?</span>
              <svg className="h-4 w-4 shrink-0 transition-transform duration-200 group-open:rotate-180" viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M5 8l5 5 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </summary>
            <p className="mt-3 text-sm text-neutral-600 leading-relaxed">Yes. Our zodiac attars are unisex. Natural attar oils adapt to your body chemistry, creating a unique scent experience regardless of gender.</p>
          </details>
        </div>
      </section>

    
      <nav className="mx-auto max-w-3xl px-6 pb-16 flex flex-wrap justify-center gap-3" aria-label="Related pages">
        <Link href="/find-fragrance" className="border border-neutral-300 px-5 py-2.5 text-sm text-neutral-700 transition-colors hover:border-black hover:text-black">Find Your Zodiac Fragrance</Link>
        <Link href="/collections/planets" className="border border-neutral-300 px-5 py-2.5 text-sm text-neutral-700 transition-colors hover:border-black hover:text-black">Planet Attars</Link>
        <Link href="/collections/nakshatra" className="border border-neutral-300 px-5 py-2.5 text-sm text-neutral-700 transition-colors hover:border-black hover:text-black">Nakshatra Attars</Link>
        <Link href="/shop" className="border border-neutral-300 px-5 py-2.5 text-sm text-neutral-700 transition-colors hover:border-black hover:text-black">Shop All</Link>
      </nav> */}
    </main>
  );
}
