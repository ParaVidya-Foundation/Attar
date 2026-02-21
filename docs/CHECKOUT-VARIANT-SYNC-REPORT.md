# Checkout Variant-Only Sync Report

**Date:** 2025-02-21  
**Goal:** Checkout always loads using `variant_id`. Product-only fallback removed to eliminate "Product not available" from product fetch path.

---

## 1. Navigation sources updated

| Source | File | Change |
|--------|------|--------|
| **Buy Now** | `components/product/Productinfo.tsx` | Always navigates with `variant_id` and `quantity`. If no `variantId` (no selected/first size), checkout is blocked and error is logged. **Removed** any use of `productId=` in checkout URL. |
| **Cart Checkout (guest redirect)** | `components/cart/CartDrawer.tsx` | Redirect already used `variant_id` and `quantity`; added log when checkout is skipped because no lines have `variantId`. |
| **Cart Checkout (logged in)** | `hooks/useRazorpayCheckout.ts` | Sends `items: [{ variant_id, quantity }]`; no productId. Unchanged. |

No `Link href="/checkout"` or other checkout links were found that passed `productId`; only ProductInfo had the productId path, and it is removed.

---

## 2. Checkout is now variant-only

| Before | After |
|--------|--------|
| Checkout accepted `variant_id` **or** `productId`. When `productId` only, it called `GET /api/products/[id]` and used first variant. Product inactive / no variants / mismatch → "Product not available". | Checkout **requires** `variant_id`. If missing → show "Invalid checkout request" and do not fetch. **Only** `GET /api/variants/[variantId]` is used. No call to `/api/products/[id]`. |

**File:** `app/checkout/page.tsx`

- At top (after hooks): if `!variantId` → `console.error("Checkout accessed without variant_id")` and return `<EmptyState message="Invalid checkout request" />`.
- Removed `productId` from searchParams and from all logic.
- Removed the entire branch that fetched `GET /api/products/${productId}` and derived variant from first in list.
- Single data path: `GET /api/variants/${variantId}` → set product from response.

---

## 3. ProductId path removed

| Location | Status |
|----------|--------|
| **ProductInfo buyNow()** | **Removed** — No longer uses `productId`; only `variant_id` + `quantity`. If no variantId, navigation is blocked. |
| **Checkout page** | **Removed** — No `productId` param, no product fetch, no productId in dependency array. |
| **Cart / links** | No productId-based checkout links were present; cart uses variant_id only. |

Checkout no longer relies on `productId` anywhere.

---

## 4. API guard verified

**File:** `app/api/orders/create/route.ts`

- Explicit check: `if (variant_id == null || variant_id === "")` → return 400 `{ error: "variant_id is required" }`.
- Zod schema also requires `variant_id`. Verified; no change needed.

---

## 5. Debug logs added (temporary)

| Location | Log |
|----------|-----|
| **Checkout page** | `console.log("[CHECKOUT] variant_id:", variantId)` when variantId is present. |
| **GET /api/variants/[id]** | `console.log("[VARIANT API] id:", variantId)` at start of handler. |

Remove these after confirming flows in production.

---

## 6. Test URLs that work

- **Buy Now** → URL is `/checkout?variant_id=<uuid>&quantity=<n>` (e.g. `quantity=1`).
- **Cart Checkout (guest)** → Redirect to `/checkout?variant_id=<first_line.variantId>&quantity=<first_line.qty>`.
- **Direct** → `/checkout?variant_id=<uuid>&quantity=1` → Checkout loads product via variant API and works.

Invalid:

- `/checkout` or `/checkout?productId=...` → "Invalid checkout request" (no variant_id).

---

## 7. Orphan products (no variants)

Products that have **no variants** in `product_variants` cannot be checked out with the variant-only flow. For such products:

- **Buy Now** will not navigate (no `variantId` → checkout blocked, error logged).
- **Add to cart** already required `variantId` and rejects when missing.

To find products with no variants in the DB:

```sql
SELECT p.id, p.name, p.slug
FROM products p
LEFT JOIN product_variants v ON v.product_id = p.id
WHERE v.id IS NULL;
```

Add at least one variant per sellable product so Buy Now and cart checkout can run.

---

## 8. Why this fixes the issue

**Previous flow (problem):**

1. Product page sometimes sent **productId** (e.g. when product had no sizes in UI).
2. Checkout used **productId** to call `GET /api/products/[id]`.
3. That path could fail or return empty variants when: product inactive, no variants, or RLS/schema mismatch.
4. User saw **"Product not available"** even when the product existed.

**New flow (variant-only, Shopify/Stripe style):**

1. Product page **always** sends **variant_id** (and quantity). If no variant is available, Buy Now does nothing and logs.
2. Checkout **only** accepts **variant_id** and calls `GET /api/variants/[id]`.
3. Variant API returns one variant + its product; no “first variant” logic or product-only fetch.
4. Same path for Buy Now, cart redirect, and direct link → **consistent and reliable**.

Result: Checkout always loads from a single variant ID; no product-only path, so the previous "Product not available" from the product fetch path is removed.

---

## Summary

- **Navigation:** Buy Now and cart checkout use only `variant_id` (and quantity).
- **Checkout page:** Variant-only; requires `variant_id`; uses only `GET /api/variants/[id]`; productId path removed.
- **Order API:** `variant_id` required (verified).
- **Debug logs:** Added on checkout page and variant API; remove after verification.
- **Orphan products:** Identified via SQL; add variants for sellable products.

No UI, styling, or layout changes. Logic and data flow only.
