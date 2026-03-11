'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChevronLeft, Sparkles } from 'lucide-react'
import { formatPrice, formatDate } from '@/lib/utils'
import OwnershipChain from '@/components/digital/OwnershipChain'
import type { DigitalItem } from '@/lib/types'

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

interface Props {
  item: DigitalItem
  transfers: Transfer[]
  isLoggedIn: boolean
  hasDigitalAccess: boolean
}

export default function DigitalItemDetailClient({ item, transfers, isLoggedIn, hasDigitalAccess }: Props) {
  const [purchasing, setPurchasing] = useState(false)
  const [error, setError] = useState('')

  const isSoldOut = item.issued_count >= item.total_supply
  const remaining = item.total_supply - item.issued_count
  const progressPercent = (item.issued_count / item.total_supply) * 100

  const handlePurchase = async () => {
    if (!isLoggedIn) {
      window.location.href = `/auth/login?redirect=/digital/${item.id}`
      return
    }

    setPurchasing(true)
    setError('')

    try {
      const res = await fetch('/api/digital/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ digital_item_id: item.id }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || '購入に失敗しました')
      }

      if (data.url) {
        window.location.href = data.url
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'エラーが発生しました')
      setPurchasing(false)
    }
  }

  const metadata = item.metadata as Record<string, string> | null

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link
        href="/digital"
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900 mb-6 transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
        デジタルアイテム一覧
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
        {/* Image */}
        <div className="aspect-square bg-gray-100 rounded-2xl overflow-hidden relative shadow-sm">
          {item.image_url ? (
            <img
              src={item.image_url}
              alt={item.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-200">
              <Sparkles className="w-24 h-24 text-gray-300" />
            </div>
          )}
          {isSoldOut && (
            <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px] flex items-center justify-center">
              <span className="bg-white text-black text-sm font-bold px-6 py-2 rounded-full tracking-wider">
                SOLD OUT
              </span>
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight">
            {item.name}
          </h1>

          <div className="mt-4">
            <span className="text-3xl font-bold text-gray-900">
              {formatPrice(item.price)}
            </span>
          </div>

          {/* Supply info with progress bar */}
          <div className="mt-5">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-gray-600 font-medium">
                {item.issued_count}/{item.total_supply} 発行済み
              </span>
              {isSoldOut ? (
                <span className="text-red-500 font-medium">完売</span>
              ) : (
                <span className="text-teal-600 font-medium">残り {remaining}点</span>
              )}
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  isSoldOut
                    ? 'bg-red-400'
                    : progressPercent > 80
                    ? 'bg-amber-400'
                    : 'bg-teal-500'
                }`}
                style={{ width: `${Math.min(progressPercent, 100)}%` }}
              />
            </div>
          </div>

          {/* Resale info */}
          {item.resale_enabled && (
            <div className="mt-3 flex items-center gap-2">
              <span className="inline-flex items-center text-[11px] font-medium text-teal-700 bg-teal-50 border border-teal-100 px-2.5 py-0.5 rounded-full">
                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
                リセール可能
              </span>
              <span className="text-[11px] text-gray-400">
                ロイヤリティ {item.royalty_percentage}%
              </span>
            </div>
          )}

          {/* Description */}
          {item.description && (
            <div className="mt-6 text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
              {item.description}
            </div>
          )}

          {/* Metadata */}
          {metadata && Object.keys(metadata).length > 0 && (
            <div className="mt-6 bg-gray-50 rounded-xl p-4 space-y-2.5">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                詳細情報
              </h3>
              {Object.entries(metadata).map(([key, value]) => (
                <div key={key} className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">{key}</span>
                  <span className="text-xs font-medium text-gray-800">{value}</span>
                </div>
              ))}
            </div>
          )}

          {/* Purchase button */}
          <div className="mt-8">
            {isSoldOut ? (
              <button
                disabled
                className="w-full bg-gray-200 text-gray-400 py-3.5 rounded-full text-sm font-bold cursor-not-allowed tracking-wider"
              >
                SOLD OUT
              </button>
            ) : !isLoggedIn ? (
              <Link
                href={`/auth/login?redirect=/digital/${item.id}`}
                className="w-full bg-gray-900 text-white py-3.5 rounded-full text-sm font-medium hover:bg-gray-800 transition-all flex items-center justify-center gap-2 shadow-sm hover:shadow-md"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
                ログインして購入
              </Link>
            ) : !hasDigitalAccess ? (
              <div>
                <button
                  disabled
                  className="w-full bg-gray-200 text-gray-400 py-3.5 rounded-full text-sm font-medium cursor-not-allowed"
                >
                  購入権限がありません
                </button>
                <p className="text-xs text-gray-400 text-center mt-2">
                  デジタルアイテムの購入には管理者からの権限付与が必要です
                </p>
              </div>
            ) : (
              <button
                onClick={handlePurchase}
                disabled={purchasing}
                className="w-full bg-gray-900 text-white py-3.5 rounded-full text-sm font-medium hover:bg-gray-800 transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm hover:shadow-md"
              >
                <Sparkles className="w-4 h-4" />
                {purchasing ? '処理中...' : '購入する'}
              </button>
            )}
          </div>

          {error && (
            <div className="mt-3 bg-red-50 border border-red-100 text-red-600 text-sm px-4 py-2.5 rounded-xl text-center">
              {error}
            </div>
          )}
        </div>
      </div>

      {/* Ownership chain */}
      {transfers.length > 0 && (
        <div className="mt-12 border-t border-gray-100 pt-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">取引履歴</h2>
          <div className="bg-gray-50 rounded-xl p-5">
            <OwnershipChain transfers={transfers} />
          </div>
        </div>
      )}
    </div>
  )
}
