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
  description: 'The official FOMUS online shop. Handcrafted masu — traditional Japanese cypress (hinoki) boxes — plus the card game SILVA and exclusive digital items. Worldwide shipping, credit card and JPYC payments accepted.',
  keywords: ['FOMUS', 'masu', 'hinoki', 'Japanese cypress', 'sake cup', 'SILVA', 'Japanese craft', 'made in Japan', 'digital items'],
  alternates: {
    canonical: '/en',
    languages: {
      ja: '/',
      en: '/en',
    },
  },
  openGraph: {
    type: 'website',
    siteName: siteConfig.name,
    title: `${siteConfig.name} — Official Online Shop`,
    description: 'Handcrafted masu — traditional Japanese cypress (hinoki) boxes — shipped worldwide from Japan.',
    locale: 'en_US',
    url: 'https://shop.fomus.jp/en',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630 }],
  },
}

export default async function EnglishHomePage() {
  const supabase = await createClient()
  const currency = await getCurrency()
  const shopIds = await getPublishedShopIds()
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

  // Fetch limited-sale product (枡バッジ)
  let limitedProduct: Product | null = null
  if (shopIds.length > 0) {
    const now = new Date().toISOString()
    const { data } = await supabase
      .from('products')
      .select('*')
      .in('shop_id', shopIds)
      .eq('is_published', true)
      .not('sale_end_date', 'is', null)
      .gte('sale_end_date', now)
      .order('sale_end_date', { ascending: true })
      .limit(1)
    if (data?.[0]) limitedProduct = data[0] as Product
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
      .limit(4)
    newProducts = data || []
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
      <FAQPageJsonLd items={[
        { question: 'What products does FOMUS sell?', answer: 'We sell masu — traditional Japanese cypress (hinoki) boxes — in one-go and mini sizes, including name-engraved masu, as well as the card game SILVA, FOMUS running wear, and digital items.' },
        { question: 'Do you ship internationally?', answer: 'Yes, international shipping is available. Shipping within Japan is a flat ¥1,000 (tax included), and orders paid in EUR ship worldwide.' },
        { question: 'What payment methods do you accept?', answer: 'We accept credit cards (Visa, Mastercard, American Express, JCB) and JPYC, a Japanese yen stablecoin.' },
        { question: 'Can I order a custom or name-engraved masu?', answer: 'Yes, we accept name engraving and original custom masu orders for both individuals and businesses.' },
        { question: 'What is JPYC payment?', answer: 'JPYC is a Japanese yen stablecoin pegged at 1 JPYC = 1 yen, settled on the Polygon network.' },
      ]} />
      {newProducts.length > 0 && (
        <ItemListJsonLd
          name="FOMUS Featured Products"
          items={newProducts.map((p, i) => ({
            name: p.name,
            url: `${process.env.NEXT_PUBLIC_BASE_URL || ''}/en/shop/${p.slug || p.id}`,
            image: p.images?.[0],
            position: i + 1,
          }))}
        />
      )}

      {/* ===== 1. HERO ===== */}
      <section className="min-h-[70vh] md:min-h-[80vh]">
        <div className="flex flex-col md:flex-row min-h-[70vh] md:min-h-[80vh]">
          <div className="md:w-1/3 flex flex-col items-center justify-center px-8 py-16 md:py-0 bg-[var(--background)]">
            <div className="flex flex-col items-center text-center max-w-xs">
              <img src="/fomus-logo.png" alt="FOMUS" className="w-28 sm:w-32 md:w-36 mb-10" />
              <h1 className="sr-only">FOMUS Official Online Shop</h1>
              <div className="w-8 h-px bg-[var(--color-border)] mb-8" />
              <p className="text-base md:text-lg leading-relaxed tracking-wide text-[var(--foreground)] mb-3">
                Extraordinary things, made in Japan.
              </p>
              <p className="text-sm leading-relaxed text-[var(--color-muted)] mb-10">
                Meet the masu — a traditional Japanese cypress (hinoki) box, handcrafted by artisans.<br />
                Products you won&apos;t find anywhere else, shipped from Japan.
              </p>
              <div className="flex flex-col items-center gap-4">
                <Link href="/en/shop" className="btn-primary inline-flex items-center gap-3">
                  SHOP
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                </Link>
                {siteConfig.features.digitalItems && (
                  <Link href="/digital" className="text-[11px] tracking-[0.15em] uppercase text-[var(--color-muted)] hover:text-[var(--foreground)] transition-colors">
                    Digital Items
                  </Link>
                )}
              </div>
            </div>
          </div>
          <div className="md:w-2/3 relative min-h-[40vh] md:min-h-0">
            <img src="/hero.jpg" alt="A toast with masu boxes" className="w-full h-full object-cover absolute inset-0" />
          </div>
        </div>
      </section>

      {/* ===== LIMITED SALE BANNER ===== */}
      {limitedProduct && (
        <section className="bg-[var(--foreground)] text-[var(--background)]">
          <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
            <ScrollReveal>
              <Link href={`/en/shop/${limitedProduct.id}`} className="block group">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 items-center py-16 md:py-24">
                  {/* Image */}
                  {limitedProduct.images?.[0] && (
                    <div className="aspect-square max-w-sm mx-auto md:mx-0 overflow-hidden">
                      <img
                        src={limitedProduct.images[0]}
                        alt={limitedProduct.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                    </div>
                  )}
                  {/* Text */}
                  <div>
                    <div className="flex items-center gap-3 mb-6">
                      <span className="text-[10px] tracking-[0.2em] uppercase text-orange-400 border border-orange-400/40 px-3 py-1">Limited</span>
                      {limitedProduct.made_to_order && (
                        <span className="text-[10px] tracking-[0.2em] uppercase text-[var(--background)]/60 border border-[var(--background)]/20 px-3 py-1">Made to Order</span>
                      )}
                    </div>
                    <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-light tracking-tight leading-none mb-3 italic">
                      {limitedProduct.name}
                    </h2>
                    <p className="text-[11px] tracking-[0.1em] text-[var(--background)]/40 mb-8">
                      Made to order — limited quantities
                    </p>

                    {limitedProduct.sale_end_date && (
                      <div className="flex items-center gap-2 mb-8">
                        <div className="w-1 h-1 rounded-full bg-orange-400" />
                        <p className="text-xs tracking-wide text-orange-400">
                          Until {new Date(limitedProduct.sale_end_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
                        </p>
                      </div>
                    )}

                    <div className="flex items-baseline gap-3 mb-2">
                      <span className="text-3xl md:text-4xl font-light tracking-wide">
                        {currency === 'eur' && limitedProduct.price_eur != null
                          ? `€${(limitedProduct.price_eur / 100).toFixed(2)}`
                          : `¥${limitedProduct.price.toLocaleString()}`}
                      </span>
                      <span className="text-[10px] tracking-wider text-[var(--background)]/30 uppercase">tax incl.</span>
                    </div>
                    {limitedProduct.member_price != null && limitedProduct.member_price < limitedProduct.price && (
                      <p className="text-xs tracking-wide mb-8" style={{ color: 'var(--color-member)' }}>
                        {siteConfig.features.membershipName} ¥{limitedProduct.member_price.toLocaleString()}
                      </p>
                    )}

                    {limitedProduct.made_to_order && limitedProduct.production_time && (
                      <p className="text-[11px] text-[var(--background)]/30 mb-10">{limitedProduct.production_time}</p>
                    )}

                    <span className="inline-flex items-center gap-4 text-[10px] tracking-[0.2em] uppercase text-[var(--background)]/50 group-hover:text-[var(--background)] transition-colors border-b border-[var(--background)]/20 group-hover:border-[var(--background)]/50 pb-2">
                      View Details
                      <svg className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                    </span>
                  </div>
                </div>
              </Link>
            </ScrollReveal>
          </div>
        </section>
      )}

      {/* ===== 2. PRODUCTS (immediately after hero) ===== */}
      {newProducts.length > 0 && (
        <section className="py-20 md:py-32">
          <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
            <ScrollReveal>
              <div className="flex items-end justify-between mb-14">
                <div>
                  <p className="text-[10px] tracking-[0.25em] uppercase text-[var(--color-muted)] mb-3">Pick Up</p>
                  <h2 className="text-2xl md:text-3xl font-light tracking-tight text-[var(--foreground)]">Featured</h2>
                </div>
                <Link href="/en/shop" className="hidden md:inline-flex items-center gap-2 text-[11px] tracking-[0.12em] uppercase text-[var(--color-muted)] hover:text-[var(--foreground)] transition-colors group">
                  View All
                  <svg className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                </Link>
              </div>
            </ScrollReveal>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
              {newProducts.map((product, i) => (
                <ScrollReveal key={product.id} delay={i * 80}>
                  <ProductCard product={product} isLoggedIn={isLoggedIn} isPremiumMember={isPremiumMember} currency={currency} />
                </ScrollReveal>
              ))}
            </div>
            <div className="mt-12 text-center md:hidden">
              <Link href="/en/shop" className="btn-outline inline-block">View All Products</Link>
            </div>
          </div>
        </section>
      )}

      {/* ===== 3. CUSTOMER REVIEWS (social proof before CTA) ===== */}
      <section className="py-16 md:py-24 bg-[var(--color-subtle)]">
        <div className="max-w-5xl mx-auto px-6 sm:px-8 lg:px-10">
          <ScrollReveal>
            <p className="text-[10px] tracking-[0.25em] uppercase text-[var(--color-muted)] mb-3 text-center">Reviews</p>
            <h2 className="text-2xl md:text-3xl font-light tracking-tight text-[var(--foreground)] text-center mb-12">What Our Customers Say</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { name: 'KM', rating: 5, title: 'The coated masu is outstanding', body: 'I ordered mine with the waterproof coating. The hinoki aroma is fully intact, and not a drop leaks even when filled. I pour sake into it every evening. It is beautiful to look at too, and guests always ask about it.' },
                { name: 'TY', rating: 5, title: 'A gift that was truly loved', body: 'I ordered a name-engraved masu as a gift for a friend overseas. With the coated finish it is practical as well as beautiful, and they were delighted. The careful packaging made it easy to give with confidence.' },
                { name: 'SA', rating: 5, title: 'Soothed by the scent of hinoki', body: 'I bought the one-go masu with the coating. The warmth of the wood and the hinoki fragrance are wonderful. The quality holds up to everyday use, and it has turned my evening drink into something special. I will definitely order again.' },
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
                  <p className="text-xs leading-relaxed text-[var(--color-muted)] mb-4">{review.body}</p>
                  <span className="text-[10px] text-[var(--color-muted)]">{review.name}</span>
                </div>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ===== 4. CTA (primary conversion point) ===== */}
      <section className="py-28 md:py-40">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
          <ScrollReveal>
            <div className="text-center">
              <div className="w-8 h-px bg-[var(--color-border)] mx-auto mb-10" />
              <p className="text-base md:text-lg tracking-wide text-[var(--foreground)] mb-4">
                Start with just one.
              </p>
              <p className="text-[11px] tracking-[0.15em] text-[var(--color-muted)] mb-12">
                From ¥2,200 / International shipping available / Visa &amp; Mastercard accepted
              </p>
              <div className="flex items-center justify-center gap-6 flex-wrap">
                <Link href="/en/shop" className="btn-primary inline-flex items-center gap-3">
                  SHOP
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                </Link>
                <Link href="/en/contact" className="btn-outline inline-block">
                  CONTACT
                </Link>
              </div>
              {!isLoggedIn && (
                <p className="mt-10 text-[11px] text-[var(--color-muted)]">
                  <Link href="/auth/register" className="underline underline-offset-4 hover:text-[var(--foreground)] transition-colors">
                    Create an account
                  </Link>
                  {' '}to earn points and save your favorites
                </p>
              )}
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ===== DIVIDER ===== */}
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
        <div className="h-px bg-[var(--color-border)]" />
      </div>

      {/* ===== CATEGORIES ===== */}
      <section className="py-20 md:py-32">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
          <ScrollReveal>
            <div className={`grid grid-cols-1 ${siteConfig.features.digitalItems ? 'md:grid-cols-3' : 'md:grid-cols-2'} gap-px bg-[var(--color-border)]`}>
              <Link href="/en/shop" className="group bg-[var(--background)] transition-colors hover:bg-[var(--color-subtle)]">
                {shopCoverImage && (
                  <div className="aspect-[4/3] overflow-hidden">
                    <img src={shopCoverImage} alt="Shop" className="w-full h-full object-cover img-hover" />
                  </div>
                )}
                <div className="p-10 md:p-14">
                  <p className="text-[10px] tracking-[0.25em] uppercase text-[var(--color-muted)] mb-6">01</p>
                  <h3 className="font-display text-3xl md:text-4xl font-light text-[var(--foreground)] mb-4 italic">Shop</h3>
                  <p className="text-xs leading-[2] text-[var(--color-muted)]">
                    FOMUS masu, SILVA, and badges.
                    <br />Waterproof coating available.
                  </p>
                  <div className="mt-8 flex items-center gap-2 text-[10px] tracking-[0.15em] uppercase text-[var(--color-muted)] group-hover:text-[var(--foreground)] transition-colors">
                    <span>View</span>
                    <svg className="w-3 h-3 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                  </div>
                </div>
              </Link>

              {siteConfig.features.digitalItems && (
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
                      Journals, exclusive digital items,
                      <br />and tickets.
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

      {/* ===== MASU SPECIALIST ===== */}
      <section className="relative overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 min-h-[50vh]">
          {/* Photo side */}
          <div className="relative min-h-[40vh] md:min-h-[50vh]">
            <img src="/masu-sakura.jpg" alt="Japanese hinoki masu" className="w-full h-full object-cover absolute inset-0" />
          </div>
          {/* Text side */}
          <div className="bg-[var(--foreground)] flex items-center px-8 md:px-16 lg:px-24 py-16 md:py-0">
            <ScrollReveal>
              <div>
                <p className="text-[10px] tracking-[0.3em] uppercase text-white/40 mb-6">Masu Specialist</p>
                <h2 className="text-2xl md:text-3xl lg:text-4xl font-light text-white leading-snug mb-6">
                  For classic masu and
                  <br />corporate orders
                </h2>
                <p className="text-sm leading-[2] text-white/50 mb-10 max-w-sm">
                  All eight sizes of Japanese hinoki masu, with name engraving, branding, and laser etching. Corporate orders welcome from 20 pieces.
                </p>
                <a
                  href="https://masu.fomus.jp"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-3 border border-white/30 text-white text-sm tracking-[0.12em] uppercase px-8 py-4 hover:bg-white hover:text-[var(--foreground)] transition-all duration-300"
                >
                  masu.fomus.jp
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                </a>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ===== ABOUT ===== */}
      <section className="max-w-3xl mx-auto px-6 sm:px-8 lg:px-10 py-16 md:py-20">
        <h2 className="text-lg font-medium text-[var(--foreground)] mb-6">About FOMUS</h2>
        <p className="text-xs leading-[2.2] text-[var(--color-muted)] mb-8">
          FOMUS is a brand built around the masu — a traditional Japanese craft — weaving together art, storytelling, and technology to create new forms of cultural expression and value. We have reimagined the Japanese hinoki masu as a communication tool that connects culture with the world, sharing it through cultural activities in more than 15 countries. Beyond our masu products, we run a range of creative ventures including the card game SILVA, the jewelry brand FOMUS PARURE, and the story project KUKU.
        </p>
        <a href="https://www.fomus.jp/" target="_blank" rel="noopener noreferrer" className="btn-outline inline-flex items-center gap-3">
          FOMUS Official Website
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
        </a>
      </section>
      <div className="max-w-3xl mx-auto px-6 sm:px-8 lg:px-10"><div className="h-px bg-[var(--color-border)]" /></div>

      {/* ===== FEATURES ===== */}
      <section className="py-14 md:py-20">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
          <ScrollReveal>
            <div className="border-t border-b border-[var(--color-border)] py-10 md:py-12">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-10 md:gap-6">
                {[
                  { label: 'Flexible Payment', desc: 'Visa / Mastercard / Bank transfer / JPYC', href: '/jpyc' },
                  { label: 'Shipping in Japan', desc: 'From ¥1,000' },
                  { label: 'Worldwide Delivery', desc: 'EUR payment & international shipping' },
                  { label: 'Customization', desc: 'Waterproof coating & name engraving' },
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

      {/* ===== FAQ ===== */}
      <section className="max-w-3xl mx-auto px-6 sm:px-8 lg:px-10 py-16 md:py-20">
        <h2 className="text-lg font-medium text-[var(--foreground)] mb-8">Frequently Asked Questions</h2>
        <div className="space-y-6">
          {[
            { q: 'What products does FOMUS sell?', a: 'We sell masu — traditional Japanese cypress (hinoki) boxes — in one-go and mini sizes, including name-engraved masu, as well as the card game SILVA, FOMUS running wear, and digital items.' },
            { q: 'Do you ship internationally?', a: 'Yes, international shipping is available. Within Japan, shipping is a flat ¥1,000 (tax included) via Yamato Transport or Japan Post. Orders paid in EUR ship worldwide.' },
            { q: 'What payment methods do you accept?', a: 'We accept credit cards (Visa, Mastercard, American Express, JCB) and JPYC, a Japanese yen stablecoin.' },
            { q: 'Can I order a custom or name-engraved masu?', a: 'Yes, we accept name engraving and original custom masu orders for both individuals and businesses. Please reach out through our contact page.' },
            { q: 'What is JPYC payment?', a: 'JPYC (Japanese Yen Coin) is a Japanese yen stablecoin pegged at 1 JPYC = 1 yen. Payments are sent over the Polygon network and settled on the blockchain.' },
          ].map((item, i) => (
            <div key={i}>
              <h3 className="text-sm font-medium text-[var(--foreground)] mb-2">{item.q}</h3>
              <p className="text-xs leading-[2] text-[var(--color-muted)]">{item.a}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
