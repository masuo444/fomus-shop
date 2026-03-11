'use client'

import { formatPrice, formatDate } from '@/lib/utils'
import siteConfig from '@/site.config'

interface Transfer {
  id: string
  from_user_id: string | null
  to_user_id: string
  price: number
  royalty_amount: number
  seller_amount: number
  transfer_type: string
  created_at: string
}

interface Props {
  transfers: Transfer[]
  showRoyalty?: boolean
}

export default function OwnershipChain({ transfers, showRoyalty = false }: Props) {
  if (transfers.length === 0) return null

  const transferTypeLabel = (type: string) => {
    switch (type) {
      case 'purchase':
        return '初回購入'
      case 'resale':
        return 'リセール'
      case 'gift':
        return 'ギフト'
      default:
        return type
    }
  }

  const transferTypeColor = (type: string) => {
    switch (type) {
      case 'purchase':
        return 'bg-teal-50 text-teal-700 border-teal-200'
      case 'resale':
        return 'bg-purple-50 text-purple-700 border-purple-200'
      case 'gift':
        return 'bg-amber-50 text-amber-700 border-amber-200'
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200'
    }
  }

  return (
    <div className="space-y-0">
      {transfers.map((transfer, index) => (
        <div key={transfer.id} className="relative">
          {/* Connector line */}
          {index < transfers.length - 1 && (
            <div className="absolute left-4 top-10 bottom-0 w-px bg-gray-200" />
          )}

          <div className="flex items-start gap-4 py-3">
            {/* Timeline dot */}
            <div className="relative flex-shrink-0 mt-0.5">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center border ${
                  transfer.transfer_type === 'purchase'
                    ? 'bg-teal-50 border-teal-300'
                    : transfer.transfer_type === 'resale'
                    ? 'bg-purple-50 border-purple-300'
                    : 'bg-amber-50 border-amber-300'
                }`}
              >
                {transfer.transfer_type === 'purchase' ? (
                  <svg className="w-3.5 h-3.5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                ) : transfer.transfer_type === 'resale' ? (
                  <svg className="w-3.5 h-3.5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                ) : (
                  <svg className="w-3.5 h-3.5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                  </svg>
                )}
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span
                  className={`inline-flex text-[10px] font-medium px-2 py-0.5 rounded-full border ${transferTypeColor(
                    transfer.transfer_type
                  )}`}
                >
                  {transferTypeLabel(transfer.transfer_type)}
                </span>
                <span className="text-xs text-gray-400">{formatDate(transfer.created_at)}</span>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-900">
                  {formatPrice(transfer.price)}
                </span>
                {showRoyalty && transfer.royalty_amount > 0 && (
                  <span className="text-[10px] text-gray-400">
                    ロイヤリティ: {formatPrice(transfer.royalty_amount)}
                  </span>
                )}
              </div>

              <div className="mt-0.5 text-xs text-gray-400">
                {transfer.from_user_id === null ? (
                  <span>{siteConfig.name} &rarr; ユーザー</span>
                ) : (
                  <span>ユーザー &rarr; ユーザー</span>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
