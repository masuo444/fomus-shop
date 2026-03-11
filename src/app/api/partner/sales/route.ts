import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { checkPartner } from '@/lib/auth'

// GET: Get commissions/sales data for partner's shop
export async function GET() {
  const partner = await checkPartner()
  if (!partner) {
    return NextResponse.json({ error: '権限がありません' }, { status: 403 })
  }

  const supabase = await createClient()

  // Get shop details for commission rate
  const { data: shop } = await supabase
    .from('shops')
    .select('commission_rate')
    .eq('id', partner.shopId)
    .single()

  const commissionRate = shop?.commission_rate ?? 0

  // Get all completed orders for the shop
  const { data: orders, error } = await supabase
    .from('orders')
    .select('id, total, status, created_at')
    .eq('shop_id', partner.shopId)
    .in('status', ['paid', 'processing', 'shipped', 'delivered'])
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  // Calculate summary
  const totalSales = (orders ?? []).reduce((sum, o) => sum + (o.total ?? 0), 0)
  const totalCommission = Math.floor(totalSales * (commissionRate / 100))
  const netRevenue = totalSales - totalCommission

  return NextResponse.json({
    commission_rate: commissionRate,
    total_sales: totalSales,
    total_commission: totalCommission,
    net_revenue: netRevenue,
    order_count: (orders ?? []).length,
    orders: orders ?? [],
  })
}
