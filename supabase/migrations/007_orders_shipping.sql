-- Shipping address fields on orders (optional for backward compatibility)
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS address_line1 text;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS address_line2 text;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS city text;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS state text;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS pincode text;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS country text;
