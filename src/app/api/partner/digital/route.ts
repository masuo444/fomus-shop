import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { checkPartner } from '@/lib/auth'

// GET: List digital items for partner's shop
export async function GET() {
  const partner = await checkPartner()
  if (!partner) {
    return NextResponse.json({ error: '権限がありません' }, { status: 403 })
  }

  const supabase = await createClient()

  const { data: items, error } = await supabase
    .from('digital_items')
    .select('*')
    .eq('shop_id', partner.shopId)
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json(items)
}

// POST: Create digital item for partner's shop
export async function POST(request: NextRequest) {
  const partner = await checkPartner()
  if (!partner) {
    return NextResponse.json({ error: '権限がありません' }, { status: 403 })
  }

  const body = await request.json()
  const admin = createAdminClient()

  const { data, error } = await admin
    .from('digital_items')
    .insert({
      ...body,
      shop_id: partner.shopId, // Always use partner's shop
      issued_count: 0,
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json(data)
}
