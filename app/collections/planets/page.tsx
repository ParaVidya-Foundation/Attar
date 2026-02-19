import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { Container } from "@/components/ui/Container";
import Image from "next/image";
import ProductCard, { Product } from "@/components/shop/ProductCard";

export const metadata: Metadata = pageMetadata({
  title: "Planets",
  description:
    "Navagraha-inspired fragrance mood cues: Venus for grace, Saturn for discipline, Moon for calm mind.",
  path: "/planets",
  type: "website",
});

const products: Product[] = [
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
  },
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
  },
];

export default function PlanetsPage() {
  return (
    <section>
      <div className="relative w-full aspect-[16/9]">
        <Image
          src="/incense.jpg"
          alt="Luxury Incense Collection"
          fill
          priority
          sizes="100vw"
          className="
            object-contain
            transition-transform duration-700 ease-out
            group-hover:scale-[1.02]
            will-change-transform
          "
          quality={100}
        />
      </div>
      <section
        aria-labelledby="planets-perfumes-series"
        className="mx-auto max-w-[1400px] px-6 sm:px-8 md:px-12 lg:px-16 py-14 md:py-16"
      >
        <header className="mb-10 text-center">
          <h2 id="planets-perfumes-series" className="font-serif text-3xl sm:text-4xl text-[#1e2023]">
            Planets perfumes Series
          </h2>
        </header>

        <div
          className="
            grid
            gap-y-14 gap-x-8
            grid-cols-1
            sm:grid-cols-2
            md:grid-cols-3
            xl:grid-cols-4
          "
        >
          {products.map((product) => (
            <ProductCard key={`premium-${product.id}`} product={product} />
          ))}
        </div>
      </section>
    </section>
  );
}
