-- Fix notify_new_order trigger to also fire for bank transfer orders (awaiting_payment)
CREATE OR REPLACE FUNCTION notify_new_order()
RETURNS TRIGGER AS $$
BEGIN
  -- Stripe payment: transition to 'paid'
  IF NEW.status = 'paid' AND (OLD IS NULL OR OLD.status != 'paid') THEN
    INSERT INTO notifications (shop_id, type, title, message, metadata)
    VALUES (
      NEW.shop_id,
      'new_order',
      '新しい注文が入りました',
      NEW.order_number || ' - ' || NEW.shipping_name || ' - ¥' || NEW.total,
      jsonb_build_object('order_id', NEW.id, 'order_number', NEW.order_number)
    );
  -- Bank transfer: new INSERT with awaiting_payment
  ELSIF TG_OP = 'INSERT' AND NEW.status = 'awaiting_payment' THEN
    INSERT INTO notifications (shop_id, type, title, message, metadata)
    VALUES (
      NEW.shop_id,
      'new_order',
      '新しい注文（振込待ち）',
      NEW.order_number || ' - ' || NEW.shipping_name || ' - ¥' || NEW.total,
      jsonb_build_object('order_id', NEW.id, 'order_number', NEW.order_number)
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
