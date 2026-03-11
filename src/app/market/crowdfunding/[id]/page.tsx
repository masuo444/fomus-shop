import { createAdminClient } from '@/lib/supabase/admin'
import { formatPrice, formatDate } from '@/lib/utils'
import { notFound } from 'next/navigation'
import type { CrowdfundingProject, CrowdfundingTier } from '@/lib/types'
import type { Metadata } from 'next'
import { CROWDFUNDING_STATUS_LABELS } from '@/lib/types'
import { CrowdfundingJsonLd, BreadcrumbJsonLd } from '@/components/seo/JsonLd'
import CrowdfundingBackButton from './CrowdfundingBackButton'
import siteConfig from '@/site.config'

interface Props {
  params: Promise<{ id: string }>
  searchParams: Promise<{ backed?: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const admin = createAdminClient()
  const { data } = await admin
    .from('crowdfunding_projects')
    .select('title, description, image_url')
    .eq('id', id)
    .single()

  const title = data?.title || 'クラウドファンディング'
  const description = data?.description?.slice(0, 160) || siteConfig.description
  const imageUrl = data?.image_url || undefined

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

export default async function CrowdfundingDetailPage({ params, searchParams }: Props) {
  const { id } = await params
  const { backed } = await searchParams
  const admin = createAdminClient()

  const { data: project } = await admin
    .from('crowdfunding_projects')
    .select('*, creator:profiles(id, name), tiers:crowdfunding_tiers(*)')
    .eq('id', id)
    .in('status', ['active', 'funded', 'ended'])
    .single()

  if (!project) notFound()

  const typedProject = project as CrowdfundingProject & {
    creator: { id: string; name: string | null }
    tiers: CrowdfundingTier[]
  }

  const progress = Math.min(Math.round((typedProject.current_amount / typedProject.goal_amount) * 100), 100)
  const daysLeft = Math.max(0, Math.ceil((new Date(typedProject.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
  const isActive = typedProject.status === 'active' && daysLeft > 0
  const isFunded = typedProject.status === 'funded'
  const isEnded = typedProject.status === 'ended'

  const sortedTiers = [...(typedProject.tiers || [])].sort((a, b) => a.sort_order - b.sort_order)

  return (
    <>
      <CrowdfundingJsonLd
        name={typedProject.title}
        description={typedProject.description || ''}
        url={`/market/crowdfunding/${typedProject.id}`}
        startDate={typedProject.created_at}
        endDate={typedProject.deadline}
        image={typedProject.image_url || undefined}
        organizer={typedProject.creator?.name || '匿名'}
      />
      <BreadcrumbJsonLd items={[
        { name: 'ホーム', href: '/' },
        { name: siteConfig.features.marketplaceName, href: '/market' },
        { name: 'クラウドファンディング', href: '/market/crowdfunding' },
        { name: typedProject.title, href: `/market/crowdfunding/${typedProject.id}` },
      ]} />
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      {backed && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-5 mb-6">
          <p className="font-semibold text-green-800">ご支援ありがとうございます！</p>
          <p className="text-sm text-green-600 mt-1">プロジェクトの成功を一緒に応援しましょう。</p>
        </div>
      )}

      {/* Header image */}
      <div className="aspect-video bg-gray-100 rounded-2xl overflow-hidden mb-8">
        {typedProject.image_url ? (
          <img src={typedProject.image_url} alt={typedProject.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-200 text-gray-300">
            <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Project info */}
        <div className="lg:col-span-2">
          <div className="flex items-center gap-2 mb-3">
            {isFunded && (
              <span className="bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full">目標達成</span>
            )}
            {isEnded && (
              <span className="bg-gray-100 text-gray-600 text-xs font-medium px-3 py-1 rounded-full">募集終了</span>
            )}
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-2">{typedProject.title}</h1>
          <p className="text-sm text-gray-400 mb-6">by {typedProject.creator?.name || '匿名'}</p>

          {typedProject.description && (
            <div className="prose prose-sm max-w-none text-gray-600 whitespace-pre-wrap">
              {typedProject.description}
            </div>
          )}
        </div>

        {/* Right: Stats + Tiers */}
        <div>
          {/* Stats card */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 mb-6 sticky top-20">
            <div className="mb-4">
              <p className="text-2xl font-bold text-gray-900">{formatPrice(typedProject.current_amount)}</p>
              <p className="text-xs text-gray-400">目標 {formatPrice(typedProject.goal_amount)}</p>
            </div>

            <div className="w-full h-2 bg-gray-100 rounded-full mb-4">
              <div
                className={`h-full rounded-full ${isFunded ? 'bg-green-500' : 'bg-gray-900'}`}
                style={{ width: `${progress}%` }}
              />
            </div>

            <div className="grid grid-cols-3 gap-2 text-center mb-6">
              <div>
                <p className="text-lg font-bold text-gray-900">{progress}%</p>
                <p className="text-[10px] text-gray-400">達成率</p>
              </div>
              <div>
                <p className="text-lg font-bold text-gray-900">{typedProject.backer_count}</p>
                <p className="text-[10px] text-gray-400">支援者</p>
              </div>
              <div>
                <p className="text-lg font-bold text-gray-900">{daysLeft}</p>
                <p className="text-[10px] text-gray-400">残り日数</p>
              </div>
            </div>

            <p className="text-xs text-gray-400 text-center mb-4">
              締切: {formatDate(typedProject.deadline)}
            </p>

            {/* Tiers */}
            <div className="space-y-3">
              {sortedTiers.map((tier) => {
                const isFull = tier.max_backers !== null && tier.current_backers >= tier.max_backers
                return (
                  <div key={tier.id} className={`border rounded-xl p-4 ${isFull ? 'border-gray-100 opacity-60' : 'border-gray-200'}`}>
                    <div className="flex items-start justify-between mb-1">
                      <p className="text-sm font-bold text-gray-900">{formatPrice(tier.amount)}</p>
                      {tier.max_backers && (
                        <span className="text-[10px] text-gray-400">
                          {tier.current_backers}/{tier.max_backers}人
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-medium text-gray-700 mb-1">{tier.title}</p>
                    {tier.description && (
                      <p className="text-xs text-gray-500 mb-3">{tier.description}</p>
                    )}
                    {isActive && !isFull && (
                      <CrowdfundingBackButton projectId={typedProject.id} tierId={tier.id} amount={tier.amount} />
                    )}
                    {isFull && (
                      <p className="text-xs text-gray-400 font-medium">上限に達しました</p>
                    )}
                  </div>
                )
              })}
            </div>

            {isEnded && (
              <p className="text-xs text-gray-400 text-center mt-4">このプロジェクトの募集は終了しました</p>
            )}
          </div>
        </div>
      </div>
    </div>
    </>
  )
}
