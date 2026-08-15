'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react'
import {
  getLocalCart,
  updateLocalCartQuantity,
  removeFromLocalCart,
  getOptionsAdjustment,
  formatOptionsText,
  type LocalCartItem,
  type SelectedOptions,
} from '@/lib/cart'
import { createClient } from '@/lib/supabase/client'
import { formatPrice } from '@/lib/utils'
import { SHIPPING_FEE, SHIPPING_FEE_EUR } from '@/lib/constants'
import type { Product } from '@/lib/types'
import MemberCTA from '@/components/ui/MemberCTA'
import siteConfig from '@/site.config'
import { useCurrency } from '@/hooks/useCurrency'
import { checkoutDict, localeFromPathname, localePath } from '@/lib/i18n/checkout'
import { productName as pnameForLocale } from '@/lib/i18n/common'

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
  const pathname = usePathname()
  const locale = localeFromPathname(pathname)
  const t = checkoutDict[locale]
  const pname = (product: { name: string; name_en?: string | null }) => pnameForLocale(product, locale)
  // Some labels already switch to English when currency is EUR on the JA site
  const te = checkoutDict[isEur || locale === 'en' ? 'en' : 'ja']
  const p = (path: string) => localePath(locale, path)

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

  const itemKey = (item: LocalCartItem) => {
    if (!item.selected_options || Object.keys(item.selected_options).length === 0) return item.product_id
    const sorted = Object.entries(item.selected_options).sort(([a], [b]) => a.localeCompare(b))
    return `${item.product_id}__${sorted.map(([k, v]) => `${k}:${v.choiceId}`).join('|')}`
  }

  const updateQuantity = (item: LocalCartItem, quantity: number) => {
    updateLocalCartQuantity(item.product_id, quantity, item.selected_options)
    const key = itemKey(item)
    setItems((prev) =>
      quantity <= 0
        ? prev.filter((i) => itemKey(i) !== key)
        : prev.map((i) =>
            itemKey(i) === key ? { ...i, quantity } : i
          )
    )
    window.dispatchEvent(new Event('cart-updated'))
  }

  const removeItem = (item: LocalCartItem) => {
    removeFromLocalCart(item.product_id, item.selected_options)
    const key = itemKey(item)
    setItems((prev) => prev.filter((i) => itemKey(i) !== key))
    window.dispatchEvent(new Event('cart-updated'))
  }

  // Check if cart has products from multiple shops
  const shopIds = [...new Set(items.filter(i => i.product).map(i => i.product!.shop_id))]
  const hasMixedShops = shopIds.length > 1

  const getItemPrice = (product: Product | undefined, options?: SelectedOptions): number => {
    if (!product) return 0
    const base = isEur ? (product.price_eur ?? product.price) : product.price
    return base + getOptionsAdjustment(options)
  }

  const subtotal = items.reduce(
    (sum, item) => sum + getItemPrice(item.product, item.selected_options) * item.quantity,
    0
  )
  const allDigital = items.length > 0 && items.every(i => i.product?.item_type === 'digital')
  const allShippingIncluded = items.length > 0 && items.every(i => i.product?.shipping_included === true)
  const shippingFee = (allDigital || allShippingIncluded || items.length === 0)
    ? 0
    : (isEur ? SHIPPING_FEE_EUR : SHIPPING_FEE)
  const total = subtotal + shippingFee

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <div className="animate-pulse text-[var(--color-muted)]">{t.loading}</div>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-24 text-center">
        <ShoppingBag className="w-16 h-16 text-[var(--color-border)] mx-auto mb-4" />
        <h1 className="font-display text-xl tracking-[0.12em] text-[var(--foreground)] mb-2">{t.cartEmptyTitle}</h1>
        <p className="text-sm text-[var(--color-muted)] mb-8">{t.cartEmptyDesc}</p>
        <Link
          href={p('/shop')}
          className="inline-block bg-[var(--foreground)] text-[var(--background)] px-8 py-3 rounded-[var(--radius-pill)] text-sm font-medium hover:opacity-85 transition-colors"
        >
          {t.continueShopping}
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="font-display text-2xl tracking-[0.15em] text-[var(--foreground)] mb-8">{t.cartTitle}</h1>

      <div className="space-y-4">
        {items.map((item) => (
          <div
            key={itemKey(item)}
            className="flex gap-4 p-4 border border-[var(--color-border)] rounded-[var(--radius-md)]"
          >
            <div className="w-20 h-20 bg-[var(--color-subtle)] rounded-[var(--radius-md)] overflow-hidden flex-shrink-0 relative">
              {item.product?.images?.[0] ? (
                <Image
                  src={item.product.images[0]}
                  alt={item.product ? pname(item.product) : ''}
                  fill
                  className="object-cover"
                  sizes="80px"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[var(--color-muted)] text-xs">
                  No Image
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <Link
                href={p(`/shop/${item.product_id}`)}
                className="text-sm font-medium text-[var(--foreground)] hover:text-[var(--color-muted)] line-clamp-1"
              >
                {item.product ? pname(item.product) : t.productNotFound}
              </Link>
              <p className="text-sm font-medium text-[var(--foreground)] mt-1">
                {item.product ? formatPrice(getItemPrice(item.product, item.selected_options), currency) : '-'}
              </p>
              {item.selected_options && Object.keys(item.selected_options).length > 0 && (
                <p className="text-xs text-[var(--color-muted)] mt-1">
                  {formatOptionsText(item.selected_options)}
                </p>
              )}

              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center border border-[var(--color-border)] rounded-[var(--radius-md)]">
                  <button
                    onClick={() => updateQuantity(item, item.quantity - 1)}
                    className="p-2.5 text-[var(--color-muted)] hover:text-[var(--color-muted)]"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="w-8 text-center text-xs font-medium">{item.quantity}</span>
                  <button
                    onClick={() =>
                      updateQuantity(
                        item,
                        Math.min(
                          item.product?.made_to_order
                            ? (item.product.quantity_limit || 99)
                            : (item.product?.stock || 99),
                          item.quantity + 1
                        )
                      )
                    }
                    className="p-2.5 text-[var(--color-muted)] hover:text-[var(--color-muted)]"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
                <button
                  onClick={() => removeItem(item)}
                  className="p-2.5 text-[var(--color-muted)] hover:text-red-500 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="mt-8 border-t border-[var(--color-border)] pt-6 space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-[var(--color-muted)]">{t.subtotal}</span>
          <span className="text-[var(--foreground)]">{formatPrice(subtotal, currency)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-[var(--color-muted)]">{te.shipping}</span>
          <span className="text-[var(--foreground)]">{(allDigital || allShippingIncluded) ? t.freeShippingIncluded : formatPrice(shippingFee, currency)}</span>
        </div>
        {!allDigital && !allShippingIncluded && (isEur ? (
          <p className="text-xs text-[var(--color-muted)]">{t.intlShippingIncludedNote}</p>
        ) : (
          <p className="text-xs text-[var(--color-muted)]">{t.domesticShippingNote}</p>
        ))}
        <div className="flex justify-between text-base font-bold pt-3 border-t border-[var(--color-border)]">
          <span>{te.total}</span>
          <span>{formatPrice(total, currency)}</span>
        </div>
      </div>

      {hasMixedShops && (
        <div className="mt-6 bg-orange-50 border border-orange-200 rounded-[var(--radius-lg)] px-5 py-3">
          <p className="text-sm text-orange-800 font-medium">{t.mixedShopsTitle}</p>
          <p className="text-xs text-orange-600 mt-1">{t.mixedShopsDesc}</p>
        </div>
      )}

      {/* Payment Methods */}
      <div className="mt-6 flex items-center justify-center gap-3 text-[11px] text-[var(--color-muted)]">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
        <span>Visa</span><span>/</span>
        <span>Mastercard</span><span>/</span>
        <span>Amex</span><span>/</span>
        <span>JCB</span>
        {locale !== 'en' && siteConfig.jpyc.enabled && (<><span>/</span><span>JPYC</span></>)}
      </div>

      <div className="mt-8 space-y-3">
        {hasMixedShops ? (
          <span className="block w-full bg-[var(--color-border)] text-[var(--color-muted)] py-3 rounded-[var(--radius-pill)] text-sm font-medium text-center cursor-not-allowed">
            {allDigital ? t.proceedToSupport : t.proceedToCheckout}
          </span>
        ) : (
          <Link
            href={p('/checkout')}
            className="block w-full bg-[var(--foreground)] text-[var(--background)] py-3 rounded-[var(--radius-pill)] text-sm font-medium text-center hover:opacity-85 transition-colors"
          >
            {allDigital ? t.proceedToSupport : t.proceedToCheckout}
          </Link>
        )}
        <Link
          href={p('/shop')}
          className="block w-full text-center text-sm text-[var(--color-muted)] hover:text-[var(--foreground)] transition-colors py-2"
        >
          {t.continueShopping}
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
