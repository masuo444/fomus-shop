-- Increment stock function (for restoring stock on failed checkout)
CREATE OR REPLACE FUNCTION increment_stock(p_product_id UUID, p_quantity INTEGER)
RETURNS void AS $$
BEGIN
  UPDATE products
  SET stock = stock + p_quantity
  WHERE id = p_product_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add coupon tracking columns to orders (for server-side coupon verification)
ALTER TABLE orders ADD COLUMN IF NOT EXISTS coupon_id UUID REFERENCES coupons(id);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS coupon_discount INTEGER DEFAULT 0;

-- Function to increment coupon usage count atomically
CREATE OR REPLACE FUNCTION increment_coupon_usage(p_coupon_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE coupons
  SET used_count = used_count + 1
  WHERE id = p_coupon_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
