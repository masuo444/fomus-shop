// KACHIU の商品ラベル。写真が無い間、空のグレー枠の代わりに描く。
// kachiu.jp のモックと同じ語法（和紙の紙片・縦書きの品名・桃色の縦罫・産地）。
// 商品カード（トップ／関連商品）と商品詳細ページで共有する。

export function splitName(name: string): { main: string; sub: string | null; vertical: string } {
  // 「桃と白ワインのコンフィチュール」→ main:「桃と白ワイン」 sub:「コンフィチュール」
  // 「3本セット（化粧箱入り）」      → main:「3本セット」    sub:「化粧箱入り」
  // vertical はラベルの縦書き用。全角括弧・中黒などは縦書きで崩れるので落とす
  const toFullWidth = (t: string) => t.replace(/[0-9A-Za-z]/g, (c) => String.fromCharCode(c.charCodeAt(0) + 0xfee0))
  const bracket = name.match(/^(.*?)[（(](.*?)[）)]\s*$/)
  if (bracket) {
    return { main: bracket[1].trim(), sub: bracket[2].trim(), vertical: toFullWidth(bracket[1].trim()) }
  }
  const m = name.match(/^(.*?)の(コンフィチュール|セット.*)$/)
  if (m) return { main: m[1], sub: m[2], vertical: toFullWidth(m[1]) }
  return { main: name, sub: null, vertical: toFullWidth(name) }
}


export default function Label({ name, index }: { name: string; index: number }) {
  const { sub, vertical } = splitName(name)
  const n = Math.max(1, vertical.length)
  // 縦書きの文字サイズは、カード幅（=cqw）から文字数で逆算する。
  // ラベル高さ ≒ カード幅 × (5/4) × 0.74。その 44% を縦書きに使う。
  // → 1文字あたり cqw × 1.25 × 0.74 × 0.44 / n ≒ cqw × 0.407 / n
  const spacing = n <= 2 ? 0.4 : n <= 4 ? 0.2 : 0.08
  const perChar = 0.407 / n / (1 + spacing)
  const cap = n <= 2 ? 26 : n <= 4 ? 20 : 15
  const vSize = `min(${(perChar * 100).toFixed(2)}cqw, ${cap}px)`
  // 4種で微妙に色相を振り、並べたときに単調にならないよう「同じ紙、違う中身」を出す
  const tints = ['#f6ebe6', '#f3e6e4', '#efe0e0', '#f4ece5']
  const tint = tints[index % tints.length]
  return (
    <div
      className="absolute inset-0 flex items-center justify-center"
      style={{ containerType: 'inline-size', background: `linear-gradient(180deg, ${tint} 0%, var(--color-subtle) 100%)` }}
      aria-hidden="true"
    >
      {/* 紙のラベル：上=ブランド／中=縦書きの品名／下=品目・産地 */}
      <div
        className="relative flex flex-col items-center justify-between"
        style={{
          width: '58%',
          height: '74%',
          background: 'var(--background)',
          boxShadow: '0 1px 0 rgba(74,52,56,.06), 0 10px 26px -14px rgba(74,52,56,.35)',
          padding: '9% 6% 8%',
        }}
      >
        <span className="font-serif font-medium text-[var(--foreground)] shrink-0" style={{ fontSize: 'clamp(8px, 4.6cqw, 13px)', letterSpacing: '0.34em', textIndent: '0.34em' }}>
          KACHIU
        </span>

        <span
          className="text-[var(--foreground)] whitespace-nowrap shrink-0"
          style={{ writingMode: 'vertical-rl', textOrientation: 'upright', fontFamily: 'var(--font-noto-serif-jp, "Noto Serif JP", serif)', fontSize: vSize, letterSpacing: `${spacing}em`, fontWeight: 500, lineHeight: 1 }}
        >
          {vertical}
        </span>

        <span className="flex flex-col items-center gap-[0.35em] shrink-0">
          {sub && (
            <span className="text-[var(--color-muted)] whitespace-nowrap" style={{ fontSize: 'clamp(6.5px, 3.4cqw, 10px)', letterSpacing: '0.16em', textIndent: '0.16em' }}>
              {sub}
            </span>
          )}
          <span className="block bg-[var(--color-accent)]" style={{ width: 1, height: 'clamp(9px, 6cqw, 18px)', opacity: .8 }} />
          <span className="text-[var(--color-muted)] whitespace-nowrap" style={{ fontSize: 'clamp(5.5px, 2.9cqw, 8.5px)', letterSpacing: '0.16em', textIndent: '0.16em' }}>
            FUEFUKI · YAMANASHI
          </span>
        </span>
      </div>
    </div>
  )
}
