-- Add fraud flag columns to orders
ALTER TABLE orders ADD COLUMN IF NOT EXISTS is_flagged BOOLEAN DEFAULT FALSE;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS fraud_reasons TEXT[];
