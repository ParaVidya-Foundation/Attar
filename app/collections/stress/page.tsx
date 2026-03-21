import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import ProductCard from "@/components/shop/ProductCard";
import { getProductsByCategory } from "@/lib/api/products";
import { COLLECTION_SLUGS } from "@/lib/constants/collections";
import { mapToCardProduct } from "@/lib/productMapper";
import HowToUse from "@/components/stress/howtouse";
import ComingSoon from "@/components/comingsoon";

export const revalidate = 60;

export const metadata: Metadata = pageMetadata({
  title: "Stress Relief Attars — Calming Fragrance Oils for Anxiety & Peace",
  description:
    "Natural stress relief attars crafted for calm, anxiety relief & mental peace. Alcohol-free calming perfume oils with lavender, sandalwood & vetiver — Anand Rasa.",
  path: "/collections/stress",
  type: "website",
  keywords: [
    "stress relief attar",
    "calming fragrance",
    "anxiety relief perfume",
    "peace fragrance",
    "calming oil",
  ],
});

export default async function StressPerfumePage() {
  let products: Awaited<ReturnType<typeof getProductsByCategory>> = [];
  try {
    products = await getProductsByCategory(COLLECTION_SLUGS.stress);
  } catch {
    products = [];
  }
  const mappedProducts = products.map(mapToCardProduct);

  return (
    <main className="w-full bg-white">
      <ComingSoon />
      {/* <section className="mx-auto max-w-[1400px] px-6 sm:px-8 md:px-12 lg:px-16 py-14">
        <header className="mb-10 text-center">
          <h1 className="font-heading text-3xl sm:text-4xl text-[#1e2023]">Stress Relief Attars</h1>
          <div className="mx-auto mt-4 h-[2px] w-16 bg-[#d4b07a]" />
          <p className="mx-auto mt-4 max-w-2xl text-sm sm:text-base leading-7 text-gray-600">
            Therapeutic attars designed for relaxation, calm mind, and emotional balance.
          </p>
        </header>

        <div className="grid gap-y-14 gap-x-8 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
          {mappedProducts.length === 0 ? (
            <p className="col-span-full text-center text-black/60 py-12">No products available.</p>
          ) : (
            mappedProducts.map((product) => <ProductCard key={product.id} product={product} />)
          )}
        </div>
      </section>
      <HowToUse /> */}
    </main>
  );
}
