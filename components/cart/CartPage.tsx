"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "./CartProvider";
import { Button } from "@/components/ui/Button";

/**
 * CartPage — Minimal, performant, accessible cart UI
 * - Mobile-first responsive layout
 * - Sticky summary on large screens
 * - Quantity +/- controls and remove
 * - Glassmorphism touches
 */

function formatINR(v: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(v);
}

export default function CartPage() {
  const cart = useCart?.() ?? null;
  // defensive defaults if provider is not present (prevents white-screen)
  const lines = cart?.lines ?? [];
  const total = cart?.total ?? 0;
  const remove = cart?.remove ?? (() => {});
  const setQty = cart?.setQty ?? (() => {});
  const clear = cart?.clear ?? (() => {});

  return (
    <main className="w-full px-4 sm:px-6 lg:px-8 py-10">
      <div className="mx-auto max-w-5xl">
        <header className="mb-8">
          <p className="text-xs font-semibold tracking-[0.26em] text-gray-500">CART</p>
          <h1 className="mt-4 font-serif text-3xl sm:text-4xl tracking-tight text-gray-900">Your cart</h1>
          <p className="mt-3 text-sm text-gray-600">
            Frontend demo cart — stored client-side. Integrate with your checkout backend (Stripe / Razorpay)
            for production.
          </p>
        </header>

        {lines.length === 0 ? (
          <section
            aria-label="Empty cart"
            className="rounded-2xl border border-gray-200/60 bg-white/60 p-6 flex flex-col gap-6"
          >
            <p className="text-sm text-gray-700">Your cart is empty.</p>
            <div className="flex gap-3">
              <Link
                href="/shop"
                className="inline-flex items-center justify-center rounded-full bg-black px-5 py-2 text-sm font-semibold text-white hover:opacity-95 transition"
              >
                Shop products
              </Link>
              <Link
                href="/"
                className="inline-flex items-center justify-center rounded-full border border-gray-200 px-5 py-2 text-sm text-gray-700 hover:bg-gray-50 transition"
              >
                Continue browsing
              </Link>
            </div>
          </section>
        ) : (
          <div className="grid gap-8 lg:grid-cols-12">
            {/* Cart lines */}
            <section className="lg:col-span-8" aria-labelledby="cart-lines-title">
              <h2 id="cart-lines-title" className="sr-only">
                Cart items
              </h2>

              <ul className="space-y-4">
                {lines.map((l) => (
                  <li
                    key={`${l.id}:${l.ml}`}
                    className="rounded-2xl border border-gray-200/60 bg-white/60 p-4"
                    role="group"
                    aria-label={`${l.name} ${l.ml}ml`}
                  >
                    <div className="flex gap-4 items-center">
                      <div className="relative h-20 w-20 flex-shrink-0 rounded-xl overflow-hidden bg-gray-50">
                        {l.imageUrl ? (
                          <Image
                            src={l.imageUrl}
                            alt={l.name}
                            width={80}
                            height={80}
                            className="object-cover"
                          />
                        ) : (
                          <div className="h-full w-full bg-gray-100" />
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="truncate font-serif text-lg text-gray-900">{l.name}</p>
                        <p className="mt-1 text-xs font-semibold tracking-[0.18em] text-gray-500">
                          {l.ml} ml • {formatINR(l.price)}
                        </p>

                        <div className="mt-4 flex flex-wrap items-center gap-3">
                          <label htmlFor={`qty-${l.id}-${l.ml}`} className="sr-only">
                            Quantity for {l.name}
                          </label>

                          {/* quantity control */}
                          <div className="inline-flex items-center rounded-full border border-gray-200 overflow-hidden">
                            <button
                              aria-label={`Decrease quantity for ${l.name}`}
                              className="px-3 py-2 text-sm hover:bg-gray-50"
                              onClick={() => setQty(l.variantId ?? l.id, l.ml, Math.max(1, (l.qty ?? 1) - 1))}
                              type="button"
                            >
                              −
                            </button>
                            <input
                              id={`qty-${l.id}-${l.ml}`}
                              type="number"
                              min={1}
                              value={String(l.qty ?? 1)}
                              onChange={(e) => {
                                const n = Math.max(1, Number(e.target.value || 1));
                                setQty(l.variantId ?? l.id, l.ml, Number.isFinite(n) ? n : 1);
                              }}
                              className="h-10 w-20 px-3 text-center text-sm appearance-none bg-transparent"
                            />
                            <button
                              aria-label={`Increase quantity for ${l.name}`}
                              className="px-3 py-2 text-sm hover:bg-gray-50"
                              onClick={() => setQty(l.variantId ?? l.id, l.ml, (l.qty ?? 1) + 1)}
                              type="button"
                            >
                              +
                            </button>
                          </div>

                          <button
                            type="button"
                            onClick={() => remove(l.variantId ?? l.id, l.ml)}
                            className="text-sm font-medium text-gray-700 underline decoration-gray-300 underline-offset-4"
                          >
                            Remove
                          </button>
                        </div>
                      </div>

                      <div className="flex-shrink-0 text-right">
                        <p className="font-serif text-lg text-gray-900">
                          {formatINR((l.price ?? 0) * (l.qty ?? 1))}
                        </p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </section>

            {/* Summary */}
            <aside className="lg:col-span-4 lg:sticky lg:top-24" aria-labelledby="summary-title">
              <div className="rounded-2xl border border-gray-200/60 bg-white/65 p-6 backdrop-blur-sm">
                <h3 id="summary-title" className="text-xs font-semibold tracking-[0.22em] text-gray-500">
                  SUMMARY
                </h3>

                <div className="mt-4 flex items-center justify-between">
                  <p className="text-sm text-gray-700">Subtotal</p>
                  <p className="font-serif text-2xl text-gray-900">{formatINR(total)}</p>
                </div>

                <div className="mt-6 grid gap-3">
                  <Button
                    type="button"
                    onClick={() => alert("Checkout placeholder — implement backend flow")}
                  >
                    Checkout
                  </Button>

                  <Button type="button" variant="secondary" onClick={clear}>
                    Clear cart
                  </Button>

                  <div className="mt-2 text-xs text-gray-600">
                    For production: create a backend checkout session (Stripe/Razorpay). Do not expose secrets
                    on client.
                  </div>
                </div>
              </div>
            </aside>
          </div>
        )}
      </div>
    </main>
  );
}
