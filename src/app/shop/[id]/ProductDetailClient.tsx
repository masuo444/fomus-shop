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
import { createClient } from '@/lib/supabase/client'
import siteConfig from '@/site.config'
import { useCurrency } from '@/hooks/useCurrency'

export default function ProductDetailClient({ product, shopName }: { product: Product; shopName?: string }) {
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
  const isSoldOut = product.stock === 0
  const isInquiryOnly = mainPrice === 0
  const hasMemberPrice = memberPriceVal != null && memberPriceVal < mainPrice
  const hasOptions = product.product_options && product.product_options.length > 0

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

      <Link
        href="/shop"
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900 mb-6 transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
        商品一覧に戻る
      </Link>

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
            {isSoldOut ? (
              <span className="text-sm text-red-500 font-medium">在庫切れ</span>
            ) : product.stock <= 5 ? (
              <span className="text-sm text-amber-600">残りわずか（{product.stock}点）</span>
            ) : (
              <span className="text-sm text-green-600">在庫あり</span>
            )}
          </div>

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
          {hasOptions && !isSoldOut && (
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
          {!isSoldOut && !isInquiryOnly && (
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
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                    disabled={quantity >= product.stock}
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

          {isSoldOut && (
            <div className="mt-8">
              <button
                disabled
                className="w-full bg-gray-200 text-gray-400 py-3 rounded-full text-sm font-medium cursor-not-allowed"
              >
                SOLD OUT
              </button>
            </div>
          )}

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
