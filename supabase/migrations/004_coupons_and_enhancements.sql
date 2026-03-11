-- ============================================
-- Coupons / Discount Codes
-- ============================================
CREATE TABLE coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id UUID REFERENCES shops(id) ON DELETE CASCADE NOT NULL,
  code TEXT NOT NULL,
  description TEXT,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value INTEGER NOT NULL, -- percentage (e.g. 10) or fixed yen amount
  min_order_amount INTEGER DEFAULT 0,
  max_uses INTEGER, -- NULL = unlimited
  used_count INTEGER DEFAULT 0,
  starts_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(shop_id, code)
);

-- Coupon usage tracking
CREATE TABLE coupon_usages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coupon_id UUID REFERENCES coupons(id) ON DELETE CASCADE NOT NULL,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
  user_email TEXT NOT NULL,
  discount_amount INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Add coupon fields to orders
ALTER TABLE orders ADD COLUMN IF NOT EXISTS coupon_id UUID REFERENCES coupons(id);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS discount_amount INTEGER DEFAULT 0;

-- Notification log
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id UUID REFERENCES shops(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL, -- 'new_order', 'low_stock', 'new_customer'
  title TEXT NOT NULL,
  message TEXT,
  is_read BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupon_usages ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "coupons_admin" ON coupons FOR ALL USING (
  EXISTS (SELECT 1 FROM shops WHERE shops.id = coupons.shop_id AND shops.owner_id = auth.uid())
);
CREATE POLICY "coupons_public_read" ON coupons FOR SELECT USING (is_active = true);

CREATE POLICY "coupon_usages_admin" ON coupon_usages FOR ALL USING (
  EXISTS (
    SELECT 1 FROM coupons c JOIN shops s ON s.id = c.shop_id
    WHERE c.id = coupon_usages.coupon_id AND s.owner_id = auth.uid()
  )
);

CREATE POLICY "notifications_admin" ON notifications FOR ALL USING (
  EXISTS (SELECT 1 FROM shops WHERE shops.id = notifications.shop_id AND shops.owner_id = auth.uid())
);

-- Indexes
CREATE INDEX idx_coupons_shop ON coupons(shop_id);
CREATE INDEX idx_coupons_code ON coupons(shop_id, code);
CREATE INDEX idx_notifications_shop ON notifications(shop_id, is_read);
CREATE INDEX idx_notifications_created ON notifications(created_at DESC);

-- Create notification on new order
CREATE OR REPLACE FUNCTION notify_new_order()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'paid' AND (OLD IS NULL OR OLD.status != 'paid') THEN
    INSERT INTO notifications (shop_id, type, title, message, metadata)
    VALUES (
      NEW.shop_id,
      'new_order',
      '新しい注文が入りました',
      NEW.order_number || ' - ' || NEW.shipping_name || ' - ¥' || NEW.total,
      jsonb_build_object('order_id', NEW.id, 'order_number', NEW.order_number)
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER orders_notify AFTER INSERT OR UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION notify_new_order();

-- Create notification on low stock
CREATE OR REPLACE FUNCTION notify_low_stock()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.stock <= 3 AND NEW.stock > 0 AND (OLD IS NULL OR OLD.stock > 3) THEN
    INSERT INTO notifications (shop_id, type, title, message, metadata)
    VALUES (
      NEW.shop_id,
      'low_stock',
      '在庫残りわずか',
      NEW.name || ' の在庫が残り' || NEW.stock || '個です',
      jsonb_build_object('product_id', NEW.id, 'product_name', NEW.name, 'stock', NEW.stock)
    );
  END IF;
  IF NEW.stock = 0 AND (OLD IS NULL OR OLD.stock > 0) THEN
    INSERT INTO notifications (shop_id, type, title, message, metadata)
    VALUES (
      NEW.shop_id,
      'low_stock',
      '在庫切れ',
      NEW.name || ' の在庫がなくなりました',
      jsonb_build_object('product_id', NEW.id, 'product_name', NEW.name, 'stock', 0)
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER products_low_stock AFTER UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION notify_low_stock();

-- Supabase Storage bucket for product images
INSERT INTO storage.buckets (id, name, public) VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "product_images_public_read" ON storage.objects FOR SELECT
  USING (bucket_id = 'product-images');
CREATE POLICY "product_images_admin_write" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'product-images');
CREATE POLICY "product_images_admin_delete" ON storage.objects FOR DELETE
  USING (bucket_id = 'product-images');
CREATE POLICY "product_images_admin_update" ON storage.objects FOR UPDATE
  USING (bucket_id = 'product-images');
