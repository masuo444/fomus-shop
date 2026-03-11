import { createClient } from '@/lib/supabase/server'
import { getPlatformShopId } from '@/lib/shop'
import { formatPrice } from '@/lib/utils'
import type { DigitalItem } from '@/lib/types'
import Link from 'next/link'
import { Plus, Gem } from 'lucide-react'
import AdminDigitalActions from './AdminDigitalActions'

export default async function AdminDigitalPage() {
  const supabase = await createClient()

  const shopId = await getPlatformShopId()
  if (!shopId) return <div className="text-gray-500">ショップが見つかりません</div>

  const { data: items } = await supabase
    .from('digital_items')
    .select('*')
    .eq('shop_id', shopId)
    .order('created_at', { ascending: false })

  // Get resale stats
  const { data: resaleStats } = await supabase
    .from('ownership_transfers')
    .select('digital_token_id, royalty_amount, price, transfer_type')

  // Aggregate royalty revenue per item
  const royaltyByItem: Record<string, { totalRevenue: number; totalRoyalty: number; resaleCount: number }> = {}

  if (resaleStats && items) {
    // Get token-to-item mapping
    const { data: allTokens } = await supabase
      .from('digital_tokens')
      .select('id, digital_item_id')
      .in('digital_item_id', items.map(i => i.id))

    const tokenItemMap: Record<string, string> = {}
    if (allTokens) {
      for (const t of allTokens) {
        tokenItemMap[t.id] = t.digital_item_id
      }
    }

    for (const transfer of resaleStats) {
      const itemId = tokenItemMap[transfer.digital_token_id]
      if (!itemId) continue
      if (!royaltyByItem[itemId]) {
        royaltyByItem[itemId] = { totalRevenue: 0, totalRoyalty: 0, resaleCount: 0 }
      }
      royaltyByItem[itemId].totalRevenue += transfer.price
      if (transfer.transfer_type === 'resale') {
        royaltyByItem[itemId].totalRoyalty += transfer.royalty_amount || 0
        royaltyByItem[itemId].resaleCount += 1
      }
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">デジタルアイテム管理</h1>
        <Link
          href="/admin/digital/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
        >
          <Plus size={16} />
          新規デジタルアイテム
        </Link>
      </div>

      {/* Stats summary */}
      {items && items.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-xs text-gray-500">アイテム数</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{items.length}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-xs text-gray-500">総発行数</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {items.reduce((sum, i) => sum + (i as DigitalItem).issued_count, 0)}
            </p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-xs text-gray-500">総売上</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {formatPrice(Object.values(royaltyByItem).reduce((sum, s) => sum + s.totalRevenue, 0))}
            </p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-xs text-gray-500">リセールロイヤリティ</p>
            <p className="text-2xl font-bold text-teal-600 mt-1">
              {formatPrice(Object.values(royaltyByItem).reduce((sum, s) => sum + s.totalRoyalty, 0))}
            </p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {items && items.length > 0 ? (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left py-3 px-4 font-medium text-gray-500">アイテム</th>
                <th className="text-right py-3 px-4 font-medium text-gray-500">価格</th>
                <th className="text-right py-3 px-4 font-medium text-gray-500">発行数 / 供給数</th>
                <th className="text-right py-3 px-4 font-medium text-gray-500 hidden md:table-cell">売上</th>
                <th className="text-center py-3 px-4 font-medium text-gray-500">リセール</th>
                <th className="text-center py-3 px-4 font-medium text-gray-500">ステータス</th>
                <th className="text-right py-3 px-4 font-medium text-gray-500"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {(items as DigitalItem[]).map((item) => {
                const stats = royaltyByItem[item.id] || { totalRevenue: 0, totalRoyalty: 0, resaleCount: 0 }
                return (
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        {item.image_url ? (
                          <img
                            src={item.image_url}
                            alt=""
                            className="w-10 h-10 rounded-lg object-cover bg-gray-100"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                            <Gem size={16} className="text-gray-400" />
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-gray-900">{item.name}</p>
                          <p className="text-xs text-gray-500">
                            ロイヤリティ: {item.royalty_percentage}%
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right font-medium text-gray-900">
                      {formatPrice(item.price)}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className="text-gray-900 font-medium">{item.issued_count}</span>
                      <span className="text-gray-400"> / {item.total_supply}</span>
                      {item.issued_count >= item.total_supply && (
                        <span className="ml-1.5 text-[10px] bg-red-50 text-red-600 px-1.5 py-0.5 rounded">
                          完売
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right hidden md:table-cell">
                      <div>
                        <p className="text-gray-900 font-medium">{formatPrice(stats.totalRevenue)}</p>
                        {stats.totalRoyalty > 0 && (
                          <p className="text-[10px] text-teal-600">
                            ロイヤリティ: {formatPrice(stats.totalRoyalty)} ({stats.resaleCount}件)
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${
                          item.resale_enabled
                            ? 'bg-green-50 text-green-700'
                            : 'bg-gray-100 text-gray-500'
                        }`}
                      >
                        {item.resale_enabled ? '有効' : '無効'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${
                          item.is_published
                            ? 'bg-green-50 text-green-700'
                            : 'bg-gray-100 text-gray-500'
                        }`}
                      >
                        {item.is_published ? '公開' : '下書き'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <AdminDigitalActions itemId={item.id} itemName={item.name} />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        ) : (
          <div className="p-12 text-center text-gray-400">
            <Gem size={32} className="mx-auto mb-3 text-gray-300" />
            <p>デジタルアイテムはまだありません</p>
            <Link
              href="/admin/digital/new"
              className="text-blue-600 hover:text-blue-800 text-sm mt-2 inline-block"
            >
              最初のデジタルアイテムを作成する
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
