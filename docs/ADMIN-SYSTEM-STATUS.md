# Admin System Status

**Purpose:** Production reference for admin routes, auth, role checks, service-role usage, and failure causes.  
**Health check:** `GET /api/admin/health` → `{ env, serviceRole, adminUser, profileExists }`.

---

## Admin routes

| Route | Purpose |
|-------|--------|
| `/admin` | Dashboard (stats) |
| `/admin/orders` | Order list + filters |
| `/admin/products` | Product list + search |
| `/admin/products/[id]` | Edit product |
| `/admin/products/new` | New product |
| `/admin/customers` | Customer list (by order history) |
| `/admin/analytics` | Sales analytics (last 7 days, top products) |

All are server components under `app/admin/layout.tsx`. Layout runs `assertAdminEnv()` then `assertAdmin()`; on failure it redirects (login or home). No `/admin/users` — use `/admin/customers`.

---

## Auth flow

1. **Middleware** (for `/admin/*`): Builds Supabase client from request cookies → `getUser()`. If protected path and no user → redirect `/login`. If path is `/admin` and user exists → `assertAdmin(supabase)`. On `NotAuthenticatedError` → `/login`; on `ForbiddenError` or `ProfileMissingError` → `/`.
2. **Admin layout**: `assertAdminEnv()` (throws if env missing) → `assertAdmin()`. On `NotAuthenticatedError` → `redirect("/login")`. On `ForbiddenError` / `ProfileMissingError` → `redirect("/")`. Else renders Sidebar, Header, children.
3. **Admin pages**: No extra auth; they run after layout. They call `lib/admin/queries` / `lib/admin/productQueries` (which call `assertAdminEnv()` + `createAdminClient()`).
4. **Admin APIs**: Each route calls `assertAdminEnv()` then `assertAdmin()`. On auth errors return 401/403. Then use `createAdminClient()` for data.
5. **Server actions**: `guardAdmin()` runs `assertAdminEnv()` + `assertAdmin()`. On failure return `{ ok: false, error: "..." }`. Then use `createAdminClient()`.

---

## Role check flow

- **Single source:** `lib/admin/assertAdmin.ts`.
- **Steps:** (1) `getUser()`. (2) Load `profiles.role` (and `full_name`) for `user.id`. (3) No profile → throw `ProfileMissingError`. (4) `role !== 'admin'` → throw `ForbiddenError`. (5) Return `{ user, supabase, profile }`.
- **Used in:** Middleware (passes request-scoped supabase), layout, admin API routes, server actions (via `guardAdmin()`). No duplicate inline checks.

---

## Service role usage

- **Where:** `createAdminClient()` in `lib/supabase/admin.ts` (uses `SUPABASE_SERVICE_ROLE_KEY`). Never exposed to the client.
- **Used by:** `lib/admin/queries.ts`, `lib/admin/productQueries.ts`, `lib/admin/actions.ts`, and admin API routes (`/api/admin/orders`, `/api/admin/orders/[id]`, `/api/admin/expire-orders`).
- **Before use:** Layout and APIs call `assertAdminEnv()` (throws "Admin system misconfigured: service role missing" if any of `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` missing). Queries and actions call `assertAdminEnv()` at the start of each function that uses `createAdminClient()`.

---

## Failure causes

| Cause | What happens |
|-------|----------------|
| **Missing env** | `assertAdminEnv()` throws. Layout/API/server action fails with clear error or 500. No blank screen by design; error is logged and/or thrown. |
| **Not logged in** | Middleware or layout: `NotAuthenticatedError` → redirect to `/login`. API: 401. Actions: `{ ok: false, error: "Not authenticated" }`. |
| **No profile row** | `ProfileMissingError` → middleware/layout redirect `/`. API: 403. Actions: `{ ok: false, error: "Forbidden" }`. |
| **role !== 'admin'** | `ForbiddenError` → middleware/layout redirect `/`. API: 403. Actions: `{ ok: false, error: "Forbidden" }`. |
| **RLS blocks profile read** | Profile fetch fails → `ProfileMissingError` (or DB error). Same as no profile. |
| **Service role key missing** | `assertAdminEnv()` throws before `createAdminClient()`. Message: "Admin system misconfigured: service role missing". |

---

## Health endpoint

- **Route:** `GET /api/admin/health` (no auth required).
- **Response:** `{ env: boolean, serviceRole: boolean, adminUser: boolean, profileExists: boolean }`.
  - `env`: all three env vars present.
  - `serviceRole`: can create service-role client and run a minimal query.
  - `adminUser`: current request has a logged-in user with `profiles.role === 'admin'`.
  - `profileExists`: current user has a `profiles` row.

Use for monitoring and debugging admin access.
