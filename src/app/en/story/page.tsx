import Link from 'next/link'
import type { Metadata } from 'next'
import { BreadcrumbJsonLd } from '@/components/seo/JsonLd'

export const metadata: Metadata = {
  title: 'The FOMUS Story',
  description: 'Reimagining the masu — a traditional Japanese cypress (hinoki) box — for modern life. Discover the story behind FOMUS.',
  alternates: {
    canonical: '/en/story',
    languages: {
      ja: '/story',
      en: '/en/story',
    },
  },
  openGraph: {
    locale: 'en_US',
    title: 'The FOMUS Story',
    description: 'Reimagining the masu — a traditional Japanese cypress (hinoki) box — for modern life.',
    url: 'https://shop.fomus.jp/en/story',
  },
}

export default function StoryPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 sm:px-8 lg:px-10">
      <BreadcrumbJsonLd items={[
        { name: 'Home', href: '/en' },
        { name: 'The FOMUS Story', href: '/en/story' },
      ]} />

      <section className="pt-20 pb-16 md:pt-32 md:pb-24">
        <p className="text-[10px] tracking-[0.25em] uppercase text-[var(--color-muted)] mb-4">About</p>
        <h1 className="text-3xl md:text-4xl font-light text-[var(--foreground)] leading-snug mb-6">
          Extraordinary things, made in Japan.
        </h1>
        <p className="text-xs leading-[2.2] text-[var(--color-muted)] max-w-lg">
          FOMUS is a brand that reimagines the masu — a traditional Japanese cypress (hinoki) box —
          for modern life, creating new value from a centuries-old craft. Drawing on the artisan
          techniques of Ogaki, Gifu Prefecture, we create products no one has ever seen before,
          from masu towers and beyond.
        </p>
      </section>

      <div className="h-px bg-[var(--color-border)]" />

      <section className="py-16 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16">
          <div>
            <h2 className="text-lg font-medium text-[var(--foreground)] mb-4">It begins with the masu</h2>
            <p className="text-xs leading-[2.2] text-[var(--color-muted)]">
              Ogaki, Gifu Prefecture — the heartland of masu making, where 80% of
              all masu in Japan are crafted.
              Building on this traditional craft, FOMUS creates
              new products that celebrate the fragrance and beauty
              of Japanese hinoki.
            </p>
          </div>
          <div>
            <h2 className="text-lg font-medium text-[var(--foreground)] mb-4">To the world</h2>
            <p className="text-xs leading-[2.2] text-[var(--color-muted)]">
              To share Japanese traditional craft with the world,
              we carry our masu to marathons and events overseas.
              We also create products beyond the masu,
              from running wear to card games.
            </p>
          </div>
        </div>
      </section>

      <div className="h-px bg-[var(--color-border)]" />

      <section className="py-16 md:py-24 text-center">
        <p className="text-xs text-[var(--color-muted)] mb-8">
          Learn more about what FOMUS does and where we are headed.
        </p>
        <div className="flex items-center justify-center gap-6 flex-wrap">
          <a
            href="https://www.fomus.jp/"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary inline-block"
          >
            Explore FOMUS.jp
          </a>
          <Link
            href="/en/shop"
            className="text-[11px] tracking-[0.15em] uppercase text-[var(--color-muted)] hover:text-[var(--foreground)] transition-colors"
          >
            Shop Products
          </Link>
        </div>
      </section>
    </div>
  )
}
