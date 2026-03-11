-- ============================================
-- 006: Partner Marketplace
-- ============================================

-- shops: add marketplace columns
ALTER TABLE shops ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT false;
ALTER TABLE shops ADD COLUMN IF NOT EXISTS commission_rate NUMERIC(5,2) DEFAULT 0;
ALTER TABLE shops ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';
ALTER TABLE shops ADD COLUMN IF NOT EXISTS contact_email TEXT;

-- Mark existing FOMUS shop as published
UPDATE shops SET is_published = true, commission_rate = 0 WHERE slug = 'fomus';

-- profiles: add partner role + shop_id
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE profiles ADD CONSTRAINT profiles_role_check CHECK (role IN ('customer', 'admin', 'partner'));
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS shop_id UUID REFERENCES shops(id);

-- Commission tracking table
CREATE TABLE IF NOT EXISTS commissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  shop_id UUID REFERENCES shops(id) NOT NULL,
  order_total INTEGER NOT NULL,
  commission_rate NUMERIC(5,2) NOT NULL,
  commission_amount INTEGER NOT NULL,
  partner_amount INTEGER NOT NULL,
  status TEXT DEFAULT 'pending',
  reference_type TEXT DEFAULT 'order',
  reference_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_commissions_shop_id ON commissions(shop_id);
CREATE INDEX IF NOT EXISTS idx_commissions_order_id ON commissions(order_id);
CREATE INDEX IF NOT EXISTS idx_commissions_status ON commissions(status);
CREATE INDEX IF NOT EXISTS idx_profiles_shop_id ON profiles(shop_id);
CREATE INDEX IF NOT EXISTS idx_shops_is_published ON shops(is_published);

-- ============================================
-- RLS Policies for Partner Marketplace
-- ============================================

-- Enable RLS on commissions
ALTER TABLE commissions ENABLE ROW LEVEL SECURITY;

-- Admin can read/write all commissions
CREATE POLICY "admin_all_commissions" ON commissions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Partners can read commissions for their own shop
CREATE POLICY "partner_read_own_commissions" ON commissions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'partner'
        AND profiles.shop_id = commissions.shop_id
    )
  );

-- Restrict profiles.shop_id updates to admin only.
-- The existing profiles_update_own policy (001) allows users to update their
-- own row, which unfortunately includes shop_id. Drop it and replace with a
-- version that prevents setting shop_id.
DROP POLICY IF EXISTS "profiles_update_own" ON profiles;

-- Users can update their own profile, but cannot change role or shop_id
CREATE POLICY "profiles_update_own" ON profiles
  FOR UPDATE USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id
    AND role = (SELECT p.role FROM profiles p WHERE p.id = id)
    AND (
      shop_id IS NOT DISTINCT FROM (SELECT p.shop_id FROM profiles p WHERE p.id = id)
    )
  );

-- Admin can update any profile (including shop_id and role)
CREATE POLICY "admin_update_profiles" ON profiles
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles AS p WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- Admin can read all profiles
CREATE POLICY "admin_read_profiles" ON profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles AS p WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- Partners can update their own shop details
CREATE POLICY "partner_update_own_shop" ON shops
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'partner'
        AND profiles.shop_id = shops.id
    )
  );
