"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { ShoppingCart } from "lucide-react";
import { UserMenu } from "@/components/auth/UserMenu";
import { useCart } from "@/components/cart/CartProvider";
import { LOGO_PATH } from "@/lib/seo";

const COLLECTIONS = [
  {
    id: "planets",
    href: "/collections/planets",
    label: "Planets Attars",
    img: "/PlanetHero.webp",
  },
  { id: "zodiac", href: "/collections/zodiac", label: "Zodiac Attars", img: "/collections/zodiac-thumb.jpg" },
  {
    id: "stress",
    href: "/collections/stress",
    label: "Stress Relief Attars",
    img: "/collections/stress-thumb.jpg",
  },
  {
    id: "divine",
    href: "/collections/Incense",
    label: "Incense Sticks",
    img: "/collections/divine-thumb.jpg",
  },
] as const;

/**
 * Industry-level Header
 * - Apple-like, minimal, sharp edges
 * - Performance minded: rAF scroll handling, preconnect, prefers-reduced-motion
 * - Accessibility: aria labels, roles, focusable controls, keyboard Escape handling
 * - Pixel-perfect logo sizing & layout
 *
 * Logic unchanged: cart open, user menu, mega, mobile behavior remain the same
 */
export default function Header() {
  const { count = 0, setOpen } = useCart();

  const [hidden, setHidden] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [megaOpen, setMegaOpen] = useState(false);
  const [preview, setPreview] = useState<string | null>(COLLECTIONS[0].img);

  const lastY = useRef(0);
  const ticking = useRef(false);
  const headerRef = useRef<HTMLElement | null>(null);
  const megaRef = useRef<HTMLDivElement | null>(null);
  const closeTimer = useRef<number | null>(null);

  // optimized scroll: requestAnimationFrame to avoid layout thrash
  useEffect(() => {
    function onScroll() {
      if (ticking.current) return;
      ticking.current = true;
      requestAnimationFrame(() => {
        const y = window.scrollY || 0;
        // hide header only after small threshold for better UX
        setHidden(y > lastY.current && y > 96);
        lastY.current = y;
        ticking.current = false;
      });
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // click outside & Escape closes mega and mobile
  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (megaRef.current && !megaRef.current.contains(e.target as Node)) {
        setMegaOpen(false);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setMegaOpen(false);
        setMobileOpen(false);
      }
    }
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  // set CSS variable and body padding-top so content never overlaps header
  useEffect(() => {
    function updatePadding() {
      const h = headerRef.current?.offsetHeight ?? 72;
      document.documentElement.style.setProperty("--site-header-height", `${h}px`);
      (document.body.style as any).paddingTop = `${h}px`;
    }
    updatePadding();
    const onResize = () => requestAnimationFrame(updatePadding);
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      document.documentElement.style.removeProperty("--site-header-height");
      (document.body.style as any).paddingTop = "";
    };
  }, []);

  // reduced motion preference
  const prefersReduced =
    typeof window !== "undefined" &&
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function openMega() {
    if (closeTimer.current) {
      window.clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
    setMegaOpen(true);
  }
  function closeMegaDelayed() {
    if (prefersReduced) {
      setMegaOpen(false);
      return;
    }
    if (closeTimer.current) window.clearTimeout(closeTimer.current);
    // short delay to allow keyboard/hover moves
    closeTimer.current = window.setTimeout(() => {
      setMegaOpen(false);
      closeTimer.current = null;
    }, 240);
  }

  // preconnect common third-party domains (Razorpay, analytics) for perf
  useEffect(() => {
    const hosts = ["https://checkout.razorpay.com", "https://www.google-analytics.com"];
    const nodes: HTMLLinkElement[] = [];
    for (const h of hosts) {
      try {
        const l = document.createElement("link");
        l.rel = "preconnect";
        l.href = h;
        l.crossOrigin = "";
        document.head.appendChild(l);
        nodes.push(l);
      } catch {}
    }
    return () => {
      for (const n of nodes) {
        try {
          document.head.removeChild(n);
        } catch {}
      }
    };
  }, []);

  return (
    <header
      ref={headerRef}
      role="banner"
      className={`fixed inset-x-0 top-0 z-50 border-b border-neutral-200/60 bg-white/95 backdrop-blur-sm will-change-transform transition-transform duration-300 ${hidden ? "-translate-y-full" : "translate-y-0"}`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative flex h-20 items-center">
          {/* Left nav - desktop */}
          <div className="absolute left-0 inset-y-0 flex items-center pl-2 md:pl-0">
            <nav className="hidden md:flex items-center gap-6 px-4" aria-label="Primary">
              <Link
                href="/shop"
                className="text-sm font-medium text-slate-900/90 hover:text-slate-900 transition-colors"
              >
                Shop
              </Link>
              <Link
                href="/blog"
                className="text-sm font-medium text-slate-900/90 hover:text-slate-900 transition-colors"
              >
                Blogs
              </Link>
              <Link
                href="/gift-sets"
                className="text-sm font-medium text-slate-900/90 hover:text-slate-900 transition-colors"
              >
                Gift Sets
              </Link>
            </nav>
          </div>

          {/* Center brand */}
          <div className="mx-auto flex items-center justify-center">
            <Link href="/" className="inline-flex items-center" aria-label="Anand Ras – Home">
              <Image
                src={LOGO_PATH}
                alt="Anand Ras"
                width={460}
                height={132}
                priority
                className="h-16 w-auto object-contain sm:h-18 md:h-20 lg:h-24"
              />
            </Link>
          </div>

          {/* Right actions */}
          <div className="absolute right-0 inset-y-0 flex items-center pr-2 md:pr-0 space-x-3">
            {/* Collections + Mega (desktop) */}
            <div ref={megaRef} className="hidden md:flex items-center relative">
              <button
                onMouseEnter={openMega}
                onFocus={openMega}
                onMouseLeave={closeMegaDelayed}
                onBlur={closeMegaDelayed}
                aria-haspopup="true"
                aria-expanded={megaOpen}
                aria-controls="collections-mega"
                type="button"
                className="text-sm font-medium text-slate-900/90 hover:text-slate-900 transition-colors px-3 py-2 rounded-md"
              >
                Collections
              </button>

              {/* Mega dropdown */}
              <div
                id="collections-mega"
                onMouseEnter={openMega}
                onMouseLeave={closeMegaDelayed}
                className={`pointer-events-auto absolute right-0 top-full mt-3 w-[720px] max-w-[calc(100vw-2rem)] rounded-md border border-neutral-100 bg-white shadow-lg overflow-hidden transition-all duration-250 transform origin-top-right
                  ${megaOpen ? "opacity-100 translate-y-0 scale-100" : "opacity-0 -translate-y-2 scale-[0.996] pointer-events-none"}`}
                role="menu"
                aria-label="Collections menu"
              >
                <div className="flex w-full">
                  {/* Left column: links */}
                  <div className="w-1/2 p-4 sm:p-6">
                    <ul className="grid gap-2">
                      {COLLECTIONS.map((c) => (
                        <li key={c.id}>
                          <Link
                            href={c.href}
                            onMouseEnter={() => setPreview(c.img)}
                            onFocus={() => setPreview(c.img)}
                            onClick={() => setMegaOpen(false)}
                            className="block rounded-md px-3 py-2 text-sm text-slate-900/90 hover:bg-neutral-50 transition-colors"
                            role="menuitem"
                          >
                            {c.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Right column: preview */}
                  <div className="hidden md:block w-1/2 relative h-[260px] bg-neutral-50 flex items-center justify-center p-4">
                    {preview && (
                      <div className="relative w-full h-full rounded-sm overflow-hidden">
                        <Image
                          src={preview}
                          alt="Collection preview"
                          fill
                          sizes="(max-width:720px) 50vw, 360px"
                          className="object-cover"
                          priority={false}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* About */}
            <div className="hidden md:inline-flex">
              <Link
                href="/about"
                className="text-sm font-medium text-slate-900/90 hover:text-slate-900 transition-colors px-3 py-2 rounded-md"
              >
                About
              </Link>
            </div>

            {/* Cart */}
            <div className="relative">
              <button
                onClick={() => setOpen(true)}
                aria-label={`Open cart (${count || 0})`}
                className="inline-flex items-center justify-center rounded-full p-2 hover:bg-neutral-100 transition"
              >
                <ShoppingCart className="h-5 w-5 text-slate-900/90" />
              </button>

              {count > 0 && (
                <span className="absolute -right-2 -top-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-amber-400 px-1 text-xs font-semibold text-black shadow-sm">
                  {count}
                </span>
              )}
            </div>

            {/* Account */}
            <div className="flex items-center">
              <UserMenu />
            </div>

            {/* Mobile toggle */}
            <div className="md:hidden">
              <button
                className="inline-flex items-center justify-center rounded-md p-2"
                onClick={() => setMobileOpen((s) => !s)}
                aria-expanded={mobileOpen}
                aria-label={mobileOpen ? "Close menu" : "Open menu"}
              >
                <svg
                  className="h-6 w-6 text-slate-900"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  aria-hidden="true"
                >
                  <path
                    d={mobileOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile panel (collapsible) */}
      <div
        className={`md:hidden border-t border-neutral-100 bg-white/98 backdrop-blur-sm overflow-hidden transition-[max-height,opacity] duration-300 ease-in-out ${mobileOpen ? "max-h-[620px] opacity-100" : "max-h-0 opacity-0"}`}
        aria-hidden={!mobileOpen}
      >
        <div className="px-4 py-6 space-y-4">
          <Link
            href="/shop"
            className="block text-base font-medium text-slate-900"
            onClick={() => setMobileOpen(false)}
          >
            Shop
          </Link>
          <Link
            href="/blog"
            className="block text-base font-medium text-slate-900"
            onClick={() => setMobileOpen(false)}
          >
            Blogs
          </Link>
          <Link
            href="/gift-sets"
            className="block text-base font-medium text-slate-900"
            onClick={() => setMobileOpen(false)}
          >
            Gift Sets
          </Link>

          <details className="group">
            <summary className="flex items-center justify-between cursor-pointer text-base font-medium text-slate-900 list-none">
              <span>Collections</span>
              <span className="ml-3 text-slate-500 group-open:rotate-180 transition-transform">▾</span>
            </summary>
            <div className="mt-3 grid gap-3 pl-3">
              {COLLECTIONS.map((c) => (
                <Link
                  key={c.id}
                  href={c.href}
                  className="block text-sm text-slate-800/90"
                  onClick={() => setMobileOpen(false)}
                >
                  {c.label}
                </Link>
              ))}
            </div>
          </details>

          <Link
            href="/about"
            className="block text-base font-medium text-slate-900"
            onClick={() => setMobileOpen(false)}
          >
            About
          </Link>

          <div className="flex gap-3 items-center pt-2">
            <button
              onClick={() => {
                setOpen(true);
                setMobileOpen(false);
              }}
              className="flex items-center gap-2 text-sm"
            >
              <ShoppingCart className="h-5 w-5" /> <span>Cart ({count})</span>
            </button>

            <UserMenu onItemClick={() => setMobileOpen(false)} />
          </div>
        </div>
      </div>

      <style jsx>{`
        header {
          /* subtle glass look but remain crisp and white */
          background: linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(255, 255, 255, 0.94));
        }
        @media (prefers-reduced-motion: reduce) {
          .transition {
            transition: none !important;
          }
        }
        /* make sure sticky small transforms stay GPU accelerated */
        .will-change-transform {
          will-change: transform;
        }
      `}</style>
    </header>
  );
}
