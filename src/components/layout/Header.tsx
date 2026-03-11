'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { ShoppingCart, User, LogOut, Menu, X, Shield, Store } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { getLocalCart } from '@/lib/cart'
import type { User as SupabaseUser } from '@supabase/supabase-js'
import SearchBar from '@/components/layout/SearchBar'
import { ADMIN_EMAILS } from '@/lib/constants'
import siteConfig from '@/site.config'

export default function Header() {
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [isPremiumMember, setIsGuildMember] = useState(false)
  const [userRole, setUserRole] = useState<string | null>(null)
  const [cartCount, setCartCount] = useState(0)
  const [menuOpen, setMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    const loadUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('is_premium_member, role')
          .eq('id', user.id)
          .single()
        if (profile?.is_premium_member) {
          setIsGuildMember(true)
        }
        if (profile?.role) {
          setUserRole(profile.role)
        }
      }
    }
    loadUser()

    const updateCartCount = () => {
      const cart = getLocalCart()
      setCartCount(cart.reduce((sum, item) => sum + item.quantity, 0))
    }
    updateCartCount()

    const handleScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', handleScroll)
    window.addEventListener('cart-updated', updateCartCount)
    window.addEventListener('storage', updateCartCount)
    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('cart-updated', updateCartCount)
      window.removeEventListener('storage', updateCartCount)
    }
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setUserMenuOpen(false)
    window.location.href = '/'
  }

  return (
    <header className={`sticky top-0 z-50 transition-all duration-500 ${
      scrolled
        ? 'bg-[var(--background)]/95 backdrop-blur-md border-b border-[var(--color-border)]'
        : 'bg-[var(--background)] border-b border-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="font-display text-xl tracking-[0.15em] text-[var(--foreground)] hover:opacity-70 transition-opacity">
            {siteConfig.logoUrl ? (
              <img src={siteConfig.logoUrl} alt={siteConfig.logoText} className="h-8" />
            ) : (
              siteConfig.logoText.toUpperCase()
            )}
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-10">
            <Link href="/shop" className="text-xs tracking-[0.15em] uppercase text-[var(--color-muted)] hover:text-[var(--foreground)] transition-colors">
              Shop
            </Link>
            <Link href="/digital" className="text-xs tracking-[0.15em] uppercase text-[var(--color-muted)] hover:text-[var(--foreground)] transition-colors">
              Digital
            </Link>
            {siteConfig.features.marketplace && (
              <Link href="/market" className="text-xs tracking-[0.15em] uppercase text-[var(--color-muted)] hover:text-[var(--foreground)] transition-colors">
                {siteConfig.features.marketplaceName}
              </Link>
            )}
            <Link href="/about" className="text-xs tracking-[0.15em] uppercase text-[var(--color-muted)] hover:text-[var(--foreground)] transition-colors">
              About
            </Link>
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-5">
            {/* Search */}
            <SearchBar />

            {/* Cart */}
            <Link href="/cart" className="relative p-1 text-[var(--color-muted)] hover:text-[var(--foreground)] transition-colors">
              <ShoppingCart className="w-[18px] h-[18px]" strokeWidth={1.5} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1.5 bg-[var(--foreground)] text-[var(--background)] text-[9px] font-medium w-4 h-4 rounded-full flex items-center justify-center">
                  {cartCount > 99 ? '99' : cartCount}
                </span>
              )}
            </Link>

            {/* Auth */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-1.5 p-1 text-[var(--color-muted)] hover:text-[var(--foreground)] transition-colors"
                >
                  <User className="w-[18px] h-[18px]" strokeWidth={1.5} />
                  {isPremiumMember && siteConfig.features.membershipProgram && (
                    <span className="text-[9px] tracking-wider font-medium" style={{ color: 'var(--color-member)' }}>{siteConfig.features.membershipName}</span>
                  )}
                </button>
                {userMenuOpen && (
                  <>
                    <div className="fixed inset-0" onClick={() => setUserMenuOpen(false)} />
                    <div className="absolute right-0 mt-3 w-56 bg-[var(--background)] border border-[var(--color-border)] shadow-lg py-2 z-50">
                      {(userRole === 'admin' || ADMIN_EMAILS.includes(user.email ?? '')) && (
                        <Link
                          href="/admin"
                          className="flex items-center gap-2.5 px-5 py-2.5 text-xs tracking-wide text-[var(--foreground)] hover:bg-[var(--color-subtle)]"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          <Shield className="w-3.5 h-3.5" strokeWidth={1.5} />
                          管理画面
                        </Link>
                      )}
                      {userRole === 'partner' && (
                        <Link
                          href="/partner"
                          className="flex items-center gap-2.5 px-5 py-2.5 text-xs tracking-wide text-[var(--foreground)] hover:bg-[var(--color-subtle)]"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          <Store className="w-3.5 h-3.5" strokeWidth={1.5} />
                          パートナー管理
                        </Link>
                      )}
                      {(userRole === 'admin' || userRole === 'partner') && (
                        <div className="my-1.5 mx-5 h-px bg-[var(--color-border)]" />
                      )}
                      <Link
                        href="/account"
                        className="block px-5 py-2.5 text-xs tracking-wide text-[var(--foreground)] hover:bg-[var(--color-subtle)]"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        マイページ
                      </Link>
                      <Link
                        href="/account/orders"
                        className="block px-5 py-2.5 text-xs tracking-wide text-[var(--foreground)] hover:bg-[var(--color-subtle)]"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        注文履歴
                      </Link>
                      <Link
                        href="/account/digital"
                        className="block px-5 py-2.5 text-xs tracking-wide text-[var(--foreground)] hover:bg-[var(--color-subtle)]"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        デジタルアイテム
                      </Link>
                      <div className="my-1.5 mx-5 h-px bg-[var(--color-border)]" />
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-5 py-2.5 text-xs tracking-wide text-[var(--color-muted)] hover:text-[var(--foreground)] hover:bg-[var(--color-subtle)] flex items-center gap-2.5"
                      >
                        <LogOut className="w-3.5 h-3.5" strokeWidth={1.5} />
                        ログアウト
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-4">
                <Link
                  href="/auth/login"
                  className="text-xs tracking-[0.1em] text-[var(--color-muted)] hover:text-[var(--foreground)] transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/register"
                  className="text-xs tracking-[0.1em] text-[var(--foreground)] border-b border-[var(--foreground)] pb-0.5 hover:opacity-70 transition-opacity"
                >
                  Register
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              className="md:hidden p-1 text-[var(--color-muted)]"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? <X className="w-5 h-5" strokeWidth={1.5} /> : <Menu className="w-5 h-5" strokeWidth={1.5} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {menuOpen && (
          <div className="md:hidden border-t border-[var(--color-border)] py-8 space-y-5">
            <Link href="/shop" className="block text-xs tracking-[0.15em] uppercase text-[var(--color-muted)] hover:text-[var(--foreground)]" onClick={() => setMenuOpen(false)}>
              Shop
            </Link>
            <Link href="/digital" className="block text-xs tracking-[0.15em] uppercase text-[var(--color-muted)] hover:text-[var(--foreground)]" onClick={() => setMenuOpen(false)}>
              Digital
            </Link>
            {siteConfig.features.marketplace && (
              <Link href="/market" className="block text-xs tracking-[0.15em] uppercase text-[var(--color-muted)] hover:text-[var(--foreground)]" onClick={() => setMenuOpen(false)}>
                {siteConfig.features.marketplaceName}
              </Link>
            )}
            <Link href="/about" className="block text-xs tracking-[0.15em] uppercase text-[var(--color-muted)] hover:text-[var(--foreground)]" onClick={() => setMenuOpen(false)}>
              About
            </Link>
            {!user && (
              <div className="pt-5 border-t border-[var(--color-border)] space-y-4">
                <Link href="/auth/login" className="block text-xs tracking-[0.1em] text-[var(--color-muted)]" onClick={() => setMenuOpen(false)}>
                  Sign In
                </Link>
                <Link href="/auth/register" className="block text-xs tracking-[0.1em] text-[var(--foreground)]" onClick={() => setMenuOpen(false)}>
                  Register
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  )
}
