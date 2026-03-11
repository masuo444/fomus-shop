import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { checkShopAccess } from '@/lib/auth'
import { requireString, sanitizeString, validatePositiveInt, clampNumber, ValidationError } from '@/lib/validation'

export async function GET() {
  const access = await checkShopAccess('admin')
  if (!access) {
    return NextResponse.json({ error: '権限がありません' }, { status: 403 })
  }

  const shopId = access.shopId
  const admin = createAdminClient()

  const { data: coupons, error } = await admin
    .from('coupons')
    .select('*')
    .eq('shop_id', shopId)
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(coupons)
}

export async function POST(request: NextRequest) {
  const access = await checkShopAccess('admin')
  if (!access) {
    return NextResponse.json({ error: '権限がありません' }, { status: 403 })
  }

  const shopId = access.shopId
  const body = await request.json()

  try {
    const code = requireString(body.code, 'クーポンコード').slice(0, 50).toUpperCase()
    const description = sanitizeString(body.description, 500) || null

    // Validate discount_type
    const discount_type = body.discount_type
    if (discount_type !== 'percentage' && discount_type !== 'fixed') {
      throw new ValidationError('割引タイプは「percentage」または「fixed」で入力してください')
    }

    // Validate discount_value based on type
    const rawDiscountValue = Number(body.discount_value)
    if (isNaN(rawDiscountValue) || rawDiscountValue <= 0) {
      throw new ValidationError('割引値は正の数で入力してください')
    }
    const discount_value = discount_type === 'percentage'
      ? clampNumber(body.discount_value, 1, 100, 10)
      : clampNumber(body.discount_value, 1, 1000000, 100)

    const min_order_amount = validatePositiveInt(body.min_order_amount ?? 0, '最低注文金額')

    // Validate date range
    const starts_at = body.starts_at || null
    const expires_at = body.expires_at || null
    if (starts_at && expires_at && new Date(starts_at) >= new Date(expires_at)) {
      throw new ValidationError('開始日は終了日より前に設定してください')
    }

    const admin = createAdminClient()

    const { data, error } = await admin
      .from('coupons')
      .insert({
        shop_id: shopId,
        code,
        description,
        discount_type,
        discount_value,
        min_order_amount,
        max_uses: body.max_uses || null,
        starts_at,
        expires_at,
        is_active: body.is_active ?? true,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (err) {
    if (err instanceof ValidationError) {
      return NextResponse.json({ error: err.message }, { status: 400 })
    }
    throw err
  }
}
