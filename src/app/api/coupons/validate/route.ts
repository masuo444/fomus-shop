import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getPlatformShopId } from '@/lib/shop'

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { code, order_amount } = body

  if (!code) {
    return NextResponse.json({ error: 'クーポンコードを入力してください' }, { status: 400 })
  }

  const admin = createAdminClient()

  const shopId = await getPlatformShopId()

  if (!shopId) {
    return NextResponse.json({ error: 'ショップが見つかりません' }, { status: 404 })
  }

  const { data: coupon } = await admin
    .from('coupons')
    .select('*')
    .eq('shop_id', shopId)
    .eq('code', code.toUpperCase())
    .single()

  if (!coupon) {
    return NextResponse.json({ error: '無効なクーポンコードです' }, { status: 400 })
  }

  if (!coupon.is_active) {
    return NextResponse.json({ error: 'このクーポンは無効です' }, { status: 400 })
  }

  const now = new Date().toISOString()

  if (coupon.starts_at && now < coupon.starts_at) {
    return NextResponse.json({ error: 'このクーポンはまだ利用期間外です' }, { status: 400 })
  }

  if (coupon.expires_at && now > coupon.expires_at) {
    return NextResponse.json({ error: 'このクーポンは有効期限切れです' }, { status: 400 })
  }

  if (coupon.max_uses && coupon.used_count >= coupon.max_uses) {
    return NextResponse.json({ error: 'このクーポンは利用上限に達しています' }, { status: 400 })
  }

  if (order_amount < coupon.min_order_amount) {
    return NextResponse.json({
      error: `このクーポンは¥${coupon.min_order_amount.toLocaleString()}以上の注文で利用できます`,
    }, { status: 400 })
  }

  const discount = coupon.discount_type === 'percentage'
    ? Math.floor(order_amount * coupon.discount_value / 100)
    : coupon.discount_value

  return NextResponse.json({
    coupon_id: coupon.id,
    code: coupon.code,
    discount_type: coupon.discount_type,
    discount_value: coupon.discount_value,
    discount_amount: discount,
    description: coupon.description,
  })
}
