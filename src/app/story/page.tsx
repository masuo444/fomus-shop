import Link from 'next/link'
import type { Metadata } from 'next'
import { BreadcrumbJsonLd } from '@/components/seo/JsonLd'

export const metadata: Metadata = {
  title: 'FOMUSストーリー',
  description: '日本の伝統的な木製枡を現代のライフスタイルに。FOMUSのストーリーをご紹介します。',
  alternates: { canonical: '/story' },
}

export default function StoryPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 sm:px-8 lg:px-10">
      <BreadcrumbJsonLd items={[
        { name: 'ホーム', href: '/' },
        { name: 'FOMUSストーリー', href: '/story' },
      ]} />

      <section className="pt-20 pb-16 md:pt-32 md:pb-24">
        <p className="text-[10px] tracking-[0.25em] uppercase text-[var(--color-muted)] mb-4">About</p>
        <h1 className="text-3xl md:text-4xl font-light text-[var(--foreground)] leading-snug mb-6">
          面白いモノを世の中に。
        </h1>
        <p className="text-xs leading-[2.2] text-[var(--color-muted)] max-w-lg">
          FOMUSは、日本の伝統的な木製枡（ます）を現代のライフスタイルに合わせてリデザインし、
          新しい価値を提案するブランドです。岐阜県大垣市の職人技を活かしながら、
          枡タワーや七宝焼コラボなど、誰も見たことのないプロダクトを生み出しています。
        </p>
      </section>

      <div className="h-px bg-[var(--color-border)]" />

      <section className="py-16 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16">
          <div>
            <h2 className="text-lg font-medium text-[var(--foreground)] mb-4">枡からはじまる</h2>
            <p className="text-xs leading-[2.2] text-[var(--color-muted)]">
              岐阜県大垣市 — 全国シェア80%を誇る枡の産地。
              FOMUSは、この伝統的な枡づくりの技術をベースに、
              国産ヒノキの香りと美しさを活かした
              新しいプロダクトを生み出しています。
            </p>
          </div>
          <div>
            <h2 className="text-lg font-medium text-[var(--foreground)] mb-4">世界へ</h2>
            <p className="text-xs leading-[2.2] text-[var(--color-muted)]">
              日本の伝統工芸を世界に届けるため、
              海外のマラソン大会やイベントに枡を持って参加。
              ランニングウェアやカードゲームなど、
              枡以外のプロダクトも展開中。
            </p>
          </div>
        </div>
      </section>

      <div className="h-px bg-[var(--color-border)]" />

      <section className="py-16 md:py-24 text-center">
        <p className="text-xs text-[var(--color-muted)] mb-8">
          FOMUSの活動やビジョンについて、もっと詳しく。
        </p>
        <div className="flex items-center justify-center gap-6 flex-wrap">
          <a
            href="https://www.fomus.jp/"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary inline-block"
          >
            FOMUS.jp で詳しく見る
          </a>
          <Link
            href="/shop"
            className="text-[11px] tracking-[0.15em] uppercase text-[var(--color-muted)] hover:text-[var(--foreground)] transition-colors"
          >
            商品を見る
          </Link>
        </div>
      </section>
    </div>
  )
}
