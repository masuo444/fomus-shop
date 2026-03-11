'use client'

import { useEffect, useState } from 'react'
import { formatPrice, formatDate } from '@/lib/utils'
import type { Customer } from '@/lib/types'
import { Users, Search, Loader2, Download } from 'lucide-react'

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetchCustomers()
  }, [])

  const fetchCustomers = async () => {
    setLoading(true)
    const res = await fetch('/api/admin/customers')
    if (res.ok) {
      const data = await res.json()
      setCustomers(data)
    }
    setLoading(false)
  }

  const filtered = search
    ? customers.filter(
        (c) =>
          c.name?.toLowerCase().includes(search.toLowerCase()) ||
          c.email.toLowerCase().includes(search.toLowerCase())
      )
    : customers

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">顧客管理</h1>
        <a
          href="/api/admin/export/customers"
          download
          className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <Download size={16} />
          CSVエクスポート
        </a>
      </div>

      {/* Search */}
      <div className="relative mb-6 max-w-md">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="名前またはメールで検索..."
          className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
        />
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
                <th className="text-left py-3 px-4 font-medium text-gray-500">顧客</th>
                <th className="text-right py-3 px-4 font-medium text-gray-500">注文数</th>
                <th className="text-right py-3 px-4 font-medium text-gray-500">累計購入額</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">最終注文日</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((customer) => (
                <tr key={customer.id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-4">
                    <div>
                      <p className="font-medium text-gray-900">{customer.name ?? '名前未設定'}</p>
                      <p className="text-xs text-gray-500">{customer.email}</p>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right text-gray-600">
                    {customer.total_orders}件
                  </td>
                  <td className="py-3 px-4 text-right font-medium text-gray-900">
                    {formatPrice(customer.total_spent)}
                  </td>
                  <td className="py-3 px-4 text-gray-600">
                    {customer.last_order_at ? formatDate(customer.last_order_at) : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="p-12 text-center text-gray-400">
            <Users size={32} className="mx-auto mb-3 text-gray-300" />
            <p>{search ? '該当する顧客が見つかりません' : '顧客はまだいません'}</p>
          </div>
        )}
      </div>
    </div>
  )
}
