-- 044: KUMIKI products are direct-link only.
-- Hidden from shop listings, recommendations, search and sitemap.
-- Product pages remain accessible via kumiki.fomusglobal.com links,
-- and hidden products use the direct-to-checkout flow (no cart mixing).
UPDATE products SET hidden_from_listing = true WHERE slug LIKE 'kumiki-%';
