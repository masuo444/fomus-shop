'use client'

import { useState } from 'react'
import { ShoppingCart, Plus, Minus, Check } from 'lucide-react'
import { addToLocalCart, wouldMixShops } from '@/lib/cart'
import Link from 'next/link'

interface QuickAddToCartProps {
  productId: string
  shopId: string
  stock: number
  hasOptions?: boolean
  price: number
}

export default function QuickAddToCart({ productId, shopId, stock, hasOptions, price }: QuickAddToCartProps) {
  const [quantity, setQuantity] = useState(1)
  const [added, setAdded] = useState(false)
  const [showQty, setShowQty] = useState(false)

  if (stock === 0 || price === 0) return null

  // Products with options must go to detail page
  if (hasOptions) {
    return (
      <Link
        href={`/shop/${productId}`}
        className="mt-3 w-full flex items-center justify-center gap-1.5 py-2 text-[10px] tracking-[0.12em] uppercase border border-[var(--color-border)] text-[var(--foreground)] hover:bg-[var(--foreground)] hover:text-[var(--background)] transition-colors"
        onClick={(e) => e.stopPropagation()}
      >
        <ShoppingCart className="w-3 h-3" />
        オプションを選択
      </Link>
    )
  }

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (wouldMixShops(shopId)) {
      if (!confirm('別のショップの商品がカートにあります。カートを空にしてこの商品を追加しますか？')) return
      const { clearLocalCart } = require('@/lib/cart')
      clearLocalCart()
    }

    addToLocalCart(productId, quantity, shopId)
    window.dispatchEvent(new Event('cart-updated'))
    setAdded(true)
    setShowQty(false)
    setQuantity(1)
    setTimeout(() => setAdded(false), 1500)
  }

  if (added) {
    return (
      <div className="mt-3 w-full flex items-center justify-center gap-1.5 py-2 text-[10px] tracking-[0.12em] bg-[var(--foreground)] text-[var(--background)]">
        <Check className="w-3 h-3" />
        カートに追加しました
      </div>
    )
  }

  return (
    <div className="mt-3" onClick={(e) => e.stopPropagation()}>
      {showQty ? (
        <div className="flex items-center gap-1">
          <div className="flex items-center border border-[var(--color-border)]">
            <button
              onClick={(e) => { e.preventDefault(); setQuantity(Math.max(1, quantity - 1)) }}
              className="p-1.5 text-[var(--color-muted)] hover:text-[var(--foreground)] transition-colors"
            >
              <Minus className="w-3 h-3" />
            </button>
            <input
              type="number"
              min={1}
              max={stock}
              value={quantity}
              onChange={(e) => setQuantity(Math.min(stock, Math.max(1, parseInt(e.target.value) || 1)))}
              className="w-10 text-center text-xs border-x border-[var(--color-border)] py-1.5 bg-transparent focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
            <button
              onClick={(e) => { e.preventDefault(); setQuantity(Math.min(stock, quantity + 1)) }}
              className="p-1.5 text-[var(--color-muted)] hover:text-[var(--foreground)] transition-colors"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>
          <button
            onClick={handleAdd}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 text-[10px] tracking-[0.12em] uppercase bg-[var(--foreground)] text-[var(--background)] hover:opacity-90 transition-opacity"
          >
            <ShoppingCart className="w-3 h-3" />
            追加
          </button>
        </div>
      ) : (
        <button
          onClick={(e) => { e.preventDefault(); setShowQty(true) }}
          className="w-full flex items-center justify-center gap-1.5 py-2 text-[10px] tracking-[0.12em] uppercase border border-[var(--color-border)] text-[var(--foreground)] hover:bg-[var(--foreground)] hover:text-[var(--background)] transition-colors"
        >
          <ShoppingCart className="w-3 h-3" />
          カートに入れる
        </button>
      )}
    </div>
  )
}
