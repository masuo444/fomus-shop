import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { formatPrice, formatDate } from '@/lib/utils'
import type { Commission } from '@/lib/types'
import { TrendingUp, DollarSign, Percent } from 'lucide-react'

export default async function PartnerSalesPage() {
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

  const { data: commissions } = await supabase
    .from('commissions')
    .select('*')
    .eq('shop_id', shopId)
    .order('created_at', { ascending: false })

  const totalSales = commissions?.reduce((s, c) => s + c.order_total, 0) ?? 0
  const totalCommission = commissions?.reduce((s, c) => s + c.commission_amount, 0) ?? 0
  const totalPartnerAmount = commissions?.reduce((s, c) => s + c.partner_amount, 0) ?? 0

  const stats = [
    { label: '総売上', value: formatPrice(totalSales), icon: TrendingUp, color: 'text-blue-600 bg-blue-50' },
    { label: '手数料合計', value: formatPrice(totalCommission), icon: Percent, color: 'text-orange-600 bg-orange-50' },
    { label: 'パートナー収益', value: formatPrice(totalPartnerAmount), icon: DollarSign, color: 'text-green-600 bg-green-50' },
  ]

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">売上</h1>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
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

      {/* Commission Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="p-5 border-b border-gray-200">
          <h2 className="font-semibold text-gray-900">コミッション明細</h2>
        </div>
        {commissions && commissions.length > 0 ? (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left py-3 px-4 font-medium text-gray-500">日付</th>
                <th className="text-right py-3 px-4 font-medium text-gray-500">注文金額</th>
                <th className="text-right py-3 px-4 font-medium text-gray-500">手数料率</th>
                <th className="text-right py-3 px-4 font-medium text-gray-500">手数料</th>
                <th className="text-right py-3 px-4 font-medium text-gray-500">パートナー収益</th>
                <th className="text-center py-3 px-4 font-medium text-gray-500">ステータス</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {commissions.map((commission: Commission) => (
                <tr key={commission.id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-4 text-gray-600">
                    {formatDate(commission.created_at)}
                  </td>
                  <td className="py-3 px-4 text-right text-gray-900">
                    {formatPrice(commission.order_total)}
                  </td>
                  <td className="py-3 px-4 text-right text-gray-600">
                    {(commission.commission_rate * 100).toFixed(1)}%
                  </td>
                  <td className="py-3 px-4 text-right text-gray-900">
                    {formatPrice(commission.commission_amount)}
                  </td>
                  <td className="py-3 px-4 text-right font-medium text-green-700">
                    {formatPrice(commission.partner_amount)}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span
                      className={`inline-block text-xs px-2 py-0.5 rounded-full ${
                        commission.status === 'paid'
                          ? 'bg-green-50 text-green-700'
                          : 'bg-yellow-50 text-yellow-700'
                      }`}
                    >
                      {commission.status === 'paid' ? '支払済み' : '未払い'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="p-12 text-center text-sm text-gray-400">
            コミッションデータはまだありません
          </div>
        )}
      </div>
    </div>
  )
}
