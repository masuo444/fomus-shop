import { createClient } from '@/lib/supabase/server'
import { getPlatformShopId } from '@/lib/shop'
import { formatPrice, formatDateTime } from '@/lib/utils'
import { ORDER_STATUS_LABELS } from '@/lib/types'
import type { Order } from '@/lib/types'
import { TrendingUp, ShoppingCart, Calculator, Receipt, Download } from 'lucide-react'

export default async function AdminSalesPage() {
  const supabase = await createClient()

  const shopId = await getPlatformShopId()
  if (!shopId) return <div className="text-gray-500">ショップが見つかりません</div>

  const now = new Date()
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()
  const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay()).toISOString()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

  const paidStatuses = ['paid', 'processing', 'shipped', 'delivered']

  const [
    { data: allPaidOrders },
    { data: todayOrders },
    { data: weekOrders },
    { data: monthOrders },
    { data: recentPaidOrders },
  ] = await Promise.all([
    supabase
      .from('orders')
      .select('total')
      .eq('shop_id', shopId)
      .in('status', paidStatuses),
    supabase
      .from('orders')
      .select('total')
      .eq('shop_id', shopId)
      .in('status', paidStatuses)
      .gte('created_at', todayStart),
    supabase
      .from('orders')
      .select('total')
      .eq('shop_id', shopId)
      .in('status', paidStatuses)
      .gte('created_at', weekStart),
    supabase
      .from('orders')
      .select('total')
      .eq('shop_id', shopId)
      .in('status', paidStatuses)
      .gte('created_at', monthStart),
    supabase
      .from('orders')
      .select('*')
      .eq('shop_id', shopId)
      .in('status', paidStatuses)
      .order('created_at', { ascending: false })
      .limit(20),
  ])

  const totalSales = allPaidOrders?.reduce((s, o) => s + o.total, 0) ?? 0
  const todaySales = todayOrders?.reduce((s, o) => s + o.total, 0) ?? 0
  const weekSales = weekOrders?.reduce((s, o) => s + o.total, 0) ?? 0
  const monthSales = monthOrders?.reduce((s, o) => s + o.total, 0) ?? 0
  const orderCount = allPaidOrders?.length ?? 0
  const avgOrderValue = orderCount > 0 ? Math.round(totalSales / orderCount) : 0

  const stats = [
    { label: '累計売上', value: formatPrice(totalSales), icon: TrendingUp, color: 'text-green-600 bg-green-50' },
    { label: '今日の売上', value: formatPrice(todaySales), sub: `${todayOrders?.length ?? 0}件`, icon: Receipt, color: 'text-blue-600 bg-blue-50' },
    { label: '今週の売上', value: formatPrice(weekSales), sub: `${weekOrders?.length ?? 0}件`, icon: Calculator, color: 'text-purple-600 bg-purple-50' },
    { label: '今月の売上', value: formatPrice(monthSales), sub: `${monthOrders?.length ?? 0}件`, icon: ShoppingCart, color: 'text-orange-600 bg-orange-50' },
  ]

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">売上管理</h1>
        <a
          href="/api/admin/export/sales"
          download
          className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <Download size={16} />
          CSVエクスポート
        </a>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <div key={stat.label} className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className={`p-2 rounded-lg ${stat.color}`}>
                  <Icon size={18} />
                </div>
                <span className="text-sm text-gray-500">{stat.label}</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              {'sub' in stat && stat.sub && (
                <p className="text-xs text-gray-400 mt-1">{stat.sub}</p>
              )}
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-900 mb-2">注文統計</h2>
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-gray-500">総注文数</dt>
              <dd className="font-medium text-gray-900">{orderCount}件</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">平均注文額</dt>
              <dd className="font-medium text-gray-900">{formatPrice(avgOrderValue)}</dd>
            </div>
          </dl>
        </div>
      </div>

      {/* Recent Paid Orders */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="p-5 border-b border-gray-200">
          <h2 className="font-semibold text-gray-900">最近の売上</h2>
        </div>
        {recentPaidOrders && recentPaidOrders.length > 0 ? (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left py-3 px-4 font-medium text-gray-500">注文番号</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">日時</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">顧客</th>
                <th className="text-right py-3 px-4 font-medium text-gray-500">金額</th>
                <th className="text-center py-3 px-4 font-medium text-gray-500">ステータス</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {(recentPaidOrders as Order[]).map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium text-gray-900">#{order.order_number}</td>
                  <td className="py-3 px-4 text-gray-600">{formatDateTime(order.created_at)}</td>
                  <td className="py-3 px-4 text-gray-600">{order.shipping_name}</td>
                  <td className="py-3 px-4 text-right font-medium text-gray-900">{formatPrice(order.total)}</td>
                  <td className="py-3 px-4 text-center">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-green-50 text-green-700">
                      {ORDER_STATUS_LABELS[order.status]}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="p-12 text-center text-gray-400">売上データはまだありません</div>
        )}
      </div>
    </div>
  )
}
