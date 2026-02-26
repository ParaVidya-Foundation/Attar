"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { Attar } from "@/lib/types";

export type CartLine = {
  id: string;
  /** When set, used as variant_id for checkout */
  variantId?: string;
  slug: string;
  name: string;
  imageUrl: string;
  ml: number;
  price: number;
  qty: number;
};

type CartState = {
  lines: CartLine[];
  updatedAt: number;
};

// Primary cart storage key (versioned)
const STORAGE_KEY = "attar_cart_v1";
// Legacy key kept for migration
const LEGACY_STORAGE_KEY = "sm_cart_v1";

type SimpleAddPayload = {
  id: string;
  variantId: string;
  slug?: string;
  name: string;
  imageUrl: string;
  price: number;
  qty: number;
};

function safeParse(raw: string | null): CartState | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as CartState;
  } catch {
    return null;
  }
}

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isValidVariantId(id: unknown): id is string {
  if (typeof id !== "string") return false;
  const trimmed = id.trim();
  if (trimmed.length !== 36) return false;
  return UUID_REGEX.test(trimmed);
}

function computeCount(lines: CartLine[]) {
  return lines.reduce((acc, l) => acc + l.qty, 0);
}

export function useLocalCart() {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const count = useMemo(() => computeCount(lines), [lines]);

  useEffect(() => {
    if (typeof window === "undefined") {
      setHydrated(true);
      return;
    }

    // Prefer new key; fall back to legacy key once.
    const primaryRaw = localStorage.getItem(STORAGE_KEY);
    const legacyRaw = localStorage.getItem(LEGACY_STORAGE_KEY);

    const primary = safeParse(primaryRaw);
    const legacy = safeParse(legacyRaw);

    const source = primary ?? legacy;
    if (source?.lines) {
      setLines(source.lines);
      // If we migrated from legacy, write to new key and clear old.
      if (!primary && legacy) {
        try {
          const state: CartState = { lines: source.lines, updatedAt: Date.now() };
          localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
          localStorage.removeItem(LEGACY_STORAGE_KEY);
        } catch {
          // ignore storage errors; cart will still function in-memory
        }
      }
    }

    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated || typeof window === "undefined") return;
    const state: CartState = { lines, updatedAt: Date.now() };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Swallow storage errors; never break UI because of quota
    }
  }, [lines, hydrated]);

  const add = useCallback(
    (item: Attar | SimpleAddPayload, ml?: number, qty?: number) => {
      // Path 1: full Attar payload with explicit ml + qty (product detail pages)
      if ("sizes" in item) {
        const attar = item as Attar;
        const mlValue = ml ?? attar.sizes[0]?.ml ?? 0;
        const qtyValue = Math.max(1, qty ?? 1);
        const price = attar.sizes.find((s) => s.ml === mlValue)?.price ?? attar.price;
        const imageUrl = attar.images[0]?.url ?? "";

        setLines((prev) => {
          const key = `${attar.id}:${mlValue}`;
          const existing = prev.find((l) => `${l.id}:${l.ml}` === key);
          if (!existing) {
            return [
              ...prev,
              {
                id: attar.id,
                slug: attar.slug,
                name: attar.name,
                imageUrl,
                ml: mlValue,
                price,
                qty: qtyValue,
              },
            ];
          }
          return prev.map((l) =>
            l.id === attar.id && l.ml === mlValue ? { ...l, qty: l.qty + qtyValue } : l,
          );
        });
        return;
      }

      // Path 2: simplified product payload (variantId required for checkout)
      const payload = item as SimpleAddPayload;
      const rawVariantId = payload.variantId;
      if (!isValidVariantId(rawVariantId)) {
        return;
      }
      const variantId = rawVariantId.trim();
      const qtyValue = Math.max(1, payload.qty ?? 1);
      const lineMl = 0;
      const slug = payload.slug ?? payload.id;

      setLines((prev) => {
        const existing = prev.find((l) => l.variantId === variantId);
        if (!existing) {
          return [
            ...prev,
            {
              id: payload.id,
              variantId,
              slug,
              name: payload.name,
              imageUrl: payload.imageUrl,
              ml: lineMl,
              price: payload.price,
              qty: qtyValue,
            },
          ];
        }
        return prev.map((l) =>
          l.variantId === variantId ? { ...l, qty: l.qty + qtyValue } : l,
        );
      });
    },
    [],
  );

  const remove = useCallback((id: string, ml: number) => {
    setLines((prev) =>
      prev.filter((l) => !(l.variantId ? l.variantId === id : l.id === id && l.ml === ml)),
    );
  }, []);

  const setQty = useCallback((id: string, ml: number, qty: number) => {
    setLines((prev) =>
      prev
        .map((l) =>
          (l.variantId ? l.variantId === id : l.id === id && l.ml === ml)
            ? { ...l, qty: Math.max(1, qty) }
            : l,
        )
        .filter((l) => l.qty > 0),
    );
  }, []);

  const clear = useCallback(() => setLines([]), []);

  const total = useMemo(() => lines.reduce((acc, l) => acc + l.price * l.qty, 0), [lines]);

  return { lines, count, total, add, remove, setQty, clear };
}
