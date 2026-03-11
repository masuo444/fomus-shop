import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { checkShopAccess } from '@/lib/auth'

export async function GET() {
  const access = await checkShopAccess('admin')
  if (!access) {
    return NextResponse.json({ error: '権限がありません' }, { status: 403 })
  }

  const shopId = access.shopId
  const supabase = await createClient()

  const { data: customers, error } = await supabase
    .from('customers')
    .select('*')
    .eq('shop_id', shopId)
    .order('total_spent', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  const BOM = '\uFEFF'
  const headers = ['名前', 'メール', '注文回数', '合計購入額', '最終注文日']

  const rows = (customers ?? []).map((c) => [
    c.name || '',
    c.email,
    c.total_orders,
    c.total_spent,
    c.last_order_at ? new Date(c.last_order_at).toLocaleDateString('ja-JP') : '',
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
      'Content-Disposition': `attachment; filename="customers_${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  })
}
