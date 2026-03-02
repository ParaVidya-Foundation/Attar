"use client";

import { useRef } from "react";
import Link from "next/link";
import Image from "next/image";

/* ================= TYPES ================= */

type Product = {
  id: string;
  name: string;
  href: string;
  image: string;
  price: number;
  originalPrice?: number;

  badge?: "hot";
};

/* ================= DATA ================= */

const PRODUCTS: Product[] = [
  {
    id: "1",
    name: "Sacred Sambrani Havan Cups",
    href: "/products/sacred-sambrani-havan-cups",
    image: "/products/sambrani-box.jpg",
    price: 240,
    originalPrice: 300,
    badge: "hot",
  },
  {
    id: "2",
    name: "Mysore Sandalwood Dhoop Sticks",
    href: "/products/mysore-sandalwood-dhoop",
    image: "/products/dhoop-sticks.jpg",
    price: 149,
    originalPrice: 165,

    badge: "hot",
  },
  {
    id: "3",
    name: "Incense Sticks Sleeve",
    href: "/products/incense-sleeve",
    image: "/products/incense-sleeve.jpg",
    price: 765,
    originalPrice: 900,
  },
  {
    id: "4",
    name: "Sambrani Devotional Pack",
    href: "/products/sambrani-devotional-pack",
    image: "/products/devotional-pack.jpg",
    price: 450,
    originalPrice: 600,
  },
  {
    id: "1",
    name: "Sacred Sambrani Havan Cups",
    href: "/products/sacred-sambrani-havan-cups",
    image: "/products/sambrani-box.jpg",
    price: 240,
    originalPrice: 300,
    badge: "hot",
  },
  {
    id: "2",
    name: "Mysore Sandalwood Dhoop Sticks",
    href: "/products/mysore-sandalwood-dhoop",
    image: "/products/dhoop-sticks.jpg",
    price: 149,
    originalPrice: 165,

    badge: "hot",
  },
  {
    id: "3",
    name: "Incense Sticks Sleeve",
    href: "/products/incense-sleeve",
    image: "/products/incense-sleeve.jpg",
    price: 765,
    originalPrice: 900,
  },
  {
    id: "4",
    name: "Sambrani Devotional Pack",
    href: "/products/sambrani-devotional-pack",
    image: "/products/devotional-pack.jpg",
    price: 450,
    originalPrice: 600,
  },
  {
    id: "1",
    name: "Sacred Sambrani Havan Cups",
    href: "/products/sacred-sambrani-havan-cups",
    image: "/products/sambrani-box.jpg",
    price: 240,
    originalPrice: 300,
    badge: "hot",
  },
  {
    id: "2",
    name: "Mysore Sandalwood Dhoop Sticks",
    href: "/products/mysore-sandalwood-dhoop",
    image: "/products/dhoop-sticks.jpg",
    price: 149,
    originalPrice: 165,

    badge: "hot",
  },
  {
    id: "3",
    name: "Incense Sticks Sleeve",
    href: "/products/incense-sleeve",
    image: "/products/incense-sleeve.jpg",
    price: 765,
    originalPrice: 900,
  },
  {
    id: "4",
    name: "Sambrani Devotional Pack",
    href: "/products/sambrani-devotional-pack",
    image: "/products/devotional-pack.jpg",
    price: 450,
    originalPrice: 600,
  },
];

/* ================= HELPERS ================= */

const formatPrice = (n: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);

/* ================= CARD ================= */

function ProductCard({ product }: { product: Product }) {
  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : null;

  return (
    <article className="snap-start flex-shrink-0 w-[280px] sm:w-[300px] lg:w-[320px]">
      <Link href={product.href} className="group block">
        {/* Card Container */}
        <div
          className="h-[520px] flex flex-col bg-white border border-neutral-200 
                          transition-all duration-300 ease-out
                          hover:shadow-lg hover:-translate-y-1"
        >
          {/* ================= Image ================= */}
          <div className="relative h-[300px] overflow-hidden bg-neutral-50">
            <Image
              src={product.image}
              alt={product.name}
              fill
              sizes="320px"
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            />

            {/* Badges */}
            {product.badge && (
              <span className="absolute top-3 right-3 bg-[#7a1d1d] text-white text-[10px] px-2 py-1 tracking-wide">
                HOT SELLING
              </span>
            )}

            {discount && (
              <span className="absolute top-3 left-3 bg-white border text-[10px] px-2 py-1">
                {discount}% OFF
              </span>
            )}
          </div>

          {/* ================= Content ================= */}
          <div className="flex flex-col flex-1 px-5 py-6">
            {/* Title */}
            <h3 className="text-[14px] font-medium text-neutral-900 leading-snug line-clamp-2 min-h-[42px]">
              {product.name}
            </h3>

            {/* Price */}
            <div className="mt-3 flex items-center gap-2">
              <span className="text-[18px] font-semibold text-neutral-900">{formatPrice(product.price)}</span>

              {product.originalPrice && (
                <span className="text-[13px] text-neutral-400 line-through">
                  {formatPrice(product.originalPrice)}
                </span>
              )}
            </div>

            {/* Spacer pushes CTA to bottom */}
            <div className="flex-1" />

            {/* CTA */}
            <div className="pt-4">
              <div
                className="w-full border border-black bg-black text-white text-[12px] tracking-widest py-2 text-center
                                transition-all duration-200
                                group-hover:bg-white group-hover:text-black"
              >
                BUY NOW
              </div>
            </div>
          </div>
        </div>
      </Link>
    </article>
  );
}

/* ================= MAIN COMPONENT ================= */

export default function BestSellerIncense() {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    const distance = el.clientWidth * 0.8;
    el.scrollBy({
      left: dir === "left" ? -distance : distance,
      behavior: "smooth",
    });
  };

  /* SEO */
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: PRODUCTS.map((p, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `https://anandrasafragnance.com${p.href}`,
      name: p.name,
    })),
  };

  return (
    <section className="bg-[#F6F1E7] py-20">
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="mx-auto max-w-7xl px-6">
        {/* Header */}
        <header className="text-center mb-14">
          <h2 className="text-3xl font-serif text-[#7a1d1d]">Our Top Sellers</h2>
          <p className="mt-2 text-sm text-neutral-600">Must-See Selections</p>
        </header>

        {/* Slider */}
        <div className="relative">
          {/* Arrows */}
          <button
            onClick={() => scroll("left")}
            className="hidden lg:flex absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white border p-2 hover:bg-black hover:text-white transition"
            aria-label="Scroll left"
          >
            ‹
          </button>

          <button
            onClick={() => scroll("right")}
            className="hidden lg:flex absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white border p-2 hover:bg-black hover:text-white transition"
            aria-label="Scroll right"
          >
            ›
          </button>

          {/* Cards Row */}
          <div
            ref={scrollRef}
            className="flex gap-8 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-4
                       [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
          >
            {PRODUCTS.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {/* Progress Bar */}
          <div className="mt-8 h-3 w-full bg-neutral-200 rounded-full">
            <div className="h-3 w-1/2 bg-amber-400 rounded-full" />
          </div>
        </div>
      </div>
    </section>
  );
}
