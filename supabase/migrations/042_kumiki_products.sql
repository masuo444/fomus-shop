-- ============================================
-- 042: KUMIKI collection — category + 12 products
-- Prices: earrings ¥66,000 / necklaces ¥88,000 / kanzashi ¥77,000
-- EUR: 380€ / 505€ / 445€ (cents). Made to order, shipping included.
-- Images are served from kumiki.fomusglobal.com (next.config.ts updated).
-- NOTE: assumes the main shop slug is 'fomus' (DEFAULT_SHOP_SLUG) — adjust if different.
-- ============================================

-- Category
INSERT INTO categories (shop_id, name, slug, sort_order)
SELECT id, 'KUMIKI', 'kumiki', 5 FROM shops WHERE slug = 'fomus'
ON CONFLICT (shop_id, slug) DO NOTHING;

WITH s AS (SELECT id AS shop_id FROM shops WHERE slug = 'fomus'),
     c AS (SELECT cat.id AS category_id FROM categories cat, s WHERE cat.shop_id = s.shop_id AND cat.slug = 'kumiki')
INSERT INTO products
  (shop_id, category_id, slug, name, name_en, description, description_en,
   price, price_eur, images, stock, is_published, item_type, tax_rate,
   made_to_order, production_time, shipping_included, sort_order)
SELECT s.shop_id, c.category_id, v.slug, v.name, v.name, v.description, v.description_en,
       v.price, v.price_eur,
       ARRAY['https://kumiki.fomusglobal.com/images/generated-luxury-all/' || v.img1,
             'https://kumiki.fomusglobal.com/images/generated-luxury-all/' || v.img2],
       0, true, 'physical', 10,
       true, '2〜4週間 / 2–4 weeks', true, v.sort_order
FROM s, c, (VALUES
  ('kumiki-sakura-pierce', 'KUMIKI — SAKURA Pierce', 66000, 38000,
   '白い桜とひのき。耳元に、静かな日本の余韻を。世界最小のひのき枡（壁厚1.6mm）を、1300年の霰組み技法で仕立てた耳飾り。枡ディスプレイケース・水引ギフト包装付き。受注制作。',
   'White cherry blossom and hinoki. A quiet echo of Japan, at the ear. The world''s smallest hinoki masu (1.6mm walls), joined with 1,300-year-old arare-gumi technique. Includes masu display case & mizuhiki gift wrapping. Handcrafted to order.',
   'sakura-pierce-product.webp', 'sakura-pierce-worn.webp', 10),
  ('kumiki-mizu-drop-earrings', 'KUMIKI — MIZU Drop Earrings', 66000, 38000,
   '澄んだ雫と金色の線。ひのきの枡に、光が揺れる。世界最小のひのき枡ジュエリー。枡ディスプレイケース・水引ギフト包装付き。受注制作。',
   'Clear drops and gold thread. Light shimmers within the hinoki masu. The world''s smallest masu jewelry. Includes masu display case & mizuhiki gift wrapping. Handcrafted to order.',
   'mizu-drop-earrings-product.webp', 'mizu-drop-earrings-worn.webp', 20),
  ('kumiki-white-blossom-earrings', 'KUMIKI — White Blossom Earrings', 66000, 38000,
   '白い玉と金色の金具。やわらかな余白を耳元に。世界最小のひのき枡ジュエリー。枡ディスプレイケース・水引ギフト包装付き。受注制作。',
   'White beads and gold fittings. Soft, gentle space at the ear. Includes masu display case & mizuhiki gift wrapping. Handcrafted to order.',
   'white-blossom-earrings-product.webp', 'white-blossom-earrings-wear.webp', 30),
  ('kumiki-black-blossom-earrings', 'KUMIKI — Black Blossom Earrings', 66000, 38000,
   '黒と金の余韻。静かに印象を残す一点。世界最小のひのき枡ジュエリー。枡ディスプレイケース・水引ギフト包装付き。受注制作。',
   'The resonance of black and gold. One piece that leaves a quiet impression. Includes masu display case & mizuhiki gift wrapping. Handcrafted to order.',
   'black-blossom-earrings-product.webp', 'black-blossom-earrings-wear.webp', 40),
  ('kumiki-red-blossom-earrings', 'KUMIKI — Red Blossom Earrings', 66000, 38000,
   '赤い花玉が、ひのきに小さな熱を灯す。世界最小のひのき枡ジュエリー。枡ディスプレイケース・水引ギフト包装付き。受注制作。',
   'A red floral bead, kindling gentle warmth in hinoki. Includes masu display case & mizuhiki gift wrapping. Handcrafted to order.',
   'red-blossom-earrings-product.webp', 'red-blossom-earrings-wear.webp', 50),
  ('kumiki-yellow-flower-earrings', 'KUMIKI — Yellow Flower Earrings', 66000, 38000,
   '花の金具とひのき。明るさを抑えた華やぎ。世界最小のひのき枡ジュエリー。枡ディスプレイケース・水引ギフト包装付き。受注制作。',
   'Floral fittings and hinoki. Restrained brightness, quiet elegance. Includes masu display case & mizuhiki gift wrapping. Handcrafted to order.',
   'yellow-flower-earrings-product.webp', 'yellow-flower-earrings-wear.webp', 60),
  ('kumiki-silver-flower-pierce', 'KUMIKI — Silver Flower Pierce', 66000, 38000,
   '真珠を抱いた花。銀色の光とひのきの静けさ。世界最小のひのき枡ジュエリー。枡ディスプレイケース・水引ギフト包装付き。受注制作。',
   'A flower cradling a pearl. Silver light and the stillness of hinoki. Includes masu display case & mizuhiki gift wrapping. Handcrafted to order.',
   'silver-flower-pierce-product.webp', 'silver-flower-pierce-wear.webp', 70),
  ('kumiki-white-temari-pierce', 'KUMIKI — White Temari Pierce', 66000, 38000,
   '白い手毬と金色の金具。やわらかな余白を耳元に。世界最小のひのき枡ジュエリー。枡ディスプレイケース・水引ギフト包装付き。受注制作。',
   'White temari ball and gold fittings. Soft, gentle space at the ear. Includes masu display case & mizuhiki gift wrapping. Handcrafted to order.',
   'white-temari-pierce-product.webp', 'white-temari-pierce-worn.webp', 80),
  ('kumiki-blue-tonbodama-pierce', 'KUMIKI — Blue Tonbodama Pierce', 66000, 38000,
   '深い青のとんぼ玉。日本の硝子が静かに揺れる。世界最小のひのき枡ジュエリー。枡ディスプレイケース・水引ギフト包装付き。受注制作。',
   'Deep blue tonbodama — traditional Japanese glass, swaying quietly. Includes masu display case & mizuhiki gift wrapping. Handcrafted to order.',
   'blue-tonbodama-pierce-product.webp', 'blue-tonbodama-pierce-wear.webp', 90),
  ('kumiki-yellow-masu-necklace', 'KUMIKI — Yellow Masu Necklace', 88000, 50500,
   '金色とひのきの温度。KUMIKIの象徴的な一本。世界最小のひのき枡（壁厚1.6mm）のネックレス。枡ディスプレイケース・水引ギフト包装付き。受注制作。',
   'The warmth of gold and hinoki. The signature piece of KUMIKI. The world''s smallest hinoki masu (1.6mm walls) as a necklace. Includes masu display case & mizuhiki gift wrapping. Handcrafted to order.',
   'yellow-masu-necklace-product.webp', 'yellow-masu-necklace-wear.webp', 100),
  ('kumiki-white-masu-necklace', 'KUMIKI — White Masu Necklace', 88000, 50500,
   '銀の輪郭、静かな枡。光を抑えた端正な表情。世界最小のひのき枡ネックレス。枡ディスプレイケース・水引ギフト包装付き。受注制作。',
   'A silver silhouette, a quiet masu. Refined and understated. The world''s smallest hinoki masu necklace. Includes masu display case & mizuhiki gift wrapping. Handcrafted to order.',
   'white-masu-necklace-product.webp', 'white-masu-necklace-wear.webp', 110),
  ('kumiki-masu-kanzashi', 'KUMIKI — Masu Kanzashi', 77000, 44500,
   '透かし菊と天然石。髪に残る、ひのきの気配。世界最小のひのき枡のかんざし。枡ディスプレイケース・水引ギフト包装付き。受注制作。',
   'Openwork chrysanthemum and natural stone. The presence of hinoki, in the hair. The world''s smallest hinoki masu as a kanzashi hair pin. Includes masu display case & mizuhiki gift wrapping. Handcrafted to order.',
   'masu-kanzashi-product.webp', 'masu-kanzashi-wear.webp', 120)
) AS v(slug, name, price, price_eur, description, description_en, img1, img2, sort_order)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  name_en = EXCLUDED.name_en,
  description = EXCLUDED.description,
  description_en = EXCLUDED.description_en,
  price = EXCLUDED.price,
  price_eur = EXCLUDED.price_eur,
  images = EXCLUDED.images,
  made_to_order = EXCLUDED.made_to_order,
  production_time = EXCLUDED.production_time,
  shipping_included = EXCLUDED.shipping_included,
  is_published = true;
