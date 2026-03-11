-- ============================================
-- FOMUS EC Platform - Database Schema
-- ============================================

-- Shops (multi-tenant ready)
CREATE TABLE shops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  logo_url TEXT,
  cover_url TEXT,
  owner_id UUID REFERENCES auth.users(id),
  stripe_account_id TEXT, -- Stripe Connect account for multi-tenant
  royalty_percentage INTEGER DEFAULT 10, -- Default resale royalty %
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Profiles
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT,
  phone TEXT,
  postal_code TEXT,
  address TEXT,
  role TEXT DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Categories
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id UUID REFERENCES shops(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  UNIQUE(shop_id, slug)
);

-- Products (physical goods)
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id UUID REFERENCES shops(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  price INTEGER NOT NULL, -- in yen
  compare_at_price INTEGER,
  images TEXT[] DEFAULT '{}',
  category_id UUID REFERENCES categories(id),
  stock INTEGER DEFAULT 0,
  is_published BOOLEAN DEFAULT false,
  item_type TEXT DEFAULT 'physical' CHECK (item_type IN ('physical', 'digital')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Orders
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT UNIQUE NOT NULL, -- Human-readable: FOMUS-20260310-001
  shop_id UUID REFERENCES shops(id) NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  email TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded')),
  subtotal INTEGER NOT NULL,
  shipping_fee INTEGER DEFAULT 0,
  total INTEGER NOT NULL,
  shipping_name TEXT NOT NULL,
  shipping_postal_code TEXT NOT NULL,
  shipping_address TEXT NOT NULL,
  shipping_phone TEXT NOT NULL,
  tracking_number TEXT,
  shipping_carrier TEXT, -- yamato, sagawa, japan_post, etc.
  note TEXT,
  stripe_session_id TEXT,
  stripe_payment_intent_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Order Items
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES products(id),
  product_name TEXT NOT NULL,
  price INTEGER NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  image_url TEXT
);

-- Cart Items
CREATE TABLE cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id TEXT,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, product_id),
  UNIQUE(session_id, product_id)
);

-- ============================================
-- Digital Items / NFT-like System
-- ============================================

-- Digital item templates (tickets, digital goods, etc.)
CREATE TABLE digital_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id UUID REFERENCES shops(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  price INTEGER NOT NULL, -- Original price in yen
  total_supply INTEGER NOT NULL, -- Total number of items to mint
  issued_count INTEGER DEFAULT 0,
  royalty_percentage INTEGER DEFAULT 10, -- % that goes to shop on resale
  resale_enabled BOOLEAN DEFAULT true,
  is_published BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}', -- Flexible metadata (event date, venue, etc.)
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Issued tokens (each individual "NFT")
CREATE TABLE digital_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token_number INTEGER NOT NULL, -- #1, #2, ... of total_supply
  digital_item_id UUID REFERENCES digital_items(id) ON DELETE CASCADE NOT NULL,
  current_owner_id UUID REFERENCES auth.users(id),
  original_price INTEGER NOT NULL,
  status TEXT DEFAULT 'owned' CHECK (status IN ('owned', 'listed', 'transferred')),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(digital_item_id, token_number)
);

-- Ownership transfer history (the "blockchain" ledger)
CREATE TABLE ownership_transfers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  digital_token_id UUID REFERENCES digital_tokens(id) ON DELETE CASCADE NOT NULL,
  from_user_id UUID REFERENCES auth.users(id), -- NULL for initial purchase
  to_user_id UUID REFERENCES auth.users(id) NOT NULL,
  price INTEGER NOT NULL,
  royalty_amount INTEGER DEFAULT 0, -- Amount paid to shop
  seller_amount INTEGER DEFAULT 0, -- Amount paid to seller
  transfer_type TEXT NOT NULL CHECK (transfer_type IN ('purchase', 'resale', 'gift')),
  stripe_payment_intent_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Resale listings (marketplace)
CREATE TABLE resale_listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  digital_token_id UUID REFERENCES digital_tokens(id) ON DELETE CASCADE NOT NULL,
  seller_id UUID REFERENCES auth.users(id) NOT NULL,
  price INTEGER NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'sold', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- Customer management
-- ============================================
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id UUID REFERENCES shops(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  email TEXT NOT NULL,
  name TEXT,
  phone TEXT,
  total_orders INTEGER DEFAULT 0,
  total_spent INTEGER DEFAULT 0,
  last_order_at TIMESTAMPTZ,
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(shop_id, email)
);

-- ============================================
-- Indexes
-- ============================================
CREATE INDEX idx_products_shop ON products(shop_id);
CREATE INDEX idx_products_published ON products(is_published, shop_id);
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_orders_shop ON orders(shop_id);
CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_number ON orders(order_number);
CREATE INDEX idx_cart_user ON cart_items(user_id);
CREATE INDEX idx_cart_session ON cart_items(session_id);
CREATE INDEX idx_digital_items_shop ON digital_items(shop_id);
CREATE INDEX idx_digital_tokens_owner ON digital_tokens(current_owner_id);
CREATE INDEX idx_digital_tokens_item ON digital_tokens(digital_item_id);
CREATE INDEX idx_ownership_transfers_token ON ownership_transfers(digital_token_id);
CREATE INDEX idx_resale_listings_status ON resale_listings(status);
CREATE INDEX idx_customers_shop ON customers(shop_id);

-- ============================================
-- RLS Policies
-- ============================================
ALTER TABLE shops ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE digital_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE digital_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE ownership_transfers ENABLE ROW LEVEL SECURITY;
ALTER TABLE resale_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

-- Shops: anyone can read
CREATE POLICY "shops_read" ON shops FOR SELECT USING (true);
CREATE POLICY "shops_owner" ON shops FOR ALL USING (auth.uid() = owner_id);

-- Profiles
CREATE POLICY "profiles_read_own" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "profiles_insert" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Categories: public read
CREATE POLICY "categories_read" ON categories FOR SELECT USING (true);
CREATE POLICY "categories_admin" ON categories FOR ALL USING (
  EXISTS (SELECT 1 FROM shops WHERE shops.id = categories.shop_id AND shops.owner_id = auth.uid())
);

-- Products: published = public read
CREATE POLICY "products_public_read" ON products FOR SELECT USING (is_published = true);
CREATE POLICY "products_admin" ON products FOR ALL USING (
  EXISTS (SELECT 1 FROM shops WHERE shops.id = products.shop_id AND shops.owner_id = auth.uid())
);

-- Orders
CREATE POLICY "orders_own" ON orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "orders_admin" ON orders FOR ALL USING (
  EXISTS (SELECT 1 FROM shops WHERE shops.id = orders.shop_id AND shops.owner_id = auth.uid())
);

-- Order Items
CREATE POLICY "order_items_read" ON order_items FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM orders WHERE orders.id = order_items.order_id
    AND (orders.user_id = auth.uid() OR EXISTS (
      SELECT 1 FROM shops WHERE shops.id = orders.shop_id AND shops.owner_id = auth.uid()
    ))
  )
);

-- Cart Items
CREATE POLICY "cart_own" ON cart_items FOR ALL USING (auth.uid() = user_id);

-- Digital Items: published = public
CREATE POLICY "digital_items_public" ON digital_items FOR SELECT USING (is_published = true);
CREATE POLICY "digital_items_admin" ON digital_items FOR ALL USING (
  EXISTS (SELECT 1 FROM shops WHERE shops.id = digital_items.shop_id AND shops.owner_id = auth.uid())
);

-- Digital Tokens: owner can read own
CREATE POLICY "digital_tokens_own" ON digital_tokens FOR SELECT USING (current_owner_id = auth.uid());
CREATE POLICY "digital_tokens_public" ON digital_tokens FOR SELECT USING (
  status = 'listed'
);
CREATE POLICY "digital_tokens_admin" ON digital_tokens FOR ALL USING (
  EXISTS (
    SELECT 1 FROM digital_items di JOIN shops s ON s.id = di.shop_id
    WHERE di.id = digital_tokens.digital_item_id AND s.owner_id = auth.uid()
  )
);

-- Ownership Transfers: involved parties can read
CREATE POLICY "transfers_read" ON ownership_transfers FOR SELECT USING (
  from_user_id = auth.uid() OR to_user_id = auth.uid()
);
CREATE POLICY "transfers_admin" ON ownership_transfers FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM digital_tokens dt JOIN digital_items di ON di.id = dt.digital_item_id
    JOIN shops s ON s.id = di.shop_id
    WHERE dt.id = ownership_transfers.digital_token_id AND s.owner_id = auth.uid()
  )
);

-- Resale Listings: active = public
CREATE POLICY "resale_public_read" ON resale_listings FOR SELECT USING (status = 'active');
CREATE POLICY "resale_own" ON resale_listings FOR ALL USING (seller_id = auth.uid());

-- Customers: admin only
CREATE POLICY "customers_admin" ON customers FOR ALL USING (
  EXISTS (SELECT 1 FROM shops WHERE shops.id = customers.shop_id AND shops.owner_id = auth.uid())
);

-- ============================================
-- Functions & Triggers
-- ============================================

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER digital_items_updated_at BEFORE UPDATE ON digital_items FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER resale_listings_updated_at BEFORE UPDATE ON resale_listings FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Generate order number
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TRIGGER AS $$
DECLARE
  today_count INTEGER;
BEGIN
  SELECT COUNT(*) + 1 INTO today_count FROM orders
  WHERE DATE(created_at) = CURRENT_DATE AND shop_id = NEW.shop_id;
  NEW.order_number := 'FOMUS-' || TO_CHAR(CURRENT_DATE, 'YYYYMMDD') || '-' || LPAD(today_count::TEXT, 3, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER orders_generate_number BEFORE INSERT ON orders
  FOR EACH ROW EXECUTE FUNCTION generate_order_number();

-- Update customer stats on order
CREATE OR REPLACE FUNCTION update_customer_on_order()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'paid' AND (OLD IS NULL OR OLD.status != 'paid') THEN
    INSERT INTO customers (shop_id, user_id, email, name, total_orders, total_spent, last_order_at)
    VALUES (NEW.shop_id, NEW.user_id, NEW.email, NEW.shipping_name, 1, NEW.total, now())
    ON CONFLICT (shop_id, email) DO UPDATE SET
      total_orders = customers.total_orders + 1,
      total_spent = customers.total_spent + NEW.total,
      last_order_at = now(),
      name = COALESCE(EXCLUDED.name, customers.name);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER orders_update_customer AFTER INSERT OR UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_customer_on_order();

-- Decrease stock on paid order
CREATE OR REPLACE FUNCTION decrease_stock_on_paid()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'paid' AND (OLD IS NULL OR OLD.status != 'paid') THEN
    UPDATE products SET stock = stock - oi.quantity
    FROM order_items oi
    WHERE oi.order_id = NEW.id AND products.id = oi.product_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER orders_decrease_stock AFTER UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION decrease_stock_on_paid();

-- Insert default FOMUS shop
INSERT INTO shops (name, slug, description) VALUES ('FOMUS', 'fomus', 'FOMUS Official Shop');
