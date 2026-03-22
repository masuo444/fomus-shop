import type { Metadata } from 'next'
import { Geist, Geist_Mono, Noto_Sans_JP } from 'next/font/google'
import { Cormorant_Garamond } from 'next/font/google'
import Header from '@/components/layout/Header'
import AnnouncementBar from '@/components/layout/AnnouncementBar'
import Footer from '@/components/layout/Footer'
import CartToast from '@/components/ui/CartToast'
import MobileCartBar from '@/components/layout/MobileCartBar'
import Concierge from '@/components/ui/Concierge'
import GoogleAnalytics from '@/components/layout/GoogleAnalytics'
import { OrganizationJsonLd, WebSiteJsonLd, LocalBusinessJsonLd } from '@/components/seo/JsonLd'
import { SITE_NAME, SITE_DESCRIPTION } from '@/lib/constants'
import siteConfig from '@/site.config'
import './globals.css'

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://shop.fomus.co.jp'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

const notoSansJP = Noto_Sans_JP({
  variable: '--font-noto-sans-jp',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
})

const cormorant = Cormorant_Garamond({
  variable: '--font-cormorant',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
})

export const metadata: Metadata = {
  title: {
    default: SITE_NAME,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  metadataBase: new URL(baseUrl),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    siteName: SITE_NAME,
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    locale: 'ja_JP',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    images: ['/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ja">
      <head>
        <meta name="theme-color" content="#1A1A18" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <link rel="apple-touch-icon" href="/fomus-logo.png" />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} ${cormorant.variable} ${notoSansJP.variable} antialiased`}>
        <style dangerouslySetInnerHTML={{ __html: `
          :root {
            --color-primary: ${siteConfig.theme.primary};
            --color-accent: ${siteConfig.theme.accent};
            --color-member: ${siteConfig.theme.memberColor};
            --color-member-bg: ${siteConfig.theme.memberColor}1A;
            --color-member-dark: ${siteConfig.theme.memberColor};
            --color-member-border: ${siteConfig.theme.memberColor}40;
          }
        `}} />
        <GoogleAnalytics />
        <OrganizationJsonLd />
        <WebSiteJsonLd />
        <LocalBusinessJsonLd />
        <div className="flex flex-col min-h-screen">
          <AnnouncementBar />
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
        <CartToast />
        <MobileCartBar />
        <Concierge />
      </body>
    </html>
  )
}
