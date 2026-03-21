'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ShoppingCart } from 'lucide-react'
import { getLocalCart } from '@/lib/cart'
import { usePathname } from 'next/navigation'

export default function MobileCartBar() {
  const [cartCount, setCartCount] = useState(0)
  const pathname = usePathname()

  useEffect(() => {
    const update = () => {
      const cart = getLocalCart()
      setCartCount(cart.reduce((sum, item) => sum + item.quantity, 0))
    }
    update()
    window.addEventListener('cart-updated', update)
    window.addEventListener('storage', update)
    return () => {
      window.removeEventListener('cart-updated', update)
      window.removeEventListener('storage', update)
    }
  }, [])

  // Hide on cart/checkout/admin pages
  const hiddenPaths = ['/cart', '/checkout', '/admin', '/partner', '/auth']
  if (hiddenPaths.some(p => pathname.startsWith(p))) return null
  if (cartCount === 0) return null

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-[var(--color-border)] px-4 py-3 safe-area-bottom">
      <Link
        href="/cart"
        className="flex items-center justify-center gap-2 w-full bg-[var(--foreground)] text-white py-3 rounded-full text-sm font-medium"
      >
        <ShoppingCart className="w-4 h-4" />
        カートを見る ({cartCount})
      </Link>
    </div>
  )
}
