import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import type { Product } from '@/lib/types'
import type { Metadata } from 'next'
import ProductDetailClient from './ProductDetailClient'
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
    .select('*, category:categories(*)')
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

  return <ProductDetailClient product={product as Product} shopName={shopName} />
}
