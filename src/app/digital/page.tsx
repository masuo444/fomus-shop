import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getPublishedShopIds } from '@/lib/shop'
import type { DigitalItem } from '@/lib/types'
import type { Metadata } from 'next'
import DigitalItemCard from '@/components/digital/DigitalItemCard'

export const metadata: Metadata = {
  title: 'デジタルアイテム',
  description: '限定デジタルアイテム・デジタルチケットのコレクション',
}

export default async function DigitalPage() {
  const supabase = await createClient()

  const shopIds = await getPublishedShopIds()

  let items: DigitalItem[] = []

  if (shopIds.length > 0) {
    const { data } = await supabase
      .from('digital_items')
      .select('id, shop_id, name, description, image_url, price, total_supply, issued_count, royalty_percentage, resale_enabled, is_published, item_category, created_by, metadata, created_at, updated_at')
      .in('shop_id', shopIds)
      .eq('is_published', true)
      .order('created_at', { ascending: false })

    items = (data || []).map(d => ({ ...d, secret_content: null })) as DigitalItem[]
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">デジタルアイテム</h1>
          <p className="text-sm text-gray-500 mt-1">限定デジタルアイテム・デジタルチケット</p>
        </div>
        <Link
          href="/digital/marketplace"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors bg-gray-50 hover:bg-gray-100 px-4 py-2 rounded-full"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
          </svg>
          マーケットプレイス
        </Link>
      </div>

      {/* Login prompt */}
      <div className="mb-6 bg-gradient-to-r from-teal-50 to-cyan-50 border border-teal-100 rounded-xl px-5 py-3 flex items-center gap-3">
        <svg className="w-5 h-5 text-teal-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-sm text-teal-800">
          デジタルアイテムの購入にはログインが必要です。
          <Link href="/auth/login" className="font-medium underline underline-offset-2 hover:text-teal-600 ml-1">
            ログインはこちら
          </Link>
        </p>
      </div>

      {items.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {items.map((item) => (
            <DigitalItemCard key={item.id} item={item} />
          ))}
        </div>
      ) : (
        <div className="text-center py-24">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
            </svg>
          </div>
          <p className="text-gray-400">デジタルアイテムはまだありません</p>
        </div>
      )}
    </div>
  )
}
