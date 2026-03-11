import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { checkPartner } from '@/lib/auth'
import { requireString, validateEmail, sanitizeString, ValidationError } from '@/lib/validation'

// GET: Get partner's shop details
export async function GET() {
  const partner = await checkPartner()
  if (!partner) {
    return NextResponse.json({ error: '権限がありません' }, { status: 403 })
  }

  const supabase = await createClient()

  const { data: shop, error } = await supabase
    .from('shops')
    .select('id, name, description, logo_url, cover_url, contact_email, commission_rate, status')
    .eq('id', partner.shopId)
    .single()

  if (error || !shop) {
    return NextResponse.json({ error: 'ショップが見つかりません' }, { status: 404 })
  }

  return NextResponse.json(shop)
}

// PUT: Update shop details (limited fields only - not commission_rate or status)
export async function PUT(request: NextRequest) {
  const partner = await checkPartner()
  if (!partner) {
    return NextResponse.json({ error: '権限がありません' }, { status: 403 })
  }

  const body = await request.json()

  try {
    const admin = createAdminClient()

    // Only allow updating safe fields - not commission_rate or status
    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    }

    if (body.name !== undefined) updateData.name = requireString(body.name, '名前').slice(0, 100)
    if (body.description !== undefined) updateData.description = sanitizeString(body.description, 2000) || null
    if (body.logo_url !== undefined) {
      const logoUrl = sanitizeString(body.logo_url, 500)
      if (logoUrl && !logoUrl.startsWith('https://')) {
        throw new ValidationError('ロゴURLはhttps://で始まる必要があります')
      }
      updateData.logo_url = logoUrl || null
    }
    if (body.cover_url !== undefined) {
      const coverUrl = sanitizeString(body.cover_url, 500)
      if (coverUrl && !coverUrl.startsWith('https://')) {
        throw new ValidationError('カバー画像URLはhttps://で始まる必要があります')
      }
      updateData.cover_url = coverUrl || null
    }
    if (body.contact_email !== undefined) updateData.contact_email = body.contact_email ? validateEmail(body.contact_email) : null

    const { data, error } = await admin
      .from('shops')
      .update(updateData)
      .eq('id', partner.shopId)
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
