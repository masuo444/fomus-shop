import Link from 'next/link'
import Image from 'next/image'
import { formatPrice } from '@/lib/utils'
import type { Product } from '@/lib/types'
import FavoriteButton from '@/components/product/FavoriteButton'
import siteConfig from '@/site.config'

interface ProductCardProps {
  product: Product
  shopName?: string
  isLoggedIn?: boolean
  isPremiumMember?: boolean
  isFavorited?: boolean
  currency?: 'jpy' | 'eur'
}

export default function ProductCard({ product, shopName, isLoggedIn, isPremiumMember, isFavorited, currency = 'jpy' }: ProductCardProps) {
  const isSoldOut = product.stock === 0

  // Determine prices based on currency
  const isEur = currency === 'eur'
  const mainPrice = isEur ? (product.price_eur ?? product.price) : product.price
  const memberPriceVal = isEur ? (product.member_price_eur ?? null) : product.member_price
  const comparePrice = isEur ? (product.compare_at_price_eur ?? null) : product.compare_at_price
  const hasMemberPrice = memberPriceVal != null && memberPriceVal < mainPrice

  // If EUR and no EUR price, don't render card
  if (isEur && product.price_eur == null) return null

  return (
    <div className="group relative card-hover rounded-xl">
      {/* Favorite Button */}
      <div className="absolute top-3 right-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <FavoriteButton
          productId={product.id}
          initialFavorited={isFavorited}
          size="sm"
        />
      </div>

      <Link href={`/shop/${product.id}`} className="block">
        <div className="relative aspect-square bg-[var(--color-subtle)] overflow-hidden rounded-xl">
          {product.images && product.images.length > 0 ? (
            <Image
              src={product.images[0]}
              alt={product.name}
              fill
              className="object-cover img-hover"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[var(--color-muted)]">
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={0.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
          {/* Hover overlay */}
          {!isSoldOut && (
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-500 flex items-center justify-center">
              <span className="opacity-0 group-hover:opacity-100 transition-all duration-300 bg-white text-[var(--foreground)] text-[10px] tracking-[0.15em] uppercase font-medium px-5 py-2 rounded-full translate-y-2 group-hover:translate-y-0">
                View
              </span>
            </div>
          )}
          {isSoldOut && (
            <div className="absolute inset-0 bg-[var(--foreground)]/40 flex items-center justify-center">
              <span className="text-[10px] tracking-[0.2em] uppercase text-white font-medium">
                Sold Out
              </span>
            </div>
          )}
          {comparePrice && comparePrice > mainPrice && (
            <div className="absolute top-3 left-3">
              <span className="bg-[var(--foreground)] text-[var(--background)] text-[9px] tracking-[0.15em] uppercase font-medium px-2.5 py-1 rounded-full">
                Sale
              </span>
            </div>
          )}
          {hasMemberPrice && (
            <div className={`absolute ${comparePrice && comparePrice > mainPrice ? 'top-9' : 'top-3'} left-3`}>
              <span
                className="text-white text-[9px] tracking-wider font-medium px-2.5 py-1 rounded-full"
                style={{ backgroundColor: 'var(--color-member)' }}
              >
                {siteConfig.features.membershipName}
              </span>
            </div>
          )}
        </div>
        <div className="mt-4">
          {shopName && (
            <p className="text-[9px] tracking-[0.15em] uppercase text-[var(--color-muted)] mb-1">{shopName}</p>
          )}
          <h3 className="text-xs leading-relaxed text-[var(--foreground)] group-hover:text-[var(--color-muted)] transition-colors duration-300 line-clamp-2">
            {product.name}
          </h3>
          <div className="mt-2">
            {mainPrice === 0 ? (
              <span className="text-xs tracking-wide text-[var(--color-muted)]">
                価格はお問い合わせ
              </span>
            ) : isPremiumMember && hasMemberPrice ? (
              <div className="flex items-center gap-2.5">
                <span className="text-xs tracking-wide" style={{ color: 'var(--color-member)' }}>
                  {formatPrice(memberPriceVal!, currency)}
                </span>
                <span className="text-[10px] text-[var(--color-muted)] line-through">
                  {formatPrice(mainPrice, currency)}
                </span>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-2.5">
                  <span className="text-xs tracking-wide text-[var(--foreground)]">
                    {formatPrice(mainPrice, currency)}
                  </span>
                  {comparePrice && comparePrice > mainPrice && (
                    <span className="text-[10px] text-[var(--color-muted)] line-through">
                      {formatPrice(comparePrice, currency)}
                    </span>
                  )}
                </div>
                {hasMemberPrice && (
                  <div className="mt-1">
                    <span className="text-[10px] tracking-wide" style={{ color: 'var(--color-member)' }}>
                      {siteConfig.features.membershipName} {formatPrice(memberPriceVal!, currency)}
                    </span>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </Link>
    </div>
  )
}
