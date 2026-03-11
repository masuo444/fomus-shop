import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { checkShopAccess } from '@/lib/auth'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const access = await checkShopAccess('admin')
  if (!access) {
    return NextResponse.json({ error: '権限がありません' }, { status: 403 })
  }

  const shopId = access.shopId
  const { id } = await params
  const supabase = await createClient()

  const [{ data: order }, { data: items }] = await Promise.all([
    supabase
      .from('orders')
      .select('*')
      .eq('id', id)
      .eq('shop_id', shopId)
      .single(),
    supabase
      .from('order_items')
      .select('*')
      .eq('order_id', id),
  ])

  if (!order) {
    return NextResponse.json({ error: '注文が見つかりません' }, { status: 404 })
  }

  return NextResponse.json({ order, items: items ?? [] })
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const access = await checkShopAccess('admin')
  if (!access) {
    return NextResponse.json({ error: '権限がありません' }, { status: 403 })
  }

  const { id } = await params
  const body = await request.json()
  const admin = createAdminClient()

  const updateData: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  }

  if (body.status) updateData.status = body.status
  if (body.tracking_number !== undefined) updateData.tracking_number = body.tracking_number
  if (body.shipping_carrier !== undefined) updateData.shipping_carrier = body.shipping_carrier

  const { data, error } = await admin
    .from('orders')
    .update(updateData)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json(data)
}
