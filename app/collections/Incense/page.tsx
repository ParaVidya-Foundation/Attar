import type { Metadata } from "next";
import IncenseHero from "@/components/Incense/incenseHero";
import ProductCard, { type Product as CardProduct } from "@/components/shop/ProductCard";
import Image from "next/image";
import BulkOrder from "@/components/Incense/BulkOrder";
import { getProductsByCategory } from "@/lib/api/products";
import { COLLECTION_SLUGS } from "@/lib/constants/collections";
import { mapToCardProduct } from "@/lib/productMapper";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Premium Incense Collection",
  description:
    "Sacred incense sticks for rituals, meditation, and daily spiritual use.",
};

export default async function IncensePage() {
  let products: CardProduct[] = [];
  try {
    products = (await getProductsByCategory(COLLECTION_SLUGS.incense)).map(mapToCardProduct);
  } catch {
    products = [];
  }

  return (
    <main className="w-full bg-white">
      {/* HERO */}
      <IncenseHero />

      {/* BEST SELLERS */}
      <section
        aria-labelledby="best-sellers"
        className="mx-auto max-w-[1400px] px-6 sm:px-8 md:px-12 lg:px-16 py-14 md:py-16"
      >
        <header className="mb-10 text-center">
          <h2 id="best-sellers" className="font-heading text-3xl sm:text-4xl text-[#1e2023]">
            Best Sellers
          </h2>
        </header>

        <div
          className="
            grid
            gap-y-14 gap-x-8
            grid-cols-1
            sm:grid-cols-2
            md:grid-cols-3
            xl:grid-cols-4
          "
        >
          {products.length === 0 ? (
            <p className="col-span-full text-center text-black/60 py-12">No products available.</p>
          ) : (
            products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))
          )}
        </div>
      </section>

      {/* EDITORIAL IMAGE BANNER */}
      <section aria-label="Incense collection showcase" className="relative w-full">
        <div className="relative w-full aspect-[16/9] sm:aspect-[21/9]">
          <Image
            src="/incense.jpg"
            alt="Premium luxury incense collection in minimal studio lighting"
            fill
            priority
            sizes="100vw"
            className="object-cover"
            quality={90}
          />
        </div>
      </section>

      {/* PREMIUM COLLECTION */}
      <section
        aria-labelledby="premium-incense"
        className="mx-auto max-w-[1400px] px-6 sm:px-8 md:px-12 lg:px-16 py-14 md:py-16"
      >
        <header className="mb-10 text-center">
          <h2 id="premium-incense" className="font-heading text-3xl sm:text-4xl text-[#1e2023]">
            Premium Incense
          </h2>
        </header>

        <div
          className="
            grid
            gap-y-14 gap-x-8
            grid-cols-1
            sm:grid-cols-2
            md:grid-cols-3
            xl:grid-cols-4
          "
        >
          {products.length === 0 ? (
            <p className="col-span-full text-center text-black/60 py-12">No products available.</p>
          ) : (
            products.map((product) => (
              <ProductCard key={`premium-${product.id}`} product={product} />
            ))
          )}
        </div>
      </section>

      {/* BULK ORDER (B2B SEO block) */}
      <section aria-label="Bulk incense orders">
        <BulkOrder />
      </section>
    </main>
  );
}
