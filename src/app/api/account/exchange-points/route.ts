import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { getPublishedShopIds } from '@/lib/shop'

// Exchange tiers: points → coupon value
const EXCHANGE_TIERS = [
  { points: 1000, value: 1000, label: '¥1,000 クーポン' },
  { points: 3000, value: 3000, label: '¥3,000 クーポン' },
  { points: 5000, value: 5000, label: '¥5,000 クーポン' },
  { points: 10000, value: 10000, label: '¥10,000 クーポン' },
]

export { EXCHANGE_TIERS }

// GET: Get exchange tiers and user points
export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'ログインが必要です' }, { status: 401 })
    }

    const admin = createAdminClient()
    const { data: profile } = await admin
      .from('profiles')
      .select('points')
      .eq('id', user.id)
      .single()

    return NextResponse.json({
      points: profile?.points || 0,
      tiers: EXCHANGE_TIERS,
    })
  } catch (error) {
    console.error('Exchange points error:', error)
    return NextResponse.json({ error: 'エラーが発生しました' }, { status: 500 })
  }
}

// POST: Exchange points for a coupon
export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'ログインが必要です' }, { status: 401 })
    }

    const { points: requestedPoints } = await request.json()
    const tier = EXCHANGE_TIERS.find(t => t.points === requestedPoints)

    if (!tier) {
      return NextResponse.json({ error: '無効な交換ポイント数です' }, { status: 400 })
    }

    const admin = createAdminClient()

    // Atomically deduct points (prevents race conditions)
    const { data: deductResult } = await admin.rpc('deduct_points', {
      p_user_id: user.id,
      p_amount: tier.points,
    })

    if (deductResult?.error) {
      if (deductResult.error === 'insufficient_points') {
        return NextResponse.json({ error: 'ポイントが不足しています' }, { status: 400 })
      }
      return NextResponse.json({ error: 'エラーが発生しました' }, { status: 500 })
    }

    // Get shop ID for the coupon
    const shopIds = await getPublishedShopIds()
    if (shopIds.length === 0) {
      // Refund points
      await admin.from('profiles').update({
        points: (deductResult?.remaining ?? 0) + tier.points,
      }).eq('id', user.id)
      return NextResponse.json({ error: 'ショップが見つかりません' }, { status: 500 })
    }

    // Generate unique coupon code
    const code = `PT-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`

    // Create the coupon
    const expiresAt = new Date()
    expiresAt.setMonth(expiresAt.getMonth() + 6) // 6 months expiry

    const { data: coupon, error: couponError } = await admin
      .from('coupons')
      .insert({
        shop_id: shopIds[0],
        code,
        description: `ポイント交換クーポン（${tier.points}pt → ${tier.label}）`,
        discount_type: 'fixed',
        discount_value: tier.value,
        min_order_amount: 0,
        max_uses: 1,
        used_count: 0,
        starts_at: new Date().toISOString(),
        expires_at: expiresAt.toISOString(),
        is_active: true,
      })
      .select()
      .single()

    if (couponError || !coupon) {
      console.error('Coupon creation error:', couponError)
      // Refund points
      await admin.from('profiles').update({
        points: (deductResult?.remaining ?? 0) + tier.points,
      }).eq('id', user.id)
      return NextResponse.json({ error: 'クーポンの作成に失敗しました' }, { status: 500 })
    }

    // Record point transaction
    await admin.from('point_transactions').insert({
      user_id: user.id,
      amount: -tier.points,
      type: 'point_exchange',
      description: `ポイント交換: ${tier.label}（クーポンコード: ${code}）`,
    })

    return NextResponse.json({
      coupon: {
        code: coupon.code,
        value: tier.value,
        expires_at: coupon.expires_at,
      },
    })
  } catch (error) {
    console.error('Exchange points error:', error)
    return NextResponse.json({ error: 'エラーが発生しました' }, { status: 500 })
  }
}
