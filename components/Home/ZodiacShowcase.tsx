"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";

export type ZodiacShowcaseProduct = {
  id: string;
  name: string;
  type: string;
  description: string;
  price: string;
  size?: string;
  image: string;
  href: string;
};

type ZodiacShowcaseProps = {
  products?: ZodiacShowcaseProduct[];
};

export default function ZodiacShowcase({ products = [] }: ZodiacShowcaseProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (!containerRef.current) return;

    const width = containerRef.current.clientWidth;

    // Smaller scroll distance on mobile for better control
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
        <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl tracking-wide text-ink">ZODIAC</h2>
        <p className="mt-3 text-sm text-charcoal/70">Choose your zodiac fragrance.</p>
      </header>

      {/* Carousel */}
      <div className="relative mt-12 sm:mt-14">
        {/* Edge fade (mobile UX hint) */}
        <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-6 bg-gradient-to-r from-white to-transparent" />
        <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-6 bg-gradient-to-l from-white to-transparent" />

        {/* Arrows — visible on all screens */}
        <button
          onClick={() => scroll("left")}
          aria-label="Scroll products left"
          className="
            absolute left-2 sm:left-4 top-1/2 z-20
            -translate-y-1/2
            flex items-center justify-center
            h-8 w-8 sm:h-10 sm:w-10
            rounded-full
            border border-[#1e2023]/20
            bg-white/90 backdrop-blur
            text-sm sm:text-base
            transition-colors duration-300
            hover:bg-black hover:text-white
          "
        >
          ‹
        </button>

        <button
          onClick={() => scroll("right")}
          aria-label="Scroll products right"
          className="
            absolute right-2 sm:right-4 top-1/2 z-20
            -translate-y-1/2
            flex items-center justify-center
            h-8 w-8 sm:h-10 sm:w-10
            rounded-full
            border border-[#1e2023]/20
            bg-white/90 backdrop-blur
            text-sm sm:text-base
            transition-colors duration-300
            hover:bg-black hover:text-white
          "
        >
          ›
        </button>

        {/* Products */}
        <div
          ref={containerRef}
          className="
            flex gap-8 sm:gap-10 lg:gap-12
            overflow-x-auto px-6
            scroll-smooth snap-x snap-mandatory
            touch-pan-x
            [scrollbar-width:none] [-ms-overflow-style:none]
            [&::-webkit-scrollbar]:hidden
          "
        >
          {products.map((product) => (
            <article
              key={product.id}
              className="
                min-w-[200px] sm:min-w-[220px] lg:min-w-[240px]
                max-w-[240px] lg:max-w-[260px]
                flex-shrink-0 snap-start text-center
              "
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
                <h3 className="mt-5 font-serif text-base sm:text-lg tracking-wide text-ink transition-opacity duration-300 group-hover:opacity-80">
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
