import type { Metadata } from 'next'
import { BreadcrumbJsonLd } from '@/components/seo/JsonLd'
import { MasuMotif, IwaimasuCta } from '../_components/Shared'

export const metadata: Metadata = {
  title: 'Story',
  description: '祝福とともに歩む、それぞれの物語。祝枡の事例をご紹介します。',
  alternates: { canonical: '/iwaimasu/story' },
}

const stories = [
  { tag: 'SAKE BREWERY', title: '○○酒造\n創業100周年' },
  { tag: 'WINERY', title: '○○ワイナリー\n収穫祭' },
  { tag: 'LIVE', title: '○○ライブ\n10周年' },
]

export default function IwaimasuStoryPage() {
  return (
    <div>
      <BreadcrumbJsonLd
        items={[
          { name: 'ホーム', href: '/' },
          { name: '祝枡 IWAIMASU', href: '/iwaimasu' },
          { name: 'Story', href: '/iwaimasu/story' },
        ]}
      />

      <section>
        <div className="max-w-5xl mx-auto px-6 py-24 md:py-32">
          <p className="text-[10px] tracking-[0.3em] uppercase text-[var(--iw-gold)] mb-6">
            Story
          </p>
          <h1 className="[font-family:var(--font-mincho)] text-3xl md:text-5xl tracking-[0.08em]">
            Story
          </h1>
          <p className="mt-6 text-xs md:text-sm leading-[2.4] text-[var(--iw-gray)]">
            祝福とともに歩む、それぞれの物語。
          </p>
        </div>
      </section>

      <section className="bg-[var(--iw-paper2)]">
        <div className="max-w-5xl mx-auto px-6 py-20 md:py-28">
          <div className="grid md:grid-cols-3 gap-6">
            {stories.map((s) => (
              <article key={s.tag} className="bg-white border border-[var(--iw-line)] p-8">
                <MasuMotif stroke="var(--iw-wood)" opacity={0.35} className="w-20 mb-6" />
                <p className="text-[9px] tracking-[0.25em] text-[var(--iw-gold)] mb-2">{s.tag}</p>
                <h3 className="[font-family:var(--font-mincho)] text-base leading-relaxed whitespace-pre-line">
                  {s.title}
                </h3>
                <p className="mt-3 text-[10px] tracking-[0.2em] text-[var(--iw-gray)]">
                  COMING SOON
                </p>
              </article>
            ))}
          </div>
          <p className="mt-16 text-center text-xs leading-[2.6] text-[var(--iw-gray)]">
            これから、祝枡とともに生まれた物語を
            <br />
            少しずつご紹介してまいります。
          </p>
        </div>
      </section>

      <IwaimasuCta />
    </div>
  )
}
