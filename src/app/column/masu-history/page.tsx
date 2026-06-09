import type { Metadata } from 'next'
import Link from 'next/link'
import { BreadcrumbJsonLd } from '@/components/seo/JsonLd'

export const metadata: Metadata = {
  title: '枡（ます）の歴史と文化 — 日本酒と共に歩んだ1000年 | 枡コラム',
  description: '奈良時代から続く枡の歴史。計量器から日本文化のシンボルへ。現代における国産ヒノキ枡の価値と、FOMUSが枡を作り続ける理由を解説します。',
  keywords: ['枡 歴史', '枡 文化', '日本酒 枡', 'ヒノキ枡', '枡 意味', '枡 由来', '枡 日本文化', 'masu 日本'],
  alternates: { canonical: '/column/masu-history' },
  openGraph: {
    title: '枡（ます）の歴史と文化 — 日本酒と共に歩んだ1000年',
    description: '奈良時代から続く枡の歴史。計量器から日本文化のシンボルへ変遷した背景と、現代における枡の新たな役割を解説します。',
  },
}

export default function MasuHistoryPage() {
  return (
    <>
      <BreadcrumbJsonLd items={[
        { name: 'ホーム', href: '/' },
        { name: '枡コラム', href: '/column' },
        { name: '枡の歴史と文化', href: '/column/masu-history' },
      ]} />
      <article className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
        <div className="mb-8">
          <Link href="/column" className="text-xs text-gray-400 hover:text-gray-600 tracking-widest uppercase">← 枡コラム</Link>
        </div>

        <span className="text-[11px] tracking-widest text-gray-400 uppercase">歴史・文化</span>
        <h1 className="text-2xl font-bold text-gray-900 mt-2 mb-6 leading-snug">
          枡（ます）の歴史と文化<br />— 日本酒と共に歩んだ1000年
        </h1>
        <p className="text-xs text-gray-300 mb-10">2024-01-15</p>

        <div className="prose prose-sm prose-gray max-w-none space-y-6 text-gray-700 leading-relaxed">
          <h2 className="text-lg font-semibold text-gray-900 mt-10 mb-3">枡の起源 — 奈良時代の計量器</h2>
          <p>
            枡（ます）の歴史は、奈良時代（710年〜794年）にまで遡ります。もともとは米・酒・塩などを計量するための道具として使われており、
            国家が税として徴収する穀物の量を正確に測るために、統一規格の枡が普及しました。
            木製の枡は加工しやすく、軽量で耐久性にも優れていたため、日本各地に広まっていきました。
          </p>

          <h2 className="text-lg font-semibold text-gray-900 mt-10 mb-3">「一合枡」と日本酒の深い関係</h2>
          <p>
            枡が日本人の日常に深く根ざすきっかけとなったのが、日本酒との関わりです。
            江戸時代には酒屋での量り売りに枡が使われ、「一合（180ml）」「五合（900ml）」「一升（1800ml）」という単位が
            日本人の生活に定着しました。現在でも居酒屋で日本酒を枡に入れて提供する文化が残っているのは、
            この歴史的背景があります。
          </p>
          <p>
            ヒノキやサワラなどの木材で作られた枡は、その木の香りが日本酒と絶妙にマッチすることでも知られています。
            特に国産ヒノキは抗菌作用を持ち、酒の風味を引き立てる効果があると言われています。
          </p>

          <h2 className="text-lg font-semibold text-gray-900 mt-10 mb-3">計量器から文化のシンボルへ</h2>
          <p>
            計量法の改正（1959年）により、公式な計量器としての枡の役割は終わりを迎えます。
            しかしその後も、枡は日本文化のシンボルとして生き続けました。
            「枡席（ますせき）」「升り詰める（上り詰める）」など、枡にちなんだ縁起の良い言葉は現代語にも残っています。
          </p>
          <p>
            結婚式や開店祝いなどのお祝いの席では、枡に日本酒を注いで乾杯する風習が今も続いており、
            「ますます繁盛」「ますます幸せに」という縁起の良い言葉として、枡はギフトシーンでも重宝されています。
          </p>

          <h2 className="text-lg font-semibold text-gray-900 mt-10 mb-3">FOMUSの枡 — 現代に蘇る職人の技</h2>
          <p>
            FOMUSの枡はすべて国産ヒノキを使用し、職人の手によって丁寧に製作されています。
            使うほどに木の表情が変わり、自分だけの"経年美"が生まれるのがFOMUS枡の特徴です。
            日本酒グラスとしての使用はもちろん、インテリア・小物入れ・ギフトとして幅広く愛されています。
          </p>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-100">
          <p className="text-sm font-medium text-gray-900 mb-4">FOMUSの枡を見る</p>
          <div className="flex flex-wrap gap-3">
            <Link href="/shop/fomus-masu" className="text-sm border border-gray-900 px-4 py-2 hover:bg-gray-900 hover:text-white transition-colors">
              FOMUS枡（一合）
            </Link>
            <Link href="/shop/mini-fomus-masu" className="text-sm border border-gray-900 px-4 py-2 hover:bg-gray-900 hover:text-white transition-colors">
              ミニFOMUS枡
            </Link>
            <Link href="/shop/masu" className="text-sm border border-gray-900 px-4 py-2 hover:bg-gray-900 hover:text-white transition-colors">
              枡一覧を見る →
            </Link>
          </div>
        </div>
      </article>
    </>
  )
}
