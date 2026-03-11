import { createClient } from '@/lib/supabase/server'
import { getPlatformShopId } from '@/lib/shop'
import { notFound } from 'next/navigation'
import { formatPrice, formatDateTime } from '@/lib/utils'
import DigitalItemForm from '@/components/admin/DigitalItemForm'
import Link from 'next/link'
import { ArrowLeft, User, TrendingUp, DollarSign, Hash } from 'lucide-react'

export default async function EditDigitalItemPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const shopId = await getPlatformShopId()
  if (!shopId) return <div className="text-gray-500">ショップが見つかりません</div>

  const { data: item } = await supabase
    .from('digital_items')
    .select('*')
    .eq('id', id)
    .eq('shop_id', shopId)
    .single()

  if (!item) notFound()

  // Get issued tokens with owners
  const { data: tokens } = await supabase
    .from('digital_tokens')
    .select('*, owner:profiles!digital_tokens_current_owner_id_fkey(id, name, email)')
    .eq('digital_item_id', id)
    .order('token_number', { ascending: true })

  // Get all token IDs for this item
  const tokenIds = tokens?.map((t) => t.id) || []

  // Get ownership transfers for all tokens of this item
  let transfers: Array<{
    id: string
    digital_token_id: string
    from_user_id: string | null
    to_user_id: string
    price: number
    royalty_amount: number
    seller_amount: number
    transfer_type: string
    created_at: string
  }> = []

  if (tokenIds.length > 0) {
    const { data: transfersData } = await supabase
      .from('ownership_transfers')
      .select('*')
      .in('digital_token_id', tokenIds)
      .order('created_at', { ascending: false })
      .limit(50)

    transfers = transfersData || []
  }

  // Calculate stats
  const totalRevenue = transfers.reduce((sum, t) => sum + t.price, 0)
  const resaleTransfers = transfers.filter((t) => t.transfer_type === 'resale')
  const totalRoyalty = resaleTransfers.reduce((sum, t) => sum + (t.royalty_amount || 0), 0)
  const purchaseCount = transfers.filter((t) => t.transfer_type === 'purchase').length
  const resaleCount = resaleTransfers.length

  // Group transfers by token
  const transfersByToken: Record<string, typeof transfers> = {}
  for (const t of transfers) {
    if (!transfersByToken[t.digital_token_id]) {
      transfersByToken[t.digital_token_id] = []
    }
    transfersByToken[t.digital_token_id].push(t)
  }

  // Get active listings count
  let activeListingsCount = 0
  if (tokenIds.length > 0) {
    const { count } = await supabase
      .from('resale_listings')
      .select('id', { count: 'exact', head: true })
      .in('digital_token_id', tokenIds)
      .eq('status', 'active')

    activeListingsCount = count || 0
  }

  return (
    <div>
      <Link
        href="/admin/digital"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 mb-4 transition-colors"
      >
        <ArrowLeft size={16} />
        デジタルアイテム一覧に戻る
      </Link>

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">デジタルアイテムを編集</h1>
        <Link
          href={`/digital/${id}`}
          target="_blank"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
          プレビュー
        </Link>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-1">
            <Hash size={14} className="text-gray-400" />
            <p className="text-xs text-gray-500">発行数</p>
          </div>
          <p className="text-xl font-bold text-gray-900">
            {item.issued_count}
            <span className="text-sm font-normal text-gray-400"> / {item.total_supply}</span>
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-1">
            <DollarSign size={14} className="text-gray-400" />
            <p className="text-xs text-gray-500">初回売上</p>
          </div>
          <p className="text-xl font-bold text-gray-900">
            {formatPrice(purchaseCount * item.price)}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp size={14} className="text-teal-500" />
            <p className="text-xs text-gray-500">ロイヤリティ収入</p>
          </div>
          <p className="text-xl font-bold text-teal-600">{formatPrice(totalRoyalty)}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-1">
            <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
            <p className="text-xs text-gray-500">リセール数</p>
          </div>
          <p className="text-xl font-bold text-gray-900">{resaleCount}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-1">
            <svg className="w-3.5 h-3.5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
            </svg>
            <p className="text-xs text-gray-500">出品中</p>
          </div>
          <p className="text-xl font-bold text-blue-600">{activeListingsCount}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <DigitalItemForm item={item} shopId={shopId} />
        </div>

        <div className="space-y-6">
          {/* Issued Tokens */}
          <div className="bg-white rounded-xl border border-gray-200">
            <div className="p-5 border-b border-gray-200">
              <h2 className="font-semibold text-gray-900">
                発行済みトークン ({tokens?.length ?? 0} / {item.total_supply})
              </h2>
            </div>
            {tokens && tokens.length > 0 ? (
              <div className="divide-y divide-gray-100 max-h-96 overflow-y-auto">
                {tokens.map((token) => {
                  const tokenHistory = transfersByToken[token.id] || []
                  return (
                    <div key={token.id} className="p-3">
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-mono text-gray-400 w-8">
                          #{token.token_number}
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <User size={12} className="text-gray-400 flex-shrink-0" />
                            <span className="text-sm text-gray-900 truncate">
                              {token.owner?.email ?? token.owner?.name ?? '不明'}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] text-gray-400">
                              {formatPrice(token.original_price)}
                            </span>
                            {tokenHistory.length > 1 && (
                              <span className="text-[10px] text-purple-500">
                                {tokenHistory.filter((t) => t.transfer_type === 'resale').length}回リセール
                              </span>
                            )}
                          </div>
                        </div>
                        <span
                          className={`text-[10px] px-1.5 py-0.5 rounded flex-shrink-0 ${
                            token.status === 'listed'
                              ? 'bg-yellow-50 text-yellow-700'
                              : token.status === 'transferred'
                              ? 'bg-purple-50 text-purple-700'
                              : 'bg-green-50 text-green-700'
                          }`}
                        >
                          {token.status === 'owned'
                            ? '保有中'
                            : token.status === 'listed'
                            ? '出品中'
                            : '譲渡済'}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="p-6 text-center text-sm text-gray-400">
                まだトークンは発行されていません
              </div>
            )}
          </div>

          {/* Recent Transfers */}
          <div className="bg-white rounded-xl border border-gray-200">
            <div className="p-5 border-b border-gray-200">
              <h2 className="font-semibold text-gray-900">
                最近の取引履歴 ({transfers.length})
              </h2>
            </div>
            {transfers.length > 0 ? (
              <div className="divide-y divide-gray-100 max-h-80 overflow-y-auto">
                {transfers.map((transfer) => {
                  const token = tokens?.find((t) => t.id === transfer.digital_token_id)
                  return (
                    <div key={transfer.id} className="p-3">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          {token && (
                            <span className="text-[10px] font-mono text-gray-400">
                              #{token.token_number}
                            </span>
                          )}
                          <span
                            className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${
                              transfer.transfer_type === 'purchase'
                                ? 'bg-teal-50 text-teal-700'
                                : transfer.transfer_type === 'resale'
                                ? 'bg-purple-50 text-purple-700'
                                : 'bg-amber-50 text-amber-700'
                            }`}
                          >
                            {transfer.transfer_type === 'purchase'
                              ? '購入'
                              : transfer.transfer_type === 'resale'
                              ? 'リセール'
                              : 'ギフト'}
                          </span>
                        </div>
                        <span className="text-[10px] text-gray-400">
                          {formatDateTime(transfer.created_at)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-900">
                          {formatPrice(transfer.price)}
                        </span>
                        {transfer.royalty_amount > 0 && (
                          <span className="text-[10px] text-teal-600 font-medium">
                            ロイヤリティ: {formatPrice(transfer.royalty_amount)}
                          </span>
                        )}
                      </div>
                      {transfer.seller_amount > 0 && transfer.transfer_type === 'resale' && (
                        <p className="text-[10px] text-gray-400 mt-0.5">
                          出品者報酬: {formatPrice(transfer.seller_amount)}
                        </p>
                      )}
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="p-6 text-center text-sm text-gray-400">
                取引履歴はありません
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
