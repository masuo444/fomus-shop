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
  let shopCoverImage: string | null = null
  let digitalCoverImage: string | null = null
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
    // Get cover images for categories
    const physicalWithImg = (data || []).find(p => p.images && p.images.length > 0)
    if (physicalWithImg) shopCoverImage = physicalWithImg.images[0]

    const { data: digitalData } = await supabase
      .from('products')
      .select('images')
      .in('shop_id', shopIds)
      .eq('is_published', true)
      .eq('item_type', 'digital')
      .order('created_at', { ascending: false })
      .limit(1)
    if (digitalData?.[0]?.images?.[0]) digitalCoverImage = digitalData[0].images[0]
  }

  return (
    <div>
      {/* ===== HERO ===== */}
      <section className="relative overflow-hidden">
        <div className="max-w-5xl mx-auto px-6 sm:px-8 lg:px-10 pt-20 pb-28 md:pt-32 md:pb-40 lg:pt-40 lg:pb-52">
          <div className="flex flex-col items-center text-center">
            <img
              src="/fomus-logo.png"
              alt="FOMUS"
              className="w-28 sm:w-36 md:w-44 mb-12 animate-float"
            />

            <h1 className="sr-only">FOMUS Official Online Shop</h1>

            {/* Thin horizontal rule */}
            <div className="w-8 h-px bg-[var(--color-border)] mb-10" />

            <p className="text-[13px] md:text-sm leading-[2.2] tracking-[0.08em] text-[var(--color-muted)] max-w-sm mb-14">
              枡・カードゲーム・七宝焼・デジタルアイテム。
              <br />
              FOUMSの公式オンラインショップ。
            </p>

            <div className="flex items-center gap-6 flex-wrap justify-center">
              <Link
                href="/shop"
                className="btn-primary inline-flex items-center gap-3"
              >
                SHOP
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
              </Link>
              <Link
                href="/digital"
                className="text-[11px] tracking-[0.15em] uppercase text-[var(--color-muted)] hover:text-[var(--foreground)] transition-colors"
              >
                Digital Items
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ===== PRODUCTS ===== */}
      {newProducts.length > 0 && (
        <section className="py-20 md:py-32">
          <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
            <ScrollReveal>
              <div className="flex items-end justify-between mb-14">
                <div>
                  <p className="text-[10px] tracking-[0.25em] uppercase text-[var(--color-muted)] mb-3">Products</p>
                  <h2 className="text-2xl md:text-3xl font-light tracking-tight text-[var(--foreground)]">商品一覧</h2>
                </div>
                <Link
                  href="/shop"
                  className="hidden md:inline-flex items-center gap-2 text-[11px] tracking-[0.12em] uppercase text-[var(--color-muted)] hover:text-[var(--foreground)] transition-colors group"
                >
                  View All
                  <svg className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
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

            <div className="mt-12 text-center md:hidden">
              <Link href="/shop" className="btn-outline inline-block">すべての商品を見る</Link>
            </div>
          </div>
        </section>
      )}

      {/* ===== THIN DIVIDER ===== */}
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
        <div className="h-px bg-[var(--color-border)]" />
      </div>

      {/* ===== CATEGORIES ===== */}
      <section className="py-20 md:py-32">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
          <ScrollReveal>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-[var(--color-border)]">
              <Link href="/shop" className="group bg-[var(--background)] transition-colors hover:bg-[var(--color-subtle)]">
                {shopCoverImage && (
                  <div className="aspect-[4/3] overflow-hidden">
                    <img src={shopCoverImage} alt="Shop" className="w-full h-full object-cover img-hover" />
                  </div>
                )}
                <div className="p-10 md:p-14">
                  <p className="text-[10px] tracking-[0.25em] uppercase text-[var(--color-muted)] mb-6">01</p>
                  <h3 className="font-display text-3xl md:text-4xl font-light text-[var(--foreground)] mb-4 italic">Shop</h3>
                  <p className="text-xs leading-[2] text-[var(--color-muted)]">
                    FOMUS枡・SILVA・バッジ・コラボ枡。
                    <br />防水コーティング対応。
                  </p>
                  <div className="mt-8 flex items-center gap-2 text-[10px] tracking-[0.15em] uppercase text-[var(--color-muted)] group-hover:text-[var(--foreground)] transition-colors">
                    <span>View</span>
                    <svg className="w-3 h-3 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                  </div>
                </div>
              </Link>

              <Link href="/digital" className="group bg-[var(--background)] transition-colors hover:bg-[var(--color-subtle)]">
                {digitalCoverImage && (
                  <div className="aspect-[4/3] overflow-hidden">
                    <img src={digitalCoverImage} alt="Digital" className="w-full h-full object-cover img-hover" />
                  </div>
                )}
                <div className="p-10 md:p-14">
                  <p className="text-[10px] tracking-[0.25em] uppercase text-[var(--color-muted)] mb-6">02</p>
                  <h3 className="font-display text-3xl md:text-4xl font-light text-[var(--foreground)] mb-4 italic">Digital</h3>
                  <p className="text-xs leading-[2] text-[var(--color-muted)]">
                    活動記・限定デジタルアイテム・
                    <br />チケット。
                  </p>
                  <div className="mt-8 flex items-center gap-2 text-[10px] tracking-[0.15em] uppercase text-[var(--color-muted)] group-hover:text-[var(--foreground)] transition-colors">
                    <span>View</span>
                    <svg className="w-3 h-3 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                  </div>
                </div>
              </Link>

              {siteConfig.features.marketplace && (
                <Link href="/market" className="group bg-[var(--background)] transition-colors hover:bg-[var(--color-subtle)]">
                  <div className="aspect-[4/3] overflow-hidden bg-[var(--color-subtle)]">
                    <img src="/fomus-guild.png" alt={mpName} className="w-full h-full object-cover img-hover" />
                  </div>
                  <div className="p-10 md:p-14">
                  <p className="text-[10px] tracking-[0.25em] uppercase text-[var(--color-muted)] mb-6">03</p>
                  <h3 className="font-display text-3xl md:text-4xl font-light text-[var(--foreground)] mb-4 italic">{mpName}</h3>
                  <p className="text-xs leading-[2] text-[var(--color-muted)]">
                    メンバーが出品する
                    <br />マーケットプレイス。
                  </p>
                  <div className="mt-8 flex items-center gap-2 text-[10px] tracking-[0.15em] uppercase text-[var(--color-muted)] group-hover:text-[var(--foreground)] transition-colors">
                    <span>View</span>
                    <svg className="w-3 h-3 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                  </div>
                  </div>
                </Link>
              )}
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ===== FEATURES — minimal line ===== */}
      <section className="py-14 md:py-20">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
          <ScrollReveal>
            <div className="border-t border-b border-[var(--color-border)] py-10 md:py-12">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-10 md:gap-6">
                {[
                  { label: '多彩な決済', desc: 'Visa / Mastercard / 振込 / JPYC', href: '/jpyc' },
                  { label: '国内送料', desc: '¥1,000〜（GUILD会員無料）' },
                  { label: '海外発送', desc: 'EUR決済・国際配送対応' },
                  { label: 'カスタマイズ', desc: '防水コーティング・名入れ' },
                ].map((item) => {
                  const inner = (
                    <>
                      <p className="text-xs font-medium text-[var(--foreground)] mb-1.5">{item.label}</p>
                      <p className="text-[11px] leading-relaxed text-[var(--color-muted)]">{item.desc}</p>
                    </>
                  )
                  return item.href ? (
                    <Link key={item.label} href={item.href} className="group hover:opacity-70 transition-opacity">
                      {inner}
                    </Link>
                  ) : (
                    <div key={item.label}>{inner}</div>
                  )
                })}
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ===== MASU SPECIALIST ===== */}
      <section className="py-20 md:py-32">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
          <ScrollReveal>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20 items-center">
              <div>
                <p className="text-[10px] tracking-[0.25em] uppercase text-[var(--color-muted)] mb-4">Masu Specialist</p>
                <h2 className="text-2xl md:text-3xl lg:text-4xl font-light text-[var(--foreground)] leading-snug mb-6">
                  通常枡・法人注文は
                  <br />枡の専門サイトへ
                </h2>
                <p className="text-xs leading-[2.2] text-[var(--color-muted)] mb-10 max-w-sm">
                  全8サイズの国産ヒノキ枡、名入れ・焼印・レーザー刻印、
                  企業ノベルティ。法人様は20個から承ります。
                </p>
                <a
                  href="https://masu.fomus.jp"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-outline inline-flex items-center gap-3"
                >
                  masu.fomus.jp
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                </a>
              </div>
              <div className="flex justify-center md:justify-end">
                <p className="font-display text-[10rem] md:text-[14rem] leading-none font-light text-[var(--color-border)] select-none">枡</p>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ===== GUILD MEMBERSHIP ===== */}
      {siteConfig.features.membershipProgram && (
        <section className="py-20 md:py-32 bg-[var(--color-subtle)]">
          <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
            <ScrollReveal>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
                <div className="relative overflow-hidden aspect-[4/5] max-w-md mx-auto lg:mx-0">
                  <img
                    src="/fomus-guild.png"
                    alt="FOMUS枡"
                    className="w-full h-full object-cover"
                  />
                </div>

                <div>
                  <p className="text-[10px] tracking-[0.25em] uppercase text-[var(--color-member)] mb-4">Membership</p>
                  <h2 className="text-2xl md:text-3xl lg:text-4xl font-light text-[var(--foreground)] leading-snug mb-6">
                    FOMUS {siteConfig.features.membershipName}
                  </h2>
                  <p className="text-xs leading-[2.2] text-[var(--color-muted)] mb-12 max-w-sm">
                    メンバーになって、FOUMSの世界をもっと楽しもう。
                  </p>

                  <div className="space-y-6 mb-12">
                    {[
                      { label: 'メンバー限定価格', desc: '対象商品が特別価格に' },
                      { label: '送料無料', desc: '国内配送がいつでも無料' },
                      { label: 'ポイント還元', desc: 'お買い物でポイントが貯まる' },
                    ].map((item) => (
                      <div key={item.label} className="flex items-start gap-4">
                        <div className="w-px h-8 bg-[var(--color-member)] mt-0.5 shrink-0" />
                        <div>
                          <p className="text-xs font-medium text-[var(--foreground)] mb-0.5">{item.label}</p>
                          <p className="text-[11px] text-[var(--color-muted)]">{item.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {siteConfig.features.membershipUrl && (
                    <a
                      href={siteConfig.features.membershipUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-primary inline-flex items-center gap-2"
                      style={{ background: 'var(--color-member)' }}
                    >
                      {siteConfig.features.membershipName}について
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                    </a>
                  )}
                </div>
              </div>
            </ScrollReveal>
          </div>
        </section>
      )}

      {/* ===== CTA ===== */}
      <section className="py-28 md:py-40">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
          <ScrollReveal>
            <div className="text-center">
              <div className="w-8 h-px bg-[var(--color-border)] mx-auto mb-10" />
              <p className="text-[11px] tracking-[0.2em] uppercase text-[var(--color-muted)] mb-12">
                FOUMSのプロダクトを手に取って、新しい体験を。
              </p>
              <div className="flex items-center justify-center gap-6 flex-wrap">
                <Link href="/shop" className="btn-primary inline-flex items-center gap-3">
                  SHOP
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                </Link>
                <Link href="/contact" className="btn-outline inline-block">
                  CONTACT
                </Link>
              </div>
              {!isLoggedIn && (
                <p className="mt-10 text-[11px] text-[var(--color-muted)]">
                  <Link href="/auth/register" className="underline underline-offset-4 hover:text-[var(--foreground)] transition-colors">
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
