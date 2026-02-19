import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ProductCard from "@/components/shop/ProductCard";
import { getCategories, getProductsByCategorySlug } from "@/lib/fetchers";
import { mapToCardProduct } from "@/lib/productMapper";

export const revalidate = 3600;

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

  const products = (await getProductsByCategorySlug(slug)).map(mapToCardProduct);

  return (
    <main className="w-full bg-white">
      <div className="mx-auto max-w-[1400px] px-6 sm:px-8 md:px-12 lg:px-16 py-12 md:py-16">
        <header className="text-center mb-12">
          <h1 className="font-serif text-3xl md:text-4xl text-[#1e2023]">{category.name}</h1>
          <div className="mx-auto mt-4 h-[2px] w-16 bg-[#d4b07a]" />
        </header>

        <section className="grid gap-y-14 gap-x-8 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </section>
      </div>
    </main>
  );
}
