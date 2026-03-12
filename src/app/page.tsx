import Link from 'next/link'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { getPublishedShopIds } from '@/lib/shop'
import { getCurrency } from '@/lib/currency'
import ProductCard from '@/components/product/ProductCard'
import siteConfig from '@/site.config'
import type { Product } from '@/lib/types'

export const metadata: Metadata = {
  title: {
    absolute: `${siteConfig.name} — Official Online Shop`,
  },
  description: `${siteConfig.name}の公式オンラインショップ。枡・デジタルアイテム・限定プロダクトの購入。JPYC暗号資産決済対応。`,
}

export default async function HomePage() {
  const supabase = await createClient()
  const currency = await getCurrency()
  const shopIds = await getPublishedShopIds()
  const mpName = siteConfig.features.marketplaceName

  // Check user status
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

  // Fetch latest products
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
      {/* Hero — compact, shop-focused */}
      <section className="bg-[var(--foreground)] py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8">
            <div>
              <p className="text-[10px] tracking-[0.4em] uppercase text-white/25 mb-6">
                Official Online Shop
              </p>
              <h1 className="font-display text-3xl sm:text-5xl md:text-7xl font-light tracking-wide text-white leading-[0.9]">
                FOMUS
              </h1>
              <p className="mt-6 text-sm leading-[2] text-white/35 max-w-md">
                枡・デジタルアイテム・限定プロダクト。
                <br />
                Stripe / JPYC決済対応。
              </p>
            </div>
            <div className="flex items-center gap-5 flex-wrap">
              <Link
                href="/shop"
                className="btn-primary inline-block"
                style={{ background: '#FAF8F5', color: '#1A1A1A' }}
              >
                商品一覧
              </Link>
              <a
                href="https://www.fomus.jp"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] tracking-[0.1em] uppercase text-white/30 hover:text-white/60 transition-colors"
              >
                FOMUS 公式サイト →
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* New Arrivals — the most important section */}
      {newProducts.length > 0 && (
        <section className="py-16 md:py-24">
          <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
            <div className="flex items-end justify-between mb-10">
              <div>
                <p className="text-[10px] tracking-[0.4em] uppercase text-[var(--color-muted)] mb-3">
                  New Arrivals
                </p>
                <h2 className="font-display text-2xl md:text-3xl font-light text-[var(--foreground)]">
                  新着商品
                </h2>
              </div>
              <Link
                href="/shop"
                className="text-[10px] tracking-[0.15em] uppercase text-[var(--color-muted)] hover:text-[var(--foreground)] transition-colors hidden md:inline-flex items-center gap-2"
              >
                すべて見る
                <span className="w-5 h-px bg-current" />
              </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
              {newProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  isLoggedIn={isLoggedIn}
                  isPremiumMember={isPremiumMember}
                  currency={currency}
                />
              ))}
            </div>

            <div className="mt-8 text-center md:hidden">
              <Link href="/shop" className="btn-outline inline-block">
                すべての商品を見る
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Category Navigation — 3 Pillars */}
      <section className="py-0 pb-16 md:pb-24">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-[var(--color-border)]">
            <Link href="/shop" className="group bg-[var(--background)] p-5 sm:p-8 md:p-12 hover:bg-[var(--color-subtle)] transition-colors duration-500">
              <p className="text-[10px] tracking-[0.3em] uppercase text-[var(--color-muted)] mb-4">01</p>
              <h3 className="font-display text-2xl md:text-3xl font-light text-[var(--foreground)] mb-4">Shop</h3>
              <p className="text-xs leading-[2] text-[var(--color-muted)]">
                枡をはじめとするFOMUSプロダクト。ギフト・名入れにも対応。
              </p>
              <div className="mt-6">
                <span className="inline-flex items-center gap-2 text-[10px] tracking-[0.15em] uppercase text-[var(--foreground)] group-hover:gap-4 transition-all duration-500">
                  View Products
                  <span className="w-5 h-px bg-[var(--foreground)]" />
                </span>
              </div>
            </Link>
            <Link href="/digital" className="group bg-[var(--background)] p-5 sm:p-8 md:p-12 hover:bg-[var(--color-subtle)] transition-colors duration-500">
              <p className="text-[10px] tracking-[0.3em] uppercase text-[var(--color-muted)] mb-4">02</p>
              <h3 className="font-display text-2xl md:text-3xl font-light text-[var(--foreground)] mb-4">Digital</h3>
              <p className="text-xs leading-[2] text-[var(--color-muted)]">
                限定デジタルアイテム・チケット。所有する体験を、デジタルの世界で。
              </p>
              <div className="mt-6">
                <span className="inline-flex items-center gap-2 text-[10px] tracking-[0.15em] uppercase text-[var(--foreground)] group-hover:gap-4 transition-all duration-500">
                  Explore Digital
                  <span className="w-5 h-px bg-[var(--foreground)]" />
                </span>
              </div>
            </Link>
            {siteConfig.features.marketplace && (
              <Link href="/market" className="group bg-[var(--background)] p-5 sm:p-8 md:p-12 hover:bg-[var(--color-subtle)] transition-colors duration-500">
                <p className="text-[10px] tracking-[0.3em] uppercase text-[var(--color-muted)] mb-4">03</p>
                <h3 className="font-display text-2xl md:text-3xl font-light text-[var(--foreground)] mb-4">{mpName}</h3>
                <p className="text-xs leading-[2] text-[var(--color-muted)]">
                  メンバーが出品するマーケットプレイスとクラウドファンディング。
                </p>
                <div className="mt-6">
                  <span className="inline-flex items-center gap-2 text-[10px] tracking-[0.15em] uppercase text-[var(--foreground)] group-hover:gap-4 transition-all duration-500">
                    Enter {mpName}
                    <span className="w-5 h-px bg-[var(--foreground)]" />
                  </span>
                </div>
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* FOMUS Original Masu + Masu Site Banner */}
      <section className="py-16 md:py-24 bg-[var(--color-subtle)]">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
            {/* FOMUS Original */}
            <div className="bg-[var(--background)] p-8 md:p-12 border border-[var(--color-border)]">
              <p className="text-[10px] tracking-[0.4em] uppercase text-[var(--color-muted)] mb-4">
                FOMUS Original
              </p>
              <h3 className="font-display text-xl md:text-2xl font-light text-[var(--foreground)] mb-4">
                FOMUS オリジナル枡
              </h3>
              <p className="text-xs leading-[2] text-[var(--color-muted)] mb-6">
                首飾り枡・枡バッジ・アート枡など、FOMUSだけのオリジナルプロダクト。1個からお求めいただけます。
              </p>
              <Link href="/shop" className="btn-primary inline-block text-xs">
                商品を見る
              </Link>
            </div>

            {/* Masu Specialist Site */}
            <div className="bg-[var(--foreground)] p-8 md:p-12">
              <p className="text-[10px] tracking-[0.4em] uppercase text-white/25 mb-4">
                枡の専門サイト
              </p>
              <h3 className="font-display text-xl md:text-2xl font-light text-white mb-4">
                通常枡・法人注文・名入れ
              </h3>
              <p className="text-xs leading-[2] text-white/35 mb-6">
                国産ヒノキ枡の全サイズ・名入れ・焼印・企業ノベルティ。法人のお客様は20個から。
              </p>
              <a
                href="https://masu-store.jp"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary inline-block text-xs"
                style={{ background: '#FAF8F5', color: '#1A1A1A' }}
              >
                枡の専門サイトへ
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* GUILD Membership — compact */}
      {siteConfig.features.membershipProgram && (
        <section className="py-16 md:py-24">
          <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
            <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center gap-10 md:gap-16">
              <div className="md:w-3/5">
                <p className="text-[10px] tracking-[0.4em] uppercase text-[var(--color-muted)] mb-4">
                  Membership
                </p>
                <h2 className="font-display text-2xl md:text-3xl font-light text-[var(--foreground)] mb-6">
                  FOMUS {siteConfig.features.membershipName}
                </h2>
                <div className="flex flex-wrap gap-6">
                  {[
                    { label: 'メンバー限定価格', desc: '対象商品が会員特別価格に' },
                    { label: '送料無料', desc: '国内配送がいつでも無料' },
                    { label: 'ポイント還元', desc: 'お買い物でポイントが貯まる' },
                  ].map((item) => (
                    <div key={item.label} className="flex-1 min-w-[140px]">
                      <p className="text-xs font-medium text-[var(--foreground)] mb-1">{item.label}</p>
                      <p className="text-[10px] text-[var(--color-muted)]">{item.desc}</p>
                    </div>
                  ))}
                </div>
                {siteConfig.features.membershipUrl && (
                  <div className="mt-8">
                    <a
                      href={siteConfig.features.membershipUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-outline inline-block text-xs"
                    >
                      {siteConfig.features.membershipName}について詳しく
                    </a>
                  </div>
                )}
              </div>
              <div className="md:w-2/5 hidden md:block">
                <div className="aspect-square rounded-sm overflow-hidden bg-[var(--color-subtle)]">
                  <img
                    src="https://www.fomus.jp/assets/media/asset-16e2c54a31d6.jpg"
                    alt={`FOMUS ${siteConfig.features.membershipName}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Payment & Features */}
      <section className="py-12 md:py-16 border-t border-[var(--color-border)]">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16 text-center">
            {[
              { label: 'クレジットカード決済', sub: 'Visa / Master / Amex' },
              { label: 'JPYC決済対応', sub: '暗号資産ステーブルコイン' },
              { label: '国内送料', sub: `¥${siteConfig.shippingFee.toLocaleString()}〜` },
              { label: '海外発送対応', sub: 'Worldwide Shipping' },
            ].map((item) => (
              <div key={item.label}>
                <p className="text-[10px] tracking-[0.1em] uppercase text-[var(--foreground)]">{item.label}</p>
                <p className="text-[10px] text-[var(--color-muted)] mt-0.5">{item.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Minimal Footer CTA */}
      <section className="py-16 md:py-20 text-center">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
          <div className="flex items-center justify-center gap-5 flex-wrap">
            <Link href="/shop" className="btn-primary inline-block">
              商品一覧
            </Link>
            <Link href="/digital" className="btn-outline inline-block">
              デジタルアイテム
            </Link>
            {!isLoggedIn && (
              <Link href="/auth/register" className="btn-outline inline-block">
                アカウント作成
              </Link>
            )}
          </div>
          <div className="mt-8">
            <a
              href="https://www.fomus.jp"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] tracking-[0.1em] text-[var(--color-muted)] hover:text-[var(--foreground)] transition-colors"
            >
              FOMUS 公式サイトはこちら →
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}
