"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";

type ImageItem = { src: string; alt?: string };

export type Product = {
  id: string;
  slug?: string;
  title: string;
  images: ImageItem[];
};

export default function ProductShowcase({ product }: { product: Product }) {
  const { images = [] } = product;

  const [index, setIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef<number | null>(null);

  /* ---------------- Auto Slide (10s) ---------------- */
  useEffect(() => {
    if (images.length <= 1) return;

    const start = () => {
      stop();
      intervalRef.current = window.setInterval(() => {
        setIndex((i) => (i + 1) % images.length);
      }, 10000);
    };

    const stop = () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };

    if (!isPaused) start();
    return () => stop();
  }, [isPaused, images.length]);

  /* ---------------- Controls ---------------- */
  const goTo = (i: number) => {
    setIndex((i + images.length) % images.length);
    setIsPaused(true);
    setTimeout(() => setIsPaused(false), 2500);
  };

  const next = () => goTo(index + 1);
  const prev = () => goTo(index - 1);

  /* Keyboard */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  /* ---------------- UI ---------------- */
  return (
    <div
      className="
        w-full lg:w-1/2
        flex flex-col
        bg-white
        border-t-[2px] border-[#1e2023]
        border-b-[2px] border-[#1e2023]
        border-l-[2px] border-[#1e2023]
        overflow-hidden
      "
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Main Viewer */}
      <div
        className="
          relative
          w-full
          flex-1
          flex items-center justify-center
          px-6 md:px-10
        "
        role="region"
        aria-label={`${product.title} image gallery`}
      >
        {/* Images */}
        <div className="relative w-full max-w-[640px] aspect-[4/5]">
          {images.map((img, i) => (
            <div
              key={img.src}
              className={`absolute inset-0 transition-opacity duration-700 ease-out ${
                i === index ? "opacity-100 z-10" : "opacity-0"
              }`}
            >
              <Image
                src={img.src}
                alt={img.alt || product.title}
                fill
                sizes="(max-width:1024px) 90vw, 600px"
                className="object-contain"
                priority={i === 0}
              />
            </div>
          ))}
        </div>

        {/* Side Arrows (minimal luxury) */}
        {images.length > 1 && (
          <>
            <button
              onClick={prev}
              aria-label="Previous image"
              className="
                absolute left-4
                h-10 w-10
                flex items-center justify-center
                border border-black/20
                bg-white/80 backdrop-blur
                text-sm
                opacity-0 hover:opacity-100
                transition
                md:opacity-100
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
                border border-black/20
                bg-white/80 backdrop-blur
                text-sm
                opacity-0 hover:opacity-100
                transition
                md:opacity-100
              "
            >
              ›
            </button>
          </>
        )}
      </div>

      {/* Thumbnail Rail */}
      {images.length > 1 && (
        <div
          className="
            border-t-[2px] border-[#1e2023]
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
                ${i === index ? "border-[#1e2023]" : "border-transparent hover:border-black/40"}
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
    </div>
  );
}
