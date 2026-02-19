-- Attar E-Commerce: Row Level Security (RLS) Policies
-- NOTE: Adapt policy names and project-specific conditions for your deployed Supabase project.
-- Ensure auth.uid() and public schema are correctly referenced.

-- Enable RLS on all relevant tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_sizes ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

-- -----------------------------------------------------------------------------
-- PROFILES: users read/update own
-- -----------------------------------------------------------------------------
CREATE POLICY "profiles_select_own" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "profiles_update_own" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "profiles_insert_own" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- -----------------------------------------------------------------------------
-- CATEGORIES: public read; admin write (service role bypasses RLS)
-- -----------------------------------------------------------------------------
CREATE POLICY "categories_select_public" ON categories
  FOR SELECT USING (deleted_at IS NULL);

-- -----------------------------------------------------------------------------
-- COLLECTIONS: public read
-- -----------------------------------------------------------------------------
CREATE POLICY "collections_select_public" ON collections
  FOR SELECT USING (deleted_at IS NULL);

-- -----------------------------------------------------------------------------
-- PRODUCTS: public read; admin write via service role
-- -----------------------------------------------------------------------------
CREATE POLICY "products_select_public" ON products
  FOR SELECT USING (deleted_at IS NULL);

-- -----------------------------------------------------------------------------
-- PRODUCT_IMAGES: public read via product
-- -----------------------------------------------------------------------------
CREATE POLICY "product_images_select_public" ON product_images
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM products p WHERE p.id = product_id AND p.deleted_at IS NULL)
  );

-- -----------------------------------------------------------------------------
-- PRODUCT_SIZES: public read
-- -----------------------------------------------------------------------------
CREATE POLICY "product_sizes_select_public" ON product_sizes
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM products p WHERE p.id = product_id AND p.deleted_at IS NULL)
  );

-- -----------------------------------------------------------------------------
-- PRODUCT_CATEGORIES / PRODUCT_COLLECTIONS: public read
-- -----------------------------------------------------------------------------
CREATE POLICY "product_categories_select_public" ON product_categories
  FOR SELECT USING (true);

CREATE POLICY "product_collections_select_public" ON product_collections
  FOR SELECT USING (true);

-- -----------------------------------------------------------------------------
-- INVENTORY: public read (for product pages); write via service role
-- -----------------------------------------------------------------------------
CREATE POLICY "inventory_select_public" ON inventory
  FOR SELECT USING (true);

-- -----------------------------------------------------------------------------
-- ADDRESSES: users CRUD own
-- -----------------------------------------------------------------------------
CREATE POLICY "addresses_select_own" ON addresses
  FOR SELECT USING (auth.uid() = user_id AND deleted_at IS NULL);

CREATE POLICY "addresses_insert_own" ON addresses
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "addresses_update_own" ON addresses
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "addresses_delete_own" ON addresses
  FOR DELETE USING (auth.uid() = user_id);

-- -----------------------------------------------------------------------------
-- ORDERS: users read own; insert via Edge Function (service role)
-- -----------------------------------------------------------------------------
CREATE POLICY "orders_select_own" ON orders
  FOR SELECT USING (auth.uid() = user_id AND deleted_at IS NULL);

-- Order insert/update done by Edge Function with service role (bypasses RLS)

-- -----------------------------------------------------------------------------
-- ORDER_ITEMS: read via order ownership
-- -----------------------------------------------------------------------------
CREATE POLICY "order_items_select_via_order" ON order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM orders o
      WHERE o.id = order_id AND o.user_id = auth.uid() AND o.deleted_at IS NULL
    )
  );

-- -----------------------------------------------------------------------------
-- PAYMENTS: service role only (no direct user access)
-- -----------------------------------------------------------------------------
-- No SELECT policy for regular users; service role bypasses RLS
CREATE POLICY "payments_no_public_select" ON payments
  FOR SELECT USING (false);

-- -----------------------------------------------------------------------------
-- REVIEWS: public read; authenticated insert own
-- -----------------------------------------------------------------------------
CREATE POLICY "reviews_select_public" ON reviews
  FOR SELECT USING (deleted_at IS NULL);

CREATE POLICY "reviews_insert_auth" ON reviews
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "reviews_update_own" ON reviews
  FOR UPDATE USING (auth.uid() = user_id);

-- -----------------------------------------------------------------------------
-- CARTS: users CRUD own
-- -----------------------------------------------------------------------------
CREATE POLICY "carts_select_own" ON carts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "carts_insert_own" ON carts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "carts_update_own" ON carts
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "carts_delete_own" ON carts
  FOR DELETE USING (auth.uid() = user_id);

-- -----------------------------------------------------------------------------
-- ANALYTICS_EVENTS: insert only (service/client with anon); no user read
-- -----------------------------------------------------------------------------
CREATE POLICY "analytics_events_insert" ON analytics_events
  FOR INSERT WITH CHECK (true);
