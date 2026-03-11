import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { checkShopAccess } from '@/lib/auth'

export async function GET(request: NextRequest) {
  const access = await checkShopAccess('admin')
  if (!access) {
    return NextResponse.json({ error: '権限がありません' }, { status: 403 })
  }

  const shopId = access.shopId
  const supabase = await createClient()

  const { searchParams } = new URL(request.url)
  const from = searchParams.get('from')
  const to = searchParams.get('to')

  const paidStatuses = ['paid', 'processing', 'shipped', 'delivered']

  let query = supabase
    .from('orders')
    .select('total, created_at')
    .eq('shop_id', shopId)
    .in('status', paidStatuses)
    .order('created_at', { ascending: true })

  if (from) query = query.gte('created_at', from)
  if (to) query = query.lte('created_at', to + 'T23:59:59.999Z')

  const { data: orders, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  // Aggregate by date
  const dailyMap = new Map<string, { count: number; total: number }>()
  for (const order of orders ?? []) {
    const date = new Date(order.created_at).toLocaleDateString('ja-JP')
    const existing = dailyMap.get(date) || { count: 0, total: 0 }
    existing.count += 1
    existing.total += order.total
    dailyMap.set(date, existing)
  }

  const BOM = '\uFEFF'
  const headers = ['日付', '注文数', '売上合計']

  const rows = Array.from(dailyMap.entries()).map(([date, data]) => [
    date,
    data.count,
    data.total,
  ])

  const csvContent = BOM + [
    headers.join(','),
    ...rows.map((row) =>
      row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')
    ),
  ].join('\n')

  return new NextResponse(csvContent, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="sales_${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  })
}
