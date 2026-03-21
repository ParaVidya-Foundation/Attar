"use client";

import SoftAurora from "@/styles/SoftAurora";
import Link from "next/link";

export default function FindYourFragrance() {
  return (
    <section className="relative w-full h-[70vh] overflow-hidden bg-black">
      {/* Thread Animation */}
      <div className="absolute inset-0">
        <SoftAurora
          speed={0.6}
          scale={1.5}
          brightness={1}
          color1="#f7f7f7"
          color2="#e100ff"
          noiseFrequency={2.5}
          noiseAmplitude={1}
          bandHeight={0.5}
          bandSpread={1}
          octaveDecay={0.1}
          layerOffset={0}
          colorSpeed={1}
          enableMouseInteraction
          mouseInfluence={0.25}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-6">
        <h2 className="max-w-3xl text-3xl sm:text-4xl lg:text-5xl font-semibold leading-tight text-white tracking-tight">
          Discover the fragrance
          <br />
          written in your stars.
        </h2>

        <p className="mt-5 max-w-xl text-sm sm:text-base text-white leading-relaxed">
          Our astrology fragrance finder reveals the attar aligned with your zodiac, planet, and Nakshatra
          energy. A scent designed to harmonize with your cosmic nature.
        </p>

        <Link
          href="/find-fragrance"
          className="mt-8 px-8 py-3 text-sm tracking-[0.15em] border border-white text-white transition-all duration-300 hover:bg-white hover:text-black"
        >
          Find Your Fragrance
        </Link>
      </div>
    </section>
  );
}
