import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getPlatformShopId } from '@/lib/shop'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'ログインが必要です' }, { status: 401 })
  }

  const body = await request.json()
  const { name, description, price, total_supply, item_category, image_url } = body

  // Validation
  if (!name || !price || !total_supply || !item_category) {
    return NextResponse.json({ error: '必須項目を入力してください' }, { status: 400 })
  }

  if (price < 100 || price > 1000000) {
    return NextResponse.json({ error: '価格は100円〜1,000,000円で設定してください' }, { status: 400 })
  }

  if (total_supply < 1 || total_supply > 10000) {
    return NextResponse.json({ error: '発行数は1〜10,000で設定してください' }, { status: 400 })
  }

  const validCategories = ['collectible', 'ticket', 'art', 'other']
  if (!validCategories.includes(item_category)) {
    return NextResponse.json({ error: '無効なカテゴリです' }, { status: 400 })
  }

  // Get platform shop ID
  const shopId = await getPlatformShopId()
  if (!shopId) {
    return NextResponse.json({ error: 'ショップが見つかりません' }, { status: 500 })
  }

  const admin = createAdminClient()

  const { data, error } = await admin
    .from('digital_items')
    .insert({
      shop_id: shopId,
      name: name.trim(),
      description: description?.trim() || null,
      price: Number(price),
      total_supply: Number(total_supply),
      issued_count: 0,
      royalty_percentage: 10,
      resale_enabled: true,
      is_published: false, // Requires admin approval
      item_category,
      image_url: image_url || null,
      created_by: user.id,
      metadata: {},
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: '出品に失敗しました' }, { status: 500 })
  }

  return NextResponse.json({ item: data })
}
