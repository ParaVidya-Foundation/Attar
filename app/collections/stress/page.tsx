import type { Metadata } from "next";
import ProductCard from "@/components/shop/ProductCard";
import { getProductsByCategorySlug } from "@/lib/fetchers";
import { mapToCardProduct } from "@/lib/productMapper";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Stress Relief Attars",
  description: "Therapeutic attars designed for relaxation, calm mind, and emotional balance.",
};

export default async function StressPerfumePage() {
  const products = await getProductsByCategorySlug("stress-perfume");
  const mappedProducts = products.map(mapToCardProduct);

  return (
    <main className="w-full bg-white">
      <section className="mx-auto max-w-[1400px] px-6 sm:px-8 md:px-12 lg:px-16 py-14">
        <header className="mb-10 text-center">
          <h1 className="font-serif text-3xl sm:text-4xl text-[#1e2023]">Stress Relief Attars</h1>
          <div className="mx-auto mt-4 h-[2px] w-16 bg-[#d4b07a]" />
          <p className="mx-auto mt-4 max-w-2xl text-sm sm:text-base leading-7 text-gray-600">
            Therapeutic attars designed for relaxation, calm mind, and emotional balance.
          </p>
        </header>

        <div className="grid gap-y-14 gap-x-8 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
          {mappedProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </main>
  );
}
