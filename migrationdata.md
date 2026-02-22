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
CONSTRAINT product_images_pkey PRIMARY KEY (id),
CONSTRAINT product_images_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id)
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
price integer NOT NULL DEFAULT 0 CHECK (price >= 0),
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
