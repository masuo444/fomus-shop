import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getPublishedShopIds } from '@/lib/shop'
import type { DigitalItem } from '@/lib/types'
import { DIGITAL_ITEM_CATEGORIES } from '@/lib/types'
import { formatPrice } from '@/lib/utils'
import siteConfig from '@/site.config'

interface MarketPageProps {
  searchParams: Promise<{
    category?: string
  }>
}

export default async function MarketPage({ searchParams }: MarketPageProps) {
  const params = await searchParams
  const supabase = await createClient()
  const shopIds = await getPublishedShopIds()
  const mpName = siteConfig.features.marketplaceName

  let items: DigitalItem[] = []
  let resaleListings: any[] = []

  if (shopIds.length > 0) {
    // Fetch primary market items
    let query = supabase
      .from('digital_items')
      .select('*')
      .in('shop_id', shopIds)
      .eq('is_published', true)
      .order('created_at', { ascending: false })

    if (params.category && params.category !== 'all') {
      query = query.eq('item_category', params.category)
    }

    const { data } = await query
    items = (data || []) as DigitalItem[]

    // Fetch resale listings
    const { data: listings } = await supabase
      .from('resale_listings')
      .select(`
        *,
        digital_token:digital_tokens(
          token_number,
          digital_item:digital_items(*)
        ),
        seller:profiles(id, name)
      `)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(12)

    resaleListings = listings || []
  }

  const categories = Object.entries(DIGITAL_ITEM_CATEGORIES)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Hero */}
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">{mpName}</h1>
        <p className="text-gray-500 mt-2">デジタルアイテム・チケットのマーケットプレイス</p>
      </div>

      {/* Category filters */}
      <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
        <Link
          href="/market"
          className={`text-sm px-4 py-2 rounded-full border transition-colors ${
            !params.category || params.category === 'all'
              ? 'bg-gray-900 text-white border-gray-900'
              : 'border-gray-200 text-gray-600 hover:border-gray-400'
          }`}
        >
          すべて
        </Link>
        {categories.map(([key, label]) => (
          <Link
            key={key}
            href={`/market?category=${key}`}
            className={`text-sm px-4 py-2 rounded-full border transition-colors ${
              params.category === key
                ? 'bg-gray-900 text-white border-gray-900'
                : 'border-gray-200 text-gray-600 hover:border-gray-400'
            }`}
          >
            {label}
          </Link>
        ))}
      </div>

      {/* New Items */}
      {items.length > 0 && (
        <section className="mb-16">
          <h2 className="text-lg font-bold text-gray-900 mb-6">新着アイテム</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {items.map((item) => {
              const isSoldOut = item.issued_count >= item.total_supply
              const remaining = item.total_supply - item.issued_count
              return (
                <Link key={item.id} href={`/digital/${item.id}`} className="group block">
                  <div className="relative aspect-square bg-gray-100 rounded-xl overflow-hidden">
                    {item.image_url ? (
                      <img
                        src={item.image_url}
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-200 text-gray-300">
                        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                        </svg>
                      </div>
                    )}
                    {!isSoldOut && (
                      <div className="absolute top-2.5 left-2.5 bg-black/70 backdrop-blur-sm text-white text-[10px] font-medium px-2.5 py-1 rounded-full">
                        残り {remaining}
                      </div>
                    )}
                    {isSoldOut && (
                      <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px] flex items-center justify-center">
                        <span className="bg-white text-black text-xs font-bold px-4 py-1.5 rounded-full">SOLD OUT</span>
                      </div>
                    )}
                    <div className="absolute top-2.5 right-2.5 bg-white/90 backdrop-blur-sm text-[10px] text-gray-600 px-2 py-0.5 rounded-full">
                      {DIGITAL_ITEM_CATEGORIES[item.item_category]}
                    </div>
                  </div>
                  <div className="mt-3">
                    <h3 className="text-sm font-medium text-gray-900 group-hover:text-gray-600 transition-colors line-clamp-2">{item.name}</h3>
                    <div className="mt-1.5 flex items-center justify-between">
                      <span className="text-sm font-bold text-gray-900">{formatPrice(item.price)}</span>
                      <span className="text-[10px] text-gray-400">{item.issued_count}/{item.total_supply}</span>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </section>
      )}

      {/* Resale Listings */}
      {resaleListings.length > 0 && (
        <section className="mb-16">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-gray-900">リセール</h2>
            <Link href="/digital/marketplace" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
              すべて見る →
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {resaleListings.map((listing: any) => {
              const item = listing.digital_token?.digital_item
              if (!item) return null
              return (
                <Link key={listing.id} href="/digital/marketplace" className="group block">
                  <div className="relative aspect-square bg-gray-100 rounded-xl overflow-hidden">
                    {item.image_url ? (
                      <img src={item.image_url} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-200 text-gray-300">
                        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                    <div className="absolute top-2.5 left-2.5 bg-blue-600/90 text-white text-[10px] font-medium px-2.5 py-1 rounded-full">
                      リセール
                    </div>
                  </div>
                  <div className="mt-3">
                    <h3 className="text-sm font-medium text-gray-900 group-hover:text-gray-600 transition-colors line-clamp-1">
                      {item.name} <span className="text-gray-400">#{listing.digital_token?.token_number}</span>
                    </h3>
                    <div className="mt-1 flex items-center justify-between">
                      <span className="text-sm font-bold text-gray-900">{formatPrice(listing.price)}</span>
                      <span className="text-[10px] text-gray-400">by {listing.seller?.name || '匿名'}</span>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </section>
      )}

      {items.length === 0 && resaleListings.length === 0 && (
        <div className="text-center py-24">
          <p className="text-gray-400">マーケットプレイスにはまだアイテムがありません</p>
        </div>
      )}
    </div>
  )
}
