import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { checkAdmin } from '@/lib/auth'
import { stripe } from '@/lib/stripe'

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await checkAdmin()
  if (!user) return NextResponse.json({ error: '権限がありません' }, { status: 403 })

  const { id } = await params
  const admin = createAdminClient()

  const { data: order, error: orderError } = await admin
    .from('orders')
    .select('id, status, stripe_payment_intent_id, total')
    .eq('id', id)
    .single()

  if (orderError || !order) {
    return NextResponse.json({ error: '注文が見つかりません' }, { status: 404 })
  }

  if (!['paid', 'processing', 'shipped'].includes(order.status)) {
    return NextResponse.json({ error: 'この注文は返金できません' }, { status: 400 })
  }

  if (!order.stripe_payment_intent_id) {
    return NextResponse.json({ error: 'Stripe決済情報がありません' }, { status: 400 })
  }

  try {
    const refund = await stripe.refunds.create({
      payment_intent: order.stripe_payment_intent_id,
    })

    if (refund.status === 'failed') {
      return NextResponse.json({ error: '返金に失敗しました' }, { status: 500 })
    }

    if (refund.status === 'pending') {
      // Store refund ID even for pending refunds so we can track it
      await admin
        .from('orders')
        .update({ stripe_refund_id: refund.id, updated_at: new Date().toISOString() })
        .eq('id', id)

      return NextResponse.json({
        success: true,
        message: '返金処理中です。完了までお待ちください。',
        refund_status: 'pending',
      })
    }

    // refund.status === 'succeeded'
    const { error: updateError } = await admin
      .from('orders')
      .update({
        status: 'refunded',
        stripe_refund_id: refund.id,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)

    if (updateError) {
      return NextResponse.json({ error: '注文ステータスの更新に失敗しました' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : '返金処理に失敗しました'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
