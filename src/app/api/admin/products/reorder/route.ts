import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { checkAdmin } from '@/lib/auth'

// POST: Bulk update sort_order for products
export async function POST(request: NextRequest) {
  const user = await checkAdmin()
  if (!user) {
    return NextResponse.json({ error: '権限がありません' }, { status: 403 })
  }

  const { items } = await request.json()

  if (!items || !Array.isArray(items)) {
    return NextResponse.json({ error: '並び替えデータが不正です' }, { status: 400 })
  }

  const admin = createAdminClient()

  for (const item of items) {
    await admin
      .from('products')
      .update({ sort_order: item.sort_order, updated_at: new Date().toISOString() })
      .eq('id', item.id)
  }

  return NextResponse.json({ success: true })
}
