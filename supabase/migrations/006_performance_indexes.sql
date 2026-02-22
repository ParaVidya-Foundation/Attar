-- Performance indexes for catalog and orders (no schema change).
-- Run after 001–005. products(slug) already has UNIQUE constraint (index).

-- Products: filter by is_active (catalog lists, admin)
CREATE INDEX IF NOT EXISTS idx_products_is_active ON public.products(is_active) WHERE is_active = true;

-- Products: category pages (filter by category_id + is_active)
CREATE INDEX IF NOT EXISTS idx_products_category_id ON public.products(category_id) WHERE is_active = true;

-- Categories: lookup by slug (getProductsByCategory)
CREATE INDEX IF NOT EXISTS idx_categories_slug ON public.categories(slug);

-- Orders: user's orders (account/order history)
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);

-- product_variants(id) is PK; product_id already in 003.
-- orders(created_at DESC), orders(status), order_items(order_id) already in 003.
