-- 枡バッジ（限定リンク販売）
-- hidden_from_listing = true: ショップ一覧には表示せず、直リンクのみアクセス可
-- item_type = 'digital': 送料を加算しない（送料込み¥6,000 を実現）

INSERT INTO products (
  shop_id, name, description, price, stock, is_published, item_type,
  hidden_from_listing, sort_order
) VALUES (
  '315a25a8-1f4a-4eda-a0e2-b14d425217ed',
  '枡バッジ',
  'FOMUSオリジナルの枡バッジです。

日本国内送料込み・税込 ¥6,000
在庫限り（8個）

ご注文後、順次発送いたします。',
  6000, 8, true, 'digital', true, 100
);
