'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { getLocalCart } from '@/lib/cart'
import siteConfig from '@/site.config'

// KACHIU のヘッダー。商品が4点しかない店に検索・言語切替・会員導線は要らない。
// ワードマーク／公式サイトへ戻る／カート の3点だけ。
// kachiu.jp のヘッダーと同じ高さ・同じ字間で、サイトを跨いだ感覚を出さない。
export default function KachiuHeader() {
  const [scrolled, setScrolled] = useState(false)
  const [count, setCount] = useState(0)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const update = () => setCount(getLocalCart().reduce((n, i) => n + i.quantity, 0))
    update()
    window.addEventListener('cart-updated', update)
    window.addEventListener('storage', update)
    return () => {
      window.removeEventListener('cart-updated', update)
      window.removeEventListener('storage', update)
    }
  }, [])

  return (
    <header
      className={`sticky top-0 z-50 transition-[background-color,border-color,backdrop-filter] duration-500 ${
        scrolled ? 'bg-[var(--background)]/92 backdrop-blur-md border-b border-[var(--color-border)]' : 'border-b border-transparent'
      }`}
    >
      <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-10">
        <div className="flex items-center justify-between h-[72px] md:h-20">
          {/* Wordmark — kachiu.jp と同じ Cormorant、同じ字間 */}
          <Link
            href="/"
            className="font-serif font-medium text-[var(--foreground)] hover:opacity-70 transition-opacity"
            style={{ fontSize: 22, letterSpacing: '0.3em' }}
            aria-label="KACHIU オンラインショップ トップ"
          >
            KACHIU
          </Link>

          <nav className="flex items-center gap-7 md:gap-10" aria-label="ショップナビゲーション">
            <a
              href={siteConfig.corporateUrl}
              className="hidden sm:inline text-[11px] tracking-[0.22em] text-[var(--color-muted)] hover:text-[var(--foreground)] transition-colors"
            >
              公式サイト
            </a>
            <Link
              href="/cart"
              className="relative inline-flex items-center gap-2.5 text-[11px] tracking-[0.22em] text-[var(--foreground)] hover:opacity-70 transition-opacity"
              aria-label={`カート（${count}点）`}
            >
              <span>カート</span>
              {/* 点数は括弧で。バッジ状の赤丸は kachiu.jp の語法に無い */}
              <span
                className="font-serif tabular-nums transition-colors"
                style={{ color: count > 0 ? 'var(--color-accent)' : 'var(--color-muted)', letterSpacing: '0.05em', fontSize: 15, lineHeight: 1 }}
              >
                ({count})
              </span>
            </Link>
          </nav>
        </div>
      </div>
    </header>
  )
}
