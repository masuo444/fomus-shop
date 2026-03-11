-- ============================================
-- Rename GUILD-specific columns to generic premium member
-- ============================================

-- Rename columns
ALTER TABLE profiles RENAME COLUMN is_guild_member TO is_premium_member;
ALTER TABLE profiles RENAME COLUMN guild_linked_at TO premium_linked_at;

-- Update rank enum to replace 'guild' with 'premium'
-- (rank check constraint allows: bronze, silver, gold, guild)
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_rank_check;
ALTER TABLE profiles ADD CONSTRAINT profiles_rank_check
  CHECK (rank IN ('bronze', 'silver', 'gold', 'premium', 'guild'));

-- Update existing guild ranks
UPDATE profiles SET rank = 'premium' WHERE rank = 'guild';

-- Now tighten the constraint
ALTER TABLE profiles DROP CONSTRAINT profiles_rank_check;
ALTER TABLE profiles ADD CONSTRAINT profiles_rank_check
  CHECK (rank IN ('bronze', 'silver', 'gold', 'premium'));

-- Update point transaction types
ALTER TABLE point_transactions DROP CONSTRAINT IF EXISTS point_transactions_type_check;
ALTER TABLE point_transactions ADD CONSTRAINT point_transactions_type_check
  CHECK (type IN ('purchase', 'referral', 'birthday', 'registration', 'spend', 'adjustment', 'guild_bonus', 'premium_bonus'));

UPDATE point_transactions SET type = 'premium_bonus' WHERE type = 'guild_bonus';

ALTER TABLE point_transactions DROP CONSTRAINT point_transactions_type_check;
ALTER TABLE point_transactions ADD CONSTRAINT point_transactions_type_check
  CHECK (type IN ('purchase', 'referral', 'birthday', 'registration', 'spend', 'adjustment', 'premium_bonus'));

-- Update functions that reference is_guild_member
CREATE OR REPLACE FUNCTION update_member_rank()
RETURNS TRIGGER AS $$
DECLARE
  total INTEGER;
BEGIN
  SELECT total_points_earned INTO total FROM profiles WHERE id = NEW.user_id;

  -- Premium members keep premium rank
  IF (SELECT is_premium_member FROM profiles WHERE id = NEW.user_id) THEN
    RETURN NEW;
  END IF;

  IF total >= 10000 THEN
    UPDATE profiles SET rank = 'gold' WHERE id = NEW.user_id AND rank != 'premium';
  ELSIF total >= 3000 THEN
    UPDATE profiles SET rank = 'silver' WHERE id = NEW.user_id AND rank NOT IN ('gold', 'premium');
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update points earning function
CREATE OR REPLACE FUNCTION earn_points_on_order()
RETURNS TRIGGER AS $$
DECLARE
  point_rate NUMERIC;
  earned INTEGER;
  is_premium BOOLEAN;
BEGIN
  IF NEW.status = 'paid' AND (OLD IS NULL OR OLD.status != 'paid') AND NEW.user_id IS NOT NULL THEN
    SELECT is_premium_member INTO is_premium FROM profiles WHERE id = NEW.user_id;
    point_rate := CASE WHEN is_premium THEN 0.10 ELSE 0.05 END;
    earned := FLOOR(NEW.total * point_rate);

    UPDATE orders SET points_earned = earned WHERE id = NEW.id;
    UPDATE profiles SET points = points + earned, total_points_earned = total_points_earned + earned WHERE id = NEW.user_id;

    INSERT INTO point_transactions (user_id, amount, type, description, order_id)
    VALUES (NEW.user_id, earned, 'purchase', '購入ポイント（' || earned || 'pt）', NEW.id);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
