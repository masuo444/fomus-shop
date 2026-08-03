-- ============================================
-- 033: Multi-brand support (FOMUS / KACHIU)
-- ============================================
-- Each deployment (DEFAULT_SHOP_SLUG) shows only shops belonging to its own
-- platform. Existing shops (FOMUS + partners) all belong to 'fomus'.
--
-- IMPORTANT: Apply this migration BEFORE deploying the code that filters
-- by platform, otherwise queries against the missing column will fail.

ALTER TABLE shops ADD COLUMN IF NOT EXISTS platform TEXT NOT NULL DEFAULT 'fomus';
CREATE INDEX IF NOT EXISTS idx_shops_platform ON shops(platform);

-- KACHIU brand shop (kachiu.jp deployment uses DEFAULT_SHOP_SLUG=kachiu)
INSERT INTO shops (name, slug, description, platform, is_published, status)
VALUES ('KACHIU', 'kachiu', 'KACHIU Official Shop', 'kachiu', true, 'active')
ON CONFLICT (slug) DO NOTHING;

-- External-link products: purchase happens on an external site (e.g. beer).
-- When external_url is set the product cannot be added to the cart; the
-- storefront shows a link-out button instead.
ALTER TABLE products ADD COLUMN IF NOT EXISTS external_url TEXT;
