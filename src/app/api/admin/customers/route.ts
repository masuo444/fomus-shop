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

  return NextResponse.json(customers)
}
