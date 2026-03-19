"use client";

import Threads from "@/styles/Threads";
import Link from "next/link";

export default function FindYourFragrance() {
  return (
    <section className="relative w-full h-[70vh] overflow-hidden bg-white">
      {/* Thread Animation */}
      <div className="absolute inset-0">
        <Threads amplitude={1} distance={0} enableMouseInteraction={true} color={[20, 20, 20]} />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-6">
        <h2 className="max-w-3xl text-3xl sm:text-4xl lg:text-5xl font-semibold leading-tight text-black tracking-tight">
          Discover the fragrance
          <br />
          written in your stars.
        </h2>

        <p className="mt-5 max-w-xl text-sm sm:text-base text-neutral-600 leading-relaxed">
          Our astrology fragrance finder reveals the attar aligned with your zodiac, planet, and Nakshatra
          energy. A scent designed to harmonize with your cosmic nature.
        </p>

        <Link
          href="/find-fragrance"
          className="mt-8 px-8 py-3 text-sm tracking-[0.15em] border border-black text-black transition-all duration-300 hover:bg-black hover:text-white"
        >
          Find Your Fragrance
        </Link>
      </div>
    </section>
  );
}
