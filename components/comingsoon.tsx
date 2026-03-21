"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function ComingSoon() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(t);
  }, []);

  return (
    <section className="w-full">
      <div className="mx-auto max-w-[900px] px-6 sm:px-10 lg:px-16 py-24 sm:py-28 text-center">
        {/* Label */}
        <p
          className={`text-[11px] tracking-[0.25em] text-neutral-500 uppercase transition-all duration-700 ${
            visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
          }`}
        >
          Launching Soon
        </p>

        {/* Heading */}
        <h1
          className={`mt-4 text-3xl sm:text-4xl lg:text-5xl font-medium tracking-tight text-black leading-[1.1] transition-all duration-700 delay-100 ${
            visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
          }`}
        >
          This product is coming soon.
        </h1>

        {/* Subtext */}
        <p
          className={`mt-6 text-sm sm:text-base text-neutral-600 max-w-xl mx-auto leading-relaxed transition-all duration-700 delay-200 ${
            visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
          }`}
        >
          We’re carefully crafting something exceptional. In the meantime, explore our current collection of
          attars, designed with the same attention to detail and tradition.
        </p>

        {/* CTA */}
        <div
          className={`mt-10 transition-all duration-700 delay-300 ${
            visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
          }`}
        >
          <Link
            href="/shop"
            className="inline-block border border-black px-8 py-3 text-xs tracking-[0.2em] text-black transition-all duration-300 hover:bg-black hover:text-white"
          >
            Explore Our Shop
          </Link>
        </div>
      </div>
    </section>
  );
}
