import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { checkAdmin } from '@/lib/auth'
import { DEFAULT_COMMISSION_RATE } from '@/lib/constants'
import { requireString, validateSlug, validateEmail, sanitizeString, clampNumber, ValidationError } from '@/lib/validation'

export async function GET() {
  const user = await checkAdmin()
  if (!user) {
    return NextResponse.json({ error: '権限がありません' }, { status: 403 })
  }

  const admin = createAdminClient()

  const { data: shops, error } = await admin
    .from('shops')
    .select('*')
    .neq('slug', 'fomus')
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(shops ?? [])
}

export async function POST(request: NextRequest) {
  const user = await checkAdmin()
  if (!user) {
    return NextResponse.json({ error: '権限がありません' }, { status: 403 })
  }

  const body = await request.json()

  try {
    const name = requireString(body.name, '名前').slice(0, 100)
    const slug = validateSlug(requireString(body.slug, 'スラッグ'))
    const description = sanitizeString(body.description, 2000) || null
    const contact_email = body.contact_email ? validateEmail(body.contact_email) : null
    const commission_rate = clampNumber(body.commission_rate, 0, 100, DEFAULT_COMMISSION_RATE)

    const admin = createAdminClient()

    // Check slug uniqueness
    const { data: existing } = await admin
      .from('shops')
      .select('id')
      .eq('slug', slug)
      .single()

    if (existing) {
      return NextResponse.json({ error: 'このスラッグは既に使用されています' }, { status: 400 })
    }

    // Create shop
    const { data: shop, error: shopError } = await admin
      .from('shops')
      .insert({
        name,
        slug,
        description,
        contact_email,
        commission_rate,
        is_published: body.is_published ?? false,
        status: 'active',
      })
      .select()
      .single()

    if (shopError) {
      return NextResponse.json({ error: shopError.message }, { status: 400 })
    }

    // If partner email provided, assign user as partner
    if (body.partner_email) {
      const partnerEmail = validateEmail(body.partner_email)
      const { data: partnerProfile } = await admin
        .from('profiles')
        .select('id')
        .eq('email', partnerEmail)
        .single()

      if (partnerProfile) {
        await admin
          .from('profiles')
          .update({ role: 'partner', shop_id: shop.id })
          .eq('id', partnerProfile.id)
      }
    }

    return NextResponse.json(shop)
  } catch (err) {
    if (err instanceof ValidationError) {
      return NextResponse.json({ error: err.message }, { status: 400 })
    }
    throw err
  }
}
