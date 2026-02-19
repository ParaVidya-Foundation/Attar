-- 003: Align production products schema with app fetchers
-- Problem: fetchers expect "price" and "original_price", live DB has "base_price" and "compare_price"
-- Problem: category slugs don't match page hardcoded slugs
-- Run this in Supabase Dashboard → SQL Editor

BEGIN;

-- ============================================================
-- 1) COLUMN RENAMES: align with fetchers.ts PRODUCT_COLUMNS
-- ============================================================

-- Fetcher expects "price", live DB has "base_price"
ALTER TABLE products RENAME COLUMN base_price TO price;

-- Fetcher expects "original_price", live DB has "compare_price"
ALTER TABLE products RENAME COLUMN compare_price TO original_price;

-- ============================================================
-- 2) CATEGORY SLUG FIX: pages hardcode these slugs
--    /collections/planets → getProductsByCategorySlug("planets")
--    /collections/zodiac  → getProductsByCategorySlug("zodiac")
--    /collections/Incense → getProductsByCategorySlug("incense") ← already correct
-- ============================================================

UPDATE categories SET slug = 'planets' WHERE slug = 'planet-attar';
UPDATE categories SET slug = 'zodiac'  WHERE slug = 'zodiac-attar';

-- ============================================================
-- 3) RLS: ensure public read policy uses is_active
-- ============================================================

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "products_select_public" ON products;
DROP POLICY IF EXISTS "products_public_read" ON products;

CREATE POLICY "products_public_read"
  ON products FOR SELECT
  USING (is_active = true);

COMMIT;
