import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'ログインが必要です' }, { status: 401 })
  }

  const { id } = await params

  // Only allow access to own orders
  const { data: order } = await supabase
    .from('orders')
    .select('stripe_invoice_id, user_id')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!order?.stripe_invoice_id) {
    return NextResponse.json({ error: 'インボイスが見つかりません' }, { status: 404 })
  }

  try {
    const invoice = await stripe.invoices.retrieve(order.stripe_invoice_id)

    if (invoice.invoice_pdf) {
      return NextResponse.json({ url: invoice.invoice_pdf })
    }

    if (invoice.hosted_invoice_url) {
      return NextResponse.json({ url: invoice.hosted_invoice_url })
    }

    return NextResponse.json({ error: 'インボイスPDFが利用できません' }, { status: 404 })
  } catch (err) {
    console.error('Invoice retrieval error:', err)
    return NextResponse.json({ error: 'インボイスの取得に失敗しました' }, { status: 500 })
  }
}
