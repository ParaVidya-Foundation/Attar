import type { Metadata } from "next";
import ProductCard from "@/components/shop/ProductCard";
import { getCategories } from "@/lib/fetchers";
import { getAllProducts, getProductsByCategory } from "@/lib/api/products";
import { mapToCardProduct } from "@/lib/productMapper";
import type { ProductDisplay } from "@/types/product";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Shop",
  description:
    "Shop luxury perfumes crafted with heritage discipline. Minimal design, premium quality, long lasting fragrances.",
};

function sortProducts(products: ProductDisplay[], sort: string): ProductDisplay[] {
  if (sort === "price") {
    return [...products].sort((a, b) => a.price - b.price);
  }
  if (sort === "new" || sort === "rating") {
    return [...products].sort((a, b) => {
      const first = a.created_at ? Date.parse(a.created_at) : 0;
      const second = b.created_at ? Date.parse(b.created_at) : 0;
      return second - first;
    });
  }
  return products;
}

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; sort?: string }>;
}) {
  const params = await searchParams;
  const category = params.category || "all";
  const sort = params.sort || "best";

  const dbCategories = await getCategories();

  let rawProducts: ProductDisplay[] = [];
  try {
    if (category === "all") {
      rawProducts = await getAllProducts();
    } else {
      rawProducts = await getProductsByCategory(category);
    }
  } catch {
    rawProducts = [];
  }

  const sorted = sortProducts(rawProducts, sort);
  const products = sorted.map(mapToCardProduct);

  const categories = [{ id: "all", label: "All" }, ...dbCategories.map((item) => ({ id: item.slug, label: item.name }))];

  return (
    <main className="w-full bg-white">
      <div className="mx-auto max-w-[1400px] px-6 sm:px-8 md:px-12 lg:px-16 py-12 md:py-16">
        <header className="text-center mb-12">
          <h1 className="font-heading text-2xl sm:text-3xl md:text-4xl text-[#1e2023]">All Products</h1>
          <div className="mx-auto mt-4 h-[2px] w-16 bg-[#d4b07a]" />
        </header>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between border-t border-b border-black/10 py-4 mb-12 gap-4">
          <nav className="flex gap-4 sm:gap-6 overflow-x-auto pb-1 -mb-1">
            {categories.map((item) => (
              <a
                key={item.id}
                href={`/shop?category=${item.id}&sort=${sort}`}
                className={`text-sm tracking-widest pb-1 whitespace-nowrap ${
                  category === item.id
                    ? "border-b-2 border-[#d4b07a] text-[#1e2023]"
                    : "text-black/60 hover:text-black"
                }`}
              >
                {item.label}
              </a>
            ))}
          </nav>

          <form method="GET" className="flex items-center gap-4 text-sm" aria-label="Sort products">
            <input type="hidden" name="category" value={category} />

            <span className="text-black/60">Showing {products.length} products</span>

            <select
              name="sort"
              defaultValue={sort}
              className="border border-black/20 px-3 py-2 bg-white text-sm"
            >
              <option value="best">Best selling</option>
              <option value="price">Price</option>
              <option value="new">Newest</option>
              <option value="rating">Rating</option>
            </select>

            <noscript>
              <button type="submit" className="ml-2 px-3 py-2 border border-black/20 text-sm">
                Apply
              </button>
            </noscript>
          </form>
        </div>

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
