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
      className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm"
      aria-label="Blog categories"
    >
      <h2 className="text-xl font-bold text-gray-900 mb-6">Categories</h2>
      <nav>
        <ul className="space-y-3">
          {categories.map((category, index) => (
            <motion.li
              key={category}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
            >
              <Link
                href={`/research/blogs?category=${encodeURIComponent(category.toLowerCase().replace(/\s+/g, "-"))}`}
                className="block text-gray-700 hover:text-sky-600 hover:translate-x-2 transition-all duration-200 py-2"
                aria-label={`View posts in ${category} category`}
              >
                {category}
              </Link>
            </motion.li>
          ))}
        </ul>
      </nav>
    </section>
  );
}
