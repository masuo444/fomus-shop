-- English product content for /en/ pages.
-- Fallback design: pages show Japanese name/description when the _en column is NULL.
ALTER TABLE products ADD COLUMN IF NOT EXISTS name_en TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS description_en TEXT;
