import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import ProductCard from '@/components/product/ProductCard'
import type { Product, DigitalItem } from '@/lib/types'
import { formatPrice } from '@/lib/utils'
import { getPublishedShopIds } from '@/lib/shop'
import { getCurrency } from '@/lib/currency'
import siteConfig from '@/site.config'

export default async function HomePage() {
  const supabase = await createClient()
  const currency = await getCurrency()

  const shopIds = await getPublishedShopIds()

  let products: Product[] = []
  let digitalItems: DigitalItem[] = []

  if (shopIds.length > 0) {
    const { data: productsData } = await supabase
      .from('products')
      .select('*')
      .in('shop_id', shopIds)
      .eq('is_published', true)
      .eq('item_type', 'physical')
      .order('created_at', { ascending: false })
      .limit(8)

    products = productsData || []

    const { data: digitalData } = await supabase
      .from('digital_items')
      .select('*')
      .in('shop_id', shopIds)
      .eq('is_published', true)
      .order('created_at', { ascending: false })
      .limit(4)

    digitalItems = digitalData || []
  }

  return (
    <div>
      {/* Hero */}
      <section className="relative bg-[var(--foreground)]">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 py-32 md:py-44">
          <div className="max-w-xl">
            <p className="text-[10px] tracking-[0.3em] uppercase text-white/30 mb-6">
              Welcome to
            </p>
            <h1 className="font-display text-5xl md:text-7xl font-light tracking-wide text-white">
              {siteConfig.name}
            </h1>
            <p className="mt-6 text-sm leading-relaxed text-white/40 max-w-md">
              {siteConfig.description}
            </p>
            <div className="mt-12 flex gap-5">
              <Link
                href="/shop"
                className="btn-primary inline-block"
                style={{ background: '#FAF8F5', color: '#1A1A1A' }}
              >
                SHOP NOW
              </Link>
              <Link
                href="/digital"
                className="btn-outline inline-block"
                style={{ borderColor: 'rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.7)' }}
              >
                DIGITAL
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      {products.length > 0 && (
        <section className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 py-20 md:py-28">
          <div className="flex items-end justify-between mb-12">
            <div>
              <p className="text-[10px] tracking-[0.3em] uppercase text-[var(--color-muted)] mb-3">Collection</p>
              <h2 className="font-display text-3xl md:text-4xl font-light text-[var(--foreground)]">New Arrivals</h2>
            </div>
            <Link href="/shop" className="text-xs tracking-[0.1em] text-[var(--color-muted)] hover:text-[var(--foreground)] transition-colors border-b border-[var(--color-border)] pb-0.5">
              View All
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5 md:gap-8">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} currency={currency} />
            ))}
          </div>
        </section>
      )}

      {/* Divider */}
      {products.length > 0 && digitalItems.length > 0 && (
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
          <div className="divider" />
        </div>
      )}

      {/* Digital Items */}
      {digitalItems.length > 0 && (
        <section className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 py-20 md:py-28">
          <div className="flex items-end justify-between mb-12">
            <div>
              <p className="text-[10px] tracking-[0.3em] uppercase text-[var(--color-muted)] mb-3">Digital</p>
              <h2 className="font-display text-3xl md:text-4xl font-light text-[var(--foreground)]">Digital Collection</h2>
            </div>
            <Link href="/digital" className="text-xs tracking-[0.1em] text-[var(--color-muted)] hover:text-[var(--foreground)] transition-colors border-b border-[var(--color-border)] pb-0.5">
              View All
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5 md:gap-8">
            {digitalItems.map((item) => (
              <Link key={item.id} href={`/digital/${item.id}`} className="group block">
                <div className="relative aspect-square bg-[var(--color-subtle)] overflow-hidden">
                  {item.image_url ? (
                    <img
                      src={item.image_url}
                      alt={item.name}
                      className="w-full h-full object-cover img-hover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[var(--color-muted)]">
                      <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={0.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                      </svg>
                    </div>
                  )}
                  {item.issued_count >= item.total_supply && (
                    <div className="absolute inset-0 bg-[var(--foreground)]/50 flex items-center justify-center">
                      <span className="text-[10px] tracking-[0.2em] uppercase text-white font-medium">Sold Out</span>
                    </div>
                  )}
                </div>
                <div className="mt-4">
                  <h3 className="text-xs text-[var(--foreground)] group-hover:text-[var(--color-muted)] transition-colors line-clamp-2 leading-relaxed">
                    {item.name}
                  </h3>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-xs tracking-wide">{formatPrice(item.price)}</span>
                    <span className="text-[9px] text-[var(--color-muted)]">
                      {item.issued_count}/{item.total_supply}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Empty state */}
      {products.length === 0 && digitalItems.length === 0 && (
        <section className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 py-32 text-center">
          <p className="text-sm text-[var(--color-muted)] tracking-wide">Coming Soon</p>
        </section>
      )}
    </div>
  )
}
