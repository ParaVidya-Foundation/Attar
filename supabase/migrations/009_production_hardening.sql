-- Enterprise Production Hardening Migration
-- Adds constraints, indexes, and functions for production reliability

-- ============================================================================
-- ORDERS TABLE HARDENING
-- ============================================================================

-- Add UNIQUE constraint on razorpay_order_id (prevent duplicate orders)
ALTER TABLE orders 
  ADD CONSTRAINT orders_razorpay_order_id_unique 
  UNIQUE (razorpay_order_id) 
  DEFERRABLE INITIALLY DEFERRED;

-- Add UNIQUE constraint on razorpay_payment_id (prevent duplicate payments)
-- Note: This allows NULL for pending orders
CREATE UNIQUE INDEX orders_razorpay_payment_id_unique 
  ON orders (razorpay_payment_id) 
  WHERE razorpay_payment_id IS NOT NULL;

-- Add 'expired' status to CHECK constraint
ALTER TABLE orders 
  DROP CONSTRAINT IF EXISTS orders_status_check;
ALTER TABLE orders 
  ADD CONSTRAINT orders_status_check 
  CHECK (status IN ('created', 'pending', 'paid', 'failed', 'cancelled', 'expired'));

-- Ensure updated_at is always set
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Ensure trigger exists for orders
DROP TRIGGER IF EXISTS update_orders_updated_at ON orders;
CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- PAYMENTS TABLE HARDENING
-- ============================================================================

-- Ensure payments table has method column (for future payment method tracking)
ALTER TABLE payments 
  ADD COLUMN IF NOT EXISTS method varchar(50) DEFAULT 'razorpay';

-- Add index on order_id + razorpay_payment_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_payments_order_razorpay 
  ON payments(order_id, razorpay_payment_id);

-- ============================================================================
-- EXPIRED ORDERS FUNCTION
-- ============================================================================

CREATE OR REPLACE FUNCTION expire_pending_orders()
RETURNS integer AS $$
DECLARE
  expired_count integer;
BEGIN
  UPDATE orders
  SET 
    status = 'expired',
    updated_at = now()
  WHERE 
    status = 'pending'
    AND created_at < now() - interval '30 minutes'
    AND razorpay_payment_id IS NULL;
  
  GET DIAGNOSTICS expired_count = ROW_COUNT;
  RETURN expired_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- IDEMPOTENCY CHECK FUNCTION
-- ============================================================================

-- Function to check if payment already processed (for webhook idempotency)
CREATE OR REPLACE FUNCTION check_payment_exists(p_razorpay_payment_id varchar)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM payments 
    WHERE razorpay_payment_id = p_razorpay_payment_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- INVENTORY SAFETY FUNCTION
-- ============================================================================

-- Enhanced inventory check function
CREATE OR REPLACE FUNCTION check_inventory_available(
  p_product_id uuid,
  p_size_ml integer,
  p_qty integer
)
RETURNS boolean AS $$
DECLARE
  available_stock integer;
BEGIN
  SELECT stock INTO available_stock
  FROM inventory
  WHERE product_id = p_product_id
    AND size_ml = p_size_ml;
  
  RETURN COALESCE(available_stock, 0) >= p_qty;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Index for finding pending orders by email (for double payment protection)
CREATE INDEX IF NOT EXISTS idx_orders_email_status_created 
  ON orders(email, status, created_at) 
  WHERE email IS NOT NULL AND status = 'pending';

-- Index for expired orders cleanup
CREATE INDEX IF NOT EXISTS idx_orders_status_created 
  ON orders(status, created_at) 
  WHERE status = 'pending';
