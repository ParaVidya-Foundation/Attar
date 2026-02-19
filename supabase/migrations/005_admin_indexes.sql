-- 005: Admin query indexes
-- Run: supabase db push or supabase migration up

CREATE INDEX IF NOT EXISTS idx_products_name ON products(name) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_orders_created_at_desc ON orders(created_at DESC) WHERE deleted_at IS NULL;
