import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Cormorant_Garamond } from 'next/font/google'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import GoogleAnalytics from '@/components/layout/GoogleAnalytics'
import { SITE_NAME, SITE_DESCRIPTION } from '@/lib/constants'
import siteConfig from '@/site.config'
import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
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
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ja">
      <body className={`${geistSans.variable} ${geistMono.variable} ${cormorant.variable} antialiased`}>
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
        <div className="flex flex-col min-h-screen">
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  )
}
