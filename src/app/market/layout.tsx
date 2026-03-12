import Link from 'next/link'
import siteConfig from '@/site.config'
import type { Metadata } from 'next'

const mpName = siteConfig.features.marketplaceName

export const metadata: Metadata = {
  title: {
    default: mpName,
    template: `%s | ${mpName}`,
  },
}

export default function MarketLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* Marketplace header bar */}
      <div className="bg-[var(--foreground)]">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 flex items-center justify-between h-11">
          <Link href="/market" className="font-display text-sm tracking-[0.2em] text-white/90">
            {mpName.toUpperCase()}
          </Link>
          <div className="flex items-center gap-8">
            <Link href="/market" className="text-[10px] tracking-[0.15em] uppercase text-white/40 hover:text-white transition-colors">
              Market
            </Link>
<Link href="/market/submit" className="text-[10px] tracking-[0.15em] uppercase text-white/40 hover:text-white transition-colors">
              Submit
            </Link>
            <Link href="/" className="text-[10px] tracking-[0.1em] text-white/20 hover:text-white/50 transition-colors">
              ← {siteConfig.name}
            </Link>
          </div>
        </div>
      </div>
      {children}
    </>
  )
}
