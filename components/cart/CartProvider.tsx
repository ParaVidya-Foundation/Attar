"use client";

import type { ReactNode } from "react";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
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

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isValidVariantId(id: unknown): id is string {
  if (typeof id !== "string") return false;
  const trimmed = id.trim();
  if (trimmed.length !== 36) return false;
  return UUID_REGEX.test(trimmed);
}

export function CartProvider({ children }: { children: ReactNode }) {
  const cart = useLocalCart();
  const [open, setOpen] = useState(false);

  const addItem = useCallback(
    (item: CartItem) => {
      const rawVariantId = item.variantId;
      if (!isValidVariantId(rawVariantId)) {
        if (process.env.NODE_ENV !== "production") {
          // eslint-disable-next-line no-console
          console.error("[Cart] Invalid variantId in addItem()", {
            productId: item.id,
            variantId: rawVariantId,
          });
        }
        return;
      }
      const variantId = rawVariantId.trim();

      if (process.env.NODE_ENV !== "production") {
        // eslint-disable-next-line no-console
        console.log("[Cart] Adding item via addItem()", {
          productId: item.id,
          variantId,
          qty: item.quantity,
        });
      }

      cart.add({
        id: item.id,
        variantId,
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

  // Dev-only debug handle
  useEffect(() => {
    if (process.env.NODE_ENV !== "production" && typeof window !== "undefined") {
      (window as any).cartDebug = cart;
    }
  }, [cart]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
