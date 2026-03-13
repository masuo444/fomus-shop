import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { checkAdmin } from '@/lib/auth'
import { getPublishedShopIds } from '@/lib/shop'
import { SHIPPING_FEE } from '@/lib/constants'

export async function GET() {
  const user = await checkAdmin()
  if (!user) {
    return NextResponse.json({ error: '権限がありません' }, { status: 403 })
  }

  const publishedIds = await getPublishedShopIds()
  const shopId = publishedIds[0] ?? ''
  const supabase = await createClient()

  const { data: shop } = await supabase
    .from('shops')
    .select('id, name, description, logo_url, royalty_percentage, invoice_registration_number')
    .eq('id', shopId)
    .single()

  return NextResponse.json({
    shop,
    shipping_fee: SHIPPING_FEE,
  })
}

export async function PUT(request: NextRequest) {
  const user = await checkAdmin()
  if (!user) {
    return NextResponse.json({ error: '権限がありません' }, { status: 403 })
  }

  const publishedIds = await getPublishedShopIds()
  const shopId = publishedIds[0] ?? ''
  const body = await request.json()
  const admin = createAdminClient()

  // Validate invoice registration number format if provided
  let invoiceRegNumber = body.invoice_registration_number?.trim() || null
  if (invoiceRegNumber && !/^T\d{13}$/.test(invoiceRegNumber)) {
    return NextResponse.json({ error: '登録番号はT + 13桁の数字で入力してください（例: T1234567890123）' }, { status: 400 })
  }

  const { error } = await admin
    .from('shops')
    .update({
      name: body.name,
      description: body.description || null,
      logo_url: body.logo_url || null,
      royalty_percentage: body.royalty_percentage,
      invoice_registration_number: invoiceRegNumber,
    })
    .eq('id', shopId)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json({ success: true })
}
