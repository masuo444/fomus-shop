'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { formatPrice, formatDate } from '@/lib/utils'
import { ORDER_STATUS_LABELS, type Order } from '@/lib/types'
import { Package, Receipt } from 'lucide-react'

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [invoiceLoading, setInvoiceLoading] = useState<string | null>(null)

  useEffect(() => {
    loadOrders()
  }, [])

  const handleInvoiceDownload = async (orderId: string) => {
    setInvoiceLoading(orderId)
    try {
      const res = await fetch(`/api/orders/${orderId}/invoice`)
      const data = await res.json()
      if (res.ok && data.url) {
        window.open(data.url, '_blank')
      }
    } catch {
      // silent fail
    } finally {
      setInvoiceLoading(null)
    }
  }

  const loadOrders = async () => {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (user) {
      const { data } = await supabase
        .from('orders')
        .select('*, order_items(*)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      setOrders((data as Order[]) || [])
    }
    setLoading(false)
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
      <h1 className="text-2xl font-bold text-gray-900 mb-8">注文履歴</h1>

      {orders.length === 0 ? (
        <div className="text-center py-24">
          <Package className="w-16 h-16 text-gray-200 mx-auto mb-4" />
          <p className="text-gray-400 mb-4">注文履歴がありません</p>
          <Link
            href="/shop"
            className="inline-block bg-black text-white px-6 py-2 rounded-full text-sm font-medium hover:bg-gray-800 transition-colors"
          >
            ショッピングを始める
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="border border-gray-100 rounded-lg p-4 hover:border-gray-200 transition-colors"
            >
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    注文番号: {order.order_number}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {formatDate(order.created_at)}
                  </p>
                </div>
                <span
                  className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                    order.status === 'paid' || order.status === 'delivered'
                      ? 'bg-green-50 text-green-700'
                      : order.status === 'cancelled' || order.status === 'refunded'
                      ? 'bg-red-50 text-red-700'
                      : order.status === 'shipped'
                      ? 'bg-blue-50 text-blue-700'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {ORDER_STATUS_LABELS[order.status]}
                </span>
              </div>

              {order.order_items && order.order_items.length > 0 && (
                <div className="text-sm text-gray-500 mb-3">
                  {order.order_items.map((item, i) => (
                    <span key={item.id}>
                      {i > 0 && ', '}
                      {item.product_name} x{item.quantity}
                    </span>
                  ))}
                </div>
              )}

              <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                <span className="text-sm font-medium text-gray-900">
                  {formatPrice(order.total, order.currency)}
                </span>
                <div className="flex items-center gap-3">
                  {order.tracking_number && (
                    <span className="text-xs text-gray-400">
                      追跡番号: {order.tracking_number}
                    </span>
                  )}
                  {order.stripe_invoice_id && (
                    <button
                      onClick={() => handleInvoiceDownload(order.id)}
                      disabled={invoiceLoading === order.id}
                      className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-gray-900 transition-colors disabled:opacity-50"
                    >
                      <Receipt className="w-3.5 h-3.5" />
                      {invoiceLoading === order.id ? '取得中...' : 'インボイス'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
