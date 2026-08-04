import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendOrderConfirmation, sendOrderNotificationToAdmin } from '@/lib/email'
import { notifyGuildSalesCredit } from '@/lib/guild-sales'
import type { Order, OrderItem } from '@/lib/types'
import Stripe from 'stripe'

export async function POST(request: Request) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const admin = createAdminClient()

  // Idempotency check - skip already-processed events
  const eventId = event.id
  const { data: existing } = await admin
    .from('processed_webhook_events')
    .select('event_id')
    .eq('event_id', eventId)
    .single()

  if (existing) {
    return NextResponse.json({ received: true, duplicate: true })
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      const metadata = session.metadata || {}
      const type = metadata.type

      // Handle standard order purchases
      const orderId = metadata.order_id
      if (orderId) {
        // Update order status to paid
        const orderUpdate: Record<string, unknown> = {
          status: 'paid',
          stripe_payment_intent_id: session.payment_intent as string,
        }

        // Retrieve invoice info if invoice was created
        try {
          if (session.invoice) {
            const invoiceId = typeof session.invoice === 'string' ? session.invoice : session.invoice.id
            const invoice = await stripe.invoices.retrieve(invoiceId as string)
            orderUpdate.stripe_invoice_id = invoice.id
            orderUpdate.invoice_number = invoice.number
          }
        } catch (invoiceError) {
          console.error('Invoice retrieval failed for order:', orderId, invoiceError)
        }

        await admin
          .from('orders')
          .update(orderUpdate)
          .eq('id', orderId)
          .eq('status', 'pending')

        // Stock already decremented at checkout time (pre-reservation)

        // Send email notifications
        const { data: orderData } = await admin
          .from('orders')
          .select('*')
          .eq('id', orderId)
          .single()

        if (orderData) {
          const { data: orderItemsData } = await admin
            .from('order_items')
            .select('*')
            .eq('order_id', orderId)

          // Send email notifications
          try {
            await sendOrderConfirmation(
              orderData as Order,
              (orderItemsData ?? []) as OrderItem[]
            )
            await sendOrderNotificationToAdmin(
              orderData as Order,
              (orderItemsData ?? []) as OrderItem[]
            )
          } catch (emailError) {
            console.error('Email sending failed for order:', orderId, emailError)
          }

          // Calculate and record commission for partner shops
          try {
            const shopId = metadata.shop_id || orderData.shop_id
            if (shopId) {
              const { data: shop } = await admin
                .from('shops')
                .select('commission_rate')
                .eq('id', shopId)
                .single()

              if (shop && Number(shop.commission_rate) > 0) {
                const commissionRate = Math.min(Math.max(Number(shop.commission_rate), 0), 100)
                const orderTotal = orderData.total
                const commissionAmount = Math.round(orderTotal * commissionRate / 100)
                const partnerAmount = orderTotal - commissionAmount

                if (commissionAmount >= 0 && partnerAmount >= 0) {
                  await admin.from('commissions').insert({
                    order_id: orderId,
                    shop_id: shopId,
                    order_total: orderTotal,
                    commission_rate: commissionRate,
                    commission_amount: commissionAmount,
                    partner_amount: partnerAmount,
                    status: 'pending',
                  })
                }
              }
            }
          } catch (commissionError) {
            console.error('Commission calculation failed:', commissionError)
            // Don't fail the webhook - order is already processed
          }

          // FOMUS GUILD 会員の紹介コードによる売上ポイント還元
          if (orderData.referral_code) {
            try {
              await notifyGuildSalesCredit({
                id: orderData.id,
                referral_code: orderData.referral_code,
                subtotal: orderData.subtotal,
                coupon_discount: orderData.coupon_discount,
                currency: orderData.currency,
                email: orderData.email,
              })
              await admin.from('orders').update({ referral_credited: true }).eq('id', orderId)
            } catch (referralError) {
              console.error('GUILD referral credit failed:', referralError)
              // Don't fail the webhook - order is already processed
            }
          }
        }
      }

      // Handle digital item purchases
      if (type === 'digital_purchase') {
        const digitalItemId = metadata.digital_item_id
        const userId = metadata.user_id
        const price = metadata.price || '0'

        if (digitalItemId && userId) {
          // Atomically issue token (locks digital_items row to prevent duplicate token numbers)
          const { data: tokenResult, error: tokenError } = await admin.rpc('issue_digital_token', {
            p_digital_item_id: digitalItemId,
            p_user_id: userId,
            p_price: parseInt(price)
          })

          if (tokenError) {
            console.error('Token issue error:', tokenError)
            return NextResponse.json({ error: 'Token creation failed' }, { status: 500 })
          }
        }
      }

      // Legacy handling for digital purchases without type metadata
      if (!type && !orderId) {
        const digitalTokenId = metadata.digital_token_id
        if (digitalTokenId) {
          await admin
            .from('digital_tokens')
            .update({ status: 'owned' })
            .eq('id', digitalTokenId)
        }

      }

      break
    }

    case 'checkout.session.expired': {
      const session = event.data.object as Stripe.Checkout.Session
      const orderId = session.metadata?.order_id
      if (orderId) {
        // Restore pre-reserved stock
        const { data: orderItems } = await admin
          .from('order_items')
          .select('product_id, quantity')
          .eq('order_id', orderId)
        if (orderItems) {
          for (const item of orderItems) {
            const { error: stockErr } = await admin.rpc('increment_stock', {
              p_product_id: item.product_id,
              p_quantity: item.quantity,
            })
            if (stockErr) console.error(`Stock restore failed for ${item.product_id}:`, stockErr)
          }
        }

        await admin
          .from('orders')
          .update({ status: 'cancelled' })
          .eq('id', orderId)
          .eq('status', 'pending')
      }
      break
    }

    case 'payment_intent.payment_failed': {
      const paymentIntent = event.data.object as Stripe.PaymentIntent
      console.error('Payment failed:', paymentIntent.id)
      break
    }
  }

  // Record event as processed for idempotency
  await admin
    .from('processed_webhook_events')
    .insert({ event_id: eventId })

  return NextResponse.json({ received: true })
}
