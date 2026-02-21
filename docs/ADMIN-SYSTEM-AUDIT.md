# Admin System Architecture Audit

**Project:** Next.js App Router + Supabase e-commerce  
**Scope:** Admin entry, routing, auth, roles, data flow, security, failure points  
**Constraint:** Analysis and documentation only — no code or UI changes.

---

## 1. Admin Architecture Overview

- **Stack:** Next.js App Router (server and client components), Supabase (Auth + Postgres), server actions for mutations.
- **Admin surface:** All admin UI lives under `/admin/*`. Data is fetched in server components via `lib/admin/queries.ts` and `lib/admin/productQueries.ts` using **service-role** (`createAdminClient()`). Mutations use server actions in `lib/admin/actions.ts` (also service-role after `requireAdmin()`).
- **Protection layers:** (1) Middleware: unauthenticated → `/login`, non-admin → `/`. (2) Admin layout: `requireAdmin()` (redirect to `/` if not admin). (3) Admin API routes: custom `checkAdmin()` (401 if not admin). Server actions call `requireAdmin()` before using service-role.
- **Role source:** Single source of truth is `public.profiles.role` (default `'user'`). Admin access requires `role = 'admin'`. No client-side role checks; all enforcement is server-side (middleware, layout, API, server actions).

---

## 2. Route Protection Status

### 2.1 Admin routes

| Route | File | Component type | Access control | Data source |
|-------|------|----------------|----------------|-------------|
| `/admin` | `app/admin/page.tsx` | Server | Layout `requireAdmin()` + middleware | `getDashboardStats()` → `lib/admin/queries.ts` (service-role) |
| `/admin` layout | `app/admin/layout.tsx` | Server | `requireAdmin()`; fetches profile for header | `profiles` via layout’s supabase (anon + session) |
| `/admin/orders` | `app/admin/orders/page.tsx` | Server | Same layout | `getOrders()` → `lib/admin/queries.ts` |
| `/admin/products` | `app/admin/products/page.tsx` | Server | Same layout | `getProducts()`, `getCategories()` → `lib/admin/queries.ts` |
| `/admin/products/[id]` | `app/admin/products/[id]/page.tsx` | Server | Same layout | `getProductById()` → `lib/admin/productQueries.ts`, `getCategories()` |
| `/admin/products/new` | `app/admin/products/new/page.tsx` | Server | Same layout | `getCategories()`; form uses `createProduct` action |
| `/admin/customers` | `app/admin/customers/page.tsx` | Server | Same layout | `getCustomers()` → `lib/admin/queries.ts` |
| `/admin/analytics` | `app/admin/analytics/page.tsx` | Server | Same layout | `getSalesAnalytics()` → `lib/admin/queries.ts` |

**Note:** There is no `/admin/users` route. User/customer listing is at `/admin/customers`.

### 2.2 Nested / child behaviour

- All admin pages are children of `app/admin/layout.tsx`. The layout runs `requireAdmin()` first, so any child page is only rendered if the user is already validated as admin.
- Sidebar and Header are **client components** (`"use client"`). They do not perform role checks; they only render navigation and logout. Access control is entirely in middleware and layout.

### 2.3 APIs used by admin

- **Server components** do not call `/api/admin/*` for the main lists. They call `lib/admin/queries.ts` and `lib/admin/productQueries.ts` directly (server-side, service-role).
- **Admin API routes** exist for:
  - `GET /api/admin/orders` — used by client/fetch for order list (optional; orders page currently uses server-side `getOrders()`).
  - `GET /api/admin/orders/[id]` — order detail (e.g. for modals or future client use).
  - `POST /api/admin/expire-orders` — expire pending orders (cron or manual).
- **Server actions** (used by client components): `createProduct`, `updateProduct`, `toggleProductActive`, `deleteProduct`, `updateOrderStatus` in `lib/admin/actions.ts`. All call `requireAdmin()` then `createAdminClient()`.

---

## 3. Auth Flow Diagram

```
User requests /admin or /admin/*
         │
         ▼
   middleware.ts
   · createServerClient(anon) with request cookies
   · supabase.auth.getUser()
   · If path in PROTECTED_PREFIXES (/account, /admin) and !user → redirect /login
   · If path.startsWith("/admin") and user:
       · supabase.from("profiles").select("role").eq("id", user.id).single()
       · If profile?.role !== "admin" → redirect /
   · Else → next()
         │
         ▼
   app/admin/layout.tsx
   · requireAdmin() → requireUser() then profiles.role === "admin" or redirect /
   · requireUser() uses createServerClient(), getUser(); redirect /login if !user
   · requireAdmin() uses same supabase (anon + session) to read profiles.role
   · Fetches profile (full_name) for Header
   · Renders Sidebar + Header + children
         │
         ▼
   Admin page (e.g. page.tsx)
   · Server component calls getDashboardStats() / getOrders() / getProducts() / etc.
   · These use createAdminClient() (service-role) — no second role check (layout already enforced)
         │
         ▼
   Client components (OrderTable, ProductTable, etc.)
   · Call server actions: updateOrderStatus(), toggleProductActive(), deleteProduct(), etc.
   · Each action runs requireAdmin() then createAdminClient()
```

**Session read locations:**

- **Middleware:** `createServerClient` from `@supabase/ssr` with request/response cookies; `getUser()`.
- **Layout / server components / API:** `createServerClient()` from `lib/supabase/server.ts` (uses `cookies()` from `next/headers`); `getUser()`.
- **Auth callback:** `app/auth/callback/route.ts` uses `createServerClient()`, `exchangeCodeForSession()`, then `getUser()`.

---

## 4. Role System Analysis

### 4.1 Where admin role is stored

- **Table:** `public.profiles`
- **Column:** `role` (text, default `'user'` in schema).
- **Row link:** `profiles.id` = `auth.users.id` (FK to `auth.users(id)`).

### 4.2 How role is fetched

- **Middleware:** After `getUser()`, queries `profiles` with anon client (session JWT applies). RLS allows SELECT where `auth.uid() = id`, so the user can read their own row. Checks `profile?.role !== "admin"`.
- **Layout:** `requireAdmin()` → `requireUser()` then same: `supabase.from("profiles").select("role").eq("id", user.id).single()`. Same RLS.
- **Admin APIs:** Each route’s `checkAdmin()` uses `createServerClient()`, `getUser()`, then same `profiles` query. Same RLS.

### 4.3 Code path: auth.user.id → profiles → role → admin decision

1. `auth.getUser()` returns `user.id` (from session JWT).
2. Query: `from("profiles").select("role").eq("id", user.id).single()`.
3. If `profile?.role !== "admin"` → deny (redirect or 401).
4. No role check is done in the browser; all checks are in middleware, layout, API handlers, or server actions.

### 4.4 Missing or risky role checks

- **Layout:** Role is checked; not missing.
- **Admin pages:** They do not re-check role; they rely on layout. Acceptable because layout always runs first.
- **lib/admin/queries.ts and productQueries.ts:** No `requireAdmin()` inside. They are only invoked from admin pages (behind layout) or from server actions that do call `requireAdmin()`. So the “gate” is layout + actions, not the query modules. If a non-admin ever called these from another server context (e.g. a mistaken import), they would get service-role data without a role check. Mitigation: ensure these modules are only used from admin layout subtree or from actions that already called `requireAdmin()`.
- **Client-side:** No role check in Sidebar/Header; they only render UI. No security risk as long as middleware and layout remain in place.

---

## 5. Middleware Security

- **File:** `middleware.ts` (root).
- **Matcher:** All routes except static assets, favicon, robots, sitemap, images.
- **Protected prefixes:** `["/account", "/admin"]`. Any path equal or under these is considered protected.
- **Behaviour:**
  - If `NEXT_PUBLIC_SUPABASE_URL` or `NEXT_PUBLIC_SUPABASE_ANON_KEY` is missing: does **not** block; returns `NextResponse.next()`. Rationale in code: “page-level auth checks will handle it.” So with missing env, `/admin` could be reached and then layout would use a no-op client and redirect to login or fail.
  - If env present: builds `createServerClient` (anon + cookies), calls `getUser()`. For protected path, if no user → redirect to `/login`. For `/admin`, if user exists, loads `profiles.role` and if not `"admin"` → redirect to `/`.
- **Does it protect /admin/*?** Yes, when env is set.
- **Does it redirect unauthenticated users?** Yes (to `/login`).
- **Does it check admin role?** Yes for `/admin` (and any path under it).
- **Public access risk:** If Supabase throws in the try block, the catch logs and returns `response` (next()). So on middleware error, the request continues; layout’s `requireAdmin()` then enforces auth/role. No silent “allow unauthenticated” for admin; worst case is one extra server round-trip before redirect.

---

## 6. Admin Layout Flow

- **File:** `app/admin/layout.tsx`
- **Behaviour:**
  - Calls `await requireAdmin()`. That calls `requireUser()` (redirect to `/login` if no user), then queries `profiles.role` for `user.id`; if `profile?.role !== "admin"` redirects to `/`.
  - Then fetches `profiles` again for `full_name` (and role) to pass to Header.
  - Renders Sidebar, Header (with name/email), and children.
- **If not logged in:** `requireUser()` redirects to `/login`; no render of admin UI.
- **If role ≠ admin:** `requireAdmin()` redirects to `/`; no render of admin UI.
- **Silent failure / empty render:** If `requireAdmin()` throws before redirect (e.g. Supabase down or RLS misconfiguration), the layout would throw and Next.js would show an error. If profile row is missing, `profile` is null and `profile?.role !== "admin"` is true, so redirect to `/` (non-admin path). No silent “show admin UI to non-admin.”

---

## 7. Admin API Security

| Endpoint | Method | Auth/role check | Client used for data | Service role safe? | Notes |
|----------|--------|------------------|----------------------|--------------------|-------|
| `/api/admin/orders` | GET | `checkAdmin()` (session + profiles.role) | `createAdminClient()` | Yes | Returns 401 if not admin. |
| `/api/admin/orders/[id]` | GET | `checkAdmin()` | `createAdminClient()` | Yes | Same. |
| `/api/admin/expire-orders` | POST | `checkAdmin()` | `createAdminClient()` | Yes | Calls RPC `expire_pending_orders`. |

- **checkAdmin()** (in each route): Uses `createServerClient()` (anon + cookies), `getUser()`, then `profiles.role`; throws `"Unauthorized"` if no user or role !== `"admin"`. Handlers catch and return 401.
- **createAdminClient()** is only used after the admin check. Service-role key is never sent to the client; it’s server-only in `lib/supabase/admin.ts`.
- **Possible issues:** None critical. Duplication of `checkAdmin()` could drift; consider a shared helper. No rate limiting or audit logging in this audit scope.

---

## 8. Data Flow Maps

### Orders list

```
Browser → GET /admin/orders
  → middleware (auth + role)
  → Admin layout (requireAdmin, load profile for header)
  → AdminOrdersPage (server)
      → getOrders(page, statusFilter) in lib/admin/queries.ts
      → createAdminClient() → from("orders").select(...).range() + from("profiles").select for emails
  → OrderTable (client) receives orders as props
  → User clicks status change → updateOrderStatus(orderId, status) server action
      → requireAdmin() → createAdminClient() → orders.update({ status })
  → revalidatePath("/admin/orders"); client may window.location.reload()
```

### Order detail (API)

```
Client (or external) → GET /api/admin/orders/[id]
  → checkAdmin() (createServerClient, getUser, profiles.role)
  → createAdminClient() → orders.eq("id", id).single()
  → order_items.select, products.select (names), optional profiles for customer email
  → JSON response
```

### Dashboard stats

```
Browser → GET /admin
  → middleware → layout requireAdmin
  → AdminDashboardPage (server)
      → getDashboardStats() in lib/admin/queries.ts
      → createAdminClient() → products/orders/profiles counts, revenue, today’s stats
  → DashboardStats (client) receives stats as props
```

### Product management

```
List: GET /admin/products
  → layout requireAdmin
  → AdminProductsPage → getProducts(), getCategories() (createAdminClient)
  → ProductTable (client); actions: toggleProductActive, deleteProduct (requireAdmin + createAdminClient)

Edit: GET /admin/products/[id]
  → getProductById(id), getCategories() (createAdminClient)
  → ProductForm (client) → updateProduct(id, data) (requireAdmin + createAdminClient)

New: GET /admin/products/new
  → getCategories(); ProductForm → createProduct(data) (requireAdmin + createAdminClient)
```

---

## 9. Failure Root Cause (Why Admin Might Not Work)

- **Missing profile row:** New users get a row via `handle_new_user()` trigger with default `role = 'user'`. If the trigger failed or was removed, or the user was created before the trigger existed, no row exists. Then `profile` is null, `profile?.role !== "admin"` is true → middleware and layout redirect to `/` or API returns 401. **Admin fails because:** User has no profile row, so they are treated as non-admin.
- **profiles.role not set to 'admin':** Default is `'user'`. To grant admin, someone must `UPDATE profiles SET role = 'admin' WHERE id = '...'`. **Admin fails because:** Role was never set to `'admin'` for that user.
- **RLS blocking profiles read:** Policies allow only `auth.uid() = id`. Middleware and layout use the session-bound anon client, so `auth.uid()` is the current user and they can read their own row. If RLS were changed to deny SELECT for that row, profile would be null → treated as non-admin. **Admin fails because:** RLS prevents the user from reading their own profile.
- **Session not available in server:** If cookies are missing, wrong domain, or expired, `getUser()` returns null → redirect to login. **Admin fails because:** Session is missing or invalid on the server.
- **Admin layout not awaiting session:** Layout uses `await requireAdmin()`, which awaits `getUser()` and the profile query. So it does wait. **Not a cause of failure.**
- **Middleware conflict:** No conflicting middleware found. Middleware runs first and either redirects or allows through. **Not a cause of failure** under current setup.
- **API returning 401/403:** If `checkAdmin()` fails (no user or role !== admin), APIs return 401. So any client calling these without a valid admin session gets 401. **Admin “fails” for that API call** because the caller is not authenticated as admin.
- **Service role env missing:** `createAdminClient()` throws if `SUPABASE_SERVICE_ROLE_KEY` (or URL) is missing. Admin pages that call `getDashboardStats()`, `getOrders()`, `getProducts()`, etc. would throw during server render. **Admin fails because:** Server throws when loading any page that uses service-role (dashboard, products, orders, customers, analytics, product edit/new).
- **createServerClient misconfigured:** If server client doesn’t receive cookies or uses wrong URL/anon key, `getUser()` can be null and layout/middleware redirect to login. **Admin fails because:** Auth appears as “not logged in” on the server.

---

## 10. Database Requirements Check

- **profiles table (001_initial_schema.sql):**
  - `id uuid NOT NULL` with `CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id)` — i.e. `id` = `auth.users.id`. ✓
  - `role text DEFAULT 'user'::text` — column exists, default `'user'`. ✓
- **handle_new_user() (001):**
  - Present. Trigger `on_auth_user_created` on `auth.users` AFTER INSERT.
  - Inserts into `profiles (id, email, full_name, first_name, last_name)`. Does **not** set `role`; so new users get table default `'user'`. ✓
- **RLS (002_rls_policies.sql):**
  - `profiles_select_own`: SELECT WHERE `auth.uid() = id`. So user can read own profile. ✓
  - No policy for “admin read others’ profiles.” Admin code uses **service-role** for orders/customers/products; service-role bypasses RLS. So admin does not need a policy to read other profiles for admin features; they use `createAdminClient()` for that data. Middleware/layout only need to read the **current** user’s profile (own row). ✓

---

## 11. Environment Check

- **Required for admin:**
  - `NEXT_PUBLIC_SUPABASE_URL` — used by middleware, layout, API (createServerClient / createAdminClient), and admin lib.
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY` — same.
  - `SUPABASE_SERVICE_ROLE_KEY` — used by `createAdminClient()` in `lib/supabase/admin.ts`, and thus by:
    - `lib/admin/queries.ts` (getDashboardStats, getProducts, getOrders, getCustomers, getSalesAnalytics, getCategories)
    - `lib/admin/productQueries.ts` (getProductById)
    - `lib/admin/actions.ts` (createProduct, updateProduct, toggleProductActive, deleteProduct, updateOrderStatus)
    - `app/api/admin/orders/route.ts`, `app/api/admin/orders/[id]/route.ts`, `app/api/admin/expire-orders/route.ts`
- **If any of these are missing:**
  - Missing anon/URL: middleware passes through (no block); server client can be no-op → layout redirects to login or errors.
  - Missing service-role: `createAdminClient()` throws; all admin pages that run queries/actions and all admin API routes that use service-role will throw or 500. **Admin depends on all three env vars.**

---

## 12. Security Risks (Summary)

- **No client-side role dependency:** Role is only enforced on server (middleware, layout, API, server actions). Low risk of role bypass via client.
- **Service-role usage:** Confined to server; used only after `requireAdmin()` or `checkAdmin()`. Key not exposed to browser.
- **RLS:** Admin data access via service-role bypasses RLS; that’s intended. Auth and role checks are the gate.
- **Duplicate check logic:** `checkAdmin()` duplicated in three API routes; layout uses `requireAdmin()`. If one path is updated and another forgotten, inconsistency could occur. Prefer a single shared “assertAdmin” used by all API routes.
- **Middleware error path:** On exception, middleware allows request through. Layout then enforces; so no elevation of privilege, but worth ensuring layout always runs and never skipped for `/admin`.

---

## 13. Minimal Fix Plan (No Code)

- **Ensure env in production:** Set `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY` in the deployment environment so middleware, layout, and admin data paths work.
- **Grant admin:** For each admin user, ensure a `profiles` row exists and `role = 'admin'` (e.g. `UPDATE profiles SET role = 'admin' WHERE id = '<auth.users.id>';`). No UI for this in the audited code.
- **Profile creation:** Rely on `handle_new_user()` so every new user has a profile with default role. If any users were created before the trigger, backfill profiles and set role as needed.
- **Single admin check for API routes:** Introduce one shared helper (e.g. `assertAdmin()` or `getAdminUser()`) that returns the user or throws/returns 401, and use it in all admin API routes to avoid drift.
- **Optional hardening:** In middleware, on Supabase/env failure for a protected path, consider redirecting to login or a generic error instead of passing through, so behaviour is explicit.
- **No RLS change required** for admin read-others; service-role is the intended mechanism. Keep RLS for anon/session clients (e.g. profiles select own).

---

*End of Admin System Audit.*
