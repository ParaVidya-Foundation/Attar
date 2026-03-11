"use client";

import React, { useEffect, useRef, JSX, useCallback, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { FocusTrap } from "@/components/ui/FocusTrap";
import { Button } from "@/components/ui/Button";
import ProductCard, { type Product as CardProduct } from "@/components/shop/ProductCard";
import { useCart } from "./CartProvider";

function formatINR(paise: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(paise / 100);
}

export function CartDrawer(): JSX.Element | null {
  const cart = (typeof useCart === "function" ? useCart() : null) ?? {
    open: false,
    setOpen: (_: boolean) => {},
    lastAddedProductId: null,
    lines: [],
    total: 0,
    remove: (_id: string, _ml?: number) => {},
    setQty: (_id: string, _ml: number | undefined, _qty: number) => {},
    clear: () => {},
  };

  const { open, setOpen, lastAddedProductId, lines, total, remove, setQty, clear } = cart;
  const router = useRouter();

  const panelRef = useRef<HTMLDivElement | null>(null);
  const closeBtnRef = useRef<HTMLButtonElement | null>(null);
  const [upsellProducts, setUpsellProducts] = useState<CardProduct[]>([]);
  const [upsellLoading, setUpsellLoading] = useState(false);

  const handleCheckout = useCallback(() => {
    if (!lines.length) return;
    setOpen(false);
    router.push("/checkout?mode=cart");
  }, [lines.length, router, setOpen]);

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

  useEffect(() => {
    if (!open || !lastAddedProductId) return;

    const controller = new AbortController();
    const excludeIds = [...new Set(lines.map((line) => line.id))];

    setUpsellLoading(true);

    void fetch(
      `/api/recommendations/cart?productId=${encodeURIComponent(lastAddedProductId)}&${excludeIds
        .map((id) => `exclude=${encodeURIComponent(id)}`)
        .join("&")}`,
      {
        signal: controller.signal,
      },
    )
      .then(async (response) => {
        if (!response.ok) return { products: [] };
        return response.json() as Promise<{ products?: CardProduct[] }>;
      })
      .then((data) => {
        setUpsellProducts(data.products ?? []);
      })
      .catch(() => {
        setUpsellProducts([]);
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setUpsellLoading(false);
        }
      });

    return () => controller.abort();
  }, [open, lastAddedProductId, lines]);

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
          className="relative ml-auto w-full sm:max-w-xl h-screen
                     top-[var(--site-header-height,0px)]
                     border-l border-black/10
                     bg-white
                     shadow-2xl
                     overflow-hidden
                     animate-[cartDrawerSlide_.32s_cubic-bezier(0.22,1,0.36,1)]
                     "
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-black/10 px-6 py-4">
            <div>
              <p className="text-xs font-semibold tracking-[0.26em] text-gray-500">CART</p>
              <div className="mt-1 font-heading text-lg text-gray-900">Your cart</div>
            </div>

            <div className="flex items-center gap-3">
              <button
                ref={closeBtnRef}
                onClick={() => setOpen(false)}
                aria-label="Close cart"
                className="border border-black/10 px-3 py-2 text-sm font-medium text-gray-900 transition hover:bg-neutral-50"
              >
                Close
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex h-[calc(100%-72px)] flex-col">
            <div className="flex-1 overflow-auto px-6 py-5">
              {lines.length === 0 ? (
                <div className="text-sm text-gray-700">
                  Your cart is empty. Add an item to begin a quiet ritual.
                </div>
              ) : (
                <div className="space-y-8">
                  <ul className="grid gap-3">
                    {lines.map((l) => (
                      <li
                        key={`${l.id}:${l.ml}`}
                        className="flex flex-col gap-3 border border-black/10 bg-white p-3 sm:flex-row"
                      >
                        <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden bg-gray-50">
                        {l.imageUrl ? (
                          <Image src={l.imageUrl} alt={l.name} fill className="object-cover" sizes="64px" />
                        ) : (
                          <div className="h-full w-full bg-gray-100" />
                        )}
                        </div>

                        <div className="min-w-0 flex-1 w-full">
                          <div className="flex items-start justify-between gap-2">
                            <p className="truncate font-heading text-sm text-gray-900 sm:text-base">{l.name}</p>
                            <p className="shrink-0 text-sm font-medium text-gray-900">
                              {formatINR((l.price ?? 0) * (l.qty ?? 1))}
                            </p>
                          </div>

                          <p className="mt-1 text-xs font-semibold tracking-[0.18em] text-gray-500">
                            {l.ml} ml • {formatINR(l.price)}
                          </p>

                          <div className="mt-3 flex flex-wrap items-center gap-2 sm:gap-3">
                            <label htmlFor={`qty-${l.id}-${l.ml}`} className="sr-only">
                              Quantity
                            </label>

                            <div className="inline-flex items-center border border-black/10 bg-white">
                              <button
                                type="button"
                                aria-label={`Decrease quantity for ${l.name}`}
                                onClick={() => setQty(l.variantId ?? l.id, l.ml, Math.max(1, (l.qty ?? 1) - 1))}
                                className="px-3 py-2 text-sm transition hover:bg-neutral-50"
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
                                  setQty(l.variantId ?? l.id, l.ml, n);
                                }}
                                className="h-9 w-16 appearance-none bg-transparent px-2 text-center text-sm"
                              />

                              <button
                                type="button"
                                aria-label={`Increase quantity for ${l.name}`}
                                onClick={() => setQty(l.variantId ?? l.id, l.ml, (l.qty ?? 1) + 1)}
                                className="px-3 py-2 text-sm transition hover:bg-neutral-50"
                              >
                                +
                              </button>
                            </div>

                            <button
                              type="button"
                              onClick={() => remove(l.variantId ?? l.id, l.ml)}
                              className="text-sm text-gray-700 underline decoration-gray-200 underline-offset-4"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>

                  {(upsellLoading || upsellProducts.length > 0) && (
                    <section aria-labelledby="cart-upsell-heading" className="border-t border-black/10 pt-8">
                      <div className="mb-5">
                        <p className="text-xs font-semibold tracking-[0.26em] text-gray-500">UPSELL</p>
                        <h2 id="cart-upsell-heading" className="mt-2 font-heading text-xl text-black">
                          Complete Your Ritual
                        </h2>
                      </div>

                      {upsellLoading ? (
                        <div className="grid grid-cols-2 gap-4">
                          {Array.from({ length: 2 }).map((_, index) => (
                            <div key={index} className="aspect-[0.78] animate-pulse border border-black/10 bg-neutral-100" />
                          ))}
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 gap-4">
                          {upsellProducts.map((product, index) => (
                            <div
                              key={product.id}
                              className="animate-[cartUpsellFade_.4s_ease-out_both]"
                              style={{ animationDelay: `${index * 80}ms` }}
                            >
                              <ProductCard product={product} />
                            </div>
                          ))}
                        </div>
                      )}
                    </section>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-black/10 px-6 py-5">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">Subtotal</p>
                <p className="font-heading text-lg text-gray-900">{formatINR(total)}</p>
              </div>

              <div className="mt-4 grid gap-3">
                <Button
                  type="button"
                  onClick={handleCheckout}
                  disabled={lines.length === 0}
                >
                  Checkout
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
          [class*='animate-[cartDrawerSlide'],
          [class*='animate-[cartUpsellFade'] {
            animation: none !important;
          }
        }

        @keyframes cartDrawerSlide {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        @keyframes cartUpsellFade {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `,
        }}
      />
    </div>
  );
}

export default CartDrawer;
