-- ============================================
-- Product Enhancements - BASE-style features
-- ============================================

-- Add new columns to products
ALTER TABLE products ADD COLUMN IF NOT EXISTS tax_rate INTEGER DEFAULT 10; -- 10% or 8%
ALTER TABLE products ADD COLUMN IF NOT EXISTS quantity_limit INTEGER; -- max per order
ALTER TABLE products ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0;
ALTER TABLE products ADD COLUMN IF NOT EXISTS preorder_enabled BOOLEAN DEFAULT false;
ALTER TABLE products ADD COLUMN IF NOT EXISTS preorder_start_date DATE;
ALTER TABLE products ADD COLUMN IF NOT EXISTS preorder_end_date DATE;
ALTER TABLE products ADD COLUMN IF NOT EXISTS weight_grams INTEGER; -- for shipping calc

-- Shipping methods (per shop)
CREATE TABLE shipping_methods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id UUID REFERENCES shops(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL, -- e.g. スマートレター, レターパック
  type TEXT DEFAULT 'flat' CHECK (type IN ('flat', 'regional', 'free')),
  flat_fee INTEGER DEFAULT 0, -- for flat rate
  is_default BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Product <-> Shipping method junction
CREATE TABLE product_shipping_methods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  shipping_method_id UUID REFERENCES shipping_methods(id) ON DELETE CASCADE NOT NULL,
  UNIQUE(product_id, shipping_method_id)
);

-- Product options (e.g. サイズ, カラー, オーダーメイド枡)
CREATE TABLE product_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL, -- e.g. "枡シェアのサイズと個数"
  required BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Option choices (e.g. ミニ枡(10個〜100個), １合枡(10個〜100個))
CREATE TABLE product_option_choices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  option_id UUID REFERENCES product_options(id) ON DELETE CASCADE NOT NULL,
  label TEXT NOT NULL, -- e.g. "ミニ枡(10個〜100個)"
  price_adjustment INTEGER DEFAULT 0, -- additional price
  stock INTEGER, -- NULL = unlimited
  sort_order INTEGER DEFAULT 0
);

-- RLS
ALTER TABLE shipping_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_shipping_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_option_choices ENABLE ROW LEVEL SECURITY;

-- Shipping methods: public read, admin write
CREATE POLICY "shipping_methods_read" ON shipping_methods FOR SELECT USING (true);
CREATE POLICY "shipping_methods_admin" ON shipping_methods FOR ALL USING (
  EXISTS (SELECT 1 FROM shops WHERE shops.id = shipping_methods.shop_id AND shops.owner_id = auth.uid())
);

-- Product shipping methods: public read
CREATE POLICY "product_shipping_read" ON product_shipping_methods FOR SELECT USING (true);
CREATE POLICY "product_shipping_admin" ON product_shipping_methods FOR ALL USING (
  EXISTS (
    SELECT 1 FROM products p JOIN shops s ON s.id = p.shop_id
    WHERE p.id = product_shipping_methods.product_id AND s.owner_id = auth.uid()
  )
);

-- Product options: public read
CREATE POLICY "product_options_read" ON product_options FOR SELECT USING (true);
CREATE POLICY "product_options_admin" ON product_options FOR ALL USING (
  EXISTS (
    SELECT 1 FROM products p JOIN shops s ON s.id = p.shop_id
    WHERE p.id = product_options.product_id AND s.owner_id = auth.uid()
  )
);

-- Option choices: public read
CREATE POLICY "option_choices_read" ON product_option_choices FOR SELECT USING (true);
CREATE POLICY "option_choices_admin" ON product_option_choices FOR ALL USING (
  EXISTS (
    SELECT 1 FROM product_options po JOIN products p ON p.id = po.product_id
    JOIN shops s ON s.id = p.shop_id
    WHERE po.id = product_option_choices.option_id AND s.owner_id = auth.uid()
  )
);

-- Indexes
CREATE INDEX idx_shipping_methods_shop ON shipping_methods(shop_id);
CREATE INDEX idx_product_shipping_product ON product_shipping_methods(product_id);
CREATE INDEX idx_product_options_product ON product_options(product_id);
CREATE INDEX idx_option_choices_option ON product_option_choices(option_id);

-- Insert default shipping methods for FOMUS
INSERT INTO shipping_methods (shop_id, name, type, flat_fee, sort_order)
SELECT id, 'スマートレター', 'free', 0, 1 FROM shops WHERE slug = 'fomus';
INSERT INTO shipping_methods (shop_id, name, type, flat_fee, sort_order)
SELECT id, 'レターパック', 'flat', 520, 2 FROM shops WHERE slug = 'fomus';
INSERT INTO shipping_methods (shop_id, name, type, flat_fee, sort_order)
SELECT id, '送料込み', 'free', 0, 3 FROM shops WHERE slug = 'fomus';
INSERT INTO shipping_methods (shop_id, name, type, flat_fee, sort_order)
SELECT id, '定形外郵便', 'regional', 0, 4 FROM shops WHERE slug = 'fomus';

-- Insert default categories for FOMUS
INSERT INTO categories (shop_id, name, slug, sort_order)
SELECT id, 'ALL', 'all', 0 FROM shops WHERE slug = 'fomus';
INSERT INTO categories (shop_id, name, slug, sort_order)
SELECT id, '枡', 'masu', 1 FROM shops WHERE slug = 'fomus';
INSERT INTO categories (shop_id, name, slug, sort_order)
SELECT id, '撮影', 'photo', 2 FROM shops WHERE slug = 'fomus';
INSERT INTO categories (shop_id, name, slug, sort_order)
SELECT id, 'イベント', 'event', 3 FROM shops WHERE slug = 'fomus';
INSERT INTO categories (shop_id, name, slug, sort_order)
SELECT id, 'その他', 'other', 4 FROM shops WHERE slug = 'fomus';
