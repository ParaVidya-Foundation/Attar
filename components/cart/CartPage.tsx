"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "./CartProvider";
import { Button } from "@/components/ui/Button";

function formatINR(v: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(v);
}

export function CartPage() {
  const { lines, total, remove, setQty, clear } = useCart();

  return (
    <div className="py-12 sm:py-16">
      <header className="max-w-2xl">
        <p className="text-xs font-semibold tracking-[0.26em] text-charcoal/70">CART</p>
        <h1 className="mt-4 font-serif text-4xl tracking-tight text-ink sm:text-5xl">Your cart</h1>
        <p className="mt-4 text-sm leading-7 text-charcoal/85 sm:text-base">
          Frontend-only cart stored in local storage.
        </p>
      </header>

      {lines.length === 0 ? (
        <div className="mt-10 rounded-3xl border border-ash/50 bg-white/55 p-8">
          <p className="text-sm text-charcoal/85">Your cart is empty.</p>
          <div className="mt-6">
            <Link
              href="/shop"
              className="inline-flex items-center justify-center rounded-full bg-ink px-6 py-3 text-sm font-semibold text-cream hover:bg-ink/95"
            >
              Shop attars
            </Link>
          </div>
        </div>
      ) : (
        <div className="mt-10 grid gap-10 lg:grid-cols-12">
          <section className="lg:col-span-8" aria-label="Cart lines">
            <ul className="grid gap-4">
              {lines.map((l) => (
                <li key={`${l.id}:${l.ml}`} className="rounded-3xl border border-ash/50 bg-white/55 p-5">
                  <div className="flex gap-4">
                    <div className="relative h-20 w-20 overflow-hidden rounded-3xl bg-white">
                      {l.imageUrl ? (
                        <Image src={l.imageUrl} alt={l.name} fill className="object-cover" sizes="80px" />
                      ) : null}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-serif text-xl text-ink">{l.name}</p>
                      <p className="mt-1 text-xs font-semibold tracking-[0.18em] text-charcoal/70">
                        {l.ml}ml • {formatINR(l.price)}
                      </p>
                      <div className="mt-4 flex flex-wrap items-center gap-3">
                        <label
                          className="text-xs font-semibold tracking-[0.18em] text-charcoal/70"
                          htmlFor={`qty-${l.id}-${l.ml}`}
                        >
                          QTY
                        </label>
                        <input
                          id={`qty-${l.id}-${l.ml}`}
                          className="h-11 w-24 rounded-full border border-ash/60 bg-cream/60 px-4 text-sm text-ink"
                          value={String(l.qty)}
                          onChange={(e) => {
                            const n = Number(e.target.value.replace(/\D/g, "")) || 1;
                            setQty(l.id, l.ml, n);
                          }}
                        />
                        <button
                          type="button"
                          className="text-sm font-semibold text-ink underline decoration-gold/60 underline-offset-4"
                          onClick={() => remove(l.id, l.ml)}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                    <p className="font-serif text-lg text-ink">{formatINR(l.price * l.qty)}</p>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          <aside className="lg:col-span-4 lg:sticky lg:top-24">
            <div className="rounded-3xl border border-ash/50 bg-white/55 p-6">
              <p className="text-xs font-semibold tracking-[0.22em] text-charcoal/70">SUMMARY</p>
              <div className="mt-4 flex items-center justify-between">
                <p className="text-sm text-charcoal/85">Subtotal</p>
                <p className="font-serif text-2xl text-ink">{formatINR(total)}</p>
              </div>
              <div className="mt-6 grid gap-3">
                <Button type="button">Checkout (UI only)</Button>
                <Button type="button" variant="secondary" onClick={clear}>
                  Clear cart
                </Button>
                <p className="text-xs leading-6 text-charcoal/75">
                  For production: create a backend checkout session (Stripe/Razorpay), do not expose secrets
                  in the client.
                </p>
              </div>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
