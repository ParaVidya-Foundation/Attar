"use client";

import Image from "next/image";
import Link from "next/link";

export default function ZodiacHero() {
  return (
    <div className="relative w-full h-[70vh] overflow-hidden bg-white">
      {/* Background Image */}
      <Image
        src="/images/zodiac-hero.jpg" // replace with your image
        alt="Essential cruelty-free skincare products arranged on stone background"
        fill
        priority
        sizes="100vw"
        className="object-cover object-right"
      />

      {/* Soft overlay for text contrast */}
      <div className="absolute inset-0 bg-gradient-to-r from-white/85 via-white/60 to-transparent" />

      {/* Content */}
      <div className="relative z-10 flex h-full items-center">
        <div className="max-w-xl px-6 sm:px-10 lg:px-16 animate-fadeUp">
          <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl leading-tight text-[#1e2023]">
            Essential cruelty-free skincare
            <br className="hidden sm:block" />
            for a glowy, healthy skin.
          </h1>

          <p className="mt-5 max-w-md text-sm sm:text-base leading-7 text-[#5f6368]">
            Thoughtfully crafted formulas using clean, ethical ingredients — designed to restore balance,
            softness, and everyday radiance.
          </p>

          <Link
            href="/shop"
            className="inline-block mt-8 border border-[#1e2023] px-6 py-2 text-xs tracking-[0.18em] text-[#1e2023] transition-all duration-300 hover:bg-black hover:text-white"
          >
            SHOP OUR PRODUCTS
          </Link>
        </div>
      </div>

      {/* Animation */}
      <style jsx>{`
        .animate-fadeUp {
          opacity: 0;
          transform: translateY(14px);
          animation: fadeUp 0.6s ease-out forwards;
        }
        @keyframes fadeUp {
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
