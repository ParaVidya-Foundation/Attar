"use client";

import Image from "next/image";
import Link from "next/link";

export default function PureAttar() {
  return (
    <section
      aria-label="Brand story"
      className="border-t-[2px] border-[#1e2023] relative w-full h-[70vh] min-h-[420px] overflow-hidden"
    >
      {/* Background Image */}
      <Image
        src="/images/story.jpg" // replace with your image
        alt="Woman applying luxury perfume minimal lifestyle photography"
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />

      {/* Soft overlay for readability */}
      <div className="absolute inset-0 bg-white/20 backdrop-[brightness(0.95)]" />

      {/* Content */}
      <div className="relative z-10 flex h-full w-full items-center justify-center px-6 text-center">
        <div className="max-w-2xl animate-fadeUp">
          {/* Heading */}
          <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl tracking-tight text-[#1e2023]">
            More than fragrance
          </h2>

          {/* Subtext */}
          <p className="mt-4 text-sm sm:text-base leading-7 text-[#1e2023]/80">
            Crafted with intention and tradition, each attar is designed to become a quiet part of your
            presence — subtle, timeless, and deeply personal.
          </p>

          {/* CTA */}
          <Link
            href="/about"
            className="
              inline-block mt-8
              border border-[#1e2023]
              bg-white
              px-8 py-3
              text-xs tracking-[0.2em]
              text-[#1e2023]
              transition-all duration-300
              hover:bg-[#1e2023] hover:text-white
              active:scale-[0.97]
            "
          >
            OUR STORY
          </Link>
        </div>
      </div>

      {/* Animation */}
      <style jsx>{`
        .animate-fadeUp {
          opacity: 0;
          transform: translateY(18px);
          animation: fadeUp 0.7s ease-out forwards;
        }
        @keyframes fadeUp {
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </section>
  );
}
