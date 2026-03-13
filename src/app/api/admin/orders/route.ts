import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { checkAdmin } from '@/lib/auth'
import { getPublishedShopIds } from '@/lib/shop'

export async function GET() {
  const user = await checkAdmin()
  if (!user) {
    return NextResponse.json({ error: '権限がありません' }, { status: 403 })
  }

  const publishedIds = await getPublishedShopIds()
  const shopId = publishedIds[0] ?? ''
  const supabase = await createClient()

  const { data: orders, error } = await supabase
    .from('orders')
    .select('*')
    .eq('shop_id', shopId)
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json(orders)
}
