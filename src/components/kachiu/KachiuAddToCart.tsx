'use client'

import { useState } from 'react'
import { addToLocalCart, wouldMixShops, clearLocalCart } from '@/lib/cart'

// KACHIU の「カートに入れる」。数量は最初から見せる（4商品の店で1段階隠す意味がない）。
// 追加ロジックは共有の lib/cart をそのまま使い、見た目だけ品書きの語法に合わせる。
export default function KachiuAddToCart({
  productId,
  shopId,
  stock,
  price,
  productName,
  madeToOrder,
  quantityLimit,
  compact = false,
}: {
  productId: string
  shopId: string
  stock: number
  price: number
  productName: string
  madeToOrder?: boolean
  quantityLimit?: number | null
  compact?: boolean
}) {
  const [qty, setQty] = useState(1)
  const [added, setAdded] = useState(false)

  const soldOut = stock === 0 && !madeToOrder
  if (price === 0) return null

  const maxQty = Math.max(1, Math.min(quantityLimit ?? 10, madeToOrder ? 10 : stock || 10))

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (soldOut) return
    if (wouldMixShops(shopId)) {
      if (!confirm('別のショップの商品がカートに入っています。カートを空にして続けますか？')) return
      clearLocalCart()
    }
    addToLocalCart(productId, qty, shopId)
    window.dispatchEvent(new Event('cart-updated'))
    window.dispatchEvent(new CustomEvent('cart-toast', { detail: { name: productName } }))
    setAdded(true)
    setTimeout(() => setAdded(false), 1600)
  }

  const stepBtn = 'w-8 md:w-9 h-9 md:h-10 inline-flex items-center justify-center text-[var(--color-muted)] hover:text-[var(--foreground)] transition-colors disabled:opacity-30 disabled:hover:text-[var(--color-muted)]'

  return (
    <div className={`flex flex-col gap-2.5 ${compact ? '' : 'mt-7'}`} onClick={(e) => e.stopPropagation()}>
      {/* 数量 */}
      <div className="inline-flex items-stretch self-start border border-[var(--color-border)] bg-[var(--background)]" aria-label="数量">
        <button type="button" className={stepBtn} onClick={(e) => { e.preventDefault(); setQty((q) => Math.max(1, q - 1)) }} disabled={qty <= 1 || soldOut} aria-label="数量を減らす">
          <span aria-hidden="true" className="text-base leading-none">−</span>
        </button>
        <span className="min-w-[2.2rem] inline-flex items-center justify-center font-serif tabular-nums text-[15px] text-[var(--foreground)]" aria-live="polite">{qty}</span>
        <button type="button" className={stepBtn} onClick={(e) => { e.preventDefault(); setQty((q) => Math.min(maxQty, q + 1)) }} disabled={qty >= maxQty || soldOut} aria-label="数量を増やす">
          <span aria-hidden="true" className="text-base leading-none">+</span>
        </button>
      </div>

      {/* カートに入れる */}
      <button
        type="button"
        onClick={handleAdd}
        disabled={soldOut}
        className={`w-full h-10 md:h-11 px-3 md:px-5 text-[11px] md:text-[12px] tracking-[0.14em] md:tracking-[0.2em] whitespace-nowrap transition-colors duration-300 disabled:cursor-not-allowed ${
          soldOut
            ? 'border border-[var(--color-border)] text-[var(--color-muted)]'
            : added
              ? 'bg-[var(--color-accent)] text-[var(--background)]'
              : 'bg-[var(--foreground)] text-[var(--background)] hover:bg-[var(--color-accent)]'
        }`}
        style={{ textIndent: '0.2em' }}
      >
        {soldOut ? '完売' : added ? 'カートに入れました' : 'カートに入れる'}
      </button>
    </div>
  )
}
