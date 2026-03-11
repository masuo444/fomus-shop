import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { checkPartner } from '@/lib/auth'

// GET: List all orders for partner's shop
export async function GET() {
  const partner = await checkPartner()
  if (!partner) {
    return NextResponse.json({ error: '権限がありません' }, { status: 403 })
  }

  const supabase = await createClient()

  const { data: orders, error } = await supabase
    .from('orders')
    .select('*')
    .eq('shop_id', partner.shopId)
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json(orders)
}
