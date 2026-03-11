-- Add 'resale' type to point_transactions
ALTER TABLE point_transactions DROP CONSTRAINT IF EXISTS point_transactions_type_check;
ALTER TABLE point_transactions ADD CONSTRAINT point_transactions_type_check
  CHECK (type IN ('purchase', 'referral', 'birthday', 'registration', 'spend', 'adjustment', 'premium_bonus', 'resale', 'point_exchange'));

-- Drop payout_requests table (replaced by points system)
DROP TABLE IF EXISTS payout_requests;
