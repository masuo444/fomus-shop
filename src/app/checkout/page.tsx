'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { getLocalCart, getOptionsAdjustment, formatOptionsText, type LocalCartItem } from '@/lib/cart'
import { createClient } from '@/lib/supabase/client'
import { formatPrice } from '@/lib/utils'
import { fetchAddressFromPostalCode } from '@/lib/address'
import { SHIPPING_FEE, SHIPPING_FEE_EUR, SHIPPING_FEE_INTL } from '@/lib/constants'
import { SHIPPING_COUNTRIES, countryLabel } from '@/lib/countries'
import type { Product, Profile } from '@/lib/types'
import siteConfig from '@/site.config'
import { useCurrency } from '@/hooks/useCurrency'
import { checkoutDict, localeFromPathname, localePath } from '@/lib/i18n/checkout'
import { productName as pnameForLocale } from '@/lib/i18n/common'

type PaymentMethod = 'stripe' | 'jpyc' | 'bank_transfer'

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
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('stripe')
  const [addressLoading, setAddressLoading] = useState(false)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [couponCode, setCouponCode] = useState('')
  const [couponDiscount, setCouponDiscount] = useState(0)
  const [couponError, setCouponError] = useState('')
  const [couponApplied, setCouponApplied] = useState(false)
  const [couponLoading, setCouponLoading] = useState(false)
  const [referralCode, setReferralCode] = useState('')
  const [giftWrapping, setGiftWrapping] = useState(false)
  const [giftMessage, setGiftMessage] = useState('')
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    postal_code: '',
    address: '',
    country: 'JP',
  })

  const currency = useCurrency()
  const isEur = currency === 'eur'
  const pathname = usePathname()
  const locale = localeFromPathname(pathname)
  const t = checkoutDict[locale]
  const pname = (product: { name: string; name_en?: string | null }) => pnameForLocale(product, locale)
  // Some labels already switch to English when currency is EUR on the JA site
  const te = checkoutDict[isEur || locale === 'en' ? 'en' : 'ja']
  const p = (path: string) => localePath(locale, path)
  const isPremiumMember = profile?.is_premium_member === true
  const allDigital = items.length > 0 && items.every(i => i.product?.item_type === 'digital')
  // EN pages are card-only: bank transfer / JPYC are domestic (Japan) options
  const jpycEnabled = siteConfig.jpyc.enabled && !isEur && !allDigital && locale !== 'en'
  const bankTransferEnabled = siteConfig.bankTransfer.enabled && !isEur && !allDigital && locale !== 'en'

  useEffect(() => {
    loadData()
  }, [])

  // EN page visitors are mostly overseas — default to US (user can change)
  useEffect(() => {
    if (locale === 'en') {
      setForm((prev) => (prev.country === 'JP' ? { ...prev, country: 'US' } : prev))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locale])

  const loadData = async () => {
    const cart = getLocalCart()
    if (cart.length === 0) {
      router.push(p('/cart'))
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
        setForm((prev) => ({
          ...prev,
          name: p.name || '',
          email: p.email || user.email || '',
          phone: p.phone || '',
          postal_code: p.postal_code || '',
          address: p.address || '',
        }))
      } else {
        setForm((prev) => ({ ...prev, email: user.email || '' }))
      }
    }

    setLoading(false)
  }

  const getItemPrice = (item: CartItemWithProduct): number => {
    if (!item.product) return 0
    const base = isEur ? (item.product.price_eur ?? item.product.price) : item.product.price
    return base + getOptionsAdjustment(item.selected_options)
  }

  const subtotal = items.reduce(
    (sum, item) => sum + getItemPrice(item) * item.quantity,
    0
  )
  const allShippingIncluded = items.length > 0 && items.every(i => i.product?.shipping_included)
  const isIntl = form.country !== 'JP'
  const shippingFee = (allDigital || allShippingIncluded) ? 0
    : isEur ? SHIPPING_FEE_EUR
    : isIntl ? SHIPPING_FEE_INTL
    : SHIPPING_FEE
  const total = subtotal + shippingFee - couponDiscount

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return
    setCouponError('')
    setCouponLoading(true)

    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponCode, order_amount: subtotal }),
      })
      const data = await res.json()
      if (!res.ok) {
        setCouponError(data.error || t.couponInvalid)
        setCouponDiscount(0)
        setCouponApplied(false)
      } else {
        setCouponDiscount(data.discount_amount || 0)
        setCouponApplied(true)
      }
    } catch {
      setCouponError(t.couponCheckFailed)
    } finally {
      setCouponLoading(false)
    }
  }

  const handleRemoveCoupon = () => {
    setCouponCode('')
    setCouponDiscount(0)
    setCouponApplied(false)
    setCouponError('')
  }

  const handlePostalCodeChange = async (value: string) => {
    setForm({ ...form, postal_code: value })
    if (!isEur && form.country === 'JP') {
      const cleaned = value.replace(/[-\s]/g, '')
      if (cleaned.length === 7 && /^\d{7}$/.test(cleaned)) {
        setAddressLoading(true)
        const address = await fetchAddressFromPostalCode(value)
        if (address) {
          setForm(prev => ({ ...prev, postal_code: value, address: prev.address || address }))
        }
        setAddressLoading(false)
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!showConfirmation) {
      setShowConfirmation(true)
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }
    setError('')
    setSubmitting(true)

    const cartItems = items.map((item) => ({
      product_id: item.product_id,
      quantity: item.quantity,
      selected_options: item.selected_options,
    }))

    try {
      if (paymentMethod === 'bank_transfer') {
        // Bank transfer checkout
        const res = await fetch('/api/bank-transfer/checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ items: cartItems, shipping: form, coupon_code: couponApplied ? couponCode : undefined, referral_code: referralCode.trim() || undefined, gift_wrapping: giftWrapping, gift_message: giftWrapping ? giftMessage : undefined }),
        })

        const data = await res.json()
        if (!res.ok) throw new Error(data.error || t.orderCreateFailed)

        const params = new URLSearchParams({
          order_number: data.order_number,
          total: String(data.total),
        })
        router.push(`/checkout/bank-transfer?${params.toString()}`)
      } else if (paymentMethod === 'jpyc') {
        // JPYC checkout
        const res = await fetch('/api/jpyc/checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ items: cartItems, shipping: form, coupon_code: couponApplied ? couponCode : undefined, referral_code: referralCode.trim() || undefined, gift_wrapping: giftWrapping, gift_message: giftWrapping ? giftMessage : undefined }),
        })

        const data = await res.json()
        if (!res.ok) throw new Error(data.error || t.orderCreateFailed)

        const params = new URLSearchParams({
          order_id: data.order_id,
          order_number: data.order_number,
          total: String(data.total),
          wallet: data.wallet_address,
        })
        router.push(`/checkout/jpyc?${params.toString()}`)
      } else {
        // Stripe checkout
        const res = await fetch('/api/stripe/checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ items: cartItems, shipping: form, currency, locale, coupon_code: couponApplied ? couponCode : undefined, referral_code: referralCode.trim() || undefined, gift_wrapping: giftWrapping, gift_message: giftWrapping ? giftMessage : undefined }),
        })

        const data = await res.json()
        if (!res.ok) throw new Error(data.error || t.paymentCreateFailed)

        window.location.href = data.url
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t.genericError)
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <div className="animate-pulse text-gray-400">{t.loading}</div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">{te.checkoutTitle}</h1>

      <form onSubmit={handleSubmit}>
        {showConfirmation && (
          <div className="mb-8 bg-white border border-gray-200 rounded-xl p-4 sm:p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-6">{t.orderConfirmation}</h2>

            {/* Shipping info review */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">{allDigital ? t.supporterInfo : t.shippingInfo}</h3>
              <div className="bg-gray-50 rounded-lg p-4 text-sm space-y-1">
                <p className="font-medium">{form.name}</p>
                <p className="text-gray-500">{form.email}</p>
                <p className="text-gray-500">{form.phone}</p>
                {!allDigital && <p className="text-gray-500">{form.country === 'JP' ? t.postalPrefix : ''}{form.postal_code}</p>}
                {!allDigital && <p className="text-gray-500">{form.address}</p>}
                {!allDigital && <p className="text-gray-500">{countryLabel(form.country, locale)}</p>}
              </div>
            </div>

            {/* Order items review */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">{t.orderItems}</h3>
              <div className="space-y-2">
                {items.map((item, idx) => (
                  <div key={`${item.product_id}-${idx}`} className="flex justify-between text-sm">
                    <div>
                      <span className="text-gray-700">{item.product ? pname(item.product) : ''} × {item.quantity}</span>
                      {item.selected_options && Object.keys(item.selected_options).length > 0 && (
                        <p className="text-xs text-gray-400">{formatOptionsText(item.selected_options)}</p>
                      )}
                    </div>
                    <span className="font-medium">{item.product ? formatPrice(getItemPrice(item) * item.quantity, currency) : '-'}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Payment method */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">{t.paymentMethod}</h3>
              <p className="text-sm text-gray-600">
                {paymentMethod === 'stripe' ? t.creditCard : paymentMethod === 'jpyc' ? t.jpyc : t.bankTransfer}
              </p>
            </div>

            {/* Total */}
            <div className="border-t border-gray-100 pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">{t.subtotal}</span>
                <span>{formatPrice(subtotal, currency)}</span>
              </div>
              {!allDigital && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">{t.shipping}</span>
                  <span>{allShippingIncluded ? t.shippingIncluded : formatPrice(shippingFee, currency)}</span>
                </div>
              )}
              {couponDiscount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-green-600">{t.couponDiscount}</span>
                  <span className="text-green-600">-{formatPrice(couponDiscount, currency)}</span>
                </div>
              )}
              <div className="flex justify-between text-base font-bold pt-2 border-t border-gray-100">
                <span>{t.total}</span>
                <span>{formatPrice(total, currency)}</span>
              </div>
            </div>

            {/* Action buttons */}
            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 bg-black text-white py-3 rounded-full text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
              >
                {submitting ? t.processing : t.confirmOrder}
              </button>
              <button
                type="button"
                onClick={() => setShowConfirmation(false)}
                className="text-center text-sm text-gray-500 hover:text-gray-900 py-3 transition-colors"
              >
                {t.editOrder}
              </button>
            </div>
          </div>
        )}

        {!showConfirmation && (<>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Shipping Form */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">
              {isEur ? te.shippingInfo : allDigital ? t.supporterInfo : t.shippingInfo}
            </h2>
            {!allDigital && (isEur ? (
              <p className="text-xs text-gray-400">{t.intlShippingAvailableNote}</p>
            ) : (
              <p className="text-xs text-gray-400">{t.domesticShippingNote}</p>
            ))}

            <div>
              <label className="block text-sm text-gray-600 mb-1">
                {te.fullName} *
              </label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1">
                {te.email} *
              </label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1">
                {te.phone} *
              </label>
              <input
                type="tel"
                required
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black"
              />
            </div>

            {!allDigital && (<>
            <div>
              <label className="block text-sm text-gray-600 mb-1">
                {te.country} *
              </label>
              <select
                required
                value={form.country}
                onChange={(e) => setForm({ ...form, country: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black"
              >
                {SHIPPING_COUNTRIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {locale === 'ja' ? c.nameJa : c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1">
                {te.postalCode} *
              </label>
              <input
                type="text"
                required
                value={form.postal_code}
                onChange={(e) => handlePostalCodeChange(e.target.value)}
                placeholder={te.postalCodePlaceholder}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black"
              />
              {addressLoading && (
                <p className="text-xs text-gray-400 mt-1">{t.searchingAddress}</p>
              )}
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1">
                {te.address} *
              </label>
              <textarea
                required
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                rows={3}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black resize-none"
              />
            </div>
            </>)}
          </div>

          {/* Order Summary */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              {te.orderSummary}
            </h2>
            <div className="space-y-3">
              {items.map((item) => (
                <div key={item.product_id} className="flex gap-3">
                  <div className="w-14 h-14 bg-gray-100 rounded overflow-hidden flex-shrink-0 relative">
                    {item.product?.images?.[0] ? (
                      <Image
                        src={item.product.images[0]}
                        alt={item.product ? pname(item.product) : ''}
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
                      {item.product ? pname(item.product) : t.productFallback}
                    </p>
                    {item.selected_options && Object.keys(item.selected_options).length > 0 && (
                      <p className="text-xs text-gray-400">{formatOptionsText(item.selected_options)}</p>
                    )}
                    <p className="text-xs text-gray-400">
                      {item.product ? formatPrice(getItemPrice(item), currency) : '-'} x {item.quantity}
                    </p>
                  </div>
                  <div className="text-sm font-medium text-gray-900">
                    {item.product ? formatPrice(getItemPrice(item) * item.quantity, currency) : '-'}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 border-t border-gray-100 pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">{te.subtotal}</span>
                <span>{formatPrice(subtotal, currency)}</span>
              </div>
              {!allDigital && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">{te.shipping}</span>
                  <span>{formatPrice(shippingFee, currency)}</span>
                </div>
              )}
              {couponDiscount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-green-600">{te.couponDiscount}</span>
                  <span className="text-green-600">-{formatPrice(couponDiscount, currency)}</span>
                </div>
              )}
              <div className="flex justify-between text-base font-bold pt-2 border-t border-gray-100">
                <span>{te.total}</span>
                <span>{formatPrice(total, currency)}</span>
              </div>
            </div>

            {/* Coupon */}
            <div className="pt-3 border-t border-gray-100 mt-4">
              <p className="text-sm text-gray-600 mb-2">{te.couponCode}</p>
              {couponApplied ? (
                <div className="flex items-center justify-between bg-green-50 rounded-lg px-3 py-2">
                  <div>
                    <span className="text-sm font-medium text-green-700">{couponCode.toUpperCase()}</span>
                    <span className="text-sm text-green-600 ml-2">-{formatPrice(couponDiscount, currency)}</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveCoupon}
                    className="text-xs text-gray-400 hover:text-red-500"
                  >
                    {t.removeCoupon}
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder={te.couponCodePlaceholder}
                    className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black"
                  />
                  <button
                    type="button"
                    onClick={handleApplyCoupon}
                    disabled={couponLoading || !couponCode.trim()}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors disabled:opacity-50"
                  >
                    {couponLoading ? '...' : te.apply}
                  </button>
                </div>
              )}
              {couponError && <p className="text-xs text-red-500 mt-1">{couponError}</p>}
            </div>

            {/* Referral code (GUILD member) */}
            <div className="pt-3 border-t border-gray-100 mt-4">
              <p className="text-sm text-gray-600 mb-1">{te.referralCode}</p>
              <input
                type="text"
                value={referralCode}
                onChange={(e) => setReferralCode(e.target.value)}
                placeholder={te.referralCodePlaceholder}
                maxLength={20}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black"
              />
              <p className="text-xs text-gray-400 mt-1">{te.referralCodeNote}</p>
            </div>
          </div>
        </div>


        {/* Payment Method Selection */}
        {(jpycEnabled || bankTransferEnabled) && (
          <div className="mt-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">{te.paymentMethod}</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setPaymentMethod('stripe')}
                className={`p-4 rounded-xl border text-left transition-all ${
                  paymentMethod === 'stripe'
                    ? 'border-[var(--foreground)] bg-[var(--color-subtle)]'
                    : 'border-[var(--color-border)] hover:border-gray-400'
                }`}
              >
                <p className="text-sm font-medium text-gray-900">{te.creditCard}</p>
                <p className="text-[10px] text-[var(--color-muted)] mt-1">{te.creditCardBrands}</p>
              </button>
              {bankTransferEnabled && (
                <button
                  type="button"
                  onClick={() => setPaymentMethod('bank_transfer')}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    paymentMethod === 'bank_transfer'
                      ? 'border-[var(--foreground)] bg-[var(--color-subtle)]'
                      : 'border-[var(--color-border)] hover:border-gray-400'
                  }`}
                >
                  <p className="text-sm font-medium text-gray-900">{t.bankTransfer}</p>
                  <p className="text-[10px] text-[var(--color-muted)] mt-1">{t.bankTransferDesc}</p>
                </button>
              )}
              {jpycEnabled && (
                <button
                  type="button"
                  onClick={() => setPaymentMethod('jpyc')}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    paymentMethod === 'jpyc'
                      ? 'border-[var(--foreground)] bg-[var(--color-subtle)]'
                      : 'border-[var(--color-border)] hover:border-gray-400'
                  }`}
                >
                  <p className="text-sm font-medium text-gray-900">{t.jpyc}</p>
                  <p className="text-[10px] text-[var(--color-muted)] mt-1">{t.jpycDesc}</p>
                </button>
              )}
            </div>
          </div>
        )}

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
            {submitting
              ? te.processing
              : paymentMethod === 'bank_transfer'
                ? t.payByBankTransfer
                : paymentMethod === 'jpyc'
                  ? t.payWithJpyc
                  : te.proceedToPayment
            }
          </button>
          <Link
            href={p('/cart')}
            className="text-center text-sm text-gray-500 hover:text-gray-900 py-3 transition-colors"
          >
            {te.backToCart}
          </Link>
        </div>
        </>)}
      </form>
    </div>
  )
}
