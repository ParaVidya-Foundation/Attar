-- Attar E-Commerce: RLS policies (aligned with production)
-- Catalog: public read only, no client write. Orders: users read own; no client insert. Profiles: read/update own.

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- -----------------------------------------------------------------------------
-- CATEGORIES: public read
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "categories_select_public" ON public.categories;
CREATE POLICY "categories_select_public" ON public.categories
  FOR SELECT USING (true);

-- -----------------------------------------------------------------------------
-- COLLECTIONS: public read
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "collections_select_public" ON public.collections;
CREATE POLICY "collections_select_public" ON public.collections
  FOR SELECT USING (true);

-- -----------------------------------------------------------------------------
-- PRODUCTS: public read (active only)
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "products_select_public" ON public.products;
DROP POLICY IF EXISTS "products_public_read" ON public.products;
CREATE POLICY "products_select_public" ON public.products
  FOR SELECT USING (is_active = true);

-- -----------------------------------------------------------------------------
-- PRODUCT_VARIANTS: public read via product
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "product_variants_select_public" ON public.product_variants;
CREATE POLICY "product_variants_select_public" ON public.product_variants
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.products p WHERE p.id = product_id AND p.is_active = true)
  );

-- -----------------------------------------------------------------------------
-- PRODUCT_IMAGES: public read via product
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "product_images_select_public" ON public.product_images;
CREATE POLICY "product_images_select_public" ON public.product_images
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.products p WHERE p.id = product_id AND p.is_active = true)
  );

-- -----------------------------------------------------------------------------
-- PRODUCT_COLLECTIONS: public read
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "product_collections_select_public" ON public.product_collections;
CREATE POLICY "product_collections_select_public" ON public.product_collections
  FOR SELECT USING (true);

-- -----------------------------------------------------------------------------
-- ORDERS: users read own; no client insert/update/delete (service role only for writes)
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "orders_select_own" ON public.orders;
CREATE POLICY "orders_select_own" ON public.orders
  FOR SELECT USING (auth.uid() = user_id);

-- -----------------------------------------------------------------------------
-- ORDER_ITEMS: read via order ownership
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "order_items_select_via_order" ON public.order_items;
CREATE POLICY "order_items_select_via_order" ON public.order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id = order_id AND o.user_id = auth.uid()
    )
  );

-- -----------------------------------------------------------------------------
-- PROFILES: user read/update own
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
CREATE POLICY "profiles_select_own" ON public.profiles
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "profiles_insert_own" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);
