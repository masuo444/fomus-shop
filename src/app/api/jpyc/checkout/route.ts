import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { SHIPPING_FEE } from '@/lib/constants'
import siteConfig from '@/site.config'
import type { Product } from '@/lib/types'
import { requireString, validateEmail, sanitizeString, ValidationError } from '@/lib/validation'

interface CheckoutItem {
  product_id: string
  quantity: number
}

interface ShippingInfo {
  name: string
  email: string
  phone: string
  postal_code: string
  address: string
}

export async function POST(request: Request) {
  if (!siteConfig.jpyc.enabled) {
    return NextResponse.json({ error: 'JPYC決済は現在利用できません' }, { status: 400 })
  }

  if (!siteConfig.jpyc.walletAddress) {
    return NextResponse.json({ error: 'JPYC決済の設定が完了していません' }, { status: 500 })
  }

  try {
    const { items, shipping } = (await request.json()) as {
      items: CheckoutItem[]
      shipping: ShippingInfo
    }

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'カートが空です' }, { status: 400 })
    }

    // Validate shipping
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

    // JPYC is JPY only
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
      if (isPremiumMember && product.member_price != null && product.member_price < product.price) {
        return product.member_price
      }
      return product.price
    }

    const subtotal = items.reduce((sum, item) => {
      const product = products.find((p) => p.id === item.product_id)!
      return sum + getUnitPrice(product) * item.quantity
    }, 0)

    const shippingFee = isPremiumMember ? 0 : SHIPPING_FEE
    const total = subtotal + shippingFee

    const orderNumber = `${siteConfig.orderPrefix}${Date.now().toString(36).toUpperCase()}`

    // Create order with payment_method = 'jpyc' and status = 'awaiting_payment'
    const { data: order, error: orderError } = await admin.from('orders').insert({
      order_number: orderNumber,
      shop_id: shopId,
      user_id: user?.id || null,
      email: shipping.email,
      status: 'pending',
      subtotal,
      shipping_fee: shippingFee,
      total,
      currency: 'jpy',
      shipping_name: shipping.name,
      shipping_postal_code: shipping.postal_code,
      shipping_address: shipping.address,
      shipping_phone: shipping.phone,
      points_used: 0,
      payment_method: 'jpyc',
    }).select().single()

    if (orderError || !order) {
      console.error('JPYC order creation error:', orderError)
      return NextResponse.json({ error: '注文の作成に失敗しました' }, { status: 500 })
    }

    // Create order items
    const orderItems = items.map((item) => {
      const product = products.find((p) => p.id === item.product_id)!
      return {
        order_id: order.id,
        product_id: item.product_id,
        product_name: product.name,
        price: getUnitPrice(product),
        quantity: item.quantity,
        image_url: product.images?.[0] || null,
      }
    })

    await admin.from('order_items').insert(orderItems)

    return NextResponse.json({
      order_id: order.id,
      order_number: orderNumber,
      total,
      wallet_address: siteConfig.jpyc.walletAddress,
      chain: 'Polygon',
      token: 'JPYC',
    })
  } catch (error) {
    console.error('JPYC checkout error:', error)
    return NextResponse.json({ error: '注文の作成に失敗しました' }, { status: 500 })
  }
}
