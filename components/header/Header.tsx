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
    img: "/collections/planets-thumb.jpg",
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

export default function Header() {
  // assume useCart exists in your project (client hook)
  const { count = 0, setOpen } = useCart();

  const [hidden, setHidden] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [megaOpen, setMegaOpen] = useState(false);
  const [preview, setPreview] = useState<string | null>(COLLECTIONS[0].img);

  const lastY = useRef(0);
  const headerRef = useRef<HTMLElement | null>(null);
  const megaRef = useRef<HTMLDivElement | null>(null);
  const closeTimer = useRef<number | null>(null);

  // Hide header on scroll down (small, subtle)
  useEffect(() => {
    function onScroll() {
      const y = window.scrollY;
      setHidden(y > lastY.current && y > 80);
      lastY.current = y;
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Outside click / Escape closes mega and mobile
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

  // Prevent overlap: set body padding-top equal to header height.
  useEffect(() => {
    function updatePadding() {
      const h = headerRef.current?.offsetHeight ?? 64;
      // set CSS var and body padding
      document.documentElement.style.setProperty("--site-header-height", `${h}px`);
      // also set body padding-top so content is never overlapped
      (document.body.style as any).paddingTop = `${h}px`;
    }
    updatePadding();
    window.addEventListener("resize", updatePadding);
    return () => {
      window.removeEventListener("resize", updatePadding);
      // cleanup
      document.documentElement.style.removeProperty("--site-header-height");
      (document.body.style as any).paddingTop = "";
    };
  }, []);

  // helpers for hover open/close with small delay (and respect reduced motion)
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
    closeTimer.current = window.setTimeout(() => {
      setMegaOpen(false);
      closeTimer.current = null;
    }, 280);
  }

  return (
    <header
      ref={headerRef}
      className={`fixed inset-x-0 top-0 z-50 border-b border-black/8 backdrop-blur-md transition-transform duration-300 bg-white/70 ${hidden ? "-translate-y-full" : "translate-y-0"}`}
      role="banner"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative flex h-16 items-center">
          {/* left nav (desktop) */}
          <div className="absolute left-0 inset-y-0 flex items-center pl-2 md:pl-0">
            <nav className="hidden md:flex items-center gap-6 px-4">
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

          {/* center brand */}
          <div className="mx-auto flex items-center justify-center">
            <Link href="/" className="inline-flex items-center" aria-label="Anand Ras – Home">
              <Image
                src={LOGO_PATH}
                alt="Anand Ras"
                width={300}
                height={80}
                className="h-9 w-auto object-contain sm:h-10 md:h-11"
                priority
              />
            </Link>
          </div>

          {/* right actions */}
          <div className="absolute right-0 inset-y-0 flex items-center pr-2 md:pr-0 space-x-3">
            {/* Collections (desktop) */}
            <div ref={megaRef} className="hidden md:flex items-center relative">
              <button
                onMouseEnter={openMega}
                onFocus={openMega}
                onMouseLeave={closeMegaDelayed}
                onBlur={closeMegaDelayed}
                aria-haspopup="true"
                aria-expanded={megaOpen}
                className="text-sm font-medium text-slate-900/90 hover:text-slate-900 transition-colors px-3 py-2 rounded-md"
                aria-controls="collections-mega"
                type="button"
              >
                Collections
              </button>

              {/* Mega dropdown */}
              <div
                id="collections-mega"
                onMouseEnter={openMega}
                onMouseLeave={closeMegaDelayed}
                className={`pointer-events-auto absolute right-0 top-full mt-3 w-[680px] max-w-[calc(100vw-2rem)] rounded-2xl border border-white/20 bg-white/60 backdrop-blur-lg shadow-lg overflow-hidden transition-all duration-300 transform origin-top-right
                  ${megaOpen ? "opacity-100 translate-y-0 scale-100" : "opacity-0 -translate-y-2 scale-[0.995] pointer-events-none"}`}
                role="menu"
                aria-label="Collections menu"
              >
                <div className="flex flex-col md:flex-row w-full">
                  {/* left list */}
                  <div className="w-full md:w-1/2 p-4 sm:p-6">
                    <ul className="grid gap-2">
                      {COLLECTIONS.map((c) => (
                        <li key={c.id}>
                          <Link
                            href={c.href}
                            onMouseEnter={() => setPreview(c.img)}
                            onFocus={() => setPreview(c.img)}
                            onClick={() => setMegaOpen(false)}
                            className="block rounded-md px-3 py-2 text-sm text-slate-900/90 hover:bg-white/30 transition-colors"
                            role="menuitem"
                          >
                            {c.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* right preview */}
                  <div className="hidden md:block w-1/2 relative h-[220px] sm:h-[240px] bg-gradient-to-tr from-white/40 to-white/10 flex items-center justify-center">
                    {preview && (
                      <div className="relative w-full h-full p-4">
                        <Image
                          src={preview}
                          alt="Collection preview"
                          fill
                          sizes="(max-width:680px) 50vw, 340px"
                          className="object-cover rounded-xl"
                          priority
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
            <button
              onClick={() => setOpen(true)}
              aria-label={`Open cart (${count || 0})`}
              className="inline-flex items-center justify-center rounded-full p-2 hover:bg-white/40 transition"
            >
              <ShoppingCart className="h-5 w-5 text-slate-900/90" />
              {count > 0 && (
                <span className="absolute -right-2 -top-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-amber-400 px-1 text-xs text-black">
                  {count}
                </span>
              )}
            </button>

            {/* Account */}
            <UserMenu />

            {/* Mobile toggle */}
            <button
              className="md:hidden inline-flex items-center justify-center rounded-md p-2"
              onClick={() => setMobileOpen((s) => !s)}
              aria-expanded={mobileOpen}
              aria-label="Toggle menu"
            >
              <svg
                className="h-6 w-6 text-slate-900"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
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

      {/* Mobile panel */}
      <div
        className={`md:hidden border-t border-white/12 bg-white/96 backdrop-blur-md overflow-hidden transition-all duration-300 ${mobileOpen ? "max-h-[520px] opacity-100" : "max-h-0 opacity-0"}`}
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
              className="flex items-center gap-2"
            >
              <ShoppingCart className="h-5 w-5" /> <span>Cart ({count})</span>
            </button>

            <UserMenu onItemClick={() => setMobileOpen(false)} />
          </div>
        </div>
      </div>

      {/* small inline styles (kept minimal) */}
      <style jsx>{`
        header {
          background: linear-gradient(180deg, rgba(255, 255, 255, 0.82), rgba(255, 255, 255, 0.66));
        }
        @media (prefers-reduced-motion: reduce) {
          .transition {
            transition: none !important;
          }
        }
      `}</style>
    </header>
  );
}
