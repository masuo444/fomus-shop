import { createClient } from '@/lib/supabase/server'
import ProductCard from '@/components/product/ProductCard'
import type { Product, Category } from '@/lib/types'
import { getPublishedShopIds } from '@/lib/shop'
import { getCurrency } from '@/lib/currency'
import Link from 'next/link'
import type { Metadata } from 'next'
import siteConfig from '@/site.config'
import { ItemListJsonLd, BreadcrumbJsonLd } from '@/components/seo/JsonLd'

export const metadata: Metadata = {
  title: '商品一覧',
  description: `${siteConfig.name}の商品一覧。最新のアイテムをチェックしよう。`,
  alternates: {
    canonical: '/shop',
    languages: { ja: '/shop', en: '/en/shop' },
  },
}

interface ShopPageProps {
  searchParams: Promise<{
    category?: string
    sort?: string
  }>
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const params = await searchParams
  const supabase = await createClient()

  // 独立したクエリを並列実行
  const [{ data: { user } }, currency, shopIds] = await Promise.all([
    supabase.auth.getUser(),
    getCurrency(),
    getPublishedShopIds(),
  ])

  let products: Product[] = []
  let categories: Category[] = []
  let shopNames: Record<string, string> = {}
  let productsWithOptions: Set<string> = new Set()
  let categoryCounts: Record<string, number> = {}
  let totalCount = 0
  let isLoggedIn = false
  let isPremiumMember = false

  // 認証チェックとショップデータを並列実行
  const authPromise = user
    ? supabase.from('profiles').select('is_premium_member').eq('id', user.id).single()
    : Promise.resolve({ data: null })

  let productQuery = supabase
    .from('products')
    .select('*')
    .in('shop_id', shopIds)
    .eq('is_published', true)
    .eq('item_type', 'physical')
    .eq('hidden_from_listing', false)

  if (params.category) productQuery = productQuery.eq('category_id', params.category)
  switch (params.sort) {
    case 'price_asc': productQuery = productQuery.order('price', { ascending: true }); break
    case 'price_desc': productQuery = productQuery.order('price', { ascending: false }); break
    case 'oldest': productQuery = productQuery.order('created_at', { ascending: true }); break
    default: productQuery = productQuery.order('sort_order', { ascending: true }).order('created_at', { ascending: false })
  }

  if (shopIds.length > 0) {
    const [
      { data: profile },
      { data: categoriesData },
      { data: allProductCounts },
      { data: productsData },
      { data: shopsData },
    ] = await Promise.all([
      authPromise,
      supabase.from('categories').select('*').in('shop_id', shopIds).order('sort_order'),
      supabase.from('products').select('id, category_id').in('shop_id', shopIds).eq('is_published', true).eq('item_type', 'physical').eq('hidden_from_listing', false),
      productQuery,
      shopIds.length > 1
        ? supabase.from('shops').select('id, name').in('id', shopIds)
        : Promise.resolve({ data: null }),
    ])

    if (user) {
      isLoggedIn = true
      if (profile?.is_premium_member) isPremiumMember = true
    }

    if (shopsData) shopNames = Object.fromEntries(shopsData.map((s: any) => [s.id, s.name]))

    const excludeCategories = ['撮影', 'イベント']
    categories = (categoriesData || []).filter((c: any) => !excludeCategories.includes(c.name))

    if (allProductCounts) {
      totalCount = allProductCounts.length
      for (const p of allProductCounts) {
        if (p.category_id) categoryCounts[p.category_id] = (categoryCounts[p.category_id] || 0) + 1
      }
    }

    products = productsData || []

    // オプション確認（商品取得後）
    if (products.length > 0) {
      const { data: optionsData } = await supabase
        .from('product_options')
        .select('product_id')
        .in('product_id', products.map(p => p.id))
        .eq('required', true)
      if (optionsData) productsWithOptions = new Set(optionsData.map((o: any) => o.product_id))
    }
  } else {
    const { data: profile } = await authPromise
    if (user) { isLoggedIn = true; if (profile?.is_premium_member) isPremiumMember = true }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <BreadcrumbJsonLd items={[
        { name: 'ホーム', href: '/' },
        { name: '商品一覧', href: '/shop' },
      ]} />
      <ItemListJsonLd
        name={`${siteConfig.name} 商品一覧`}
        items={products.slice(0, 20).map((p, i) => ({
          name: p.name,
          url: `${process.env.NEXT_PUBLIC_BASE_URL || ''}/shop/${p.slug || p.id}`,
          image: p.images?.[0],
          position: i + 1,
        }))}
      />
      <h1 className="text-2xl font-bold text-gray-900 mb-8">商品一覧</h1>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-8">
        <Link
          href="/shop"
          className={`text-sm px-4 py-2 rounded-full border transition-colors ${
            !params.category
              ? 'bg-black text-white border-black'
              : 'border-gray-200 text-gray-600 hover:border-gray-400'
          }`}
        >
          すべて{totalCount > 0 && <span className="ml-1 opacity-60">({totalCount})</span>}
        </Link>
        {categories.map((cat) => (
          <Link
            key={cat.id}
            href={`/shop?category=${cat.id}${params.sort ? `&sort=${params.sort}` : ''}`}
            className={`text-sm px-4 py-2 rounded-full border transition-colors ${
              params.category === cat.id
                ? 'bg-black text-white border-black'
                : 'border-gray-200 text-gray-600 hover:border-gray-400'
            }`}
          >
            {cat.name}{categoryCounts[cat.id] > 0 && <span className="ml-1 opacity-60">({categoryCounts[cat.id]})</span>}
          </Link>
        ))}

        <div className="ml-auto flex items-center gap-2">
          <span className="text-xs text-gray-400">並び替え:</span>
          {[
            { value: 'newest', label: '新着順' },
            { value: 'price_asc', label: '安い順' },
            { value: 'price_desc', label: '高い順' },
          ].map((sort) => (
            <Link
              key={sort.value}
              href={`/shop?${params.category ? `category=${params.category}&` : ''}sort=${sort.value}`}
              className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                params.sort === sort.value || (!params.sort && sort.value === 'newest')
                  ? 'bg-black text-white border-black'
                  : 'border-gray-200 text-gray-500 hover:border-gray-400'
              }`}
            >
              {sort.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Products */}
      {products.length > 0 ? (
        !params.category && !params.sort ? (
          /* Category-grouped view (default) */
          <div className="space-y-16">
            {categories.filter(c => categoryCounts[c.id] > 0).map((cat) => {
              const catProducts = products.filter(p => p.category_id === cat.id)
              if (catProducts.length === 0) return null
              return (
                <section key={cat.id}>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-medium text-[var(--foreground)]">{cat.name}</h2>
                    <Link
                      href={`/shop?category=${cat.id}`}
                      className="text-xs text-[var(--color-muted)] hover:text-[var(--foreground)] transition-colors"
                    >
                      すべて見る ({catProducts.length})
                    </Link>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
                    {catProducts.map((product) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        shopName={shopNames[product.shop_id]}
                        isLoggedIn={isLoggedIn}
                        isPremiumMember={isPremiumMember}
                        currency={currency}
                        hasOptions={productsWithOptions.has(product.id)}
                      />
                    ))}
                  </div>
                </section>
              )
            })}
            {/* Uncategorized products */}
            {(() => {
              const uncategorized = products.filter(p => !p.category_id)
              if (uncategorized.length === 0) return null
              return (
                <section>
                  <h2 className="text-lg font-medium text-[var(--foreground)] mb-6">その他</h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
                    {uncategorized.map((product) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        shopName={shopNames[product.shop_id]}
                        isLoggedIn={isLoggedIn}
                        isPremiumMember={isPremiumMember}
                        currency={currency}
                        hasOptions={productsWithOptions.has(product.id)}
                      />
                    ))}
                  </div>
                </section>
              )
            })()}
          </div>
        ) : (
          /* Flat grid view (filtered/sorted) */
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                shopName={shopNames[product.shop_id]}
                isLoggedIn={isLoggedIn}
                isPremiumMember={isPremiumMember}
                currency={currency}
                hasOptions={productsWithOptions.has(product.id)}
              />
            ))}
          </div>
        )
      ) : (
        <div className="text-center py-24">
          <p className="text-gray-400">商品がありません</p>
        </div>
      )}
    </div>
  )
}
