import type { MetadataRoute } from 'next'
import siteConfig from '@/site.config'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://shop.fomus.co.jp'

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/api/', '/account/', '/partner/', '/checkout/', '/auth/', '/cart'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
