import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendOrderConfirmation, sendOrderNotificationToAdmin, sendPaymentReminder } from '@/lib/email'
import type { Order, OrderItem } from '@/lib/types'

// Safety net for Stripe webhook failures (e.g. STRIPE_WEBHOOK_SECRET mismatch).
// If the webhook ever stops firing, orders stay 'pending' even though Stripe took
// the money — and no admin notification is sent. This cron reconciles directly
// against Stripe so paid orders self-heal and notifications fire regardless.
export async function GET(request: Request) {
  // Accept both the existing external-scheduler header (x-cron-secret) and the
  // header Vercel's native Cron Jobs send (Authorization: Bearer <CRON_SECRET>).
  const secret = process.env.CRON_SECRET
  const headerSecret = request.headers.get('x-cron-secret')
  const authHeader = request.headers.get('authorization')
  const authorized =
    !!secret && (headerSecret === secret || authHeader === `Bearer ${secret}`)
  if (!authorized) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const admin = createAdminClient()
  const recovered: string[] = []
  const reminded: string[] = []
  const errors: { order_number: string; error: string }[] = []

  try {
    // Only check recent pending Stripe orders (bounds the number of Stripe calls).
    // Older unpaid sessions have already expired and been cancelled by the webhook.
    const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

    const { data: pendingOrders } = await admin
      .from('orders')
      .select('*')
      .eq('status', 'pending')
      .eq('payment_method', 'stripe')
      .not('stripe_session_id', 'is', null)
      .gte('created_at', since)

    if (!pendingOrders || pendingOrders.length === 0) {
      return NextResponse.json({ message: '対象なし', checked: 0, recovered: [] })
    }

    for (const order of pendingOrders as Order[]) {
      try {
        const session = await stripe.checkout.sessions.retrieve(order.stripe_session_id!)

        // Abandoned cart: session still open but unpaid for 3+ hours → remind once.
        // Dedup marker lives in processed_webhook_events (no schema change needed);
        // the synthetic id can never collide with Stripe's evt_* ids.
        if (session.payment_status !== 'paid') {
          const ageMs = Date.now() - new Date(order.created_at).getTime()
          if (session.status === 'open' && session.url && ageMs > 3 * 60 * 60 * 1000) {
            const reminderKey = `payment-reminder:${order.id}`
            const { error: dedupError } = await admin
              .from('processed_webhook_events')
              .insert({ event_id: reminderKey })

            // Insert fails on duplicate key → reminder already sent, skip.
            if (!dedupError) {
              const { data: orderItemsData } = await admin
                .from('order_items')
                .select('*')
                .eq('order_id', order.id)
              await sendPaymentReminder(order, (orderItemsData ?? []) as OrderItem[], session.url)
              reminded.push(order.order_number)
            }
          }
          continue
        }

        // Mirror the webhook's paid-order handling. The .eq('status','pending')
        // guard makes this idempotent: if the webhook wins the race, this no-ops.
        const { data: updated } = await admin
          .from('orders')
          .update({
            status: 'paid',
            stripe_payment_intent_id: session.payment_intent as string,
          })
          .eq('id', order.id)
          .eq('status', 'pending')
          .select('*')

        // Another process already flipped it to paid — skip notifications.
        if (!updated || updated.length === 0) continue

        const paidOrder = updated[0] as Order
        const { data: orderItemsData } = await admin
          .from('order_items')
          .select('*')
          .eq('order_id', order.id)

        // Bell notification fires automatically via the notify_new_order DB trigger
        // on the paid transition. Here we cover the emails the webhook would send.
        try {
          await sendOrderConfirmation(paidOrder, (orderItemsData ?? []) as OrderItem[])
          await sendOrderNotificationToAdmin(paidOrder, (orderItemsData ?? []) as OrderItem[])
        } catch (emailError) {
          console.error('Reconcile email failed for order:', order.order_number, emailError)
        }

        recovered.push(order.order_number)
      } catch (orderError) {
        console.error('Reconcile failed for order:', order.order_number, orderError)
        errors.push({
          order_number: order.order_number,
          error: orderError instanceof Error ? orderError.message : String(orderError),
        })
      }
    }

    return NextResponse.json({
      message: '照合完了',
      checked: pendingOrders.length,
      recovered,
      reminded,
      errors,
    })
  } catch (error) {
    console.error('Reconcile cron error:', error)
    return NextResponse.json({ error: 'エラーが発生しました' }, { status: 500 })
  }
}
