import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { checkAdmin } from '@/lib/auth'
import { getPublishedShopIds } from '@/lib/shop'
import { ORDER_STATUS_LABELS } from '@/lib/types'

export async function GET(request: NextRequest) {
  const user = await checkAdmin()
  if (!user) {
    return NextResponse.json({ error: '権限がありません' }, { status: 403 })
  }

  const publishedIds = await getPublishedShopIds()
  const shopId = publishedIds[0] ?? ''
  const supabase = await createClient()

  const { searchParams } = new URL(request.url)
  const from = searchParams.get('from')
  const to = searchParams.get('to')
  const status = searchParams.get('status')

  let query = supabase
    .from('orders')
    .select('*')
    .eq('shop_id', shopId)
    .order('created_at', { ascending: false })

  if (from) query = query.gte('created_at', from)
  if (to) query = query.lte('created_at', to + 'T23:59:59.999Z')
  if (status) query = query.eq('status', status)

  const { data: orders, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  const BOM = '\uFEFF'
  const headers = ['注文番号', '注文日', '顧客名', 'メール', '合計', 'ステータス', '配送先', '追跡番号']

  const rows = (orders ?? []).map((o) => [
    o.order_number,
    new Date(o.created_at).toLocaleString('ja-JP'),
    o.shipping_name,
    o.email,
    o.total,
    ORDER_STATUS_LABELS[o.status as keyof typeof ORDER_STATUS_LABELS] || o.status,
    `〒${o.shipping_postal_code} ${o.shipping_address}`,
    o.tracking_number || '',
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
      'Content-Disposition': `attachment; filename="orders_${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  })
}
