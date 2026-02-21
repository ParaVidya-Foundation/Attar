You are a senior Supabase + PostgreSQL engineer.

Project context:

- This is a production perfume e-commerce.
- The current Supabase database is the FINAL source of truth.
- The schema must NOT be changed.
- No redesign.
- No renaming.
- No new tables.
- No structural changes.
- Only synchronize migrations and backend with the existing database.

Your goal:
Make the project fully aligned with the live Supabase database so that:

- Migrations match the current schema exactly
- No duplicate or conflicting migrations exist
- Local development, staging, and production behave the same
- All API queries match the schema
- No runtime SQL errors
- No breaking changes

---

## Step 1 — Treat Database as Source of Truth

Use the provided schema as the authoritative structure.

DO NOT:

- Add new columns
- Remove columns
- Rename columns
- Change data types
- Change constraints
- Change relationships

If migrations attempt to modify the schema differently, update or remove those migrations instead.

---

## Step 2 — Migration Cleanup

Audit all existing migrations:

1. Identify migrations that:
   - Rename columns that already match final schema
   - Add columns that already exist
   - Drop columns that exist in final schema
   - Change constraints differently than final DB
   - Create duplicate indexes or policies

2. Do the following:
   - Remove obsolete migrations
   - Merge redundant migrations
   - Keep only migrations required to reach the final schema
   - Ensure migrations run cleanly from an empty database to the final structure

3. Create a clean migration history:

Example structure:
001_initial_schema.sql
002_rls_policies.sql
003_indexes.sql
004_functions.sql

Each migration must be:

- Idempotent where possible
- Ordered correctly
- Production safe

---

## Step 3 — RLS Synchronization

Ensure migrations include:

- RLS enabled on:
  - products
  - product_variants
  - product_images
  - categories
  - collections
  - orders
  - order_items
  - profiles

Policies must match production behavior:

Catalog:

- Public read only
- No client write

Orders:

- Users can read their own orders
- No client insert/update/delete
- Service role only for writes

Profiles:

- User can read/update own profile

Do not add extra policies.

---

## Step 4 — Index Synchronization

Ensure migrations create indexes only if missing:

Required indexes:

- products(slug) (already unique)
- product_variants(product_id)
- orders(created_at DESC)
- orders(status)
- order_items(order_id)

Remove duplicate index migrations.

---

## Step 5 — Function Synchronization

Ensure the following production functions exist in migrations:

Inventory:

- decrement_variant_stock(variant_id, qty)
- Must use atomic UPDATE with stock >= qty

Remove old inventory functions that reference legacy tables.

---

## Step 6 — Backend / API Sync

Audit all API code:

Ensure queries match final schema:

orders:

- amount (not total_amount)
- email, name, phone

product_variants:

- size_ml (not name)
- price in smallest unit
- stock field exists

order_items:

- variant_id is required

Remove:

- references to old fields
- references to product_sizes
- references to inventory table

---

## Step 7 — Data Safety

Ensure migrations:

- Never drop tables with data
- Never drop columns unless confirmed unused
- Use IF EXISTS / IF NOT EXISTS where appropriate

---

## Step 8 — Output

Provide:

1. Clean migration list (final order)
2. List of removed/obsolete migrations
3. Any API changes made
4. Confirmation checklist:

- Schema matches production
- Migrations run clean from empty DB
- No duplicate constraints
- No duplicate indexes
- RLS enabled correctly
- Backend queries aligned

---

Important constraints:

- Do NOT change schema design
- Do NOT suggest improvements
- Do NOT add new features
- Only synchronization and stabilization
- Production safety first

-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.categories (
id uuid NOT NULL DEFAULT gen_random_uuid(),
name text NOT NULL,
slug text NOT NULL UNIQUE,
description text,
created_at timestamp with time zone DEFAULT now(),
CONSTRAINT categories_pkey PRIMARY KEY (id)
);
CREATE TABLE public.collections (
id uuid NOT NULL DEFAULT gen_random_uuid(),
name text NOT NULL,
slug text NOT NULL UNIQUE,
created_at timestamp with time zone DEFAULT now(),
CONSTRAINT collections_pkey PRIMARY KEY (id)
);
CREATE TABLE public.order_items (
id uuid NOT NULL DEFAULT gen_random_uuid(),
order_id uuid NOT NULL,
product_id uuid NOT NULL,
variant_id uuid NOT NULL,
quantity integer NOT NULL CHECK (quantity > 0),
price integer NOT NULL,
CONSTRAINT order_items_pkey PRIMARY KEY (id),
CONSTRAINT order_items_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id),
CONSTRAINT order_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id),
CONSTRAINT order_items_variant_id_fkey FOREIGN KEY (variant_id) REFERENCES public.product_variants(id)
);
CREATE TABLE public.orders (
id uuid NOT NULL DEFAULT gen_random_uuid(),
user_id uuid,
email text NOT NULL,
name text,
phone text,
amount integer NOT NULL CHECK (amount >= 0),
currency text DEFAULT 'INR'::text,
status text DEFAULT 'pending'::text,
razorpay_order_id text UNIQUE,
razorpay_payment_id text UNIQUE,
created_at timestamp with time zone DEFAULT now(),
updated_at timestamp with time zone DEFAULT now(),
CONSTRAINT orders_pkey PRIMARY KEY (id),
CONSTRAINT orders_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.product_collections (
product_id uuid NOT NULL,
collection_id uuid NOT NULL,
CONSTRAINT product_collections_pkey PRIMARY KEY (product_id, collection_id),
CONSTRAINT product_collections_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id),
CONSTRAINT product_collections_collection_id_fkey FOREIGN KEY (collection_id) REFERENCES public.collections(id)
);
CREATE TABLE public.product_images (
id uuid NOT NULL DEFAULT gen_random_uuid(),
product_id uuid NOT NULL,
image_url text NOT NULL,
is_primary boolean DEFAULT false,
sort_order integer DEFAULT 0,
CONSTRAINT product_images_pkey PRIMARY KEY (id)
);
CREATE TABLE public.product_variants (
id uuid NOT NULL DEFAULT gen_random_uuid(),
product_id uuid NOT NULL,
size_ml integer NOT NULL,
price integer NOT NULL CHECK (price >= 0),
sku text,
stock integer DEFAULT 0 CHECK (stock >= 0),
created_at timestamp with time zone DEFAULT now(),
CONSTRAINT product_variants_pkey PRIMARY KEY (id),
CONSTRAINT product_variants_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id)
);
CREATE TABLE public.products (
id uuid NOT NULL DEFAULT gen_random_uuid(),
name text NOT NULL,
slug text NOT NULL UNIQUE,
description text,
short_description text,
category_id uuid,
price integer NOT NULL CHECK (price >= 0),
original_price integer,
featured boolean DEFAULT false,
is_active boolean DEFAULT true,
meta_title text,
meta_description text,
created_at timestamp with time zone DEFAULT now(),
updated_at timestamp with time zone DEFAULT now(),
CONSTRAINT products_pkey PRIMARY KEY (id),
CONSTRAINT products_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id)
);
CREATE TABLE public.profiles (
id uuid NOT NULL,
email text,
full_name text,
first_name text,
last_name text,
phone text,
role text DEFAULT 'user'::text,
created_at timestamp with time zone DEFAULT now(),
updated_at timestamp with time zone DEFAULT now(),
CONSTRAINT profiles_pkey PRIMARY KEY (id),
CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id)
);
