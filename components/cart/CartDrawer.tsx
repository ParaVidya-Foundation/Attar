"use client";

import React, { useCallback, useEffect, useRef, useState, JSX } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { FocusTrap } from "@/components/ui/FocusTrap";
import { Button } from "@/components/ui/Button";
import { useCart } from "./CartProvider";

declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => {
      open: () => void;
      on: (event: string, cb: () => void) => void;
    };
  }
}

function formatINR(v: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(v);
}

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window !== "undefined" && window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export function CartDrawer(): JSX.Element | null {
  const cart = (typeof useCart === "function" ? useCart() : null) ?? {
    open: false,
    setOpen: (_: boolean) => {},
    lines: [],
    total: 0,
    remove: (_id: string, _ml?: number) => {},
    setQty: (_id: string, _ml: number | undefined, _qty: number) => {},
    clear: () => {},
  };

  const { open, setOpen, lines, total, remove, setQty, clear } = cart;
  const router = useRouter();
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const closeBtnRef = useRef<HTMLButtonElement | null>(null);

  const handleCheckout = useCallback(async () => {
    if (lines.length === 0) return;
    setCheckoutError(null);
    setCheckoutLoading(true);

    try {
      const payload = {
        items: lines.map((l) => ({
          productId: l.id,
          size_ml: l.ml || 3,
          qty: l.qty,
        })),
      };

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.status === 401) {
        setOpen(false);
        router.push("/login");
        return;
      }

      const data = await res.json();
      if (!res.ok) {
        setCheckoutError(data.error ?? "Order creation failed");
        return;
      }

      const loaded = await loadRazorpayScript();
      if (!loaded) {
        setCheckoutError("Payment system could not load. Please try again.");
        return;
      }

      const options: Record<string, unknown> = {
        key: data.keyId,
        amount: data.amount,
        currency: data.currency ?? "INR",
        name: "Kamal Vallabh",
        description: "Luxury Attar Order",
        order_id: data.razorpayOrderId,
        handler: async (response: {
          razorpay_order_id: string;
          razorpay_payment_id: string;
          razorpay_signature: string;
        }) => {
          try {
            const verifyRes = await fetch("/api/orders/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(response),
            });

            if (verifyRes.ok) {
              clear();
              setOpen(false);
              router.push("/account/orders");
              router.refresh();
            } else {
              setCheckoutError("Payment verification failed. Contact support if charged.");
            }
          } catch {
            setCheckoutError("Verification error. Your payment is safe — check your orders.");
          }
        },
        prefill: {},
        theme: { color: "#1e2023" },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", () => {
        setCheckoutError("Payment failed. Please try again.");
      });
      rzp.open();
    } catch {
      setCheckoutError("Something went wrong. Please try again.");
    } finally {
      setCheckoutLoading(false);
    }
  }, [lines, clear, setOpen, router]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }

    if (open) {
      document.addEventListener("keydown", onKey);
      // lock scroll while open
      const prevOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.removeEventListener("keydown", onKey);
        document.body.style.overflow = prevOverflow;
      };
    }

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, setOpen]);

  // if closed, render nothing
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[90] flex items-stretch" role="presentation" aria-hidden={!open}>
      {/* Overlay */}
      <button
        aria-label="Close cart overlay"
        onClick={() => setOpen(false)}
        className="absolute inset-0 bg-black/35 backdrop-blur-sm transition-opacity duration-300 hover:bg-black/40"
        style={{ WebkitTapHighlightColor: "transparent" }}
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
          aria-label="Shopping cart"
          className="relative ml-auto w-full max-w-md h-screen
                     top-[var(--site-header-height,0px)]
                     border-l border-white/12
                     bg-white/70 backdrop-blur-lg
                     shadow-2xl
                     overflow-hidden
                     transform translate-x-0
                     "
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/12">
            <div>
              <p className="text-xs font-semibold tracking-[0.26em] text-gray-500">CART</p>
              <div className="mt-1 font-serif text-lg text-gray-900">Your cart</div>
            </div>

            <div className="flex items-center gap-3">
              <button
                ref={closeBtnRef}
                onClick={() => setOpen(false)}
                aria-label="Close cart"
                className="rounded-full border border-white/10 bg-white/60 px-3 py-2 text-sm font-medium text-gray-900 hover:bg-white/70 transition"
              >
                Close
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex h-[calc(100%-72px)] flex-col">
            <div className="flex-1 overflow-auto px-6 py-5 space-y-4">
              {lines.length === 0 ? (
                <div className="text-sm text-gray-700">
                  Your cart is empty. Add an item to begin a quiet ritual.
                </div>
              ) : (
                <ul className="grid gap-3">
                  {lines.map((l) => (
                    <li
                      key={`${l.id}:${l.ml}`}
                      className="flex gap-3 rounded-2xl border border-white/12 bg-white/55 p-3"
                    >
                      <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl bg-gray-50">
                        {l.imageUrl ? (
                          <Image src={l.imageUrl} alt={l.name} fill className="object-cover" sizes="64px" />
                        ) : (
                          <div className="h-full w-full bg-gray-100" />
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <p className="truncate font-serif text-base text-gray-900">{l.name}</p>
                          <p className="text-sm font-medium text-gray-900">
                            {formatINR((l.price ?? 0) * (l.qty ?? 1))}
                          </p>
                        </div>

                        <p className="mt-1 text-xs font-semibold tracking-[0.18em] text-gray-500">
                          {l.ml} ml • {formatINR(l.price)}
                        </p>

                        <div className="mt-3 flex items-center gap-3">
                          <label htmlFor={`qty-${l.id}-${l.ml}`} className="sr-only">
                            Quantity
                          </label>

                          <div className="inline-flex items-center rounded-full border border-white/12 bg-white/60">
                            <button
                              type="button"
                              aria-label={`Decrease quantity for ${l.name}`}
                              onClick={() => setQty(l.id, l.ml, Math.max(1, (l.qty ?? 1) - 1))}
                              className="px-3 py-2 text-sm hover:bg-white/70 transition"
                            >
                              −
                            </button>

                            <input
                              id={`qty-${l.id}-${l.ml}`}
                              inputMode="numeric"
                              pattern="[0-9]*"
                              value={String(l.qty ?? 1)}
                              onChange={(e) => {
                                const n = Math.max(1, Number(e.target.value.replace(/\D/g, "")) || 1);
                                setQty(l.id, l.ml, n);
                              }}
                              className="h-9 w-16 bg-transparent text-center text-sm appearance-none px-2"
                            />

                            <button
                              type="button"
                              aria-label={`Increase quantity for ${l.name}`}
                              onClick={() => setQty(l.id, l.ml, (l.qty ?? 1) + 1)}
                              className="px-3 py-2 text-sm hover:bg-white/70 transition"
                            >
                              +
                            </button>
                          </div>

                          <button
                            type="button"
                            onClick={() => remove(l.id, l.ml)}
                            className="text-sm text-gray-700 underline decoration-gray-200 underline-offset-4"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-white/12 px-6 py-5">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">Subtotal</p>
                <p className="font-serif text-lg text-gray-900">{formatINR(total)}</p>
              </div>

              <div className="mt-4 grid gap-3">
                {checkoutError && (
                  <div className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">
                    {checkoutError}
                  </div>
                )}

                <Button
                  type="button"
                  onClick={handleCheckout}
                  disabled={lines.length === 0 || checkoutLoading}
                >
                  {checkoutLoading ? "Processing…" : "Checkout"}
                </Button>

                <Button type="button" variant="secondary" onClick={clear} disabled={lines.length === 0}>
                  Clear cart
                </Button>
              </div>
            </div>
          </div>
        </aside>
      </FocusTrap>

      {/* small CSS animations, respects reduced motion */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @media (prefers-reduced-motion: reduce) {
          .animate-fade-in,
          .animate-slide-in {
            animation: none !important;
          }
        }

        /* keyframes used if you want to tag elements with these classes */
        @keyframes slideInRight {
          from {
            transform: translateX(18px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
      `,
        }}
      />
    </div>
  );
}

export default CartDrawer;
