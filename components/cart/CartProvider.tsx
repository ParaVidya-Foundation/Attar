"use client";

import type { ReactNode } from "react";
import { createContext, useContext, useMemo, useState } from "react";
import { useLocalCart } from "@/hooks/useLocalCart";

type CartUiState = {
  open: boolean;
  setOpen: (v: boolean) => void;
};

type CartContextValue = ReturnType<typeof useLocalCart> & CartUiState;

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const cart = useLocalCart();
  const [open, setOpen] = useState(false);

  const value = useMemo<CartContextValue>(() => ({ ...cart, open, setOpen }), [cart, open]);
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
