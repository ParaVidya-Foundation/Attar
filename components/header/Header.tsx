"use client";

import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { useCart } from "@/components/cart/CartProvider";
import { ShoppingCart, User } from "lucide-react";

const COLLECTIONS = [
  { href: "/collections/planets", label: "Planets" },
  { href: "/collections/zodiac", label: "Zodiac" },
  { href: "/collections/stress", label: "Stress" },
  { href: "/collections/divine", label: "Divine" },
] as const;

export default function Header() {
  const { count, setOpen } = useCart();

  const [hidden, setHidden] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collectionsOpen, setCollectionsOpen] = useState(false);

  const lastY = useRef(0);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Hide header on scroll down
  useEffect(() => {
    function onScroll() {
      const y = window.scrollY;
      setHidden(y > lastY.current && y > 80);
      lastY.current = y;
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setCollectionsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const NavLink = ({ href, label }: { href: string; label: string }) => (
    <Link href={href} className="relative text-sm font-medium text-ink/90 transition-colors hover:text-ink">
      <span className="after:absolute after:left-0 after:-bottom-1 after:h-[1px] after:w-0 after:bg-gold after:transition-all after:duration-300 hover:after:w-full">
        {label}
      </span>
    </Link>
  );

  return (
    <header
      className={`fixed top-0 z-50 w-full border-b border-ash/40 bg-cream/80 backdrop-blur-md transition-transform duration-300 ${
        hidden ? "-translate-y-full" : "translate-y-0"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="absolute left-1/2 -translate-x-1/2 font-serif text-lg tracking-[0.08em] text-ink"
        >
          Sugandha Manjiri
        </Link>
        {/* LEFT */}
        <div className="hidden items-center gap-6 md:flex">
          <NavLink href="/shop" label="Shop" />
          <NavLink href="/blog" label="Blogs" />
          <NavLink href="/GiftSet" label="Gift Sets" />
        </div>

        {/* MOBILE MENU BUTTON */}
        <button className="md:hidden" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Toggle menu">
          <div className="space-y-1.5">
            <span className="block h-[2px] w-6 bg-ink"></span>
            <span className="block h-[2px] w-6 bg-ink"></span>
            <span className="block h-[2px] w-6 bg-ink"></span>
          </div>
        </button>

        {/* RIGHT */}
        <div className="hidden items-center gap-6 md:flex" ref={dropdownRef}>
          {/* Collections Dropdown */}
          <div className="relative">
            <button
              onClick={() => setCollectionsOpen(!collectionsOpen)}
              className="relative text-sm font-medium text-ink/90 hover:text-ink"
              aria-expanded={collectionsOpen}
            >
              Collections
            </button>

            <div
              className={`absolute right-0 mt-4 w-44 rounded-xl border border-ash/40 bg-cream shadow-lg transition-all duration-200 ${
                collectionsOpen ? "visible translate-y-0 opacity-100" : "invisible -translate-y-2 opacity-0"
              }`}
            >
              {COLLECTIONS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="block px-4 py-2 text-sm text-ink/90 hover:bg-cream/70"
                  onClick={() => setCollectionsOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          <NavLink href="/about" label="About Us" />

          {/* Cart */}
          <button
            onClick={() => setOpen(true)}
            className="relative text-sm font-medium text-ink hover:text-ink"
            aria-label={`Cart with ${count} items`}
          >
            <ShoppingCart className="h-4 w-4" />
            {count > 0 && (
              <span className="absolute -right-3 -top-2 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-gold px-1 text-xs text-white">
                {count}
              </span>
            )}
          </button>

          {/* Account */}
          <Link href="/account" className="text-sm font-medium text-ink/90 hover:text-ink">
            <User className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {/* MOBILE MENU */}
      <div
        className={`md:hidden overflow-hidden border-t border-ash/30 bg-cream transition-all duration-300 ${
          mobileOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <nav className="flex flex-col gap-4 px-6 py-6 text-sm">
          <Link href="/shop" onClick={() => setMobileOpen(false)}>
            Shop
          </Link>
          <Link href="/blog" onClick={() => setMobileOpen(false)}>
            Blogs
          </Link>

          {/* Mobile Collections */}
          <div>
            <button
              className="flex w-full justify-between"
              onClick={() => setCollectionsOpen(!collectionsOpen)}
            >
              Collections
              <span>{collectionsOpen ? "-" : "+"}</span>
            </button>

            {collectionsOpen && (
              <div className="mt-2 flex flex-col gap-2 pl-4 text-ink/80">
                {COLLECTIONS.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => {
                      setMobileOpen(false);
                      setCollectionsOpen(false);
                    }}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            )}
          </div>

          <Link href="/about" onClick={() => setMobileOpen(false)}>
            About Us
          </Link>

          <button
            onClick={() => {
              setOpen(true);
              setMobileOpen(false);
            }}
          >
            <ShoppingCart className="h-4 w-4" /> Cart ({count})
          </button>

          <Link href="/account" onClick={() => setMobileOpen(false)}>
            <User className="h-4 w-4" />
          </Link>
        </nav>
      </div>
    </header>
  );
}
