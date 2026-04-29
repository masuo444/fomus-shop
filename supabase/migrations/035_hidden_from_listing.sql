-- Add hidden_from_listing flag to products
-- Products with this flag set to true are accessible via direct URL
-- but excluded from all shop listing pages.
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS hidden_from_listing boolean NOT NULL DEFAULT false;
