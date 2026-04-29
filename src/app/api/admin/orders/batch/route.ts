import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { checkAdmin } from '@/lib/auth'

export async function POST(request: NextRequest) {
  const user = await checkAdmin()
  if (!user) return NextResponse.json({ error: '権限がありません' }, { status: 403 })

  const { action, order_ids } = await request.json()

  if (!action || !order_ids || !Array.isArray(order_ids) || order_ids.length === 0) {
    return NextResponse.json({ error: '操作と対象注文を指定してください' }, { status: 400 })
  }

  const admin = createAdminClient()
  const validActions = ['processing', 'shipped', 'cancelled']

  if (!validActions.includes(action)) {
    return NextResponse.json({ error: '無効な操作です' }, { status: 400 })
  }

  const { error } = await admin
    .from('orders')
    .update({ status: action, updated_at: new Date().toISOString() })
    .in('id', order_ids)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true, count: order_ids.length })
}
