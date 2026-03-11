-- ============================================
-- Production Hardening: RLS, Atomic Operations, Cron Support
-- ============================================

-- ============================================
-- 1. RLS for payout_requests
-- ============================================
ALTER TABLE payout_requests ENABLE ROW LEVEL SECURITY;

-- Users can read their own payout requests
CREATE POLICY "payout_requests_own_read" ON payout_requests
  FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own payout requests
CREATE POLICY "payout_requests_own_insert" ON payout_requests
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Admin can do everything (via service role key, bypasses RLS)
-- No explicit admin policy needed since admin uses service role

-- ============================================
-- 2. RLS for crowdfunding_projects
-- ============================================
ALTER TABLE crowdfunding_projects ENABLE ROW LEVEL SECURITY;

-- Public can read active/funded/failed projects
CREATE POLICY "cf_projects_public_read" ON crowdfunding_projects
  FOR SELECT USING (status IN ('active', 'funded', 'ended'));

-- Creators can read their own projects (any status)
CREATE POLICY "cf_projects_own_read" ON crowdfunding_projects
  FOR SELECT USING (auth.uid() = creator_id);

-- Users can insert projects (as pending)
CREATE POLICY "cf_projects_insert" ON crowdfunding_projects
  FOR INSERT WITH CHECK (auth.uid() = creator_id);

-- ============================================
-- 3. RLS for crowdfunding_tiers
-- ============================================
ALTER TABLE crowdfunding_tiers ENABLE ROW LEVEL SECURITY;

-- Public can read tiers for visible projects
CREATE POLICY "cf_tiers_public_read" ON crowdfunding_tiers
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM crowdfunding_projects cp
      WHERE cp.id = crowdfunding_tiers.project_id
      AND cp.status IN ('active', 'funded', 'ended')
    )
  );

-- Creators can read/insert tiers for their own projects
CREATE POLICY "cf_tiers_own_read" ON crowdfunding_tiers
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM crowdfunding_projects cp
      WHERE cp.id = crowdfunding_tiers.project_id
      AND cp.creator_id = auth.uid()
    )
  );

CREATE POLICY "cf_tiers_own_insert" ON crowdfunding_tiers
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM crowdfunding_projects cp
      WHERE cp.id = crowdfunding_tiers.project_id
      AND cp.creator_id = auth.uid()
    )
  );

-- ============================================
-- 4. RLS for crowdfunding_backers
-- ============================================
ALTER TABLE crowdfunding_backers ENABLE ROW LEVEL SECURITY;

-- Users can read their own backing records
CREATE POLICY "cf_backers_own_read" ON crowdfunding_backers
  FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own backing records
CREATE POLICY "cf_backers_own_insert" ON crowdfunding_backers
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================
-- 5. Atomic crowdfunding amount update (prevents race conditions)
-- ============================================
CREATE OR REPLACE FUNCTION increment_crowdfunding_amount(
  p_project_id UUID,
  p_tier_id UUID,
  p_amount INTEGER
)
RETURNS JSON AS $$
DECLARE
  v_project crowdfunding_projects%ROWTYPE;
  v_new_amount INTEGER;
  v_result JSON;
BEGIN
  -- Lock the project row to prevent concurrent updates
  SELECT * INTO v_project
  FROM crowdfunding_projects
  WHERE id = p_project_id
  FOR UPDATE;

  IF v_project IS NULL THEN
    RETURN json_build_object('error', 'project_not_found');
  END IF;

  v_new_amount := v_project.current_amount + p_amount;

  -- Update project
  UPDATE crowdfunding_projects
  SET current_amount = v_new_amount,
      backer_count = backer_count + 1,
      status = CASE
        WHEN v_new_amount >= goal_amount THEN 'funded'
        ELSE status
      END
  WHERE id = p_project_id;

  -- Update tier backer count
  UPDATE crowdfunding_tiers
  SET current_backers = current_backers + 1
  WHERE id = p_tier_id;

  RETURN json_build_object(
    'new_amount', v_new_amount,
    'funded', v_new_amount >= v_project.goal_amount
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 6. Expire crowdfunding projects past deadline
-- ============================================
CREATE OR REPLACE FUNCTION expire_crowdfunding_projects()
RETURNS INTEGER AS $$
DECLARE
  v_count INTEGER;
BEGIN
  UPDATE crowdfunding_projects
  SET status = 'failed'
  WHERE status = 'active'
    AND deadline < now();

  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 7. Atomic points deduction (prevents race conditions)
-- ============================================
CREATE OR REPLACE FUNCTION deduct_points(
  p_user_id UUID,
  p_amount INTEGER
)
RETURNS JSON AS $$
DECLARE
  v_current_points INTEGER;
BEGIN
  SELECT points INTO v_current_points
  FROM profiles
  WHERE id = p_user_id
  FOR UPDATE;

  IF v_current_points IS NULL THEN
    RETURN json_build_object('error', 'user_not_found');
  END IF;

  IF v_current_points < p_amount THEN
    RETURN json_build_object('error', 'insufficient_points', 'current', v_current_points);
  END IF;

  UPDATE profiles
  SET points = points - p_amount
  WHERE id = p_user_id;

  RETURN json_build_object('success', true, 'remaining', v_current_points - p_amount);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 8. Hide bank account info from non-owners
--    (The bank columns exist on payout_requests and crowdfunding_projects.
--     RLS already restricts row access. For extra safety, the API layer
--     should strip bank fields before returning to non-admin users.)
-- ============================================
-- Note: Column-level security is handled at the API layer since
-- Supabase RLS operates at row level. The admin client (service role)
-- is the only one that reads bank details.
