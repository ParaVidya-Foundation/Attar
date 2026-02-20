# System Audit Report

**Project:** Anand Ras — Luxury Attar E-Commerce  
**Stack:** Next.js 16 (App Router) + Supabase + Razorpay  
**Date:** 2026-02-20  
**Auditor:** Production Architect

---

## 1. Auth Flow

### What Works

- **Email/password login** — Fully functional via Supabase browser client (`@supabase/ssr`).
- **Google OAuth** — Implemented with proper callback route at `/auth/callback/route.ts`.
- **Session persistence** — Cookie-based sessions via `@supabase/ssr`. Server client reads/writes cookies correctly using `next/headers`.
- **Middleware protection** — `/account/*` and `/admin/*` routes protected. Unauthenticated users redirected to `/login`.
- **Admin role check** — Middleware queries `profiles.role` and redirects non-admins away from `/admin`.
- **Logout** — Both server route (`GET /logout`) and client-side `signOut()` in UserMenu work correctly.
- **Server-side auth helpers** — `requireUser()` and `getUser()` in `lib/auth.ts` properly use `getUser()` (not `getSession()`).
- **Profile auto-creation** — Database trigger `handle_new_user()` creates a profile row on signup.

### What Is Broken

- **ProductInfo cart bypass** — `components/product/Productinfo.tsx` writes directly to `localStorage("sm_cart_v1")` with a raw array format instead of using CartProvider. The useLocalCart hook expects `{ lines: [...], updatedAt: number }`. This means items added from the product detail page are invisible to the cart drawer and vice versa. **CRITICAL BUG.**
- **"Buy Now" dead end** — `ProductInfo.tsx` line 91 navigates to `/checkout` which does not exist. Results in a 404.

### Security Gaps

- **`getSession()` in orders API** — `app/api/orders/route.ts` line 50 calls `supabase.auth.getSession()` to extract access token. Supabase docs warn that `getSession()` reads from storage without validation; `getUser()` should be used for auth decisions. The token extracted here is forwarded to the Edge Function, which does validate it via `getUser()`, so the risk is limited but the pattern is wrong.
- **No rate limiting** — Login, signup, and order APIs have no rate limiting. Vulnerable to brute-force attacks.
- **Admin layout missing role check** — `app/admin/layout.tsx` checks if a user exists but does not verify `role === 'admin'`. It relies entirely on middleware. A direct server action call could bypass this.

---

## 2. Database Schema Audit

### Tables Present (15 total)

| Table | Status | Notes |
|-------|--------|-------|
| profiles | OK | Has id, email, full_name, first_name, last_name, title, phone, birthday, role, avatar_url, created_at, updated_at |
| categories | OK | slug, name, parent_id, soft delete |
| collections | OK | slug, name, soft delete |
| products | OK | slug, name, price, original_price, stock, image_url, category_id, is_active, short_description, description, notes (jsonb), zodiac, planet, longevity, full-text search |
| product_images | OK | product_id FK, url, alt, position |
| product_sizes | OK | product_id FK, size_ml, price. Unique (product_id, size_ml) |
| product_categories | OK | Many-to-many junction |
| product_collections | OK | Many-to-many junction |
| inventory | OK | product_id, size_ml, stock. Unique (product_id, size_ml) |
| addresses | OK | Full address fields, soft delete, user_id FK |
| orders | OK | user_id, status, total_amount, razorpay_order_id, razorpay_payment_id, shipping_address_id |
| order_items | OK | order_id, product_id, size_ml, qty, unit_price |
| payments | OK | order_id, razorpay_payment_id (unique), status, amount |
| reviews | OK | product_id, user_id, rating (1-5), unique per user+product |
| carts | OK | Persistent server-side cart (not currently used by frontend) |

### Missing Columns / Mismatches

- **orders.email** — Spec requires `email` column on orders for guest checkout support. Not present. Currently orders rely on `user_id` join to profiles for email.
- **product_variants** — Spec mentions `product_variants` table. The codebase uses `product_sizes` instead (size_ml + price). Functionally equivalent but naming differs from spec.

### RLS Policies

All tables have RLS enabled with proper policies:
- `profiles` — own records only (select, insert, update)
- `products` — public read where `is_active = true`
- `orders` — own records only, `deleted_at IS NULL`
- `order_items` — select via order ownership check
- `payments` — `false` (service role only)
- `addresses` — own records CRUD
- `reviews` — public read, auth insert, own update
- `carts` — own records CRUD

**No issues found with RLS.** Admin operations correctly use `createAdminClient()` with service role key, bypassing RLS.

### Indexes

Present and correct:
- `idx_products_slug`, `idx_products_category`, `idx_products_deleted`, `idx_products_name`, `idx_products_search` (GIN)
- `idx_orders_user`, `idx_orders_status`, `idx_orders_razorpay`, `idx_orders_created`, `idx_orders_created_at_desc`
- `idx_categories_slug`, `idx_collections_slug`
- All FK-referenced columns indexed

### Triggers

- `set_updated_at()` — on profiles, categories, collections, products, inventory, addresses, orders, reviews, carts
- `handle_new_user()` — creates profile on `auth.users` INSERT with first/last name split and ON CONFLICT DO UPDATE

---

## 3. Product Flow

### What Works

- **Fetchers** — `lib/fetchers.ts` uses `createStaticClient()` (no cookies, no session) for ISR-compatible data fetching.
- **Category filtering** — `getProductsByCategorySlug()` correctly looks up category by slug, then filters products by `category_id`.
- **Slug routing** — `/product/[slug]` works with ISR (`revalidate: 3600`).
- **Image resolution** — Images resolve from `/products/${slug}.webp` pattern.
- **Product mapper** — `mapToCardProduct()` transforms DB rows to card format with proper sale detection.
- **Select only needed columns** — `PRODUCT_COLUMNS` constant limits selected fields.

### What Is Broken

- **Debug console.log in production** — `fetchers.ts` lines 57 and 72 have `console.log("CATEGORY:", ...)` and `console.log("TEST PRODUCTS COUNT:", ...)`. These will pollute server logs.
- **No JSON-LD on product pages** — `lib/seo.ts` has `productJsonLd()` function but it's never called from `app/product/[slug]/page.tsx`. The function also expects an `Attar` type (from JSON data) not a `ProductRow` (from Supabase), so it can't be used as-is.
- **OG image type wrong** — Product page sets `openGraph.type: "website"` instead of `"product"`.

### Fetcher-Schema Alignment

| Fetcher Column | DB Column | Match |
|---------------|-----------|-------|
| id | id (uuid) | OK |
| name | name (text) | OK |
| slug | slug (varchar) | OK |
| description | description (text) | OK |
| short_description | short_description (text) | OK |
| category_id | category_id (uuid) | OK |
| price | price (integer) | OK |
| original_price | original_price (integer) | OK |
| is_active | is_active (boolean) | OK |
| created_at | created_at (timestamptz) | OK |

No mismatches found.

---

## 4. Cart Flow

### What Works

- **CartProvider** — React Context wraps `useLocalCart` hook. Provides `addItem`, `removeItem`, `updateQuantity`, `clearCart`.
- **Local storage** — Cart persisted under `"sm_cart_v1"` key with `{ lines, updatedAt }` structure.
- **CartDrawer** — Slide-out drawer with quantity controls, remove, clear, subtotal display.
- **CartPage** — Full page cart view at `/cart`.

### What Is Broken

- **CRITICAL: Dual cart implementation** — `ProductInfo.tsx` (product detail page) writes raw arrays directly to `sm_cart_v1` localStorage (lines 44-55). The `useLocalCart` hook expects `{ lines: [...], updatedAt: number }`. Items added from product pages corrupt the cart state for CartProvider.
- **Checkout button is a placeholder** — `CartDrawer.tsx` line 206: `onClick={() => alert("Checkout placeholder")}`. No actual checkout flow exists.
- **Missing size_ml in checkout payload** — `CartProvider.getCheckoutPayload()` returns `{ product_id, quantity, price }` but the order creation API expects `{ productId, size_ml, qty }`. Payload format completely mismatched.
- **Cart add from ProductCard uses ml=0** — When adding from shop grid, `useLocalCart` sets `ml: 0` (line 99: `const lineMl = 0`). The order API needs a real `size_ml` to look up prices and inventory.

---

## 5. Order Flow

### What Works

- **Order creation API** — `POST /api/orders` validates cart with Zod, checks auth, forwards to Supabase Edge Function.
- **Edge Function** — `create-order` validates JWT, checks inventory, fetches server-side prices (never trusts client), creates Razorpay order, inserts order + order_items.
- **Server-side price validation** — Prices come from `product_sizes` table, not from client. This is correct.
- **Order status lifecycle** — Schema supports: `created`, `pending`, `paid`, `failed`, `cancelled`, `shipped`, `delivered`.

### What Is Broken

- **NO webhook endpoint** — `/api/webhooks/razorpay` does not exist. After Razorpay payment, there is no way to update order status to `paid`, insert payment record, or decrement inventory. The entire post-payment flow is missing.
- **NO client-side Razorpay checkout** — No code exists to load Razorpay checkout SDK, present the payment modal, or handle payment success/failure callbacks.
- **NO checkout page** — `/checkout` route does not exist. "Buy Now" button navigates there and gets a 404.
- **Inventory not decremented** — Edge function has `TODO: Decrement inventory atomically` comment (line 190). Stock is checked but never reduced.
- **No order compensation** — If order_items insert fails after Razorpay order creation, there's a TODO to cancel the Razorpay order but it's not implemented.
- **Amount inconsistency** — Edge function stores `total` in rupees in `orders.total_amount`, but the orders page divides by 100 (`amount / 100`). One of these is wrong.

---

## 6. Account System

### What Works

- **Profile view/edit** — `/account` page fetches profile from Supabase, displays editable form with title, first/last name, phone, birthday.
- **Order history** — `/account/orders` fetches user orders with items, displays status badges, dates, amounts, item counts.
- **Address management** — `/account/address` with add, edit, soft-delete via server actions.
- **Change password** — `/account/change-password` with validation.
- **Protected routes** — Account layout uses `requireUser()` server-side. Middleware also protects.
- **Logout** — Available from account sidebar and UserMenu dropdown.

### What Is Broken

- **Amount display bug** — Orders page divides `total_amount` by 100, but the edge function stores amounts in rupees (not paise). Displayed amounts will be 100x too small.
- **No individual order detail page** — Users can see order list but cannot click into order details to see items, tracking, etc.

---

## 7. Admin System

### What Works

- **Dashboard** — Shows total products, orders, customers, revenue, today's stats.
- **Products CRUD** — List with search and pagination, create, edit, toggle active, soft delete.
- **Orders management** — List with pagination, status dropdown for updates (created → paid → shipped → delivered, etc.).
- **Customers** — Aggregated view with order count and total spent per email.
- **Analytics** — 7-day orders/revenue charts, top products.
- **Protection** — Middleware checks `profiles.role === 'admin'`. Admin operations use service role client.

### Issues

- **Admin layout doesn't verify role** — `app/admin/layout.tsx` only checks if user exists, doesn't check role. Server actions in `lib/admin/actions.ts` use `createAdminClient()` directly without verifying the caller is admin. If someone calls the server action directly, it bypasses the middleware check.
- **No admin user creation/management** — Admin can view customers but cannot promote users to admin or manage roles.

---

## 8. Performance & Security

### What Works

- **Server components** — Data fetching in server components (products, categories, orders, profile). No unnecessary client-side Supabase queries for read data.
- **ISR** — Product pages use `revalidate: 3600`. Sitemap revalidates hourly.
- **Standalone output** — `next.config.mjs` has `output: "standalone"` for containerized deployment.
- **Security headers** — CSP, HSTS, X-Frame-Options DENY, nosniff, referrer policy, permissions policy.
- **Console stripping** — Production build removes console.log (except error/warn).
- **Image optimization** — AVIF + WebP formats, proper device sizes, 1-year cache TTL.
- **Tailwind optimization** — `optimizePackageImports` for lucide-react and supabase.

### Security Issues

- **CSP allows unsafe-eval** — `script-src 'self' 'unsafe-inline' 'unsafe-eval'` severely weakens CSP. Required by some libraries but should be audited.
- **No environment validation** — No `lib/env.ts` file. Missing env vars cause runtime crashes instead of clear startup errors.
- **`require("crypto")` in Edge** — `lib/payments/razorpay.ts` line 45 uses `require("crypto")` which may fail in Edge runtime. Should use Web Crypto API.
- **No rate limiting** — APIs, login, and signup have no rate limiting.
- **Sensitive key documentation** — `keys.md` file exists (gitignored, but risky if accidentally committed).

### SEO

- **Sitemap** — Dynamic from Supabase with product slugs. Revalidates hourly.
- **Robots.txt** — Present.
- **Root metadata** — Title template, OG, Twitter cards configured.
- **Product metadata** — Title, description, canonical, OG from database.
- **Missing JSON-LD** — `productJsonLd()` exists but is never rendered on product pages.
- **Missing structured data** — Product pages have `itemScope itemType="https://schema.org/Product"` attribute but no actual microdata properties.
- **Home page sitemap entry** — Points to `/home` instead of `/` (the actual root).

---

## Summary of Issues by Severity

### CRITICAL (Blocks core functionality)

| # | Issue | Location |
|---|-------|----------|
| C1 | **No checkout flow** — No `/checkout` page, no Razorpay SDK integration, no payment modal. Users cannot complete purchases. | Missing entirely |
| C2 | **No Razorpay webhook** — `/api/webhooks/razorpay` missing. Orders can never be marked as paid. Payments are lost. | Missing entirely |
| C3 | **Dual cart implementation** — ProductInfo.tsx writes incompatible format to localStorage, corrupting CartProvider state. | `components/product/Productinfo.tsx` lines 44-55 |
| C4 | **Inventory never decremented** — Stock checked but never reduced after order creation or payment. | `supabase/functions/create-order/index.ts` line 190 |
| C5 | **Cart → API payload mismatch** — CartProvider sends `{ product_id, quantity, price }` but API expects `{ productId, size_ml, qty }`. | `components/cart/CartProvider.tsx` vs `app/api/orders/route.ts` |
| C6 | **Amount display bug** — Orders page divides by 100 but amounts stored in rupees. | `app/account/orders/page.tsx` line 37 |

### HIGH (Security / data integrity)

| # | Issue | Location |
|---|-------|----------|
| H1 | **Admin actions lack role verification** — Server actions use service role client without checking caller is admin. | `lib/admin/actions.ts` |
| H2 | **No environment validation** — Missing env vars crash at runtime. | Missing `lib/env.ts` |
| H3 | **`getSession()` used for auth** — Orders API uses `getSession()` instead of relying solely on `getUser()`. | `app/api/orders/route.ts` line 50 |
| H4 | **`require("crypto")` in potential Edge context** — May fail in Edge runtime. | `lib/payments/razorpay.ts` line 45 |
| H5 | **No rate limiting on auth endpoints** — Brute-force vulnerable. | `app/login/page.tsx`, `app/signup/page.tsx` |

### MEDIUM (Functional gaps)

| # | Issue | Location |
|---|-------|----------|
| M1 | **No order detail page** — Users can see order list but not individual order details. | Missing `/account/orders/[id]` |
| M2 | **Missing `email` column on orders** — No guest checkout support. | `orders` table schema |
| M3 | **Cart items from grid have ml=0** — No size selection on product cards. API will reject. | `hooks/useLocalCart.ts` line 99 |
| M4 | **No order compensation on failure** — Razorpay order created but DB insert fails → orphaned payment order. | `supabase/functions/create-order/index.ts` line 183 |
| M5 | **JSON-LD not rendered** — Function exists but never called on product pages. | `app/product/[slug]/page.tsx` |
| M6 | **Debug logs in fetchers** — `console.log` statements will pollute production logs (stripped by next.config but still present in dev). | `lib/fetchers.ts` lines 57, 72 |

### SAFE IMPROVEMENTS

| # | Improvement | Priority |
|---|------------|----------|
| S1 | Add `lib/env.ts` with Zod validation for all required environment variables | High |
| S2 | Remove `'unsafe-eval'` from CSP if not strictly needed | Medium |
| S3 | Add redundant admin role check in admin layout and server actions | High |
| S4 | Add product JSON-LD structured data to product pages | Medium |
| S5 | Fix sitemap home entry from `/home` to `/` | Low |
| S6 | Add `robots: "noindex"` to admin pages metadata | Low |
| S7 | Consolidate cart implementations into single CartProvider | Critical (part of C3) |
| S8 | Add pagination to account orders page | Low |
| S9 | Remove `keys.md` or ensure it's always gitignored | Medium |
| S10 | Use Web Crypto API instead of Node crypto in webhook verification | Medium |

---

## Architecture Overview (Current State)

```
Browser (Client)
  ├── Login/Signup → Supabase Auth (cookies)
  ├── Cart → localStorage ("sm_cart_v1")
  ├── Product pages → SSR/ISR from Supabase
  └── Checkout → ❌ NOT IMPLEMENTED

Next.js Server
  ├── Middleware → Auth check + Admin role check
  ├── Server Components → Supabase queries (server client)
  ├── API Routes → /api/orders (validates + forwards)
  └── Server Actions → Profile updates, Admin CRUD

Supabase
  ├── Auth → Email/password + Google OAuth
  ├── Postgres → 15 tables with RLS
  ├── Edge Functions → create-order (validates + creates Razorpay order)
  └── Storage → Not used (images in /public)

Razorpay
  ├── Order creation → Via Edge Function
  ├── Checkout SDK → ❌ NOT INTEGRATED
  └── Webhook → ❌ NOT IMPLEMENTED
```

---

## Recommended Fix Order

1. **Fix dual cart bug** (C3) — Unify ProductInfo to use CartProvider
2. **Fix amount display** (C6) — Decide rupees vs paise, make consistent
3. **Fix cart-to-API payload** (C5) — Align checkout payload with API schema
4. **Build checkout flow** (C1) — Razorpay SDK integration, checkout page
5. **Build webhook** (C2) — Payment verification, order status update, payment record
6. **Implement inventory decrement** (C4) — After payment confirmation
7. **Add env validation** (H2) — `lib/env.ts` with Zod
8. **Add admin role verification** (H1) — In server actions
9. **Fix `getSession()` usage** (H3) — Use `getUser()` only
10. **Add JSON-LD** (M5) — Product structured data
11. **Add order detail page** (M1) — `/account/orders/[id]`
