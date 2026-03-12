'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { formatPrice, formatDateTime } from '@/lib/utils'
import { ORDER_STATUS_LABELS } from '@/lib/types'
import type { Order } from '@/lib/types'
import { ShoppingCart, Loader2, Download } from 'lucide-react'

const statusTabs = [
  { key: 'all', label: 'すべて' },
  { key: 'awaiting_payment', label: '入金待ち' },
  { key: 'paid', label: '入金済み' },
  { key: 'processing', label: '準備中' },
  { key: 'shipped', label: '発送済み' },
  { key: 'delivered', label: '配達完了' },
  { key: 'cancelled', label: 'キャンセル' },
]

const statusBadgeColors: Record<string, string> = {
  pending: 'bg-yellow-50 text-yellow-700',
  awaiting_payment: 'bg-orange-50 text-orange-700',
  paid: 'bg-blue-50 text-blue-700',
  processing: 'bg-indigo-50 text-indigo-700',
  shipped: 'bg-purple-50 text-purple-700',
  delivered: 'bg-green-50 text-green-700',
  cancelled: 'bg-gray-100 text-gray-500',
  refunded: 'bg-red-50 text-red-700',
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('all')

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    setLoading(true)
    const res = await fetch('/api/admin/orders')
    if (res.ok) {
      const data = await res.json()
      setOrders(data)
    }
    setLoading(false)
  }

  const filtered = activeTab === 'all'
    ? orders
    : orders.filter((o) => o.status === activeTab)

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">注文管理</h1>
        <a
          href="/api/admin/export/orders"
          download
          className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <Download size={16} />
          CSVエクスポート
        </a>
      </div>

      {/* Status Tabs */}
      <div className="flex gap-1 mb-6 border-b border-gray-200">
        {statusTabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.key
                ? 'border-gray-900 text-gray-900'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <Loader2 size={24} className="animate-spin mx-auto text-gray-400" />
          </div>
        ) : filtered.length > 0 ? (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left py-3 px-4 font-medium text-gray-500">注文番号</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">日時</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">顧客</th>
                <th className="text-right py-3 px-4 font-medium text-gray-500">合計</th>
                <th className="text-center py-3 px-4 font-medium text-gray-500">ステータス</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-4">
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="text-blue-600 hover:text-blue-800 font-medium"
                    >
                      #{order.order_number}
                    </Link>
                  </td>
                  <td className="py-3 px-4 text-gray-600">
                    {formatDateTime(order.created_at)}
                  </td>
                  <td className="py-3 px-4">
                    <div>
                      <p className="text-gray-900">{order.shipping_name}</p>
                      <p className="text-xs text-gray-500">{order.email}</p>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right font-medium text-gray-900">
                    {formatPrice(order.total)}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className={`inline-block text-xs px-2 py-0.5 rounded-full ${statusBadgeColors[order.status] ?? 'bg-gray-100 text-gray-600'}`}>
                      {ORDER_STATUS_LABELS[order.status]}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="p-12 text-center text-gray-400">
            <ShoppingCart size={32} className="mx-auto mb-3 text-gray-300" />
            <p>注文はありません</p>
          </div>
        )}
      </div>
    </div>
  )
}
