import Link from 'next/link'
import ProductCard from '@/components/product/ProductCard'
import type { Product } from '@/lib/types'
import siteConfig from '@/site.config'

// Neutral home page for non-FOMUS brand deployments (FEATURE_BRAND_PAGES=false).
// Brand-specific home sections should replace this once the brand's design is ready.
export default function GenericHome({
  newProducts,
  currency,
  isLoggedIn,
  isPremiumMember,
}: {
  newProducts: Product[]
  currency: 'jpy' | 'eur'
  isLoggedIn: boolean
  isPremiumMember: boolean
}) {
  return (
    <div>
      {/* Hero */}
      <section className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 py-24 md:py-40">
        <p className="text-[10px] tracking-[0.25em] uppercase text-[var(--color-muted)] mb-6">Official Online Shop</p>
        <h1 className="text-4xl md:text-6xl font-light tracking-[0.1em] text-[var(--foreground)]">
          {siteConfig.name.toUpperCase()}
        </h1>
        <p className="mt-6 text-xs leading-[2.2] text-[var(--color-muted)] max-w-md whitespace-pre-line">
          {siteConfig.description}
        </p>
        <Link href="/shop" className="btn-outline inline-flex items-center gap-3 mt-10">
          商品を見る
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
        </Link>
      </section>

      {/* New arrivals */}
      {newProducts.length > 0 && (
        <section className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 pb-24 md:pb-32">
          <div className="flex items-end justify-between mb-10">
            <h2 className="text-[10px] tracking-[0.25em] uppercase text-[var(--color-muted)]">New Arrivals</h2>
            <Link href="/shop" className="text-xs text-[var(--color-muted)] hover:text-[var(--foreground)] transition-colors">
              すべて見る →
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {newProducts.map((product) => (
              <ProductCard key={product.id} product={product} currency={currency} isLoggedIn={isLoggedIn} isPremiumMember={isPremiumMember} />
            ))}
          </div>
        </section>
      )}

      {/* Contact */}
      <section className="border-t border-[var(--color-border)]">
        <div className="max-w-3xl mx-auto px-6 sm:px-8 lg:px-10 py-16 md:py-20 text-center">
          <p className="text-xs leading-[2.2] text-[var(--color-muted)] mb-8">
            商品についてのご質問・ご相談は、お気軽にお問い合わせください。
          </p>
          <Link href="/contact" className="btn-outline inline-flex items-center gap-3">
            お問い合わせ
          </Link>
        </div>
      </section>
    </div>
  )
}
