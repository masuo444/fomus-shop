'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { getLocalCart, type LocalCartItem } from '@/lib/cart'
import { createClient } from '@/lib/supabase/client'
import { formatPrice } from '@/lib/utils'
import { SHIPPING_FEE, SHIPPING_FEE_EUR } from '@/lib/constants'
import type { Product, Profile } from '@/lib/types'
import siteConfig from '@/site.config'
import { useCurrency } from '@/hooks/useCurrency'

interface CartItemWithProduct extends LocalCartItem {
  product?: Product
}

export default function CheckoutPage() {
  const router = useRouter()
  const [items, setItems] = useState<CartItemWithProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [profile, setProfile] = useState<Profile | null>(null)
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    postal_code: '',
    address: '',
  })

  const currency = useCurrency()
  const isEur = currency === 'eur'
  const isPremiumMember = profile?.is_premium_member === true

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    const cart = getLocalCart()
    if (cart.length === 0) {
      router.push('/cart')
      return
    }

    const supabase = createClient()

    // Load products
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

    // Pre-fill from profile if logged in
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (user) {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (profileData) {
        const p = profileData as Profile
        setProfile(p)
        setForm({
          name: p.name || '',
          email: p.email || user.email || '',
          phone: p.phone || '',
          postal_code: p.postal_code || '',
          address: p.address || '',
        })
      } else {
        setForm((prev) => ({ ...prev, email: user.email || '' }))
      }
    }

    setLoading(false)
  }

  const getItemPrice = (product: Product | undefined): number => {
    if (!product) return 0
    if (isEur) return product.price_eur ?? product.price
    return product.price
  }

  const subtotal = items.reduce(
    (sum, item) => sum + getItemPrice(item.product) * item.quantity,
    0
  )
  const shippingFee = isEur ? SHIPPING_FEE_EUR : (isPremiumMember ? 0 : SHIPPING_FEE)
  const total = subtotal + shippingFee

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)

    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map((item) => ({
            product_id: item.product_id,
            quantity: item.quantity,
          })),
          shipping: form,
          currency,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || '決済の作成に失敗しました')
      }

      window.location.href = data.url
    } catch (err) {
      setError(err instanceof Error ? err.message : 'エラーが発生しました')
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <div className="animate-pulse text-gray-400">読み込み中...</div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">{isEur ? 'Checkout' : 'お会計'}</h1>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Shipping Form */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">
              {isEur ? 'Shipping Information' : '配送先情報'}
            </h2>
            {isEur ? (
              <p className="text-xs text-gray-400">International shipping available</p>
            ) : (
              <p className="text-xs text-gray-400">※ 日本国内への発送のみ対応しています</p>
            )}

            <div>
              <label className="block text-sm text-gray-600 mb-1">
                {isEur ? 'Full Name' : 'お名前'} *
              </label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1">
                {isEur ? 'Email' : 'メールアドレス'} *
              </label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1">
                {isEur ? 'Phone' : '電話番号'} *
              </label>
              <input
                type="tel"
                required
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1">
                {isEur ? 'Postal Code' : '郵便番号'} *
              </label>
              <input
                type="text"
                required
                value={form.postal_code}
                onChange={(e) => setForm({ ...form, postal_code: e.target.value })}
                placeholder={isEur ? '' : '000-0000'}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1">
                {isEur ? 'Address' : '住所'} *
              </label>
              <textarea
                required
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                rows={3}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black resize-none"
              />
            </div>
          </div>

          {/* Order Summary */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              {isEur ? 'Order Summary' : '注文内容'}
            </h2>
            <div className="space-y-3">
              {items.map((item) => (
                <div key={item.product_id} className="flex gap-3">
                  <div className="w-14 h-14 bg-gray-100 rounded overflow-hidden flex-shrink-0 relative">
                    {item.product?.images?.[0] ? (
                      <Image
                        src={item.product.images[0]}
                        alt={item.product?.name || ''}
                        fill
                        className="object-cover"
                        sizes="56px"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300 text-[10px]">
                        No Image
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900 line-clamp-1">
                      {item.product?.name || '商品'}
                    </p>
                    <p className="text-xs text-gray-400">
                      {item.product ? formatPrice(getItemPrice(item.product), currency) : '-'} x {item.quantity}
                    </p>
                  </div>
                  <div className="text-sm font-medium text-gray-900">
                    {item.product ? formatPrice(getItemPrice(item.product) * item.quantity, currency) : '-'}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 border-t border-gray-100 pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">{isEur ? 'Subtotal' : '小計'}</span>
                <span>{formatPrice(subtotal, currency)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">{isEur ? 'Shipping' : '送料'}</span>
                {!isEur && isPremiumMember ? (
                  <span className="font-medium" style={{ color: 'var(--color-member)' }}>
                    送料無料（{siteConfig.features.membershipName}会員特典）
                  </span>
                ) : (
                  <span>{formatPrice(shippingFee, currency)}</span>
                )}
              </div>
              <div className="flex justify-between text-base font-bold pt-2 border-t border-gray-100">
                <span>{isEur ? 'Total' : '合計'}</span>
                <span>{formatPrice(total, currency)}</span>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="mt-6 bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <div className="mt-8 flex flex-col sm:flex-row gap-3">
          <button
            type="submit"
            disabled={submitting}
            className="flex-1 bg-black text-white py-3 rounded-full text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? (isEur ? 'Processing...' : '処理中...') : (isEur ? 'Proceed to Payment' : 'お支払いへ')}
          </button>
          <Link
            href="/cart"
            className="text-center text-sm text-gray-500 hover:text-gray-900 py-3 transition-colors"
          >
            {isEur ? 'Back to Cart' : 'カートに戻る'}
          </Link>
        </div>
      </form>
    </div>
  )
}
