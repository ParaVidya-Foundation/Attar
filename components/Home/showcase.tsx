"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";

export type ShowcaseProduct = {
  id: string;
  name: string;
  type: string;
  description: string;
  price: string;
  size?: string;
  image: string;
  href: string;
};

type ShowcaseProps = {
  products?: ShowcaseProduct[];
};

const SHOWCASE_DATA: ShowcaseProduct[] = [
  {
    id: "surya",
    name: "Surya Attar",
    type: "Planet Attar",
    description: "Energy and confidence fragrance.",
    price: "₹1,499",
    size: "10ml",
    image: "/HomeAttar/surya.webp",
    href: "/product/surya-attar",
  },
  {
    id: "shani",
    name: "shani Attar",
    type: "Planet Attar",
    description: "Calmness and emotional balance.",
    price: "₹1,399",
    size: "10ml",
    image: "/HomeAttar/shani.webp",
    href: "/product/chandra-attar",
  },
  {
    id: "mangal",
    name: "Mangal Attar",
    type: "Planet Attar",
    description: "Strength and motivation essence.",
    price: "₹1,499",
    size: "10ml",
    image: "/products/mangal.webp",
    href: "/product/mangal-attar",
  },
  {
    id: "venus",
    name: "Shukra Attar",
    type: "Planet Attar",
    description: "Luxury and attraction fragrance.",
    price: "₹1,699",
    size: "10ml",
    image: "/products/shukra.webp",
    href: "/product/shukra-attar",
  },
  {
    id: "stress",
    name: "Calm Mind",
    type: "Stress Relief",
    description: "Soothing aroma for relaxation.",
    price: "₹1,299",
    size: "10ml",
    image: "/products/stress.webp",
    href: "/product/calm-mind-attar",
  },
  {
    id: "surya",
    name: "Surya Attar",
    type: "Planet Attar",
    description: "Energy and confidence fragrance.",
    price: "₹1,499",
    size: "10ml",
    image: "/products/surya.webp",
    href: "/product/surya-attar",
  },
  {
    id: "chandra",
    name: "Chandra Attar",
    type: "Planet Attar",
    description: "Calmness and emotional balance.",
    price: "₹1,399",
    size: "10ml",
    image: "/products/chandra.webp",
    href: "/product/chandra-attar",
  },
  {
    id: "mangal",
    name: "Mangal Attar",
    type: "Planet Attar",
    description: "Strength and motivation essence.",
    price: "₹1,499",
    size: "10ml",
    image: "/products/mangal.webp",
    href: "/product/mangal-attar",
  },
  {
    id: "venus",
    name: "Shukra Attar",
    type: "Planet Attar",
    description: "Luxury and attraction fragrance.",
    price: "₹1,699",
    size: "10ml",
    image: "/products/shukra.webp",
    href: "/product/shukra-attar",
  },
  {
    id: "stress",
    name: "Calm Mind",
    type: "Stress Relief",
    description: "Soothing aroma for relaxation.",
    price: "₹1,299",
    size: "10ml",
    image: "/products/stress.webp",
    href: "/product/calm-mind-attar",
  },
];

/* ========================================================= */

export default function Showcase({ products = [] }: ShowcaseProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // If no products passed → use internal JSON
  const displayProducts = products.length > 0 ? products : SHOWCASE_DATA;

  const scroll = (direction: "left" | "right") => {
    if (!containerRef.current) return;

    const width = containerRef.current.clientWidth;

    const distance = window.innerWidth < 640 ? width * 0.7 : width * 0.8;

    containerRef.current.scrollBy({
      left: direction === "left" ? -distance : distance,
      behavior: "smooth",
    });
  };

  return (
    <section className="bg-white py-16 sm:py-20 border-b-[2px] border-[#1e2023]">
      {/* Heading */}
      <header className="mx-auto max-w-4xl px-6 text-center">
        <h2 className="font-heading text-2xl sm:text-3xl lg:text-4xl tracking-wide text-ink">BestSellers</h2>
        <p className="mt-3 text-sm text-charcoal/70">Explore our best sellers.</p>
      </header>

      {/* Carousel */}
      <div className="relative mt-12 sm:mt-14">
        {/* Edge fade */}
        <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-6 bg-gradient-to-r from-white to-transparent" />
        <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-6 bg-gradient-to-l from-white to-transparent" />

        {/* Arrows */}
        <button
          onClick={() => scroll("left")}
          aria-label="Scroll products left"
          className="absolute left-2 sm:left-4 top-1/2 z-20 -translate-y-1/2 flex items-center justify-center h-8 w-8 sm:h-10 sm:w-10 rounded-full border border-[#1e2023]/20 bg-white/90 backdrop-blur text-sm sm:text-base transition-colors duration-300 hover:bg-black hover:text-white"
        >
          ‹
        </button>

        <button
          onClick={() => scroll("right")}
          aria-label="Scroll products right"
          className="absolute right-2 sm:right-4 top-1/2 z-20 -translate-y-1/2 flex items-center justify-center h-8 w-8 sm:h-10 sm:w-10 rounded-full border border-[#1e2023]/20 bg-white/90 backdrop-blur text-sm sm:text-base transition-colors duration-300 hover:bg-black hover:text-white"
        >
          ›
        </button>

        {/* Products */}
        <div
          ref={containerRef}
          className="flex gap-8 sm:gap-10 lg:gap-12 overflow-x-auto px-6 scroll-smooth snap-x snap-mandatory touch-pan-x [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
        >
          {displayProducts.map((product) => (
            <article
              key={product.id}
              className="min-w-[200px] sm:min-w-[220px] lg:min-w-[240px] max-w-[240px] lg:max-w-[260px] flex-shrink-0 snap-start text-center"
            >
              <Link href={product.href} className="group block">
                {/* Image */}
                <div className="relative mx-auto aspect-[3/4] w-[160px] sm:w-[180px] lg:w-[200px] overflow-hidden">
                  <Image
                    src={product.image}
                    alt={`${product.name} perfume`}
                    fill
                    sizes="(max-width:640px) 160px, (max-width:1024px) 180px, 200px"
                    className="object-contain transition-transform duration-500 ease-out group-hover:scale-105"
                  />
                </div>

                {/* Content */}
                <h3 className="mt-5 font-heading text-base sm:text-lg tracking-wide text-ink transition-opacity duration-300 group-hover:opacity-80">
                  {product.name}
                </h3>

                <p className="mt-1 text-[10px] sm:text-[11px] uppercase tracking-widest text-charcoal/60">
                  {product.type}
                </p>

                <p className="mt-2 text-sm leading-6 text-charcoal/80">{product.description}</p>

                <p className="mt-3 text-sm font-medium text-ink">
                  {product.price}
                  {product.size && <span className="ml-2 text-charcoal/60">{product.size}</span>}
                </p>
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
