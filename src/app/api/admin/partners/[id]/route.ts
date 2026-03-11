import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { checkAdmin } from '@/lib/auth'
import { requireString, validateSlug, validateEmail, sanitizeString, clampNumber, ValidationError } from '@/lib/validation'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await checkAdmin()
  if (!user) {
    return NextResponse.json({ error: '権限がありません' }, { status: 403 })
  }

  const { id } = await params
  const admin = createAdminClient()

  const { data: shop, error } = await admin
    .from('shops')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !shop) {
    return NextResponse.json({ error: 'パートナーが見つかりません' }, { status: 404 })
  }

  // Get partner users associated with this shop
  const { data: partners } = await admin
    .from('profiles')
    .select('id, email, name, role, shop_id, created_at')
    .eq('shop_id', id)
    .eq('role', 'partner')

  return NextResponse.json({ shop, partners: partners ?? [] })
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await checkAdmin()
  if (!user) {
    return NextResponse.json({ error: '権限がありません' }, { status: 403 })
  }

  const { id } = await params
  const body = await request.json()

  try {
    const admin = createAdminClient()

    // Only allow updating specific fields with validation
    const updateData: Record<string, unknown> = {}
    if (body.name !== undefined) updateData.name = requireString(body.name, '名前').slice(0, 100)
    if (body.slug !== undefined) updateData.slug = validateSlug(requireString(body.slug, 'スラッグ'))
    if (body.description !== undefined) updateData.description = sanitizeString(body.description, 2000) || null
    if (body.contact_email !== undefined) updateData.contact_email = body.contact_email ? validateEmail(body.contact_email) : null
    if (body.commission_rate !== undefined) updateData.commission_rate = clampNumber(body.commission_rate, 0, 100, 0)
    if (body.status !== undefined) {
      if (body.status !== 'active' && body.status !== 'suspended') {
        throw new ValidationError('ステータスは「active」または「suspended」で入力してください')
      }
      updateData.status = body.status
    }
    if (body.is_published !== undefined) updateData.is_published = body.is_published

    const { data, error } = await admin
      .from('shops')
      .update(updateData)
      .eq('id', id)
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

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await checkAdmin()
  if (!user) {
    return NextResponse.json({ error: '権限がありません' }, { status: 403 })
  }

  const { id } = await params
  const admin = createAdminClient()

  // Suspend the partner shop (don't hard delete)
  const { data, error } = await admin
    .from('shops')
    .update({ status: 'suspended', is_published: false })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}
