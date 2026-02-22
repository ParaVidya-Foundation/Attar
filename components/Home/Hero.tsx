"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "../ui/Button";
import { useEffect, useState } from "react";

export default function Hero() {
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
              Perfume for your soul
            </h1>

            <p className="mt-5 text-base leading-7 text-gray-600">
              Modern luxury attars crafted through timeless distillation. Pure oils, calm presence, and
              minimal elegance designed for everyday ritual.
            </p>

            <div className="mt-7 flex items-center gap-5">
              <Link href="/shop">
                <Button variant="secondary">Shop Now</Button>
              </Link>

              <Link
                href="/collections"
                className="text-sm font-medium text-gray-900 underline-offset-4 hover:underline"
              >
                Explore Collections
              </Link>
            </div>
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
                src="/KV_Hero.webp"
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
