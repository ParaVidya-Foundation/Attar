"use client";

import Image from "next/image";
import { useState } from "react";

type Zodiac = {
  id: string;

  zodiacImg: string;
  perfumeImg: string;
  desc: string;
};

const ZODIACS: Zodiac[] = [
  {
    id: "aries",

    zodiacImg: "/Zodiac/aries_card.webp",
    perfumeImg: "/Zodiac/aries.webp",
    desc: "Aries — Bold fire, raw confidence, unstoppable drive.",
  },
  {
    id: "taurus",

    zodiacImg: "/Zodiac/taurus_card.webp",
    perfumeImg: "/Zodiac/taurus.webp",
    desc: "Taurus — Earthy luxury, calm strength, sensual depth.",
  },
  {
    id: "gemini",

    zodiacImg: "/Zodiac/gemini_card.webp",
    perfumeImg: "/Zodiac/gemini.webp",
    desc: "Gemini — Fresh curiosity, light citrus, playful air.",
  },
  {
    id: "cancer",

    zodiacImg: "/Zodiac/cancer_card.webp",
    perfumeImg: "/Zodiac/cancer.webp",
    desc: "Cancer — Soft lunar warmth, emotional comfort.",
  },
  {
    id: "leo",

    zodiacImg: "/Zodiac/leo_card.webp",
    perfumeImg: "/Zodiac/leo.webp",
    desc: "Leo — Regal glow, golden pride, magnetic presence.",
  },
  {
    id: "virgo",

    zodiacImg: "/Zodiac/virgo_card.webp",
    perfumeImg: "/Zodiac/virgo.webp",
    desc: "Virgo — Clean elegance, precision, subtle refinement.",
  },
  {
    id: "libra",

    zodiacImg: "/Zodiac/libra_card.webp",
    perfumeImg: "/Zodiac/libra.webp",
    desc: "Libra — Perfect balance, airy florals, harmony.",
  },
  {
    id: "scorpio",

    zodiacImg: "/Zodiac/scorpio_card.webp",
    perfumeImg: "/Zodiac/scorpio.webp",
    desc: "Scorpio — Dark intensity, mystery, magnetic depth.",
  },
  {
    id: "sagittarius",

    zodiacImg: "/Zodiac/sagittarius_card.webp",
    perfumeImg: "/Zodiac/sagittarius.webp",
    desc: "Sagittarius — Wild freedom, spice, open horizons.",
  },
  {
    id: "capricorn",

    zodiacImg: "/Zodiac/capricorn_card.webp",
    perfumeImg: "/Zodiac/capricorn.webp",
    desc: "Capricorn — Authority, structure, timeless strength.",
  },
  {
    id: "aquarius",

    zodiacImg: "/Zodiac/aquarius_card.webp",
    perfumeImg: "/Zodiac/aquarius.webp",
    desc: "Aquarius — Electric originality, cool innovation.",
  },
  {
    id: "pisces",

    zodiacImg: "/Zodiac/pisces_card.webp",
    perfumeImg: "/Zodiac/pisces.webp",
    desc: "Pisces — Dreamy waters, soft mysticism, intuition.",
  },
];

export default function PerfumeZodiac() {
  const [selected, setSelected] = useState<Zodiac>(ZODIACS[0]);

  return (
    <section className="w-full overflow-hidden border-[2px] border-[#1e2023] bg-white">
      {/* Header */}
      <div className="border-b-[2px] border-[#1e2023] bg-white">
        <div
          className="
      mx-auto
      max-w-3xl
      px-6
      py-14
      sm:py-16
      text-center
      opacity-0
      animate-heroFade
    "
        >
          {/* Eyebrow */}
          <p className="text-[10px] sm:text-xs tracking-[0.28em] text-gray-500">COLLECTION</p>

          {/* Title */}
          <h2 className="mt-3 font-heading text-3xl sm:text-4xl md:text-5xl text-[#1e2023] tracking-tight">
            Zodiac Attars
          </h2>

          {/* Accent line */}
          <div className="mx-auto mt-5 h-[2px] w-12 bg-[#1e2023]/70" />

          {/* Description */}
          <p className="mx-auto mt-6 max-w-xl text-sm sm:text-base leading-7 text-gray-600">
            Choose a fragrance aligned with your zodiac energy — balanced, refined and crafted for everyday
            presence.
          </p>
        </div>

        {/* Animation */}
        <style
          dangerouslySetInnerHTML={{
            __html: `
    .animate-heroFade {
      animation: heroFade 0.8s ease-out forwards;
    }
    @keyframes heroFade {
      from {
        opacity: 0;
        transform: translateY(18px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
  `,
          }}
        />
      </div>

      {/* Layout */}
      <div className="grid w-full lg:grid-cols-[1fr_340px]">
        {/* LEFT GRID */}
        <div className="border-r-[2px] border-[#1e2023]">
          <div
            className="
              grid
              grid-cols-2
              sm:grid-cols-3
              md:grid-cols-4
              lg:grid-cols-6
   
            "
          >
            {ZODIACS.map((p) => {
              const active = selected.id === p.id;

              return (
                <button
                  key={p.id}
                  onClick={() => setSelected(p)}
                  aria-selected={active}
                  className={`
                    relative w-full
                    border-[2px] border-[#1e2023]
                    bg-white
                    transition-all duration-300 ease-out
                    hover:bg-black/[0.03]
                    active:scale-[0.97]
                    ${active ? "bg-black/[0.05]" : ""}
                  `}
                >
                  <div className="relative w-full aspect-[2/3]">
                    <Image
                      src={p.zodiacImg}
                      alt={`${p.id} zodiac`}
                      fill
                      sizes="(max-width:640px) 45vw, (max-width:1024px) 22vw, 12vw"
                      className="object-contain"
                      loading="lazy" // ✅ prevents unnecessary preloading
                    />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="flex flex-col items-center justify-center border-r-[2px] border-b-[2px] border-t-[2px] border-[#1e2023]">
          <div className="relative w-full max-w-[220px] sm:max-w-[260px] aspect-[2/3] animate-switch">
            <Image
              key={selected.perfumeImg}
              src={selected.perfumeImg}
              alt={selected.id}
              fill
              sizes="(max-width:1024px) 60vw, 260px"
              className="object-contain"
              priority // only hero image gets priority
            />
          </div>

          <p
            key={selected.desc}
            className="mt-5 max-w-xs text-center text-sm leading-6 text-gray-700 animate-switch"
          >
            {selected.desc}
          </p>

          <button className="mt-6 border-[2px] border-[#1e2023] px-6 py-2 text-xs tracking-wider transition-all duration-300 hover:bg-black hover:text-white">
            VIEW PRODUCT
          </button>
        </div>
      </div>

      {/* Lightweight animation - plain style to avoid App Router / optimizeCss issues */}
      <style
        dangerouslySetInnerHTML={{
          __html: `.animate-switch{animation:perfume-zodiac-switch 0.28s ease-out}@keyframes perfume-zodiac-switch{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}`,
        }}
      />
    </section>
  );
}
