import Link from 'next/link'

/** 枡の線画モチーフ */
export function MasuMotif({
  stroke = 'var(--iw-gold)',
  opacity = 0.45,
  className = '',
}: {
  stroke?: string
  opacity?: number
  className?: string
}) {
  return (
    <svg
      viewBox="0 0 200 200"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <g
        fill="none"
        stroke={stroke}
        strokeWidth="1.2"
        strokeLinejoin="round"
        opacity={opacity}
      >
        <path d="M100 38 L168 74 L100 110 L32 74 Z" />
        <path d="M32 74 L32 140 L100 176 L168 140 L168 74" />
        <path d="M100 110 L100 176" />
        <path d="M48 83 L48 131" />
        <path d="M152 83 L152 131" />
      </g>
    </svg>
  )
}

/** 祝い色の伝統色パレット（朱・金・藍・萌黄・桜） */
export const IWAI_COLORS = ['#c73e3a', '#b89150', '#34577b', '#6e8b53', '#c98fa0']

/** 色とりどりの枡が舞うクラスター（ヒーロー用） */
export function MasuCluster({ className = 'relative' }: { className?: string }) {
  const cubes = [
    { color: '#b89150', size: 220, x: 90, y: 40, opacity: 0.75 },
    { color: '#c73e3a', size: 110, x: 0, y: 0, opacity: 0.7 },
    { color: '#34577b', size: 90, x: 280, y: 150, opacity: 0.6 },
    { color: '#6e8b53', size: 70, x: 30, y: 200, opacity: 0.6 },
    { color: '#c98fa0', size: 60, x: 250, y: 0, opacity: 0.65 },
  ]
  return (
    <div className={className} style={{ width: 380, height: 300 }} aria-hidden="true">
      {cubes.map((c, i) => (
        <svg
          key={i}
          viewBox="0 0 200 200"
          xmlns="http://www.w3.org/2000/svg"
          className="absolute"
          style={{ width: c.size, height: c.size, left: c.x, top: c.y, opacity: c.opacity }}
        >
          <g fill="none" stroke={c.color} strokeWidth="1.6" strokeLinejoin="round">
            <path d="M100 38 L168 74 L100 110 L32 74 Z" />
            <path d="M32 74 L32 140 L100 176 L168 140 L168 74" />
            <path d="M100 110 L100 176" />
            <path d="M48 83 L48 131" />
            <path d="M152 83 L152 131" />
          </g>
        </svg>
      ))}
    </div>
  )
}

/** セクション見出し（eyebrow + 明朝見出し） */
export function SectionHead({
  eyebrow,
  title,
  className = '',
}: {
  eyebrow: string
  title: React.ReactNode
  className?: string
}) {
  return (
    <div className={`text-center ${className}`}>
      <p className="text-[10px] tracking-[0.3em] uppercase text-[var(--iw-gold)] mb-4">
        {eyebrow}
      </p>
      <h2 className="[font-family:var(--font-mincho)] text-2xl md:text-3xl leading-relaxed tracking-[0.06em]">
        {title}
      </h2>
    </div>
  )
}

/** 墨色の締めCTA */
export function IwaimasuCta({
  lead = 'お祝いの気持ちを、その日だけではなく、その先へ。',
}: {
  lead?: string
}) {
  return (
    <section className="bg-[var(--iw-ink)] text-white">
      <div className="max-w-3xl mx-auto px-6 py-24 md:py-32 text-center">
        <div className="flex justify-center gap-3 mb-10" aria-hidden="true">
          {IWAI_COLORS.map((c) => (
            <svg key={c} viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="w-7 h-7">
              <g fill="none" stroke={c} strokeWidth="6" strokeLinejoin="round">
                <path d="M100 38 L168 74 L100 110 L32 74 Z" />
                <path d="M32 74 L32 140 L100 176 L168 140 L168 74" />
                <path d="M100 110 L100 176" />
              </g>
            </svg>
          ))}
        </div>
        <p className="text-[10px] tracking-[0.3em] text-[var(--iw-wood-pale)] mb-6">
          新しいお祝いの選択肢。
        </p>
        <h2 className="[font-family:var(--font-mincho)] text-3xl md:text-5xl tracking-[0.08em] leading-snug">
          祝福を、形に残す。
        </h2>
        <p className="mt-8 text-xs leading-[2.4] text-[var(--iw-wood-pale)]">{lead}</p>
        <div className="mt-12">
          <Link
            href="/contact?subject=祝枡について（導入のご相談）"
            className="inline-block border border-[var(--iw-gold)] text-[var(--iw-wood-pale)] hover:bg-[var(--iw-gold)] hover:text-[var(--iw-ink)] transition-colors px-12 py-4 text-xs tracking-[0.2em]"
          >
            お問い合わせ →
          </Link>
        </div>
      </div>
    </section>
  )
}
