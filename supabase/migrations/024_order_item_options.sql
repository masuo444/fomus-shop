-- Add options_text column to order_items for storing selected product options
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS options_text TEXT;

-- Add waterproof coating option to all FOMUS masu products
-- (products whose name contains '枡' or 'masu' in the FOMUS shop)
DO $$
DECLARE
  v_product RECORD;
  v_option_id UUID;
  v_fomus_shop_id UUID;
BEGIN
  -- Get the FOMUS shop ID
  SELECT id INTO v_fomus_shop_id FROM shops WHERE slug = 'fomus' LIMIT 1;

  IF v_fomus_shop_id IS NULL THEN
    RAISE NOTICE 'FOMUS shop not found, skipping option creation';
    RETURN;
  END IF;

  -- Loop through all FOMUS masu products
  FOR v_product IN
    SELECT id, name FROM products
    WHERE shop_id = v_fomus_shop_id
      AND (name ILIKE '%枡%' OR name ILIKE '%masu%' OR name ILIKE '%ます%')
      AND is_published = true
  LOOP
    -- Skip if this product already has a coating option
    IF EXISTS (
      SELECT 1 FROM product_options
      WHERE product_id = v_product.id AND name = '防水コーティング'
    ) THEN
      CONTINUE;
    END IF;

    -- Create the option
    INSERT INTO product_options (id, product_id, name, required, sort_order)
    VALUES (gen_random_uuid(), v_product.id, '防水コーティング', false, 1)
    RETURNING id INTO v_option_id;

    -- Create the choice
    INSERT INTO product_option_choices (id, option_id, label, price_adjustment, stock, sort_order)
    VALUES (gen_random_uuid(), v_option_id, '防水コーティングを追加（+¥800）', 800, NULL, 1);

    RAISE NOTICE 'Added coating option to: %', v_product.name;
  END LOOP;
END $$;
