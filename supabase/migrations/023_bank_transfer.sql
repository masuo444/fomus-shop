-- Support bank transfer payment method
-- Add payment_deadline column for bank transfer orders
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_deadline TIMESTAMPTZ;

-- Automatically set payment deadline for bank transfer orders
CREATE OR REPLACE FUNCTION set_bank_transfer_deadline()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.payment_method = 'bank_transfer' AND NEW.payment_deadline IS NULL THEN
    NEW.payment_deadline := now() + interval '3 days';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_bank_transfer_deadline ON orders;
CREATE TRIGGER trigger_bank_transfer_deadline
BEFORE INSERT ON orders
FOR EACH ROW
EXECUTE FUNCTION set_bank_transfer_deadline();
