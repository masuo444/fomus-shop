import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getPlatformShopId } from '@/lib/shop'

export async function POST(request: Request) {
  try {
    const { userId } = await request.json()

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 })
    }

    const admin = createAdminClient()

    // Get platform shop
    const shopId = await getPlatformShopId()

    if (!shopId) {
      return NextResponse.json({ error: 'ショップが見つかりません' }, { status: 404 })
    }

    // Check if already awarded (prevent duplicates)
    const shortId = userId.slice(0, 8).toUpperCase()
    const couponCode = `WELCOME-${shortId}`

    const { data: existing } = await admin
      .from('coupons')
      .select('id')
      .eq('code', couponCode)
      .limit(1)

    if (existing && existing.length > 0) {
      return NextResponse.json({ message: '既に登録ボーナスは付与済みです', coupon_code: couponCode })
    }

    // Create welcome coupon
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 30)

    await admin.from('coupons').insert({
      shop_id: shopId,
      code: couponCode,
      description: '新規登録500円OFFクーポン',
      discount_type: 'fixed',
      discount_value: 500,
      min_order_amount: 0,
      max_uses: 1,
      used_count: 0,
      starts_at: new Date().toISOString(),
      expires_at: expiresAt.toISOString(),
      is_active: true,
    })

    return NextResponse.json({
      message: '登録ボーナスを付与しました',
      coupon_code: couponCode,
    })
  } catch (error) {
    console.error('Register bonus error:', error)
    return NextResponse.json({ error: 'エラーが発生しました' }, { status: 500 })
  }
}
