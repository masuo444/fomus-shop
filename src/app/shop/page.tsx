import { createClient } from '@/lib/supabase/server'
import ProductCard from '@/components/product/ProductCard'
import type { Product, Category } from '@/lib/types'
import { getPublishedShopIds } from '@/lib/shop'
import { getCurrency } from '@/lib/currency'
import Link from 'next/link'
import type { Metadata } from 'next'
import siteConfig from '@/site.config'

export const metadata: Metadata = {
  title: '商品一覧',
  description: `${siteConfig.name}の商品一覧。最新のアイテムをチェックしよう。`,
  alternates: {
    canonical: '/shop',
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
  const currency = await getCurrency()

  const shopIds = await getPublishedShopIds()

  let products: Product[] = []
  let categories: Category[] = []
  let shopNames: Record<string, string> = {}
  let productsWithOptions: Set<string> = new Set()

  // Check current user's GUILD status
  let isLoggedIn = false
  let isPremiumMember = false
  const { data: { user } } = await supabase.auth.getUser()
  if (user) {
    isLoggedIn = true
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_premium_member')
      .eq('id', user.id)
      .single()
    if (profile?.is_premium_member) {
      isPremiumMember = true
    }
  }

  if (shopIds.length > 0) {
    // Load shop names for display (only if multiple shops)
    if (shopIds.length > 1) {
      const { data: shopsData } = await supabase
        .from('shops')
        .select('id, name')
        .in('id', shopIds)
      if (shopsData) {
        shopNames = Object.fromEntries(shopsData.map((s) => [s.id, s.name]))
      }
    }

    const { data: categoriesData } = await supabase
      .from('categories')
      .select('*')
      .in('shop_id', shopIds)
      .order('sort_order')

    const excludeCategories = ['撮影', 'イベント']
    categories = (categoriesData || []).filter((c) => !excludeCategories.includes(c.name))

    let query = supabase
      .from('products')
      .select('*')
      .in('shop_id', shopIds)
      .eq('is_published', true)
      .eq('item_type', 'physical')

    if (params.category) {
      query = query.eq('category_id', params.category)
    }

    switch (params.sort) {
      case 'price_asc':
        query = query.order('price', { ascending: true })
        break
      case 'price_desc':
        query = query.order('price', { ascending: false })
        break
      case 'oldest':
        query = query.order('created_at', { ascending: true })
        break
      default:
        query = query.order('created_at', { ascending: false })
    }

    const { data: productsData } = await query
    products = productsData || []

    // Check which products have required options (for quick-add vs detail-page)
    if (products.length > 0) {
      const productIds = products.map(p => p.id)
      const { data: optionsData } = await supabase
        .from('product_options')
        .select('product_id')
        .in('product_id', productIds)
        .eq('required', true)
      if (optionsData) {
        const idsWithOptions = new Set(optionsData.map(o => o.product_id))
        productsWithOptions = idsWithOptions
      }
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
          すべて
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
            {cat.name}
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

      {/* Products Grid */}
      {products.length > 0 ? (
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
      ) : (
        <div className="text-center py-24">
          <p className="text-gray-400">商品がありません</p>
        </div>
      )}
    </div>
  )
}
