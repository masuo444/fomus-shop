'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Check, X } from 'lucide-react'
import { commonDict, localeFromPathname, localePath } from '@/lib/i18n/common'

export default function CartToast() {
  const [visible, setVisible] = useState(false)
  const [productName, setProductName] = useState('')
  const locale = localeFromPathname(usePathname())
  const t = commonDict[locale]

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail
      setProductName(detail?.name || '')
      setVisible(true)
    }
    window.addEventListener('cart-toast', handler)
    return () => window.removeEventListener('cart-toast', handler)
  }, [])

  useEffect(() => {
    if (!visible) return
    const timer = setTimeout(() => setVisible(false), 4000)
    return () => clearTimeout(timer)
  }, [visible])

  if (!visible) return null

  return (
    <div className="fixed bottom-6 right-6 z-[100] animate-slide-up">
      <div className="bg-[var(--background)] border border-[var(--color-border)] shadow-xl rounded-[var(--radius-lg)] px-5 py-4 flex items-start gap-4 max-w-sm">
        <div className="w-8 h-8 rounded-[var(--radius-pill)] bg-[var(--color-subtle)] flex items-center justify-center shrink-0 mt-0.5">
          <Check className="w-4 h-4 text-[var(--color-accent)]" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-[var(--foreground)] mb-1">{t.addedToCart}</p>
          {productName && (
            <p className="text-xs text-[var(--color-muted)] line-clamp-1 mb-3">{productName}</p>
          )}
          <div className="flex items-center gap-3">
            <Link
              href={localePath(locale, '/cart')}
              className="text-xs font-medium bg-[var(--foreground)] text-[var(--background)] px-4 py-1.5 rounded-[var(--radius-pill)] hover:opacity-90 transition-opacity"
            >
              {t.viewCart}
            </Link>
            <button
              onClick={() => setVisible(false)}
              className="text-xs text-[var(--color-muted)] hover:text-[var(--foreground)] transition-colors"
            >
              {t.continueShopping}
            </button>
          </div>
        </div>
        <button onClick={() => setVisible(false)} className="text-[var(--color-muted)] hover:text-[var(--foreground)]">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
