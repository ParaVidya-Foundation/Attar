"use client";

import Image from "next/image";

export default function OurMission() {
  return (
    <section className="bg-[#F6F1E7] text-[#1e2023] overflow-hidden mt-10">
      <div className="mx-auto max-w-7xl px-6 py-16 sm:py-20 md:py-24 lg:py-28">
        {/* Layout */}
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          {/* ===== Left Content ===== */}
          <div className="max-w-xl animate-fade-in">
            <p className="text-xs tracking-[0.26em] text-black/50">OUR PHILOSOPHY</p>

            <h2
              className="mt-4 text-3xl sm:text-4xl md:text-5xl leading-tight"
              style={{
                fontFamily: '"Playfair Display", "Cormorant Garamond", serif',
                fontWeight: 400,
              }}
            >
              Our Mission
            </h2>

            <div className="mt-6 space-y-4 text-sm sm:text-base text-black/70 leading-relaxed">
              <p>
                Our mission is to create fragrances that reflect purity, tradition, and spiritual harmony.
                Each attar is crafted with intention, respecting ancient methods and timeless ingredients.
              </p>
              <p>
                We believe fragrance is not just scent — it is emotion, memory, and devotion. Every blend is
                designed to bring calm, clarity, and a sense of sacred presence.
              </p>
              <p>
                Through mindful sourcing and careful craftsmanship, Anand Rasa brings authentic luxury attars
                to modern life.
              </p>
            </div>
          </div>

          {/* ===== Right Image ===== */}
          <div className="relative w-full animate-fade-in">
            <div className="relative w-full h-[320px] sm:h-[420px] md:h-[520px] lg:h-[620px]">
              <Image
                src="/about/lab.png"
                alt="Our Mission – Attar Craftsmanship"
                fill
                priority
                sizes="(max-width:1024px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
