-- Add JPYC payment support to orders table
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'stripe';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS jpyc_tx_hash TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS jpyc_from_address TEXT;

-- Index for tx_hash uniqueness check
CREATE UNIQUE INDEX IF NOT EXISTS idx_orders_jpyc_tx_hash
  ON orders (jpyc_tx_hash)
  WHERE jpyc_tx_hash IS NOT NULL;

-- Stock decrement function (if not exists)
CREATE OR REPLACE FUNCTION decrement_stock(p_product_id UUID, p_quantity INTEGER)
RETURNS void AS $$
BEGIN
  UPDATE products
  SET stock = stock - p_quantity
  WHERE id = p_product_id AND stock >= p_quantity;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Insufficient stock for product %', p_product_id;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
