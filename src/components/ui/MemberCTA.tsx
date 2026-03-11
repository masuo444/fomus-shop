import Link from 'next/link'
import siteConfig from '@/site.config'

interface MemberCTAProps {
  compact?: boolean
}

const memberName = siteConfig.features.membershipName
const memberUrl = siteConfig.features.membershipUrl

const benefits = [
  `${memberName}限定価格で購入`,
  '送料無料',
  '限定商品へのアクセス',
]

export default function MemberCTA({ compact = false }: MemberCTAProps) {
  if (!siteConfig.features.membershipProgram || !memberUrl) return null

  if (compact) {
    return (
      <div
        className="rounded-lg px-4 py-3 flex items-center justify-between gap-3"
        style={{ backgroundColor: 'var(--color-member-bg)', border: '1px solid var(--color-member-border)' }}
      >
        <div className="min-w-0">
          <p className="text-sm font-bold" style={{ color: 'var(--color-member-dark)' }}>
            {memberName}会員になる
          </p>
          <p className="text-xs mt-0.5" style={{ color: 'var(--color-member)' }}>
            {memberName}限定価格・送料無料・限定商品
          </p>
        </div>
        <Link
          href={memberUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 text-xs font-bold text-white px-3 py-1.5 rounded-full hover:opacity-90 transition-opacity"
          style={{ backgroundColor: 'var(--color-member)' }}
        >
          詳しく見る
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
        {memberName}会員になる
      </h3>
      <p className="text-sm mb-4" style={{ color: 'var(--color-member)' }}>
        {memberName}会員だけの特別な特典をご利用いただけます
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
        {memberName}に入会する
      </Link>
    </div>
  )
}
