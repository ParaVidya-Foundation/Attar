"use client";

import type { ReactNode } from "react";
import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { useLocalCart } from "@/hooks/useLocalCart";
import type { CartItem } from "@/types/cart";

type CartUiState = {
  open: boolean;
  setOpen: (v: boolean) => void;
};

type CartContextValue = ReturnType<typeof useLocalCart> &
  CartUiState & {
    /** Alias: add a CartItem (used by ProductCard & checkout-ready code) */
    addItem: (item: CartItem) => void;
    /** Alias: remove by id */
    removeItem: (id: string) => void;
    /** Alias: set quantity by id */
    updateQuantity: (id: string, qty: number) => void;
    /** Alias: empty the cart */
    clearCart: () => void;
    /** Checkout-ready payload for Razorpay / backend (variant_id required per line) */
    getCheckoutPayload: () => {
      items: { variant_id: string; quantity: number }[];
      total: number;
    };
  };

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const cart = useLocalCart();
  const [open, setOpen] = useState(false);

  const addItem = useCallback(
    (item: CartItem) => {
      if (!item.variantId) {
        console.error("[Cart] Rejected: variantId required for checkout");
        return;
      }
      cart.add({
        id: item.id,
        variantId: item.variantId,
        slug: item.slug ?? item.id,
        name: item.title,
        price: item.price,
        imageUrl: item.image,
        qty: item.quantity,
      });
    },
    [cart.add],
  );

  const removeItem = useCallback(
    (id: string) => cart.remove(id, 0),
    [cart.remove],
  );

  const updateQuantity = useCallback(
    (id: string, qty: number) => cart.setQty(id, 0, qty),
    [cart.setQty],
  );

  const clearCart = useCallback(() => cart.clear(), [cart.clear]);

  const getCheckoutPayload = useCallback(
    () => ({
      items: cart.lines
        .filter((l) => l.variantId)
        .map((l) => ({
          variant_id: l.variantId!,
          quantity: l.qty,
        })),
      total: cart.total,
    }),
    [cart.lines, cart.total],
  );

  const value = useMemo<CartContextValue>(
    () => ({
      ...cart,
      open,
      setOpen,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      getCheckoutPayload,
    }),
    [cart, open, addItem, removeItem, updateQuantity, clearCart, getCheckoutPayload],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
