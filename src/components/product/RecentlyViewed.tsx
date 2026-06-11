'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { formatPrice, productPath } from '@/lib/utils'
import type { Product } from '@/lib/types'
import { useCurrency } from '@/hooks/useCurrency'
import { localeFromPathname, localePath, productName } from '@/lib/i18n/common'
import { productDict } from '@/lib/i18n/product'

const STORAGE_KEY = 'fomus_recently_viewed'
const MAX_ITEMS = 8

export function trackProductView(productId: string) {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') as string[]
    const filtered = stored.filter(id => id !== productId)
    filtered.unshift(productId)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered.slice(0, MAX_ITEMS)))
  } catch {}
}

export default function RecentlyViewed({ excludeId }: { excludeId?: string }) {
  const [products, setProducts] = useState<Product[]>([])
  const currency = useCurrency()
  const isEur = currency === 'eur'
  const pathname = usePathname()
  const locale = localeFromPathname(pathname)
  const t = productDict[locale]

  useEffect(() => {
    const load = async () => {
      try {
        const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') as string[]
        const ids = stored.filter(id => id !== excludeId).slice(0, 4)
        if (ids.length === 0) return

        const supabase = createClient()
        const { data } = await supabase
          .from('products')
          .select('*')
          .in('id', ids)
          .eq('is_published', true)

        if (data) {
          // Maintain order from localStorage
          const ordered = ids.map(id => data.find(p => p.id === id)).filter(Boolean) as Product[]
          setProducts(ordered)
        }
      } catch {}
    }
    load()
  }, [excludeId])

  if (products.length === 0) return null

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h2 className="text-sm font-medium text-[var(--color-muted)] tracking-wide mb-6">{t.recentlyViewed}</h2>
      <div className="flex gap-4 overflow-x-auto pb-2">
        {products.map((product) => {
          const price = isEur ? (product.price_eur ?? product.price) : product.price
          return (
            <Link key={product.id} href={localePath(locale, productPath(product))} className="shrink-0 w-36 group">
              <div className="aspect-square bg-[var(--color-subtle)] rounded-lg overflow-hidden relative">
                {product.images?.[0] && (
                  <Image
                    src={product.images[0]}
                    alt={productName(product, locale)}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="144px"
                  />
                )}
              </div>
              <p className="mt-2 text-xs text-[var(--foreground)] line-clamp-1">{productName(product, locale)}</p>
              <p className="text-xs text-[var(--color-muted)]">{formatPrice(price, currency)}</p>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
