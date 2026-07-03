-- 043: international orders — country on orders
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_country TEXT NOT NULL DEFAULT 'JP';
