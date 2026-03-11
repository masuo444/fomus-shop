'use client'

import { useState } from 'react'
import Link from 'next/link'
import { formatPrice } from '@/lib/utils'
import siteConfig from '@/site.config'

interface Listing {
  id: string
  price: number
  digital_token: {
    id: string
    token_number: number
    original_price: number
    digital_item: {
      id: string
      name: string
      image_url: string | null
      royalty_percentage: number
      total_supply: number
    }
  }
  seller: {
    id: string
    name: string | null
  }
}

export default function MarketplaceClient({ listings }: { listings: Listing[] }) {
  const [purchasing, setPurchasing] = useState<string | null>(null)
  const [error, setError] = useState('')

  const handleBuy = async (listingId: string) => {
    setPurchasing(listingId)
    setError('')

    try {
      const res = await fetch('/api/digital/resale', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listing_id: listingId }),
      })

      const data = await res.json()

      if (!res.ok) {
        if (res.status === 401) {
          window.location.href = '/auth/login?redirect=/digital/marketplace'
          return
        }
        throw new Error(data.error || '購入に失敗しました')
      }

      if (data.url) {
        window.location.href = data.url
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'エラーが発生しました')
      setPurchasing(null)
    }
  }

  return (
    <div>
      {error && (
        <div className="mb-6 bg-red-50 border border-red-100 text-red-600 text-sm px-4 py-3 rounded-xl">
          {error}
        </div>
      )}

      {/* Royalty notice */}
      <div className="mb-6 bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-100 rounded-xl px-5 py-3 flex items-center gap-3">
        <svg className="w-5 h-5 text-purple-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-sm text-purple-800">
          マーケットプレイスで購入された金額の一部は、ロイヤリティとして{siteConfig.name}に還元されます。
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
        {listings.map((listing) => {
          const item = listing.digital_token.digital_item
          const priceDiff = listing.price - listing.digital_token.original_price
          const royaltyAmount = Math.floor(listing.price * (item.royalty_percentage / 100))

          return (
            <div key={listing.id} className="group bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
              <div className="relative aspect-square bg-gray-100 overflow-hidden">
                {item.image_url ? (
                  <img
                    src={item.image_url}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-200">
                    <svg className="w-16 h-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                    </svg>
                  </div>
                )}
                {/* Token number badge */}
                <div className="absolute top-2.5 right-2.5 bg-black/70 backdrop-blur-sm text-white text-[10px] font-mono px-2 py-0.5 rounded-full">
                  #{listing.digital_token.token_number} / {item.total_supply}
                </div>
                {/* Resale badge */}
                <div className="absolute top-2.5 left-2.5 bg-purple-600/90 backdrop-blur-sm text-white text-[10px] font-medium px-2 py-0.5 rounded-full">
                  リセール
                </div>
              </div>

              <div className="p-4">
                <Link href={`/digital/${item.id}`} className="block">
                  <h3 className="text-sm font-medium text-gray-900 line-clamp-2 hover:text-gray-600 transition-colors">
                    {item.name}
                  </h3>
                </Link>

                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-base font-bold text-gray-900">
                    {formatPrice(listing.price)}
                  </span>
                  {listing.price !== listing.digital_token.original_price && (
                    <span className="text-[10px] text-gray-400 line-through">
                      {formatPrice(listing.digital_token.original_price)}
                    </span>
                  )}
                </div>

                <div className="mt-1.5 space-y-0.5">
                  <p className="text-[10px] text-gray-400">
                    ロイヤリティ {item.royalty_percentage}% ({formatPrice(royaltyAmount)}) が{siteConfig.name}に還元
                  </p>
                  <p className="text-[10px] text-gray-400">
                    出品者: {listing.seller?.name || '匿名ユーザー'}
                  </p>
                </div>

                <button
                  onClick={() => handleBuy(listing.id)}
                  disabled={purchasing === listing.id}
                  className="w-full mt-3 bg-gray-900 text-white py-2.5 rounded-full text-xs font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5"
                >
                  {purchasing === listing.id ? (
                    '処理中...'
                  ) : (
                    <>
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
                      </svg>
                      購入する
                    </>
                  )}
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
