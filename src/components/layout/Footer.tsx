'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import siteConfig from '@/site.config'
import { commonDict, localeFromPathname, localePath } from '@/lib/i18n/common'

export default function Footer() {
  const locale = localeFromPathname(usePathname())
  const t = commonDict[locale]
  const p = (path: string) => localePath(locale, path)

  return (
    <footer className="border-t border-[var(--color-border)]">
      {/* Top */}
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 py-16 md:py-24">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-12">
          <div>
            <h3 className="text-[11px] tracking-[0.3em] uppercase font-medium text-[var(--foreground)]">
              {siteConfig.name.toUpperCase()}
            </h3>
            <p className="mt-4 text-xs leading-[2] text-[var(--color-muted)] max-w-xs whitespace-pre-line">
              {siteConfig.features.brandPages ? (
                <>
                  {t.footerTagline1}
                  <br />{t.footerTagline2}
                </>
              ) : (
                siteConfig.tagline
              )}
            </p>
            <div className="flex items-center gap-4 mt-6">
              <a
                href={siteConfig.corporateUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] tracking-[0.12em] uppercase text-[var(--color-muted)] hover:text-[var(--foreground)] transition-colors"
              >
                {siteConfig.corporateName}
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
                <li><Link href={p('/shop')} className="text-xs text-[var(--foreground)]/60 hover:text-[var(--foreground)] transition-colors">{t.footerShopList}</Link></li>
                {siteConfig.features.brandPages && (
                  <li><Link href="/shop/masu" className="text-xs text-[var(--foreground)]/60 hover:text-[var(--foreground)] transition-colors">{t.footerAboutMasu}</Link></li>
                )}
                {siteConfig.features.digitalItems && <li><Link href="/digital" className="text-xs text-[var(--foreground)]/60 hover:text-[var(--foreground)] transition-colors">{t.footerDigital}</Link></li>}
                {siteConfig.features.brandPages && (
                  <>
                    <li><Link href="/gallery" className="text-xs text-[var(--foreground)]/60 hover:text-[var(--foreground)] transition-colors">{t.footerGallery}</Link></li>
                    <li><Link href={p('/story')} className="text-xs text-[var(--foreground)]/60 hover:text-[var(--foreground)] transition-colors">{t.footerStory}</Link></li>
                    <li><Link href="/column" className="text-xs text-[var(--foreground)]/60 hover:text-[var(--foreground)] transition-colors">{t.footerColumn}</Link></li>
                  </>
                )}
              </ul>
            </div>
            <div>
              <h4 className="text-[10px] tracking-[0.2em] uppercase text-[var(--color-muted)] mb-5">Account</h4>
              <ul className="space-y-3">
                <li><Link href="/account" className="text-xs text-[var(--foreground)]/60 hover:text-[var(--foreground)] transition-colors">{t.footerMyPage}</Link></li>
                <li><Link href="/account/orders" className="text-xs text-[var(--foreground)]/60 hover:text-[var(--foreground)] transition-colors">{t.footerOrders}</Link></li>
                <li><Link href={p('/cart')} className="text-xs text-[var(--foreground)]/60 hover:text-[var(--foreground)] transition-colors">{t.footerCart}</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-[10px] tracking-[0.2em] uppercase text-[var(--color-muted)] mb-5">Support</h4>
              <ul className="space-y-3">
                <li><Link href={p('/contact')} className="text-xs text-[var(--foreground)]/60 hover:text-[var(--foreground)] transition-colors">{t.footerContact}</Link></li>
                {siteConfig.features.brandPages && (
                  <li><Link href="/shop/masu/custom" className="text-xs text-[var(--foreground)]/60 hover:text-[var(--foreground)] transition-colors">{t.footerCustomOrder}</Link></li>
                )}
                <li><Link href="/legal/commercial-transactions" className="text-xs text-[var(--foreground)]/60 hover:text-[var(--foreground)] transition-colors">{t.footerShipping}</Link></li>
                {siteConfig.jpyc.enabled && (
                  <li><Link href="/jpyc" className="text-xs text-[var(--foreground)]/60 hover:text-[var(--foreground)] transition-colors">{t.footerJpyc}</Link></li>
                )}
              </ul>
            </div>
            <div>
              <h4 className="text-[10px] tracking-[0.2em] uppercase text-[var(--color-muted)] mb-5">Legal</h4>
              <ul className="space-y-3">
                <li><Link href="/legal/commercial-transactions" className="text-xs text-[var(--foreground)]/60 hover:text-[var(--foreground)] transition-colors">{t.footerCommercial}</Link></li>
                <li><Link href="/legal/privacy" className="text-xs text-[var(--foreground)]/60 hover:text-[var(--foreground)] transition-colors">{t.footerPrivacy}</Link></li>
                <li><Link href="/legal/terms" className="text-xs text-[var(--foreground)]/60 hover:text-[var(--foreground)] transition-colors">{t.footerTerms}</Link></li>
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
