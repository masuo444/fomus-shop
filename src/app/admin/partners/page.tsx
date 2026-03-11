'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Plus, Handshake } from 'lucide-react'
import type { Shop } from '@/lib/types'

export default function AdminPartnersPage() {
  const [shops, setShops] = useState<Shop[]>([])
  const [loading, setLoading] = useState(true)

  const fetchShops = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/partners')
      if (res.ok) {
        const data = await res.json()
        setShops(data)
      }
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchShops()
  }, [fetchShops])

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-900">パートナー管理</h1>
        <Link
          href="/admin/partners/new"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-member text-white text-sm font-medium rounded hover:opacity-90 transition-colors"
        >
          <Plus size={16} />
          パートナーを追加
        </Link>
      </div>

      <div className="bg-white rounded border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-400">読み込み中...</div>
        ) : shops.length > 0 ? (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left py-2.5 px-3 font-medium text-gray-500">ショップ名</th>
                <th className="text-left py-2.5 px-3 font-medium text-gray-500">スラッグ</th>
                <th className="text-left py-2.5 px-3 font-medium text-gray-500">連絡先</th>
                <th className="text-right py-2.5 px-3 font-medium text-gray-500">手数料率</th>
                <th className="text-center py-2.5 px-3 font-medium text-gray-500">ステータス</th>
                <th className="text-center py-2.5 px-3 font-medium text-gray-500">公開</th>
                <th className="text-center py-2.5 px-3 font-medium text-gray-500 w-20"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {shops.map((shop) => (
                <tr key={shop.id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-2.5 px-3">
                    <span className="font-medium text-gray-900">{shop.name}</span>
                  </td>
                  <td className="py-2.5 px-3 text-gray-500 font-mono text-xs">
                    {shop.slug}
                  </td>
                  <td className="py-2.5 px-3 text-gray-600 text-xs">
                    {shop.contact_email || '-'}
                  </td>
                  <td className="py-2.5 px-3 text-right text-gray-900 font-medium">
                    {shop.commission_rate}%
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <span
                      className={`inline-block text-xs px-2 py-0.5 rounded-full font-medium ${
                        shop.status === 'active'
                          ? 'bg-green-50 text-green-700'
                          : 'bg-red-50 text-red-700'
                      }`}
                    >
                      {shop.status === 'active' ? '有効' : '停止中'}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <span
                      className={`inline-block text-xs px-2 py-0.5 rounded-full font-medium ${
                        shop.is_published
                          ? 'bg-blue-50 text-blue-700'
                          : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {shop.is_published ? '公開' : '非公開'}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <Link
                      href={`/admin/partners/${shop.id}`}
                      className="text-sm text-member hover:underline font-medium"
                    >
                      編集
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="p-12 text-center text-gray-400">
            <Handshake size={32} className="mx-auto mb-3 text-gray-300" />
            <p>パートナーはまだありません</p>
            <Link
              href="/admin/partners/new"
              className="text-member hover:underline text-sm mt-2 inline-block"
            >
              最初のパートナーを追加する
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
