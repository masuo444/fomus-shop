import Link from 'next/link'
import type { Metadata } from 'next'
import { BreadcrumbJsonLd } from '@/components/seo/JsonLd'
import { MasuMotif, MasuCluster, SectionHead, IwaimasuCta } from './_components/Shared'

export const metadata: Metadata = {
  title: '祝枡 IWAIMASU ｜ 祝福を、形に残す。',
  description:
    '祝枡（いわいます）は、創業記念・周年イベント・蔵開き・収穫祭・ライブ・開店祝いなど、節目を祝う新しいお祝いの選択肢。祝い花のように贈り、その先も残ります。',
  alternates: { canonical: '/iwaimasu' },
}

const afterWords = [
  { word: '展示する', color: '#c73e3a' },
  { word: '使う', color: '#b89150' },
  { word: '贈る', color: '#6e8b53' },
  { word: '保管する', color: '#34577b' },
]

const stories = [
  { tag: 'SAKE BREWERY', title: '○○酒造 創業100周年', color: '#c73e3a' },
  { tag: 'WINERY', title: '○○ワイナリー 収穫祭', color: '#6e8b53' },
  { tag: 'LIVE', title: '○○ライブ 10周年', color: '#34577b' },
]

export default function IwaimasuPage() {
  return (
    <div>
      <BreadcrumbJsonLd
        items={[
          { name: 'ホーム', href: '/' },
          { name: '祝枡 IWAIMASU', href: '/iwaimasu' },
        ]}
      />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="max-w-5xl mx-auto px-6 py-24 md:py-36 relative">
          <MasuCluster className="absolute right-0 top-1/2 -translate-y-1/2 hidden md:block pointer-events-none" />
          <p className="text-[10px] tracking-[0.3em] text-[var(--iw-aka)] mb-6">
            新しいお祝いの選択肢。
          </p>
          <h1 className="[font-family:var(--font-mincho)] text-4xl md:text-6xl leading-snug tracking-[0.08em]">
            祝福を、
            <br />
            形に残す。
          </h1>
          <p className="mt-10 text-xs md:text-sm leading-[2.6] text-[var(--iw-gray)]">
            創業記念。周年イベント。蔵開き。
            <br />
            収穫祭。ライブ。開店祝い。
            <br />
            お祝いの形は、一つではありません。
          </p>
          <div className="mt-12">
            <Link
              href="/iwaimasu/for-organizers"
              className="inline-block bg-[var(--iw-ink)] text-white px-10 py-4 text-xs tracking-[0.2em] hover:bg-[var(--iw-wood)] transition-colors"
            >
              導入をお考えの方へ →
            </Link>
          </div>
        </div>
      </section>

      {/* お祝いの形 */}
      <section className="bg-[var(--iw-paper2)]">
        <div className="max-w-5xl mx-auto px-6 py-20 md:py-28 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="[font-family:var(--font-mincho)] text-2xl md:text-3xl leading-relaxed tracking-[0.06em]">
              お祝いの形は、
              <br />
              もっと自由でいい。
            </h2>
            <div className="mt-8 text-xs leading-[2.6] text-[var(--iw-gray)] space-y-4">
              <p>
                祝い花。バルーン。贈り物。
                <br />
                そして、祝枡。
              </p>
              <p>
                会場を彩り、その先も人や企業の歩みとともに、
                <br className="hidden md:block" />
                さまざまな形で受け継がれていきます。
              </p>
            </div>
          </div>
          <div className="flex justify-center">
            <MasuMotif stroke="var(--iw-wood)" className="w-56 md:w-72" />
          </div>
        </div>
      </section>

      {/* イベント後 */}
      <section>
        <div className="max-w-5xl mx-auto px-6 py-20 md:py-28">
          <SectionHead
            eyebrow="AFTER THE EVENT"
            title={
              <>
                イベントのあとも、
                <br />
                楽しみはつづきます。
              </>
            }
          />
          <div className="mt-12 flex flex-wrap justify-center gap-4 md:gap-6">
            {afterWords.map((w) => (
              <span
                key={w.word}
                className="[font-family:var(--font-mincho)] border border-[var(--iw-line)] bg-white px-8 py-4 text-sm tracking-[0.15em]"
                style={{ borderTop: `3px solid ${w.color}` }}
              >
                {w.word}
              </span>
            ))}
          </div>
          <p className="mt-12 text-center text-xs leading-[2.4] text-[var(--iw-gray)]">
            その先の物語は、企業や人、
            <br />
            それぞれによって広がっていきます。
          </p>
        </div>
      </section>

      {/* Story */}
      <section className="bg-[var(--iw-paper2)]">
        <div className="max-w-5xl mx-auto px-6 py-20 md:py-28">
          <SectionHead
            eyebrow="STORY"
            title={
              <>
                祝福とともに歩む、
                <br />
                それぞれの物語。
              </>
            }
          />
          <div className="mt-12 grid md:grid-cols-3 gap-6">
            {stories.map((s) => (
              <Link
                key={s.title}
                href="/iwaimasu/story"
                className="group bg-white border border-[var(--iw-line)] p-8 card-hover"
                style={{ borderTop: `3px solid ${s.color}` }}
              >
                <MasuMotif stroke={s.color} opacity={0.5} className="w-20 mb-6" />
                <p className="text-[9px] tracking-[0.25em] mb-2" style={{ color: s.color }}>
                  {s.tag}
                </p>
                <h3 className="[font-family:var(--font-mincho)] text-base leading-relaxed">
                  {s.title}
                </h3>
                <p className="mt-3 text-[10px] tracking-[0.2em] text-[var(--iw-gray)]">
                  COMING SOON
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 贈りたい方へ */}
      <section>
        <div className="max-w-2xl mx-auto px-6 py-20 md:py-28 text-center">
          <SectionHead eyebrow="FOR SUPPORTERS" title="贈りたい方へ。" />
          <p className="mt-8 text-xs leading-[2.6] text-[var(--iw-gray)]">
            「お世話になったあの会社の周年に、祝枡を贈りたい。」
            <br />
            そんなご相談も、受け付けています。
            <br />
            お相手の節目に合わせて、FOMUSからご提案いたします。
          </p>
          <div className="mt-10">
            <Link
              href="/contact"
              className="inline-block border border-[var(--iw-ink)] px-10 py-4 text-xs tracking-[0.2em] hover:bg-[var(--iw-ink)] hover:text-white transition-colors"
            >
              贈りたい相手がいる →
            </Link>
          </div>
        </div>
      </section>

      <IwaimasuCta />
    </div>
  )
}
