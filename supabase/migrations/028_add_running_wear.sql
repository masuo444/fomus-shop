-- Add FOMUSランニングウェア with M/L size options

-- Insert the product (stock = 15 total: M=10 + L=5)
INSERT INTO products (shop_id, name, description, price, stock, is_published, item_type, images) VALUES
  ('315a25a8-1f4a-4eda-a0e2-b14d425217ed',
   'FOMUSランニングウェア',
   'FOUMSオリジナルデザインのランニングウェア。和柄とJAPANロゴをあしらった鮮やかなブルーのスポーツTシャツ。吸汗速乾素材。M/Lサイズ展開。',
   10000,
   15,
   true,
   'physical',
   ARRAY[
     'https://spirryexwiqjpuufakhy.supabase.co/storage/v1/object/public/product-images/products/1773377642N-IMG_8067.JPG',
     'https://spirryexwiqjpuufakhy.supabase.co/storage/v1/object/public/product-images/products/1773377644N-IMG_8068.JPG',
     'https://spirryexwiqjpuufakhy.supabase.co/storage/v1/object/public/product-images/products/1773377644N-IMG_8069.JPG',
     'https://spirryexwiqjpuufakhy.supabase.co/storage/v1/object/public/product-images/products/1773377646N-IMG_8124.JPG',
     'https://spirryexwiqjpuufakhy.supabase.co/storage/v1/object/public/product-images/products/1773377647N-IMG_8127.JPG'
   ]);

-- Add size option
INSERT INTO product_options (product_id, name, required, sort_order)
SELECT id, 'サイズ', true, 0
FROM products WHERE name = 'FOMUSランニングウェア' AND shop_id = '315a25a8-1f4a-4eda-a0e2-b14d425217ed'
ORDER BY created_at DESC LIMIT 1;

-- Add M size choice (stock 10)
INSERT INTO product_option_choices (option_id, label, price_adjustment, stock, sort_order)
SELECT po.id, 'M', 0, 10, 0
FROM product_options po
JOIN products p ON po.product_id = p.id
WHERE p.name = 'FOMUSランニングウェア' AND po.name = 'サイズ'
ORDER BY p.created_at DESC LIMIT 1;

-- Add L size choice (stock 5)
INSERT INTO product_option_choices (option_id, label, price_adjustment, stock, sort_order)
SELECT po.id, 'L', 0, 5, 1
FROM product_options po
JOIN products p ON po.product_id = p.id
WHERE p.name = 'FOMUSランニングウェア' AND po.name = 'サイズ'
ORDER BY p.created_at DESC LIMIT 1;
