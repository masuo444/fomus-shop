-- Change crowdfunding model: Keep it All (no refunds)
-- Replace 'failed' with 'ended', remove 'refunded' payout status

-- Update status constraint
ALTER TABLE crowdfunding_projects
  DROP CONSTRAINT IF EXISTS crowdfunding_projects_status_check;

ALTER TABLE crowdfunding_projects
  ADD CONSTRAINT crowdfunding_projects_status_check
  CHECK (status IN ('draft', 'pending', 'active', 'funded', 'ended', 'cancelled'));

-- Update payout_status constraint (remove 'refunded')
ALTER TABLE crowdfunding_projects
  DROP CONSTRAINT IF EXISTS crowdfunding_projects_payout_status_check;

ALTER TABLE crowdfunding_projects
  ADD CONSTRAINT crowdfunding_projects_payout_status_check
  CHECK (payout_status IN ('pending', 'completed'));

-- Migrate any existing 'failed' to 'ended'
UPDATE crowdfunding_projects SET status = 'ended' WHERE status = 'failed';

-- Update expire function to use 'ended' instead of 'failed'
CREATE OR REPLACE FUNCTION expire_crowdfunding_projects()
RETURNS INTEGER AS $$
DECLARE
  v_count INTEGER;
BEGIN
  UPDATE crowdfunding_projects
  SET status = 'ended'
  WHERE status = 'active'
    AND deadline < now();

  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update RLS: 'ended' projects are also publicly visible
DROP POLICY IF EXISTS "cf_projects_public_read" ON crowdfunding_projects;
CREATE POLICY "cf_projects_public_read" ON crowdfunding_projects
  FOR SELECT USING (status IN ('active', 'funded', 'ended'));
