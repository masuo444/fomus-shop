import Link from 'next/link'
import type { Metadata } from 'next'
import { BreadcrumbJsonLd } from '@/components/seo/JsonLd'
import { MasuMotif, SectionHead, IwaimasuCta, IWAI_COLORS } from '../_components/Shared'

export const metadata: Metadata = {
  title: '導入をお考えの方へ',
  description:
    '祝枡の導入は費用0円。周年・創業・開店などの節目に、取引先やスポンサーからのお祝いを新しい形で受け取る仕組みをご提供します。',
  alternates: { canonical: '/iwaimasu/for-organizers' },
}

const worries = [
  '周年イベントを予定している',
  '創業や開店の節目を迎える',
  '取引先やスポンサーからのお祝いを受け付けたい',
  '会場を彩る新しい演出を取り入れたい',
  'イベント後も記念として残るものを大切にしたい',
]

const moneyFlow = [
  {
    no: '01',
    title: '祝う側が、贈る',
    body: '取引先やスポンサーの皆さまが、お祝いの気持ちを込めて1口 20,000円で祝枡をお申し込みいただきます。',
  },
  {
    no: '02',
    title: 'FOMUSが、仕立てる',
    body: '受付ページのご用意から、主催者様の記念デザインでの制作、会場へのお届けまで。すべてFOMUSが代行します。',
  },
  {
    no: '03',
    title: '主催者様は、受け取るだけ',
    body: '「祝枡を受け付けます」とご案内いただくだけ。さらに、売上の一部を運営費として主催者様に還元します。',
  },
]

const comparison: Array<[string, string, string]> = [
  ['残る期間', '数日〜数週間', 'ずっと残る'],
  ['イベント後', '処分が必要', '展示・使用・贈答に活用'],
  ['贈り主のお名前', '立て札', '芳名板と受付ページに掲載'],
  ['会場スペース', '設置場所が必要', '省スペースで飾れる'],
  ['主催者の費用', 'かからない', 'かからない'],
]

const flow = [
  ['お問い合わせ', 'まずはお気軽にご連絡ください。'],
  ['ヒアリング', 'イベントの趣旨やご要望をお伺いします。'],
  ['デザインの決定', '主催者様のロゴやイベント名をもとに制作します。'],
  ['専用受付ページの準備', '祝福を受け付けるためのページをご用意します。'],
  ['受付開始', '取引先やスポンサーの皆さまからお申し込みいただけます。'],
  ['制作・納品', '一つひとつ、丁寧に仕立ててお届けします。'],
  ['イベント開催', '祝福が、会場を彩ります。'],
  ['その先へ', 'イベント後の使い方に決まりはありません。'],
]

const scenes = [
  '創業記念',
  '周年イベント',
  '開店祝い',
  '蔵開き',
  '収穫祭',
  'ライブ・舞台',
  '地域イベント',
  'スポンサー企業からの贈答',
  '記念セレモニー',
]

export default function ForOrganizersPage() {
  return (
    <div>
      <BreadcrumbJsonLd
        items={[
          { name: 'ホーム', href: '/' },
          { name: '祝枡 IWAIMASU', href: '/iwaimasu' },
          { name: '導入をお考えの方へ', href: '/iwaimasu/for-organizers' },
        ]}
      />

      {/* Hero */}
      <section>
        <div className="max-w-5xl mx-auto px-6 py-24 md:py-32">
          <p className="text-[10px] tracking-[0.3em] uppercase text-[var(--iw-gold)] mb-6">
            For Organizers
          </p>
          <h1 className="[font-family:var(--font-mincho)] text-3xl md:text-5xl leading-snug tracking-[0.08em]">
            祝枡を、
            <br />
            導入しませんか？
          </h1>
          <p className="mt-8 text-xs md:text-sm leading-[2.6] text-[var(--iw-gray)]">
            取引先やスポンサーの皆さまからのお祝いを、
            <br />
            新しい形で受け取る仕組みをご提供します。
          </p>
        </div>
      </section>

      {/* お悩み */}
      <section className="bg-[var(--iw-paper2)]">
        <div className="max-w-5xl mx-auto px-6 py-20 md:py-28">
          <SectionHead
            eyebrow="CHECK"
            title={
              <>
                こんなお悩みは
                <br />
                ありませんか？
              </>
            }
          />
          <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {worries.map((w, i) => (
              <div
                key={w}
                className="bg-white border border-[var(--iw-line)] p-7"
                style={{ borderTop: `3px solid ${IWAI_COLORS[i % IWAI_COLORS.length]}` }}
              >
                <p
                  className="text-[10px] tracking-[0.25em] mb-3"
                  style={{ color: IWAI_COLORS[i % IWAI_COLORS.length] }}
                >
                  {String(i + 1).padStart(2, '0')}
                </p>
                <h3 className="[font-family:var(--font-mincho)] text-sm leading-relaxed">
                  {w}
                </h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 祝枡とは */}
      <section>
        <div className="max-w-5xl mx-auto px-6 py-20 md:py-28 grid md:grid-cols-2 gap-12 items-center">
          <div className="flex justify-center order-2 md:order-1">
            <MasuMotif stroke="var(--iw-wood)" className="w-56 md:w-72" />
          </div>
          <div className="order-1 md:order-2">
            <p className="text-[10px] tracking-[0.3em] uppercase text-[var(--iw-gold)] mb-4">
              What is Iwaimasu
            </p>
            <h2 className="[font-family:var(--font-mincho)] text-2xl md:text-3xl tracking-[0.06em]">
              祝枡とは
            </h2>
            <div className="mt-8 text-xs leading-[2.6] text-[var(--iw-gray)] space-y-4">
              <p>祝枡は、企業や団体の節目を祝うための、新しいお祝いの選択肢です。</p>
              <p>
                取引先やスポンサーの皆さまから寄せられた祝福が、会場を彩り、
                その先も企業の歴史とともに受け継がれていきます。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 祝い花とのちがい */}
      <section className="bg-[var(--iw-paper2)]">
        <div className="max-w-4xl mx-auto px-6 py-20 md:py-28">
          <SectionHead eyebrow="COMPARISON" title="祝い花とのちがい" />
          <p className="mt-6 text-center text-xs leading-[2.4] text-[var(--iw-gray)]">
            祝い花の置き換えではありません。
            <br />
            祝い花やバルーンと並べて飾れる、新しい選択肢です。
          </p>
          <div className="mt-12 overflow-x-auto">
            <table className="w-full border-collapse text-xs md:text-sm">
              <thead>
                <tr className="border-b border-[var(--iw-line)]">
                  <th className="py-4 px-3 w-1/4" />
                  <th className="py-4 px-3 text-center font-medium text-[var(--iw-gray)]">
                    祝い花
                  </th>
                  <th className="py-4 px-3 text-center font-medium text-[var(--iw-wood)]">
                    祝枡
                  </th>
                </tr>
              </thead>
              <tbody>
                {comparison.map(([label, hana, masu]) => (
                  <tr key={label} className="border-b border-[var(--iw-line)]">
                    <th className="py-5 px-3 text-left font-medium">{label}</th>
                    <td className="py-5 px-3 text-center text-[var(--iw-gray)]">{hana}</td>
                    <td className="py-5 px-3 text-center bg-white">{masu}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* お金の流れ */}
      <section>
        <div className="max-w-5xl mx-auto px-6 py-20 md:py-28">
          <SectionHead eyebrow="HOW IT WORKS" title="仕組み" />
          <p className="mt-6 text-center text-sm leading-[2.4]">
            主催者様のご負担は、<strong className="text-[var(--iw-wood)]">0円</strong>です。
          </p>
          <div className="mt-12 grid md:grid-cols-3 gap-5">
            {moneyFlow.map((m, i) => {
              const c = ['#c73e3a', '#b89150', '#34577b'][i]
              return (
                <div
                  key={m.no}
                  className="bg-white border border-[var(--iw-line)] p-7"
                  style={{ borderTop: `3px solid ${c}` }}
                >
                  <p className="text-[10px] tracking-[0.25em] mb-3" style={{ color: c }}>
                    {m.no}
                  </p>
                  <h3 className="[font-family:var(--font-mincho)] text-base mb-4">{m.title}</h3>
                  <p className="text-xs leading-[2.2] text-[var(--iw-gray)]">{m.body}</p>
                </div>
              )
            })}
          </div>
          <p className="mt-10 text-center text-xs leading-[2.4] text-[var(--iw-gray)]">
            還元の内容など、詳しい条件はお問い合わせの際にご案内いたします。
          </p>
        </div>
      </section>

      {/* ご利用の流れ */}
      <section className="bg-[var(--iw-paper2)]">
        <div className="max-w-3xl mx-auto px-6 py-20 md:py-28">
          <SectionHead eyebrow="FLOW" title="ご利用の流れ" />
          <ol className="mt-12 space-y-0">
            {flow.map(([title, body], i) => (
              <li key={title} className="flex gap-6 pb-8 relative">
                {i < flow.length - 1 && (
                  <span className="absolute left-[15px] top-8 bottom-0 w-px bg-[var(--iw-line)]" />
                )}
                <span className="flex-none w-8 h-8 rounded-full bg-[var(--iw-ink)] text-[var(--iw-wood-pale)] text-[11px] flex items-center justify-center relative z-10">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div>
                  <h3 className="[font-family:var(--font-mincho)] text-sm mb-1">{title}</h3>
                  <p className="text-xs leading-[2] text-[var(--iw-gray)]">{body}</p>
                </div>
              </li>
            ))}
          </ol>
          <p className="text-center text-xs text-[var(--iw-wood)]">
            ※ イベント開催の約1か月半前までのご相談をおすすめしております。
          </p>
        </div>
      </section>

      {/* ご利用シーン */}
      <section>
        <div className="max-w-4xl mx-auto px-6 py-20 md:py-28">
          <SectionHead eyebrow="SCENES" title="ご利用シーン" />
          <div className="mt-12 flex flex-wrap justify-center gap-3">
            {scenes.map((s, i) => (
              <span
                key={s}
                className="inline-flex items-center gap-2 border border-[var(--iw-line)] bg-white px-5 py-2.5 text-xs tracking-[0.08em]"
              >
                <span
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ background: IWAI_COLORS[i % IWAI_COLORS.length] }}
                />
                {s}
              </span>
            ))}
          </div>
          <div className="mt-14 text-center">
            <Link
              href="/contact"
              className="inline-block bg-[var(--iw-ink)] text-white px-12 py-4 text-xs tracking-[0.2em] hover:bg-[var(--iw-wood)] transition-colors"
            >
              導入のご相談はこちら →
            </Link>
          </div>
        </div>
      </section>

      <IwaimasuCta lead="費用は0円。まずはお気軽にご相談ください。" />
    </div>
  )
}
