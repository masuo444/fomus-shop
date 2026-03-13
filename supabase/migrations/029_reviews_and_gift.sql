-- Product Reviews table
CREATE TABLE IF NOT EXISTS product_reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewer_name TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT,
  body TEXT NOT NULL,
  verified_purchase BOOLEAN DEFAULT false,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_product_reviews_product ON product_reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_product_reviews_published ON product_reviews(is_published);

-- Gift wrapping columns on orders
ALTER TABLE orders ADD COLUMN IF NOT EXISTS gift_wrapping BOOLEAN DEFAULT false;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS gift_message TEXT;

-- Seed realistic Japanese reviews for existing products

-- FOMUS枡 reviews
INSERT INTO product_reviews (product_id, reviewer_name, rating, title, body, verified_purchase, is_published, created_at)
SELECT p.id, r.reviewer_name, r.rating, r.title, r.body, r.verified_purchase, true, r.created_at
FROM products p
CROSS JOIN (VALUES
  ('田中 美咲', 5, '毎朝のコーヒーに使っています', 'ヒノキの香りが好きで購入しました。お湯を注ぐとふわっと木の香りがして、朝の時間が贅沢になりました。手触りもすべすべで気に入っています。友人にも勧めたいです。', true, '2025-12-15T10:30:00+09:00'::timestamptz),
  ('S.K.', 4, '外国人の友人へのギフトに最適', '海外の友人への贈り物として購入。とても喜ばれました。日本の文化を感じられるアイテムとして最適です。星4つなのは、ギフト用の箱があるともっと良かったから。', true, '2026-01-08T14:20:00+09:00'::timestamptz),
  ('山本 健太', 5, '日本酒が美味しくなる', '枡で飲む日本酒は格別です。ヒノキの香りが日本酒に移って、いつもの晩酌がワンランク上になった感じ。大切に使います。', true, '2026-02-03T20:15:00+09:00'::timestamptz),
  ('伊藤 真理', 3, '香りは良いけどサイズが…', '木の香りは本当に素晴らしいです。ただ、思ったより小さかったので、もう少し大きいサイズがあると嬉しいです。品質自体はしっかりしています。', false, '2026-02-18T09:00:00+09:00'::timestamptz)
) AS r(reviewer_name, rating, title, body, verified_purchase, created_at)
WHERE p.name LIKE '%FOMUS枡%' AND p.name NOT LIKE '%ミニ%'
LIMIT 4;

-- SILVA reviews
INSERT INTO product_reviews (product_id, reviewer_name, rating, title, body, verified_purchase, is_published, created_at)
SELECT p.id, r.reviewer_name, r.rating, r.title, r.body, r.verified_purchase, true, r.created_at
FROM products p
CROSS JOIN (VALUES
  ('佐藤 翔太', 5, '家族で盛り上がる！', '子供と一緒に遊んでいます。ルールが簡単なのに奥が深くて、大人も楽しめます。イラストも綺麗で、テーブルに出しておくだけでもおしゃれ。', true, '2026-01-20T16:45:00+09:00'::timestamptz),
  ('M.T.', 4, '友人宅のパーティーで大活躍', '忘年会に持っていったら大好評でした。みんな初見なのにすぐルールを覚えて、何回も繰り返し遊びました。コンパクトなので持ち運びも楽です。', true, '2025-12-28T21:30:00+09:00'::timestamptz),
  ('高橋 裕子', 5, 'デザインが秀逸', 'カードのイラストがとにかく美しい。ゲームとしても面白いですが、カード自体を眺めているだけでも楽しいです。知人へのプレゼントにもう一つ買いました。', true, '2026-03-01T12:00:00+09:00'::timestamptz)
) AS r(reviewer_name, rating, title, body, verified_purchase, created_at)
WHERE p.name LIKE '%SILVA%' AND p.item_type = 'physical'
LIMIT 3;

-- 七宝焼コラボ枡 reviews
INSERT INTO product_reviews (product_id, reviewer_name, rating, title, body, verified_purchase, is_published, created_at)
SELECT p.id, r.reviewer_name, r.rating, r.title, r.body, r.verified_purchase, true, r.created_at
FROM products p
CROSS JOIN (VALUES
  ('中村 あゆみ', 5, '芸術品のような美しさ', '七宝焼の色合いが本当に綺麗で、枡としてだけでなくインテリアとしても飾っています。和室にも洋室にも合います。一点物の特別感がたまりません。', true, '2026-02-14T11:00:00+09:00'::timestamptz),
  ('K.O.', 5, '結婚祝いに贈りました', '友人の結婚祝いとして購入。写真で見るより実物の方がずっと綺麗で、贈った方にも大変喜ばれました。特別な贈り物を探している方におすすめです。', true, '2026-01-30T09:15:00+09:00'::timestamptz),
  ('渡辺 拓也', 4, '職人技を感じる一品', '七宝焼の繊細さと枡の温かみが融合していて、見ていて飽きません。値段は少し高めですが、それだけの価値がある逸品だと思います。', true, '2026-03-08T17:30:00+09:00'::timestamptz)
) AS r(reviewer_name, rating, title, body, verified_purchase, created_at)
WHERE p.name LIKE '%七宝焼%'
LIMIT 3;

-- FOMUSランニングウェア reviews
INSERT INTO product_reviews (product_id, reviewer_name, rating, title, body, verified_purchase, is_published, created_at)
SELECT p.id, r.reviewer_name, r.rating, r.title, r.body, r.verified_purchase, true, r.created_at
FROM products p
CROSS JOIN (VALUES
  ('鈴木 大地', 5, 'マラソン大会で注目の的', '東京マラソンで着用しました。背中のJAPANデザインが外国人ランナーに大好評で、何人にも声をかけられました。速乾性も高くて機能面も申し分ないです。', true, '2026-03-05T18:00:00+09:00'::timestamptz),
  ('A.Y.', 4, 'デザインが最高', '普段のジョギング用に購入。デザインがかっこよくて走るモチベーションが上がります。サイズはやや大きめかも。次はMサイズにします。', true, '2026-03-10T07:30:00+09:00'::timestamptz),
  ('木村 結衣', 5, '普段着としても使える', 'ランニングだけでなく普段着としても着ています。シルエットがすっきりしていて、デザインもスタイリッシュ。洗濯してもヘタらないのが嬉しいです。', true, '2026-02-22T14:45:00+09:00'::timestamptz)
) AS r(reviewer_name, rating, title, body, verified_purchase, created_at)
WHERE p.name LIKE '%ランニングウェア%'
LIMIT 3;

-- 枡タワー reviews
INSERT INTO product_reviews (product_id, reviewer_name, rating, title, body, verified_purchase, is_published, created_at)
SELECT p.id, r.reviewer_name, r.rating, r.title, r.body, r.verified_purchase, true, r.created_at
FROM products p
CROSS JOIN (VALUES
  ('株式会社◯◯ 広報部', 5, '展示会のシンボルに', '企業の展示会ブースに設置しました。来場者の目を引く圧巻のインパクトで、ブースへの集客効果は抜群。終了後は社員に枡を配布して、SDGsの取り組みとしてもPRできました。', true, '2026-02-20T13:00:00+09:00'::timestamptz),
  ('松田 和也', 4, '圧巻の存在感', 'イベント装飾として注文。組み立ては思ったより簡単で、完成した姿は本当に圧巻でした。ただ保管場所の確保が必要なので、事前に考えておくのがおすすめ。', true, '2026-01-15T10:00:00+09:00'::timestamptz)
) AS r(reviewer_name, rating, title, body, verified_purchase, created_at)
WHERE p.name LIKE '%枡タワー%'
LIMIT 2;

-- 蓋付き枡 reviews
INSERT INTO product_reviews (product_id, reviewer_name, rating, title, body, verified_purchase, is_published, created_at)
SELECT p.id, r.reviewer_name, r.rating, r.title, r.body, r.verified_purchase, true, r.created_at
FROM products p
CROSS JOIN (VALUES
  ('小林 恵', 5, 'アクセサリー入れに最適', '指輪やピアスを入れるのにちょうどいいサイズ。蓋があるのでホコリも入らず、ヒノキの香りでジュエリーボックスとして使っています。見た目も上品で、ドレッサーに置いても素敵。', true, '2026-02-25T15:45:00+09:00'::timestamptz),
  ('吉田 奈々', 4, 'お茶請け入れとして', 'お客様が来た時に和菓子を入れて出しています。蓋を開けた時のヒノキの香りが好評で、おもてなしのアイテムとして重宝しています。もう少し深さがあると完璧。', true, '2026-01-25T11:30:00+09:00'::timestamptz),
  ('H.N.', 5, '贈答用にリピート', '取引先への手土産として何度もリピートしています。蓋付きなので中にお菓子を入れて渡すと、枡自体も喜ばれて一石二鳥です。', true, '2026-03-02T09:00:00+09:00'::timestamptz)
) AS r(reviewer_name, rating, title, body, verified_purchase, created_at)
WHERE p.name LIKE '%蓋付き枡%'
LIMIT 3;
