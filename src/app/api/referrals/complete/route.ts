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

    // Check if user has a pending referral
    const { data: referral } = await admin
      .from('referrals')
      .select('*')
      .eq('referred_id', userId)
      .eq('status', 'pending')
      .single()

    if (!referral) {
      return NextResponse.json({ message: '対象の紹介なし' })
    }

    // Get platform shop
    const shopId = await getPlatformShopId()

    if (!shopId) {
      return NextResponse.json({ error: 'ショップが見つかりません' }, { status: 404 })
    }

    // Create 500円OFF coupon for referrer
    const referrerShortId = referral.referrer_id.slice(0, 8).toUpperCase()
    const referrerExpiresAt = new Date()
    referrerExpiresAt.setDate(referrerExpiresAt.getDate() + 30)

    await admin.from('coupons').insert({
      shop_id: shopId,
      code: `REFTHANKS-${referrerShortId}-${Date.now().toString(36).toUpperCase()}`,
      description: '紹介お礼500円OFFクーポン',
      discount_type: 'fixed',
      discount_value: 500,
      min_order_amount: 0,
      max_uses: 1,
      used_count: 0,
      starts_at: new Date().toISOString(),
      expires_at: referrerExpiresAt.toISOString(),
      is_active: true,
    })

    // Create 500円OFF coupon for referred user
    const shortId = userId.slice(0, 8).toUpperCase()
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 30)

    await admin.from('coupons').insert({
      shop_id: shopId,
      code: `REFERRAL-${shortId}`,
      description: '紹介特典500円OFFクーポン',
      discount_type: 'fixed',
      discount_value: 500,
      min_order_amount: 0,
      max_uses: 1,
      used_count: 0,
      starts_at: new Date().toISOString(),
      expires_at: expiresAt.toISOString(),
      is_active: true,
    })

    // Update referral status
    await admin
      .from('referrals')
      .update({ status: 'completed' })
      .eq('id', referral.id)

    return NextResponse.json({ message: '紹介報酬を処理しました' })
  } catch (error) {
    console.error('Referral complete error:', error)
    return NextResponse.json({ error: 'エラーが発生しました' }, { status: 500 })
  }
}
