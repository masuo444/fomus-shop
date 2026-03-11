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

// Crowdfunding / Event schema
interface CrowdfundingJsonLdProps {
  name: string
  description: string
  url: string
  startDate: string
  endDate: string
  image?: string
  organizer: string
}

export function CrowdfundingJsonLd({ name, description, url, startDate, endDate, image, organizer }: CrowdfundingJsonLdProps) {
  const data: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name,
    description,
    url: `${baseUrl}${url}`,
    startDate,
    endDate,
    eventAttendanceMode: 'https://schema.org/OnlineEventAttendanceMode',
    organizer: {
      '@type': 'Person',
      name: organizer,
    },
  }
  if (image) data.image = image
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}
