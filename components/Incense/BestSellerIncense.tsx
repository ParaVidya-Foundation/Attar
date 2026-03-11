"use client";

import { useRef, useState, useEffect } from "react";
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
    id: "sambrani",
    name: "Sacred Sambrani Havan Cups",
    href: "/products/sacred-sambrani-havan-cups",
    image: "/products/sambrani-box.jpg",
    price: 240,
    originalPrice: 300,
    badge: "hot",
  },
  {
    id: "dhoop",
    name: "Mysore Sandalwood Dhoop Sticks",
    href: "/products/mysore-sandalwood-dhoop",
    image: "/products/dhoop-sticks.jpg",
    price: 149,
    originalPrice: 165,
    badge: "hot",
  },
  {
    id: "incense",
    name: "Incense Sticks Sleeve",
    href: "/products/incense-sleeve",
    image: "/products/incense-sleeve.jpg",
    price: 765,
    originalPrice: 900,
  },
  {
    id: "devotional",
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

/* ================= PRODUCT CARD ================= */

function ProductCard({ product }: { product: Product }) {
  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : null;

  return (
    <article className="snap-start flex-shrink-0 w-[260px] sm:w-[280px] lg:w-[300px]">
      <Link href={product.href} className="group block">
        <div
          className="h-[460px] flex flex-col bg-white border border-neutral-200
          transition duration-300 hover:shadow-lg hover:-translate-y-1"
        >
          {/* IMAGE */}

          <div className="relative h-[260px] overflow-hidden bg-neutral-100">
            <Image
              src={product.image}
              alt={product.name}
              fill
              sizes="(max-width:640px) 260px, (max-width:1024px) 280px, 300px"
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />

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

          {/* CONTENT */}

          <div className="flex flex-col flex-1 px-4 py-5">
            <h3 className="text-[14px] font-medium text-neutral-900 line-clamp-2 min-h-[40px]">
              {product.name}
            </h3>

            <div className="mt-3 flex items-center gap-2">
              <span className="text-[17px] font-semibold">{formatPrice(product.price)}</span>

              {product.originalPrice && (
                <span className="text-[13px] text-neutral-400 line-through">
                  {formatPrice(product.originalPrice)}
                </span>
              )}
            </div>

            <div className="flex-1" />

            <div className="pt-4">
              <div
                className="border border-black bg-black text-white text-[12px]
                tracking-widest py-2 text-center
                transition group-hover:bg-white group-hover:text-black"
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
  const [progress, setProgress] = useState(0);

  const scroll = (dir: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;

    const distance = el.clientWidth * 0.8;

    el.scrollBy({
      left: dir === "left" ? -distance : distance,
      behavior: "smooth",
    });
  };

  /* progress bar */

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const handleScroll = () => {
      const maxScroll = el.scrollWidth - el.clientWidth;
      const value = (el.scrollLeft / maxScroll) * 100;
      setProgress(value);
    };

    el.addEventListener("scroll", handleScroll);
    return () => el.removeEventListener("scroll", handleScroll);
  }, []);

  /* SEO */

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: PRODUCTS.map((p, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: p.name,
      url: `https://anandrasafragnance.com${p.href}`,
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
        {/* HEADER */}

        <header className="text-center mb-14">
          <h2 className="text-3xl font-serif text-[#7a1d1d]">Our Top Sellers</h2>
          <p className="mt-2 text-sm text-neutral-600">Must-See Selections</p>
        </header>

        {/* SLIDER */}

        <div className="relative">
          {/* ARROWS */}

          <button
            type="button"
            onClick={() => scroll("left")}
            className="hidden lg:flex items-center justify-center
            absolute left-[-10px] top-1/2 -translate-y-1/2 z-10
            w-10 h-10 bg-white border hover:bg-black hover:text-white transition"
            aria-label="Scroll left"
          >
            ‹
          </button>

          <button
            type="button"
            onClick={() => scroll("right")}
            className="hidden lg:flex items-center justify-center
            absolute right-[-10px] top-1/2 -translate-y-1/2 z-10
            w-10 h-10 bg-white border hover:bg-black hover:text-white transition"
            aria-label="Scroll right"
          >
            ›
          </button>

          {/* CARDS */}

          <div
            ref={scrollRef}
            className="flex gap-6 overflow-x-auto snap-x snap-mandatory
            scroll-smooth pb-4 px-1
            [scrollbar-width:none] [-ms-overflow-style:none]
            [&::-webkit-scrollbar]:hidden"
          >
            {PRODUCTS.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {/* PROGRESS */}

          <div className="mt-8 h-2 w-full bg-neutral-200 rounded-full overflow-hidden">
            <div
              style={{ width: `${progress}%` }}
              className="h-full bg-amber-400 transition-all duration-200"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
