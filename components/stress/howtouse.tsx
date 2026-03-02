"use client";

import Image from "next/image";

export default function HowToUse() {
  return (
    <section className="w-full overflow-hidden mt-7">
      {/* ===== Section Header ===== */}
      <div className="mx-auto max-w-6xl px-6 pt-16 pb-10 sm:pt-20 sm:pb-14 text-center">
        <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl animate-fade-in">
          How to Use Stress Relief Attars
        </h1>
      </div>

      <div className="steps bg-[#F6F1E7] text-[#1e2023] mt-7">
        {/* ================= Step 1 ================= */}
        <div className="grid lg:grid-cols-2 min-h-[70vh]">
          {/* Text */}
          <div className="flex items-center justify-center px-6 py-12 lg:py-0 animate-fade-in">
            <div className="max-w-md">
              <h2
                className="text-2xl sm:text-3xl"
                style={{
                  fontFamily: '"Playfair Display", "Cormorant Garamond", serif',
                  fontWeight: 400,
                }}
              >
                Apply Around Your Surroundings
              </h2>

              <p className="mt-4 text-sm sm:text-base text-black/70 leading-relaxed">
                Spray or apply attar lightly around your personal space and pulse points to create a calming
                and soothing environment that promotes relaxation and emotional balance.
              </p>
            </div>
          </div>

          {/* Image — extreme right */}
          <div className="relative w-full h-[70vh] animate-fade-in">
            <Image
              src="/stress/step1.webp"
              alt="Apply attar for calming environment"
              fill
              priority
              sizes="(max-width:1024px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
        </div>

        {/* ================= Step 2 ================= */}
        <div className="grid lg:grid-cols-2 min-h-[60vh]">
          {/* Image — extreme left */}
          <div className="relative w-full h-[60vh] order-2 lg:order-1 animate-fade-in">
            <Image
              src="/stress/step2.webp"
              alt="Peaceful breathing with attar"
              fill
              sizes="(max-width:1024px) 100vw, 50vw"
              className="object-cover"
            />
          </div>

          {/* Text */}
          <div className="flex items-center justify-center px-6 py-12 lg:py-0 order-1 lg:order-2 animate-fade-in">
            <div className="max-w-md">
              <h2
                className="text-2xl sm:text-3xl"
                style={{
                  fontFamily: '"Playfair Display", "Cormorant Garamond", serif',
                  fontWeight: 400,
                }}
              >
                Practice Peaceful Breathing
              </h2>

              <p className="mt-4 text-sm sm:text-base text-black/70 leading-relaxed">
                Take slow, deep breaths while experiencing the fragrance. This helps calm the nervous system,
                reduce stress, and bring mental clarity and inner peace.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
