-- Invoice support
ALTER TABLE orders ADD COLUMN IF NOT EXISTS stripe_invoice_id TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS invoice_number TEXT;

-- Qualified Invoice Registration Number (適格請求書発行事業者登録番号)
-- Format: T + 13 digits (e.g. T1234567890123)
ALTER TABLE shops ADD COLUMN IF NOT EXISTS invoice_registration_number TEXT;
