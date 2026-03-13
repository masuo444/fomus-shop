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
}

export function ProductJsonLd({ name, description, price, currency = 'JPY', image, url, inStock, sku }: ProductJsonLdProps) {
  const data: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name,
    description,
    url: `${baseUrl}${url}`,
    offers: {
      '@type': 'Offer',
      price,
      priceCurrency: currency,
      availability: inStock ? 'https://schema.org/InStock' : 'https://schema.org/SoldOut',
      url: `${baseUrl}${url}`,
    },
  }
  if (image) data.image = image
  if (sku) data.sku = sku
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

