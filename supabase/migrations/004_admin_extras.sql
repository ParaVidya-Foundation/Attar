-- 004: Admin panel extras
-- Extends orders status, adds product columns for admin (stock, image_url)
-- Run: supabase db push or supabase migration up

BEGIN;

-- ============================================================
-- 1) ORDERS: add shipped, delivered to status
-- ============================================================
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_status_check;
ALTER TABLE orders ADD CONSTRAINT orders_status_check CHECK (
  status IN ('created', 'pending', 'paid', 'shipped', 'delivered', 'failed', 'cancelled')
);

-- ============================================================
-- 2) PRODUCTS: add stock, image_url for admin (if not exist)
-- ============================================================
ALTER TABLE products ADD COLUMN IF NOT EXISTS stock integer DEFAULT 0 CHECK (stock >= 0);
ALTER TABLE products ADD COLUMN IF NOT EXISTS image_url text;
ALTER TABLE products ADD COLUMN IF NOT EXISTS category_id uuid REFERENCES categories(id) ON DELETE SET NULL;
ALTER TABLE products ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true;
ALTER TABLE products ADD COLUMN IF NOT EXISTS short_description text;
ALTER TABLE products ADD COLUMN IF NOT EXISTS original_price integer;

-- Index for admin queries
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id) WHERE deleted_at IS NULL;

-- ============================================================
-- 3) PROFILES: add email for admin customer list
-- ============================================================
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email text;

-- Backfill email for existing profiles
UPDATE public.profiles p
SET email = u.email
FROM auth.users u
WHERE p.id = u.id AND (p.email IS NULL OR p.email = '');

-- Update trigger to set email for new users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name', NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMIT;
