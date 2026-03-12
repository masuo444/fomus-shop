'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react'
import {
  getLocalCart,
  updateLocalCartQuantity,
  removeFromLocalCart,
  type LocalCartItem,
} from '@/lib/cart'
import { createClient } from '@/lib/supabase/client'
import { formatPrice } from '@/lib/utils'
import { SHIPPING_FEE, SHIPPING_FEE_EUR } from '@/lib/constants'
import type { Product } from '@/lib/types'
import MemberCTA from '@/components/ui/MemberCTA'
import siteConfig from '@/site.config'
import { useCurrency } from '@/hooks/useCurrency'

interface CartItemWithProduct extends LocalCartItem {
  product?: Product
}

export default function CartPage() {
  const [items, setItems] = useState<CartItemWithProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [isPremiumMember, setIsGuildMember] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const currency = useCurrency()
  const isEur = currency === 'eur'

  useEffect(() => {
    loadCartProducts()
  }, [])

  const loadCartProducts = async () => {
    const cart = getLocalCart()
    if (cart.length === 0) {
      setItems([])
      setLoading(false)
      return
    }

    const supabase = createClient()
    const productIds = cart.map((item) => item.product_id)
    const { data: products } = await supabase
      .from('products')
      .select('*')
      .in('id', productIds)

    const itemsWithProducts: CartItemWithProduct[] = cart.map((item) => ({
      ...item,
      product: products?.find((p) => p.id === item.product_id) as Product | undefined,
    }))

    setItems(itemsWithProducts)

    // Check GUILD membership
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      setIsLoggedIn(true)
      const { data: profile } = await supabase
        .from('profiles')
        .select('is_premium_member')
        .eq('id', user.id)
        .single()
      if (profile?.is_premium_member) {
        setIsGuildMember(true)
      }
    }

    setLoading(false)
  }

  const updateQuantity = (productId: string, quantity: number) => {
    updateLocalCartQuantity(productId, quantity)
    setItems((prev) =>
      quantity <= 0
        ? prev.filter((item) => item.product_id !== productId)
        : prev.map((item) =>
            item.product_id === productId ? { ...item, quantity } : item
          )
    )
    window.dispatchEvent(new Event('cart-updated'))
  }

  const removeItem = (productId: string) => {
    removeFromLocalCart(productId)
    setItems((prev) => prev.filter((item) => item.product_id !== productId))
    window.dispatchEvent(new Event('cart-updated'))
  }

  // Check if cart has products from multiple shops
  const shopIds = [...new Set(items.filter(i => i.product).map(i => i.product!.shop_id))]
  const hasMixedShops = shopIds.length > 1

  const getItemPrice = (product: Product | undefined): number => {
    if (!product) return 0
    if (isEur) return product.price_eur ?? product.price
    return product.price
  }

  const subtotal = items.reduce(
    (sum, item) => sum + getItemPrice(item.product) * item.quantity,
    0
  )
  const shippingFee = items.length > 0
    ? (isEur ? SHIPPING_FEE_EUR : (isPremiumMember ? 0 : SHIPPING_FEE))
    : 0
  const total = subtotal + shippingFee

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <div className="animate-pulse text-gray-400">読み込み中...</div>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-24 text-center">
        <ShoppingBag className="w-16 h-16 text-gray-200 mx-auto mb-4" />
        <h1 className="text-xl font-bold text-gray-900 mb-2">カートは空です</h1>
        <p className="text-sm text-gray-400 mb-8">商品をカートに追加してください</p>
        <Link
          href="/shop"
          className="inline-block bg-black text-white px-8 py-3 rounded-full text-sm font-medium hover:bg-gray-800 transition-colors"
        >
          ショッピングを続ける
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">カート</h1>

      <div className="space-y-4">
        {items.map((item) => (
          <div
            key={item.product_id}
            className="flex gap-4 p-4 border border-gray-100 rounded-lg"
          >
            <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 relative">
              {item.product?.images?.[0] ? (
                <Image
                  src={item.product.images[0]}
                  alt={item.product?.name || ''}
                  fill
                  className="object-cover"
                  sizes="80px"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">
                  No Image
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <Link
                href={`/shop/${item.product_id}`}
                className="text-sm font-medium text-gray-900 hover:text-gray-600 line-clamp-1"
              >
                {item.product?.name || '商品が見つかりません'}
              </Link>
              <p className="text-sm font-medium text-gray-900 mt-1">
                {item.product ? formatPrice(getItemPrice(item.product), currency) : '-'}
              </p>

              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center border border-gray-200 rounded-lg">
                  <button
                    onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                    className="p-2.5 text-gray-400 hover:text-gray-600"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="w-8 text-center text-xs font-medium">{item.quantity}</span>
                  <button
                    onClick={() =>
                      updateQuantity(
                        item.product_id,
                        Math.min(item.product?.stock || 99, item.quantity + 1)
                      )
                    }
                    className="p-2.5 text-gray-400 hover:text-gray-600"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
                <button
                  onClick={() => removeItem(item.product_id)}
                  className="p-2.5 text-gray-400 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="mt-8 border-t border-gray-100 pt-6 space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">小計</span>
          <span className="text-gray-900">{formatPrice(subtotal, currency)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">{isEur ? 'Shipping' : '送料'}</span>
          {!isEur && isPremiumMember ? (
            <span className="font-medium" style={{ color: 'var(--color-member)' }}>
              送料無料（{siteConfig.features.membershipName}会員特典）
            </span>
          ) : (
            <span className="text-gray-900">{formatPrice(shippingFee, currency)}</span>
          )}
        </div>
        {!isEur && !isPremiumMember && items.length > 0 && (
          <p className="text-xs" style={{ color: 'var(--color-member)' }}>
            {siteConfig.features.membershipName}会員なら送料無料
          </p>
        )}
        {isEur ? (
          <p className="text-xs text-gray-400">International shipping included</p>
        ) : (
          <p className="text-xs text-gray-400">※ 国内送料1,000円〜 / 銀行振込OK</p>
        )}
        <div className="flex justify-between text-base font-bold pt-3 border-t border-gray-100">
          <span>{isEur ? 'Total' : '合計'}</span>
          <span>{formatPrice(total, currency)}</span>
        </div>
      </div>

      {hasMixedShops && (
        <div className="mt-6 bg-orange-50 border border-orange-200 rounded-xl px-5 py-3">
          <p className="text-sm text-orange-800 font-medium">異なるショップの商品が含まれています</p>
          <p className="text-xs text-orange-600 mt-1">同一ショップの商品のみ同時に購入できます。いずれかのショップの商品を削除してください。</p>
        </div>
      )}

      <div className="mt-8 space-y-3">
        {hasMixedShops ? (
          <span className="block w-full bg-gray-300 text-gray-500 py-3 rounded-full text-sm font-medium text-center cursor-not-allowed">
            レジに進む
          </span>
        ) : (
          <Link
            href="/checkout"
            className="block w-full bg-black text-white py-3 rounded-full text-sm font-medium text-center hover:bg-gray-800 transition-colors"
          >
            レジに進む
          </Link>
        )}
        <Link
          href="/shop"
          className="block w-full text-center text-sm text-gray-500 hover:text-gray-900 transition-colors py-2"
        >
          ショッピングを続ける
        </Link>
      </div>

      {/* Member CTA for non-premium members */}
      {!isPremiumMember && (
        <div className="mt-8">
          <MemberCTA />
        </div>
      )}
    </div>
  )
}
