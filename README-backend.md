# Attar E-Commerce — Backend Setup

Backend stack: Supabase (Postgres, Auth, Storage, Edge Functions) + Razorpay + Next.js API.

## Prerequisites

- Node 18+
- [Supabase CLI](https://supabase.com/docs/guides/cli)
- [Razorpay](https://razorpay.com/) account

## Local Development

### 1. Create Supabase Project

1. Go to [supabase.com/dashboard](https://supabase.com/dashboard)
2. Create a new project
3. Copy **Project URL** and **anon key** from Settings → API
4. Copy **service_role key** (keep secret)

### 2. Environment Variables

```bash
cp .env.example .env.local
```

Edit `.env.local` with:

- `NEXT_PUBLIC_SUPABASE_URL` — Project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — anon key
- `SUPABASE_SERVICE_ROLE_KEY` — service role key
- `NEXT_PUBLIC_RAZORPAY_KEY_ID` — Razorpay key id
- `RAZORPAY_KEY_SECRET` — Razorpay secret

### 3. Run Migrations

**Option A: Supabase linked (local)**

```bash
supabase login
supabase link --project-ref YOUR_PROJECT_REF
./scripts/migrate.sh up
```

**Option B: Remote only (SQL in dashboard)**

1. Supabase Dashboard → SQL Editor
2. Run `supabase/migrations/001_initial_schema.sql`
3. Run `supabase/migrations/002_rls_policies.sql`

### 4. Seed Products

```bash
# Dry run first
pnpm tsx supabase/seed/seed_products.ts --dry-run

# Actual seed
pnpm tsx supabase/seed/seed_products.ts
```

Requires `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` in env.

### 5. Start Dev Server

```bash
pnpm install
pnpm dev
```

- App: http://localhost:3000
- Product page: http://localhost:3000/product/rajani-gulab (after seed)

## Edge Functions

### Deploy create-order

```bash
# Set secrets (get from Supabase Dashboard → Settings → Edge Functions)
supabase secrets set RAZORPAY_KEY_SECRET=your-secret
supabase secrets set NEXT_PUBLIC_RAZORPAY_KEY_ID=your-key-id

supabase functions deploy create-order
```

Supabase automatically provides `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`.

### Local Edge Function (optional)

```bash
supabase functions serve create-order
```

Then point Next.js to `http://localhost:54321/functions/v1/create-order` for local testing.

## API Routes

- `POST /api/orders` — Create order, returns Razorpay order info. Requires auth.

Request body:

```json
{
  "cart": {
    "items": [{ "productId": "uuid", "size_ml": 3, "qty": 1 }]
  }
}
```

## Manual Checklist (Local)

- [ ] Create Supabase project
- [ ] Copy `.env.example` → `.env.local`
- [ ] Fill Supabase + Razorpay keys
- [ ] Run migrations (`./scripts/migrate.sh up` or SQL in dashboard)
- [ ] Run seed (`pnpm tsx supabase/seed/seed_products.ts`)
- [ ] Deploy Edge Function `create-order` (or use `supabase functions serve`)
- [ ] `pnpm dev` and visit `/product/rajani-gulab`
