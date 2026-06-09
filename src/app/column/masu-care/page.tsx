import type { Metadata } from 'next'
import Link from 'next/link'
import { BreadcrumbJsonLd } from '@/components/seo/JsonLd'

export const metadata: Metadata = {
  title: '枡のお手入れ方法 — 長く使うための洗い方・保管法 | 枡コラム',
  description: '国産ヒノキ枡を長持ちさせるための正しいお手入れ方法。日常の洗い方、乾燥方法、保管時の注意点、カビ防止のコツまで丁寧に解説します。',
  keywords: ['枡 手入れ', '枡 洗い方', '枡 お手入れ', 'ヒノキ枡 手入れ', '枡 保管', '枡 カビ', '木製 枡 洗い方', '枡 使い方'],
  alternates: { canonical: '/column/masu-care' },
  openGraph: {
    title: '枡のお手入れ方法 — 長く使うための洗い方・保管法',
    description: '国産ヒノキ枡を長持ちさせるための正しいお手入れ方法を丁寧に解説します。',
  },
}

export default function MasuCarePage() {
  return (
    <>
      <BreadcrumbJsonLd items={[
        { name: 'ホーム', href: '/' },
        { name: '枡コラム', href: '/column' },
        { name: '枡のお手入れ方法', href: '/column/masu-care' },
      ]} />
      <article className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
        <div className="mb-8">
          <Link href="/column" className="text-xs text-gray-400 hover:text-gray-600 tracking-widest uppercase">← 枡コラム</Link>
        </div>

        <span className="text-[11px] tracking-widest text-gray-400 uppercase">お手入れ</span>
        <h1 className="text-2xl font-bold text-gray-900 mt-2 mb-6 leading-snug">
          枡のお手入れ方法<br />— 長く使うための洗い方・保管法
        </h1>
        <p className="text-xs text-gray-300 mb-10">2024-03-05</p>

        <div className="prose prose-sm prose-gray max-w-none space-y-6 text-gray-700 leading-relaxed">
          <p>
            FOMUSの枡は国産ヒノキを使用した天然素材の工芸品です。
            正しいお手入れをすることで、長く美しい状態を保ち、使うほどに深まる"経年美"を楽しめます。
          </p>

          <h2 className="text-lg font-semibold text-gray-900 mt-10 mb-3">日常の洗い方</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>使用後は<strong>なるべく早めに洗う</strong>ことが大切です</li>
            <li>水またはぬるま湯で<strong>手洗い</strong>してください</li>
            <li>食器用洗剤は少量であれば使用可能ですが、<strong>すすぎをしっかり行ってください</strong></li>
            <li><strong>食洗機・電子レンジは使用不可</strong>です（変形・割れの原因になります）</li>
            <li>タワシや硬いスポンジは避け、<strong>柔らかいスポンジや布</strong>で洗いましょう</li>
          </ul>

          <h2 className="text-lg font-semibold text-gray-900 mt-10 mb-3">乾燥方法 — カビを防ぐ重要ポイント</h2>
          <p>
            木製品のお手入れで最も重要なのが乾燥です。水分が残ったまま保管するとカビや変形の原因になります。
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li>洗った後は<strong>清潔な布やタオルで水気を拭き取る</strong></li>
            <li><strong>逆さにして</strong>自然乾燥させる（底面の水がたまらないように）</li>
            <li>直射日光・高温の場所は割れや反りの原因になるので<strong>避ける</strong></li>
            <li>乾燥が完全に終わるまで<strong>重ねて保管しない</strong></li>
          </ul>

          <h2 className="text-lg font-semibold text-gray-900 mt-10 mb-3">保管方法</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>完全に乾燥させてから<strong>通気性の良い場所</strong>に保管する</li>
            <li>密閉された場所（引き出しの奥など）は湿気がこもりやすいので注意</li>
            <li>長期間使わない場合は<strong>新聞紙に包んで保管</strong>すると湿気を吸ってくれます</li>
          </ul>

          <h2 className="text-lg font-semibold text-gray-900 mt-10 mb-3">使い始めのひと手間</h2>
          <p>
            新品の枡は最初に「米のとぎ汁」に30分ほど浸けてから乾燥させると、
            木材の隙間が埋まり、液漏れを防ぐ効果があります。
            このひと手間で、長くきれいに使えるようになります。
          </p>

          <h2 className="text-lg font-semibold text-gray-900 mt-10 mb-3">経年変化を楽しむ</h2>
          <p>
            正しくお手入れしながら使い続けると、ヒノキの色が少しずつ変化し、
            手の脂が染み込んでツヤが出てきます。これがFOMUS枡の"経年美"です。
            同じ商品でも、使い手によって異なる表情になるのが、天然木の枡の魅力です。
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
