import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { stripe } from '@/lib/stripe'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { SHIPPING_FEE } from '@/lib/constants'
import siteConfig from '@/site.config'
import type { Product } from '@/lib/types'
import type { Currency } from '@/lib/currency'
import { requireString, validateEmail, sanitizeString, ValidationError } from '@/lib/validation'
import { rateLimit } from '@/lib/rate-limit'
import { checkOrderFraud } from '@/lib/fraud'

interface SelectedOption {
  choiceId: string
  label: string
  priceAdjustment: number
}

interface CheckoutItem {
  product_id: string
  quantity: number
  selected_options?: Record<string, SelectedOption>
}

interface ShippingInfo {
  name: string
  email: string
  phone: string
  postal_code: string
  address: string
}

export async function POST(request: Request) {
  const ip = request.headers.get('x-forwarded-for') || 'unknown'
  const { success } = rateLimit(`checkout:${ip}`, 5, 60000)
  if (!success) {
    return NextResponse.json({ error: 'リクエストが多すぎます。しばらく待ってから再試行してください。' }, { status: 429 })
  }

  try {
    const { items, shipping, currency: requestCurrency } = (await request.json()) as {
      items: CheckoutItem[]
      shipping: ShippingInfo
      currency?: Currency
    }

    // Determine currency from request body (sent by client from cookie)
    const currency: Currency = requestCurrency === 'eur' ? 'eur' : 'jpy'

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'カートが空です' }, { status: 400 })
    }

    // Validate shipping fields
    try {
      shipping.name = requireString(shipping.name, 'お名前').slice(0, 100)
      shipping.email = validateEmail(shipping.email)
      shipping.phone = requireString(shipping.phone, '電話番号').slice(0, 20)
      shipping.postal_code = requireString(shipping.postal_code, '郵便番号').slice(0, 10)
      shipping.address = requireString(shipping.address, '住所').slice(0, 500)
    } catch (err) {
      if (err instanceof ValidationError) {
        return NextResponse.json({ error: err.message }, { status: 400 })
      }
      throw err
    }

    const admin = createAdminClient()

    // Load products
    const productIds = items.map((i) => i.product_id)
    const { data: products } = await admin
      .from('products')
      .select('*')
      .in('id', productIds)
      .eq('is_published', true)

    if (!products || products.length !== items.length) {
      return NextResponse.json({ error: '一部の商品が見つかりません' }, { status: 400 })
    }

    // For EUR orders, verify all products have EUR prices
    if (currency === 'eur') {
      const missingEur = products.some((p: any) => p.price_eur == null)
      if (missingEur) {
        return NextResponse.json({ error: 'Some products are not available for international purchase' }, { status: 400 })
      }
    }

    // Determine shop from products
    const shopId = (products[0] as Product).shop_id
    const mixedShops = products.some((p: any) => p.shop_id !== shopId)
    if (mixedShops) {
      return NextResponse.json({ error: '異なるショップの商品を同時に購入することはできません' }, { status: 400 })
    }

    // Get shop info for invoice
    const { data: shop } = await admin
      .from('shops')
      .select('name, invoice_registration_number')
      .eq('id', shopId)
      .single()

    // Check stock
    for (const item of items) {
      const product = products.find((p) => p.id === item.product_id) as Product
      if (product.stock < item.quantity) {
        return NextResponse.json(
          { error: `${product.name} の在庫が不足しています` },
          { status: 400 }
        )
      }
    }

    // Get current user if logged in
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    // Load profile for premium member pricing
    let profile = null
    if (user) {
      const { data: profileData } = await admin
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
      profile = profileData
    }

    const isPremiumMember = profile?.is_premium_member === true

    // Helper: get unit price for a product based on currency and membership
    const getUnitPrice = (product: any): number => {
      if (currency === 'eur') {
        const eurMemberPrice = product.member_price_eur
        const eurPrice = product.price_eur
        if (isPremiumMember && eurMemberPrice != null && eurMemberPrice < eurPrice) {
          return eurMemberPrice
        }
        return eurPrice
      }
      if (isPremiumMember && product.member_price != null && product.member_price < product.price) {
        return product.member_price
      }
      return product.price
    }

    // Helper: get options price adjustment
    const getOptionsAdj = (item: CheckoutItem): number => {
      if (!item.selected_options) return 0
      return Object.values(item.selected_options).reduce((sum, opt) => sum + opt.priceAdjustment, 0)
    }

    // Helper: format options as text
    const formatOpts = (item: CheckoutItem): string | null => {
      if (!item.selected_options || Object.keys(item.selected_options).length === 0) return null
      return Object.entries(item.selected_options).map(([name, opt]) => `${name}: ${opt.label}`).join(' / ')
    }

    // Calculate totals
    const subtotal = items.reduce((sum, item) => {
      const product = products.find((p) => p.id === item.product_id)!
      return sum + (getUnitPrice(product) + getOptionsAdj(item)) * item.quantity
    }, 0)

    // Premium members get free shipping (JPY only; EUR always charges shipping)
    const shippingFee = currency === 'eur'
      ? siteConfig.shippingFeeEur
      : (isPremiumMember ? 0 : SHIPPING_FEE)
    const total = subtotal + shippingFee

    // Fraud check
    const fraudCheck = await checkOrderFraud(user?.id || null, shipping.email, ip, total)

    // Generate order number
    const orderNumber = `${siteConfig.orderPrefix}${Date.now().toString(36).toUpperCase()}`

    // Create pending order
    const { data: order, error: orderError } = await admin.from('orders').insert({
      order_number: orderNumber,
      shop_id: shopId,
      user_id: user?.id || null,
      email: shipping.email,
      status: 'pending',
      subtotal,
      shipping_fee: shippingFee,
      total,
      currency,
      shipping_name: shipping.name,
      shipping_postal_code: shipping.postal_code,
      shipping_address: shipping.address,
      shipping_phone: shipping.phone,
      points_used: 0,
      is_flagged: fraudCheck.flagged,
      fraud_reasons: fraudCheck.reasons,
    }).select().single()

    if (orderError || !order) {
      console.error('Order creation error:', orderError)
      return NextResponse.json({ error: '注文の作成に失敗しました' }, { status: 500 })
    }

    // Create order items
    const orderItems = items.map((item) => {
      const product = products.find((p) => p.id === item.product_id)!
      const optionsText = formatOpts(item)
      return {
        order_id: order.id,
        product_id: item.product_id,
        product_name: optionsText ? `${product.name}（${optionsText}）` : product.name,
        price: getUnitPrice(product) + getOptionsAdj(item),
        quantity: item.quantity,
        image_url: product.images?.[0] || null,
        options_text: optionsText,
      }
    })

    await admin.from('order_items').insert(orderItems)

    // Create Stripe Checkout session
    const shippingLabel = currency === 'eur' ? 'Shipping' : '送料'
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = items.map((item) => {
      const product = products.find((p) => p.id === item.product_id)!
      const optionsText = formatOpts(item)
      const name = optionsText ? `${product.name}（${optionsText}）` : product.name
      return {
        price_data: {
          currency,
          product_data: {
            name,
            images: product.images?.slice(0, 1) || [],
          },
          unit_amount: getUnitPrice(product) + getOptionsAdj(item),
        },
        quantity: item.quantity,
      }
    })

    // Add shipping as a line item (only if not free)
    if (shippingFee > 0) {
      lineItems.push({
        price_data: {
          currency,
          product_data: {
            name: shippingLabel,
            images: [],
          },
          unit_amount: shippingFee,
        },
        quantity: 1,
      })
    }

    const origin = request.headers.get('origin') || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

    // Invoice creation is only enabled when the shop has a registered invoice number
    const invoiceEnabled = !!shop?.invoice_registration_number

    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      mode: 'payment',
      line_items: lineItems,
      customer_email: shipping.email,
      metadata: {
        order_id: order.id,
        order_number: orderNumber,
        shop_id: shopId,
        currency,
      },
      success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}&email=${encodeURIComponent(shipping.email)}`,
      cancel_url: `${origin}/cart`,
    }

    if (invoiceEnabled) {
      sessionParams.invoice_creation = {
        enabled: true,
        invoice_data: {
          metadata: {
            order_id: order.id,
            order_number: orderNumber,
          },
          custom_fields: [
            { name: '注文番号', value: orderNumber },
            { name: '適格請求書発行事業者登録番号', value: shop!.invoice_registration_number! },
          ],
          footer: `${shop!.name || siteConfig.name} / 登録番号: ${shop!.invoice_registration_number}`,
        },
      }
    }

    const session = await stripe.checkout.sessions.create(sessionParams)

    // Store stripe session id on order
    await admin
      .from('orders')
      .update({ stripe_session_id: session.id })
      .eq('id', order.id)

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error('Checkout error:', error)
    return NextResponse.json({ error: '決済の作成に失敗しました' }, { status: 500 })
  }
}
