-- Payout requests: users can request bank transfer of points
CREATE TABLE payout_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  points INTEGER NOT NULL,
  amount INTEGER NOT NULL,          -- JPY amount after fee deduction
  fee INTEGER NOT NULL DEFAULT 500, -- Transfer fee
  bank_name TEXT NOT NULL,
  branch_name TEXT NOT NULL,
  account_type TEXT NOT NULL DEFAULT 'ordinary' CHECK (account_type IN ('ordinary', 'current')),
  account_number TEXT NOT NULL,
  account_holder TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'rejected')),
  admin_note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ
);

-- Add 'payout' to point_transactions type if not exists
ALTER TABLE point_transactions
  DROP CONSTRAINT IF EXISTS point_transactions_type_check;

ALTER TABLE point_transactions
  ADD CONSTRAINT point_transactions_type_check
  CHECK (type IN ('purchase', 'referral', 'birthday', 'registration', 'spend', 'adjustment', 'premium_bonus', 'resale', 'point_exchange', 'payout'));

CREATE INDEX idx_payout_requests_user ON payout_requests(user_id);
CREATE INDEX idx_payout_requests_status ON payout_requests(status);
