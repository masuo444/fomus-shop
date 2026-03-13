import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { SHIPPING_FEE } from '@/lib/constants'
import siteConfig from '@/site.config'
import type { Product } from '@/lib/types'
import { requireString, validateEmail, ValidationError } from '@/lib/validation'
import { rateLimit } from '@/lib/rate-limit'
import { validateItemQuantities, verifyOptionPrices, verifyCouponDiscount, reserveStock, restoreStock } from '@/lib/checkout-validation'

interface CheckoutItem {
  product_id: string
  quantity: number
  selected_options?: Record<string, { choiceId: string; label: string; priceAdjustment: number }>
}

interface ShippingInfo {
  name: string
  email: string
  phone: string
  postal_code: string
  address: string
}

function generateOrderNumber() {
  const prefix = siteConfig.orderPrefix
  const timestamp = Date.now().toString(36).toUpperCase()
  const random = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `${prefix}${timestamp}${random}`
}

export async function POST(request: Request) {
  const ip = request.headers.get('x-forwarded-for') || 'unknown'
  const { success } = rateLimit(`bank-transfer:${ip}`, 5, 60000)
  if (!success) {
    return NextResponse.json({ error: 'リクエストが多すぎます。しばらく待ってから再試行してください。' }, { status: 429 })
  }

  if (!siteConfig.bankTransfer.enabled) {
    return NextResponse.json({ error: '銀行振込は現在利用できません' }, { status: 400 })
  }

  try {
    const { items, shipping, coupon_code, gift_wrapping, gift_message } = (await request.json()) as {
      items: CheckoutItem[]
      shipping: ShippingInfo
      coupon_code?: string
      gift_wrapping?: boolean
      gift_message?: string
    }

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'カートが空です' }, { status: 400 })
    }

    // P0 Fix: Validate quantities
    try {
      validateItemQuantities(items)
    } catch (err) {
      if (err instanceof ValidationError) return NextResponse.json({ error: err.message }, { status: 400 })
      throw err
    }

    // Validate shipping
    try {
      shipping.name = requireString(shipping.name, 'お名前').slice(0, 100)
      shipping.email = validateEmail(shipping.email)
      shipping.phone = requireString(shipping.phone, '電話番号').slice(0, 20)
      shipping.postal_code = requireString(shipping.postal_code, '郵便番号').slice(0, 10)
      shipping.address = requireString(shipping.address, '住所').slice(0, 500)
    } catch (err) {
      if (err instanceof ValidationError) return NextResponse.json({ error: err.message }, { status: 400 })
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

    // Bank transfer is JPY only
    const shopId = (products[0] as Product).shop_id
    const mixedShops = products.some((p: any) => p.shop_id !== shopId)
    if (mixedShops) {
      return NextResponse.json({ error: '異なるショップの商品を同時に購入することはできません' }, { status: 400 })
    }

    // Check stock
    for (const item of items) {
      const product = products.find((p) => p.id === item.product_id) as Product
      if (product.stock < item.quantity) {
        return NextResponse.json({ error: `${product.name} の在庫が不足しています` }, { status: 400 })
      }
    }

    // P0 Fix: Verify option prices from DB
    let optionAdjustments: Map<string, number>
    try {
      optionAdjustments = await verifyOptionPrices(items, productIds)
    } catch (err) {
      if (err instanceof ValidationError) return NextResponse.json({ error: err.message }, { status: 400 })
      throw err
    }

    // Get current user
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

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

    const getUnitPrice = (product: any): number => {
      if (isPremiumMember && product.member_price != null && product.member_price < product.price) return product.member_price
      return product.price
    }

    const getOptionsAdj = (item: CheckoutItem, index: number): number => {
      return optionAdjustments.get(`${item.product_id}:${index}`) ?? 0
    }

    const formatOpts = (item: CheckoutItem): string | null => {
      if (!item.selected_options || Object.keys(item.selected_options).length === 0) return null
      return Object.entries(item.selected_options).map(([name, opt]) => `${name}: ${opt.label}`).join(' / ')
    }

    const subtotal = items.reduce((sum, item, i) => {
      const product = products.find((p) => p.id === item.product_id)!
      return sum + (getUnitPrice(product) + getOptionsAdj(item, i)) * item.quantity
    }, 0)

    const shippingFee = isPremiumMember ? 0 : SHIPPING_FEE

    // P0 Fix: Verify coupon on server side
    let couponDiscount = 0
    let couponId: string | null = null
    try {
      const couponResult = await verifyCouponDiscount(coupon_code, shopId, subtotal)
      couponDiscount = couponResult.discount
      couponId = couponResult.couponId
    } catch (err) {
      if (err instanceof ValidationError) return NextResponse.json({ error: err.message }, { status: 400 })
      throw err
    }

    const total = subtotal + shippingFee - couponDiscount

    if (total <= 0) {
      return NextResponse.json({ error: '合計金額が不正です' }, { status: 400 })
    }

    // P0 Fix: Reserve stock atomically
    const stockItems = items.map((item) => {
      const product = products.find((p) => p.id === item.product_id)!
      return { product_id: item.product_id, quantity: item.quantity, product_name: product.name }
    })
    const stockResult = await reserveStock(stockItems)
    if (!stockResult.success) {
      return NextResponse.json({ error: `${stockResult.failedProduct} の在庫が不足しています` }, { status: 400 })
    }

    const orderNumber = generateOrderNumber()

    // Create order
    const { data: order, error: orderError } = await admin.from('orders').insert({
      order_number: orderNumber,
      shop_id: shopId,
      user_id: user?.id || null,
      email: shipping.email,
      status: 'awaiting_payment',
      payment_method: 'bank_transfer',
      subtotal,
      shipping_fee: shippingFee,
      total,
      currency: 'jpy',
      shipping_name: shipping.name,
      shipping_postal_code: shipping.postal_code,
      shipping_address: shipping.address,
      shipping_phone: shipping.phone,
      points_used: 0,
      coupon_id: couponId,
      coupon_discount: couponDiscount,
      gift_wrapping: gift_wrapping || false,
      gift_message: gift_message || null,
    }).select().single()

    if (orderError || !order) {
      await restoreStock(stockItems)
      console.error('Bank transfer order creation error:', orderError)
      return NextResponse.json({ error: '注文の作成に失敗しました' }, { status: 500 })
    }

    // Increment coupon usage
    if (couponId) {
      const { error: couponErr } = await admin.rpc('increment_coupon_usage', { p_coupon_id: couponId })
      if (couponErr) console.error('Coupon usage increment failed:', couponErr)
    }

    // Create order items
    const orderItems = items.map((item, i) => {
      const product = products.find((p) => p.id === item.product_id)!
      const optionsText = formatOpts(item)
      return {
        order_id: order.id,
        product_id: item.product_id,
        product_name: optionsText ? `${product.name}（${optionsText}）` : product.name,
        price: getUnitPrice(product) + getOptionsAdj(item, i),
        quantity: item.quantity,
        image_url: product.images?.[0] || null,
        options_text: optionsText,
      }
    })

    await admin.from('order_items').insert(orderItems)

    return NextResponse.json({
      order_id: order.id,
      order_number: orderNumber,
      total,
      bank_info: siteConfig.bankTransfer,
    })
  } catch (error) {
    console.error('Bank transfer checkout error:', error)
    const message = error instanceof Error ? error.message : '注文の作成に失敗しました'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
