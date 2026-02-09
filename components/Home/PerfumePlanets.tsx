"use client";

import Image from "next/image";
import { useState } from "react";

type Planet = {
  id: string;
  planetImg: string;
  perfumeImg: string;
  desc: string;
};

const PLANETS: Planet[] = [
  {
    id: "sun",
    planetImg: "/Planets/surya_card.webp",
    perfumeImg: "/Planets/sun.webp",
    desc: "Sun — Golden warmth in every note.",
  },
  {
    id: "moon",
    planetImg: "/Planets/moon_card.webp",
    perfumeImg: "/Planets/moon.webp",
    desc: "Moon — Calm whispers in silver light.",
  },
  {
    id: "mars",
    planetImg: "/Planets/mangal_card.webp",
    perfumeImg: "/Planets/mars.webp",
    desc: "Mars — Flame of courage, scent of victory.",
  },
  {
    id: "mercury",
    planetImg: "/Planets/budh_card.webp",
    perfumeImg: "/Planets/mercury.webp",
    desc: "Mercury — Quick thoughts, cool citrus.",
  },
  {
    id: "jupiter",
    planetImg: "/Planets/guru_card.webp",
    perfumeImg: "/Planets/jupiter.webp",
    desc: "Jupiter — Grandeur laced in calm sandalwood.",
  },
  {
    id: "venus",
    planetImg: "/Planets/shukra_card.webp",
    perfumeImg: "/Planets/venus.webp",
    desc: "Venus — Love reborn in rose and velvet.",
  },
  {
    id: "saturn",
    planetImg: "/Planets/shani_card.webp",
    perfumeImg: "/Planets/saturn.webp",
    desc: "Saturn — The scent of timeless strength.",
  },
  {
    id: "rahu",
    planetImg: "/Planets/rahu_card.webp",
    perfumeImg: "/Planets/rahu.webp",
    desc: "Rahu — Shadow’s fire, smoky mystery.",
  },
];

export default function PerfumePlanetGrid() {
  const [selected, setSelected] = useState<Planet>(PLANETS[0]);

  return (
    <section aria-label="Planet based perfumes" className="w-full bg-white border-[2px] border-[#1e2023]">
      {/* Intro Block */}
      <div className="relative flex h-[40vh] w-full items-center justify-center bg-white overflow-hidden border-b-[2px] border-[#1e2023]">
        <div className="mx-auto flex max-w-2xl flex-col items-center text-center px-6 animate-fadeUp">
          <h2 className="font-serif text-3xl sm:text-4xl tracking-tight text-[#1e2023]">Navagraha Attars</h2>

          <p className="mt-4 text-sm sm:text-base leading-7 text-gray-600">
            Inspired by the nine celestial forces, each fragrance is crafted to harmonize your presence with
            planetary energy—subtle, balanced, and deeply grounding.
          </p>

          <button className="mt-6 border-[2px] border-[#1e2023] px-6 py-2 text-xs tracking-[0.18em] text-[#1e2023] transition-all duration-300 hover:bg-black hover:text-white">
            EXPLORE COLLECTION
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid min-h-[90vh] w-full grid-cols-1 lg:grid-cols-5">
        {/* RIGHT PANEL */}
        <div className="order-1 lg:order-2 lg:col-span-1 border-[2px] border-[#1e2023] flex flex-col items-center justify-center relative overflow-hidden px-4 py-8 lg:p-0">
          <div
            key={selected.id}
            className="relative w-full max-w-[280px] sm:max-w-[320px] aspect-[2/3] animate-switch"
          >
            <Image
              src={selected.perfumeImg}
              alt={`${selected.id} attar`}
              fill
              sizes="(max-width:1024px) 60vw, 20vw"
              className="object-contain"
              priority
            />
          </div>

          <p key={selected.desc} className="mt-6 max-w-xs text-center text-sm text-gray-700 animate-switch">
            {selected.desc}
          </p>

          <button
            className="mt-6 border-[2px] border-[#1e2023] px-6 py-2 text-xs tracking-wider transition-colors duration-300 hover:bg-black hover:text-white"
            aria-label={`View ${selected.id} product`}
          >
            VIEW PRODUCT
          </button>
        </div>

        {/* LEFT GRID */}
        <div className="order-2 lg:order-1 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 lg:col-span-4">
          {PLANETS.map((p, index) => {
            const active = selected.id === p.id;

            return (
              <button
                key={p.id}
                onClick={() => setSelected(p)}
                aria-selected={active}
                className={`
                  relative border-[2px] border-[#1e2023]
                  w-full h-full
                  bg-white
                  overflow-hidden
                  transition-all duration-200
                  active:scale-[0.97]
                  ${active ? "bg-black/[0.04]" : ""}
                  animate-fadeUp
                `}
                style={{ animationDelay: `${index * 40}ms` }}
              >
                <div className="relative w-full h-full flex items-center justify-center min-h-[160px]">
                  <Image
                    src={p.planetImg}
                    alt={`${p.id} planet attar`}
                    fill
                    sizes="(max-width:640px) 50vw, (max-width:1024px) 25vw, 12vw"
                    className="object-contain"
                    priority={index === 0}
                  />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Animations (single source of truth) */}
      <style jsx>{`
        .animate-fadeUp {
          opacity: 0;
          transform: translateY(12px);
          animation: fadeUp 0.45s ease-out forwards;
        }

        @keyframes fadeUp {
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-switch {
          animation: switch 0.35s ease-out;
        }

        @keyframes switch {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </section>
  );
}
