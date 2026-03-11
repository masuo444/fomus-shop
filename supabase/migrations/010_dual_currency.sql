-- Add EUR price columns to products (stored in cents for Stripe)
ALTER TABLE products
  ADD COLUMN price_eur integer DEFAULT NULL,
  ADD COLUMN member_price_eur integer DEFAULT NULL,
  ADD COLUMN compare_at_price_eur integer DEFAULT NULL;

-- Add currency to orders
ALTER TABLE orders
  ADD COLUMN currency text NOT NULL DEFAULT 'jpy';

-- Comment for clarity
COMMENT ON COLUMN products.price_eur IS 'EUR price in cents (e.g. 1500 = €15.00). NULL = not available internationally.';
COMMENT ON COLUMN products.member_price_eur IS 'EUR member price in cents. NULL = no member discount for EUR.';
COMMENT ON COLUMN products.compare_at_price_eur IS 'EUR compare-at price in cents.';
COMMENT ON COLUMN orders.currency IS 'Order currency: jpy or eur';
