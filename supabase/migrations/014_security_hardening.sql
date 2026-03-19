-- Security hardening: prevent role escalation + add missing expire_pending_orders function
-- Users can only update their own profile but CANNOT change their role.
-- Only service_role (admin backend) can modify profiles.role.

-- 1) Replace the overly permissive profiles_update_own policy
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;

CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id AND role = (SELECT role FROM public.profiles WHERE id = auth.uid()));

-- 2) Add missing expire_pending_orders RPC used by /api/admin/expire-orders
CREATE OR REPLACE FUNCTION public.expire_pending_orders()
RETURNS integer AS $$
DECLARE
  expired_count integer;
BEGIN
  WITH expired AS (
    UPDATE public.orders
    SET status = 'expired', updated_at = now()
    WHERE status = 'pending'
      AND created_at < now() - interval '30 minutes'
    RETURNING id
  )
  SELECT count(*) INTO expired_count FROM expired;
  RETURN expired_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3) Add increment_variant_stock for order cancellation stock restore
CREATE OR REPLACE FUNCTION public.increment_variant_stock(
  p_variant_id uuid,
  p_qty integer
) RETURNS void AS $$
BEGIN
  UPDATE public.product_variants
  SET stock = stock + p_qty
  WHERE id = p_variant_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Variant not found: %', p_variant_id;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4) Add missing indexes for admin analytics performance
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON public.order_items(product_id);
CREATE INDEX IF NOT EXISTS idx_orders_status_created ON public.orders(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_paid_at ON public.orders(paid_at) WHERE paid_at IS NOT NULL;
