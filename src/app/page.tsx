import Link from 'next/link'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { getPublishedShopIds } from '@/lib/shop'
import { getCurrency } from '@/lib/currency'
import ProductCard from '@/components/product/ProductCard'
import ScrollReveal from '@/components/ui/ScrollReveal'
import siteConfig from '@/site.config'
import { FAQPageJsonLd, ItemListJsonLd } from '@/components/seo/JsonLd'
import type { Product } from '@/lib/types'

export const metadata: Metadata = {
  title: {
    absolute: `${siteConfig.name} — Official Online Shop`,
  },
  description: 'FOMUS公式ショップ。国産ヒノキの枡（FOMUS枡・首掛け枡・アラビア語枡）、SILVA、デジタルアイテムなど。Stripe・銀行振込・JPYC決済対応。',
  keywords: ['FOMUS', '枡', 'ます', 'masu', 'SILVA', 'ヒノキ枡', 'オリジナルグッズ', 'FOMUS GUILD', 'デジタルアイテム'],
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
      .order('sort_order', { ascending: true })
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

  // Fetch top reviews for homepage
  const { data: topReviews } = await supabase
    .from('product_reviews')
    .select('id, reviewer_name, rating, title, body, product_id, created_at')
    .eq('is_published', true)
    .gte('rating', 4)
    .order('created_at', { ascending: false })
    .limit(3)

  // Get product names for reviews
  let reviewProducts: Record<string, string> = {}
  if (topReviews && topReviews.length > 0) {
    const productIds = [...new Set(topReviews.map(r => r.product_id))]
    const { data: prods } = await supabase
      .from('products')
      .select('id, name')
      .in('id', productIds)
    if (prods) {
      reviewProducts = Object.fromEntries(prods.map(p => [p.id, p.name]))
    }
  }

  return (
    <div>
      <FAQPageJsonLd items={[
        { question: 'FOMUSではどんな商品が買えますか？', answer: '国産ヒノキの枡（一合枡・ミニ枡・名入れ枡）、カードゲーム「SILVA」、FOMUSランニングウェア、デジタルアイテムなどを販売しています。' },
        { question: '送料はいくらですか？', answer: '国内一律1,000円（税込）です。' },
        { question: 'どんな決済方法が使えますか？', answer: 'クレジットカード（Visa・Mastercard・Amex・JCB）、銀行振込、JPYC（日本円ステーブルコイン）に対応しています。' },
        { question: '枡の名入れやオーダーメイドはできますか？', answer: 'はい、法人向け・個人向けともに名入れ・オリジナルデザインの枡を承っています。' },
        { question: 'JPYC決済とは何ですか？', answer: 'JPYCは1JPYC=1円の日本円ステーブルコインで、Polygonネットワークで決済します。' },
      ]} />
      {newProducts.length > 0 && (
        <ItemListJsonLd
          name="FOMUS 新着商品"
          items={newProducts.map((p, i) => ({
            name: p.name,
            url: `${process.env.NEXT_PUBLIC_BASE_URL || ''}/shop/${p.id}`,
            image: p.images?.[0],
            position: i + 1,
          }))}
        />
      )}

      {/* ===== HERO ===== */}
      <section className="min-h-[70vh] md:min-h-[80vh]">
        <div className="flex flex-col md:flex-row min-h-[70vh] md:min-h-[80vh]">
          {/* Left 1/3 - Logo & Text */}
          <div className="md:w-1/3 flex flex-col items-center justify-center px-8 py-16 md:py-0 bg-[var(--background)]">
            <div className="flex flex-col items-center text-center max-w-xs">
              <img
                src="/fomus-logo.png"
                alt="FOMUS"
                className="w-28 sm:w-32 md:w-36 mb-10"
              />

              <h1 className="sr-only">FOMUS Official Online Shop</h1>

              <div className="w-8 h-px bg-[var(--color-border)] mb-8" />

              <p className="text-base md:text-lg leading-relaxed tracking-wide text-[var(--foreground)] mb-3">
                面白いモノを、世の中に。
              </p>
              <p className="text-sm leading-relaxed text-[var(--color-muted)] mb-10">
                国産ヒノキの枡をはじめ、ここでしか手に入らないプロダクトをお届けします。
              </p>

              <div className="flex flex-col items-center gap-4">
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

          {/* Right 2/3 - Photo */}
          <div className="md:w-2/3 relative min-h-[40vh] md:min-h-0">
            <img
              src="/hero.jpg"
              alt="枡で乾杯するシーン"
              className="w-full h-full object-cover absolute inset-0"
            />
          </div>
        </div>
      </section>

      {/* ===== ABOUT (AIO) ===== */}
      <section className="max-w-3xl mx-auto px-6 sm:px-8 lg:px-10 py-16 md:py-20">
        <h2 className="text-lg font-medium text-[var(--foreground)] mb-6">FOMUSについて</h2>
        <p className="text-xs leading-[2.2] text-[var(--color-muted)] mb-8">
          FOMUSは、日本の伝統工芸「枡」を起点に、アート・物語・テクノロジーを掛け合わせ、新たな文化の表現と価値創造に挑むブランドです。国産ヒノキの枡を「文化と世界をつなぐコミュニケーションツール」として再定義し、世界15ヶ国以上で文化発信活動を展開しています。枡のプロダクト販売に加え、カードゲーム「SILVA」、ジュエリーブランド「FOMUS PARURE」、物語プロジェクト「KUKU」など、多彩なクリエイティブ事業を手がけています。
        </p>
        <a
          href="https://www.fomus.jp/"
          target="_blank"
          rel="noopener noreferrer"
          className="btn-outline inline-flex items-center gap-3"
        >
          FOMUS公式サイト
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
        </a>
      </section>
      <div className="max-w-3xl mx-auto px-6 sm:px-8 lg:px-10"><div className="h-px bg-[var(--color-border)]" /></div>

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
                  { label: '国内送料', desc: '¥1,000〜' },
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
              <div className="aspect-[4/5] rounded-2xl overflow-hidden">
                <img
                  src="/masu-sakura.jpg"
                  alt="国産ヒノキ枡"
                  className="w-full h-full object-cover"
                />
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
                    メンバーになって、FOMUSの世界をもっと楽しもう。
                  </p>

                  <div className="space-y-6 mb-12">
                    {[
                      { label: 'メンバー限定価格', desc: '対象商品が特別価格に' },
                      { label: 'ポイント還元', desc: 'お買い物でポイントが貯まる' },
                      { label: '限定アイテム', desc: 'メンバー限定商品の購入' },
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

      {/* ===== FAQ (AIO) ===== */}
      <section className="max-w-3xl mx-auto px-6 sm:px-8 lg:px-10 py-16 md:py-20">
        <h2 className="text-lg font-medium text-[var(--foreground)] mb-8">よくあるご質問</h2>
        <div className="space-y-6">
          {[
            { q: 'FOMUSではどんな商品が買えますか？', a: '国産ヒノキの枡（一合枡・ミニ枡・名入れ枡）、カードゲーム「SILVA」、FOMUSランニングウェア、デジタルアイテムなどを販売しています。' },
            { q: '送料はいくらですか？', a: '国内一律1,000円（税込）です。商品はヤマト運輸または日本郵便でお届けします。' },
            { q: 'どんな決済方法が使えますか？', a: 'クレジットカード（Visa・Mastercard・Amex・JCB）、銀行振込、JPYC（日本円ステーブルコイン）に対応しています。' },
            { q: '枡の名入れやオーダーメイドはできますか？', a: 'はい、法人向け・個人向けともに名入れ・オリジナルデザインの枡を承っています。お問い合わせページからご相談ください。' },
            { q: 'JPYC決済とは何ですか？', a: 'JPYC（Japanese Yen Coin）は1JPYC=1円の日本円ステーブルコインです。Polygonネットワークで送金し、ブロックチェーン上で決済が完了します。' },
          ].map((item, i) => (
            <div key={i}>
              <h3 className="text-sm font-medium text-[var(--foreground)] mb-2">{item.q}</h3>
              <p className="text-xs leading-[2] text-[var(--color-muted)]">{item.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ===== CUSTOMER REVIEWS ===== */}
      <section className="py-16 md:py-24 bg-[var(--color-subtle)]">
        <div className="max-w-5xl mx-auto px-6 sm:px-8 lg:px-10">
          <ScrollReveal>
            <p className="text-[10px] tracking-[0.25em] uppercase text-[var(--color-muted)] mb-3 text-center">Reviews</p>
            <h2 className="text-2xl md:text-3xl font-light tracking-tight text-[var(--foreground)] text-center mb-12">お客様の声</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { name: 'KM', rating: 5, title: 'コーティング枡が最高', body: '防水コーティングをお願いしました。ヒノキの香りはそのままに、水を入れても全く漏れません。日本酒を注いで毎晩楽しんでいます。見た目も美しく、来客時にも話題になります。' },
                { name: 'TY', rating: 5, title: '贈り物に喜ばれました', body: '海外の友人への贈り物として名入れ枡を注文。コーティング仕上げにしたので実用的で、とても喜んでもらえました。梱包も丁寧で安心して贈れます。' },
                { name: 'SA', rating: 5, title: 'ヒノキの香りに癒される', body: '一合枡をコーティング付きで購入。木の温もりとヒノキの香りが素晴らしいです。普段使いできる品質で、毎日のお酒の時間が特別になりました。リピート確定です。' },
              ].map((review, i) => (
                <div key={i} className="bg-white rounded-xl p-6">
                  <div className="flex items-center gap-0.5 mb-3">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <svg key={star} className={`w-4 h-4 ${star <= review.rating ? 'text-yellow-400' : 'text-gray-200'}`} fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <p className="text-sm font-medium text-[var(--foreground)] mb-2">{review.title}</p>
                  <p className="text-xs leading-relaxed text-[var(--color-muted)] mb-4">
                    {review.body}
                  </p>
                  <span className="text-[10px] text-[var(--color-muted)]">{review.name}</span>
                </div>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="py-28 md:py-40">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
          <ScrollReveal>
            <div className="text-center">
              <div className="w-8 h-px bg-[var(--color-border)] mx-auto mb-10" />
              <p className="text-[11px] tracking-[0.2em] uppercase text-[var(--color-muted)] mb-12">
                FOMUSのプロダクトを手に取って、新しい体験を。
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
