// app/shop/page.tsx
import type { Metadata } from "next";
import ProductCard, { Product } from "@/components/shop/ProductCard";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Shop",
  description:
    "Shop luxury perfumes crafted with heritage discipline. Minimal design, premium quality, long lasting fragrances.",
};

/* --------------------------------------------------
   DATASET (API ready)
-------------------------------------------------- */
type Category = "zodiac" | "planets" | "collections";

type ExtendedProduct = Product & {
  category: Category;
  sales: number;
  createdAt: number;
};

const productsData: ExtendedProduct[] = [
  {
    id: "surya",
    title: "Surya",
    price: 1890,
    originalPrice: 2490,
    currency: "₹",
    rating: 5,
    reviewsCount: 32,
    images: {
      primary: "/products/sun-1.webp",
      secondary: "/products/sun-2.webp",
    },
    href: "/product/surya",
    isSale: true,
    category: "planets",
    sales: 120,
    createdAt: 1700000000,
  },
  {
    id: "chandra",
    title: "Chandra",
    price: 1590,
    currency: "₹",
    rating: 5,
    reviewsCount: 18,
    images: {
      primary: "/products/moon-1.webp",
      secondary: "/products/moon-2.webp",
    },
    href: "/product/chandra",
    category: "planets",
    sales: 60,
    createdAt: 1710000000,
  },
  {
    id: "aries",
    title: "Aries",
    price: 1490,
    currency: "₹",
    rating: 4.8,
    reviewsCount: 14,
    images: {
      primary: "/products/aries-1.webp",
      secondary: "/products/aries-2.webp",
    },
    href: "/product/aries",
    category: "zodiac",
    sales: 40,
    createdAt: 1715000000,
  },
  {
    id: "royal",
    title: "Royal Collection",
    price: 2590,
    currency: "₹",
    rating: 5,
    reviewsCount: 22,
    images: {
      primary: "/products/collection-1.webp",
      secondary: "/products/collection-2.webp",
    },
    href: "/product/royal",
    category: "collections",
    sales: 90,
    createdAt: 1690000000,
  },
];

function filterAndSort(category: string, sort: string) {
  let items = productsData;

  if (category !== "all") {
    items = items.filter((p) => p.category === category);
  }

  switch (sort) {
    case "price":
      items = [...items].sort((a, b) => a.price - b.price);
      break;
    case "new":
      items = [...items].sort((a, b) => b.createdAt - a.createdAt);
      break;
    case "rating":
      items = [...items].sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
      break;
    default:
      items = [...items].sort((a, b) => b.sales - a.sales);
  }

  return items;
}

/* --------------------------------------------------
   PAGE (Server Component)
   NOTE: searchParams is a Promise in Next.js app router -> await it
-------------------------------------------------- */
export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; sort?: string }>;
}) {
  const params = await searchParams;
  const category = params.category || "all";
  const sort = params.sort || "best";

  const products = filterAndSort(category, sort);

  const categories = [
    { id: "all", label: "All" },
    { id: "zodiac", label: "Zodiac" },
    { id: "planets", label: "Planets" },
    { id: "collections", label: "Collections" },
  ];

  return (
    <main className="w-full bg-white">
      <div className="mx-auto max-w-[1400px] px-6 sm:px-8 md:px-12 lg:px-16 py-12 md:py-16">
        {/* Heading */}
        <header className="text-center mb-12">
          <h1 className="font-serif text-3xl md:text-4xl text-[#1e2023]">All Products</h1>
          <div className="mx-auto mt-4 h-[2px] w-16 bg-[#d4b07a]" />
        </header>

        {/* Filters */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between border-t border-b border-black/10 py-4 mb-12 gap-4">
          {/* Category Tabs */}
          <nav className="flex gap-6 overflow-x-auto">
            {categories.map((c) => (
              <a
                key={c.id}
                href={`/shop?category=${c.id}&sort=${sort}`}
                className={`text-sm tracking-widest pb-1 whitespace-nowrap ${
                  category === c.id
                    ? "border-b-2 border-[#d4b07a] text-[#1e2023]"
                    : "text-black/60 hover:text-black"
                }`}
              >
                {c.label}
              </a>
            ))}
          </nav>

          {/* Sorting — Server-friendly (no React event handlers) */}
          <form method="GET" className="flex items-center gap-4 text-sm" aria-label="Sort products">
            <input type="hidden" name="category" value={category} />

            <span className="text-black/60">Showing {products.length} products</span>

            {/* NOTE: use a plain HTML onchange string attribute so no JS function is passed from the server */}
            <select
              name="sort"
              defaultValue={sort}
              className="border border-black/20 px-3 py-2 bg-white text-sm"
              {...({ onchange: "this.form.submit()" } as any)}
            >
              <option value="best">Best selling</option>
              <option value="price">Price</option>
              <option value="new">Newest</option>
              <option value="rating">Rating</option>
            </select>

            {/* Accessible submit (for keyboard / screen reader users who prefer explicit control) */}
            <noscript>
              <button type="submit" className="ml-2 px-3 py-2 border border-black/20 text-sm">
                Apply
              </button>
            </noscript>
          </form>
        </div>

        {/* Grid */}
        <section className="grid gap-y-14 gap-x-8 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </section>
      </div>
    </main>
  );
}
