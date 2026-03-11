import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { checkPartner } from '@/lib/auth'

export async function POST(request: NextRequest) {
  const partner = await checkPartner()
  if (!partner) {
    return NextResponse.json({ error: '権限がありません' }, { status: 403 })
  }

  const body = await request.json()
  const admin = createAdminClient()

  const { data: category, error } = await admin
    .from('categories')
    .insert({
      shop_id: partner.shopId,
      name: body.name,
      slug: body.slug,
      sort_order: body.sort_order ?? 0,
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json(category)
}
