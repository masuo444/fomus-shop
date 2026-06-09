import type { Metadata } from 'next'
import Link from 'next/link'
import { BreadcrumbJsonLd } from '@/components/seo/JsonLd'

export const metadata: Metadata = {
  title: '枡ギフトの選び方 — 結婚祝い・誕生日・法人ノベルティに | 枡コラム',
  description: 'FOMUSの国産ヒノキ枡ギフトガイド。結婚祝い・誕生日・還暦・法人ノベルティなどシーン別のおすすめ枡と、名入れオプションについて詳しく解説。',
  keywords: ['枡 ギフト', '枡 プレゼント', '名入れ枡', '結婚祝い 枡', '誕生日 枡', '法人 ノベルティ 枡', '枡 贈り物', 'ヒノキ枡 ギフト'],
  alternates: { canonical: '/column/masu-gift' },
  openGraph: {
    title: '枡ギフトの選び方 — 結婚祝い・誕生日・法人ノベルティに',
    description: 'シーン別おすすめの枡の種類と名入れオプションについて詳しく解説。',
  },
}

export default function MasuGiftPage() {
  return (
    <>
      <BreadcrumbJsonLd items={[
        { name: 'ホーム', href: '/' },
        { name: '枡コラム', href: '/column' },
        { name: '枡ギフトの選び方', href: '/column/masu-gift' },
      ]} />
      <article className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
        <div className="mb-8">
          <Link href="/column" className="text-xs text-gray-400 hover:text-gray-600 tracking-widest uppercase">← 枡コラム</Link>
        </div>

        <span className="text-[11px] tracking-widest text-gray-400 uppercase">ギフト</span>
        <h1 className="text-2xl font-bold text-gray-900 mt-2 mb-6 leading-snug">
          枡ギフトの選び方<br />— 結婚祝い・誕生日・法人ノベルティに
        </h1>
        <p className="text-xs text-gray-300 mb-10">2024-02-10</p>

        <div className="prose prose-sm prose-gray max-w-none space-y-6 text-gray-700 leading-relaxed">
          <h2 className="text-lg font-semibold text-gray-900 mt-10 mb-3">なぜ枡はギフトに選ばれるのか</h2>
          <p>
            「ますます繁盛」「ますます幸せに」——枡には縁起の良い言葉が重なります。
            日本の伝統工芸品であり、日常使いもできる実用性、そして使うほどに育つ経年美。
            FOMUSの国産ヒノキ枡は、そのすべてを兼ね備えたギフトとして、
            毎年多くのお客様から選ばれています。
          </p>

          <h2 className="text-lg font-semibold text-gray-900 mt-10 mb-3">シーン別おすすめ</h2>

          <h3 className="font-semibold text-gray-800 mt-6 mb-2">結婚祝い・引き出物に</h3>
          <p>
            「ますます幸せに」という縁起から、結婚祝いに枡を選ぶ方が増えています。
            一合枡（180ml）は日本酒にちょうど良いサイズで、夫婦ふたり分のペアセットもおすすめです。
            名入れ（レーザー刻印）で新郎新婦のお名前や結婚記念日を入れると、世界でひとつの贈り物になります。
          </p>

          <h3 className="font-semibold text-gray-800 mt-6 mb-2">誕生日・還暦祝いに</h3>
          <p>
            ヒノキの香りと木の温もりは、年齢を重ねた方への贈り物にも喜ばれます。
            蓋付き枡はアクセサリー入れや小物入れとしても使えるため、
            日本酒を飲まない方にも実用的です。
          </p>

          <h3 className="font-semibold text-gray-800 mt-6 mb-2">開店祝い・法人ノベルティに</h3>
          <p>
            「ますます繁盛」の意味から、新店舗のオープン祝いや取引先への贈答品として、
            法人でまとめてご注文いただくケースも多くあります。
            10個セットからの購入が可能で、レーザー刻印で会社ロゴや店名を入れることもできます。
          </p>

          <h3 className="font-semibold text-gray-800 mt-6 mb-2">インバウンド・外国人へのギフトに</h3>
          <p>
            日本文化に興味のある外国人の方へのお土産・ギフトとして、枡は非常に喜ばれます。
            FOMUSのアラビア語枡は、異文化交流の象徴としてユニークなギフトに。
            海外の方への贈り物にも「Made in Japan」のクオリティが際立ちます。
          </p>

          <h2 className="text-lg font-semibold text-gray-900 mt-10 mb-3">名入れ・オーダーメイドについて</h2>
          <p>
            FOMUSでは、レーザー刻印・焼印による名入れに対応しています。
            お名前・メッセージ・企業ロゴなど、ご要望に応じてオリジナルの枡を制作します。
            納期は通常2〜3週間程度。まずはお見積りフォームからお気軽にご相談ください。
          </p>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-100">
          <p className="text-sm font-medium text-gray-900 mb-4">ギフトに人気の枡</p>
          <div className="flex flex-wrap gap-3">
            <Link href="/shop/fomus-masu" className="text-sm border border-gray-900 px-4 py-2 hover:bg-gray-900 hover:text-white transition-colors">
              FOMUS枡（一合）
            </Link>
            <Link href="/shop/masu-lid-ichigo" className="text-sm border border-gray-900 px-4 py-2 hover:bg-gray-900 hover:text-white transition-colors">
              蓋付き枡
            </Link>
            <Link href="/shop/masu/custom" className="text-sm border border-gray-900 px-4 py-2 hover:bg-gray-900 hover:text-white transition-colors">
              名入れ・オーダーメイドを相談する →
            </Link>
          </div>
        </div>
      </article>
    </>
  )
}
