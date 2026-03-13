import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createClient } from '@/lib/supabase/server'
import { checkAdmin } from '@/lib/auth'
import { getPublishedShopIds } from '@/lib/shop'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await checkAdmin()
  if (!user) {
    return NextResponse.json({ error: '権限がありません' }, { status: 403 })
  }

  const { id } = await params
  const supabase = await createClient()

  const { data: order } = await supabase
    .from('orders')
    .select('stripe_invoice_id')
    .eq('id', id)
    .eq('shop_id', (await getPublishedShopIds())[0] ?? '')
    .single()

  if (!order?.stripe_invoice_id) {
    return NextResponse.json({ error: 'インボイスが見つかりません' }, { status: 404 })
  }

  try {
    const invoice = await stripe.invoices.retrieve(order.stripe_invoice_id)

    if (invoice.invoice_pdf) {
      return NextResponse.json({ url: invoice.invoice_pdf })
    }

    // If hosted_invoice_url is available, use that
    if (invoice.hosted_invoice_url) {
      return NextResponse.json({ url: invoice.hosted_invoice_url })
    }

    return NextResponse.json({ error: 'インボイスPDFが利用できません' }, { status: 404 })
  } catch (err) {
    console.error('Invoice retrieval error:', err)
    return NextResponse.json({ error: 'インボイスの取得に失敗しました' }, { status: 500 })
  }
}
