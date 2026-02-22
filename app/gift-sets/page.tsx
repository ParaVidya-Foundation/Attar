import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import ProductCard from "@/components/shop/ProductCard";
import { getProductsByCategory } from "@/lib/api/products";
import { COLLECTION_SLUGS } from "@/lib/constants/collections";
import { mapToCardProduct } from "@/lib/productMapper";

export const revalidate = 60;

export const metadata: Metadata = pageMetadata({
  title: "Gift Sets",
  description: "Gift sets of our best-selling products",
  path: "/gift-sets",
  type: "website",
});

export default async function GiftSetsPage() {
  let products: Awaited<ReturnType<typeof getProductsByCategory>> = [];
  try {
    products = await getProductsByCategory(COLLECTION_SLUGS.gifts);
  } catch {
    products = [];
  }
  const mappedProducts = products.map(mapToCardProduct);

  return (
    <main className="w-full bg-white">
      <section className="mx-auto max-w-[1400px] px-6 sm:px-8 md:px-12 lg:px-16 py-14">
        <header className="mb-10 text-center">
          <h1 className="font-heading text-3xl sm:text-4xl text-[#1e2023]">Gift Sets</h1>
          <div className="mx-auto mt-4 h-[2px] w-16 bg-[#d4b07a]" />
          <p className="mx-auto mt-4 max-w-2xl text-sm sm:text-base leading-7 text-gray-600">
            Curated gift sets of our best-selling attars and fragrances.
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
    </main>
  );
}
