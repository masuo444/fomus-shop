import siteConfig from '@/site.config'

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://shop.fomus.co.jp'

// Organization schema (site-wide)
export function OrganizationJsonLd() {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: siteConfig.name,
    description: siteConfig.description,
    url: baseUrl,
    logo: siteConfig.logoUrl || undefined,
    sameAs: ['https://www.fomus.jp'],
    contactPoint: { '@type': 'ContactPoint', contactType: 'customer service', availableLanguage: ['Japanese', 'English'] },
    knowsAbout: ['枡', 'masu', 'ヒノキ', '日本の伝統工芸', '木製品', 'Japanese traditional crafts'],
  }
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}

// WebSite schema (for sitelinks search box)
export function WebSiteJsonLd() {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: siteConfig.name,
    url: baseUrl,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${baseUrl}/shop?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  }
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}

// Product schema
interface ProductJsonLdProps {
  name: string
  description: string
  price: number
  currency?: string
  image?: string
  url: string
  inStock: boolean
  sku?: string
  brand?: string
  material?: string
  aggregateRating?: {
    ratingValue: number
    reviewCount: number
  }
}

export function ProductJsonLd({ name, description, price, currency = 'JPY', image, url, inStock, sku, brand, material, aggregateRating }: ProductJsonLdProps) {
  const data: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name,
    description,
    url: `${baseUrl}${url}`,
    itemCondition: 'https://schema.org/NewCondition',
    offers: {
      '@type': 'Offer',
      price,
      priceCurrency: currency,
      availability: inStock ? 'https://schema.org/InStock' : 'https://schema.org/SoldOut',
      url: `${baseUrl}${url}`,
      seller: { '@type': 'Organization', name: 'FOMUS' },
    },
  }
  if (image) data.image = image
  if (sku) data.sku = sku
  if (brand) data.brand = { '@type': 'Brand', name: brand }
  if (material) data.material = material
  if (aggregateRating) {
    data.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: aggregateRating.ratingValue,
      reviewCount: aggregateRating.reviewCount,
    }
  }
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}

// LocalBusiness schema (reads from siteConfig.legal)
export function LocalBusinessJsonLd() {
  const data: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: siteConfig.legal.companyName || siteConfig.name,
    url: baseUrl,
    logo: siteConfig.logoUrl || undefined,
  }
  if (siteConfig.legal.address) data.address = {
    '@type': 'PostalAddress',
    streetAddress: siteConfig.legal.address,
    addressCountry: 'JP',
  }
  if (siteConfig.legal.phone) data.telephone = siteConfig.legal.phone
  if (siteConfig.legal.email) data.email = siteConfig.legal.email
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}

// FAQPage schema
interface FAQItem {
  question: string
  answer: string
}

export function FAQPageJsonLd({ items }: { items: FAQItem[] }) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  }
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}

// ItemList schema
export function ItemListJsonLd({ name, items }: { name: string; items: Array<{ name: string; url: string; image?: string; position: number }> }) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name,
    numberOfItems: items.length,
    itemListElement: items.map(item => ({
      '@type': 'ListItem',
      position: item.position,
      item: {
        '@type': 'Product',
        name: item.name,
        url: item.url,
        ...(item.image && { image: item.image }),
      },
    })),
  }
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />
}

// HowTo schema
export function HowToJsonLd({ name, description, steps }: { name: string; description?: string; steps: Array<{ name: string; text: string }> }) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name,
    ...(description && { description }),
    step: steps.map((s, i) => ({
      '@type': 'HowToStep',
      position: i + 1,
      name: s.name,
      text: s.text,
    })),
  }
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />
}

// BreadcrumbList schema
interface BreadcrumbItem {
  name: string
  href: string
}

export function BreadcrumbJsonLd({ items }: { items: BreadcrumbItem[] }) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: `${baseUrl}${item.href}`,
    })),
  }
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}

