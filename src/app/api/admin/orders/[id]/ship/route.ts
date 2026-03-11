import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { checkShopAccess } from '@/lib/auth'
import { sendShippingNotification } from '@/lib/email'
import type { Order } from '@/lib/types'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const access = await checkShopAccess('admin')
  if (!access) {
    return NextResponse.json({ error: '権限がありません' }, { status: 403 })
  }

  const shopId = access.shopId
  const { id } = await params
  const body = await request.json()
  const { tracking_number, shipping_carrier } = body

  const admin = createAdminClient()

  const { data: order, error } = await admin
    .from('orders')
    .update({
      status: 'shipped',
      tracking_number: tracking_number || null,
      shipping_carrier: shipping_carrier || null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .eq('shop_id', shopId)
    .select()
    .single()

  if (error || !order) {
    return NextResponse.json({ error: error?.message || '注文が見つかりません' }, { status: 400 })
  }

  // Send shipping notification email
  await sendShippingNotification(order as Order)

  return NextResponse.json(order)
}
