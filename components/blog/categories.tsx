"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";

const categories = [
  "Pitra Dosh",
  "Stree Dosh",
  "Kalsarp Dosh",
  "Lal Kitab",
  "Vastu",
  "Feng Shui",
  "Numerology",
  "Palmistry",
  "AI Astrology",
];

export default function Categories() {
  return (
    <section
      aria-label="Blog categories"
      className="
        w-full
        bg-white
        border border-black/10
      "
    >
      {/* Header */}
      <header className="px-6 py-5 border-b border-black/10">
        <h2 className="text-lg font-medium tracking-tight text-[#1e2023]">Categories</h2>
      </header>

      {/* List */}
      <nav>
        <ul className="divide-y divide-black/5">
          {categories.map((category, index) => {
            const slug = category.toLowerCase().replace(/\s+/g, "-");

            return (
              <motion.li
                key={category}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{
                  duration: 0.35,
                  delay: index * 0.04,
                  ease: "easeOut",
                }}
              >
                <Link
                  href={`/research/blogs?category=${slug}`}
                  aria-label={`View posts in ${category}`}
                  className="
                    block
                    px-6 py-4
                    text-sm
                    tracking-tight
                    text-[#1e2023]
                    transition-all duration-200
                    hover:bg-black/[0.02]
                    hover:pl-7
                  "
                >
                  {category}
                </Link>
              </motion.li>
            );
          })}
        </ul>
      </nav>
    </section>
  );
}
