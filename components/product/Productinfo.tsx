"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/components/cart/CartProvider";

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

  function showToast(msg: string) {
    setToast(msg);
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 2500);
  }

  function addToCart() {
    const variantId = product.sizes?.length ? (selectedSize || product.sizes[0]?.id) : undefined;
    if (!variantId) {
      return;
    }
    const price = product.sizes?.find((s) => s.id === selectedSize)?.priceValue ?? product.priceValue ?? 0;
    addItem({
      id: product.id,
      variantId,
      slug: product.slug,
      title: product.title,
      price,
      image: product.images?.[0]?.src ?? `/products/${product.slug}.webp`,
      quantity,
    });
    showToast("Added to cart");
    setOpen(true);
  }

  function buyNow() {
    const variantId = (selectedSize || product.sizes?.[0]?.id)?.trim();
    if (!variantId) {
      return;
    }
    router.push(`/checkout?variant_id=${encodeURIComponent(variantId)}&quantity=${quantity}`);
  }

  return (
    <aside className="w-full lg:w-1/2 p-4 sm:p-6 md:p-10 flex flex-col justify-start border-[2px] border-[#1e2023]">
      <div className="max-w-xl">
        <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl leading-tight">{product.title}</h1>

        <p className="mt-3 text-2xl font-semibold">{product.price}</p>

        <p className="mt-4 text-sm text-gray-700">{product.longDescription ?? product.description}</p>

        {/* Notes */}
        {product.notes && (
          <div className="mt-6">
            <h4 className="text-xs tracking-wide text-gray-700">Notes</h4>
            <div className="mt-2 text-sm text-gray-600">
              <div>
                <strong className="font-medium">Top:</strong> {(product.notes.top || []).join(", ")}
              </div>
              <div className="mt-1">
                <strong className="font-medium">Heart:</strong> {(product.notes.heart || []).join(", ")}
              </div>
              <div className="mt-1">
                <strong className="font-medium">Base:</strong> {(product.notes.base || []).join(", ")}
              </div>
            </div>
          </div>
        )}

        {/* Size selector */}
        {product.sizes && product.sizes.length > 0 && (
          <div className="mt-6">
            <h4 className="text-xs tracking-wide text-gray-700">Size</h4>
            <div className="mt-2 flex items-center gap-3 flex-wrap">
              {product.sizes.map((s) => (
                <label key={s.id} className="inline-flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="size"
                    value={s.id}
                    checked={selectedSize === s.id}
                    onChange={() => setSelectedSize(s.id)}
                    className="sr-only"
                    aria-checked={selectedSize === s.id}
                  />
                  <span
                    className={`px-3 py-1 rounded-full border text-sm transition ${
                      selectedSize === s.id
                        ? "bg-black text-white border-black"
                        : "bg-white text-gray-800 border-gray-300"
                    }`}
                  >
                    {s.label}
                  </span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Quantity + actions */}
        <div className="mt-6 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
          <div className="inline-flex items-center border border-gray-200 rounded self-start">
            <button
              aria-label="Decrease quantity"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="px-3 py-2 text-sm"
            >
              −
            </button>
            <div className="px-4 py-2 text-sm">{quantity}</div>
            <button
              aria-label="Increase quantity"
              onClick={() => setQuantity((q) => q + 1)}
              className="px-3 py-2 text-sm"
            >
              +
            </button>
          </div>

          <button
            onClick={addToCart}
            className="flex-1 sm:flex-1 border border-[#1e2023] px-5 py-2.5 sm:py-2 text-sm tracking-wider hover:bg-black hover:text-white transition-all"
          >
            Add to cart
          </button>

          <button onClick={buyNow} className="w-full sm:w-auto bg-[#1e2023] text-white px-4 py-2.5 sm:py-2 text-sm rounded-sm">
            Buy it now
          </button>
        </div>

        {/* Meta / rating */}
        {product.rating && (
          <div className="mt-6 text-sm text-gray-600">
            ⭐ {product.rating.value} • {product.rating.count} reviews
          </div>
        )}

        {/* Accordions for Ingredients & Use */}
        <div className="mt-8 border-t border-gray-200 pt-6">
          <details className="mb-3">
            <summary className="cursor-pointer font-medium">Ingredients</summary>
            <div className="mt-3 text-sm text-gray-600">
              Natural attar oils, sandalwood, essential extracts. (Full INCI available on the product label.)
            </div>
          </details>

          <details>
            <summary className="cursor-pointer font-medium">Use & Storage</summary>
            <div className="mt-3 text-sm text-gray-600">
              Store in a cool, dry place away from direct sunlight. Apply 1-2 drops on pulse points.
            </div>
          </details>
        </div>

        <p className="mt-6 text-xs text-gray-500">Tax and shipping calculated at checkout.</p>
      </div>

      {/* Toast */}
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed right-6 bottom-6 z-50 rounded-md bg-black/90 text-white px-4 py-2 text-sm"
        >
          {toast}
        </div>
      )}
    </aside>
  );
}
