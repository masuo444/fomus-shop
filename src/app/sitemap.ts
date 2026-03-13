import type { MetadataRoute } from 'next'
import { createAdminClient } from '@/lib/supabase/admin'
import { getPublishedShopIds } from '@/lib/shop'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://shop.fomus.co.jp'
  const admin = createAdminClient()
  const shopIds = await getPublishedShopIds()

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${baseUrl}/shop`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/digital`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
    { url: `${baseUrl}/shop/masu`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: `${baseUrl}/shop/masu/custom`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/market`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.7 },
    { url: `${baseUrl}/story`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${baseUrl}/gallery`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.5 },
    { url: `${baseUrl}/contact`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${baseUrl}/legal`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
    { url: `${baseUrl}/legal/commercial-transactions`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
    { url: `${baseUrl}/legal/privacy`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
    { url: `${baseUrl}/legal/terms`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
  ]

  // Product pages
  let productPages: MetadataRoute.Sitemap = []
  if (shopIds.length > 0) {
    const { data: products } = await admin
      .from('products')
      .select('id, updated_at')
      .in('shop_id', shopIds)
      .eq('is_published', true)
      .order('updated_at', { ascending: false })

    productPages = (products || []).map((p) => ({
      url: `${baseUrl}/shop/${p.id}`,
      lastModified: new Date(p.updated_at),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }))
  }

  // Digital item pages
  let digitalPages: MetadataRoute.Sitemap = []
  if (shopIds.length > 0) {
    const { data: items } = await admin
      .from('digital_items')
      .select('id, updated_at')
      .in('shop_id', shopIds)
      .eq('is_published', true)
      .order('updated_at', { ascending: false })

    digitalPages = (items || []).map((i) => ({
      url: `${baseUrl}/digital/${i.id}`,
      lastModified: new Date(i.updated_at),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }))
  }

  return [...staticPages, ...productPages, ...digitalPages]
}
