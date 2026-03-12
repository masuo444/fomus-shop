import Link from 'next/link'
import siteConfig from '@/site.config'

export default function Footer() {
  return (
    <footer className="bg-[var(--foreground)] text-[var(--background)]">
      {/* Newsletter / Brand statement */}
      <div className="border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 py-16 md:py-20">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8">
            <div>
              <h3 className="font-display text-2xl md:text-3xl tracking-[0.1em] text-white">
                {siteConfig.name.toUpperCase()}
              </h3>
              <p className="mt-3 text-xs leading-relaxed text-white/30 max-w-sm">
                伝統と革新の交差点から。枡・オリジナルグッズ・デジタルアイテムをお届けします。
              </p>
            </div>
            <div className="flex items-center gap-4">
              <a
                href="https://www.fomus.jp"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-white/40 hover:text-white border border-white/10 hover:border-white/30 px-5 py-2.5 rounded-full transition-all"
              >
                FOMUS 公式サイト
              </a>
              {siteConfig.features.membershipUrl && (
                <a
                  href={siteConfig.features.membershipUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-white/40 hover:text-white border border-white/10 hover:border-white/30 px-5 py-2.5 rounded-full transition-all"
                >
                  {siteConfig.features.membershipName}
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Links */}
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 py-12 md:py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
          <div>
            <h4 className="text-[11px] tracking-[0.2em] uppercase text-white/25 mb-5">Shop</h4>
            <ul className="space-y-3">
              <li><Link href="/shop" className="text-xs text-white/50 hover:text-white transition-colors">商品一覧</Link></li>
              <li><Link href="/shop/masu" className="text-xs text-white/50 hover:text-white transition-colors">枡について</Link></li>
              <li><Link href="/digital" className="text-xs text-white/50 hover:text-white transition-colors">デジタルアイテム</Link></li>
              <li><Link href="/market" className="text-xs text-white/50 hover:text-white transition-colors">{siteConfig.features.marketplaceName}</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-[11px] tracking-[0.2em] uppercase text-white/25 mb-5">Account</h4>
            <ul className="space-y-3">
              <li><Link href="/account" className="text-xs text-white/50 hover:text-white transition-colors">マイページ</Link></li>
              <li><Link href="/account/orders" className="text-xs text-white/50 hover:text-white transition-colors">注文履歴</Link></li>
              <li><Link href="/cart" className="text-xs text-white/50 hover:text-white transition-colors">カート</Link></li>
              <li><Link href="/account/digital" className="text-xs text-white/50 hover:text-white transition-colors">デジタルアイテム</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-[11px] tracking-[0.2em] uppercase text-white/25 mb-5">Support</h4>
            <ul className="space-y-3">
              <li><Link href="/contact" className="text-xs text-white/50 hover:text-white transition-colors">お問い合わせ</Link></li>
              <li><Link href="/shop/masu/custom" className="text-xs text-white/50 hover:text-white transition-colors">オーダーメイド</Link></li>
              <li><Link href="/legal/commercial-transactions" className="text-xs text-white/50 hover:text-white transition-colors">配送について</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-[11px] tracking-[0.2em] uppercase text-white/25 mb-5">Legal</h4>
            <ul className="space-y-3">
              <li><Link href="/legal/commercial-transactions" className="text-xs text-white/50 hover:text-white transition-colors">特定商取引法に基づく表記</Link></li>
              <li><Link href="/legal/privacy" className="text-xs text-white/50 hover:text-white transition-colors">プライバシーポリシー</Link></li>
              <li><Link href="/legal/terms" className="text-xs text-white/50 hover:text-white transition-colors">利用規約</Link></li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[10px] tracking-[0.15em] text-white/20">
            &copy; {new Date().getFullYear()} {siteConfig.name.toUpperCase()}. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-[10px] text-white/20">
            <span>Visa</span>
            <span>Mastercard</span>
            <span>Amex</span>
            <span>JPYC</span>
            <span>銀行振込</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
