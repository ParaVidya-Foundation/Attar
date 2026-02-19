import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import PerfumeZodiac from "@/components/Zodiac/PerfumeZodiac";
import ProductCard from "@/components/shop/ProductCard";
import { getProductsByCategorySlug } from "@/lib/fetchers";
import { mapToCardProduct } from "@/lib/productMapper";

export const revalidate = 3600;

export const metadata: Metadata = pageMetadata({
  title: "Zodiac",
  description: "A gentle zodiac fragrance guide: choose note families with intention and elemental rhythm.",
  path: "/collections/zodiac",
  type: "website",
});

export default async function ZodiacPage() {
  const products = await getProductsByCategorySlug("zodiac");
  const mappedProducts = products.map(mapToCardProduct);

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
      <section className="mx-auto max-w-[1400px] px-6 sm:px-8 md:px-12 lg:px-16 py-14">
        <div className="grid gap-y-14 gap-x-8 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
          {mappedProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </main>
  );
}
