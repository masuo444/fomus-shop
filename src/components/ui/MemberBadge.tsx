import siteConfig from '@/site.config'

interface MemberBadgeProps {
  isPremium: boolean
  size?: 'sm' | 'md'
}

export default function MemberBadge({ isPremium, size = 'sm' }: MemberBadgeProps) {
  const sizeClasses = size === 'sm' ? 'text-[10px] px-2 py-0.5' : 'text-xs px-2.5 py-1'

  if (isPremium) {
    return (
      <span
        className={`inline-flex items-center gap-1 font-bold rounded-full ${sizeClasses}`}
        style={{ backgroundColor: 'var(--color-member-bg)', color: 'var(--color-member)', border: '1px solid var(--color-member)' }}
      >
        <svg className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
        {siteConfig.features.membershipName}会員
      </span>
    )
  }

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full bg-gray-100 text-gray-500 border border-gray-200 ${sizeClasses}`}
    >
      無料会員
    </span>
  )
}
