import { createClient as createAnonClient } from '@supabase/supabase-js'
import { notFound, redirect } from 'next/navigation'
import type { Product } from '@/lib/types'
import type { Metadata } from 'next'
import ProductDetailClient from './ProductDetailClient'
import ProductReviews from '@/components/product/ProductReviews'
import type { ProductReview } from '@/components/product/ProductReviews'
import ProductCard from '@/components/product/ProductCard'
import KachiuProductCard from '@/components/kachiu/KachiuProductCard'
import { ProductJsonLd, BreadcrumbJsonLd } from '@/components/seo/JsonLd'
import RecentlyViewed from '@/components/product/RecentlyViewed'
import MasuStorySection from '@/components/product/MasuStorySection'
import siteConfig from '@/site.config'

// cookies()を使わないanon clientで全クエリを実行 → ISRキャッシュが有効になる
function getSupabase() {
  return createAnonClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

export const revalidate = 86400

interface Props {
  params: Promise<{ id: string }>
}

export async function generateStaticParams() {
  const { data } = await getSupabase()
    .from('products')
    .select('id, slug')
    .eq('is_published', true)
  return (data || []).map((p) => ({ id: p.slug || p.id }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)
  const { data: product } = await getSupabase()
    .from('products')
    .select('name, description, images, slug')
    .eq(isUuid ? 'id' : 'slug', id)
    .single()

  const title = product?.name || '商品詳細'
  const description = product?.description || siteConfig.description
  const slug = product?.slug || id

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXT_PUBLIC_SITE_URL || 'https://shop.fomus.jp'
  const ogImage = `${baseUrl}/api/og?id=${slug}`

  return {
    title,
    description,
    alternates: {
      canonical: `/shop/${slug}`,
      languages: { ja: `/shop/${slug}`, en: `/en/shop/${slug}` },
    },
    openGraph: {
      title: `${title} — ${siteConfig.name}`,
      description,
      url: `${baseUrl}/shop/${slug}`,
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
  const supabase = getSupabase()

  // Phase 1: product fetch（UUID or slug で分岐）
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)
  const { data: product } = await supabase
    .from('products')
    .select('*, category:categories(*), product_options(*, choices:product_option_choices(*))')
    .eq(isUuid ? 'id' : 'slug', id)
    .eq('is_published', true)
    .single()

  if (!product) {
    notFound()
  }

  const p = product as Product

  // UUIDでアクセスされてslugがある場合はslugにリダイレクト
  if (isUuid && p.slug) {
    redirect(`/shop/${p.slug}`)
  }

  // Phase 2: shop / reviews / related products in parallel
  const fetchRelated = async (): Promise<Product[]> => {
    // 関連商品は自ブランドのショップのみ（他ブランドの商品を混ぜない）
    const { data: platformShops } = await supabase
      .from('shops')
      .select('id')
      .eq('platform', siteConfig.defaultShopSlug)
    const { data } = await supabase
      .from('products')
      .select('*')
      .eq('is_published', true)
      .neq('id', p.id)
      .gt('price', 0)
      .in('shop_id', (platformShops || []).map((s) => s.id))
      .order('sort_order', { ascending: true })
    const all = (data || []) as Product[]
    // Hidden (direct-link only) products may appear only among their own category,
    // and only when the current product is itself hidden (e.g. KUMIKI → KUMIKI)
    const visible = all.filter((r) =>
      !r.hidden_from_listing ||
      (p.hidden_from_listing && p.category_id != null && r.category_id === p.category_id)
    )
    // Same-category products first (e.g. KUMIKI jewelry shows KUMIKI, not ¥2,200 masu)
    const sameCategory = p.category_id ? visible.filter((r) => r.category_id === p.category_id) : []
    const rest = visible.filter((r) => !sameCategory.some((s) => s.id === r.id))
    const masu = rest.filter((r) => r.name.includes('枡'))
    const others = rest.filter((r) => !r.name.includes('枡'))
    return [...sameCategory, ...masu, ...others].slice(0, 4)
  }

  const [{ data: shop }, { data: reviewsData }, relatedProducts] = await Promise.all([
    supabase.from('shops').select('name, slug, platform').eq('id', p.shop_id).single(),
    supabase
      .from('product_reviews')
      .select('id, reviewer_name, rating, title, body, verified_purchase, created_at')
      .eq('product_id', id)
      .eq('is_published', true)
      .order('created_at', { ascending: false }),
    fetchRelated(),
  ])

  // 他ブランドの商品はID直打ちでも表示しない
  if (!shop || shop.platform !== siteConfig.defaultShopSlug) {
    notFound()
  }

  const shopName = shop.slug !== siteConfig.defaultShopSlug ? shop.name : undefined

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
        url={`/shop/${p.slug || p.id}`}
        inStock={p.stock !== 0}
        sku={p.id}
        brand={siteConfig.name}
        aggregateRating={reviewCount > 0 ? {
          ratingValue: Math.round(averageRating * 10) / 10,
          reviewCount,
        } : undefined}
      />
      <BreadcrumbJsonLd items={[
        { name: 'ホーム', href: '/' },
        { name: '商品一覧', href: '/shop' },
        { name: p.name, href: `/shop/${p.slug || p.id}` },
      ]} />
      <ProductDetailClient product={p} shopName={shopName} reviewCount={reviewCount} averageRating={averageRating} />
      <MasuStorySection product={p} locale="ja" />
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <ProductReviews reviews={reviews} />
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="border-t border-[var(--color-border)] pt-12">
            <h2 className="text-lg font-medium text-[var(--foreground)] mb-8">関連商品</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
              {relatedProducts.map((rp, i) => (
                siteConfig.defaultShopSlug === 'kachiu'
                  ? <KachiuProductCard key={rp.id} product={rp} index={i} />
                  : <ProductCard key={rp.id} product={rp} currency="jpy" />
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
