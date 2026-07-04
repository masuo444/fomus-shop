-- =============================================
-- FOMUS GUILD 会員の紹介コード対応
-- 購入時にGUILD会員の紹介コードを入力できるようにし、
-- 決済完了時にGUILD側へ売上を通知して10%相当のポイントを還元する。
-- Supabase SQL Editor で実行してください
-- =============================================

ALTER TABLE orders ADD COLUMN IF NOT EXISTS referral_code TEXT;

-- 通知済みかどうかのフラグ（Webhookの再送があっても二重通知しないための補助。
-- 主な冪等性はGUILD側のsales_credits.order_id UNIQUE制約が担保する）
ALTER TABLE orders ADD COLUMN IF NOT EXISTS referral_credited BOOLEAN DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_orders_referral_code ON orders(referral_code) WHERE referral_code IS NOT NULL;
