import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ProductCard, { type Product as CardProduct } from "@/components/shop/ProductCard";
import { getCategories } from "@/lib/fetchers";
import { getProductsByCategory } from "@/lib/api/products";
import { mapToCardProduct } from "@/lib/productMapper";

export const revalidate = 60;

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const categories = await getCategories();
  const category = categories.find((item) => item.slug === slug);

  if (!category) {
    return {
      title: "Category",
      description: "Browse category products.",
    };
  }

  return {
    title: category.name,
    description: `Browse ${category.name} products.`,
  };
}

export default async function CategoryPage({ params }: PageProps) {
  const { slug } = await params;
  const categories = await getCategories();
  const category = categories.find((item) => item.slug === slug);

  if (!category) {
    notFound();
  }

  let products: CardProduct[] = [];
  try {
    products = (await getProductsByCategory(slug)).map(mapToCardProduct);
  } catch {
    products = [];
  }

  return (
    <main className="w-full bg-white">
      <div className="mx-auto max-w-[1400px] px-6 sm:px-8 md:px-12 lg:px-16 py-12 md:py-16">
        <header className="text-center mb-12">
          <h1 className="font-heading text-3xl md:text-4xl text-[#1e2023]">{category.name}</h1>
          <div className="mx-auto mt-4 h-[2px] w-16 bg-[#d4b07a]" />
        </header>

        <section className="grid gap-y-14 gap-x-8 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
          {products.length === 0 ? (
            <p className="col-span-full text-center text-black/60 py-12">No products available.</p>
          ) : (
            products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))
          )}
        </section>
      </div>
    </main>
  );
}
