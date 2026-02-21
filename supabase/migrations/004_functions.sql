-- Attar E-Commerce: Production functions
-- decrement_variant_stock: atomic stock decrement for webhook after payment.

CREATE OR REPLACE FUNCTION public.decrement_variant_stock(
  p_variant_id uuid,
  p_qty integer
) RETURNS void AS $$
BEGIN
  UPDATE public.product_variants
  SET stock = stock - p_qty
  WHERE id = p_variant_id
    AND stock >= p_qty;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Insufficient stock for variant %', p_variant_id;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
