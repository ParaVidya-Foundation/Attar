"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";

type Product = {
  id: string;
  name: string;
  type: string;
  description: string;
  price: string;
  size?: string;
  image: string;
  href: string;
};

const products: Product[] = [
  {
    id: "halfeti-1",
    name: "Halfeti",
    type: "Eau de Parfum",
    description: "Rose, fruits and spice captured in a warm embrace.",
    price: "£110",
    size: "30 ml",
    image: "/demo1.webp",
    href: "/product/halfeti",
  },
  {
    id: "luna-1",
    name: "Luna",
    type: "Eau de Toilette",
    description: "Orange, jasmine and fir. A soft celestial fragrance.",
    price: "£85",
    size: "30 ml",
    image: "/demo2.webp",
    href: "/product/luna",
  },
  {
    id: "cut-1",
    name: "The Cut",
    type: "Eau de Parfum",
    description: "Mint, cypress and fir balsam tailored to precision.",
    price: "£85",
    size: "30 ml",
    image: "/demo1.webp",
    href: "/product/the-cut",
  },
  {
    id: "favourite-1",
    name: "The Favourite",
    type: "Eau de Parfum",
    description: "Golden mimosa, iris and musk for refined elegance.",
    price: "£85",
    size: "30 ml",
    image: "/demo2.webp",
    href: "/product/the-favourite",
  },
  {
    id: "madu-1",
    name: "Madu",
    type: "Eau de Parfum",
    description: "Wood, leather and soft smoky warmth.",
    price: "£65",
    size: "30 ml",
    image: "/demo1.webp",
    href: "/product/madu",
  },
  {
    id: "halfeti-2",
    name: "Halfeti",
    type: "Eau de Parfum",
    description: "Rose, fruits and spice captured in a warm embrace.",
    price: "£110",
    size: "30 ml",
    image: "/demo2.webp",
    href: "/product/halfeti",
  },
  {
    id: "luna-2",
    name: "Luna",
    type: "Eau de Toilette",
    description: "Orange, jasmine and fir. A soft celestial fragrance.",
    price: "£85",
    size: "30 ml",
    image: "/demo1.webp",
    href: "/product/luna",
  },
  {
    id: "cut-2",
    name: "The Cut",
    type: "Eau de Parfum",
    description: "Mint, cypress and fir balsam tailored to precision.",
    price: "£85",
    size: "30 ml",
    image: "/demo2.webp",
    href: "/product/the-cut",
  },
  {
    id: "favourite-2",
    name: "The Favourite",
    type: "Eau de Parfum",
    description: "Golden mimosa, iris and musk for refined elegance.",
    price: "£85",
    size: "30 ml",
    image: "/demo1.webp",
    href: "/product/the-favourite",
  },
  {
    id: "madu-2",
    name: "Madu",
    type: "Eau de Parfum",
    description: "Wood, leather and soft smoky warmth.",
    price: "£65",
    size: "30 ml",
    image: "/demo2.webp",
    href: "/product/madu",
  },
];

export default function ZodiacShowcase() {
  const containerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (!containerRef.current) return;
    const width = containerRef.current.clientWidth;
    containerRef.current.scrollBy({
      left: direction === "left" ? -width * 0.8 : width * 0.8,
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
        {/* Arrows (desktop only) */}
        <button
          onClick={() => scroll("left")}
          aria-label="Scroll products left"
          className="absolute left-4 top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-[#1e2023]/20 bg-white transition-colors duration-300 hover:bg-black hover:text-white md:flex"
        >
          ‹
        </button>

        <button
          onClick={() => scroll("right")}
          aria-label="Scroll products right"
          className="absolute right-4 top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-[#1e2023]/20 bg-white transition-colors duration-300 hover:bg-black hover:text-white md:flex"
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
                    alt={`${product.name} luxury perfume bottle minimal white background`}
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
