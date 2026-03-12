-- Remove crowdfunding feature
DROP TABLE IF EXISTS crowdfunding_backers CASCADE;
DROP TABLE IF EXISTS crowdfunding_tiers CASCADE;
DROP TABLE IF EXISTS crowdfunding_projects CASCADE;
DROP FUNCTION IF EXISTS increment_crowdfunding_amount;
DROP FUNCTION IF EXISTS expire_crowdfunding_projects;
