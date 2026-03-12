"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import Image from "next/image";

type ImageItem = { src: string; alt?: string };

export type Product = {
  id: string;
  slug?: string;
  title: string;
  images: ImageItem[];
};

export default function ProductShowcase({ product }: { product: Product }) {
  const images = product.images ?? [];

  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const intervalRef = useRef<number | null>(null);

  /* ---------------- Navigation ---------------- */

  const goTo = useCallback(
    (i: number) => {
      if (!images.length) return;
      const nextIndex = (i + images.length) % images.length;
      setIndex(nextIndex);
      setPaused(true);

      setTimeout(() => setPaused(false), 2000);
    },
    [images.length],
  );

  const next = useCallback(() => goTo(index + 1), [goTo, index]);
  const prev = useCallback(() => goTo(index - 1), [goTo, index]);

  /* ---------------- Autoplay ---------------- */

  useEffect(() => {
    if (images.length <= 1) return;

    if (paused) return;

    intervalRef.current = window.setInterval(() => {
      setIndex((i) => (i + 1) % images.length);
    }, 10000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [paused, images.length]);

  /* ---------------- Keyboard ---------------- */

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [next, prev]);

  if (!images.length) return null;

  return (
    <section
      className="
        w-full lg:w-1/2
        flex flex-col
        bg-white
        border-l border-t border-b border-[#1e2023]
      "
      aria-label={`${product.title} product images`}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* ---------------- MAIN IMAGE ---------------- */}

      <div className="relative flex items-center justify-center px-6 md:px-10 py-10 border-[1px] border-[#1e2023] border-l border-t border-b">
        <div className="relative w-full max-w-[620px] aspect-[4/5]">
          {images.map((img, i) => (
            <div
              key={img.src}
              className={`absolute inset-0 transition-opacity duration-500 ease-out ${
                i === index ? "opacity-100" : "opacity-0 pointer-events-none"
              }`}
            >
              <Image
                src={img.src}
                alt={img.alt || product.title}
                fill
                priority={i === 0}
                sizes="(max-width:1024px) 90vw, 620px"
                className="object-contain"
              />
            </div>
          ))}
        </div>

        {/* ---------------- NAV BUTTONS ---------------- */}

        {images.length > 1 && (
          <>
            <button
              onClick={prev}
              aria-label="Previous image"
              className="
                absolute left-4
                h-10 w-10
                flex items-center justify-center
                border border-neutral-900
                bg-white
                text-lg
                transition
                hover:bg-neutral-900 hover:text-white
                active:scale-95
              "
            >
              ‹
            </button>

            <button
              onClick={next}
              aria-label="Next image"
              className="
                absolute right-4
                h-10 w-10
                flex items-center justify-center
                border border-neutral-900
                bg-white
                text-lg
                transition
                hover:bg-neutral-900 hover:text-white
                active:scale-95
              "
            >
              ›
            </button>
          </>
        )}
      </div>

      {/* ---------------- THUMBNAILS ---------------- */}

      {images.length > 1 && (
        <div
          className="
            border-[1px] border-[#1e2023] border-l border-t border-b
            flex gap-3
            px-6 py-4
            overflow-x-auto
            scrollbar-hide
          "
        >
          {images.map((img, i) => (
            <button
              key={`thumb-${i}`}
              onClick={() => goTo(i)}
              aria-label={`View image ${i + 1}`}
              className={`
                relative flex-shrink-0
                w-[72px] h-[72px]
                border
                ${i === index ? "border-neutral-900" : "border-transparent hover:border-neutral-400"}
                transition
              `}
            >
              <Image
                src={img.src}
                alt={img.alt || product.title}
                fill
                sizes="72px"
                className="object-contain"
              />
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
