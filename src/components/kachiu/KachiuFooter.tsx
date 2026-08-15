import Link from 'next/link'
import siteConfig from '@/site.config'

// KACHIU のフッター。kachiu.jp のフッターと同じ並び・同じ温度に揃える。
export default function KachiuFooter() {
  return (
    <footer className="border-t border-[var(--color-border)] mt-24 md:mt-32">
      <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-10 py-14 md:py-16">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-10">
          <div>
            <Link
              href="/"
              className="font-serif font-medium text-[var(--foreground)] hover:opacity-70 transition-opacity"
              style={{ fontSize: 20, letterSpacing: '0.3em' }}
            >
              KACHIU
            </Link>
            <p className="mt-4 text-[11px] leading-[2.1] tracking-[0.12em] text-[var(--color-muted)] whitespace-nowrap">
              山梨県笛吹市　桃のコンフィチュール<br />
              売上の一部を、鵜飼文化の継承に。
            </p>
          </div>

          <nav
            className="flex flex-wrap gap-x-7 gap-y-3 text-[11px] tracking-[0.16em] text-[var(--color-muted)]"
            aria-label="フッターナビゲーション"
          >
            <a href={siteConfig.corporateUrl} className="hover:text-[var(--foreground)] transition-colors">公式サイト</a>
            <a href={`${siteConfig.corporateUrl}/about/`} className="hover:text-[var(--foreground)] transition-colors">KACHIUについて</a>
            <a href={`${siteConfig.corporateUrl}/about/#culture`} className="hover:text-[var(--foreground)] transition-colors">文化への還元</a>
            <Link href="/contact" className="hover:text-[var(--foreground)] transition-colors">お問い合わせ</Link>
            <Link href="/legal/commercial-transactions" className="hover:text-[var(--foreground)] transition-colors">特定商取引法に基づく表記</Link>
            <a href={`${siteConfig.corporateUrl}/privacy/`} className="hover:text-[var(--foreground)] transition-colors">プライバシーポリシー</a>
          </nav>
        </div>

        <div className="mt-12 pt-6 border-t border-[var(--color-border)] flex items-center justify-between">
          <small className="text-[10px] tracking-[0.18em] text-[var(--color-muted)]">© {new Date().getFullYear()} KACHIU</small>
          <small className="text-[10px] tracking-[0.18em] text-[var(--color-muted)]">FUEFUKI · YAMANASHI</small>
        </div>
      </div>
    </footer>
  )
}
