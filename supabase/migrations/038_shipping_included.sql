-- Add shipping_included flag to products
-- When true, no shipping fee is added at checkout (price already includes shipping)
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS shipping_included boolean NOT NULL DEFAULT false;
