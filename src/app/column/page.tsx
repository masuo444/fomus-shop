import type { Metadata } from 'next'
import Link from 'next/link'
import { BreadcrumbJsonLd } from '@/components/seo/JsonLd'

export const metadata: Metadata = {
  title: '枡コラム | 枡の文化・歴史・使い方',
  description: '国産ヒノキ枡の歴史・文化・選び方・お手入れ方法・ギフト活用術など、枡にまつわるコラムをお届けします。',
  alternates: { canonical: '/column' },
  openGraph: {
    title: '枡コラム | 枡の文化・歴史・使い方',
    description: '国産ヒノキ枡の歴史・文化・選び方・お手入れ方法・ギフト活用術など、枡にまつわるコラムをお届けします。',
  },
}

const articles = [
  {
    href: '/column/masu-history',
    title: '枡（ます）の歴史と文化 — 日本酒と共に歩んだ1000年',
    description: '奈良時代から続く枡の歴史。計量器から日本文化のシンボルへ変遷した背景と、現代における枡の新たな役割を解説します。',
    date: '2024-01-15',
    label: '歴史・文化',
  },
  {
    href: '/column/masu-gift',
    title: '枡ギフトの選び方 — 結婚祝い・誕生日・法人ノベルティに',
    description: 'FOMUSの国産ヒノキ枡がギフトとして選ばれる理由。シーン別おすすめの枡の種類と名入れオプションについて詳しく解説。',
    date: '2024-02-10',
    label: 'ギフト',
  },
  {
    href: '/column/masu-care',
    title: '枡のお手入れ方法 — 長く使うための正しい洗い方・保管法',
    description: 'ヒノキ枡を長持ちさせるための日常のお手入れ、洗い方、乾燥方法、保管の注意点を丁寧に解説します。',
    date: '2024-03-05',
    label: 'お手入れ',
  },
]

export default function ColumnPage() {
  return (
    <>
      <BreadcrumbJsonLd items={[
        { name: 'ホーム', href: '/' },
        { name: '枡コラム', href: '/column' },
      ]} />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">枡コラム</h1>
        <p className="text-sm text-gray-500 mb-10">枡の文化・歴史・使い方・ギフト活用術</p>

        <div className="space-y-8">
          {articles.map((article) => (
            <Link
              key={article.href}
              href={article.href}
              className="block group border-b border-gray-100 pb-8 hover:opacity-70 transition-opacity"
            >
              <span className="text-[11px] tracking-widest text-gray-400 uppercase">{article.label}</span>
              <h2 className="text-lg font-medium text-gray-900 mt-2 mb-2 group-hover:underline">
                {article.title}
              </h2>
              <p className="text-sm text-gray-500 leading-relaxed">{article.description}</p>
              <p className="text-xs text-gray-300 mt-3">{article.date}</p>
            </Link>
          ))}
        </div>
      </div>
    </>
  )
}
