import Link from 'next/link'
import siteConfig from '@/site.config'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '法的情報',
}

const legalPages = [
  {
    href: '/legal/commercial-transactions',
    title: '特定商取引法に基づく表記',
    description: '販売業者情報、返品・交換ポリシーなど',
  },
  {
    href: '/legal/privacy',
    title: 'プライバシーポリシー',
    description: '個人情報の取り扱いについて',
  },
  {
    href: '/legal/terms',
    title: '利用規約',
    description: `${siteConfig.name}のご利用条件`,
  },
]

export default function LegalPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">法的情報</h1>
      <div className="space-y-4">
        {legalPages.map((page) => (
          <Link
            key={page.href}
            href={page.href}
            className="block border border-gray-200 rounded-lg p-5 hover:bg-gray-50 transition-colors"
          >
            <h2 className="text-base font-semibold text-gray-900">{page.title}</h2>
            <p className="text-sm text-gray-500 mt-1">{page.description}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
