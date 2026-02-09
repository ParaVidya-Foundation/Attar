"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { useCart } from "./CartProvider";
import { FocusTrap } from "@/components/ui/FocusTrap";
import { Button } from "@/components/ui/Button";

function formatINR(v: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(v);
}

export function CartDrawer() {
  const { open, setOpen, lines, total, remove, setQty, clear } = useCart();
  const panelRef = useRef<HTMLDivElement | null>(null);
  const closeBtnRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    if (open) {
      document.addEventListener("keydown", onKey);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, setOpen]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[90] animate-fade-in" aria-hidden={!open}>
      <button
        type="button"
        aria-label="Close cart overlay"
        className="absolute inset-0 bg-ink/35"
        onClick={() => setOpen(false)}
      />

      <FocusTrap
        active={open}
        containerRef={panelRef}
        initialFocusRef={closeBtnRef}
        onEscape={() => setOpen(false)}
      >
        <aside
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-label="Cart drawer"
          className="absolute right-0 top-0 h-full w-full max-w-md border-l border-ash/50 bg-cream shadow-card animate-slide-in-right"
        >
          <div className="flex items-center justify-between border-b border-ash/50 px-6 py-5">
            <p className="font-serif text-xl text-ink">Your cart</p>
            <button
              ref={closeBtnRef}
              type="button"
              className="rounded-full border border-ash/60 bg-white/50 px-4 py-2 text-sm font-semibold text-ink hover:bg-cream/70"
              onClick={() => setOpen(false)}
            >
              Close
            </button>
          </div>

          <div className="flex h-[calc(100%-72px)] flex-col">
            <div className="flex-1 overflow-auto px-6 py-5">
              {lines.length === 0 ? (
                <p className="text-sm leading-7 text-charcoal/85">
                  Your cart is empty. Add an attar to begin a quiet ritual.
                </p>
              ) : (
                <ul className="grid gap-4">
                  {lines.map((l) => (
                    <li key={`${l.id}:${l.ml}`} className="rounded-3xl border border-ash/50 bg-white/55 p-4">
                      <div className="flex gap-4">
                        <div className="relative h-16 w-16 overflow-hidden rounded-2xl bg-white">
                          {l.imageUrl ? (
                            <Image
                              src={l.imageUrl}
                              alt={l.name}
                              fill
                              className="object-cover"
                              sizes="64px"
                              loading="lazy"
                            />
                          ) : null}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-serif text-base text-ink">{l.name}</p>
                          <p className="mt-1 text-xs font-semibold tracking-[0.18em] text-charcoal/70">
                            {l.ml}ml • {formatINR(l.price)}
                          </p>
                          <div className="mt-3 flex items-center gap-2">
                            <label className="sr-only" htmlFor={`qty-${l.id}-${l.ml}`}>
                              Quantity
                            </label>
                            <input
                              id={`qty-${l.id}-${l.ml}`}
                              inputMode="numeric"
                              pattern="[0-9]*"
                              className="h-10 w-20 rounded-full border border-ash/60 bg-cream/60 px-4 text-sm text-ink"
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
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="border-t border-ash/50 px-6 py-5">
              <div className="flex items-center justify-between">
                <p className="text-sm text-charcoal/80">Subtotal</p>
                <p className="font-serif text-xl text-ink">{formatINR(total)}</p>
              </div>
              <div className="mt-4 grid gap-3">
                <Button type="button" onClick={() => setOpen(false)} disabled={lines.length === 0}>
                  Continue shopping
                </Button>
                <Button type="button" variant="secondary" onClick={clear} disabled={lines.length === 0}>
                  Clear cart
                </Button>
                <p className="text-xs leading-6 text-charcoal/75">
                  Demo build: checkout is UI-only. Integrate a backend checkout to take payments securely.
                </p>
              </div>
            </div>
          </div>
        </aside>
      </FocusTrap>
    </div>
  );
}
