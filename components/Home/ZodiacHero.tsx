"use client";

import Link from "next/link";

export default function ZodiacHero() {
  return (
    <section className="relative w-full h-[70vh] bg-[#100F0E] overflow-hidden">
      <div className="relative z-10 flex h-full items-center">
        <div className="max-w-xl px-6 sm:px-10 lg:px-16">
          <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl leading-tight text-white">
            Nakshatra Attar
            <br className="hidden sm:block" />
            for your soul.
          </h1>

          <p className="mt-5 max-w-md text-sm sm:text-base leading-7 text-white">
            Twenty-seven Nakshatra attars crafted to mirror the mood and energy of each Vedic lunar mansion.
            Each attar is composed as a quiet, skin-close aura that echoes the symbolism, deity, and elemental
            nature of your birth star.
          </p>

          <Link
            href="/collections/nakshatra"
            className="inline-block mt-8 border border-white px-6 py-2 text-xs tracking-[0.18em] text-white transition-all duration-300 hover:bg-black hover:text-white"
          >
            Explore Nakshatra Attars
          </Link>
        </div>
      </div>

      <div className="absolute right-0 top-0 h-full w-[45%]">
        <div className="relative w-full h-full">
          <video
            src="/NakshatraGif1.webm"
            className="h-full w-full object-contain object-right"
            autoPlay
            loop
            muted
            playsInline
          />
        </div>
      </div>
    </section>
  );
}
