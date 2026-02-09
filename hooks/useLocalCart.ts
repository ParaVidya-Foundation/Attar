"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { Attar } from "@/lib/types";

export type CartLine = {
  id: string;
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

  const add = useCallback((attar: Attar, ml: number, qty: number) => {
    const price = attar.sizes.find((s) => s.ml === ml)?.price ?? attar.price;
    const imageUrl = attar.images[0]?.url ?? "";
    setLines((prev) => {
      const key = `${attar.id}:${ml}`;
      const existing = prev.find((l) => `${l.id}:${l.ml}` === key);
      if (!existing) {
        return [
          ...prev,
          { id: attar.id, slug: attar.slug, name: attar.name, imageUrl, ml, price, qty: Math.max(1, qty) },
        ];
      }
      return prev.map((l) =>
        l.id === attar.id && l.ml === ml ? { ...l, qty: l.qty + Math.max(1, qty) } : l,
      );
    });
  }, []);

  const remove = useCallback((id: string, ml: number) => {
    setLines((prev) => prev.filter((l) => !(l.id === id && l.ml === ml)));
  }, []);

  const setQty = useCallback((id: string, ml: number, qty: number) => {
    setLines((prev) =>
      prev
        .map((l) => (l.id === id && l.ml === ml ? { ...l, qty: Math.max(1, qty) } : l))
        .filter((l) => l.qty > 0),
    );
  }, []);

  const clear = useCallback(() => setLines([]), []);

  const total = useMemo(() => lines.reduce((acc, l) => acc + l.price * l.qty, 0), [lines]);

  return { lines, count, total, add, remove, setQty, clear };
}
