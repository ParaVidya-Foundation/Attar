"use client";

import React from "react";
import { PerfumeZodiacCard, type Zodiac } from "./PerfumeZodiacCard";

/** Your 8 products */
const zodiacs: Zodiac[] = [
  {
    id: 1,
    name: "Aries",
    price: 15.0,
    images: ["/Zodiac/aries1.webp", "/Zodiac/aries.webp"],
  },
  {
    id: 2,
    name: "Taurus",
    price: 18.0,
    images: ["/Zodiac/taurus1.webp", "/Zodiac/taurus.webp"],
  },
  {
    id: 3,
    name: "Gemini",
    price: 17.0,
    images: ["/Zodiac/gemini1.webp", "/Zodiac/gemini.webp"],
  },
  {
    id: 4,
    name: "Cancer",
    price: 19.0,
    images: ["/Zodiac/cancer1.webp", "/Zodiac/cancer.webp"],
  },
  {
    id: 5,
    name: "Leo",
    price: 20.0,
    images: ["/Zodiac/leo1.webp", "/Zodiac/leo.webp"],
  },
  {
    id: 6,
    name: "Virgo",
    price: 18.0,
    images: ["/Zodiac/virgo1.webp", "/Zodiac/virgo.webp"],
  },
  {
    id: 7,
    name: "Libra",
    price: 19.0,
    images: ["/Zodiac/libra1.webp", "/Zodiac/libra.webp"],
  },
  {
    id: 8,
    name: "Scorpio",
    price: 21.0,
    images: ["/Zodiac/scorpio1.webp", "/Zodiac/scorpio.webp"],
  },
  {
    id: 9,
    name: "Sagittarius",
    price: 20.0,
    images: ["/Zodiac/sagittarius1.webp", "/Zodiac/sagittarius.webp"],
  },
  {
    id: 10,
    name: "Capricorn",
    price: 22.0,
    images: ["/Zodiac/capricorn1.webp", "/Zodiac/capricorn.webp"],
  },
  {
    id: 11,
    name: "Aquarius",
    price: 21.0,
    images: ["/Zodiac/aquarius1.webp", "/Zodiac/aquarius.webp"],
  },
  {
    id: 12,
    name: "Pisces",
    price: 19.0,
    images: ["/Zodiac/pisces1.webp", "/Zodiac/pisces.webp"],
  },
];

const PerfumeZodiacGrid = React.memo(function PerfumeZodiacGrid() {
  const handleAddToCart = React.useCallback((id: number) => {
    // Add to cart functionality (noop in prod, logs in dev)
    if (process.env.NODE_ENV === "development") {
      console.log("add-to-cart", id);
    }
  }, []);

  const handleToggleWishlist = React.useCallback((id: number, wishlisted: boolean) => {
    // Toggle wishlist functionality (noop in prod, logs in dev)
    if (process.env.NODE_ENV === "development") {
      console.log("wishlist", id, wishlisted);
    }
  }, []);

  return (
    <section className="w-full">
      <h1 className="sr-only">Perfume Collection</h1>

      {/* full-width brutalist + glassmorphism grid */}
      <ul
        className="
        grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4
        w-full
        border-t border-gray-300
        divide-x divide-y divide-gray-300
        bg-white/25
        backdrop-blur-md
        "
      >
        {zodiacs.map((p, idx) => (
          <li key={p.id} className="p-8">
            <PerfumeZodiacCard
              item={p}
              priority={idx < 4}
              onAddToCart={handleAddToCart}
              onToggleWishlist={handleToggleWishlist}
            />
          </li>
        ))}
      </ul>
    </section>
  );
});

export default PerfumeZodiacGrid;
