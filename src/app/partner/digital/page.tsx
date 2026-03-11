'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Plus, Gem, Loader2 } from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import type { DigitalItem } from '@/lib/types'

export default function PartnerDigitalPage() {
  const [items, setItems] = useState<DigitalItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/partner/digital')
      .then((res) => res.ok ? res.json() : [])
      .then(setItems)
      .finally(() => setLoading(false))
  }, [])

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">デジタルアイテム</h1>
        <Link
          href="/partner/digital/new"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-member text-white text-sm font-medium rounded hover:opacity-90 transition-colors"
        >
          <Plus size={16} />
          アイテムを追加
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <Loader2 size={24} className="animate-spin mx-auto text-gray-400" />
          </div>
        ) : items.length > 0 ? (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left py-3 px-4 font-medium text-gray-500 w-16"></th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">名前</th>
                <th className="text-right py-3 px-4 font-medium text-gray-500 w-24">価格</th>
                <th className="text-right py-3 px-4 font-medium text-gray-500 w-28">発行数</th>
                <th className="text-center py-3 px-4 font-medium text-gray-500 w-24">状態</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-4">
                    {item.image_url ? (
                      <img src={item.image_url} alt="" className="w-10 h-10 rounded object-cover bg-gray-100" />
                    ) : (
                      <div className="w-10 h-10 rounded bg-gray-100 flex items-center justify-center">
                        <Gem size={16} className="text-gray-400" />
                      </div>
                    )}
                  </td>
                  <td className="py-3 px-4 font-medium text-gray-900">{item.name}</td>
                  <td className="py-3 px-4 text-right text-gray-900">{formatPrice(item.price)}</td>
                  <td className="py-3 px-4 text-right text-gray-600">{item.issued_count}/{item.total_supply}</td>
                  <td className="py-3 px-4 text-center">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${item.is_published ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {item.is_published ? '公開' : '非公開'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="p-12 text-center text-gray-400">
            <Gem size={32} className="mx-auto mb-3 text-gray-300" />
            <p>デジタルアイテムはありません</p>
          </div>
        )}
      </div>
    </div>
  )
}
