'use client'

import { useEffect, useState } from 'react'
import { formatPrice, formatDate } from '@/lib/utils'
import { Loader2 } from 'lucide-react'

type PayoutStatus = 'pending' | 'completed' | 'rejected' | 'all'

interface PayoutRequest {
  id: string
  points: number
  amount: number
  fee: number
  bank_name: string
  branch_name: string
  account_type: string
  account_number: string
  account_holder: string
  status: string
  admin_note: string | null
  created_at: string
  completed_at: string | null
  user?: { id: string; name: string | null; email: string }
}

export default function AdminPayoutsPage() {
  const [requests, setRequests] = useState<PayoutRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<PayoutStatus>('pending')
  const [processing, setProcessing] = useState<string | null>(null)

  useEffect(() => {
    loadRequests()
  }, [statusFilter])

  const loadRequests = async () => {
    setLoading(true)
    const res = await fetch(`/api/admin/payouts?status=${statusFilter}`)
    if (res.ok) {
      const data = await res.json()
      setRequests(data.requests || [])
    }
    setLoading(false)
  }

  const handleAction = async (id: string, status: 'completed' | 'rejected', adminNote?: string) => {
    setProcessing(id)
    const res = await fetch('/api/admin/payouts', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status, admin_note: adminNote }),
    })

    if (res.ok) {
      loadRequests()
    }
    setProcessing(null)
  }

  const statusTabs: { value: PayoutStatus; label: string }[] = [
    { value: 'pending', label: '未処理' },
    { value: 'completed', label: '振込済み' },
    { value: 'rejected', label: '却下' },
    { value: 'all', label: 'すべて' },
  ]

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">振込申請管理</h1>

      {/* Status tabs */}
      <div className="flex gap-1 mb-6 bg-gray-100 rounded-lg p-1 w-fit">
        {statusTabs.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => setStatusFilter(value)}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              statusFilter === value ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400">読み込み中...</div>
      ) : requests.length === 0 ? (
        <div className="text-center py-12 text-gray-400">振込申請はありません</div>
      ) : (
        <div className="space-y-4">
          {requests.map((req) => (
            <div key={req.id} className="border border-gray-200 rounded-xl p-5">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {req.user?.name || '名前未設定'} ({req.user?.email})
                  </p>
                  <p className="text-xs text-gray-400">{formatDate(req.created_at)}</p>
                </div>
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                  req.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                  req.status === 'completed' ? 'bg-green-100 text-green-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {req.status === 'pending' ? '未処理' : req.status === 'completed' ? '振込済み' : '却下'}
                </span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                <div>
                  <p className="text-xs text-gray-400">ポイント</p>
                  <p className="text-sm font-medium">{req.points.toLocaleString()} pt</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">振込額</p>
                  <p className="text-sm font-bold text-gray-900">{formatPrice(req.amount)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">手数料</p>
                  <p className="text-sm text-gray-600">{formatPrice(req.fee)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">口座</p>
                  <p className="text-sm text-gray-600">
                    {req.bank_name} {req.branch_name}
                  </p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-3 mb-4">
                <p className="text-xs text-gray-400 mb-1">振込先詳細</p>
                <p className="text-sm text-gray-900">
                  {req.bank_name} {req.branch_name}（{req.account_type === 'ordinary' ? '普通' : '当座'}）{req.account_number}
                </p>
                <p className="text-sm text-gray-900">名義: {req.account_holder}</p>
              </div>

              {req.status === 'pending' && (
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleAction(req.id, 'completed')}
                    disabled={processing === req.id}
                    className="flex items-center gap-1.5 bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50"
                  >
                    {processing === req.id && <Loader2 size={14} className="animate-spin" />}
                    振込完了
                  </button>
                  <button
                    onClick={() => {
                      const note = window.prompt('却下理由（任意）:')
                      if (note !== null) handleAction(req.id, 'rejected', note)
                    }}
                    disabled={processing === req.id}
                    className="text-sm text-red-600 hover:text-red-800 px-4 py-2"
                  >
                    却下
                  </button>
                </div>
              )}

              {req.admin_note && (
                <p className="text-xs text-gray-500 mt-2">メモ: {req.admin_note}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
