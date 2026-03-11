import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import type { Metadata } from 'next'
import MarketplaceClient from './MarketplaceClient'

export const metadata: Metadata = {
  title: 'マーケットプレイス - デジタルアイテム',
  description: 'メンバーが出品したデジタルアイテムのマーケットプレイス',
}

export default async function MarketplacePage() {
  const supabase = await createClient()

  const { data: listings } = await supabase
    .from('resale_listings')
    .select(`
      *,
      digital_token:digital_tokens(
        *,
        digital_item:digital_items(*)
      ),
      seller:profiles(id, name)
    `)
    .eq('status', 'active')
    .order('created_at', { ascending: false })

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">マーケットプレイス</h1>
          <p className="text-sm text-gray-500 mt-1">メンバーが出品したデジタルアイテム</p>
        </div>
        <Link
          href="/digital"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors bg-gray-50 hover:bg-gray-100 px-4 py-2 rounded-full"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
          </svg>
          デジタルアイテム
        </Link>
      </div>

      {listings && listings.length > 0 ? (
        <MarketplaceClient listings={listings} />
      ) : (
        <div className="text-center py-24">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
            </svg>
          </div>
          <p className="text-gray-400 mb-2">出品されているアイテムはありません</p>
          <p className="text-xs text-gray-300">メンバーがアイテムを出品すると、ここに表示されます</p>
        </div>
      )}
    </div>
  )
}
