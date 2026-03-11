import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getPlatformShopId } from '@/lib/shop'
import siteConfig from '@/site.config'

export async function GET(request: Request) {
  // Verify cron secret
  const cronSecret = request.headers.get('x-cron-secret')
  if (cronSecret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const admin = createAdminClient()

    // Get platform shop
    const shopId = await getPlatformShopId()

    if (!shopId) {
      return NextResponse.json({ error: 'ショップが見つかりません' }, { status: 404 })
    }

    // Get today's month and day
    const today = new Date()
    const month = String(today.getMonth() + 1).padStart(2, '0')
    const day = String(today.getDate()).padStart(2, '0')

    // Find profiles with birthday today (birthday stored as YYYY-MM-DD)
    const { data: profiles } = await admin
      .from('profiles')
      .select('id, birthday, is_premium_member')
      .not('birthday', 'is', null)

    if (!profiles || profiles.length === 0) {
      return NextResponse.json({ message: '対象者なし', processed: 0 })
    }

    // Filter by month/day
    const birthdayProfiles = profiles.filter((p) => {
      if (!p.birthday) return false
      const bday = p.birthday as string
      return bday.endsWith(`-${month}-${day}`)
    })

    let processed = 0

    for (const profile of birthdayProfiles) {
      // Check if already awarded this year by looking for existing birthday coupon
      const shortId = profile.id.slice(0, 8).toUpperCase()
      const couponCode = `BIRTHDAY-${shortId}-${today.getFullYear()}`

      const { data: existing } = await admin
        .from('coupons')
        .select('id')
        .eq('code', couponCode)
        .limit(1)

      if (existing && existing.length > 0) continue

      const expiresAt = new Date()
      expiresAt.setDate(expiresAt.getDate() + 30)

      // GUILD members get 20% OFF, regular members get 10% OFF
      const isPremium = profile.is_premium_member === true
      const discountValue = isPremium ? 20 : 10
      const memberName = siteConfig.features.membershipName
      const description = isPremium
        ? `お誕生日20%OFFクーポン（${memberName}会員特典）`
        : 'お誕生日10%OFFクーポン'

      await admin.from('coupons').insert({
        shop_id: shopId,
        code: couponCode,
        description,
        discount_type: 'percentage',
        discount_value: discountValue,
        min_order_amount: 0,
        max_uses: 1,
        used_count: 0,
        starts_at: new Date().toISOString(),
        expires_at: expiresAt.toISOString(),
        is_active: true,
      })

      processed++
    }

    return NextResponse.json({ message: '誕生日クーポン処理完了', processed })
  } catch (error) {
    console.error('Birthday coupon cron error:', error)
    return NextResponse.json({ error: 'エラーが発生しました' }, { status: 500 })
  }
}
