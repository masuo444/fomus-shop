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
  description: 'FOMUS公式ショップ。国産ヒノキの枡（FOMUS枡・首掛け枡・アラビア語枡）、SILVA、七宝焼コラボ枡、デジタルアイテムなど。Stripe・銀行振込・JPYC決済対応。',
  keywords: ['FOMUS', '枡', 'ます', 'masu', 'SILVA', '七宝焼', 'ヒノキ枡', 'オリジナルグッズ', 'FOMUS GUILD', 'デジタルアイテム'],
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
      {/* ===== HERO ===== */}
      <section className="relative bg-[var(--foreground)] overflow-hidden min-h-[85vh] flex items-center">
        {/* Animated gradient orbs */}
        <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-[var(--color-accent)] opacity-[0.07] blur-[120px] animate-float" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] rounded-full bg-[#F4A261] opacity-[0.05] blur-[100px] animate-float" style={{ animationDelay: '2s' }} />

        <div className="relative max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 py-20 md:py-28 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left */}
            <div className="lg:col-span-7">
              <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-1.5 mb-8">
                <span className="w-2 h-2 rounded-full bg-[var(--color-accent)] animate-pulse-glow" />
                <span className="text-[11px] tracking-wide text-white/50">New items available</span>
              </div>

              <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight text-white leading-[0.95]">
                MAKE
                <br />
                <span className="gradient-text">CULTURE</span>
                <br />
                HAPPEN<span className="text-[var(--color-accent)]">.</span>
              </h1>

              <p className="mt-8 text-base md:text-lg leading-relaxed text-white/40 max-w-md">
                枡、カードゲーム、七宝焼、デジタルアイテム。
                <br />
                FOUMSが仕掛けるモノとコトの公式ショップ。
              </p>

              <div className="mt-10 flex items-center gap-4 flex-wrap">
                <Link
                  href="/shop"
                  className="btn-accent inline-flex items-center gap-3"
                >
                  ショップへ
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                </Link>
                <Link
                  href="/digital"
                  className="inline-flex items-center gap-2 text-sm text-white/40 hover:text-white transition-colors"
                >
                  デジタルアイテム
                  <span className="text-white/20">→</span>
                </Link>
              </div>
            </div>

            {/* Right — Feature cards */}
            <div className="lg:col-span-5 hidden lg:block">
              <div className="grid grid-cols-2 gap-4">
                {[
                  { emoji: '🪵', title: 'FOMUS枡', desc: '国産ヒノキ', tag: '¥1,500〜' },
                  { emoji: '🃏', title: 'SILVA', desc: 'カードゲーム', tag: '¥990' },
                  { emoji: '🎨', title: '七宝焼コラボ', desc: 'オーダーメイド', tag: 'お問い合わせ' },
                  { emoji: '📱', title: 'デジタル', desc: '活動記・限定品', tag: 'NEW' },
                ].map((item, i) => (
                  <div
                    key={item.title}
                    className="bg-white/[0.04] backdrop-blur-sm border border-white/[0.06] rounded-2xl p-5 hover:bg-white/[0.08] hover:border-white/[0.12] transition-all duration-300 cursor-default"
                    style={{ animationDelay: `${i * 0.15}s` }}
                  >
                    <span className="text-2xl">{item.emoji}</span>
                    <h3 className="text-sm font-semibold text-white mt-3">{item.title}</h3>
                    <p className="text-[11px] text-white/30 mt-1">{item.desc}</p>
                    <span className="inline-block mt-3 text-[10px] tracking-wide font-medium text-[var(--color-accent)] bg-[var(--color-accent)]/10 px-2.5 py-1 rounded-full">
                      {item.tag}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Ticker */}
        <div className="absolute bottom-0 left-0 right-0 border-t border-white/5 py-3 overflow-hidden">
          <div className="animate-marquee whitespace-nowrap flex gap-16">
            {Array.from({ length: 2 }).map((_, i) => (
              <span key={i} className="flex gap-16 text-[10px] tracking-[0.3em] uppercase text-white/10 font-medium">
                <span>FOMUS SHOP</span>
                <span>枡 × デザイン</span>
                <span>Stripe / 銀行振込 / JPYC</span>
                <span>国内送料¥1,000〜</span>
                <span>GUILD会員 送料無料</span>
                <span>海外発送OK</span>
                <span>防水コーティング</span>
                <span>オーダーメイド対応</span>
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ===== PRODUCTS ===== */}
      {newProducts.length > 0 && (
        <section className="py-20 md:py-32">
          <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
            <ScrollReveal>
              <div className="flex items-end justify-between mb-12">
                <div>
                  <p className="text-xs font-semibold tracking-widest uppercase text-[var(--color-accent)] mb-2">Products</p>
                  <h2 className="text-3xl md:text-4xl font-bold text-[var(--foreground)]">商品一覧</h2>
                </div>
                <Link
                  href="/shop"
                  className="hidden md:inline-flex items-center gap-2 text-sm font-medium text-[var(--color-muted)] hover:text-[var(--color-accent)] transition-colors group"
                >
                  すべて見る
                  <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                </Link>
              </div>
            </ScrollReveal>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
              {newProducts.map((product, i) => (
                <ScrollReveal key={product.id} delay={i * 60}>
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
              <Link href="/shop" className="btn-primary inline-block">すべての商品を見る</Link>
            </div>
          </div>
        </section>
      )}

      {/* ===== WHAT IS FOMUS ===== */}
      <section className="py-20 md:py-32 bg-[var(--color-subtle)]">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
          <ScrollReveal>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-20 items-center">
              <div>
                <p className="text-xs font-semibold tracking-widest uppercase text-[var(--color-accent)] mb-4">About FOMUS</p>
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[var(--foreground)] leading-tight mb-6">
                  遊ぶように、<br />つくる。
                </h2>
                <p className="text-sm md:text-base leading-[1.9] text-[var(--color-muted)] mb-8">
                  FOUMSは「面白いモノを世の中に出す」エンターテイメントカンパニー。
                  1300年の歴史を持つ「枡」を現代のプロダクトに落とし込み、
                  カードゲーム「SILVA」を生み出し、七宝焼の職人とコラボし、
                  世界中を旅しながらコンテンツを作り続ける。
                </p>
                <div className="flex flex-wrap gap-3">
                  <Link href="/shop/masu" className="btn-primary inline-block text-xs">枡について詳しく</Link>
                  <a
                    href="https://www.fomus.jp"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-outline inline-flex items-center gap-2 text-xs"
                  >
                    FOMUS 公式サイト
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                  </a>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div className="bg-white rounded-2xl p-6 card-hover">
                    <p className="text-3xl font-black text-[var(--color-accent)]">1300</p>
                    <p className="text-[11px] text-[var(--color-muted)] mt-1">年の枡の歴史</p>
                  </div>
                  <div className="bg-white rounded-2xl p-6 card-hover">
                    <p className="text-3xl font-black text-[var(--foreground)]">100%</p>
                    <p className="text-[11px] text-[var(--color-muted)] mt-1">国産ヒノキ使用</p>
                  </div>
                </div>
                <div className="space-y-4 mt-8">
                  <div className="bg-white rounded-2xl p-6 card-hover">
                    <p className="text-3xl font-black text-[var(--foreground)]">30+</p>
                    <p className="text-[11px] text-[var(--color-muted)] mt-1">渡航国</p>
                  </div>
                  <div className="bg-[var(--foreground)] rounded-2xl p-6 card-hover">
                    <p className="text-3xl font-black text-[var(--color-accent)]">∞</p>
                    <p className="text-[11px] text-white/40 mt-1">可能性</p>
                  </div>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ===== CATEGORIES ===== */}
      <section className="py-20 md:py-32">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
          <ScrollReveal>
            <p className="text-xs font-semibold tracking-widest uppercase text-[var(--color-accent)] mb-2 text-center">Explore</p>
            <h2 className="text-3xl md:text-4xl font-bold text-[var(--foreground)] text-center mb-14">カテゴリ</h2>
          </ScrollReveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <ScrollReveal delay={0}>
              <Link href="/shop" className="group block rounded-2xl overflow-hidden relative card-hover">
                <div className="bg-gradient-to-br from-[var(--foreground)] to-[#2A2A2A] p-8 md:p-10 min-h-[220px] flex flex-col justify-end">
                  <span className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/10 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:rotate-45">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                  </span>
                  <p className="text-[10px] tracking-widest uppercase text-white/25 mb-2">01</p>
                  <h3 className="text-2xl font-bold text-white mb-2">Shop</h3>
                  <p className="text-xs text-white/35 leading-relaxed">FOMUS枡・SILVA・バッジ・コラボ枡。防水コーティング対応。</p>
                </div>
              </Link>
            </ScrollReveal>

            <ScrollReveal delay={100}>
              <Link href="/digital" className="group block rounded-2xl overflow-hidden relative card-hover">
                <div className="bg-gradient-to-br from-[var(--color-accent)] to-[#F4A261] p-8 md:p-10 min-h-[220px] flex flex-col justify-end">
                  <span className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/20 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:rotate-45">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                  </span>
                  <p className="text-[10px] tracking-widest uppercase text-white/40 mb-2">02</p>
                  <h3 className="text-2xl font-bold text-white mb-2">Digital</h3>
                  <p className="text-xs text-white/60 leading-relaxed">活動記・限定デジタルアイテム・チケット。</p>
                </div>
              </Link>
            </ScrollReveal>

            {siteConfig.features.marketplace && (
              <ScrollReveal delay={200}>
                <Link href="/market" className="group block rounded-2xl overflow-hidden relative card-hover">
                  <div className="bg-gradient-to-br from-[var(--color-subtle)] to-white border border-[var(--color-border)] p-8 md:p-10 min-h-[220px] flex flex-col justify-end">
                    <span className="absolute top-6 right-6 w-10 h-10 rounded-full bg-[var(--foreground)]/5 text-[var(--foreground)] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:rotate-45">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                    </span>
                    <p className="text-[10px] tracking-widest uppercase text-[var(--color-muted)] mb-2">03</p>
                    <h3 className="text-2xl font-bold text-[var(--foreground)] mb-2">{mpName}</h3>
                    <p className="text-xs text-[var(--color-muted)] leading-relaxed">メンバーが出品するマーケットプレイス。</p>
                  </div>
                </Link>
              </ScrollReveal>
            )}
          </div>
        </div>
      </section>

      {/* ===== FEATURES ===== */}
      <section className="py-16 md:py-24 border-y border-[var(--color-border)]">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
          <ScrollReveal>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-6">
              {[
                { icon: '💳', label: '多彩な決済', desc: 'カード・振込・JPYC' },
                { icon: '🚚', label: '国内送料¥1,000〜', desc: 'GUILD会員は無料' },
                { icon: '🌍', label: '海外発送OK', desc: 'EUR決済・国際配送' },
                { icon: '✨', label: 'カスタマイズ', desc: 'コーティング・名入れ' },
              ].map((item) => (
                <div key={item.label} className="text-center">
                  <span className="text-2xl block mb-3">{item.icon}</span>
                  <p className="text-sm font-semibold text-[var(--foreground)] mb-1">{item.label}</p>
                  <p className="text-[11px] text-[var(--color-muted)]">{item.desc}</p>
                </div>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ===== MASU SPECIALIST SITE BANNER ===== */}
      <section className="py-20 md:py-32">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
          <ScrollReveal>
            <div className="bg-[var(--foreground)] rounded-3xl p-8 md:p-14 lg:p-20 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-[300px] h-[300px] rounded-full bg-[var(--color-accent)] opacity-[0.06] blur-[80px]" />
              <div className="relative grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
                <div>
                  <p className="text-xs font-semibold tracking-widest uppercase text-[var(--color-accent)] mb-4">Masu Specialist</p>
                  <h2 className="text-2xl md:text-4xl font-bold text-white leading-tight mb-4">
                    通常枡・法人注文は<br />枡の専門サイトへ
                  </h2>
                  <p className="text-sm leading-relaxed text-white/35 mb-8">
                    全8サイズの国産ヒノキ枡、名入れ・焼印・レーザー刻印、企業ノベルティ。法人様は20個から。
                  </p>
                  <a
                    href="https://masu.fomus.jp"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-3 bg-white text-[var(--foreground)] px-7 py-3.5 rounded-full text-sm font-semibold tracking-wide hover:bg-[var(--color-accent)] hover:text-white transition-all"
                  >
                    masu.fomus.jp
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                  </a>
                </div>
                <div className="hidden md:flex justify-center">
                  <div className="text-center">
                    <p className="font-display text-8xl font-light text-white/10">枡</p>
                    <p className="text-sm text-white/20 mt-2 tracking-widest">MASU</p>
                  </div>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ===== GUILD MEMBERSHIP ===== */}
      {siteConfig.features.membershipProgram && (
        <section className="py-20 md:py-32 bg-gradient-to-b from-[var(--color-subtle)] to-[var(--background)]">
          <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
            <ScrollReveal>
              <div className="text-center mb-14">
                <p className="text-xs font-semibold tracking-widest uppercase text-[var(--color-member)] mb-2">Membership</p>
                <h2 className="text-3xl md:text-5xl font-bold text-[var(--foreground)] mb-4">
                  FOMUS {siteConfig.features.membershipName}
                </h2>
                <p className="text-sm text-[var(--color-muted)] max-w-md mx-auto">
                  メンバーになって、FOUMSの世界をもっと楽しもう。
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 max-w-3xl mx-auto mb-12">
                {[
                  { icon: '🏷️', label: 'メンバー限定価格', desc: '対象商品が特別価格に' },
                  { icon: '📦', label: '送料無料', desc: '国内配送がいつでも無料' },
                  { icon: '⭐', label: 'ポイント還元', desc: 'お買い物でポイントが貯まる' },
                ].map((item) => (
                  <div key={item.label} className="bg-white rounded-2xl p-6 text-center card-hover border border-[var(--color-border)]">
                    <span className="text-2xl block mb-3">{item.icon}</span>
                    <p className="text-sm font-semibold text-[var(--foreground)] mb-1">{item.label}</p>
                    <p className="text-[11px] text-[var(--color-muted)]">{item.desc}</p>
                  </div>
                ))}
              </div>

              {siteConfig.features.membershipUrl && (
                <div className="text-center">
                  <a
                    href={siteConfig.features.membershipUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary inline-flex items-center gap-2"
                    style={{ background: 'var(--color-member)' }}
                  >
                    {siteConfig.features.membershipName}について
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                  </a>
                </div>
              )}
            </ScrollReveal>
          </div>
        </section>
      )}

      {/* ===== FINAL CTA ===== */}
      <section className="py-24 md:py-36">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
          <ScrollReveal>
            <div className="text-center">
              <h2 className="text-4xl md:text-6xl font-black text-[var(--foreground)] mb-4">
                Ready<span className="text-[var(--color-accent)]">?</span>
              </h2>
              <p className="text-base text-[var(--color-muted)] mb-10 max-w-md mx-auto">
                FOUMSのプロダクトを手に取って、新しい体験を始めよう。
              </p>
              <div className="flex items-center justify-center gap-4 flex-wrap">
                <Link href="/shop" className="btn-accent inline-flex items-center gap-3">
                  ショップへ
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                </Link>
                <Link href="/contact" className="btn-outline inline-block">
                  お問い合わせ
                </Link>
              </div>
              {!isLoggedIn && (
                <p className="mt-8 text-xs text-[var(--color-muted)]">
                  <Link href="/auth/register" className="text-[var(--color-accent)] font-medium hover:underline">
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
