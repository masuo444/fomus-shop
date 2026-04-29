-- RLS for product_reviews
ALTER TABLE product_reviews ENABLE ROW LEVEL SECURITY;

-- Anyone can read published reviews
CREATE POLICY "reviews_public_read" ON product_reviews
  FOR SELECT USING (is_published = true);

-- Logged-in users can insert their own review
CREATE POLICY "reviews_own_insert" ON product_reviews
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update/delete only their own reviews
CREATE POLICY "reviews_own_update" ON product_reviews
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "reviews_own_delete" ON product_reviews
  FOR DELETE USING (auth.uid() = user_id);

-- Admins can do everything via service role (bypasses RLS)

-- RLS for processed_webhook_events (service role only, no user access)
ALTER TABLE processed_webhook_events ENABLE ROW LEVEL SECURITY;
-- No policies = only service_role can access
