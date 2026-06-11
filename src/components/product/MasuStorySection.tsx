import Link from 'next/link'
import type { Product } from '@/lib/types'

// Story band shown on masu-related product pages only (compact 3-card layout).
// Facts reused from /shop/masu and /column — keep claims consistent with those pages.
// 写真素材が届いたら「受け継がれる技」カードに画像を追加する（craftImage参照）。

interface MasuStorySectionProps {
  product: Product
  locale?: 'ja' | 'en'
}

// Slug-specific use suggestions; fallback covers the rest of the masu lineup.
const USES_JA: Record<string, string[]> = {
  'fomus-masu': ['日本酒の定番（一合・180ml）', '「もっきり」スタイルの晩酌', '節分・お祝いの席に'],
  'fomus-masu-10set': ['結婚式の引き出物・乾杯枡に', '開店祝い・周年記念に', '企業ノベルティ（ロゴ刻印）'],
  'mini-fomus-masu': ['日本酒の利き猪口に', 'アクセサリー・小物入れに', 'プチギフト・お土産に'],
  'mini-fomus-masu-10set': ['プチギフト・イベント配布に', 'パーティーの乾杯枡に', 'ノベルティ（名入れ対応）'],
  'masu-lid-ichigo': ['大切な物の保管箱に', 'ギフトボックスとして', '茶葉・お香入れに'],
  'masu-lid-mini': ['アクセサリーケースに', 'お香・小物入れに', '特別な贈り物の箱に'],
  'kubi-kake-masu': ['お祭り・フェスの相棒に', 'イベントの乾杯枡に', '両手が空くハンズフリー枡'],
  'arabic-masu': ['異文化交流のギフトに', '海外の方へのお土産に', 'インテリアのアクセントに'],
}

const USES_EN: Record<string, string[]> = {
  'fomus-masu': ['The classic sake vessel (180 ml)', 'Mokkiri-style overflow pours', 'Celebrations and Setsubun'],
  'fomus-masu-10set': ['Wedding favors and toasts', 'Store openings and anniversaries', 'Corporate gifts with engraving'],
  'mini-fomus-masu': ['A sake tasting cup', 'A tray for jewelry and trinkets', 'A small gift from Japan'],
  'mini-fomus-masu-10set': ['Party favors and giveaways', 'Group toasts', 'Custom-engraved novelties'],
  'masu-lid-ichigo': ['A keepsake box', 'A gift box', 'Tea leaves or incense storage'],
  'masu-lid-mini': ['A jewelry case', 'An incense holder', 'A box for a special gift'],
  'kubi-kake-masu': ['Festivals and events', 'Hands-free toasts', 'A conversation starter'],
  'arabic-masu': ['A cross-cultural gift', 'A souvenir from Japan', 'An interior accent'],
}

const USES_DEFAULT_JA = ['お祝い・記念のギフトに', '日本酒・乾杯の席に', 'インテリア・ディスプレイに']
const USES_DEFAULT_EN = ['Celebrations and gifts', 'Sake and toasts', 'Interior display']

const dict = {
  ja: {
    craftTitle: '受け継がれる技',
    craftBody: '枡は1300年の歴史を持つ日本の伝統工芸。FOMUSの枡は、国産ヒノキを職人がひとつひとつ丁寧に仕上げています。使うほどに深まる木の表情をお楽しみください。',
    usesTitle: 'あなたの使い方',
    careTitle: '永く使うために',
    careBody: '中性洗剤でやさしく手洗いし、風通しの良い場所で陰干ししてください。食洗機・直射日光は変形の原因になります。',
    careLink: 'お手入れの詳細を見る',
    ctaLabel: '世界に一つの枡に',
    ctaBody: '名入れ・ロゴ刻印・オーダーメイドを承ります',
    ctaButton: '名入れ・オーダーメイドの相談',
  },
  en: {
    craftTitle: 'Inherited Craftsmanship',
    craftBody: 'The masu carries 1,300 years of Japanese tradition. Each FOMUS masu is finished by hand from Japanese hinoki cypress — and its character only deepens with use.',
    usesTitle: 'Ways to Enjoy It',
    careTitle: 'Caring for Your Masu',
    careBody: 'Hand-wash gently with mild detergent and air-dry in the shade. Avoid dishwashers and direct sunlight to prevent warping.',
    careLink: '',
    ctaLabel: 'Make It One of a Kind',
    ctaBody: 'Custom name engraving, logo branding, and made-to-order masu available',
    ctaButton: 'Ask About Custom Orders',
  },
}

function isMasuProduct(product: Product): boolean {
  return product.name.includes('枡') || (product.slug || '').includes('masu')
}

export default function MasuStorySection({ product, locale = 'ja' }: MasuStorySectionProps) {
  if (!isMasuProduct(product)) return null

  const t = dict[locale]
  const slug = product.slug || ''
  const uses = locale === 'en'
    ? (USES_EN[slug] || USES_DEFAULT_EN)
    : (USES_JA[slug] || USES_DEFAULT_JA)
  const ctaHref = locale === 'en' ? '/en/contact' : '/shop/masu/custom'

  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6 py-12 md:py-16">
      <div className="border-t border-[var(--color-border)] pt-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* 受け継がれる技（写真素材が届いたらこのカード上部に画像を追加） */}
          <div className="border border-[var(--color-border)] rounded-xl p-6">
            <h3 className="text-[10px] tracking-[0.2em] uppercase text-[var(--color-muted)] mb-4">
              {t.craftTitle}
            </h3>
            <p className="text-xs leading-[2] text-[var(--foreground)]/70">
              {t.craftBody}
            </p>
          </div>

          {/* あなたの使い方 */}
          <div className="border border-[var(--color-border)] rounded-xl p-6">
            <h3 className="text-[10px] tracking-[0.2em] uppercase text-[var(--color-muted)] mb-4">
              {t.usesTitle}
            </h3>
            <ul className="space-y-2.5">
              {uses.map((use) => (
                <li key={use} className="flex items-start gap-2.5 text-xs leading-relaxed text-[var(--foreground)]/70">
                  <span className="mt-1.5 w-1 h-1 rounded-full bg-[var(--foreground)]/40 shrink-0" />
                  {use}
                </li>
              ))}
            </ul>
          </div>

          {/* 永く使うために */}
          <div className="border border-[var(--color-border)] rounded-xl p-6">
            <h3 className="text-[10px] tracking-[0.2em] uppercase text-[var(--color-muted)] mb-4">
              {t.careTitle}
            </h3>
            <p className="text-xs leading-[2] text-[var(--foreground)]/70">
              {t.careBody}
            </p>
            {t.careLink && (
              <Link
                href="/column/masu-care"
                className="inline-block mt-3 text-[11px] text-[var(--color-muted)] underline underline-offset-4 hover:text-[var(--foreground)] transition-colors"
              >
                {t.careLink}
              </Link>
            )}
          </div>
        </div>

        {/* 名入れ・オーダーメイドCTA */}
        <div className="mt-6 border border-[var(--color-border)] rounded-xl px-6 py-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-[10px] tracking-[0.2em] uppercase text-[var(--color-muted)] mb-1.5">
              {t.ctaLabel}
            </p>
            <p className="text-xs text-[var(--foreground)]/70">{t.ctaBody}</p>
          </div>
          <Link
            href={ctaHref}
            className="shrink-0 inline-flex items-center justify-center px-6 py-2.5 text-[11px] tracking-[0.12em] uppercase bg-[var(--foreground)] text-[var(--background)] rounded-full hover:opacity-90 transition-opacity"
          >
            {t.ctaButton} →
          </Link>
        </div>
      </div>
    </section>
  )
}
