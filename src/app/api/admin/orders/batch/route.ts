import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { ADMIN_EMAILS } from '@/lib/constants'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const isAdmin = profile?.role === 'admin' || ADMIN_EMAILS.includes(user.email ?? '')
  if (!isAdmin) {
    return NextResponse.json({ error: '権限がありません' }, { status: 403 })
  }

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
