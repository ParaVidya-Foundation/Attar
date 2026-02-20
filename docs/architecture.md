# Architecture Documentation

**Project:** Anand Ras — Luxury Attar E-Commerce  
**Stack:** Next.js 16 (App Router) · Supabase · Razorpay · AWS Amplify  
**Updated:** 2026-02-20

---

## System Overview

```
┌─────────────────────────────────────────────────────────┐
│                     AWS Amplify                         │
│  ┌───────────────────────────────────────────────────┐  │
│  │              Next.js 16 (Standalone)              │  │
│  │                                                   │  │
│  │  ┌─────────────┐  ┌────────────┐  ┌───────────┐  │  │
│  │  │   Server     │  │   API      │  │ Middleware │  │  │
│  │  │ Components   │  │  Routes    │  │  (Auth)   │  │  │
│  │  └──────┬───────┘  └─────┬──────┘  └─────┬─────┘  │  │
│  │         │                │               │        │  │
│  │  ┌──────▼────────────────▼───────────────▼─────┐  │  │
│  │  │          Supabase Client Layer              │  │  │
│  │  │  Server Client │ Browser Client │ Admin     │  │  │
│  │  └──────┬─────────┴───────┬────────┴────┬──────┘  │  │
│  └─────────┼─────────────────┼─────────────┼─────────┘  │
└────────────┼─────────────────┼─────────────┼────────────┘
             │                 │             │
     ┌───────▼─────────────────▼─────────────▼──────┐
     │              Supabase Cloud                   │
     │  ┌──────────┐  ┌──────┐  ┌───────────────┐   │
     │  │ Postgres  │  │ Auth │  │ Edge Functions│   │
     │  │ + RLS     │  │      │  │               │   │
     │  └──────────┘  └──────┘  └───────────────┘   │
     └──────────────────────────────────────────────┘
             │
     ┌───────▼──────────────────────────────────────┐
     │              Razorpay                         │
     │  Order Creation · Checkout · Webhooks         │
     └──────────────────────────────────────────────┘
```

---

## Auth Flow

```
User visits protected route (/account, /admin, /checkout)
  │
  ▼
Middleware (middleware.ts)
  ├── Creates Supabase server client with cookie access
  ├── Calls supabase.auth.getUser() to validate session
  ├── If no user → redirect to /login
  ├── If /admin → query profiles.role
  │     └── If not 'admin' → redirect to /
  └── Pass through with refreshed cookies
  
Login Flow:
  Browser → supabase.auth.signInWithPassword() → Cookie set → router.push("/")
  
Google OAuth:
  Browser → supabase.auth.signInWithOAuth() → Google → /auth/callback
  /auth/callback → exchangeCodeForSession() → Cookie set → redirect
  
Signup:
  Browser → supabase.auth.signUp({ data: { full_name } })
  Trigger: handle_new_user() → INSERT INTO profiles (id, email, first_name, last_name, role)
  
Logout:
  Browser: supabase.auth.signOut() + router.push("/") + router.refresh()
  Server:  GET /logout → supabase.auth.signOut() → redirect "/"

Session Storage: HTTP-only cookies via @supabase/ssr
Admin Role: profiles.role = 'admin' (checked in middleware + layout + server actions)
```

### Protected Routes

| Route Pattern | Protection Level |
|--------------|-----------------|
| `/account/*` | Authenticated user (middleware + requireUser) |
| `/admin/*` | Admin role (middleware + requireAdmin) |
| `POST /api/orders` | Authenticated user (getUser in handler) |
| `POST /api/webhooks/razorpay` | Razorpay signature verification |
| `POST /api/orders/verify` | Authenticated user + signature check |

---

## Order Flow

```
1. CART (Client-side localStorage)
   User adds items via CartProvider → stored in "sm_cart_v1"
   CartLine: { id, slug, name, imageUrl, ml, price, qty }

2. CHECKOUT (CartDrawer → API)
   User clicks "Checkout" in cart drawer
   │
   ▼
   POST /api/orders
   ├── Validate cart with Zod schema
   ├── Verify user auth via getUser()
   ├── For each item:
   │   ├── Lookup price from product_sizes (NEVER trust client price)
   │   └── Check inventory stock
   ├── Create Razorpay order (amount in paise)
   ├── INSERT into orders (status: 'created')
   ├── INSERT into order_items
   └── Return { orderId, razorpayOrderId, amount, keyId }

3. PAYMENT (Client-side Razorpay SDK)
   Load checkout.razorpay.com/v1/checkout.js
   Open Razorpay modal with order details
   │
   ├── On Success:
   │   POST /api/orders/verify
   │   ├── Verify razorpay_signature using HMAC-SHA256
   │   └── Return { ok: true }
   │   Client: clear cart → redirect to /account/orders
   │
   └── On Failure:
       Display error in cart drawer

4. WEBHOOK (Authoritative payment confirmation)
   POST /api/webhooks/razorpay
   ├── Verify x-razorpay-signature header (HMAC-SHA256)
   ├── Parse event type
   │
   ├── payment.captured:
   │   ├── Find order by razorpay_order_id
   │   ├── UPDATE orders SET status = 'paid'
   │   ├── INSERT into payments
   │   └── Decrement inventory (RPC: decrement_inventory)
   │
   └── payment.failed:
       UPDATE orders SET status = 'failed'

5. STATUS LIFECYCLE
   created → paid → shipped → delivered
                  → failed
                  → cancelled
```

### Order Amount Convention

- **Database** (`orders.total_amount`): Stored in **rupees** (integer)
- **Razorpay API**: Amount in **paise** (rupees × 100)
- **Display**: Formatted as ₹X,XXX using Intl.NumberFormat

---

## Admin Flow

```
/admin (Dashboard)
  ├── DashboardStats: total products, orders, customers, revenue
  │   (Queries via createAdminClient → service role, bypasses RLS)
  │
  ├── /admin/products
  │   ├── List: paginated (20/page), searchable by name
  │   ├── Create: ProductForm → createProduct() server action
  │   ├── Edit: /admin/products/[id] → updateProduct()
  │   ├── Toggle: toggleProductActive() (soft active/inactive)
  │   └── Delete: deleteProduct() (soft delete via deleted_at)
  │
  ├── /admin/orders
  │   ├── List: paginated, with customer email from profiles
  │   └── Status update: updateOrderStatus() dropdown
  │
  ├── /admin/customers
  │   └── Aggregated: email, order count, total spent
  │
  └── /admin/analytics
      ├── 7-day order/revenue charts (Recharts)
      └── Top 10 products by quantity sold

Security:
  - Middleware: user must have profiles.role = 'admin'
  - Layout: requireAdmin() server-side check
  - Server Actions: requireAdmin() before every mutation
  - Queries: createAdminClient() with SUPABASE_SERVICE_ROLE_KEY
```

---

## Database Diagram

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   auth.users    │     │    profiles      │     │   addresses     │
│─────────────────│     │─────────────────│     │─────────────────│
│ id (PK)         │◄───►│ id (PK/FK)      │     │ id (PK)         │
│ email           │     │ email           │     │ user_id (FK)    │
│ ...             │     │ first_name      │     │ line1, line2    │
│                 │     │ last_name       │     │ city, state     │
│                 │     │ phone           │     │ postal_code     │
│                 │     │ role            │     │ is_default      │
│                 │     │ birthday        │     │ deleted_at      │
└────────┬────────┘     └─────────────────┘     └─────────────────┘
         │
         │ user_id
┌────────▼────────┐     ┌─────────────────┐     ┌─────────────────┐
│    orders       │     │  order_items    │     │   payments      │
│─────────────────│     │─────────────────│     │─────────────────│
│ id (PK)         │◄───►│ order_id (FK)   │     │ id (PK)         │
│ user_id (FK)    │     │ product_id (FK) │     │ order_id (FK)   │
│ email           │     │ size_ml         │     │ razorpay_payment│
│ status          │     │ qty             │     │ razorpay_order  │
│ total_amount    │     │ unit_price      │     │ status          │
│ razorpay_order  │     └─────────────────┘     │ amount          │
│ razorpay_payment│                             └─────────────────┘
│ shipping_addr   │
└─────────────────┘

┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   products      │     │ product_sizes   │     │  product_images │
│─────────────────│     │─────────────────│     │─────────────────│
│ id (PK)         │◄───►│ product_id (FK) │     │ product_id (FK) │
│ slug (unique)   │     │ size_ml         │     │ url             │
│ name            │     │ price           │     │ alt             │
│ price           │     └─────────────────┘     │ position        │
│ original_price  │                             └─────────────────┘
│ stock           │     ┌─────────────────┐
│ category_id(FK) │     │   inventory     │
│ is_active       │◄───►│─────────────────│
│ image_url       │     │ product_id (FK) │
│ description     │     │ size_ml         │
│ deleted_at      │     │ stock           │
└────────┬────────┘     └─────────────────┘
         │
         │ product_id          ┌─────────────────┐
┌────────▼────────┐           │   categories    │
│product_categories│◄─────────│─────────────────│
│─────────────────│           │ id (PK)         │
│ product_id (FK) │           │ slug (unique)   │
│ category_id(FK) │           │ name            │
└─────────────────┘           │ parent_id (FK)  │
                              └─────────────────┘
Additional tables: collections, product_collections, reviews, carts, analytics_events
```

### RLS Policies Summary

| Table | Read | Write | Notes |
|-------|------|-------|-------|
| products | Public (is_active=true) | Admin only | Via service role |
| profiles | Own record | Own record | Insert on signup trigger |
| orders | Own record | Own insert | Admin via service role |
| order_items | Via order ownership | Service role | Cascade from orders |
| payments | None (service role only) | Service role | Webhook inserts |
| addresses | Own records | Own CRUD | Soft delete |
| categories | Public (active) | Admin only | Via service role |
| inventory | Public read | Service role | Decremented by webhook |

---

## Deployment Notes (AWS Amplify)

### Build Settings

```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - npm ci
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: .next
    files:
      - '**/*'
  cache:
    paths:
      - node_modules/**/*
```

### Environment Variables Required

| Variable | Location | Purpose |
|----------|----------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Build + Runtime | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Build + Runtime | Supabase anonymous key |
| `SUPABASE_SERVICE_ROLE_KEY` | Runtime only | Admin operations (never expose) |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | Build + Runtime | Razorpay public key |
| `RAZORPAY_KEY_SECRET` | Runtime only | Razorpay server secret |
| `RAZORPAY_WEBHOOK_SECRET` | Runtime only | Webhook signature verification |
| `NEXT_PUBLIC_SITE_URL` | Build + Runtime | Canonical URL for SEO |

### Razorpay Webhook Setup

1. Go to Razorpay Dashboard → Webhooks
2. Add URL: `https://your-domain.com/api/webhooks/razorpay`
3. Select events: `payment.captured`, `payment.failed`
4. Copy webhook secret → set as `RAZORPAY_WEBHOOK_SECRET`

### Database Migrations

Run migrations in order against your Supabase project:

```bash
# Via Supabase CLI
supabase db push

# Or manually via SQL editor (in order):
# 001_initial_schema.sql
# 002_rls_policies.sql
# 003_products_simple_alignment.sql
# 004_admin_extras.sql
# 005_admin_indexes.sql
# 006_profile_columns.sql
# 007_order_webhook_support.sql
```

### Performance Configuration

- **ISR**: Product pages revalidate every 3600s (1 hour)
- **Sitemap**: Revalidates every 3600s from Supabase
- **Standalone output**: Optimized for containerized deployment
- **Image optimization**: AVIF + WebP, 1-year cache TTL
- **Console stripping**: Production removes console.log (keeps error/warn)

### Security Headers

CSP, HSTS, X-Frame-Options (DENY), X-Content-Type-Options (nosniff), Referrer-Policy, Permissions-Policy — all configured in `next.config.mjs`.

---

## File Structure

```
├── app/
│   ├── layout.tsx              # Root layout (CartProvider, Header, Footer)
│   ├── page.tsx                # Home page
│   ├── login/page.tsx          # Email/password + Google OAuth
│   ├── signup/page.tsx         # Registration
│   ├── auth/callback/route.ts  # OAuth callback
│   ├── logout/route.ts         # Server-side logout
│   ├── shop/page.tsx           # Product listing with filters
│   ├── product/[slug]/page.tsx # Product detail (ISR, JSON-LD)
│   ├── category/[slug]/page.tsx# Category filtered view
│   ├── cart/page.tsx           # Full cart page
│   ├── account/
│   │   ├── layout.tsx          # Protected layout (requireUser)
│   │   ├── page.tsx            # Profile management
│   │   ├── orders/page.tsx     # Order history
│   │   ├── orders/[id]/page.tsx# Order detail
│   │   ├── address/page.tsx    # Address management
│   │   └── change-password/    # Password change
│   ├── admin/
│   │   ├── layout.tsx          # Admin layout (requireAdmin)
│   │   ├── page.tsx            # Dashboard
│   │   ├── products/           # Product CRUD
│   │   ├── orders/page.tsx     # Order management
│   │   ├── customers/page.tsx  # Customer list
│   │   └── analytics/page.tsx  # Charts
│   ├── api/
│   │   ├── orders/route.ts     # Order creation
│   │   ├── orders/verify/route.ts # Payment verification
│   │   └── webhooks/razorpay/route.ts # Payment webhook
│   └── sitemap.ts              # Dynamic sitemap from Supabase
├── components/
│   ├── cart/CartProvider.tsx    # Cart context + useLocalCart
│   ├── cart/CartDrawer.tsx      # Slide-out cart with Razorpay checkout
│   ├── auth/UserMenu.tsx        # Auth-aware user dropdown
│   ├── admin/                   # Admin panel components
│   └── ...                      # UI, product, shop, home components
├── lib/
│   ├── auth.ts                  # getUser, requireUser, requireAdmin
│   ├── env.ts                   # Zod environment validation
│   ├── fetchers.ts              # Product/category data fetchers
│   ├── seo.ts                   # Metadata helpers, JSON-LD builders
│   ├── supabase/server.ts       # Server Supabase client (cookies)
│   ├── supabase/browser.ts      # Browser Supabase client
│   ├── supabase/admin.ts        # Service role client (server only)
│   ├── payments/razorpay.ts     # Razorpay helpers (create order, verify)
│   └── admin/                   # Admin queries + actions
├── middleware.ts                # Auth + admin role protection
├── supabase/migrations/         # 7 sequential SQL migrations
└── docs/
    ├── system-audit.md          # Full system audit report
    └── architecture.md          # This file
```
