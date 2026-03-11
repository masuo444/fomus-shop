import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { formatPrice, formatDate } from '@/lib/utils'
import { ORDER_STATUS_LABELS } from '@/lib/types'
import type { Order } from '@/lib/types'
import Link from 'next/link'
import { ShoppingCart, Package, TrendingUp } from 'lucide-react'

export default async function PartnerDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login?redirect=/partner')

  const { data: profile } = await supabase
    .from('profiles')
    .select('shop_id')
    .eq('id', user.id)
    .single()

  const shopId = profile?.shop_id
  if (!shopId) redirect('/')

  const now = new Date()
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

  const [
    { data: todayOrders },
    { data: monthOrders },
    { count: totalOrders },
    { count: totalProducts },
    { data: recentOrders },
  ] = await Promise.all([
    supabase
      .from('orders')
      .select('total')
      .eq('shop_id', shopId)
      .gte('created_at', todayStart)
      .in('status', ['paid', 'processing', 'shipped', 'delivered']),
    supabase
      .from('orders')
      .select('total')
      .eq('shop_id', shopId)
      .gte('created_at', monthStart)
      .in('status', ['paid', 'processing', 'shipped', 'delivered']),
    supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('shop_id', shopId),
    supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('shop_id', shopId),
    supabase
      .from('orders')
      .select('*')
      .eq('shop_id', shopId)
      .order('created_at', { ascending: false })
      .limit(5),
  ])

  const todaySales = todayOrders?.reduce((sum, o) => sum + o.total, 0) ?? 0
  const monthSales = monthOrders?.reduce((sum, o) => sum + o.total, 0) ?? 0

  const stats = [
    { label: '今日の売上', value: formatPrice(todaySales), icon: TrendingUp, color: 'text-green-600 bg-green-50' },
    { label: '今月の売上', value: formatPrice(monthSales), icon: TrendingUp, color: 'text-blue-600 bg-blue-50' },
    { label: '注文数', value: `${totalOrders ?? 0}件`, icon: ShoppingCart, color: 'text-purple-600 bg-purple-50' },
    { label: '商品数', value: `${totalProducts ?? 0}点`, icon: Package, color: 'text-orange-600 bg-orange-50' },
  ]

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">ダッシュボード</h1>

      {/* Stats Grid */}
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
            </div>
          )
        })}
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="p-5 border-b border-gray-200 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">最近の注文</h2>
          <Link href="/partner/orders" className="text-sm text-blue-600 hover:text-blue-800">
            すべて見る
          </Link>
        </div>
        {recentOrders && recentOrders.length > 0 ? (
          <div className="divide-y divide-gray-100">
            {recentOrders.map((order: Order) => (
              <Link
                key={order.id}
                href={`/partner/orders/${order.id}`}
                className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
              >
                <div>
                  <p className="text-sm font-medium text-gray-900">#{order.order_number}</p>
                  <p className="text-xs text-gray-500">{formatDate(order.created_at)}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{formatPrice(order.total)}</p>
                  <span className="inline-block text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                    {ORDER_STATUS_LABELS[order.status]}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center text-sm text-gray-400">注文はまだありません</div>
        )}
      </div>
    </div>
  )
}
