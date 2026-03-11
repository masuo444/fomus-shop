-- ============================================
-- Member Features: Points, Ranks, Favorites, Referral, Birthday
-- ============================================

-- Add member fields to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS points INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS total_points_earned INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS rank TEXT DEFAULT 'bronze' CHECK (rank IN ('bronze', 'silver', 'gold', 'guild'));
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS birthday DATE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS referral_code TEXT UNIQUE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS referred_by UUID REFERENCES auth.users(id);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_guild_member BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS guild_linked_at TIMESTAMPTZ;

-- Add member price to products
ALTER TABLE products ADD COLUMN IF NOT EXISTS member_price INTEGER;

-- Points history
CREATE TABLE point_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  amount INTEGER NOT NULL, -- positive = earn, negative = spend
  type TEXT NOT NULL CHECK (type IN ('purchase', 'referral', 'birthday', 'registration', 'spend', 'adjustment', 'guild_bonus')),
  description TEXT,
  order_id UUID REFERENCES orders(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Favorites / Wishlist
CREATE TABLE favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, product_id)
);

-- Referral tracking
CREATE TABLE referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID REFERENCES auth.users(id) NOT NULL,
  referred_id UUID REFERENCES auth.users(id) NOT NULL,
  referral_coupon_id UUID REFERENCES coupons(id),
  referrer_coupon_id UUID REFERENCES coupons(id),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed')),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(referred_id)
);

-- Add points_used and points_earned to orders
ALTER TABLE orders ADD COLUMN IF NOT EXISTS points_used INTEGER DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS points_earned INTEGER DEFAULT 0;

-- RLS
ALTER TABLE point_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "points_own" ON point_transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "points_insert" ON point_transactions FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "favorites_own" ON favorites FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "referrals_own" ON referrals FOR SELECT USING (
  auth.uid() = referrer_id OR auth.uid() = referred_id
);

-- Admin read policies
CREATE POLICY "points_admin" ON point_transactions FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "favorites_admin" ON favorites FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "referrals_admin" ON referrals FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Indexes
CREATE INDEX idx_point_transactions_user ON point_transactions(user_id);
CREATE INDEX idx_point_transactions_type ON point_transactions(type);
CREATE INDEX idx_favorites_user ON favorites(user_id);
CREATE INDEX idx_favorites_product ON favorites(product_id);
CREATE INDEX idx_referrals_referrer ON referrals(referrer_id);
CREATE INDEX idx_profiles_referral_code ON profiles(referral_code);
CREATE INDEX idx_profiles_rank ON profiles(rank);

-- Generate referral code on profile creation
CREATE OR REPLACE FUNCTION generate_referral_code()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.referral_code IS NULL THEN
    NEW.referral_code := 'FOMUS-' || UPPER(SUBSTRING(md5(random()::text) FROM 1 FOR 6));
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_referral_code BEFORE INSERT ON profiles
  FOR EACH ROW EXECUTE FUNCTION generate_referral_code();

-- Update existing profiles with referral codes
UPDATE profiles SET referral_code = 'FOMUS-' || UPPER(SUBSTRING(md5(random()::text) FROM 1 FOR 6))
WHERE referral_code IS NULL;

-- Auto-update rank based on total points earned
CREATE OR REPLACE FUNCTION update_member_rank()
RETURNS TRIGGER AS $$
DECLARE
  total INTEGER;
BEGIN
  SELECT total_points_earned INTO total FROM profiles WHERE id = NEW.user_id;

  -- Guild members keep guild rank
  IF (SELECT is_guild_member FROM profiles WHERE id = NEW.user_id) THEN
    RETURN NEW;
  END IF;

  IF total >= 10000 THEN
    UPDATE profiles SET rank = 'gold' WHERE id = NEW.user_id AND rank != 'guild';
  ELSIF total >= 3000 THEN
    UPDATE profiles SET rank = 'silver' WHERE id = NEW.user_id AND rank NOT IN ('gold', 'guild');
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER points_update_rank AFTER INSERT ON point_transactions
  FOR EACH ROW EXECUTE FUNCTION update_member_rank();

-- Earn points on paid order (5% of order total, guild members get 10%)
CREATE OR REPLACE FUNCTION earn_points_on_order()
RETURNS TRIGGER AS $$
DECLARE
  point_rate NUMERIC;
  earned INTEGER;
  is_guild BOOLEAN;
BEGIN
  IF NEW.status = 'paid' AND (OLD IS NULL OR OLD.status != 'paid') AND NEW.user_id IS NOT NULL THEN
    SELECT is_guild_member INTO is_guild FROM profiles WHERE id = NEW.user_id;
    point_rate := CASE WHEN is_guild THEN 0.10 ELSE 0.05 END;
    earned := FLOOR(NEW.total * point_rate);

    UPDATE orders SET points_earned = earned WHERE id = NEW.id;
    UPDATE profiles SET points = points + earned, total_points_earned = total_points_earned + earned WHERE id = NEW.user_id;

    INSERT INTO point_transactions (user_id, amount, type, description, order_id)
    VALUES (NEW.user_id, earned, 'purchase', '購入ポイント（' || earned || 'pt）', NEW.id);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER orders_earn_points AFTER INSERT OR UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION earn_points_on_order();
