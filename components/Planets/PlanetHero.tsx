"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "../ui/Button";
import { useEffect, useState } from "react";

export default function PlanetHero() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <section className="relative overflow-hidden bg-white">
      <div className="mx-auto max-w-[1400px] px-6 lg:px-10">
        {/* Reduced vertical space */}
        <div className="relative grid items-center gap-10 py-10 sm:py-14 lg:grid-cols-2 lg:py-16">
          {/* LEFT CONTENT */}
          <div
            className={`relative z-10 max-w-xl transition-all duration-700 ease-out ${
              mounted ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
            }`}
          >
            <p className="text-[11px] font-semibold tracking-[0.28em] text-gray-500">ANAND RAS</p>

            <h1 className="mt-3 font-heading text-3xl sm:text-4xl md:text-5xl lg:text-6xl leading-tight text-gray-900">
              Planet Attars
            </h1>

            <p className="mt-5 text-base leading-7 text-gray-600">
              Discover the power of planets with our attar collection. Each attar is crafted with the essence
              of the planet it represents.
            </p>
          </div>

          {/* RIGHT IMAGE — BIG + OVERLAP */}
          <div
            className={`relative transition-all duration-700 delay-100 ease-out ${
              mounted ? "opacity-100 translate-x-0" : "opacity-0 translate-x-8"
            }`}
          >
            {/* Image wrapper */}
            <div
              className="
                relative
                ml-auto
                w-full
                max-w-full
                aspect-[3/2]
                sm:w-[110%]
                lg:w-[140%]
                lg:-mr-32
                xl:-mr-48
                overflow-hidden
              "
            >
              <Image
                src="/PlanetHero.webp"
                alt="Luxury attar minimal studio lighting"
                fill
                priority
                sizes="(max-width:1024px) 100vw, 900px"
                className="object-contain object-right"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
