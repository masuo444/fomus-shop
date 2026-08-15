'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { Minus, Plus, ShoppingCart, ChevronLeft, Mail, Heart, ExternalLink } from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import { addToLocalCart, wouldMixShops, clearLocalCart, getOptionsAdjustment, type SelectedOptions } from '@/lib/cart'
import type { Product } from '@/lib/types'
import ProductOptionSelector from '@/components/product/ProductOptionSelector'
import ShareButtons from '@/components/product/ShareButtons'
import FavoriteButton from '@/components/product/FavoriteButton'
import MemberCTA from '@/components/ui/MemberCTA'
import { trackProductView } from '@/components/product/RecentlyViewed'
import { createClient } from '@/lib/supabase/client'
import siteConfig from '@/site.config'
import KachiuLabel from '@/components/kachiu/KachiuLabel'
import { useCurrency } from '@/hooks/useCurrency'
import { localeFromPathname, localePath, productName, productDescription } from '@/lib/i18n/common'
import { productDict, fmt, dateLocale, categoryName } from '@/lib/i18n/product'

export default function ProductDetailClient({ product, shopName, reviewCount = 0, averageRating = 0 }: { product: Product; shopName?: string; reviewCount?: number; averageRating?: number }) {
  const [quantity, setQuantity] = useState(1)
  const [selectedImage, setSelectedImage] = useState(0)
  const [selectedOptions, setSelectedOptions] = useState<SelectedOptions>({})
  const [optionError, setOptionError] = useState('')
  const [addedToCart, setAddedToCart] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isPremiumMember, setIsGuildMember] = useState(false)
  const [isFavorited, setIsFavorited] = useState(false)
  const [autoAddToast, setAutoAddToast] = useState(false)
  const autoAddDone = useRef(false)

  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const locale = localeFromPathname(pathname)
  const t = productDict[locale]
  const p = (path: string) => localePath(locale, path)
  const displayName = productName(product, locale)
  const displayDescription = productDescription(product, locale)
  const memberName = siteConfig.features.membershipName

  const currency = useCurrency()
  const isEur = currency === 'eur'
  const mainPrice = isEur ? (product.price_eur ?? product.price) : product.price
  const memberPriceVal = isEur ? (product.member_price_eur ?? null) : product.member_price
  const comparePrice = isEur ? (product.compare_at_price_eur ?? null) : product.compare_at_price

  const optionsAdjustment = getOptionsAdjustment(selectedOptions)
  const isDigital = product.item_type === 'digital'
  // Digital and direct-link-only (hidden_from_listing, e.g. KUMIKI) products skip the cart
  const isDirectCheckout = isDigital || product.hidden_from_listing === true
  const isMadeToOrder = product.made_to_order
  const isExternal = !!product.external_url
  const isSoldOut = product.stock === 0 && !isMadeToOrder && !isExternal
  const isInquiryOnly = mainPrice === 0 && !isExternal
  const hasMemberPrice = memberPriceVal != null && memberPriceVal < mainPrice
  const hasOptions = product.product_options && product.product_options.length > 0

  // Sale period
  const now = new Date()
  const saleStart = product.sale_start_date ? new Date(product.sale_start_date) : null
  const saleEnd = product.sale_end_date ? new Date(product.sale_end_date) : null
  const isBeforeSale = saleStart ? now < saleStart : false
  const isAfterSale = saleEnd ? now > saleEnd : false
  const isSalePeriodActive = !isBeforeSale && !isAfterSale
  const hasLimitedSale = saleStart || saleEnd

  // Auto-add to cart when ?add=true
  useEffect(() => {
    if (searchParams.get('add') === 'true' && !autoAddDone.current && !isSoldOut && !isExternal) {
      autoAddDone.current = true
      if (wouldMixShops(product.shop_id)) {
        clearLocalCart()
      }
      addToLocalCart(product.id, 1, product.shop_id)
      window.dispatchEvent(new Event('cart-updated'))
      setAutoAddToast(true)
      setTimeout(() => {
        setAutoAddToast(false)
        router.push(p('/cart'))
      }, 1500)
    }
  }, [searchParams, product.id, isSoldOut, router])

  useEffect(() => {
    trackProductView(product.id)
    checkAuth()
  }, [])

  const checkAuth = async () => {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (user) {
      setIsLoggedIn(true)

      // Check profile for GUILD membership
      const { data: profile } = await supabase
        .from('profiles')
        .select('is_premium_member')
        .eq('id', user.id)
        .single()
      if (profile?.is_premium_member) {
        setIsGuildMember(true)
      }

      // Check favorite status
      const { data } = await supabase
        .from('favorites')
        .select('id')
        .eq('user_id', user.id)
        .eq('product_id', product.id)
        .single()
      if (data) setIsFavorited(true)
    }
  }

  const handleAddToCart = () => {
    // Validate required options
    if (hasOptions) {
      const requiredOptions = product.product_options!.filter(o => o.required)
      const missing = requiredOptions.filter(o => !selectedOptions[o.name])
      if (missing.length > 0) {
        setOptionError(fmt(t.optionSelectPrompt, { options: missing.map(o => o.name).join(t.optionJoiner) }))
        return
      }
    }
    setOptionError('')

    const opts = Object.keys(selectedOptions).length > 0 ? selectedOptions : undefined

    if (isDirectCheckout) {
      // hidden_from_listing商品はカートをリセットして即チェックアウトへ
      clearLocalCart()
      addToLocalCart(product.id, quantity, product.shop_id, opts)
      window.dispatchEvent(new Event('cart-updated'))
      router.push(p('/checkout'))
      return
    }

    if (wouldMixShops(product.shop_id)) {
      if (!confirm(t.mixedShopsConfirm)) {
        return
      }
      clearLocalCart()
    }
    addToLocalCart(product.id, quantity, product.shop_id, opts)
    window.dispatchEvent(new Event('cart-updated'))
    window.dispatchEvent(new CustomEvent('cart-toast', { detail: { name: displayName } }))
    setAddedToCart(true)
    setTimeout(() => setAddedToCart(false), 2000)
  }

  const baseDisplayPrice = isPremiumMember && hasMemberPrice ? memberPriceVal! : mainPrice
  const displayPrice = baseDisplayPrice + optionsAdjustment

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Auto-add toast */}
      {autoAddToast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-member text-[var(--background)] px-6 py-3 rounded-[var(--radius-md)] shadow-lg flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <ShoppingCart className="w-5 h-5" />
          <span className="font-medium">{t.addedToCart}</span>
        </div>
      )}

      <nav className="flex items-center gap-2 text-xs text-[var(--color-muted)] mb-6">
        <Link href={p('/')} className="hover:text-[var(--foreground)] transition-colors">{t.breadcrumbHome}</Link>
        <span>/</span>
        <Link href={p('/shop')} className="hover:text-[var(--foreground)] transition-colors">{t.breadcrumbShop}</Link>
        <span>/</span>
        <span className="text-[var(--foreground)] line-clamp-1">{displayName}</span>
      </nav>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
        {/* Images */}
        <div className="space-y-4">
          <div className="aspect-square bg-[var(--color-subtle)] rounded-[var(--radius-md)] overflow-hidden relative">
              {product.images && product.images.length > 0 ? (
                <Image
                  src={product.images[selectedImage]}
                  alt={displayName}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  priority
                />
              ) : siteConfig.defaultShopSlug === 'kachiu' ? (
                <KachiuLabel name={product.name} index={0} />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[var(--color-muted)]">
                  <svg className="w-24 h-24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              )}
            </div>
          {product.images && product.images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={`w-20 h-20 rounded-[var(--radius-md)] overflow-hidden flex-shrink-0 border-2 transition-colors ${
                    selectedImage === i ? 'border-black' : 'border-transparent'
                  }`}
                >
                  <Image
                    src={img}
                    alt={`${displayName} ${i + 1}`}
                    width={80}
                    height={80}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          {product.category && (
            <p className="text-xs text-[var(--color-muted)] uppercase tracking-wider mb-2">
              {categoryName(product.category, locale)}
            </p>
          )}
          {shopName && (
            <p className="text-xs text-[var(--color-muted)] mb-1">{shopName}</p>
          )}
          <div className="flex items-start justify-between gap-2">
            <h1 className="text-2xl md:text-3xl font-bold text-[var(--foreground)]">{displayName}</h1>
            <FavoriteButton
              productId={product.id}
              initialFavorited={isFavorited}
              size="md"
            />
          </div>

          {reviewCount > 0 && (
            <div className="mt-2 flex items-center gap-2">
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg key={star} className={`w-4 h-4 ${star <= Math.round(averageRating) ? 'text-[var(--color-accent)]' : 'text-[var(--color-border)]'}`} fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <span className="text-sm text-[var(--color-muted)]">
                {averageRating.toFixed(1)} ({reviewCount}{t.reviewsSuffix})
              </span>
            </div>
          )}

          <div className="mt-4">
            {isInquiryOnly ? (
              <span className="text-lg font-medium text-[var(--foreground)]">{t.contactForPrice}</span>
            ) : isPremiumMember && hasMemberPrice ? (
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-bold" style={{ color: 'var(--color-member)' }}>
                    {formatPrice(memberPriceVal! + optionsAdjustment, currency)}
                  </span>
                  <span
                    className="text-xs font-bold px-2 py-0.5 rounded-[var(--radius-pill)]"
                    style={{ backgroundColor: 'var(--color-member-bg)', color: 'var(--color-member)' }}
                  >
                    {fmt(t.memberPriceBadge, { name: memberName })}
                  </span>
                </div>
                <span className="text-sm text-[var(--color-muted)] line-through">
                  {formatPrice(mainPrice, currency)}
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <span className="text-2xl font-bold text-[var(--foreground)]">
                  {formatPrice(mainPrice + optionsAdjustment, currency)}
                </span>
                {comparePrice && comparePrice > mainPrice && (
                  <span className="text-lg text-[var(--color-muted)] line-through">
                    {formatPrice(comparePrice, currency)}
                  </span>
                )}
              </div>
            )}

            {/* Show member price hint for non-premium users */}
            {!isPremiumMember && hasMemberPrice && (
              <div className="mt-2 rounded-[var(--radius-md)] px-3 py-2" style={{ backgroundColor: 'var(--color-member-bg)' }}>
                <p className="text-sm font-medium" style={{ color: 'var(--color-member-dark)' }}>
                  {fmt(t.memberPriceHint, { name: memberName, price: formatPrice(memberPriceVal!, currency) })}
                </p>
                <a
                  href={siteConfig.features.membershipUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs underline hover:no-underline"
                  style={{ color: 'var(--color-member)' }}
                >
                  {fmt(t.joinForMemberPrice, { name: memberName })}
                </a>
              </div>
            )}
          </div>

          {/* Stock */}
          <div className="mt-4">
            {isMadeToOrder ? (
              <div>
                <span className="text-sm text-[var(--foreground)] font-medium">{t.madeToOrderNote}</span>
                {product.production_time && (
                  <p className="text-xs text-[var(--color-muted)] mt-1">{product.production_time}</p>
                )}
              </div>
            ) : isSoldOut ? (
              <span className="text-sm text-red-500 font-medium">{t.outOfStock}</span>
            ) : product.stock <= 5 ? (
              <span className="text-sm text-amber-600">{fmt(t.lowStock, { n: product.stock })}</span>
            ) : (
              <span className="text-sm text-green-600">{t.inStock}</span>
            )}
          </div>

          {/* Sale period */}
          {hasLimitedSale && isSalePeriodActive && saleEnd && (
            <div className="mt-3 rounded-[var(--radius-md)] px-3 py-2 bg-red-50 border border-red-200">
              <p className="text-sm text-red-600 font-medium">
                {fmt(t.saleUntil, { date: saleEnd.toLocaleDateString(dateLocale(locale), { month: 'long', day: 'numeric' }) })}
              </p>
            </div>
          )}
          {hasLimitedSale && !isSalePeriodActive && (
            <div className="mt-3 rounded-[var(--radius-md)] px-3 py-2 bg-orange-50 border border-orange-200">
              {isBeforeSale ? (
                <p className="text-sm text-orange-700 font-medium">
                  {fmt(t.saleFrom, { date: saleStart!.toLocaleDateString(dateLocale(locale), { month: 'long', day: 'numeric' }) })}
                </p>
              ) : (
                <p className="text-sm text-[var(--color-muted)] font-medium">{t.salePeriodEnded}</p>
              )}
            </div>
          )}

          {/* Shipping info */}
          {product.shipping_included ? (
            <div className="mt-2">
              <span className="text-sm font-medium text-green-600">{t.shippingIncluded}</span>
            </div>
          ) : isPremiumMember && (
            <div className="mt-2">
              <span className="text-sm font-medium" style={{ color: 'var(--color-member)' }}>
                {fmt(t.memberBenefit, { name: memberName })}
              </span>
            </div>
          )}

          {/* Description */}
          {displayDescription && (
            <div className="mt-6 text-sm text-[var(--color-muted)] leading-relaxed whitespace-pre-wrap">
              {displayDescription}
            </div>
          )}

          {/* Product Options */}
          {hasOptions && !isSoldOut && !isExternal && isSalePeriodActive && (
            <div className="mt-6 pt-6 border-t border-[var(--color-border)]">
              <ProductOptionSelector
                options={product.product_options!}
                selectedOptions={selectedOptions}
                onOptionsChange={setSelectedOptions}
                currency={currency}
              />
              {optionsAdjustment !== 0 && (
                <div className="mt-3 flex items-center justify-between text-sm px-1">
                  <span className="text-[var(--color-muted)]">{t.optionsTotal}</span>
                  <span className="font-medium text-[var(--foreground)]">
                    +{formatPrice(optionsAdjustment, currency)}
                  </span>
                </div>
              )}
              {optionError && (
                <p className="mt-2 text-sm text-red-500">{optionError}</p>
              )}
            </div>
          )}

          {/* External purchase link (e.g. products sold on a partner site) */}
          {isExternal && (
            <div className="mt-8">
              <a
                href={product.external_url!}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-[var(--foreground)] text-[var(--background)] py-3 rounded-[var(--radius-pill)] text-sm font-medium hover:opacity-85 transition-colors flex items-center justify-center gap-2"
              >
                <ExternalLink className="w-4 h-4" />
                公式販売サイトで購入
              </a>
              <p className="mt-2 text-xs text-[var(--color-muted)] text-center">
                この商品は外部の販売サイトでご購入いただけます
              </p>
            </div>
          )}

          {/* Inquiry button for price=0 products */}
          {isInquiryOnly && (
            <div className="mt-8">
              <Link
                href={p(`/contact?subject=${encodeURIComponent(fmt(t.contactSubject, { name: displayName }))}`)}
                className="w-full bg-[var(--foreground)] text-[var(--background)] py-3 rounded-[var(--radius-pill)] text-sm font-medium hover:opacity-85 transition-colors flex items-center justify-center gap-2"
              >
                <Mail className="w-4 h-4" />
                {t.contactCta}
              </Link>
              <p className="mt-2 text-xs text-[var(--color-muted)] text-center">
                {t.contactNote}
              </p>
            </div>
          )}

          {/* Quantity & Add to Cart */}
          {!isSoldOut && !isInquiryOnly && !isExternal && isSalePeriodActive && (
            <div className="mt-8 space-y-4">
              <div className="flex items-center gap-3">
                <span className="text-sm text-[var(--color-muted)]">{t.quantity}</span>
                <div className="flex items-center border border-[var(--color-border)] rounded-[var(--radius-md)]">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-2 text-[var(--color-muted)] hover:text-[var(--color-muted)] transition-colors"
                    disabled={quantity <= 1}
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-12 text-center text-sm font-medium">{quantity}</span>
                  <button
                    onClick={() => {
                      const max = product.quantity_limit || (isMadeToOrder ? 99 : product.stock)
                      setQuantity(Math.min(max, quantity + 1))
                    }}
                    className="p-2 text-[var(--color-muted)] hover:text-[var(--color-muted)] transition-colors"
                    disabled={quantity >= (product.quantity_limit || (isMadeToOrder ? 99 : product.stock))}
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {isDigital ? (
                <button
                  onClick={handleAddToCart}
                  className="w-full relative overflow-hidden bg-gradient-to-r from-amber-800 via-amber-700 to-amber-600 text-amber-50 py-4 rounded-2xl text-sm font-semibold tracking-[0.15em] hover:opacity-90 active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2.5 shadow-lg shadow-amber-900/30"
                >
                  <Heart className="w-4 h-4 fill-amber-200 text-amber-200" />
                  {t.support}
                </button>
              ) : (
                <button
                  onClick={handleAddToCart}
                  className="w-full bg-[var(--foreground)] text-[var(--background)] py-3 rounded-[var(--radius-pill)] text-sm font-medium hover:opacity-85 transition-colors flex items-center justify-center gap-2"
                >
                  <ShoppingCart className="w-4 h-4" />
                  {isDirectCheckout ? t.buyNow : addedToCart ? t.addedToCart : t.addToCart}
                </button>
              )}
            </div>
          )}

          {isSoldOut && isSalePeriodActive && (
            <div className="mt-8">
              <button
                disabled
                className="w-full bg-[var(--color-border)] text-[var(--color-muted)] py-3 rounded-[var(--radius-pill)] text-sm font-medium cursor-not-allowed"
              >
                SOLD OUT
              </button>
            </div>
          )}

          {!isSalePeriodActive && !isInquiryOnly && !isExternal && (
            <div className="mt-8">
              <button
                disabled
                className="w-full bg-[var(--color-border)] text-[var(--color-muted)] py-3 rounded-[var(--radius-pill)] text-sm font-medium cursor-not-allowed"
              >
                {isBeforeSale ? t.beforeSaleButton : t.afterSaleButton}
              </button>
            </div>
          )}

          {/* Shipping & Return Info */}
          <div className="mt-6 space-y-2.5 text-xs text-[var(--color-muted)]">
            {!(product.item_type === 'digital' || product.hidden_from_listing) && (
              <>
                {(siteConfig.productNotes.shipping ?? t.shippingLine) && (
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H18.75m-7.5-10.5H6.375c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>
                  <span>{siteConfig.productNotes.shipping ?? t.shippingLine}</span>
                </div>
                )}
                {(siteConfig.productNotes.quality ?? t.qualityLine) && (
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" /></svg>
                  <span>{siteConfig.productNotes.quality ?? t.qualityLine}</span>
                </div>
                )}
              </>
            )}
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" /></svg>
              <span>{siteConfig.productNotes.payment ?? t.paymentBrands}</span>
            </div>
          </div>

          {/* Member CTA for non-premium members */}
          {!isPremiumMember && hasMemberPrice && (
            <div className="mt-6">
              <MemberCTA compact locale={locale} />
            </div>
          )}

          {/* Share */}
          <div className="mt-8 pt-6 border-t border-[var(--color-border)]">
            <ShareButtons
              url={typeof window !== 'undefined' ? window.location.href : ''}
              title={displayName}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
