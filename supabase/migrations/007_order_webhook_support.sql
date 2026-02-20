-- Add email column to orders for webhook/receipt context
ALTER TABLE orders ADD COLUMN IF NOT EXISTS email text;

-- Backfill email from profiles
UPDATE orders o
SET email = p.email
FROM profiles p
WHERE o.user_id = p.id AND o.email IS NULL;

-- Atomic inventory decrement function (used by webhook after payment)
CREATE OR REPLACE FUNCTION decrement_inventory(
  p_product_id uuid,
  p_size_ml integer,
  p_qty integer
) RETURNS void AS $$
BEGIN
  UPDATE inventory
  SET stock = stock - p_qty,
      updated_at = now()
  WHERE product_id = p_product_id
    AND size_ml = p_size_ml
    AND stock >= p_qty;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Insufficient inventory for product % size %ml', p_product_id, p_size_ml;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RLS policy for orders insert (authenticated users can create their own orders)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'orders_insert_own' AND tablename = 'orders'
  ) THEN
    CREATE POLICY orders_insert_own ON orders
      FOR INSERT TO authenticated
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;
