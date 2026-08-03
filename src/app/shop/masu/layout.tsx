import { notFound } from 'next/navigation'
import siteConfig from '@/site.config'

export default function MasuLayout({ children }: { children: React.ReactNode }) {
  if (!siteConfig.features.brandPages) {
    notFound()
  }
  return <>{children}</>
}
