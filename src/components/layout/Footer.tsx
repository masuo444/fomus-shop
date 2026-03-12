import Link from 'next/link'
import siteConfig from '@/site.config'

export default function Footer() {
  return (
    <footer className="bg-[var(--foreground)] text-[var(--background)]">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 py-16 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12">
          <div className="md:col-span-1">
            <h3 className="font-display text-lg tracking-[0.15em]">{siteConfig.name.toUpperCase()}</h3>
            <p className="mt-4 text-xs leading-relaxed text-white/40">
              {siteConfig.description}
            </p>
          </div>
          <div>
            <h4 className="text-xs tracking-[0.2em] uppercase text-white/30 mb-5">Shop</h4>
            <ul className="space-y-3">
              <li>
                <Link href="/shop" className="text-xs text-white/60 hover:text-white transition-colors">
                  商品一覧
                </Link>
              </li>
              <li>
                <Link href="/digital" className="text-xs text-white/60 hover:text-white transition-colors">
                  デジタルアイテム
                </Link>
              </li>
              <li>
                <Link href="/market" className="text-xs text-white/60 hover:text-white transition-colors">
                  {siteConfig.features.marketplaceName}
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-xs tracking-[0.2em] uppercase text-white/30 mb-5">Account</h4>
            <ul className="space-y-3">
              <li>
                <Link href="/account" className="text-xs text-white/60 hover:text-white transition-colors">
                  マイページ
                </Link>
              </li>
              <li>
                <Link href="/account/orders" className="text-xs text-white/60 hover:text-white transition-colors">
                  注文履歴
                </Link>
              </li>
              <li>
                <Link href="/cart" className="text-xs text-white/60 hover:text-white transition-colors">
                  カート
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-xs tracking-[0.2em] uppercase text-white/30 mb-5">Customer Service</h4>
            <ul className="space-y-3">
              <li>
                <Link href="/contact" className="text-xs text-white/60 hover:text-white transition-colors">
                  お問い合わせ
                </Link>
              </li>
              <li>
                <Link href="/legal/commercial-transactions" className="text-xs text-white/60 hover:text-white transition-colors">
                  配送について
                </Link>
              </li>
            </ul>
            <h4 className="text-xs tracking-[0.2em] uppercase text-white/30 mb-5 mt-8">Legal</h4>
            <ul className="space-y-3">
              <li>
                <Link href="/legal/commercial-transactions" className="text-xs text-white/60 hover:text-white transition-colors">
                  特定商取引法に基づく表記
                </Link>
              </li>
              <li>
                <Link href="/legal/privacy" className="text-xs text-white/60 hover:text-white transition-colors">
                  プライバシーポリシー
                </Link>
              </li>
              <li>
                <Link href="/legal/terms" className="text-xs text-white/60 hover:text-white transition-colors">
                  利用規約
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-16 pt-8 border-t border-white/10 text-center">
          <p className="text-[10px] tracking-[0.15em] text-white/25">
            &copy; {new Date().getFullYear()} {siteConfig.name.toUpperCase()}
          </p>
        </div>
      </div>
    </footer>
  )
}
