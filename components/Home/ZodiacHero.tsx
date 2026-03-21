"use client";

import Link from "next/link";

export default function ZodiacHero() {
  return (
    <section className="relative w-full bg-[#100F0E] overflow-hidden">
      {/* Container */}
      <div className="mx-auto max-w-[1400px] flex flex-col lg:flex-row items-center">
        {/* LEFT CONTENT */}
        <div className="w-full lg:w-1/2 px-6 sm:px-10 lg:px-16 py-16 lg:py-24 z-10">
          <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl xl:text-6xl leading-[1.1] text-white">
            Nakshatra Attar
            <br className="hidden sm:block" />
            for your soul.
          </h1>

          <p className="mt-6 max-w-lg text-sm sm:text-base leading-7 text-white/80">
            Twenty-seven Nakshatra attars crafted to mirror the mood and energy of each Vedic lunar mansion.
            Each attar is composed as a quiet, skin-close aura that echoes the symbolism, deity, and elemental
            nature of your birth star.
          </p>

          <Link
            href="/collections/nakshatra"
            className="inline-block p-4 mt-8 border border-white px-7 py-3 text-xs tracking-[0.2em] text-white transition-all duration-300 hover:bg-white hover:text-black"
          >
            EXPLORE NAKSHATRA ATTARS
          </Link>
        </div>

        {/* RIGHT VIDEO */}
        <div className="relative w-full lg:w-1/2 h-[320px] sm:h-[420px] lg:h-[600px]">
          <video
            src="/NakshatraGif1.webm"
            className="absolute inset-0 w-full h-full object-contain lg:object-right"
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
