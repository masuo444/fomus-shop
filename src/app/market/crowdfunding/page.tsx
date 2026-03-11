import Link from 'next/link'
import { createAdminClient } from '@/lib/supabase/admin'
import { formatPrice } from '@/lib/utils'
import type { CrowdfundingProject } from '@/lib/types'

export default async function CrowdfundingListPage() {
  const admin = createAdminClient()

  const { data } = await admin
    .from('crowdfunding_projects')
    .select('*, creator:profiles(id, name)')
    .in('status', ['active', 'funded', 'ended'])
    .order('created_at', { ascending: false })

  const projects = (data || []) as (CrowdfundingProject & { creator: { id: string; name: string | null } })[]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">クラウドファンディング</h1>
          <p className="text-sm text-gray-500 mt-1">プロジェクトを支援しよう</p>
        </div>
        <Link
          href="/market/crowdfunding/new"
          className="bg-gray-900 text-white text-sm px-5 py-2.5 rounded-full hover:bg-gray-800 transition-colors"
        >
          プロジェクトを作成
        </Link>
      </div>

      {projects.length === 0 ? (
        <div className="text-center py-24">
          <p className="text-gray-400">まだプロジェクトがありません</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => {
            const progress = Math.min(Math.round((project.current_amount / project.goal_amount) * 100), 100)
            const daysLeft = Math.max(0, Math.ceil((new Date(project.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
            const isFunded = project.status === 'funded'
            const isEnded = project.status === 'ended'

            return (
              <Link key={project.id} href={`/market/crowdfunding/${project.id}`} className="group block">
                <div className="relative aspect-video bg-gray-100 rounded-xl overflow-hidden mb-3">
                  {project.image_url ? (
                    <img
                      src={project.image_url}
                      alt={project.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-200 text-gray-300">
                      <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                  )}
                  {isFunded && (
                    <div className="absolute top-2.5 left-2.5 bg-green-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-full">
                      目標達成
                    </div>
                  )}
                  {isEnded && (
                    <div className="absolute top-2.5 left-2.5 bg-gray-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-full">
                      募集終了
                    </div>
                  )}
                </div>

                <h3 className="text-sm font-medium text-gray-900 group-hover:text-gray-600 transition-colors line-clamp-2 mb-2">
                  {project.title}
                </h3>

                {/* Progress bar */}
                <div className="w-full h-1.5 bg-gray-100 rounded-full mb-2">
                  <div
                    className={`h-full rounded-full transition-all ${isFunded ? 'bg-green-500' : 'bg-gray-900'}`}
                    style={{ width: `${progress}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-gray-900">{formatPrice(project.current_amount)}</span>
                    <span className="text-gray-400"> / {formatPrice(project.goal_amount)}</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-400">
                    <span>{progress}%</span>
                    <span>{project.backer_count}人</span>
                    <span>{daysLeft > 0 ? `残り${daysLeft}日` : '終了'}</span>
                  </div>
                </div>

                <p className="text-xs text-gray-400 mt-1">by {project.creator?.name || '匿名'}</p>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
