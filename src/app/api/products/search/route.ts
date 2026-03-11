import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getPublishedShopIds } from '@/lib/shop'

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get('q')

  if (!q || q.trim().length === 0) {
    return NextResponse.json([])
  }

  const shopIds = await getPublishedShopIds()

  if (shopIds.length === 0) {
    return NextResponse.json([])
  }

  const admin = createAdminClient()
  const searchTerm = `%${q.trim()}%`

  const { data: products } = await admin
    .from('products')
    .select('id, name, price, images')
    .in('shop_id', shopIds)
    .eq('is_published', true)
    .or(`name.ilike.${searchTerm},description.ilike.${searchTerm}`)
    .order('created_at', { ascending: false })
    .limit(10)

  return NextResponse.json(products || [])
}
