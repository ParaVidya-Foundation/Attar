"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "../ui/Button";
import { useEffect, useState } from "react";

export default function IncenseHero() {
  const [mounted, setMounted] = useState(false);

  // Lightweight entrance animation trigger
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <section className="relative overflow-hidden bg-white">
      <div className="mx-auto grid max-w-7xl items-center gap-10 px-6 py-20 md:grid-cols-2 md:py-28 lg:px-8">
        {/* LEFT CONTENT */}
        <div
          className={`max-w-xl transition-all duration-700 ease-out ${
            mounted ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
          }`}
        >
          <p className="text-xs font-semibold tracking-[0.28em] text-charcoal/60">KAMAL VALLABH</p>

          <h1 className="mt-4 font-serif text-4xl leading-tight text-ink sm:text-5xl lg:text-6xl">
            Perfume for your soul
          </h1>

          <p className="mt-6 text-base leading-7 text-charcoal/80">
            Discover modern luxury attars crafted through timeless distillation. Pure oils, calm presence, and
            minimal elegance designed for everyday ritual.
          </p>

          <div className="mt-8 flex items-center gap-4">
            <Link href="/shop">
              <Button variant="secondary">Shop Now</Button>
            </Link>

            <Link
              href="/collections"
              className="text-sm font-medium text-ink underline-offset-4 hover:underline"
            >
              Explore Collections
            </Link>
          </div>
        </div>

        {/* RIGHT IMAGE */}
        <div
          className={`relative transition-all duration-700 delay-100 ease-out ${
            mounted ? "scale-100 opacity-100" : "scale-[0.96] opacity-0"
          }`}
        >
          {/* Soft glow background for premium feel */}
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_50%_40%,rgba(201,163,74,0.15),transparent_70%)]" />

          <Image
            src="/images/hero.jpg"
            alt="Luxury attar bottle minimal white studio lighting"
            width={900}
            height={900}
            priority
            className="mx-auto h-auto w-full max-w-md object-contain"
          />
        </div>
      </div>
    </section>
  );
}
