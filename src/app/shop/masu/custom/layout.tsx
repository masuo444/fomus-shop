import type { Metadata } from 'next'
import siteConfig from '@/site.config'

export const metadata: Metadata = {
  title: '名入れ・オーダーメイド枡 | お見積り・ご相談',
  description:
    'オリジナル枡の名入れ・オーダーメイドのお見積り・ご相談フォーム。レーザー刻印・焼印で企業ロゴ・お名前・メッセージを刻印。結婚祝い・記念品・企業ノベルティに。',
  openGraph: {
    title: `名入れ・オーダーメイド枡 | ${siteConfig.name}`,
    description:
      'オリジナル枡の名入れ・オーダーメイドのお見積り・ご相談。レーザー刻印・焼印対応。',
  },
}

export default function CustomMasuLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
