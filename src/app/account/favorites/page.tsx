'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ChevronLeft, Heart } from 'lucide-react'
import type { Favorite } from '@/lib/types'
import ProductCard from '@/components/product/ProductCard'
import { useCurrency } from '@/hooks/useCurrency'

export default function FavoritesPage() {
  const currency = useCurrency()
  const [favorites, setFavorites] = useState<Favorite[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadFavorites()
  }, [])

  const loadFavorites = async () => {
    const res = await fetch('/api/favorites')
    if (res.ok) {
      const data = await res.json()
      setFavorites(data)
    }
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-center">
        <div className="animate-pulse text-gray-400">読み込み中...</div>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <Link
        href="/account"
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900 mb-6 transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
        マイページに戻る
      </Link>

      <h1 className="text-2xl font-bold text-gray-900 mb-8">お気に入り</h1>

      {favorites.length === 0 ? (
        <div className="text-center py-16">
          <Heart className="w-12 h-12 text-gray-200 mx-auto mb-4" />
          <p className="text-gray-400">お気に入りがありません</p>
          <Link
            href="/shop"
            className="inline-block mt-4 text-sm text-black underline hover:no-underline"
          >
            商品を見る
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {favorites.map((fav) =>
            fav.product ? (
              <ProductCard key={fav.id} product={fav.product} currency={currency} />
            ) : null
          )}
        </div>
      )}
    </div>
  )
}
