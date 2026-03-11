import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendOrderConfirmation, sendOrderNotificationToAdmin } from '@/lib/email'
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

        // Decrease stock for ordered items
        try {
          const { data: orderItems } = await admin
            .from('order_items')
            .select('product_id, quantity')
            .eq('order_id', orderId)

          if (orderItems) {
            for (const item of orderItems) {
              await admin.rpc('decrement_stock', {
                p_product_id: item.product_id,
                p_quantity: item.quantity,
              })
            }
          }
        } catch (stockError) {
          console.error('Stock decrement failed for order:', orderId, stockError)
        }

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
        }
      }

      // Handle digital item purchases
      if (type === 'digital_purchase') {
        const digitalItemId = metadata.digital_item_id
        const userId = metadata.user_id
        const tokenNumber = parseInt(metadata.token_number || '0')
        const price = parseInt(metadata.price || '0')

        if (digitalItemId && userId && tokenNumber > 0) {
          // Re-check supply to prevent overselling
          const { data: item } = await admin
            .from('digital_items')
            .select('issued_count, total_supply')
            .eq('id', digitalItemId)
            .single()

          if (item && item.issued_count < item.total_supply) {
            // Create the digital token
            const { data: token } = await admin
              .from('digital_tokens')
              .insert({
                digital_item_id: digitalItemId,
                token_number: item.issued_count + 1,
                current_owner_id: userId,
                original_price: price,
                status: 'owned',
              })
              .select()
              .single()

            if (token) {
              // Increment issued_count
              await admin
                .from('digital_items')
                .update({ issued_count: item.issued_count + 1 })
                .eq('id', digitalItemId)

              // Record ownership transfer
              await admin.from('ownership_transfers').insert({
                digital_token_id: token.id,
                from_user_id: null,
                to_user_id: userId,
                price,
                royalty_amount: 0,
                seller_amount: price,
                transfer_type: 'purchase',
                stripe_payment_intent_id: session.payment_intent as string,
              })
            }
          }
        }
      }

      // Handle digital resale purchases
      // All money goes to FOMUS. Seller receives points equivalent to their share.
      if (type === 'digital_resale') {
        const resaleListingId = metadata.resale_listing_id
        const digitalTokenId = metadata.digital_token_id
        const buyerId = metadata.buyer_id
        const sellerId = metadata.seller_id
        const price = parseInt(metadata.price || '0')
        const royaltyAmount = parseInt(metadata.royalty_amount || '0')
        const sellerAmount = parseInt(metadata.seller_amount || '0')

        if (resaleListingId && digitalTokenId && buyerId && sellerId) {
          // Transfer token ownership to buyer
          await admin
            .from('digital_tokens')
            .update({
              current_owner_id: buyerId,
              status: 'owned',
            })
            .eq('id', digitalTokenId)

          // Update listing status to sold
          await admin
            .from('resale_listings')
            .update({ status: 'sold' })
            .eq('id', resaleListingId)

          // Record ownership transfer
          await admin.from('ownership_transfers').insert({
            digital_token_id: digitalTokenId,
            from_user_id: sellerId,
            to_user_id: buyerId,
            price,
            royalty_amount: royaltyAmount,
            seller_amount: sellerAmount,
            transfer_type: 'resale',
            stripe_payment_intent_id: session.payment_intent as string,
          })

          // Award points to seller (seller_amount converted to points)
          if (sellerAmount > 0) {
            try {
              // Get item name for description
              const { data: tokenData } = await admin
                .from('digital_tokens')
                .select('token_number, digital_item:digital_items(name)')
                .eq('id', digitalTokenId)
                .single()

              const itemName = (tokenData?.digital_item as any)?.name || 'デジタルアイテム'
              const tokenNum = tokenData?.token_number || 0

              // Increment seller's points
              const { data: sellerProfile } = await admin
                .from('profiles')
                .select('points')
                .eq('id', sellerId)
                .single()
              if (sellerProfile) {
                await admin
                  .from('profiles')
                  .update({ points: sellerProfile.points + sellerAmount })
                  .eq('id', sellerId)
              }

              // Record point transaction
              await admin.from('point_transactions').insert({
                user_id: sellerId,
                amount: sellerAmount,
                type: 'resale',
                description: `リセール収益: ${itemName} #${tokenNum}（${sellerAmount}pt）`,
              })
            } catch (pointsError) {
              console.error('Resale points award failed:', pointsError)
              // Don't fail the webhook
            }
          }
        }
      }

      // Handle crowdfunding support payments
      if (type === 'crowdfunding') {
        const projectId = metadata.project_id
        const tierId = metadata.tier_id
        const backerId = metadata.backer_id
        const amount = parseInt(metadata.amount || '0')

        if (projectId && tierId && backerId) {
          // Update backer status to paid
          await admin
            .from('crowdfunding_backers')
            .update({
              status: 'paid',
              stripe_payment_intent_id: session.payment_intent as string,
            })
            .eq('id', backerId)

          // Atomically increment project amount and tier backers (prevents race conditions)
          await admin.rpc('increment_crowdfunding_amount', {
            p_project_id: projectId,
            p_tier_id: tierId,
            p_amount: amount,
          })
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

        const resaleListingId = metadata.resale_listing_id
        if (resaleListingId) {
          await admin
            .from('resale_listings')
            .update({ status: 'sold' })
            .eq('id', resaleListingId)
        }
      }

      break
    }

    case 'checkout.session.expired': {
      // Handle expired sessions - clean up any pending tokens if applicable
      const session = event.data.object as Stripe.Checkout.Session
      const metadata = session.metadata || {}

      // For digital purchases that expired, no cleanup needed
      // since we create tokens only after successful payment
      console.log('Checkout session expired:', session.id, metadata.type)
      break
    }

    case 'payment_intent.payment_failed': {
      const paymentIntent = event.data.object as Stripe.PaymentIntent
      console.error('Payment failed:', paymentIntent.id)
      break
    }
  }

  return NextResponse.json({ received: true })
}
