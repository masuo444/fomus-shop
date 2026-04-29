import { createClient } from '@/lib/supabase/server'
import { createClient as createAnonClient } from '@supabase/supabase-js'
import { notFound } from 'next/navigation'
import type { Product } from '@/lib/types'
import type { Metadata } from 'next'
import ProductDetailClient from './ProductDetailClient'
import ProductReviews from '@/components/product/ProductReviews'
import type { ProductReview } from '@/components/product/ProductReviews'
import ProductCard from '@/components/product/ProductCard'
import { ProductJsonLd, BreadcrumbJsonLd } from '@/components/seo/JsonLd'
import { getPublishedShopIds } from '@/lib/shop'
import { getCurrency } from '@/lib/currency'
import RecentlyViewed from '@/components/product/RecentlyViewed'
import siteConfig from '@/site.config'

export const revalidate = 3600

interface Props {
  params: Promise<{ id: string }>
}

export async function generateStaticParams() {
  const supabase = createAnonClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  const { data } = await supabase
    .from('products')
    .select('id')
    .eq('is_published', true)
  return (data || []).map((p) => ({ id: p.id }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const supabase = await createClient()
  const { data: product } = await supabase
    .from('products')
    .select('name, description, images')
    .eq('id', id)
    .single()

  const title = product?.name || '商品詳細'
  const description = product?.description || siteConfig.description
  const imageUrl = product?.images?.[0] || undefined

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXT_PUBLIC_SITE_URL || 'https://shop.fomus.jp'
  const ogImage = `${baseUrl}/api/og?id=${id}`

  return {
    title,
    description,
    alternates: {
      canonical: `/shop/${id}`,
    },
    openGraph: {
      title: `${title} — ${siteConfig.name}`,
      description,
      url: `${baseUrl}/shop/${id}`,
      siteName: siteConfig.name,
      images: [{ url: ogImage, width: 1200, height: 630 }],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} — ${siteConfig.name}`,
      description,
      images: [ogImage],
    },
  }
}

export default async function ProductDetailPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  // Phase 1: product + currency in parallel
  const [{ data: product }, currency] = await Promise.all([
    supabase
      .from('products')
      .select('*, category:categories(*), product_options(*, choices:product_option_choices(*))')
      .eq('id', id)
      .eq('is_published', true)
      .single(),
    getCurrency(),
  ])

  if (!product) {
    notFound()
  }

  const p = product as Product

  // Phase 2: shop / reviews / related products in parallel
  const fetchRelated = async (): Promise<Product[]> => {
    if (p.hidden_from_listing) {
      const { data } = await supabase
        .from('products')
        .select('*')
        .eq('shop_id', p.shop_id)
        .eq('is_published', true)
        .eq('hidden_from_listing', true)
        .neq('id', id)
        .order('price', { ascending: true })
        .limit(4)
      return (data || []) as Product[]
    }
    const shopIds = await getPublishedShopIds()
    if (shopIds.length === 0) return []
    const { data } = await supabase
      .from('products')
      .select('*')
      .in('shop_id', shopIds)
      .eq('is_published', true)
      .eq('item_type', 'physical')
      .neq('id', id)
      .gt('price', 0)
      .order('price', { ascending: true })
    const all = (data || []) as Product[]
    const masu = all.filter((p) => p.name.includes('枡'))
    const others = all.filter((p) => !p.name.includes('枡'))
    return [...masu, ...others].slice(0, 4)
  }

  const [{ data: shop }, { data: reviewsData }, relatedProducts] = await Promise.all([
    supabase.from('shops').select('name, slug').eq('id', p.shop_id).single(),
    supabase
      .from('product_reviews')
      .select('id, reviewer_name, rating, title, body, verified_purchase, created_at')
      .eq('product_id', id)
      .eq('is_published', true)
      .order('created_at', { ascending: false }),
    fetchRelated(),
  ])

  const shopName = shop && shop.slug !== 'fomus' ? shop.name : undefined

  const reviews: ProductReview[] = (reviewsData || []) as ProductReview[]
  const reviewCount = reviews.length
  const averageRating = reviewCount > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount
    : 0

  return (
    <>
      <ProductJsonLd
        name={p.name}
        description={p.description || siteConfig.description}
        price={p.price}
        currency="JPY"
        image={p.images?.[0]}
        url={`/shop/${p.id}`}
        inStock={p.stock !== 0}
        sku={p.id}
        brand="FOMUS"
        aggregateRating={reviewCount > 0 ? {
          ratingValue: Math.round(averageRating * 10) / 10,
          reviewCount,
        } : undefined}
      />
      <BreadcrumbJsonLd items={[
        { name: 'ホーム', href: '/' },
        { name: '商品一覧', href: '/shop' },
        { name: p.name, href: `/shop/${p.id}` },
      ]} />
      <ProductDetailClient product={p} shopName={shopName} reviewCount={reviewCount} averageRating={averageRating} />
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <ProductReviews reviews={reviews} />
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="border-t border-[var(--color-border)] pt-12">
            <h2 className="text-lg font-medium text-[var(--foreground)] mb-8">関連商品</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
              {relatedProducts.map((rp) => (
                <ProductCard key={rp.id} product={rp} currency={currency} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Recently Viewed */}
      <RecentlyViewed excludeId={id} />
    </>
  )
}
