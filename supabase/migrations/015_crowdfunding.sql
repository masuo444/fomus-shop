-- Crowdfunding projects
CREATE TABLE crowdfunding_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL REFERENCES auth.users(id),
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  goal_amount INTEGER NOT NULL,        -- Target amount in JPY
  current_amount INTEGER NOT NULL DEFAULT 0,
  backer_count INTEGER NOT NULL DEFAULT 0,
  deadline TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'pending', 'active', 'funded', 'failed', 'cancelled')),
  -- Creator's bank account for payout
  bank_name TEXT NOT NULL,
  branch_name TEXT NOT NULL,
  account_type TEXT NOT NULL DEFAULT 'ordinary' CHECK (account_type IN ('ordinary', 'current')),
  account_number TEXT NOT NULL,
  account_holder TEXT NOT NULL,
  -- Payout info
  commission_rate INTEGER NOT NULL DEFAULT 10, -- FOMUS commission %
  payout_status TEXT NOT NULL DEFAULT 'pending' CHECK (payout_status IN ('pending', 'completed', 'refunded')),
  payout_completed_at TIMESTAMPTZ,
  admin_note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Crowdfunding reward tiers
CREATE TABLE crowdfunding_tiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES crowdfunding_projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  amount INTEGER NOT NULL,             -- Price in JPY
  max_backers INTEGER,                 -- NULL = unlimited
  current_backers INTEGER NOT NULL DEFAULT 0,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Crowdfunding backers (supporters)
CREATE TABLE crowdfunding_backers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES crowdfunding_projects(id),
  tier_id UUID NOT NULL REFERENCES crowdfunding_tiers(id),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  amount INTEGER NOT NULL,
  stripe_payment_intent_id TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'refunded')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_cf_projects_status ON crowdfunding_projects(status);
CREATE INDEX idx_cf_projects_creator ON crowdfunding_projects(creator_id);
CREATE INDEX idx_cf_projects_deadline ON crowdfunding_projects(deadline);
CREATE INDEX idx_cf_backers_project ON crowdfunding_backers(project_id);
CREATE INDEX idx_cf_backers_user ON crowdfunding_backers(user_id);
