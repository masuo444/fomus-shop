import Link from 'next/link'
import type { Metadata } from 'next'
import siteConfig from '@/site.config'
import { BreadcrumbJsonLd, HowToJsonLd, FAQPageJsonLd } from '@/components/seo/JsonLd'

export const metadata: Metadata = {
  title: 'JPYC決済について',
  description: 'FOUMSショップではJPYC（日本円ステーブルコイン）で枡やグッズを購入できます。Polygonネットワーク対応。暗号資産で伝統工芸品を買える、ちょっと面白い体験。',
  alternates: {
    canonical: '/jpyc',
  },
}

export default function JpycPage() {
  if (!siteConfig.jpyc.enabled) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-32 text-center">
        <p className="text-sm text-[var(--color-muted)]">JPYC決済は現在ご利用いただけません。</p>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-6 sm:px-8 lg:px-10">
      <BreadcrumbJsonLd items={[
        { name: 'ホーム', href: '/' },
        { name: 'JPYC決済について', href: '/jpyc' },
      ]} />
      <HowToJsonLd
        name="JPYCでFOUMSの商品を購入する方法"
        description="日本円ステーブルコインJPYCを使ってFOUMSオンラインショップで商品を購入する手順"
        steps={[
          { name: '商品を選んでカートへ', text: '通常のお買い物と同じように、商品を選んでカートに入れます。' },
          { name: '決済方法で「JPYC」を選択', text: 'チェックアウト画面で決済方法に「JPYC（Polygon）」を選びます。' },
          { name: '指定アドレスへJPYCを送金', text: '表示されるウォレットアドレスに合計金額分のJPYCをPolygonネットワークで送金します。' },
          { name: 'トランザクションハッシュを入力', text: '送金後に表示されるトランザクションハッシュを入力して送信します。' },
          { name: '決済完了', text: '12ブロック承認後、注文が確定します。' },
        ]}
      />
      <FAQPageJsonLd items={[
        { question: 'JPYCとは何ですか？', answer: 'JPYC（Japanese Yen Coin）は日本円に連動したステーブルコインです。1 JPYC = 1円として利用でき、Polygonネットワーク上で送金できます。' },
        { question: 'FOUMSでJPYCで何が買えますか？', answer: '枡、カードゲーム、ランニングウェアなど、FOUMSの全商品をJPYCで購入できます。' },
        { question: 'JPYC決済の手数料はかかりますか？', answer: '商品代金以外に、Polygonネットワークのガス代（通常数円程度）がお客様負担となります。' },
        { question: 'どのウォレットが必要ですか？', answer: 'MetaMaskなど、Polygonネットワーク対応のウォレットが必要です。' },
        { question: '送金額を間違えた場合はどうなりますか？', answer: '注文金額と送金額が一致しない場合、決済が承認されません。お問い合わせください。' },
      ]} />

      {/* Hero */}
      <section className="pt-20 pb-16 md:pt-32 md:pb-24">
        <p className="text-[10px] tracking-[0.25em] uppercase text-[var(--color-muted)] mb-4">Payment</p>
        <h1 className="text-3xl md:text-4xl font-light text-[var(--foreground)] leading-snug mb-6">
          JPYCで枡を買う。
        </h1>
        <p className="text-xs leading-[2.2] text-[var(--color-muted)] max-w-lg">
          日本円ステーブルコイン「JPYC」で、FOUMSの枡やグッズを購入できます。
          暗号資産で伝統工芸品を手に入れる — ちょっと面白い体験です。
        </p>
      </section>

      <div className="h-px bg-[var(--color-border)]" />

      {/* What is JPYC */}
      <section className="py-16 md:py-20">
        <h2 className="text-lg font-medium text-[var(--foreground)] mb-6">JPYCとは</h2>
        <p className="text-xs leading-[2.2] text-[var(--color-muted)] mb-6">
          JPYC（Japanese Yen Coin）は、日本円に連動したステーブルコインです。
          1 JPYC = 1円として利用でき、Polygonネットワーク上で送金できます。
          法定通貨のような価格安定性を持ちながら、ブロックチェーンの透明性とスピードを兼ね備えています。
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-px bg-[var(--color-border)] border border-[var(--color-border)]">
          {[
            { label: '1 JPYC', desc: '= 1円相当' },
            { label: 'Polygon', desc: 'ネットワーク対応' },
            { label: '12ブロック', desc: '承認で決済完了' },
          ].map((item) => (
            <div key={item.label} className="bg-[var(--background)] p-6">
              <p className="text-sm font-medium text-[var(--foreground)] mb-1">{item.label}</p>
              <p className="text-[11px] text-[var(--color-muted)]">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="h-px bg-[var(--color-border)]" />

      {/* How to use */}
      <section className="py-16 md:py-20">
        <h2 className="text-lg font-medium text-[var(--foreground)] mb-8">購入の流れ</h2>
        <div className="space-y-8">
          {[
            {
              step: '01',
              title: '商品を選んでカートへ',
              desc: '通常のお買い物と同じように、商品を選んでカートに入れます。',
            },
            {
              step: '02',
              title: '決済方法で「JPYC」を選択',
              desc: 'チェックアウト画面で、お届け先を入力し、決済方法に「JPYC（Polygon）」を選びます。',
            },
            {
              step: '03',
              title: '指定アドレスへJPYCを送金',
              desc: '表示されるウォレットアドレスに、合計金額分のJPYCをPolygonネットワークで送金します。MetaMask等のウォレットから送金してください。',
            },
            {
              step: '04',
              title: 'トランザクションハッシュを入力',
              desc: '送金後に表示されるトランザクションハッシュ（0x...）を入力して送信。ブロックチェーン上で自動検証されます。',
            },
            {
              step: '05',
              title: '決済完了',
              desc: '12ブロック承認後、注文が確定します。確認メールが届きます。',
            },
          ].map((item) => (
            <div key={item.step} className="flex gap-6">
              <span className="text-[10px] tracking-[0.25em] text-[var(--color-muted)] mt-1 shrink-0">{item.step}</span>
              <div>
                <p className="text-sm font-medium text-[var(--foreground)] mb-1">{item.title}</p>
                <p className="text-xs leading-[2] text-[var(--color-muted)]">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="h-px bg-[var(--color-border)]" />

      {/* Notes */}
      <section className="py-16 md:py-20">
        <h2 className="text-lg font-medium text-[var(--foreground)] mb-6">ご注意</h2>
        <ul className="space-y-3">
          {[
            'JPYC決済は日本円（JPY）建ての注文のみ対応です。',
            'Polygonネットワークのみ対応しています（Ethereum mainnet等は非対応）。',
            '送金手数料（ガス代）はお客様負担となります（Polygonのため通常ごくわずかです）。',
            '送金後の取り消し・返金はJPYCでの返金となります。',
            '注文金額と送金額が一致しない場合、決済が承認されません。',
          ].map((note, i) => (
            <li key={i} className="flex gap-3">
              <span className="w-px h-4 bg-[var(--color-border)] mt-1 shrink-0" />
              <p className="text-xs leading-relaxed text-[var(--color-muted)]">{note}</p>
            </li>
          ))}
        </ul>
      </section>

      <div className="h-px bg-[var(--color-border)]" />

      {/* FAQ */}
      <section className="py-16 md:py-20">
        <h2 className="text-lg font-medium text-[var(--foreground)] mb-8">よくあるご質問</h2>
        <div className="space-y-6">
          {[
            { q: 'JPYCとは何ですか？', a: 'JPYC（Japanese Yen Coin）は日本円に連動したステーブルコインです。1 JPYC = 1円として利用でき、Polygonネットワーク上で送金できます。' },
            { q: 'FOUMSでJPYCで何が買えますか？', a: '枡、カードゲーム、ランニングウェアなど、FOUMSの全商品をJPYCで購入できます。' },
            { q: 'JPYC決済の手数料はかかりますか？', a: '商品代金以外に、Polygonネットワークのガス代（通常数円程度）がお客様負担となります。' },
            { q: 'どのウォレットが必要ですか？', a: 'MetaMaskなど、Polygonネットワーク対応のウォレットが必要です。' },
            { q: '送金額を間違えた場合はどうなりますか？', a: '注文金額と送金額が一致しない場合、決済が承認されません。お問い合わせください。' },
          ].map((item, i) => (
            <div key={i}>
              <h3 className="text-sm font-medium text-[var(--foreground)] mb-2">{item.q}</h3>
              <p className="text-xs leading-[2] text-[var(--color-muted)]">{item.a}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="h-px bg-[var(--color-border)]" />

      {/* CTA */}
      <section className="py-16 md:py-24 text-center">
        <p className="text-xs text-[var(--color-muted)] mb-8">
          JPYCで伝統工芸品を買う。新しい体験を。
        </p>
        <div className="flex items-center justify-center gap-6 flex-wrap">
          <Link href="/shop" className="btn-primary inline-block">
            SHOP
          </Link>
          <a
            href="https://jpyc.jp"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] tracking-[0.12em] uppercase text-[var(--color-muted)] hover:text-[var(--foreground)] transition-colors"
          >
            JPYC公式サイト
          </a>
        </div>
      </section>
    </div>
  )
}
