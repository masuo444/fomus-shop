import type { Metadata } from 'next'
import Link from 'next/link'
import { Shippori_Mincho } from 'next/font/google'

const shippori = Shippori_Mincho({
  variable: '--font-mincho',
  subsets: ['latin'],
  weight: ['400', '500', '600'],
})

export const metadata: Metadata = {
  title: {
    default: '祝枡 IWAIMASU ｜ 新しいお祝いの選択肢',
    template: '%s ｜ 祝枡 IWAIMASU',
  },
  description:
    '祝枡（いわいます）は、企業や団体の節目を祝うための新しいお祝いの選択肢。祝い花のように贈り、その先も残る。FOMUSが受付から制作までを担います。',
  openGraph: {
    title: '祝枡 IWAIMASU ｜ 祝福を、形に残す。',
    description:
      '祝い花のように贈る、新しいお祝いの形。周年・蔵開き・ライブの節目に。',
    images: [{ url: '/iwaimasu/og.jpg', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    images: ['/iwaimasu/og.jpg'],
  },
}

const nav = [
  { href: '/iwaimasu', label: '祝枡とは' },
  { href: '/iwaimasu/for-organizers', label: '導入をお考えの方へ' },
  { href: '/iwaimasu/story', label: 'Story' },
  { href: '/iwaimasu/faq', label: 'FAQ' },
]

export default function IwaimasuLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div
      className={`${shippori.variable} bg-[#faf8f4] text-[#1c1a17]`}
      style={
        {
          '--iw-ink': '#1c1a17',
          '--iw-gold': '#b89150',
          '--iw-wood': '#a07b48',
          '--iw-wood-pale': '#e9dcc4',
          '--iw-paper': '#faf8f4',
          '--iw-paper2': '#f3efe7',
          '--iw-line': '#e6e1d8',
          '--iw-gray': '#6c6760',
          '--iw-aka': '#c73e3a',
          '--iw-ai': '#34577b',
          '--iw-midori': '#6e8b53',
          '--iw-sakura': '#c98fa0',
        } as React.CSSProperties
      }
    >
      {/* 祝枡サブナビ */}
      <nav className="border-b border-[var(--iw-line)] bg-[var(--iw-paper)]/90 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-6 flex items-center justify-between gap-4 h-12 overflow-x-auto">
          <Link
            href="/iwaimasu"
            className="[font-family:var(--font-mincho)] text-base tracking-[0.2em] whitespace-nowrap"
          >
            祝枡
            <span className="ml-2 text-[9px] tracking-[0.3em] text-[var(--iw-gold)] align-middle">
              IWAIMASU
            </span>
          </Link>
          <div className="flex items-center gap-5">
            {nav.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                className="text-[11px] tracking-[0.12em] text-[var(--iw-gray)] hover:text-[var(--iw-ink)] whitespace-nowrap"
              >
                {n.label}
              </Link>
            ))}
          </div>
        </div>
      </nav>
      {/* 祝い色の水引ライン */}
      <div
        className="h-[3px] w-full"
        style={{
          backgroundImage:
            'linear-gradient(to right, #c73e3a 0 20%, #b89150 20% 40%, #c98fa0 40% 60%, #6e8b53 60% 80%, #34577b 80% 100%)',
        }}
      />
      {children}
    </div>
  )
}
