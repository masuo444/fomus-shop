'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Home,
  Package,
  ShoppingCart,
  Users,
  TrendingUp,
  BarChart3,
  Gem,
  Handshake,
  Tag,
  Ticket,
  Banknote,
  Rocket,
  Settings,
  LogOut,
  LinkIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import siteConfig from '@/site.config'

const menuItems = [
  { href: '/admin', label: 'ホーム', icon: Home },
  { href: '/admin/products', label: '商品', icon: Package, exact: true },
  { href: '/admin/products/links', label: '商品リンク', icon: LinkIcon },
  { href: '/admin/orders', label: '注文', icon: ShoppingCart },
  { href: '/admin/customers', label: '顧客', icon: Users },
  { href: '/admin/sales', label: '売上', icon: TrendingUp },
  { href: '/admin/analytics', label: 'データ', icon: BarChart3 },
  { href: '/admin/digital', label: 'デジタル', icon: Gem },
  { href: '/admin/members', label: '会員権限', icon: Ticket },
  { href: '/admin/partners', label: 'パートナー', icon: Handshake },
  { href: '/admin/coupons', label: 'クーポン', icon: Tag },
  { href: '/admin/payouts', label: '振込申請', icon: Banknote },
  { href: '/admin/crowdfunding', label: 'クラファン', icon: Rocket },
  { href: '/admin/settings', label: '設定', icon: Settings },
]

export default function AdminSidebar() {
  const pathname = usePathname()

  const isActive = (item: typeof menuItems[number]) => {
    if (item.href === '/admin') return pathname === '/admin'
    if (item.exact) {
      // For exact items, match the path itself or sub-paths not claimed by other menu items
      if (pathname === item.href) return true
      if (pathname.startsWith(item.href + '/')) {
        return !menuItems.some(m => m.href !== item.href && m.href.startsWith(item.href + '/') && pathname.startsWith(m.href))
      }
      return false
    }
    return pathname.startsWith(item.href)
  }

  return (
    <aside className="w-60 min-h-screen bg-white border-r border-gray-200 flex flex-col">
      <div className="h-16 flex items-center px-6 border-b border-gray-200">
        <Link href="/admin" className="text-lg font-bold text-gray-900 tracking-tight">
          {siteConfig.name} Admin
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
