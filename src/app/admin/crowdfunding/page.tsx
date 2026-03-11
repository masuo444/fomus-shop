'use client'

import { useEffect, useState } from 'react'
import { formatPrice, formatDate } from '@/lib/utils'
import { CROWDFUNDING_STATUS_LABELS } from '@/lib/types'
import { Loader2 } from 'lucide-react'

interface Project {
  id: string
  title: string
  goal_amount: number
  current_amount: number
  backer_count: number
  deadline: string
  status: string
  bank_name: string
  branch_name: string
  account_type: string
  account_number: string
  account_holder: string
  commission_rate: number
  payout_status: string
  created_at: string
  creator?: { id: string; name: string | null; email: string }
}

export default function AdminCrowdfundingPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState<string | null>(null)

  useEffect(() => {
    loadProjects()
  }, [])

  const loadProjects = async () => {
    setLoading(true)
    const res = await fetch('/api/admin/crowdfunding')
    if (res.ok) {
      const data = await res.json()
      setProjects(data.projects || [])
    }
    setLoading(false)
  }

  const handleAction = async (id: string, action: string) => {
    setProcessing(id)
    const res = await fetch('/api/admin/crowdfunding', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, action }),
    })
    if (res.ok) {
      loadProjects()
    } else {
      const data = await res.json()
      alert(data.error || 'エラーが発生しました')
    }
    setProcessing(null)
  }

  const statusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-700'
      case 'active': return 'bg-blue-100 text-blue-700'
      case 'funded': return 'bg-green-100 text-green-700'
      case 'ended': return 'bg-gray-100 text-gray-600'
      case 'cancelled': return 'bg-red-100 text-red-700'
      default: return 'bg-gray-100 text-gray-600'
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">クラウドファンディング管理</h1>

      {loading ? (
        <div className="text-center py-12 text-gray-400">読み込み中...</div>
      ) : projects.length === 0 ? (
        <div className="text-center py-12 text-gray-400">プロジェクトはありません</div>
      ) : (
        <div className="space-y-4">
          {projects.map((project) => {
            const progress = project.goal_amount > 0 ? Math.round((project.current_amount / project.goal_amount) * 100) : 0
            const payoutAmount = Math.round(project.current_amount * (100 - project.commission_rate) / 100)

            return (
              <div key={project.id} className="border border-gray-200 rounded-xl p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-medium text-gray-900">{project.title}</h3>
                    <p className="text-xs text-gray-400">
                      {project.creator?.name || '名前未設定'} ({project.creator?.email}) / {formatDate(project.created_at)}
                    </p>
                  </div>
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusColor(project.status)}`}>
                    {CROWDFUNDING_STATUS_LABELS[project.status as keyof typeof CROWDFUNDING_STATUS_LABELS] || project.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
                  <div>
                    <p className="text-xs text-gray-400">目標</p>
                    <p className="text-sm font-medium">{formatPrice(project.goal_amount)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">現在</p>
                    <p className="text-sm font-bold">{formatPrice(project.current_amount)} ({progress}%)</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">支援者</p>
                    <p className="text-sm font-medium">{project.backer_count}人</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">締切</p>
                    <p className="text-sm font-medium">{formatDate(project.deadline)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">振込額(手数料{project.commission_rate}%後)</p>
                    <p className="text-sm font-bold text-green-700">{formatPrice(payoutAmount)}</p>
                  </div>
                </div>

                {/* Bank info */}
                <div className="bg-gray-50 rounded-lg p-3 mb-4 text-sm">
                  <p className="text-xs text-gray-400 mb-1">振込先</p>
                  <p className="text-gray-900">
                    {project.bank_name} {project.branch_name}（{project.account_type === 'ordinary' ? '普通' : '当座'}）{project.account_number} / {project.account_holder}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3">
                  {project.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleAction(project.id, 'approve')}
                        disabled={processing === project.id}
                        className="flex items-center gap-1.5 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
                      >
                        {processing === project.id && <Loader2 size={14} className="animate-spin" />}
                        承認（公開）
                      </button>
                      <button
                        onClick={() => handleAction(project.id, 'reject')}
                        disabled={processing === project.id}
                        className="text-sm text-red-600 hover:text-red-800 px-4 py-2"
                      >
                        却下
                      </button>
                    </>
                  )}
                  {(project.status === 'funded' || project.status === 'ended') && project.payout_status === 'pending' && project.current_amount > 0 && (
                    <button
                      onClick={() => handleAction(project.id, 'payout_complete')}
                      disabled={processing === project.id}
                      className="flex items-center gap-1.5 bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50"
                    >
                      {processing === project.id && <Loader2 size={14} className="animate-spin" />}
                      振込完了（{formatPrice(payoutAmount)}）
                    </button>
                  )}
                  {project.payout_status === 'completed' && (
                    <span className="text-xs text-green-600 font-medium">振込済み</span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
