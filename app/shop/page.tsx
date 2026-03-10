import type { Metadata } from "next";
import ProductCard from "@/components/shop/ProductCard";
import { getCategories } from "@/lib/fetchers";
import { getAllProducts, getProductsByCategory } from "@/lib/api/products";
import { mapToCardProduct } from "@/lib/productMapper";
import type { ProductDisplay } from "@/types/product";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Shop | Anand Rasa",
  description:
    "Explore our luxury attars, incense and spiritual fragrances crafted with heritage discipline and modern elegance.",
};

const PRODUCTS_PER_PAGE = 20;

function sortProducts(products: ProductDisplay[], sort: string) {
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

function searchProducts(products: ProductDisplay[], query: string) {
  if (!query) return products;

  const q = query.toLowerCase();

  return products.filter(
    (p) => p.name?.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q),
  );
}

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{
    category?: string;
    sort?: string;
    page?: string;
    q?: string;
  }>;
}) {
  const params = await searchParams;

  const category = params.category ?? "all";
  const sort = params.sort ?? "best";
  const query = params.q ?? "";
  const page = Math.max(1, Number(params.page) || 1);

  const dbCategories = await getCategories();

  let rawProducts: ProductDisplay[] = [];

  try {
    rawProducts = category === "all" ? await getAllProducts() : await getProductsByCategory(category);
  } catch {
    rawProducts = [];
  }

  const searched = searchProducts(rawProducts, query);
  const sorted = sortProducts(searched, sort);

  const totalProducts = sorted.length;
  const totalPages = Math.ceil(totalProducts / PRODUCTS_PER_PAGE);

  const start = (page - 1) * PRODUCTS_PER_PAGE;
  const paginatedProducts = sorted.slice(start, start + PRODUCTS_PER_PAGE);

  const products = paginatedProducts.map(mapToCardProduct);

  const categories = [
    { id: "all", label: "All" },
    ...dbCategories.map((c) => ({
      id: c.slug,
      label: c.name,
    })),
  ];

  return (
    <main className="bg-white">
      <div className="mx-auto max-w-[1400px] px-6 sm:px-8 lg:px-12 py-20">
        {/* HEADER */}
        <header className="text-center space-y-4 mb-12">
          <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl tracking-tight text-[#1e2023]">
            Shop Fragrances
          </h1>
          <p className="mx-auto max-w-xl text-sm sm:text-base text-black/60">
            Discover premium attars and spiritual fragrances crafted with traditional wisdom and modern
            elegance.
          </p>
          <div className="mx-auto mt-4 h-[2px] w-16 bg-[#d4b07a]" />
        </header>

        {/* SEARCH */}
        <section className="mb-10">
          <form className="flex justify-center" role="search" aria-label="Search fragrances">
            <input
              type="search"
              name="q"
              defaultValue={query}
              placeholder="Search fragrances..."
              className="w-full max-w-[420px] border border-black/20 px-4 py-3 text-sm sm:text-base outline-none focus:border-black"
              aria-label="Search fragrances by name or description"
            />
          </form>
        </section>

        {/* CATEGORY + SORT BAR */}
        <section className="border-y border-black/10 py-6 mb-14">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            {/* categories */}
            <nav className="flex gap-6 overflow-x-auto whitespace-nowrap [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {categories.map((item) => (
                <a
                  key={item.id}
                  href={`/shop?category=${item.id}&sort=${sort}&q=${query}`}
                  className={`text-xs sm:text-sm tracking-[0.18em] uppercase pb-1 border-b-2 border-transparent ${
                    category === item.id ? "border-[#d4b07a] text-black" : "text-black/60 hover:text-black"
                  }`}
                >
                  {item.label}
                </a>
              ))}
            </nav>

            {/* sorting */}
            <form method="GET" className="flex items-center gap-4 text-sm">
              <input type="hidden" name="category" value={category} />
              <input type="hidden" name="q" value={query} />

              <span className="text-black/60">{totalProducts} products</span>

              <select
                name="sort"
                defaultValue={sort}
                className="border border-black/20 bg-white px-3 py-2 text-sm"
              >
                <option value="best">Best selling</option>
                <option value="price">Price</option>
                <option value="new">Newest</option>
                <option value="rating">Rating</option>
              </select>

              <noscript>
                <button className="border border-black/20 px-3 py-2">Apply</button>
              </noscript>
            </form>
          </div>
        </section>

        {/* PRODUCTS GRID */}
        <section aria-label="Product grid" className="space-y-8">
          <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.length === 0 ? (
              <p className="col-span-full py-20 text-center text-black/60">No fragrances found.</p>
            ) : (
              products.map((product) => <ProductCard key={product.id} product={product} />)
            )}
          </div>
        </section>

        {/* PAGINATION */}
        {totalPages > 1 && (
          <section className="mt-16 pt-8" aria-label="Pagination">
            <div className="flex flex-wrap items-center justify-center gap-3">
              {page > 1 && (
                <a
                  href={`/shop?category=${category}&sort=${sort}&q=${query}&page=${page - 1}`}
                  className="px-4 py-2 border border-black text-sm bg-white text-black hover:bg-black hover:text-white"
                >
                  Previous
                </a>
              )}

              {Array.from({ length: totalPages }).map((_, i) => {
                const p = i + 1;

                return (
                  <a
                    key={p}
                    href={`/shop?category=${category}&sort=${sort}&q=${query}&page=${p}`}
                    className={`px-4 py-2 border text-sm ${
                      page === p
                        ? "bg-black text-white border-black"
                        : "border-black/30 bg-white text-black hover:bg-black hover:text-white"
                    }`}
                  >
                    {p}
                  </a>
                );
              })}

              {page < totalPages && (
                <a
                  href={`/shop?category=${category}&sort=${sort}&q=${query}&page=${page + 1}`}
                  className="px-4 py-2 border border-black text-sm bg-white text-black hover:bg-black hover:text-white"
                >
                  Next
                </a>
              )}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
