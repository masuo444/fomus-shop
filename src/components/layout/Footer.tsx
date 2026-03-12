import Link from 'next/link'
import siteConfig from '@/site.config'

export default function Footer() {
  return (
    <footer className="bg-[var(--foreground)] text-white">
      {/* Top band */}
      <div className="border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 py-14 md:py-20">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8">
            <div>
              <h3 className="text-3xl md:text-4xl font-black tracking-tight">
                {siteConfig.name.toUpperCase()}<span className="text-[var(--color-accent)]">.</span>
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-white/30 max-w-md">
                面白いモノを世の中に。枡・カードゲーム・デジタルアイテム。
              </p>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <a
                href="https://www.fomus.jp"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-white/40 hover:text-white hover:bg-white/10 border border-white/10 px-5 py-2.5 rounded-full transition-all"
              >
                FOMUS 公式サイト
              </a>
              {siteConfig.features.membershipUrl && (
                <a
                  href={siteConfig.features.membershipUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-white/40 hover:text-white hover:bg-white/10 border border-white/10 px-5 py-2.5 rounded-full transition-all"
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
            <h4 className="text-[11px] font-semibold tracking-widest uppercase text-white/20 mb-5">Shop</h4>
            <ul className="space-y-3">
              <li><Link href="/shop" className="text-sm text-white/40 hover:text-white transition-colors">商品一覧</Link></li>
              <li><Link href="/shop/masu" className="text-sm text-white/40 hover:text-white transition-colors">枡について</Link></li>
              <li><Link href="/digital" className="text-sm text-white/40 hover:text-white transition-colors">デジタルアイテム</Link></li>
              <li><Link href="/market" className="text-sm text-white/40 hover:text-white transition-colors">{siteConfig.features.marketplaceName}</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-[11px] font-semibold tracking-widest uppercase text-white/20 mb-5">Account</h4>
            <ul className="space-y-3">
              <li><Link href="/account" className="text-sm text-white/40 hover:text-white transition-colors">マイページ</Link></li>
              <li><Link href="/account/orders" className="text-sm text-white/40 hover:text-white transition-colors">注文履歴</Link></li>
              <li><Link href="/cart" className="text-sm text-white/40 hover:text-white transition-colors">カート</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-[11px] font-semibold tracking-widest uppercase text-white/20 mb-5">Support</h4>
            <ul className="space-y-3">
              <li><Link href="/contact" className="text-sm text-white/40 hover:text-white transition-colors">お問い合わせ</Link></li>
              <li><Link href="/shop/masu/custom" className="text-sm text-white/40 hover:text-white transition-colors">オーダーメイド</Link></li>
              <li><Link href="/legal/commercial-transactions" className="text-sm text-white/40 hover:text-white transition-colors">配送について</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-[11px] font-semibold tracking-widest uppercase text-white/20 mb-5">Legal</h4>
            <ul className="space-y-3">
              <li><Link href="/legal/commercial-transactions" className="text-sm text-white/40 hover:text-white transition-colors">特定商取引法に基づく表記</Link></li>
              <li><Link href="/legal/privacy" className="text-sm text-white/40 hover:text-white transition-colors">プライバシーポリシー</Link></li>
              <li><Link href="/legal/terms" className="text-sm text-white/40 hover:text-white transition-colors">利用規約</Link></li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom */}
      <div className="border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[11px] text-white/15">
            &copy; {new Date().getFullYear()} {siteConfig.name.toUpperCase()}
          </p>
          <div className="flex items-center gap-5 text-[11px] text-white/15">
            <span>Visa</span>
            <span>Mastercard</span>
            <span>Amex</span>
            <span>JCB</span>
            <span>銀行振込</span>
            <span>JPYC</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
