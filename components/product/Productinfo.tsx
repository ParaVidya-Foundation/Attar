"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/components/cart/CartProvider";
import { PLACEHOLDER_IMAGE_URL } from "@/lib/images";

type Size = { id: string; label: string; priceModifier?: number; priceValue?: number };

export type FullProduct = {
  id: string;
  slug?: string;
  title: string;
  brand?: string;
  price: string;
  priceValue?: number;
  currency?: string;
  description: string;
  longDescription?: string;
  images?: { src: string; alt?: string }[];
  sizes?: Size[];
  notes?: {
    top?: string[];
    heart?: string[];
    base?: string[];
  };
  rating?: { value: number; count: number };
  inStock?: boolean;
};

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isValidVariantId(id: unknown): id is string {
  if (typeof id !== "string") return false;
  const trimmed = id.trim();
  if (trimmed.length !== 36) return false;
  return UUID_REGEX.test(trimmed);
}

export default function ProductInfo({ product }: { product: FullProduct }) {
  const { addItem, setOpen } = useCart();
  const router = useRouter();
  const [selectedSize, setSelectedSize] = useState<string>(product.sizes?.[0]?.id ?? "");
  const [quantity, setQuantity] = useState<number>(1);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<number | null>(null);

  useEffect(() => {
    if (!selectedSize && product.sizes && product.sizes.length) {
      setSelectedSize(product.sizes[0].id);
    }
  }, [product.sizes, selectedSize]);

  useEffect(() => {
    return () => {
      if (toastTimer.current) window.clearTimeout(toastTimer.current);
    };
  }, []);

  function showToast(msg: string) {
    setToast(msg);
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 2500);
  }

  function addToCart() {
    const rawVariantId = product.sizes?.length ? selectedSize || product.sizes[0]?.id : undefined;
    if (!isValidVariantId(rawVariantId)) return;

    const variantId = rawVariantId.trim();
    const price = product.sizes?.find((s) => s.id === selectedSize)?.priceValue ?? product.priceValue ?? 0;
    const imageSrc =
      product.images?.[0]?.src && product.images[0].src.trim().length > 0
        ? product.images[0].src.trim()
        : PLACEHOLDER_IMAGE_URL;

    addItem({
      id: product.id,
      variantId,
      slug: product.slug,
      title: product.title,
      price,
      image: imageSrc,
      quantity,
    });

    void fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        productId: product.id,
        eventType: "add_to_cart",
      }),
      keepalive: true,
    });

    showToast("Added to cart");
    setOpen(true);
  }

  function buyNow() {
    const rawVariantId = (selectedSize || product.sizes?.[0]?.id) ?? "";
    if (!isValidVariantId(rawVariantId)) return;

    const variantId = rawVariantId.trim();
    router.push(`/checkout?variant_id=${encodeURIComponent(variantId)}&quantity=${quantity}`);
  }

  const hasSizes = Boolean(product.sizes && product.sizes.length > 0);
  const hasNotes =
    Boolean(product.notes?.top?.length) ||
    Boolean(product.notes?.heart?.length) ||
    Boolean(product.notes?.base?.length);

  return (
    <aside
      className="w-full lg:w-1/2 border-[1px] border-[#1e2023] bg-white p-5 sm:p-7 md:p-10"
      aria-labelledby="product-title"
    >
      <div className="max-w-xl">
        <header>
          {product.brand && (
            <p className="text-[11px] uppercase tracking-[0.18em] text-gray-500">{product.brand}</p>
          )}

          <h1
            id="product-title"
            className="mt-2 font-heading text-2xl leading-tight text-[#1e2023] sm:text-3xl md:text-4xl"
          >
            {product.title}
          </h1>

          <p className="mt-4 text-2xl font-semibold text-[#1e2023]">{product.price}</p>
        </header>

        <div className="mt-5">
          <p className="text-sm leading-7 text-gray-700">{product.longDescription ?? product.description}</p>
        </div>

        {hasNotes && (
          <section className="mt-8" aria-labelledby="product-notes-heading">
            <h2 id="product-notes-heading" className="text-[11px] uppercase tracking-[0.18em] text-gray-500">
              Notes
            </h2>

            <div className="mt-3 space-y-2 text-sm leading-7 text-gray-700">
              {product.notes?.top?.length ? (
                <p>
                  <span className="font-medium text-[#1e2023]">Top:</span> {product.notes.top.join(", ")}
                </p>
              ) : null}
              {product.notes?.heart?.length ? (
                <p>
                  <span className="font-medium text-[#1e2023]">Heart:</span> {product.notes.heart.join(", ")}
                </p>
              ) : null}
              {product.notes?.base?.length ? (
                <p>
                  <span className="font-medium text-[#1e2023]">Base:</span> {product.notes.base.join(", ")}
                </p>
              ) : null}
            </div>
          </section>
        )}

        {hasSizes && (
          <section className="mt-8" aria-labelledby="product-size-heading">
            <h2 id="product-size-heading" className="text-[11px] uppercase tracking-[0.18em] text-gray-500">
              Size
            </h2>

            <fieldset className="mt-3">
              <legend className="sr-only">Choose a size</legend>
              <div className="flex flex-wrap gap-3">
                {product.sizes!.map((s) => {
                  const checked = selectedSize === s.id;

                  return (
                    <label key={s.id} className="cursor-pointer">
                      <input
                        type="radio"
                        name="size"
                        value={s.id}
                        checked={checked}
                        onChange={() => setSelectedSize(s.id)}
                        className="sr-only"
                      />
                      <span
                        className={[
                          "inline-flex min-w-[64px] items-center justify-center border px-4 py-2 text-sm transition",
                          checked
                            ? "border-black bg-black text-white"
                            : "border-gray-300 bg-white text-[#1e2023] hover:border-black",
                        ].join(" ")}
                        aria-hidden="true"
                      >
                        {s.label}
                      </span>
                    </label>
                  );
                })}
              </div>
            </fieldset>
          </section>
        )}

        <section className="mt-8" aria-labelledby="purchase-controls-heading">
          <h2 id="purchase-controls-heading" className="sr-only">
            Purchase controls
          </h2>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-stretch">
            <div
              className="inline-flex w-fit items-center border border-gray-300"
              role="group"
              aria-label="Quantity selector"
            >
              <button
                type="button"
                aria-label="Decrease quantity"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="flex h-11 w-11 items-center justify-center border-r border-gray-300 text-base text-[#1e2023] transition hover:bg-black hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-black/20"
              >
                −
              </button>

              <output
                aria-live="polite"
                aria-atomic="true"
                className="flex h-11 min-w-[56px] items-center justify-center px-3 text-sm font-medium text-[#1e2023]"
              >
                {quantity}
              </output>

              <button
                type="button"
                aria-label="Increase quantity"
                onClick={() => setQuantity((q) => q + 1)}
                className="flex h-11 w-11 items-center justify-center border-l border-gray-300 text-base text-[#1e2023] transition hover:bg-black hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-black/20"
              >
                +
              </button>
            </div>

            <button
              type="button"
              onClick={addToCart}
              className="min-h-[44px] flex-1 border border-black bg-white px-5 py-3 text-sm tracking-[0.14em] text-black transition hover:bg-black hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-black/20"
            >
              Add to cart
            </button>

            <button
              type="button"
              onClick={buyNow}
              className="min-h-[44px] border border-black bg-black px-5 py-3 text-sm tracking-[0.14em] text-white transition hover:bg-white hover:text-black focus:outline-none focus-visible:ring-2 focus-visible:ring-black/20"
            >
              Buy it now
            </button>
          </div>
        </section>

        {product.rating && (
          <section className="mt-6" aria-label="Product rating">
            <p className="text-sm text-gray-600">
              <span aria-hidden="true">★</span> {product.rating.value} · {product.rating.count} reviews
            </p>
          </section>
        )}

        <section className="mt-8 border-t border-gray-200 pt-6" aria-label="Additional product details">
          <details className="border-b border-gray-200 py-3">
            <summary className="cursor-pointer list-none font-medium text-[#1e2023] marker:hidden">
              Ingredients
            </summary>
            <div className="mt-3 text-sm leading-7 text-gray-600">
              Natural attar oils, sandalwood, essential extracts. Full INCI available on the product label.
            </div>
          </details>

          <details className="py-3">
            <summary className="cursor-pointer list-none font-medium text-[#1e2023] marker:hidden">
              Use &amp; Storage
            </summary>
            <div className="mt-3 text-sm leading-7 text-gray-600">
              Store in a cool, dry place away from direct sunlight. Apply 1–2 drops on pulse points.
            </div>
          </details>
        </section>

        <p className="mt-6 text-xs text-gray-500">Tax and shipping calculated at checkout.</p>
      </div>

      {toast && (
        <div
          role="status"
          aria-live="polite"
          aria-atomic="true"
          className="fixed bottom-6 right-6 z-50 border border-black bg-black px-4 py-2 text-sm text-white shadow-sm"
        >
          {toast}
        </div>
      )}
    </aside>
  );
}
