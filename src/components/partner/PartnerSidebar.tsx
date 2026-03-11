'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Home,
  Package,
  ShoppingCart,
  TrendingUp,
  Gem,
  Settings,
  LogOut,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const menuItems = [
  { href: '/partner', label: 'ホーム', icon: Home },
  { href: '/partner/products', label: '商品', icon: Package },
  { href: '/partner/orders', label: '注文', icon: ShoppingCart },
  { href: '/partner/sales', label: '売上', icon: TrendingUp },
  { href: '/partner/digital', label: 'デジタル', icon: Gem },
  { href: '/partner/settings', label: '設定', icon: Settings },
]

export default function PartnerSidebar() {
  const pathname = usePathname()

  const isActive = (item: typeof menuItems[number]) => {
    if (item.href === '/partner') return pathname === '/partner'
    return pathname.startsWith(item.href)
  }

  return (
    <aside className="w-60 min-h-screen bg-white border-r border-gray-200 flex flex-col">
      <div className="h-16 flex items-center px-6 border-b border-gray-200">
        <Link href="/partner" className="text-lg font-bold text-gray-900 tracking-tight">
          Partner
        </Link>
      </div>

      <nav className="flex-1 py-4 px-3 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon
          const active = isActive(item)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                active
                  ? 'bg-gray-900 text-white'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              )}
            >
              <Icon size={18} />
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="p-3 border-t border-gray-200">
        <Link
          href="/"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
        >
          <LogOut size={18} />
          ショップに戻る
        </Link>
      </div>
    </aside>
  )
}
