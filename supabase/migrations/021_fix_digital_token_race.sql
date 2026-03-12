-- Atomic function to issue a digital token (prevents race condition on token_number)
CREATE OR REPLACE FUNCTION issue_digital_token(
  p_digital_item_id UUID,
  p_user_id UUID,
  p_price INTEGER
) RETURNS JSON AS $$
DECLARE
  v_item RECORD;
  v_token_number INTEGER;
  v_token_id UUID;
BEGIN
  -- Lock the digital item row to serialize concurrent purchases
  SELECT * INTO v_item FROM digital_items WHERE id = p_digital_item_id FOR UPDATE;

  IF v_item IS NULL THEN
    RAISE EXCEPTION 'Digital item not found';
  END IF;

  IF v_item.issued_count >= v_item.total_supply THEN
    RAISE EXCEPTION 'Sold out';
  END IF;

  v_token_number := v_item.issued_count + 1;

  -- Create token
  INSERT INTO digital_tokens (digital_item_id, current_owner_id, token_number, original_price, status)
  VALUES (p_digital_item_id, p_user_id, v_token_number, p_price, 'owned')
  RETURNING id INTO v_token_id;

  -- Update issued count
  UPDATE digital_items SET issued_count = v_token_number WHERE id = p_digital_item_id;

  -- Record ownership transfer
  INSERT INTO ownership_transfers (digital_token_id, to_user_id, price, transfer_type)
  VALUES (v_token_id, p_user_id, p_price, 'purchase');

  RETURN json_build_object('token_id', v_token_id, 'token_number', v_token_number);
END;
$$ LANGUAGE plpgsql;


-- Atomic payout request creation (prevents double-deduct race condition)
CREATE OR REPLACE FUNCTION create_payout_request(
  p_user_id UUID,
  p_points INTEGER,
  p_fee INTEGER,
  p_amount INTEGER,
  p_bank_name TEXT,
  p_branch_name TEXT,
  p_account_type TEXT,
  p_account_number TEXT,
  p_account_holder TEXT
) RETURNS JSON AS $$
DECLARE
  v_profile RECORD;
  v_pending_count INTEGER;
  v_request_id UUID;
BEGIN
  -- Lock profile row to serialize concurrent payout requests
  SELECT * INTO v_profile FROM profiles WHERE id = p_user_id FOR UPDATE;

  IF v_profile IS NULL THEN
    RAISE EXCEPTION 'Profile not found';
  END IF;

  -- Check for pending requests
  SELECT COUNT(*) INTO v_pending_count
  FROM payout_requests
  WHERE user_id = p_user_id AND status = 'pending';

  IF v_pending_count > 0 THEN
    RAISE EXCEPTION 'Pending request exists';
  END IF;

  -- Check sufficient points
  IF v_profile.points < p_points THEN
    RAISE EXCEPTION 'Insufficient points';
  END IF;

  -- Deduct points
  UPDATE profiles SET points = points - p_points WHERE id = p_user_id;

  -- Record point transaction
  INSERT INTO point_transactions (user_id, amount, type, description)
  VALUES (p_user_id, -p_points, 'payout', '振込申請: ¥' || p_amount || '');

  -- Create payout request
  INSERT INTO payout_requests (user_id, points, fee, amount, bank_name, branch_name, account_type, account_number, account_holder, status)
  VALUES (p_user_id, p_points, p_fee, p_amount, p_bank_name, p_branch_name, p_account_type, p_account_number, p_account_holder, 'pending')
  RETURNING id INTO v_request_id;

  RETURN json_build_object('request_id', v_request_id);
END;
$$ LANGUAGE plpgsql;
