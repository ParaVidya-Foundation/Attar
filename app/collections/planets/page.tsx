import type { Metadata } from "next";
import Image from "next/image";
import ProductCard from "@/components/shop/ProductCard";
import { getProductsByCategorySlug } from "@/lib/fetchers";
import { mapToCardProduct } from "@/lib/productMapper";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Planet Attars",
  description: "Navagraha Planet Attars collection",
};

export default async function PlanetsPage() {
  const products = await getProductsByCategorySlug("planets");
  const mappedProducts = products.map(mapToCardProduct);

  return (
    <section>
      {/* Hero */}
      <div className="relative w-full aspect-[16/9]">
        <Image
          src="/planets-hero.webp"
          alt="Planet Attars"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
      </div>

      {/* Grid */}
      <section className="mx-auto max-w-[1400px] px-6 sm:px-8 md:px-12 lg:px-16 py-14">
        <header className="mb-10 text-center">
          <h2 className="font-serif text-3xl sm:text-4xl text-[#1e2023]">Planet Attars</h2>
        </header>

        <div className="grid gap-y-14 gap-x-8 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
          {mappedProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </section>
  );
}
