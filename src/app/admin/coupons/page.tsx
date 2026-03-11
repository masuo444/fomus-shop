'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Plus, Tag, Trash2 } from 'lucide-react'
import { formatPrice, formatDate } from '@/lib/utils'
import type { Coupon } from '@/lib/types'

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const fetchCoupons = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/coupons')
      if (res.ok) {
        const data = await res.json()
        setCoupons(data)
      }
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCoupons()
  }, [fetchCoupons])

  const deleteCoupon = async (coupon: Coupon) => {
    if (!confirm(`クーポン「${coupon.code}」を削除してもよろしいですか？`)) return
    setDeletingId(coupon.id)
    try {
      const res = await fetch(`/api/admin/coupons/${coupon.id}`, { method: 'DELETE' })
      if (res.ok) {
        setCoupons((prev) => prev.filter((c) => c.id !== coupon.id))
      }
    } catch {
      // ignore
    } finally {
      setDeletingId(null)
    }
  }

  const toggleActive = async (coupon: Coupon) => {
    try {
      const res = await fetch(`/api/admin/coupons/${coupon.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !coupon.is_active }),
      })
      if (res.ok) {
        setCoupons((prev) =>
          prev.map((c) =>
            c.id === coupon.id ? { ...c, is_active: !c.is_active } : c
          )
        )
      }
    } catch {
      // ignore
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-900">クーポン</h1>
        <Link
          href="/admin/coupons/new"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-member text-white text-sm font-medium rounded hover:opacity-90 transition-colors"
        >
          <Plus size={16} />
          新規クーポン
        </Link>
      </div>

      <div className="bg-white rounded border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-400">読み込み中...</div>
        ) : coupons.length > 0 ? (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left py-2.5 px-3 font-medium text-gray-500">コード</th>
                <th className="text-left py-2.5 px-3 font-medium text-gray-500">説明</th>
                <th className="text-right py-2.5 px-3 font-medium text-gray-500">割引</th>
                <th className="text-center py-2.5 px-3 font-medium text-gray-500">使用回数</th>
                <th className="text-center py-2.5 px-3 font-medium text-gray-500">有効期限</th>
                <th className="text-center py-2.5 px-3 font-medium text-gray-500">ステータス</th>
                <th className="text-center py-2.5 px-3 font-medium text-gray-500 w-20"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {coupons.map((coupon) => (
                <tr key={coupon.id} className="hover:bg-gray-50 transition-colors group">
                  <td className="py-2.5 px-3">
                    <span className="inline-flex items-center gap-1.5 font-mono font-medium text-gray-900">
                      <Tag size={14} className="text-gray-400" />
                      {coupon.code}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-gray-600">
                    {coupon.description || '-'}
                  </td>
                  <td className="py-2.5 px-3 text-right text-gray-900 font-medium">
                    {coupon.discount_type === 'percentage'
                      ? `${coupon.discount_value}%`
                      : formatPrice(coupon.discount_value)}
                  </td>
                  <td className="py-2.5 px-3 text-center text-gray-600">
                    {coupon.used_count}
                    {coupon.max_uses ? ` / ${coupon.max_uses}` : ''}
                  </td>
                  <td className="py-2.5 px-3 text-center text-gray-600 text-xs">
                    {coupon.expires_at ? formatDate(coupon.expires_at) : '無期限'}
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <button
                      onClick={() => toggleActive(coupon)}
                      className="inline-flex items-center gap-2 cursor-pointer"
                    >
                      <div
                        className={`relative w-10 h-5 rounded-full transition-colors ${
                          coupon.is_active ? 'bg-member' : 'bg-gray-300'
                        }`}
                      >
                        <div
                          className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                            coupon.is_active ? 'translate-x-5' : 'translate-x-0.5'
                          }`}
                        />
                      </div>
                      <span
                        className={`text-xs font-medium ${
                          coupon.is_active ? 'text-member' : 'text-gray-500'
                        }`}
                      >
                        {coupon.is_active ? '有効' : '無効'}
                      </span>
                    </button>
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <button
                      onClick={() => deleteCoupon(coupon)}
                      disabled={deletingId === coupon.id}
                      className="p-1.5 text-gray-400 hover:text-red-600 rounded hover:bg-red-50 transition-colors disabled:opacity-50"
                      title="削除"
                    >
                      <Trash2 size={15} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="p-12 text-center text-gray-400">
            <Tag size={32} className="mx-auto mb-3 text-gray-300" />
            <p>クーポンはまだありません</p>
            <Link
              href="/admin/coupons/new"
              className="text-member hover:underline text-sm mt-2 inline-block"
            >
              最初のクーポンを作成する
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
