import { createClient } from '@/lib/supabase/server'
import { getPlatformShopId } from '@/lib/shop'
import { formatPrice } from '@/lib/utils'
import { BarChart3, Users, ShoppingCart, Package } from 'lucide-react'

export default async function AdminAnalyticsPage() {
  const supabase = await createClient()

  const shopId = await getPlatformShopId()
  if (!shopId) return <div className="text-gray-500">ショップが見つかりません</div>

  const paidStatuses = ['paid', 'processing', 'shipped', 'delivered']

  // Get daily sales for last 7 days
  const days: { date: string; label: string; total: number; count: number }[] = []
  const now = new Date()
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i)
    const dayStart = d.toISOString()
    const dayEnd = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1).toISOString()
    days.push({
      date: dayStart,
      label: `${d.getMonth() + 1}/${d.getDate()}`,
      total: 0,
      count: 0,
    })
  }

  // Fetch orders for last 7 days
  const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6).toISOString()
  const { data: weekOrders } = await supabase
    .from('orders')
    .select('total, created_at')
    .eq('shop_id', shopId)
    .in('status', paidStatuses)
    .gte('created_at', weekStart)

  // Aggregate by day
  if (weekOrders) {
    for (const order of weekOrders) {
      const orderDate = new Date(order.created_at)
      const orderDay = `${orderDate.getMonth() + 1}/${orderDate.getDate()}`
      const day = days.find((d) => d.label === orderDay)
      if (day) {
        day.total += order.total
        day.count += 1
      }
    }
  }

  const maxDaySales = Math.max(...days.map((d) => d.total), 1)

  // Top products
  const { data: topProducts } = await supabase
    .from('order_items')
    .select('product_name, quantity, price, image_url, order_id')
    .limit(500)

  // Aggregate by product name
  const productMap = new Map<string, { name: string; qty: number; revenue: number; image: string | null }>()
  if (topProducts) {
    for (const item of topProducts) {
      const existing = productMap.get(item.product_name)
      if (existing) {
        existing.qty += item.quantity
        existing.revenue += item.price * item.quantity
      } else {
        productMap.set(item.product_name, {
          name: item.product_name,
          qty: item.quantity,
          revenue: item.price * item.quantity,
          image: item.image_url,
        })
      }
    }
  }
  const topProductsList = Array.from(productMap.values())
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 10)

  // Customer stats
  const [
    { count: totalCustomers },
    { data: allOrders },
  ] = await Promise.all([
    supabase
      .from('customers')
      .select('*', { count: 'exact', head: true })
      .eq('shop_id', shopId),
    supabase
      .from('orders')
      .select('total')
      .eq('shop_id', shopId)
      .in('status', paidStatuses),
  ])

  const totalRevenue = allOrders?.reduce((s, o) => s + o.total, 0) ?? 0
  const totalOrderCount = allOrders?.length ?? 0
  const avgOrderValue = totalOrderCount > 0 ? Math.round(totalRevenue / totalOrderCount) : 0
  const avgPerCustomer = totalCustomers && totalCustomers > 0 ? Math.round(totalRevenue / totalCustomers) : 0

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">データ分析</h1>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: '累計売上', value: formatPrice(totalRevenue), icon: BarChart3, color: 'text-green-600 bg-green-50' },
          { label: '総注文数', value: `${totalOrderCount}件`, icon: ShoppingCart, color: 'text-blue-600 bg-blue-50' },
          { label: '平均注文額', value: formatPrice(avgOrderValue), icon: Package, color: 'text-purple-600 bg-purple-50' },
          { label: '顧客あたり売上', value: formatPrice(avgPerCustomer), icon: Users, color: 'text-orange-600 bg-orange-50' },
        ].map((stat) => {
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Sales Chart (text-based) */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-900 mb-4">直近7日間の売上</h2>
          <div className="space-y-3">
            {days.map((day) => (
              <div key={day.label} className="flex items-center gap-3">
                <span className="text-xs text-gray-500 w-10 text-right">{day.label}</span>
                <div className="flex-1 h-7 bg-gray-50 rounded-md overflow-hidden relative">
                  <div
                    className="h-full bg-gray-900 rounded-md transition-all"
                    style={{ width: `${Math.max((day.total / maxDaySales) * 100, 0)}%` }}
                  />
                  {day.total > 0 && (
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-500">
                      {formatPrice(day.total)} ({day.count}件)
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="p-5 border-b border-gray-200">
            <h2 className="font-semibold text-gray-900">売上トップ商品</h2>
          </div>
          {topProductsList.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {topProductsList.map((product, i) => (
                <div key={product.name} className="flex items-center gap-3 p-4">
                  <span className="w-6 text-center text-xs font-bold text-gray-400">{i + 1}</span>
                  {product.image ? (
                    <img
                      src={product.image}
                      alt=""
                      className="w-9 h-9 rounded-lg object-cover bg-gray-100"
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center">
                      <Package size={14} className="text-gray-400" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{product.name}</p>
                    <p className="text-xs text-gray-500">{product.qty}個販売</p>
                  </div>
                  <span className="text-sm font-medium text-gray-900">{formatPrice(product.revenue)}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-sm text-gray-400">データがありません</div>
          )}
        </div>
      </div>

      {/* Customer Stats */}
      <div className="mt-6 bg-white rounded-xl border border-gray-200 p-5">
        <h2 className="font-semibold text-gray-900 mb-4">顧客統計</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div>
            <p className="text-sm text-gray-500">総顧客数</p>
            <p className="text-xl font-bold text-gray-900">{totalCustomers ?? 0}人</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">顧客あたり平均注文数</p>
            <p className="text-xl font-bold text-gray-900">
              {totalCustomers && totalCustomers > 0
                ? (totalOrderCount / totalCustomers).toFixed(1)
                : '0'}
              件
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">顧客あたり平均売上</p>
            <p className="text-xl font-bold text-gray-900">{formatPrice(avgPerCustomer)}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
