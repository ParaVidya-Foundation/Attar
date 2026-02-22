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

const STORAGE_KEY = "sm_cart_v1";

type SimpleAddPayload = {
  id: string;
  variantId?: string;
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

function computeCount(lines: CartLine[]) {
  return lines.reduce((acc, l) => acc + l.qty, 0);
}

export function useLocalCart() {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const count = useMemo(() => computeCount(lines), [lines]);

  useEffect(() => {
    const st = safeParse(typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null);
    if (st?.lines) setLines(st.lines);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    const state: CartState = { lines, updatedAt: Date.now() };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
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
      if (!payload.variantId) {
        return;
      }
      const qtyValue = Math.max(1, payload.qty ?? 1);
      const lineMl = 0;
      const slug = payload.slug ?? payload.id;

      setLines((prev) => {
        const key = payload.variantId ?? `${payload.id}:${lineMl}`;
        const existing = prev.find(
          (l) => (payload.variantId ? l.variantId === payload.variantId : `${l.id}:${l.ml}` === `${payload.id}:${lineMl}`),
        );
        if (!existing) {
          return [
            ...prev,
            {
              id: payload.id,
              variantId: payload.variantId,
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
          (payload.variantId ? l.variantId === payload.variantId : l.id === payload.id && l.ml === lineMl)
            ? { ...l, qty: l.qty + qtyValue }
            : l,
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
