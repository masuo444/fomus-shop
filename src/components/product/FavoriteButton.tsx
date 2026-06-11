'use client'

import { useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { Heart } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { localeFromPathname } from '@/lib/i18n/common'
import { productDict } from '@/lib/i18n/product'

interface FavoriteButtonProps {
  productId: string
  initialFavorited?: boolean
  size?: 'sm' | 'md'
}

export default function FavoriteButton({
  productId,
  initialFavorited = false,
  size = 'md',
}: FavoriteButtonProps) {
  const router = useRouter()
  const pathname = usePathname()
  const t = productDict[localeFromPathname(pathname)]
  const [favorited, setFavorited] = useState(initialFavorited)
  const [loading, setLoading] = useState(false)

  const iconSize = size === 'sm' ? 16 : 20

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    // Check if logged in
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      router.push('/auth/login')
      return
    }

    setLoading(true)
    try {
      if (favorited) {
        await fetch('/api/favorites', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ product_id: productId }),
        })
        setFavorited(false)
      } else {
        await fetch('/api/favorites', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ product_id: productId }),
        })
        setFavorited(true)
      }
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className="p-1.5 rounded-full hover:bg-white/80 transition-colors disabled:opacity-50"
      aria-label={favorited ? t.removeFavorite : t.addFavorite}
    >
      <Heart
        size={iconSize}
        className={
          favorited
            ? 'fill-red-500 text-red-500'
            : 'text-gray-400 hover:text-red-400'
        }
      />
    </button>
  )
}
