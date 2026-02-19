-- Attar E-Commerce: Initial Schema
-- Products, inventory, orders, payments, profiles, analytics
-- Run: supabase db push or supabase migration up

-- Enable pgvector for future semantic search (embeddings)
CREATE EXTENSION IF NOT EXISTS vector;

-- -----------------------------------------------------------------------------
-- PROFILES (extends Supabase auth.users)
-- -----------------------------------------------------------------------------
CREATE TABLE profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  avatar_url text,
  phone text,
  role text NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_profiles_role ON profiles(role);

-- -----------------------------------------------------------------------------
-- CATEGORIES
-- -----------------------------------------------------------------------------
CREATE TABLE categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug varchar(255) NOT NULL UNIQUE,
  name varchar(255) NOT NULL,
  meta_title varchar(255),
  meta_description text,
  parent_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  deleted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_categories_slug ON categories(slug) WHERE deleted_at IS NULL;
CREATE INDEX idx_categories_parent ON categories(parent_id);

-- -----------------------------------------------------------------------------
-- COLLECTIONS (planets, zodiac, incense, etc.)
-- -----------------------------------------------------------------------------
CREATE TABLE collections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug varchar(255) NOT NULL UNIQUE,
  name varchar(255) NOT NULL,
  meta_title varchar(255),
  meta_description text,
  deleted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_collections_slug ON collections(slug) WHERE deleted_at IS NULL;

-- -----------------------------------------------------------------------------
-- PRODUCTS
-- -----------------------------------------------------------------------------
CREATE TABLE products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug varchar(255) NOT NULL UNIQUE,
  name varchar(255) NOT NULL,
  description text,
  origin text,
  notes jsonb,
  zodiac text[] DEFAULT '{}',
  planet varchar(100),
  longevity varchar(100),
  spiritual_benefits text[] DEFAULT '{}',
  badges text[] DEFAULT '{}',
  price integer NOT NULL,
  currency varchar(10) NOT NULL DEFAULT 'INR',
  meta_title varchar(255),
  meta_description text,
  embedding vector(1536),
  deleted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_products_slug ON products(slug) WHERE deleted_at IS NULL;
CREATE INDEX idx_products_deleted ON products(deleted_at) WHERE deleted_at IS NULL;

-- Full-text search on name + description
ALTER TABLE products ADD COLUMN IF NOT EXISTS search_vector tsvector
  GENERATED ALWAYS AS (to_tsvector('english', coalesce(name, '') || ' ' || coalesce(description, ''))) STORED;
CREATE INDEX idx_products_search ON products USING GIN(search_vector);

-- pgvector similarity search: run after seeding products (ivfflat requires rows)
-- CREATE INDEX idx_products_embedding ON products
--   USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100)
--   WHERE embedding IS NOT NULL AND deleted_at IS NULL;
-- Uncomment in 003_pgvector_index.sql or run manually after seed

-- -----------------------------------------------------------------------------
-- PRODUCT_IMAGES
-- -----------------------------------------------------------------------------
CREATE TABLE product_images (
  id serial PRIMARY KEY,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  url text NOT NULL,
  alt text,
  position int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_product_images_product ON product_images(product_id);

-- -----------------------------------------------------------------------------
-- PRODUCT_SIZES (ml + price per size)
-- -----------------------------------------------------------------------------
CREATE TABLE product_sizes (
  id serial PRIMARY KEY,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  size_ml int NOT NULL,
  price integer NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(product_id, size_ml)
);

CREATE INDEX idx_product_sizes_product ON product_sizes(product_id);

-- -----------------------------------------------------------------------------
-- PRODUCT_CATEGORIES (many-to-many)
-- -----------------------------------------------------------------------------
CREATE TABLE product_categories (
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  category_id uuid NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  PRIMARY KEY (product_id, category_id)
);

CREATE INDEX idx_product_categories_category ON product_categories(category_id);

-- -----------------------------------------------------------------------------
-- PRODUCT_COLLECTIONS (many-to-many)
-- -----------------------------------------------------------------------------
CREATE TABLE product_collections (
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  collection_id uuid NOT NULL REFERENCES collections(id) ON DELETE CASCADE,
  PRIMARY KEY (product_id, collection_id)
);

CREATE INDEX idx_product_collections_collection ON product_collections(collection_id);

-- -----------------------------------------------------------------------------
-- INVENTORY (stock per product + size)
-- -----------------------------------------------------------------------------
CREATE TABLE inventory (
  id serial PRIMARY KEY,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  size_ml int NOT NULL,
  stock int NOT NULL DEFAULT 0 CHECK (stock >= 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(product_id, size_ml)
);

CREATE INDEX idx_inventory_product_size ON inventory(product_id, size_ml);

-- -----------------------------------------------------------------------------
-- ADDRESSES
-- -----------------------------------------------------------------------------
CREATE TABLE addresses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  label varchar(100),
  line1 text NOT NULL,
  line2 text,
  city varchar(100) NOT NULL,
  state varchar(100),
  postal_code varchar(20),
  country varchar(2) NOT NULL DEFAULT 'IN',
  phone text,
  is_default boolean DEFAULT false,
  deleted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_addresses_user ON addresses(user_id) WHERE deleted_at IS NULL;

-- -----------------------------------------------------------------------------
-- ORDERS
-- -----------------------------------------------------------------------------
CREATE TABLE orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  status varchar(50) NOT NULL DEFAULT 'created' CHECK (status IN ('created', 'pending', 'paid', 'failed', 'cancelled')),
  total_amount integer NOT NULL,
  currency varchar(10) NOT NULL DEFAULT 'INR',
  razorpay_order_id varchar(255),
  razorpay_payment_id varchar(255),
  shipping_address_id uuid REFERENCES addresses(id) ON DELETE SET NULL,
  deleted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_razorpay ON orders(razorpay_order_id) WHERE razorpay_order_id IS NOT NULL;
CREATE INDEX idx_orders_created ON orders(created_at DESC);

-- -----------------------------------------------------------------------------
-- ORDER_ITEMS
-- -----------------------------------------------------------------------------
CREATE TABLE order_items (
  id serial PRIMARY KEY,
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  size_ml int NOT NULL,
  qty int NOT NULL CHECK (qty > 0),
  unit_price integer NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_order_items_order ON order_items(order_id);

-- -----------------------------------------------------------------------------
-- PAYMENTS (Razorpay payment records)
-- -----------------------------------------------------------------------------
CREATE TABLE payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  razorpay_payment_id varchar(255) NOT NULL UNIQUE,
  razorpay_order_id varchar(255),
  status varchar(50) NOT NULL DEFAULT 'pending',
  amount integer NOT NULL,
  currency varchar(10) NOT NULL DEFAULT 'INR',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_payments_order ON payments(order_id);
CREATE INDEX idx_payments_razorpay ON payments(razorpay_payment_id);

-- -----------------------------------------------------------------------------
-- REVIEWS
-- -----------------------------------------------------------------------------
CREATE TABLE reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating int NOT NULL CHECK (rating >= 1 AND rating <= 5),
  body text,
  deleted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(product_id, user_id)
);

CREATE INDEX idx_reviews_product ON reviews(product_id) WHERE deleted_at IS NULL;

-- -----------------------------------------------------------------------------
-- CARTS (optional persistent)
-- -----------------------------------------------------------------------------
CREATE TABLE carts (
  id serial PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  size_ml int NOT NULL,
  qty int NOT NULL DEFAULT 1 CHECK (qty > 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, product_id, size_ml)
);

CREATE INDEX idx_carts_user ON carts(user_id);

-- -----------------------------------------------------------------------------
-- ANALYTICS_EVENTS (lightweight)
-- -----------------------------------------------------------------------------
CREATE TABLE analytics_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type varchar(100) NOT NULL,
  payload jsonb,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id varchar(255),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_analytics_events_type ON analytics_events(event_type);
CREATE INDEX idx_analytics_events_created ON analytics_events(created_at);

-- -----------------------------------------------------------------------------
-- UPDATED_AT TRIGGER
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER categories_updated_at BEFORE UPDATE ON categories
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER collections_updated_at BEFORE UPDATE ON collections
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER products_updated_at BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER inventory_updated_at BEFORE UPDATE ON inventory
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER addresses_updated_at BEFORE UPDATE ON addresses
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER orders_updated_at BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER reviews_updated_at BEFORE UPDATE ON reviews
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER carts_updated_at BEFORE UPDATE ON carts
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Auto-create profile on auth.users insert
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
