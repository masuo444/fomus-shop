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

  const { action, product_ids } = await request.json()

  if (!action || !product_ids || !Array.isArray(product_ids) || product_ids.length === 0) {
    return NextResponse.json({ error: '操作と対象商品を指定してください' }, { status: 400 })
  }

  const admin = createAdminClient()

  switch (action) {
    case 'publish': {
      const { error } = await admin
        .from('products')
        .update({ is_published: true, updated_at: new Date().toISOString() })
        .in('id', product_ids)
      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      break
    }
    case 'unpublish': {
      const { error } = await admin
        .from('products')
        .update({ is_published: false, updated_at: new Date().toISOString() })
        .in('id', product_ids)
      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      break
    }
    case 'delete': {
      const { error } = await admin
        .from('products')
        .delete()
        .in('id', product_ids)
      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      break
    }
    default:
      return NextResponse.json({ error: '無効な操作です' }, { status: 400 })
  }

  return NextResponse.json({ success: true, count: product_ids.length })
}
