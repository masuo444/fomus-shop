'use client'

import { useEffect, useState, Suspense } from 'react'
import Link from 'next/link'
import { formatPrice, formatDate } from '@/lib/utils'
import siteConfig from '@/site.config'
import OwnershipChain from '@/components/digital/OwnershipChain'
import type { DigitalToken, DigitalItem } from '@/lib/types'
import { Sparkles, ChevronDown, ChevronUp } from 'lucide-react'
import { useSearchParams } from 'next/navigation'

interface TokenWithItem extends DigitalToken {
  digital_item: DigitalItem
}

interface TokenListing {
  id: string
  price: number
}

interface Transfer {
  id: string
  from_user_id: string | null
  to_user_id: string
  price: number
  royalty_amount: number
  seller_amount: number
  transfer_type: string
  created_at: string
}

export default function MyDigitalPage() {
  return (
    <Suspense fallback={<div className="max-w-3xl mx-auto px-4 py-16 text-center text-gray-400">読み込み中...</div>}>
      <MyDigitalContent />
    </Suspense>
  )
}

function MyDigitalContent() {
  const searchParams = useSearchParams()
  const justPurchased = searchParams.get('purchased') === 'true'

  const [tokens, setTokens] = useState<TokenWithItem[]>([])
  const [listings, setListings] = useState<Record<string, TokenListing>>({})
  const [transfers, setTransfers] = useState<Record<string, Transfer[]>>({})
  const [loading, setLoading] = useState(true)
  const [listingTokenId, setListingTokenId] = useState<string | null>(null)
  const [listingPrice, setListingPrice] = useState('')
  const [listingError, setListingError] = useState('')
  const [listingLoading, setListingLoading] = useState(false)
  const [cancellingId, setCancellingId] = useState<string | null>(null)
  const [expandedToken, setExpandedToken] = useState<string | null>(null)
  const [showPurchaseSuccess, setShowPurchaseSuccess] = useState(justPurchased)

  useEffect(() => {
    loadTokens()
    if (justPurchased) {
      const timer = setTimeout(() => setShowPurchaseSuccess(false), 5000)
      return () => clearTimeout(timer)
    }
  }, [])

  const loadTokens = async () => {
    try {
      const res = await fetch('/api/digital/my-tokens')
      if (!res.ok) {
        if (res.status === 401) {
          window.location.href = '/auth/login?redirect=/account/digital'
          return
        }
        throw new Error('Failed to load tokens')
      }

      const data = await res.json()
      setTokens(data.tokens || [])
      setListings(data.listings || {})
      setTransfers(data.transfers || {})
    } catch (err) {
      console.error('Load tokens error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleListForResale = async (tokenId: string) => {
    setListingError('')
    setListingLoading(true)

    const price = parseInt(listingPrice)
    if (!price || price <= 0) {
      setListingError('有効な価格を入力してください')
      setListingLoading(false)
      return
    }

    try {
      const res = await fetch('/api/digital/listings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ digital_token_id: tokenId, price }),
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || '出品に失敗しました')
      }

      setListingTokenId(null)
      setListingPrice('')
      await loadTokens()
    } catch (err) {
      setListingError(err instanceof Error ? err.message : '出品に失敗しました')
    } finally {
      setListingLoading(false)
    }
  }

  const handleCancelListing = async (listingId: string) => {
    setCancellingId(listingId)
    try {
      const res = await fetch('/api/digital/listings', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listing_id: listingId }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'キャンセルに失敗しました')
      }

      await loadTokens()
    } catch (err) {
      console.error('Cancel error:', err)
    } finally {
      setCancellingId(null)
    }
  }

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <div className="animate-pulse text-gray-400">読み込み中...</div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">マイデジタルアイテム</h1>
          <p className="text-sm text-gray-500 mt-1">所有しているデジタルアイテム</p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/digital"
            className="text-sm text-gray-500 hover:text-gray-900 transition-colors bg-gray-50 hover:bg-gray-100 px-4 py-2 rounded-full"
          >
            ストア
          </Link>
          <Link
            href="/digital/marketplace"
            className="text-sm text-gray-500 hover:text-gray-900 transition-colors bg-gray-50 hover:bg-gray-100 px-4 py-2 rounded-full"
          >
            マーケット
          </Link>
        </div>
      </div>

      {/* Purchase success message */}
      {showPurchaseSuccess && (
        <div className="mb-6 bg-teal-50 border border-teal-100 rounded-xl px-5 py-3 flex items-center gap-3 animate-in fade-in">
          <svg className="w-5 h-5 text-teal-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-sm text-teal-800 font-medium">
            購入が完了しました！デジタルアイテムがコレクションに追加されました。
          </p>
          <button
            onClick={() => setShowPurchaseSuccess(false)}
            className="ml-auto text-teal-400 hover:text-teal-600"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {tokens.length === 0 ? (
        <div className="text-center py-24">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-10 h-10 text-gray-200" />
          </div>
          <p className="text-gray-400 mb-1">デジタルアイテムを所有していません</p>
          <p className="text-xs text-gray-300 mb-6">ストアでデジタルアイテムを購入しましょう</p>
          <Link
            href="/digital"
            className="inline-block bg-gray-900 text-white px-6 py-2.5 rounded-full text-sm font-medium hover:bg-gray-800 transition-colors"
          >
            デジタルアイテムを見る
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {tokens.map((token) => {
            const activeListing = listings[token.id]
            const tokenTransfers = transfers[token.id] || []
            const isExpanded = expandedToken === token.id

            return (
              <div
                key={token.id}
                className="bg-white border border-gray-100 rounded-xl overflow-hidden hover:shadow-sm transition-shadow"
              >
                <div className="flex gap-4 p-4">
                  {/* Image */}
                  <div className="w-24 h-24 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden relative">
                    {token.digital_item?.image_url ? (
                      <img
                        src={token.digital_item.image_url}
                        alt={token.digital_item.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Sparkles className="w-8 h-8 text-gray-300" />
                      </div>
                    )}
                    <div className="absolute top-1 right-1 bg-black/70 text-white text-[9px] font-mono px-1.5 py-0.5 rounded-full">
                      #{token.token_number}
                    </div>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="text-sm font-semibold text-gray-900 line-clamp-1">
                          {token.digital_item?.name}
                        </h3>
                        <p className="text-xs text-gray-400 mt-0.5">
                          #{token.token_number} / {token.digital_item?.total_supply}
                        </p>
                      </div>

                      {/* Status badge */}
                      {token.status === 'listed' ? (
                        <span className="inline-flex text-[10px] font-medium bg-blue-50 text-blue-600 border border-blue-100 px-2 py-0.5 rounded-full flex-shrink-0">
                          出品中
                        </span>
                      ) : (
                        <span className="inline-flex text-[10px] font-medium bg-green-50 text-green-600 border border-green-100 px-2 py-0.5 rounded-full flex-shrink-0">
                          保有中
                        </span>
                      )}
                    </div>

                    <div className="mt-2 flex items-center gap-3 text-xs text-gray-500">
                      <span>購入価格: {formatPrice(token.original_price)}</span>
                      <span>取得日: {formatDate(token.created_at)}</span>
                    </div>

                    {/* Secret content (revealed to owner) */}
                    {token.digital_item?.secret_content && (
                      <div className="mt-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                        <p className="text-[10px] font-medium text-amber-700 mb-0.5">購入者限定</p>
                        <p className="text-xs text-amber-900 whitespace-pre-wrap">{token.digital_item.secret_content}</p>
                      </div>
                    )}

                    {/* Listing price */}
                    {activeListing && (
                      <div className="mt-1.5 text-xs text-blue-600 font-medium">
                        出品価格: {formatPrice(activeListing.price)}
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="px-4 pb-4">
                  {/* Resale listing form */}
                  {token.status === 'owned' && token.digital_item?.resale_enabled && (
                    <div className="mt-1">
                      {listingTokenId === token.id ? (
                        <div className="bg-gray-50 rounded-lg p-3 space-y-2.5">
                          <div className="flex items-center gap-2">
                            <div className="relative flex-1">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">
                                ¥
                              </span>
                              <input
                                type="number"
                                value={listingPrice}
                                onChange={(e) => setListingPrice(e.target.value)}
                                placeholder="出品価格を入力"
                                className="w-full pl-7 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400"
                              />
                            </div>
                          </div>
                          {listingPrice && parseInt(listingPrice) > 0 && (
                            <p className="text-[10px] text-gray-400">
                              ロイヤリティ {token.digital_item.royalty_percentage}%: {formatPrice(Math.floor(parseInt(listingPrice) * (token.digital_item.royalty_percentage / 100)))} → {siteConfig.name} /
                              獲得ポイント: {(parseInt(listingPrice) - Math.floor(parseInt(listingPrice) * (token.digital_item.royalty_percentage / 100))).toLocaleString()}pt
                            </p>
                          )}
                          {listingError && (
                            <p className="text-xs text-red-500">{listingError}</p>
                          )}
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleListForResale(token.id)}
                              disabled={listingLoading}
                              className="flex-1 bg-gray-900 text-white py-2 rounded-full text-xs font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
                            >
                              {listingLoading ? '出品中...' : 'マーケットに出品'}
                            </button>
                            <button
                              onClick={() => {
                                setListingTokenId(null)
                                setListingPrice('')
                                setListingError('')
                              }}
                              className="px-4 py-2 border border-gray-200 rounded-full text-xs text-gray-500 hover:border-gray-400 transition-colors"
                            >
                              キャンセル
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => setListingTokenId(token.id)}
                          className="w-full border border-gray-200 text-gray-700 py-2 rounded-full text-xs font-medium hover:border-gray-400 hover:bg-gray-50 transition-colors"
                        >
                          出品する
                        </button>
                      )}
                    </div>
                  )}

                  {/* Cancel listing button */}
                  {token.status === 'listed' && activeListing && (
                    <button
                      onClick={() => handleCancelListing(activeListing.id)}
                      disabled={cancellingId === activeListing.id}
                      className="w-full mt-1 border border-red-200 text-red-600 py-2 rounded-full text-xs font-medium hover:bg-red-50 transition-colors disabled:opacity-50"
                    >
                      {cancellingId === activeListing.id ? 'キャンセル中...' : '出品をキャンセル'}
                    </button>
                  )}

                  {/* Transfer history toggle */}
                  {tokenTransfers.length > 0 && (
                    <div className="mt-3">
                      <button
                        onClick={() => setExpandedToken(isExpanded ? null : token.id)}
                        className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        {isExpanded ? (
                          <ChevronUp className="w-3.5 h-3.5" />
                        ) : (
                          <ChevronDown className="w-3.5 h-3.5" />
                        )}
                        取引履歴 ({tokenTransfers.length})
                      </button>

                      {isExpanded && (
                        <div className="mt-3 bg-gray-50 rounded-lg p-4">
                          <OwnershipChain transfers={tokenTransfers} showRoyalty />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
