"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

export function Footer() {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Subtle reveal on scroll (performance safe)
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisible(true);
      },
      { threshold: 0.15 },
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  const LinkItem = ({ href, label }: { href: string; label: string }) => (
    <Link
      href={href}
      className="group relative text-sm text-ink/85 transition-colors duration-300 hover:text-ink"
    >
      {label}
      <span className="absolute -bottom-1 left-0 h-[1px] w-0 bg-gold transition-all duration-300 group-hover:w-full" />
    </Link>
  );

  return (
    <footer ref={ref} className="relative border-t border-ash/40 bg-cream overflow-hidden">
      {/* Subtle luxury gradient glow */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.06] bg-[radial-gradient(circle_at_50%_0%,#C9A34A,transparent_60%)]" />

      <div
        className={`mx-auto max-w-7xl px-6 py-20 transition-all duration-700 ease-out ${
          visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
        }`}
      >
        <div className="grid gap-14 md:grid-cols-12">
          {/* Brand Section */}
          <div className="md:col-span-5">
            <p className="font-serif text-2xl tracking-[0.08em] text-ink">Kamal Vallabh</p>

            <p className="mt-4 max-w-sm text-sm leading-7 text-charcoal/80">
              Heritage Indian attars crafted through timeless distillation. Minimal. Pure. Designed for calm
              presence and quiet luxury.
            </p>

            {/* Decorative divider */}
            <div className="mt-6 h-px w-20 bg-gold/60" />
          </div>

          {/* Navigation */}
          <div className="md:col-span-7">
            <div className="grid gap-10 sm:grid-cols-3">
              {/* Shop */}
              <div>
                <p className="text-[11px] font-semibold tracking-[0.28em] text-charcoal/70">SHOP</p>
                <ul className="mt-4 space-y-3">
                  <li>
                    <LinkItem href="/shop" label="All Attars" />
                  </li>
                  <li>
                    <LinkItem href="/collections/planets" label="Planets" />
                  </li>
                  <li>
                    <LinkItem href="/collections/zodiac" label="Zodiac" />
                  </li>
                  <li>
                    <LinkItem href="/collections/divine" label="Divine" />
                  </li>
                </ul>
              </div>

              {/* Knowledge */}
              <div>
                <p className="text-[11px] font-semibold tracking-[0.28em] text-charcoal/70">KNOWLEDGE</p>
                <ul className="mt-4 space-y-3">
                  <li>
                    <LinkItem href="/blog" label="Journal" />
                  </li>
                  <li>
                    <LinkItem href="/zodiac" label="Zodiac Guide" />
                  </li>
                  <li>
                    <LinkItem href="/planets" label="Planetary Attars" />
                  </li>
                </ul>
              </div>

              {/* Company */}
              <div>
                <p className="text-[11px] font-semibold tracking-[0.28em] text-charcoal/70">COMPANY</p>
                <ul className="mt-4 space-y-3">
                  <li>
                    <LinkItem href="/about" label="About Us" />
                  </li>
                  <li>
                    <LinkItem href="/policies" label="Policies" />
                  </li>
                  <li>
                    <LinkItem href="/account" label="Account" />
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 flex flex-col items-center justify-between gap-4 border-t border-ash/30 pt-6 text-xs text-charcoal/70 sm:flex-row">
          <p>© {new Date().getFullYear()} Kamal Vallabh. All rights reserved.</p>

          <div className="flex items-center gap-6">
            <LinkItem href="/privacy" label="Privacy" />
            <LinkItem href="/terms" label="Terms" />
            <LinkItem href="/contact" label="Contact" />
          </div>
        </div>
      </div>
    </footer>
  );
}
