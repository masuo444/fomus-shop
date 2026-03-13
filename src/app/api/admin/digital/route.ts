import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { checkAdmin } from '@/lib/auth'
import { getPublishedShopIds } from '@/lib/shop'
import { requireString, sanitizeString, validatePositiveInt, clampNumber, ValidationError } from '@/lib/validation'

export async function POST(request: NextRequest) {
  const user = await checkAdmin()
  if (!user) {
    return NextResponse.json({ error: '権限がありません' }, { status: 403 })
  }

  const body = await request.json()

  try {
    const publishedIds = await getPublishedShopIds()
    const shopId = publishedIds[0] ?? ''
    const admin = createAdminClient()

    const { data, error } = await admin
      .from('digital_items')
      .insert({
        shop_id: shopId,
        name: requireString(body.name, '名前'),
        description: sanitizeString(body.description, 5000),
        image_url: sanitizeString(body.image_url, 500) || null,
        price: validatePositiveInt(body.price, '価格'),
        total_supply: validatePositiveInt(body.total_supply, '発行数'),
        royalty_percentage: clampNumber(body.royalty_percentage, 0, 100, 10),
        resale_enabled: body.resale_enabled === true,
        is_published: body.is_published === true,
        secret_content: typeof body.secret_content === 'string' ? body.secret_content : null,
        metadata: body.metadata && typeof body.metadata === 'object' ? body.metadata : {},
        issued_count: 0,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json(data)
  } catch (err) {
    if (err instanceof ValidationError) {
      return NextResponse.json({ error: err.message }, { status: 400 })
    }
    throw err
  }
}
