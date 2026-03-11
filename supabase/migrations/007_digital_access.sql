-- Add digital access permission to profiles
-- This controls which users can purchase/use digital tickets and NFTs
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS digital_access_enabled BOOLEAN DEFAULT false;

-- Index for quick filtering
CREATE INDEX IF NOT EXISTS idx_profiles_digital_access ON profiles (digital_access_enabled) WHERE digital_access_enabled = true;
