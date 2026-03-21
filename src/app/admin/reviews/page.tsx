'use client'

import { useEffect, useState } from 'react'
import { Star, Check, X, Trash2, Loader2, Eye, EyeOff } from 'lucide-react'
import { formatDate } from '@/lib/utils'

interface Review {
  id: string
  reviewer_name: string | null
  rating: number
  title: string | null
  body: string | null
  is_published: boolean
  verified_purchase: boolean
  created_at: string
  product_id: string
  product: { name: string; images: string[] | null } | null
}

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'published' | 'pending'>('all')
  const [togglingId, setTogglingId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    fetchReviews()
  }, [])

  const fetchReviews = async () => {
    setLoading(true)
    const res = await fetch('/api/admin/reviews')
    if (res.ok) {
      const data = await res.json()
      setReviews(data)
    }
    setLoading(false)
  }

  const togglePublish = async (review: Review) => {
    setTogglingId(review.id)
    const res = await fetch('/api/admin/reviews', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: review.id, is_published: !review.is_published }),
    })
    if (res.ok) {
      setReviews(prev => prev.map(r => r.id === review.id ? { ...r, is_published: !r.is_published } : r))
    }
    setTogglingId(null)
  }

  const deleteReview = async (id: string) => {
    if (!confirm('このレビューを削除しますか？')) return
    setDeletingId(id)
    const res = await fetch(`/api/admin/reviews?id=${id}`, { method: 'DELETE' })
    if (res.ok) {
      setReviews(prev => prev.filter(r => r.id !== id))
    }
    setDeletingId(null)
  }

  const filtered = filter === 'all'
    ? reviews
    : filter === 'published'
      ? reviews.filter(r => r.is_published)
      : reviews.filter(r => !r.is_published)

  const pendingCount = reviews.filter(r => !r.is_published).length

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">レビュー管理</h1>

      <div className="flex gap-2 mb-6">
        {[
          { key: 'all' as const, label: 'すべて', count: reviews.length },
          { key: 'pending' as const, label: '未承認', count: pendingCount },
          { key: 'published' as const, label: '公開中', count: reviews.length - pendingCount },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              filter === tab.key
                ? 'bg-gray-900 text-white'
                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {tab.label}
            {tab.count > 0 && (
              <span className={`ml-1.5 ${filter === tab.key ? 'text-gray-300' : 'text-gray-400'}`}>
                ({tab.count})
              </span>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="p-12 text-center">
          <Loader2 size={24} className="animate-spin mx-auto text-gray-400" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-400">
          <Star size={32} className="mx-auto mb-3 text-gray-300" />
          <p>レビューはありません</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(review => (
            <div
              key={review.id}
              className={`bg-white rounded-xl border p-5 ${
                review.is_published ? 'border-gray-200' : 'border-orange-200 bg-orange-50/30'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    {/* Stars */}
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map(s => (
                        <Star
                          key={s}
                          size={14}
                          className={s <= review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'}
                        />
                      ))}
                    </div>
                    <span className="text-sm font-medium text-gray-900">
                      {review.reviewer_name || '匿名'}
                    </span>
                    {review.verified_purchase && (
                      <span className="text-[10px] bg-green-50 text-green-600 px-1.5 py-0.5 rounded">購入済み</span>
                    )}
                    {!review.is_published && (
                      <span className="text-[10px] bg-orange-100 text-orange-600 px-1.5 py-0.5 rounded font-medium">未承認</span>
                    )}
                  </div>

                  {review.title && (
                    <p className="text-sm font-medium text-gray-900 mb-1">{review.title}</p>
                  )}
                  {review.body && (
                    <p className="text-sm text-gray-600 leading-relaxed">{review.body}</p>
                  )}

                  <div className="mt-3 flex items-center gap-3 text-xs text-gray-400">
                    <span>{formatDate(review.created_at)}</span>
                    {review.product && (
                      <span className="text-gray-500">
                        商品: {review.product.name}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => togglePublish(review)}
                    disabled={togglingId === review.id}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      review.is_published
                        ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        : 'bg-green-500 text-white hover:bg-green-600'
                    }`}
                    title={review.is_published ? '非公開にする' : '承認して公開'}
                  >
                    {togglingId === review.id ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : review.is_published ? (
                      <><EyeOff size={14} /> 非公開</>
                    ) : (
                      <><Check size={14} /> 承認</>
                    )}
                  </button>
                  <button
                    onClick={() => deleteReview(review.id)}
                    disabled={deletingId === review.id}
                    className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                    title="削除"
                  >
                    {deletingId === review.id ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <Trash2 size={14} />
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
