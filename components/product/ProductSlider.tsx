"use client";

import { useRef } from "react";
import ProductCard, { Product } from "@/components/shop/ProductCard";

type Props = {
  products: Product[];
  title?: string;
};

export default function ProductSlider({ products, title }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    const el = containerRef.current;
    if (!el) return;

    const width = el.clientWidth;
    el.scrollBy({
      left: direction === "left" ? -width * 0.8 : width * 0.8,
      behavior: "smooth",
    });
  };

  if (!products?.length) return null;

  return (
    <section className="w-full bg-white">
      <div className="mx-auto max-w-[1600px] px-6 sm:px-8 md:px-12 lg:px-16 py-12 md:py-16">
        {/* Header */}
        {title && (
          <div className="mb-10 flex items-center justify-between">
            <h2 className="font-serif text-2xl md:text-3xl text-[#1e2023]">{title}</h2>

            {/* Arrows (desktop only) */}
            <div className="hidden md:flex items-center gap-3">
              <button
                onClick={() => scroll("left")}
                aria-label="Scroll left"
                className="h-10 w-10 flex items-center justify-center border border-black/20 transition-all duration-300 hover:bg-black hover:text-white"
              >
                ‹
              </button>

              <button
                onClick={() => scroll("right")}
                aria-label="Scroll right"
                className="h-10 w-10 flex items-center justify-center border border-black/20 transition-all duration-300 hover:bg-black hover:text-white"
              >
                ›
              </button>
            </div>
          </div>
        )}

        {/* Slider */}
        <div
          ref={containerRef}
          className="
            flex gap-8 overflow-x-auto scroll-smooth snap-x snap-mandatory
            [scrollbar-width:none] [-ms-overflow-style:none]
            [&::-webkit-scrollbar]:hidden
          "
        >
          {products.map((product) => (
            <div
              key={product.id}
              className="
                min-w-[80%]
                sm:min-w-[45%]
                md:min-w-[320px]
                lg:min-w-[360px]
                snap-start
                flex-shrink-0
              "
            >
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
