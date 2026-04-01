'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import { Minus, Plus, ShoppingCart, ChevronLeft, Mail } from 'lucide-react'
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
import { useCurrency } from '@/hooks/useCurrency'

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

  const currency = useCurrency()
  const isEur = currency === 'eur'
  const mainPrice = isEur ? (product.price_eur ?? product.price) : product.price
  const memberPriceVal = isEur ? (product.member_price_eur ?? null) : product.member_price
  const comparePrice = isEur ? (product.compare_at_price_eur ?? null) : product.compare_at_price

  const optionsAdjustment = getOptionsAdjustment(selectedOptions)
  const isMadeToOrder = product.made_to_order
  const isSoldOut = product.stock === 0 && !isMadeToOrder
  const isInquiryOnly = mainPrice === 0
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
    if (searchParams.get('add') === 'true' && !autoAddDone.current && !isSoldOut) {
      autoAddDone.current = true
      if (wouldMixShops(product.shop_id)) {
        clearLocalCart()
      }
      addToLocalCart(product.id, 1, product.shop_id)
      window.dispatchEvent(new Event('cart-updated'))
      setAutoAddToast(true)
      setTimeout(() => {
        setAutoAddToast(false)
        router.push('/cart')
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
        setOptionError(`「${missing.map(o => o.name).join('」「')}」を選択してください`)
        return
      }
    }
    setOptionError('')

    if (wouldMixShops(product.shop_id)) {
      if (!confirm('カートには別のショップの商品が入っています。カートを空にしてこの商品を追加しますか？')) {
        return
      }
      clearLocalCart()
    }
    const opts = Object.keys(selectedOptions).length > 0 ? selectedOptions : undefined
    addToLocalCart(product.id, quantity, product.shop_id, opts)
    window.dispatchEvent(new Event('cart-updated'))
    window.dispatchEvent(new CustomEvent('cart-toast', { detail: { name: product.name } }))
    setAddedToCart(true)
    setTimeout(() => setAddedToCart(false), 2000)
  }

  const baseDisplayPrice = isPremiumMember && hasMemberPrice ? memberPriceVal! : mainPrice
  const displayPrice = baseDisplayPrice + optionsAdjustment

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Auto-add toast */}
      {autoAddToast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-member text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <ShoppingCart className="w-5 h-5" />
          <span className="font-medium">カートに追加しました</span>
        </div>
      )}

      <nav className="flex items-center gap-2 text-xs text-[var(--color-muted)] mb-6">
        <Link href="/" className="hover:text-[var(--foreground)] transition-colors">ホーム</Link>
        <span>/</span>
        <Link href="/shop" className="hover:text-[var(--foreground)] transition-colors">商品一覧</Link>
        <span>/</span>
        <span className="text-[var(--foreground)] line-clamp-1">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
        {/* Images */}
        <div className="space-y-4">
          <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden relative">
            {product.images && product.images.length > 0 ? (
              <Image
                src={product.images[selectedImage]}
                alt={product.name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-300">
                <svg className="w-24 h-24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            )}
            {/* {siteConfig.features.membershipName}限定価格 badge */}
            {hasMemberPrice && (
              <div className="absolute top-3 left-3">
                <span
                  className="text-white text-xs font-bold px-3 py-1 rounded-full"
                  style={{ backgroundColor: 'var(--color-member)' }}
                >
                  {siteConfig.features.membershipName}限定価格
                </span>
              </div>
            )}
          </div>
          {product.images && product.images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={`w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-colors ${
                    selectedImage === i ? 'border-black' : 'border-transparent'
                  }`}
                >
                  <Image
                    src={img}
                    alt={`${product.name} ${i + 1}`}
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
            <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">
              {product.category.name}
            </p>
          )}
          {shopName && (
            <p className="text-xs text-gray-400 mb-1">{shopName}</p>
          )}
          <div className="flex items-start justify-between gap-2">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{product.name}</h1>
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
                  <svg key={star} className={`w-4 h-4 ${star <= Math.round(averageRating) ? 'text-yellow-400' : 'text-gray-200'}`} fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <span className="text-sm text-[var(--color-muted)]">
                {averageRating.toFixed(1)} ({reviewCount}件のレビュー)
              </span>
            </div>
          )}

          <div className="mt-4">
            {isInquiryOnly ? (
              <span className="text-lg font-medium text-gray-900">価格はお問い合わせください</span>
            ) : isPremiumMember && hasMemberPrice ? (
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-bold" style={{ color: 'var(--color-member)' }}>
                    {formatPrice(memberPriceVal! + optionsAdjustment, currency)}
                  </span>
                  <span
                    className="text-xs font-bold px-2 py-0.5 rounded-full"
                    style={{ backgroundColor: 'var(--color-member-bg)', color: 'var(--color-member)' }}
                  >
                    {siteConfig.features.membershipName}会員価格
                  </span>
                </div>
                <span className="text-sm text-gray-400 line-through">
                  {formatPrice(mainPrice, currency)}
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <span className="text-2xl font-bold text-gray-900">
                  {formatPrice(mainPrice + optionsAdjustment, currency)}
                </span>
                {comparePrice && comparePrice > mainPrice && (
                  <span className="text-lg text-gray-400 line-through">
                    {formatPrice(comparePrice, currency)}
                  </span>
                )}
              </div>
            )}

            {/* Show member price hint for non-premium users */}
            {!isPremiumMember && hasMemberPrice && (
              <div className="mt-2 rounded-lg px-3 py-2" style={{ backgroundColor: 'var(--color-member-bg)' }}>
                <p className="text-sm font-medium" style={{ color: 'var(--color-member-dark)' }}>
                  {siteConfig.features.membershipName}会員なら {formatPrice(memberPriceVal!, currency)}
                </p>
                <Link
                  href={siteConfig.features.membershipUrl || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs underline hover:no-underline"
                  style={{ color: 'var(--color-member)' }}
                >
                  {siteConfig.features.membershipName}に入会して会員価格で購入
                </Link>
              </div>
            )}
          </div>

          {/* Stock */}
          <div className="mt-4">
            {isMadeToOrder ? (
              <div>
                <span className="text-sm text-blue-600 font-medium">受注生産品</span>
                {product.production_time && (
                  <p className="text-xs text-gray-500 mt-1">{product.production_time}</p>
                )}
              </div>
            ) : isSoldOut ? (
              <span className="text-sm text-red-500 font-medium">在庫切れ</span>
            ) : product.stock <= 5 ? (
              <span className="text-sm text-amber-600">残りわずか（{product.stock}点）</span>
            ) : (
              <span className="text-sm text-green-600">在庫あり</span>
            )}
          </div>

          {/* Sale period */}
          {hasLimitedSale && (
            <div className="mt-3 rounded-lg px-3 py-2 bg-orange-50 border border-orange-200">
              {isBeforeSale ? (
                <p className="text-sm text-orange-700 font-medium">
                  {saleStart!.toLocaleDateString('ja-JP', { month: 'long', day: 'numeric' })} 販売開始
                </p>
              ) : isAfterSale ? (
                <p className="text-sm text-gray-500 font-medium">販売期間は終了しました</p>
              ) : (
                <p className="text-sm text-orange-700 font-medium">
                  {saleEnd!.toLocaleDateString('ja-JP', { month: 'long', day: 'numeric' })} まで期間限定販売
                </p>
              )}
            </div>
          )}

          {/* Free shipping for GUILD members */}
          {isPremiumMember && (
            <div className="mt-2">
              <span className="text-sm font-medium" style={{ color: 'var(--color-member)' }}>
                送料無料（{siteConfig.features.membershipName}会員特典）
              </span>
            </div>
          )}

          {/* Description */}
          {product.description && (
            <div className="mt-6 text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
              {product.description}
            </div>
          )}

          {/* Product Options */}
          {hasOptions && !isSoldOut && isSalePeriodActive && (
            <div className="mt-6 pt-6 border-t border-gray-100">
              <ProductOptionSelector
                options={product.product_options!}
                selectedOptions={selectedOptions}
                onOptionsChange={setSelectedOptions}
                currency={currency}
              />
              {optionsAdjustment !== 0 && (
                <div className="mt-3 flex items-center justify-between text-sm px-1">
                  <span className="text-gray-500">オプション合計</span>
                  <span className="font-medium text-gray-900">
                    +{formatPrice(optionsAdjustment, currency)}
                  </span>
                </div>
              )}
              {optionError && (
                <p className="mt-2 text-sm text-red-500">{optionError}</p>
              )}
            </div>
          )}

          {/* Inquiry button for price=0 products */}
          {isInquiryOnly && (
            <div className="mt-8">
              <Link
                href={`/contact?subject=${encodeURIComponent(`「${product.name}」について`)}`}
                className="w-full bg-black text-white py-3 rounded-full text-sm font-medium hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
              >
                <Mail className="w-4 h-4" />
                お問い合わせ・ご相談
              </Link>
              <p className="mt-2 text-xs text-gray-500 text-center">
                デザイン・価格など、お気軽にご相談ください
              </p>
            </div>
          )}

          {/* Quantity & Add to Cart */}
          {!isSoldOut && !isInquiryOnly && isSalePeriodActive && (
            <div className="mt-8 space-y-4">
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600">数量</span>
                <div className="flex items-center border border-gray-200 rounded-lg">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                    disabled={quantity <= 1}
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-12 text-center text-sm font-medium">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(isMadeToOrder ? (product.quantity_limit || 99) : product.stock, quantity + 1))}
                    className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                    disabled={quantity >= (isMadeToOrder ? (product.quantity_limit || 99) : product.stock)}
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <button
                onClick={handleAddToCart}
                className="w-full bg-black text-white py-3 rounded-full text-sm font-medium hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
              >
                <ShoppingCart className="w-4 h-4" />
                {addedToCart ? 'カートに追加しました' : 'カートに追加'}
              </button>
            </div>
          )}

          {isSoldOut && isSalePeriodActive && (
            <div className="mt-8">
              <button
                disabled
                className="w-full bg-gray-200 text-gray-400 py-3 rounded-full text-sm font-medium cursor-not-allowed"
              >
                SOLD OUT
              </button>
            </div>
          )}

          {!isSalePeriodActive && !isInquiryOnly && (
            <div className="mt-8">
              <button
                disabled
                className="w-full bg-gray-200 text-gray-400 py-3 rounded-full text-sm font-medium cursor-not-allowed"
              >
                {isBeforeSale ? '販売開始前です' : '販売期間終了'}
              </button>
            </div>
          )}

          {/* Shipping & Return Info */}
          <div className="mt-6 space-y-2.5 text-xs text-[var(--color-muted)]">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H18.75m-7.5-10.5H6.375c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>
              <span>{isPremiumMember ? '送料無料（会員特典）' : '国内送料 ¥1,000'} / 3〜5営業日でお届け</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" /></svg>
              <span>安心の品質保証 / 不良品は無料交換対応</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" /></svg>
              <span>Visa / Mastercard / Amex / JCB / 銀行振込 / JPYC</span>
            </div>
          </div>

          {/* Member CTA for non-premium members */}
          {!isPremiumMember && hasMemberPrice && (
            <div className="mt-6">
              <MemberCTA compact />
            </div>
          )}

          {/* Share */}
          <div className="mt-8 pt-6 border-t border-gray-100">
            <ShareButtons
              url={typeof window !== 'undefined' ? window.location.href : ''}
              title={product.name}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
