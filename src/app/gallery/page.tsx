import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getPublishedShopIds } from '@/lib/shop'
import { BreadcrumbJsonLd } from '@/components/seo/JsonLd'

export const metadata: Metadata = {
  title: 'ギャラリー',
  description: 'FOMUSプロダクトのフォトギャラリー。枡のある暮らし。',
  alternates: { canonical: '/gallery' },
}

interface GalleryImage {
  src: string
  alt: string
}

export default async function GalleryPage() {
  const supabase = await createClient()
  const shopIds = await getPublishedShopIds()

  let images: GalleryImage[] = []

  if (shopIds.length > 0) {
    const { data: products } = await supabase
      .from('products')
      .select('name, images')
      .in('shop_id', shopIds)
      .eq('is_published', true)
      .order('created_at', { ascending: false })

    if (products) {
      for (const product of products) {
        if (product.images && Array.isArray(product.images)) {
          for (const img of product.images) {
            images.push({ src: img, alt: product.name })
          }
        }
      }
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
      <BreadcrumbJsonLd items={[
        { name: 'ホーム', href: '/' },
        { name: 'ギャラリー', href: '/gallery' },
      ]} />

      <section className="pt-20 pb-12 md:pt-32 md:pb-16">
        <p className="text-[10px] tracking-[0.25em] uppercase text-[var(--color-muted)] mb-4">Gallery</p>
        <h1 className="text-3xl md:text-4xl font-light text-[var(--foreground)] leading-snug mb-4">
          FOMUSのある暮らし。
        </h1>
        <p className="text-xs leading-[2.2] text-[var(--color-muted)] max-w-md">
          FOMUSプロダクトの写真をご覧ください。
        </p>
      </section>

      <div className="h-px bg-[var(--color-border)] mb-12" />

      {images.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4 pb-16">
          {images.map((item, i) => (
            <div key={i} className="group relative overflow-hidden bg-[var(--color-subtle)] aspect-square">
              <Image
                src={item.src}
                alt={item.alt}
                fill
                sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                className="object-cover group-hover:scale-[1.02] transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <p className="text-[11px] text-white leading-relaxed">{item.alt}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-24">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <p className="text-gray-400">写真はまだありません</p>
        </div>
      )}

      {/* CTA */}
      <div className="h-px bg-[var(--color-border)]" />
      <section className="py-16 md:py-24 text-center">
        <p className="text-xs text-[var(--color-muted)] mb-3">
          #FOMUS でSNSに投稿してください。
        </p>
        <p className="text-[10px] text-[var(--color-border)] mb-8">
          素敵な写真はギャラリーでご紹介させていただきます。
        </p>
        <Link href="/shop" className="btn-primary inline-block">
          SHOP
        </Link>
      </section>
    </div>
  )
}
