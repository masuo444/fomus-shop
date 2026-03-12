import Link from 'next/link'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { getPublishedShopIds } from '@/lib/shop'
import { getCurrency } from '@/lib/currency'
import ProductCard from '@/components/product/ProductCard'
import ScrollReveal from '@/components/ui/ScrollReveal'
import siteConfig from '@/site.config'
import type { Product } from '@/lib/types'

export const metadata: Metadata = {
  title: {
    absolute: `${siteConfig.name} — Official Online Shop`,
  },
  description: `${siteConfig.name}の公式オンラインショップ。枡・デジタルアイテム・限定プロダクトの購入。`,
}

export default async function HomePage() {
  const supabase = await createClient()
  const currency = await getCurrency()
  const shopIds = await getPublishedShopIds()
  const mpName = siteConfig.features.marketplaceName

  let isLoggedIn = false
  let isPremiumMember = false
  const { data: { user } } = await supabase.auth.getUser()
  if (user) {
    isLoggedIn = true
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_premium_member')
      .eq('id', user.id)
      .single()
    if (profile?.is_premium_member) isPremiumMember = true
  }

  let newProducts: Product[] = []
  if (shopIds.length > 0) {
    const { data } = await supabase
      .from('products')
      .select('*')
      .in('shop_id', shopIds)
      .eq('is_published', true)
      .eq('item_type', 'physical')
      .order('created_at', { ascending: false })
      .limit(8)
    newProducts = data || []
  }

  return (
    <div>
      {/* ===== HERO — Full-width, immersive ===== */}
      <section className="relative bg-[var(--foreground)] overflow-hidden">
        {/* Subtle grid pattern overlay */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)',
          backgroundSize: '60px 60px'
        }} />

        <div className="relative max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 py-24 md:py-36 lg:py-44">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-12">
            <div className="max-w-2xl">
              <p className="text-[10px] tracking-[0.5em] uppercase text-white/30 mb-8">
                Official Online Shop
              </p>
              <h1 className="font-display text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-light tracking-wide text-white leading-[0.85]">
                FOMUS
              </h1>
              <p className="mt-8 text-sm md:text-base leading-[2] text-white/40 max-w-lg">
                1300年の伝統を、現代のプロダクトに。
                <br className="hidden sm:block" />
                枡・オリジナルグッズ・デジタルアイテム。
              </p>
              <div className="mt-10 flex items-center gap-5 flex-wrap">
                <Link
                  href="/shop"
                  className="inline-flex items-center gap-3 bg-white text-[var(--foreground)] px-8 py-3.5 rounded-full text-sm font-medium tracking-wide hover:bg-white/90 transition-all hover:-translate-y-0.5"
                >
                  商品を見る
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                </Link>
                <Link
                  href="/shop/masu"
                  className="text-xs tracking-[0.1em] text-white/40 hover:text-white/70 transition-colors border-b border-white/20 pb-0.5"
                >
                  枡について詳しく
                </Link>
              </div>
            </div>

            {/* Trust badges */}
            <div className="flex md:flex-col gap-6 md:gap-4 text-right">
              {[
                { num: '1300', unit: '年', label: '枡の歴史' },
                { num: '100%', unit: '', label: '国産ヒノキ' },
                { num: '1個', unit: 'から', label: 'ご注文可能' },
              ].map((item) => (
                <div key={item.label} className="text-white/20">
                  <p className="font-display text-2xl md:text-3xl font-light text-white/50">
                    {item.num}<span className="text-sm">{item.unit}</span>
                  </p>
                  <p className="text-[9px] tracking-wider mt-1">{item.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom ticker */}
        <div className="border-t border-white/5 py-3 overflow-hidden">
          <div className="animate-marquee whitespace-nowrap flex gap-12">
            {Array.from({ length: 2 }).map((_, i) => (
              <span key={i} className="flex gap-12 text-[10px] tracking-[0.3em] uppercase text-white/15">
                <span>Stripe決済</span>
                <span>銀行振込OK</span>
                <span>JPYC対応</span>
                <span>国内送料¥1,000〜</span>
                <span>海外発送対応</span>
                <span>GUILD会員送料無料</span>
                <span>防水コーティング対応</span>
                <span>名入れ・焼印</span>
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ===== NEW ARRIVALS ===== */}
      {newProducts.length > 0 && (
        <section className="py-20 md:py-32">
          <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
            <ScrollReveal>
              <div className="flex items-end justify-between mb-12">
                <div>
                  <p className="text-[10px] tracking-[0.4em] uppercase text-[var(--color-muted)] mb-3">
                    New Arrivals
                  </p>
                  <h2 className="font-display text-3xl md:text-4xl font-light text-[var(--foreground)]">
                    商品一覧
                  </h2>
                </div>
                <Link
                  href="/shop"
                  className="hidden md:inline-flex items-center gap-3 text-xs tracking-[0.1em] text-[var(--color-muted)] hover:text-[var(--foreground)] transition-colors group"
                >
                  すべて見る
                  <span className="w-6 h-px bg-current group-hover:w-10 transition-all" />
                </Link>
              </div>
            </ScrollReveal>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
              {newProducts.map((product, i) => (
                <ScrollReveal key={product.id} delay={i * 80}>
                  <ProductCard
                    product={product}
                    isLoggedIn={isLoggedIn}
                    isPremiumMember={isPremiumMember}
                    currency={currency}
                  />
                </ScrollReveal>
              ))}
            </div>

            <div className="mt-10 text-center md:hidden">
              <Link href="/shop" className="btn-outline inline-block">
                すべての商品を見る
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ===== BRAND STORY — Visual split section ===== */}
      <section className="py-0">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
          <ScrollReveal>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-0 border border-[var(--color-border)] overflow-hidden rounded-2xl">
              {/* Left — Image */}
              <div className="aspect-square md:aspect-auto bg-[var(--color-subtle)] relative overflow-hidden">
                <img
                  src="https://www.fomus.jp/assets/media/asset-16e2c54a31d6.jpg"
                  alt="FOMUS 枡"
                  className="w-full h-full object-cover"
                />
              </div>
              {/* Right — Text */}
              <div className="p-8 md:p-14 lg:p-20 flex flex-col justify-center">
                <p className="text-[10px] tracking-[0.4em] uppercase text-[var(--color-muted)] mb-6">
                  Our Story
                </p>
                <h2 className="font-display text-2xl md:text-3xl lg:text-4xl font-light text-[var(--foreground)] leading-snug mb-6">
                  伝統と革新の<br />交差点から
                </h2>
                <p className="text-sm leading-[2] text-[var(--color-muted)] mb-8">
                  FOUMSは、1300年の歴史を持つ「枡」を現代のライフスタイルに再解釈するプロジェクト。
                  国産ヒノキの香り、職人の手仕事、そして新しいデザインの融合。
                  日本酒を楽しむ道具から、ギフト、インテリア、企業ノベルティまで。
                </p>
                <div className="flex gap-4">
                  <Link href="/shop/masu" className="btn-primary inline-block text-xs">
                    枡について
                  </Link>
                  <Link href="/shop" className="btn-outline inline-block text-xs">
                    商品を見る
                  </Link>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ===== CATEGORY NAVIGATION — 3 Pillars ===== */}
      <section className="py-20 md:py-32">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
          <ScrollReveal>
            <div className="text-center mb-14">
              <p className="text-[10px] tracking-[0.4em] uppercase text-[var(--color-muted)] mb-3">
                Categories
              </p>
              <h2 className="font-display text-3xl md:text-4xl font-light text-[var(--foreground)]">
                カテゴリ
              </h2>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <ScrollReveal delay={0}>
              <Link href="/shop" className="group block bg-[var(--color-subtle)] rounded-2xl p-8 md:p-10 card-hover relative overflow-hidden">
                <div className="absolute top-6 right-6 w-10 h-10 rounded-full bg-[var(--foreground)] text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                </div>
                <p className="text-[10px] tracking-[0.3em] uppercase text-[var(--color-muted)] mb-3">01</p>
                <h3 className="font-display text-2xl md:text-3xl font-light text-[var(--foreground)] mb-3">Shop</h3>
                <p className="text-xs leading-[2] text-[var(--color-muted)]">
                  FOMUS枡・SILVA・オリジナルグッズ。防水コーティング・名入れオプション対応。
                </p>
              </Link>
            </ScrollReveal>

            <ScrollReveal delay={100}>
              <Link href="/digital" className="group block bg-[var(--color-subtle)] rounded-2xl p-8 md:p-10 card-hover relative overflow-hidden">
                <div className="absolute top-6 right-6 w-10 h-10 rounded-full bg-[var(--foreground)] text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                </div>
                <p className="text-[10px] tracking-[0.3em] uppercase text-[var(--color-muted)] mb-3">02</p>
                <h3 className="font-display text-2xl md:text-3xl font-light text-[var(--foreground)] mb-3">Digital</h3>
                <p className="text-xs leading-[2] text-[var(--color-muted)]">
                  デジタルアイテム・活動記・限定コンテンツ。所有する体験をデジタルで。
                </p>
              </Link>
            </ScrollReveal>

            {siteConfig.features.marketplace && (
              <ScrollReveal delay={200}>
                <Link href="/market" className="group block bg-[var(--color-subtle)] rounded-2xl p-8 md:p-10 card-hover relative overflow-hidden">
                  <div className="absolute top-6 right-6 w-10 h-10 rounded-full bg-[var(--foreground)] text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                  </div>
                  <p className="text-[10px] tracking-[0.3em] uppercase text-[var(--color-muted)] mb-3">03</p>
                  <h3 className="font-display text-2xl md:text-3xl font-light text-[var(--foreground)] mb-3">{mpName}</h3>
                  <p className="text-xs leading-[2] text-[var(--color-muted)]">
                    メンバーが出品するマーケットプレイス。掘り出し物を見つけよう。
                  </p>
                </Link>
              </ScrollReveal>
            )}
          </div>
        </div>
      </section>

      {/* ===== FEATURES — Trust & value props ===== */}
      <section className="py-16 md:py-24 bg-[var(--color-subtle)]">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
          <ScrollReveal>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
              {[
                {
                  icon: (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
                    </svg>
                  ),
                  label: '多彩な決済',
                  desc: 'カード・銀行振込・JPYC',
                },
                {
                  icon: (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0H6.375c-.621 0-1.125-.504-1.125-1.125v0c0-.621.504-1.125 1.125-1.125h11.25c.621 0 1.125.504 1.125 1.125v0c0 .621-.504 1.125-1.125 1.125zM3.375 14.25h-.375a3 3 0 01-3-3V8.25m6 5.625V4.5h-.75a3 3 0 00-3 3v2.25m15.75 5.25v-5.625A2.625 2.625 0 0015 6.75H9" />
                    </svg>
                  ),
                  label: '国内送料¥1,000〜',
                  desc: 'GUILD会員は送料無料',
                },
                {
                  icon: (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
                    </svg>
                  ),
                  label: '海外発送対応',
                  desc: 'EUR決済・国際配送',
                },
                {
                  icon: (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
                    </svg>
                  ),
                  label: 'カスタマイズ',
                  desc: 'コーティング・名入れ対応',
                },
              ].map((item) => (
                <div key={item.label} className="text-center">
                  <div className="feature-icon mx-auto mb-4">
                    {item.icon}
                  </div>
                  <p className="text-sm font-medium text-[var(--foreground)] mb-1">{item.label}</p>
                  <p className="text-[11px] text-[var(--color-muted)]">{item.desc}</p>
                </div>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ===== FOMUS ORIGINAL + MASU SITE ===== */}
      <section className="py-20 md:py-32">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ScrollReveal>
              <div className="bg-[var(--background)] rounded-2xl p-8 md:p-12 border border-[var(--color-border)] card-hover h-full">
                <p className="text-[10px] tracking-[0.4em] uppercase text-[var(--color-muted)] mb-4">
                  FOMUS Original
                </p>
                <h3 className="font-display text-xl md:text-2xl font-light text-[var(--foreground)] mb-4">
                  FOMUS オリジナル枡
                </h3>
                <p className="text-xs leading-[2] text-[var(--color-muted)] mb-8">
                  FOMUS枡・首掛け枡・アラビア語枡・枡バッジ・七宝焼コラボなど、FOUMSだけのオリジナルプロダクト。防水コーティングオプション対応。
                </p>
                <Link href="/shop" className="btn-primary inline-block text-xs">
                  商品を見る
                </Link>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={100}>
              <div className="bg-[var(--foreground)] rounded-2xl p-8 md:p-12 card-hover h-full">
                <p className="text-[10px] tracking-[0.4em] uppercase text-white/25 mb-4">
                  枡の専門サイト
                </p>
                <h3 className="font-display text-xl md:text-2xl font-light text-white mb-4">
                  通常枡・法人注文・名入れ
                </h3>
                <p className="text-xs leading-[2] text-white/35 mb-8">
                  国産ヒノキ枡の全サイズ・名入れ・焼印・レーザー刻印・企業ノベルティ。法人様は20個から。
                </p>
                <a
                  href="https://masu.fomus.jp"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-3 bg-white text-[var(--foreground)] px-6 py-3 rounded-full text-xs font-medium tracking-wide hover:bg-white/90 transition-all"
                >
                  枡の専門サイトへ
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                </a>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ===== GUILD MEMBERSHIP ===== */}
      {siteConfig.features.membershipProgram && (
        <section className="py-20 md:py-32 bg-[var(--foreground)]">
          <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
            <ScrollReveal>
              <div className="max-w-4xl mx-auto text-center">
                <p className="text-[10px] tracking-[0.5em] uppercase text-white/30 mb-6">
                  Membership
                </p>
                <h2 className="font-display text-3xl md:text-5xl font-light text-white mb-8">
                  FOMUS {siteConfig.features.membershipName}
                </h2>
                <p className="text-sm leading-[2] text-white/40 max-w-lg mx-auto mb-12">
                  メンバー限定の特別価格・送料無料・ポイント還元。FOUMSの世界をもっと楽しむ。
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
                  {[
                    { label: 'メンバー限定価格', desc: '対象商品が会員特別価格に', icon: '%%' },
                    { label: '送料無料', desc: '国内配送がいつでも無料', icon: '🚚' },
                    { label: 'ポイント還元', desc: 'お買い物でポイントが貯まる', icon: '★' },
                  ].map((item) => (
                    <div key={item.label} className="rounded-xl border border-white/10 p-6 text-left">
                      <p className="text-sm font-medium text-white mb-2">{item.label}</p>
                      <p className="text-xs text-white/40">{item.desc}</p>
                    </div>
                  ))}
                </div>

                {siteConfig.features.membershipUrl && (
                  <a
                    href={siteConfig.features.membershipUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-3 text-white border border-white/20 px-8 py-3.5 rounded-full text-sm font-medium tracking-wide hover:bg-white hover:text-[var(--foreground)] transition-all"
                  >
                    {siteConfig.features.membershipName}について詳しく
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                  </a>
                )}
              </div>
            </ScrollReveal>
          </div>
        </section>
      )}

      {/* ===== FINAL CTA ===== */}
      <section className="py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
          <ScrollReveal>
            <div className="text-center">
              <h2 className="font-display text-2xl md:text-4xl font-light text-[var(--foreground)] mb-4">
                FOUMSの世界へ
              </h2>
              <p className="text-sm text-[var(--color-muted)] mb-10">
                日本の伝統工芸を、あなたの暮らしに。
              </p>
              <div className="flex items-center justify-center gap-4 flex-wrap">
                <Link href="/shop" className="btn-primary inline-block">
                  商品一覧
                </Link>
                <Link href="/contact" className="btn-outline inline-block">
                  お問い合わせ
                </Link>
              </div>
              {!isLoggedIn && (
                <p className="mt-8 text-xs text-[var(--color-muted)]">
                  <Link href="/auth/register" className="underline hover:text-[var(--foreground)] transition-colors">
                    アカウント作成
                  </Link>
                  {' '}でポイント還元やお気に入り機能が使えます
                </p>
              )}
            </div>
          </ScrollReveal>
        </div>
      </section>
    </div>
  )
}
