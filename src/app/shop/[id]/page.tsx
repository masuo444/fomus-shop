import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import type { Product } from '@/lib/types'
import type { Metadata } from 'next'
import ProductDetailClient from './ProductDetailClient'
import { ProductJsonLd, BreadcrumbJsonLd } from '@/components/seo/JsonLd'
import siteConfig from '@/site.config'

interface Props {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const supabase = await createClient()
  const { data: product } = await supabase
    .from('products')
    .select('name, description, images')
    .eq('id', id)
    .single()

  const title = product?.name || '商品詳細'
  const description = product?.description || siteConfig.description
  const imageUrl = product?.images?.[0] || undefined

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: imageUrl ? [{ url: imageUrl }] : undefined,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: imageUrl ? [imageUrl] : undefined,
    },
  }
}

export default async function ProductDetailPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const { data: product } = await supabase
    .from('products')
    .select('*, category:categories(*), product_options(*, choices:product_option_choices(*))')
    .eq('id', id)
    .eq('is_published', true)
    .single()

  if (!product) {
    notFound()
  }

  // Get shop name for partner products
  let shopName: string | undefined
  const { data: shop } = await supabase
    .from('shops')
    .select('name, slug')
    .eq('id', product.shop_id)
    .single()
  if (shop && shop.slug !== 'fomus') {
    shopName = shop.name
  }

  const p = product as Product

  return (
    <>
      <ProductJsonLd
        name={p.name}
        description={p.description || siteConfig.description}
        price={p.price}
        currency="JPY"
        image={p.images?.[0]}
        url={`/shop/${p.id}`}
        inStock={p.stock !== 0}
        sku={p.id}
        brand="FOMUS"
      />
      <BreadcrumbJsonLd items={[
        { name: 'ホーム', href: '/' },
        { name: '商品一覧', href: '/shop' },
        { name: p.name, href: `/shop/${p.id}` },
      ]} />
      <ProductDetailClient product={p} shopName={shopName} />
    </>
  )
}
