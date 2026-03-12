-- Webhook event idempotency tracking
CREATE TABLE IF NOT EXISTS processed_webhook_events (
  event_id TEXT PRIMARY KEY,
  processed_at TIMESTAMPTZ DEFAULT now()
);

-- Auto-cleanup events older than 7 days
CREATE OR REPLACE FUNCTION cleanup_old_webhook_events()
RETURNS void AS $$
BEGIN
  DELETE FROM processed_webhook_events WHERE processed_at < now() - interval '7 days';
END;
$$ LANGUAGE plpgsql;

-- Add refund_id to orders for audit trail
ALTER TABLE orders ADD COLUMN IF NOT EXISTS stripe_refund_id TEXT;
