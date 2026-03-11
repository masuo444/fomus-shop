'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ShoppingCart } from 'lucide-react'
import { getLocalCart } from '@/lib/cart'

export default function CartIcon() {
  const [count, setCount] = useState(0)

  useEffect(() => {
    const updateCount = () => {
      const cart = getLocalCart()
      setCount(cart.reduce((sum, item) => sum + item.quantity, 0))
    }
    updateCount()

    window.addEventListener('cart-updated', updateCount)
    window.addEventListener('storage', updateCount)
    return () => {
      window.removeEventListener('cart-updated', updateCount)
      window.removeEventListener('storage', updateCount)
    }
  }, [])

  return (
    <Link href="/cart" className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors">
      <ShoppingCart className="w-5 h-5" />
      {count > 0 && (
        <span className="absolute -top-1 -right-1 bg-black text-white text-[10px] font-medium w-5 h-5 rounded-full flex items-center justify-center">
          {count > 99 ? '99+' : count}
        </span>
      )}
    </Link>
  )
}
