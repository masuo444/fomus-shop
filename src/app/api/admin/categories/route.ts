import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { checkAdmin } from '@/lib/auth'
import { getPublishedShopIds } from '@/lib/shop'

export async function POST(request: NextRequest) {
  const user = await checkAdmin()
  if (!user) {
    return NextResponse.json({ error: '権限がありません' }, { status: 403 })
  }
  const publishedIds = await getPublishedShopIds()
  const shopId = publishedIds[0] ?? ''

  const body = await request.json()
  const { name, slug } = body

  if (!name) {
    return NextResponse.json({ error: '必須項目が不足しています' }, { status: 400 })
  }

  const admin = createAdminClient()

  // Get max sort_order
  const { data: existing } = await admin
    .from('categories')
    .select('sort_order')
    .eq('shop_id', shopId)
    .order('sort_order', { ascending: false })
    .limit(1)

  const nextSortOrder = existing && existing.length > 0 ? existing[0].sort_order + 1 : 0

  const { data, error } = await admin
    .from('categories')
    .insert({
      shop_id: shopId,
      name,
      slug: slug || name.toLowerCase().replace(/\s+/g, '-'),
      sort_order: nextSortOrder,
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json(data)
}
