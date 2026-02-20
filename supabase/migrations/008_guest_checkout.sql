-- Guest checkout: add name + phone to orders, make user_id nullable for guests
ALTER TABLE orders ADD COLUMN IF NOT EXISTS name text;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS phone text;

-- Allow guest orders (no user_id) via service role
-- RLS insert policy already requires auth — guest inserts go through admin client
