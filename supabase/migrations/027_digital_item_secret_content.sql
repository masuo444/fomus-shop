-- Add secret_content column to digital_items (revealed only to token owners after purchase)
ALTER TABLE digital_items ADD COLUMN IF NOT EXISTS secret_content TEXT;

-- Insert "まっすー海外活動記" digital item
INSERT INTO digital_items (shop_id, name, description, image_url, price, total_supply, issued_count, royalty_percentage, resale_enabled, is_published, secret_content, metadata)
VALUES (
  '315a25a8-1f4a-4eda-a0e2-b14d425217ed',
  'まっすー海外活動記',
  'FOUMSのまっすーが海外で枡を広める活動をまとめたデジタルコンテンツ。購入後、閲覧用パスワードが届きます。',
  NULL,
  14800,
  100,
  0,
  10,
  false,
  true,
  'パスワード: fomus2000',
  '{}'
);
