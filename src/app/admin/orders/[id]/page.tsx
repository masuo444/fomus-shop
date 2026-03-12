'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { formatPrice, formatDateTime } from '@/lib/utils'
import { ORDER_STATUS_LABELS, SHIPPING_CARRIERS } from '@/lib/types'
import type { Order, OrderItem } from '@/lib/types'
import { ArrowLeft, Loader2, Package, FileText, Receipt } from 'lucide-react'

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

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [order, setOrder] = useState<Order | null>(null)
  const [items, setItems] = useState<OrderItem[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [refunding, setRefunding] = useState(false)
  const [showRefundConfirm, setShowRefundConfirm] = useState(false)
  const [invoiceLoading, setInvoiceLoading] = useState(false)
  const [error, setError] = useState('')

  const [status, setStatus] = useState('')
  const [trackingNumber, setTrackingNumber] = useState('')
  const [shippingCarrier, setShippingCarrier] = useState('')

  useEffect(() => {
    fetchOrder()
  }, [id])

  const fetchOrder = async () => {
    setLoading(true)
    const res = await fetch(`/api/admin/orders/${id}`)
    if (res.ok) {
      const data = await res.json()
      setOrder(data.order)
      setItems(data.items)
      setStatus(data.order.status)
      setTrackingNumber(data.order.tracking_number ?? '')
      setShippingCarrier(data.order.shipping_carrier ?? '')
    }
    setLoading(false)
  }

  const handleUpdate = async () => {
    setSaving(true)
    setError('')
    try {
      const res = await fetch(`/api/admin/orders/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          tracking_number: trackingNumber || null,
          shipping_carrier: shippingCarrier || null,
        }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || '更新に失敗しました')
      }
      await fetchOrder()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : '更新に失敗しました')
    } finally {
      setSaving(false)
    }
  }

  const handleRefund = async () => {
    setRefunding(true)
    setError('')
    try {
      const res = await fetch(`/api/admin/orders/${id}/refund`, {
        method: 'POST',
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || '返金に失敗しました')
      }
      setShowRefundConfirm(false)
      await fetchOrder()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : '返金に失敗しました')
    } finally {
      setRefunding(false)
    }
  }

  const handleInvoiceDownload = async () => {
    setInvoiceLoading(true)
    try {
      const res = await fetch(`/api/admin/orders/${id}/invoice`)
      const data = await res.json()
      if (res.ok && data.url) {
        window.open(data.url, '_blank')
      } else {
        setError(data.error || 'インボイスの取得に失敗しました')
      }
    } catch {
      setError('インボイスの取得に失敗しました')
    } finally {
      setInvoiceLoading(false)
    }
  }

  const canRefund = order && ['paid', 'processing', 'shipped'].includes(order.status)

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
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
        href="/admin/orders"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 mb-4 transition-colors"
      >
        <ArrowLeft size={16} />
        注文一覧に戻る
      </Link>

      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold text-gray-900">注文 #{order.order_number}</h1>
          <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusBadgeColors[order.status] ?? 'bg-gray-100 text-gray-600'}`}>
            {ORDER_STATUS_LABELS[order.status]}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {order.stripe_invoice_id && (
            <button
              onClick={handleInvoiceDownload}
              disabled={invoiceLoading}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              <Receipt size={16} />
              {invoiceLoading ? '取得中...' : 'インボイス'}
            </button>
          )}
          <a
            href={`/api/admin/orders/${id}/receipt`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <FileText size={16} />
            領収書
          </a>
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-red-50 text-red-700 text-sm mb-6">{error}</div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items */}
          <div className="bg-white rounded-xl border border-gray-200">
            <div className="p-5 border-b border-gray-200">
              <h2 className="font-semibold text-gray-900">注文商品</h2>
            </div>
            <div className="divide-y divide-gray-100">
              {items.map((item) => (
                <div key={item.id} className="flex items-center gap-4 p-4">
                  {item.image_url ? (
                    <img
                      src={item.image_url}
                      alt=""
                      className="w-12 h-12 rounded-lg object-cover bg-gray-100"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center">
                      <Package size={16} className="text-gray-400" />
                    </div>
                  )}
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{item.product_name}</p>
                    <p className="text-xs text-gray-500">数量: {item.quantity}</p>
                  </div>
                  <p className="text-sm font-medium text-gray-900">
                    {formatPrice(item.price * item.quantity)}
                  </p>
                </div>
              ))}
            </div>
            <div className="p-4 border-t border-gray-200 space-y-1">
              <div className="flex justify-between text-sm text-gray-600">
                <span>小計</span>
                <span>{formatPrice(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>送料</span>
                <span>{formatPrice(order.shipping_fee)}</span>
              </div>
              <div className="flex justify-between text-base font-semibold text-gray-900 pt-2 border-t border-gray-100">
                <span>合計</span>
                <span>{formatPrice(order.total)}</span>
              </div>
            </div>
          </div>

          {/* Status Update */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="font-semibold text-gray-900 mb-4">ステータス更新</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ステータス</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                >
                  {Object.entries(ORDER_STATUS_LABELS).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">配送業者</label>
                <select
                  value={shippingCarrier}
                  onChange={(e) => setShippingCarrier(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                >
                  <option value="">選択してください</option>
                  {Object.entries(SHIPPING_CARRIERS).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">追跡番号</label>
                <input
                  type="text"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  placeholder="追跡番号を入力"
                />
              </div>
              <button
                onClick={handleUpdate}
                disabled={saving}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
              >
                {saving && <Loader2 size={16} className="animate-spin" />}
                更新する
              </button>
            </div>
          </div>

          {/* Refund */}
          {canRefund && (
            <div className="bg-white rounded-xl border border-red-200 p-5">
              <h2 className="font-semibold text-red-700 mb-2">返金処理</h2>
              <p className="text-sm text-gray-600 mb-4">
                Stripeを通じて全額返金を行います。この操作は取り消せません。
              </p>
              {!showRefundConfirm ? (
                <button
                  onClick={() => setShowRefundConfirm(true)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors"
                >
                  返金する
                </button>
              ) : (
                <div className="p-4 bg-red-50 rounded-lg space-y-3">
                  <p className="text-sm font-medium text-red-800">
                    本当に {formatPrice(order!.total)} を返金しますか？
                  </p>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleRefund}
                      disabled={refunding}
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                    >
                      {refunding && <Loader2 size={16} className="animate-spin" />}
                      返金を実行
                    </button>
                    <button
                      onClick={() => setShowRefundConfirm(false)}
                      className="px-5 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
                    >
                      キャンセル
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Order Info */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="font-semibold text-gray-900 mb-3">注文情報</h2>
            <dl className="space-y-2 text-sm">
              <div>
                <dt className="text-gray-500">注文日時</dt>
                <dd className="text-gray-900">{formatDateTime(order.created_at)}</dd>
              </div>
              <div>
                <dt className="text-gray-500">注文番号</dt>
                <dd className="text-gray-900">#{order.order_number}</dd>
              </div>
              {order.invoice_number && (
                <div>
                  <dt className="text-gray-500">インボイス番号</dt>
                  <dd className="text-gray-900 font-mono text-xs">{order.invoice_number}</dd>
                </div>
              )}
              {order.note && (
                <div>
                  <dt className="text-gray-500">備考</dt>
                  <dd className="text-gray-900">{order.note}</dd>
                </div>
              )}
            </dl>
          </div>

          {/* Customer Info */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="font-semibold text-gray-900 mb-3">顧客情報</h2>
            <dl className="space-y-2 text-sm">
              <div>
                <dt className="text-gray-500">氏名</dt>
                <dd className="text-gray-900">{order.shipping_name}</dd>
              </div>
              <div>
                <dt className="text-gray-500">メール</dt>
                <dd className="text-gray-900">{order.email}</dd>
              </div>
              <div>
                <dt className="text-gray-500">電話番号</dt>
                <dd className="text-gray-900">{order.shipping_phone}</dd>
              </div>
            </dl>
          </div>

          {/* Shipping Address */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="font-semibold text-gray-900 mb-3">配送先</h2>
            <div className="text-sm text-gray-900">
              <p>〒{order.shipping_postal_code}</p>
              <p>{order.shipping_address}</p>
              <p>{order.shipping_name}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
