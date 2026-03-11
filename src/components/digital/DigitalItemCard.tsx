import Link from 'next/link'
import { formatPrice } from '@/lib/utils'
import type { DigitalItem } from '@/lib/types'

interface Props {
  item: DigitalItem
}

export default function DigitalItemCard({ item }: Props) {
  const isSoldOut = item.issued_count >= item.total_supply
  const remaining = item.total_supply - item.issued_count

  return (
    <Link href={`/digital/${item.id}`} className="group block">
      <div className="relative aspect-square bg-gray-100 rounded-xl overflow-hidden">
        {item.image_url ? (
          <img
            src={item.image_url}
            alt={item.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-200">
            <svg className="w-16 h-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
              />
            </svg>
          </div>
        )}

        {/* Supply badge */}
        {!isSoldOut && (
          <div className="absolute top-2.5 left-2.5 bg-black/70 backdrop-blur-sm text-white text-[10px] font-medium px-2.5 py-1 rounded-full">
            残り {remaining}
          </div>
        )}

        {/* Sold out overlay */}
        {isSoldOut && (
          <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px] flex items-center justify-center">
            <span className="bg-white text-black text-xs font-bold px-4 py-1.5 rounded-full tracking-wider">
              SOLD OUT
            </span>
          </div>
        )}

        {/* Resale badge */}
        {item.resale_enabled && !isSoldOut && (
          <div className="absolute bottom-2.5 right-2.5 bg-white/90 backdrop-blur-sm text-[10px] text-gray-600 px-2 py-0.5 rounded-full">
            リセール可
          </div>
        )}
      </div>

      <div className="mt-3 px-0.5">
        <h3 className="text-sm font-medium text-gray-900 group-hover:text-gray-600 transition-colors line-clamp-2 leading-snug">
          {item.name}
        </h3>
        <div className="mt-1.5 flex items-center justify-between">
          <span className="text-sm font-bold text-gray-900">{formatPrice(item.price)}</span>
          <span className="text-[10px] text-gray-400">
            {item.issued_count}/{item.total_supply}
          </span>
        </div>
      </div>
    </Link>
  )
}
