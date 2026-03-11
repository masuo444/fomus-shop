'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { formatPrice, formatDateTime } from '@/lib/utils'
import { ORDER_STATUS_LABELS, SHIPPING_CARRIERS } from '@/lib/types'
import type { Order, OrderItem } from '@/lib/types'

export default function PartnerOrderDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [order, setOrder] = useState<Order | null>(null)
  const [items, setItems] = useState<OrderItem[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [trackingNumber, setTrackingNumber] = useState('')
  const [carrier, setCarrier] = useState('yamato')

  useEffect(() => {
    fetch(`/api/partner/orders/${params.id}`)
      .then((res) => res.ok ? res.json() : null)
      .then((data) => {
        if (data) {
          setOrder(data.order)
          setItems(data.items ?? [])
          setTrackingNumber(data.order.tracking_number ?? '')
          setCarrier(data.order.shipping_carrier ?? 'yamato')
        }
      })
      .finally(() => setLoading(false))
  }, [params.id])

  const updateStatus = async (status: string) => {
    if (!order) return
    setUpdating(true)
    try {
      const body: Record<string, string> = { status }
      if (status === 'shipped') {
        body.tracking_number = trackingNumber
        body.shipping_carrier = carrier
      }
      const res = await fetch(`/api/partner/orders/${order.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (res.ok) {
        const data = await res.json()
        setOrder(data)
      }
    } finally {
      setUpdating(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 size={24} className="animate-spin text-gray-400" />
      </div>
    )
  }

  if (!order) {
    return <div className="text-gray-500">注文が見つかりません</div>
  }

  return (
    <div>
      <Link
        href="/partner/orders"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 mb-4 transition-colors"
      >
        <ArrowLeft size={16} />
        注文一覧に戻る
      </Link>

      <div className="flex items-center gap-3 mb-6">
        <h1 className="text-xl font-bold text-gray-900">#{order.order_number}</h1>
        <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
          {ORDER_STATUS_LABELS[order.status]}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order Items */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="font-semibold text-gray-900 mb-4">注文内容</h2>
            <div className="space-y-3">
              {items.map((item) => (
                <div key={item.id} className="flex items-center gap-3">
                  {item.image_url ? (
                    <img src={item.image_url} alt="" className="w-12 h-12 rounded object-cover bg-gray-100" />
                  ) : (
                    <div className="w-12 h-12 rounded bg-gray-100" />
                  )}
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{item.product_name}</p>
                    <p className="text-xs text-gray-500">x{item.quantity}</p>
                  </div>
                  <p className="text-sm font-medium text-gray-900">{formatPrice(item.price * item.quantity)}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200 space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">小計</span>
                <span>{formatPrice(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">送料</span>
                <span>{formatPrice(order.shipping_fee)}</span>
              </div>
              <div className="flex justify-between text-sm font-bold">
                <span>合計</span>
                <span>{formatPrice(order.total)}</span>
              </div>
            </div>
          </div>

          {/* Shipping */}
          {(order.status === 'paid' || order.status === 'processing') && (
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h2 className="font-semibold text-gray-900 mb-4">発送処理</h2>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">配送業者</label>
                  <select
                    value={carrier}
                    onChange={(e) => setCarrier(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-member"
                  >
                    {Object.entries(SHIPPING_CARRIERS).map(([key, label]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">追跡番号</label>
                  <input
                    type="text"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-member"
                  />
                </div>
                <button
                  onClick={() => updateStatus('shipped')}
                  disabled={updating}
                  className="px-4 py-2 bg-member text-white text-sm font-medium rounded-lg hover:opacity-90 disabled:opacity-50 transition-colors"
                >
                  {updating ? '処理中...' : '発送済みにする'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="font-semibold text-gray-900 mb-3">配送先</h2>
            <div className="text-sm text-gray-600 space-y-1">
              <p className="font-medium text-gray-900">{order.shipping_name}</p>
              <p>{order.shipping_postal_code}</p>
              <p>{order.shipping_address}</p>
              <p>{order.shipping_phone}</p>
              <p>{order.email}</p>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="font-semibold text-gray-900 mb-3">注文情報</h2>
            <div className="text-sm text-gray-600 space-y-1">
              <p>注文日: {formatDateTime(order.created_at)}</p>
              {order.invoice_number && <p>インボイス: <span className="font-mono text-xs">{order.invoice_number}</span></p>}
              {order.tracking_number && <p>追跡番号: {order.tracking_number}</p>}
              {order.shipping_carrier && <p>配送業者: {SHIPPING_CARRIERS[order.shipping_carrier] ?? order.shipping_carrier}</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
