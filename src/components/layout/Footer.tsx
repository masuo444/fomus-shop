import Link from 'next/link'
import siteConfig from '@/site.config'

export default function Footer() {
  return (
    <footer className="border-t border-[var(--color-border)]">
      {/* Top */}
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 py-16 md:py-24">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-12">
          <div>
            <h3 className="text-[11px] tracking-[0.3em] uppercase font-medium text-[var(--foreground)]">
              {siteConfig.name.toUpperCase()}
            </h3>
            <p className="mt-4 text-xs leading-[2] text-[var(--color-muted)] max-w-xs">
              面白いモノを世の中に。
              <br />枡・カードゲーム・デジタルアイテム。
            </p>
            <div className="flex items-center gap-4 mt-6">
              <a
                href="https://www.fomus.jp"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] tracking-[0.12em] uppercase text-[var(--color-muted)] hover:text-[var(--foreground)] transition-colors"
              >
                FOMUS.jp
              </a>
              {siteConfig.features.membershipUrl && (
                <>
                  <span className="text-[var(--color-border)]">/</span>
                  <a
                    href={siteConfig.features.membershipUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[10px] tracking-[0.12em] uppercase text-[var(--color-muted)] hover:text-[var(--foreground)] transition-colors"
                  >
                    {siteConfig.features.membershipName}
                  </a>
                </>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-10 md:gap-14">
            <div>
              <h4 className="text-[10px] tracking-[0.2em] uppercase text-[var(--color-muted)] mb-5">Shop</h4>
              <ul className="space-y-3">
                <li><Link href="/shop" className="text-xs text-[var(--foreground)]/60 hover:text-[var(--foreground)] transition-colors">商品一覧</Link></li>
                <li><Link href="/shop/masu" className="text-xs text-[var(--foreground)]/60 hover:text-[var(--foreground)] transition-colors">枡について</Link></li>
                <li><Link href="/digital" className="text-xs text-[var(--foreground)]/60 hover:text-[var(--foreground)] transition-colors">デジタルアイテム</Link></li>
                <li><Link href="/market" className="text-xs text-[var(--foreground)]/60 hover:text-[var(--foreground)] transition-colors">{siteConfig.features.marketplaceName}</Link></li>
                <li><Link href="/gallery" className="text-xs text-[var(--foreground)]/60 hover:text-[var(--foreground)] transition-colors">ギャラリー</Link></li>
                <li><Link href="/story" className="text-xs text-[var(--foreground)]/60 hover:text-[var(--foreground)] transition-colors">FOMUSについて</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-[10px] tracking-[0.2em] uppercase text-[var(--color-muted)] mb-5">Account</h4>
              <ul className="space-y-3">
                <li><Link href="/account" className="text-xs text-[var(--foreground)]/60 hover:text-[var(--foreground)] transition-colors">マイページ</Link></li>
                <li><Link href="/account/orders" className="text-xs text-[var(--foreground)]/60 hover:text-[var(--foreground)] transition-colors">注文履歴</Link></li>
                <li><Link href="/cart" className="text-xs text-[var(--foreground)]/60 hover:text-[var(--foreground)] transition-colors">カート</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-[10px] tracking-[0.2em] uppercase text-[var(--color-muted)] mb-5">Support</h4>
              <ul className="space-y-3">
                <li><Link href="/contact" className="text-xs text-[var(--foreground)]/60 hover:text-[var(--foreground)] transition-colors">お問い合わせ</Link></li>
                <li><Link href="/shop/masu/custom" className="text-xs text-[var(--foreground)]/60 hover:text-[var(--foreground)] transition-colors">オーダーメイド</Link></li>
                <li><Link href="/legal/commercial-transactions" className="text-xs text-[var(--foreground)]/60 hover:text-[var(--foreground)] transition-colors">配送について</Link></li>
                <li><Link href="/jpyc" className="text-xs text-[var(--foreground)]/60 hover:text-[var(--foreground)] transition-colors">JPYC決済</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-[10px] tracking-[0.2em] uppercase text-[var(--color-muted)] mb-5">Legal</h4>
              <ul className="space-y-3">
                <li><Link href="/legal/commercial-transactions" className="text-xs text-[var(--foreground)]/60 hover:text-[var(--foreground)] transition-colors">特定商取引法</Link></li>
                <li><Link href="/legal/privacy" className="text-xs text-[var(--foreground)]/60 hover:text-[var(--foreground)] transition-colors">プライバシー</Link></li>
                <li><Link href="/legal/terms" className="text-xs text-[var(--foreground)]/60 hover:text-[var(--foreground)] transition-colors">利用規約</Link></li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom */}
      <div className="border-t border-[var(--color-border)]">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[10px] tracking-[0.1em] text-[var(--color-muted)]">
            &copy; {new Date().getFullYear()} {siteConfig.name.toUpperCase()}
          </p>
          <div className="flex items-center gap-4 text-[10px] tracking-[0.05em] text-[var(--color-border)]">
            <span>Visa</span>
            <span>Mastercard</span>
            <span>Amex</span>
            <span>JCB</span>
            <span>Bank</span>
            <span>JPYC</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
