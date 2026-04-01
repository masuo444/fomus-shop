-- 完全受注生産機能
ALTER TABLE products ADD COLUMN IF NOT EXISTS made_to_order BOOLEAN DEFAULT false;
ALTER TABLE products ADD COLUMN IF NOT EXISTS production_time TEXT;

-- decrement_stock: 受注生産品はストック減算をスキップ
CREATE OR REPLACE FUNCTION decrement_stock(p_product_id UUID, p_quantity INTEGER)
RETURNS void AS $$
DECLARE
  v_made_to_order BOOLEAN;
BEGIN
  SELECT made_to_order INTO v_made_to_order FROM products WHERE id = p_product_id;

  IF v_made_to_order THEN
    RETURN;
  END IF;

  UPDATE products
  SET stock = stock - p_quantity
  WHERE id = p_product_id AND stock >= p_quantity;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Insufficient stock for product %', p_product_id;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
