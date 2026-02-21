-- Production Hardening: FKs with correct ON DELETE, unique constraints, indexes, inventory function.
-- No schema redesign; only missing constraints and indexes.

-- -----------------------------------------------------------------------------
-- 1. FOREIGN KEYS — ensure CASCADE/RESTRICT
-- -----------------------------------------------------------------------------
-- product_images: CASCADE when product deleted
ALTER TABLE public.product_images
  DROP CONSTRAINT IF EXISTS product_images_product_id_fkey;
ALTER TABLE public.product_images
  ADD CONSTRAINT product_images_product_id_fkey
  FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;

-- product_variants: CASCADE when product deleted
ALTER TABLE public.product_variants
  DROP CONSTRAINT IF EXISTS product_variants_product_id_fkey;
ALTER TABLE public.product_variants
  ADD CONSTRAINT product_variants_product_id_fkey
  FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;

-- order_items: CASCADE when order deleted; RESTRICT on variant (block variant delete if in order)
ALTER TABLE public.order_items
  DROP CONSTRAINT IF EXISTS order_items_order_id_fkey;
ALTER TABLE public.order_items
  ADD CONSTRAINT order_items_order_id_fkey
  FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE;

ALTER TABLE public.order_items
  DROP CONSTRAINT IF EXISTS order_items_variant_id_fkey;
ALTER TABLE public.order_items
  ADD CONSTRAINT order_items_variant_id_fkey
  FOREIGN KEY (variant_id) REFERENCES public.product_variants(id) ON DELETE RESTRICT;

-- -----------------------------------------------------------------------------
-- 2. UNIQUE CONSTRAINTS
-- -----------------------------------------------------------------------------
-- products.slug, categories.slug, collections.slug already UNIQUE in 001.

-- product_variants: one row per (product_id, size_ml)
CREATE UNIQUE INDEX IF NOT EXISTS idx_product_variants_product_size
  ON public.product_variants(product_id, size_ml);

-- orders: razorpay_order_id already UNIQUE; razorpay_payment_id unique when not null (partial index)
DROP INDEX IF EXISTS orders_razorpay_payment_id_key;
ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_razorpay_payment_id_key;
CREATE UNIQUE INDEX IF NOT EXISTS idx_orders_razorpay_payment_id
  ON public.orders(razorpay_payment_id) WHERE razorpay_payment_id IS NOT NULL;

-- -----------------------------------------------------------------------------
-- 3. DATA INTEGRITY (CHECK constraints) — add only if missing
-- -----------------------------------------------------------------------------
-- 001 already has: products.price >= 0, product_variants.price/stock >= 0,
-- order_items.quantity > 0, orders.amount >= 0, orders.email NOT NULL.
-- No changes if already present (ALTER TABLE ... ADD CONSTRAINT ... CHECK only if not exists not standard; skip if exists).

-- -----------------------------------------------------------------------------
-- 4. INDEXES (performance) — 003 already has variant/order/order_items indexes
-- -----------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_products_active ON public.products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category_id);

-- -----------------------------------------------------------------------------
-- 5. INVENTORY SAFETY — decrement_variant_stock with RETURNING id
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.decrement_variant_stock(
  p_variant_id uuid,
  p_qty integer
) RETURNS void AS $$
DECLARE
  v_id uuid;
BEGIN
  UPDATE public.product_variants
  SET stock = stock - p_qty
  WHERE id = p_variant_id
    AND stock >= p_qty
  RETURNING id INTO v_id;

  IF v_id IS NULL THEN
    RAISE EXCEPTION 'Insufficient stock for variant %', p_variant_id;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
