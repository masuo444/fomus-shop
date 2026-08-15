import type { Product } from '@/lib/types'
import siteConfig from '@/site.config'
import KachiuProductCard from '@/components/kachiu/KachiuProductCard'

// KACHIU (shop.kachiu.jp) のトップ。
//
// ここに来る人はほぼ全員が公式サイト(kachiu.jp)を読んだ後か、現物を見た後。
// 物語も還元の仕組みも知っている。だからここでブランドを語り直さない。
// 「品書き」— 名・一行・価格・罫 — として商品を並べ、最短で買えるようにする。
// 商品は4点しかないので、トップ＝全商品。/shop への遷移を挟まない。
// 開発時のみ：DBに商品が無いときのレイアウト確認用。本番では絶対に出ない。
// 内容は kachiu.jp の商品ページと同じ（価格・説明の一行目）。
const DEV_PREVIEW: Product[] = process.env.NODE_ENV === 'development' ? ([
  { id: 'dev-1', name: '桃のコンフィチュール', price: 1600, description: '笛吹市産の完熟桃を、くし形の果肉が残る大きさで仕上げました。\n砂糖とレモン果汁だけで、桃の香りと酸をそのまま閉じ込めています。' },
  { id: 'dev-2', name: '桃と白ワインのコンフィチュール', price: 2200, description: '山梨県産の白ワインを煮詰めてから合わせました。\n桃の甘さの奥に、酸と果実の香りが立ちます。' },
  { id: 'dev-3', name: '桃と赤ワインのコンフィチュール', price: 2200, description: '山梨県産の赤ワインを煮詰めてから合わせました。\n桃の果肉が赤く染まり、コクのある一瓶になります。' },
  { id: 'dev-4', name: '3本セット（化粧箱入り）', price: 6000, description: '3種を1本ずつ。単品を3本お求めいただくのと同じ価格で、化粧箱に納めてお届けします。' },
].map((d) => ({
  id: d.id, shop_id: 'dev', slug: null, name: d.name, name_en: null, description: d.description, description_en: null,
  price: d.price, compare_at_price: null, images: [], category_id: null, stock: 10, quantity_limit: null,
  made_to_order: false, external_url: null,
})) as unknown as Product[]) : []

export default function KachiuHome({ products: real }: { products: Product[] }) {
  const products = real.length > 0 ? real : DEV_PREVIEW
  return (
    <div>
      {/* 見出し — kachiu.jp のヒーローの続き。同じ字間・同じ縦罫 */}
      <section className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-10 pt-16 pb-14 md:pt-24 md:pb-20">
        <div className="flex flex-col items-center text-center kachiu-reveal">
          <p className="text-[10px] md:text-[11px] tracking-[0.34em] text-[var(--color-muted)]" style={{ textIndent: '0.34em' }}>
            ONLINE SHOP
          </p>
          <h1
            className="mt-6 font-serif font-medium text-[var(--foreground)] leading-none"
            style={{ fontSize: 'clamp(40px, 6.4vw, 76px)', letterSpacing: '0.3em', textIndent: '0.3em' }}
          >
            KACHIU
          </h1>
          <div className="mt-9 h-12 md:h-14 w-px bg-[var(--color-accent)] opacity-80" />
          <p
            className="mt-8 text-[14px] md:text-[15px] tracking-[0.3em] text-[var(--foreground)]"
            style={{ fontFamily: 'var(--font-noto-serif-jp, "Noto Serif JP", serif)', textIndent: '0.3em' }}
          >
            桃のコンフィチュール
          </p>
          <p className="mt-2.5 text-[10.5px] tracking-[0.3em] text-[var(--color-muted)]" style={{ textIndent: '0.3em' }}>
            山梨県笛吹市
          </p>
        </div>
      </section>

      {/* 品書き — 本体 */}
      <section className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-10 pb-8" aria-label="商品">
        {products.length > 0 ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-12 sm:gap-x-8 md:gap-x-10 md:gap-y-16 kachiu-stagger">
            {products.map((p, i) => (
              <div key={p.id} className="kachiu-reveal" style={{ ['--i' as string]: i }}>
                <KachiuProductCard product={p} index={i} priority={i < 2} />
              </div>
            ))}
          </div>
        ) : (
          <p className="py-24 text-center text-[13px] tracking-[0.12em] text-[var(--color-muted)]">ただいま準備中です。</p>
        )}
      </section>

      {/* 買う前に知っておくこと — kachiu.jp の記載と矛盾させない */}
      <section className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-10 pt-20 md:pt-28">
        <div className="border-t border-[var(--color-border)] pt-12 md:pt-14">
          <dl className="grid grid-cols-1 sm:grid-cols-3 gap-10 sm:gap-6">
            {[
              { k: 'SHIPPING', v: <>全国一律 {siteConfig.shippingFee.toLocaleString()}円<br />10,000円以上のご注文で送料無料<br /><span className="text-[var(--color-muted)]">北海道・沖縄・離島は別途</span></> },
              { k: 'PAYMENT', v: <>クレジットカード<br /><span className="text-[var(--color-muted)]">ご注文時に決済されます</span></> },
              { k: 'CULTURE', v: <>この一瓶の売上の一部は<br />800年続く鵜飼文化の継承に<br /><span className="text-[var(--color-muted)]">金額は毎年公表します</span></> },
            ].map(({ k, v }) => (
              <div key={k} className="text-center sm:text-left">
                <dt className="text-[10px] tracking-[0.3em] text-[var(--color-muted)]">{k}</dt>
                <dd className="mt-3.5 text-[12.5px] leading-[2] text-[var(--foreground)]">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* 語り直す代わりに、公式サイトへ */}
      <section className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-10 pt-20 md:pt-28">
        <div className="border-t border-[var(--color-border)] pt-12 md:pt-14 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <p className="text-[12.5px] leading-[2] text-[var(--color-muted)]">
            徒歩鵜の物語、文化への還元の仕組み、ご進物・お誂えのご相談は<br className="hidden md:inline" />
            公式サイトでご覧いただけます。
          </p>
          <a
            href={siteConfig.corporateUrl}
            className="inline-flex items-center gap-3 self-start md:self-auto text-[12px] tracking-[0.2em] text-[var(--foreground)] border-b border-[var(--foreground)] pb-1 hover:text-[var(--color-accent)] hover:border-[var(--color-accent)] transition-colors"
          >
            KACHIU 公式サイト
            <span aria-hidden="true" className="font-serif">→</span>
          </a>
        </div>
      </section>
    </div>
  )
}
