import Link from 'next/link'
import siteConfig from '@/site.config'
import { productDict, fmt } from '@/lib/i18n/product'

interface MemberCTAProps {
  compact?: boolean
  locale?: 'ja' | 'en'
}

const memberName = siteConfig.features.membershipName
const memberUrl = 'https://guild-app.fomusglobal.com/invite/FOMUS-SHOP'

export default function MemberCTA({ compact = false, locale = 'ja' }: MemberCTAProps) {
  if (!siteConfig.features.membershipProgram || !memberUrl) return null

  const t = productDict[locale]
  const benefits = [
    fmt(t.ctaBenefitPrice, { name: memberName }),
    t.ctaBenefitAccess,
  ]

  if (compact) {
    return (
      <div
        className="rounded-lg px-4 py-3 flex items-center justify-between gap-3"
        style={{ backgroundColor: 'var(--color-member-bg)', border: '1px solid var(--color-member-border)' }}
      >
        <div className="min-w-0">
          <p className="text-sm font-bold" style={{ color: 'var(--color-member-dark)' }}>
            {fmt(t.ctaBecomeMember, { name: memberName })}
          </p>
          <p className="text-xs mt-0.5" style={{ color: 'var(--color-member)' }}>
            {fmt(t.ctaCompactDesc, { name: memberName })}
          </p>
        </div>
        <Link
          href={memberUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 text-xs font-bold text-white px-3 py-1.5 rounded-full hover:opacity-90 transition-opacity"
          style={{ backgroundColor: 'var(--color-member)' }}
        >
          {t.ctaLearnMore}
        </Link>
      </div>
    )
  }

  return (
    <div
      className="rounded-xl p-6"
      style={{ backgroundColor: 'var(--color-member-bg)', border: '1px solid var(--color-member-border)' }}
    >
      <h3 className="text-lg font-bold mb-1" style={{ color: 'var(--color-member-dark)' }}>
        {fmt(t.ctaBecomeMember, { name: memberName })}
      </h3>
      <p className="text-sm mb-4" style={{ color: 'var(--color-member)' }}>
        {fmt(t.ctaFullDesc, { name: memberName })}
      </p>
      <ul className="space-y-2 mb-5">
        {benefits.map((benefit) => (
          <li key={benefit} className="flex items-center gap-2 text-sm" style={{ color: 'var(--color-member-dark)' }}>
            <svg className="w-4 h-4 shrink-0" style={{ color: 'var(--color-member)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            {benefit}
          </li>
        ))}
      </ul>
      <Link
        href={memberUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-block text-sm font-bold text-white px-6 py-2.5 rounded-full hover:opacity-90 transition-opacity"
        style={{ backgroundColor: 'var(--color-member)' }}
      >
        {fmt(t.ctaJoin, { name: memberName })}
      </Link>
    </div>
  )
}
