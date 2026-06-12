import type { Metadata } from 'next'
import { BreadcrumbJsonLd, FAQPageJsonLd } from '@/components/seo/JsonLd'
import { IwaimasuCta, IWAI_COLORS } from '../_components/Shared'

export const metadata: Metadata = {
  title: 'よくあるご質問',
  description:
    '祝枡に関するよくあるご質問。価格（1口2万円）、主催者の費用（0円）、祝い花との併用、イベント後の使い方などにお答えします。',
  alternates: { canonical: '/iwaimasu/faq' },
}

const faqs: Array<{ q: string; a: string }> = [
  {
    q: '祝枡を贈るには、いくらかかりますか？',
    a: '1口 20,000円です。法人の祝い花と同じ予算感でお贈りいただけます。祝枡は主催者様の記念デザインで仕立てられ、贈り主様のお名前は会場の芳名板と受付ページでご紹介いたします。複数口や連名でのお申し込みも可能です。また、ご希望の方には、お手元用の祝枡を1口につき1つお届けします（送料はお客さまのご負担となります）。',
  },
  {
    q: '主催者に費用はかかりますか？',
    a: 'かかりません。受付ページのご用意も、制作も、お届けも無料です。さらに、売上の一部を運営費として主催者様に還元いたします。詳しくはお問い合わせの際にご案内いたします。',
  },
  {
    q: '祝花やバルーンと併用できますか？',
    a: 'もちろんです。お祝いの形は、一つではありません。祝枡は、祝い花やバルーンとともに、大切な節目を彩る新しい選択肢としてご利用いただけます。',
  },
  {
    q: 'イベント後の祝枡はどうなりますか？',
    a: '使い方に決まりはありません。展示したり、実際に使ったり、ギフトとして贈ったり。その先の活用方法は、主催者様の自由です。',
  },
  {
    q: 'デザインはどのように決まりますか？',
    a: '主催者様のロゴやイベント名をもとに、記念デザインとして統一して制作いたします。',
  },
  {
    q: 'どのくらい前に相談すればよいですか？',
    a: 'イベント開催の約1か月半前までのご相談をおすすめしております。',
  },
  {
    q: '主催者ではありませんが、祝枡を贈りたい相手がいます。',
    a: 'ぜひご相談ください。お相手の節目（周年・開店・公演など）に合わせて、FOMUSから主催者様に祝枡の受付をご提案いたします。ご相談いただいた方のお名前は、主催者様の承諾があるまでお伝えしません。',
  },
  {
    q: '不要になった場合はどうなりますか？',
    a: '基本的には主催者様の自由にご活用いただけます。必要に応じて、回収についてもご相談いただけます。',
  },
]

export default function IwaimasuFaqPage() {
  return (
    <div>
      <BreadcrumbJsonLd
        items={[
          { name: 'ホーム', href: '/' },
          { name: '祝枡 IWAIMASU', href: '/iwaimasu' },
          { name: 'よくあるご質問', href: '/iwaimasu/faq' },
        ]}
      />
      <FAQPageJsonLd items={faqs.map((f) => ({ question: f.q, answer: f.a }))} />

      <section>
        <div className="max-w-5xl mx-auto px-6 py-24 md:py-32">
          <p className="text-[10px] tracking-[0.3em] uppercase text-[var(--iw-gold)] mb-6">
            FAQ
          </p>
          <h1 className="[font-family:var(--font-mincho)] text-3xl md:text-5xl leading-snug tracking-[0.08em]">
            よくある
            <br />
            ご質問
          </h1>
        </div>
      </section>

      <section className="bg-[var(--iw-paper2)]">
        <div className="max-w-3xl mx-auto px-6 py-20 md:py-28 space-y-4">
          {faqs.map((f, i) => (
            <details
              key={f.q}
              className="group bg-white border border-[var(--iw-line)] open:border-[var(--iw-gold)]"
              style={{ borderLeft: `3px solid ${IWAI_COLORS[i % IWAI_COLORS.length]}` }}
            >
              <summary className="flex items-start gap-4 cursor-pointer list-none p-6 [&::-webkit-details-marker]:hidden">
                <span
                  className="[font-family:var(--font-mincho)] flex-none"
                  style={{ color: IWAI_COLORS[i % IWAI_COLORS.length] }}
                >
                  Q
                </span>
                <span className="text-sm leading-relaxed flex-1">{f.q}</span>
                <span className="flex-none text-[var(--iw-gold)] transition-transform group-open:rotate-45 text-lg leading-none">
                  ＋
                </span>
              </summary>
              <div className="px-6 pb-6 pl-[3.25rem]">
                <p className="text-xs leading-[2.4] text-[var(--iw-gray)]">{f.a}</p>
              </div>
            </details>
          ))}
        </div>
      </section>

      <IwaimasuCta lead="ご不明な点はお気軽にお問い合わせください。" />
    </div>
  )
}
