import type { Metadata } from "next";
import { pageMetadata, itemListJsonLd } from "@/lib/seo";
import ProductCard, { type Product as CardProduct } from "@/components/shop/ProductCard";
import { getProductsByCategory } from "@/lib/api/products";
import { COLLECTION_SLUGS } from "@/lib/constants/collections";
import { mapToCardProduct } from "@/lib/productMapper";

export const revalidate = 60;

export const metadata: Metadata = pageMetadata({
  title: "Nakshatra Attar Collection",
  description:
    "Twenty-seven Nakshatra attars crafted to mirror the mood and energy of each Vedic lunar mansion. A calm, luxurious spiritual perfume experience.",
  path: "/collections/nakshatra",
  type: "website",
});

export default async function NakshatraAttarCollectionPage() {
  let products: CardProduct[] = [];
  try {
    products = (await getProductsByCategory(COLLECTION_SLUGS.nakshatraAttar)).map(mapToCardProduct);
  } catch {
    products = [];
  }

  const itemList = itemListJsonLd(
    products.map((product) => ({
      name: product.title,
      path: `/product/${product.slug}`,
    })),
  );

  return (
    <main className="min-h-screen bg-[#F6F1E7]">
      <section className="border-b border-black/5">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-neutral-600">
            Lunar attar alignment
          </p>
          <h1 className="mt-4 font-heading text-3xl sm:text-4xl md:text-5xl text-neutral-900">
            Nakshatra Attar Collection
          </h1>
          <p className="mt-4 max-w-2xl text-sm sm:text-base text-neutral-700 leading-relaxed">
            A modern ritual of scent inspired by the 27 Vedic nakshatras. Each attar is composed as a quiet,
            skin-close aura that echoes the symbolism, deity, and elemental nature of your birth star.
          </p>
        </div>
      </section>

      <section className="py-10 sm:py-14 lg:py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <header className="mb-8 flex items-baseline justify-between gap-4">
            <h2 className="font-heading text-xl sm:text-2xl text-neutral-900">All Nakshatra Attars</h2>
            <p className="text-xs tracking-[0.16em] uppercase text-neutral-600">
              {products.length ? `${products.length} fragrances` : "No fragrances available"}
            </p>
          </header>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.length === 0 ? (
              <p className="col-span-full py-10 text-center text-sm text-neutral-600">
                No Nakshatra attars are available at the moment. Please check back soon.
              </p>
            ) : (
              products.map((product) => <ProductCard key={product.id} product={product} />)
            )}
          </div>
        </div>
      </section>

      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemList) }}
      />
    </main>
  );
}
