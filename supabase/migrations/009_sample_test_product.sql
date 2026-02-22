-- Sample product for payment testing (100 paise, stock 9999, always active)
-- Run once; safe to re-run (insert only if slug missing).

INSERT INTO public.products (id, name, slug, description, short_description, price, is_active, featured)
SELECT
  gen_random_uuid(),
  'Test Attar',
  'test-attar',
  'Sample product for checkout testing.',
  'Test product',
  100,
  true,
  false
WHERE NOT EXISTS (SELECT 1 FROM public.products WHERE slug = 'test-attar');

INSERT INTO public.product_variants (product_id, size_ml, price, stock)
SELECT p.id, 5, 100, 9999
FROM public.products p
WHERE p.slug = 'test-attar'
  AND NOT EXISTS (
    SELECT 1 FROM public.product_variants pv
    WHERE pv.product_id = p.id AND pv.size_ml = 5
  )
LIMIT 1;
