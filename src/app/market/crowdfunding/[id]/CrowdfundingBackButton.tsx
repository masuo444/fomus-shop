'use client'

import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { formatPrice } from '@/lib/utils'

interface Props {
  projectId: string
  tierId: string
  amount: number
}

export default function CrowdfundingBackButton({ projectId, tierId, amount }: Props) {
  const [loading, setLoading] = useState(false)

  const handleBack = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/crowdfunding/back', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ project_id: projectId, tier_id: tierId }),
      })

      const data = await res.json()
      if (!res.ok) {
        alert(data.error || '支援に失敗しました')
        return
      }

      if (data.url) {
        window.location.href = data.url
      }
    } catch {
      alert('エラーが発生しました')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleBack}
      disabled={loading}
      className="w-full bg-gray-900 text-white text-sm py-2 rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
    >
      {loading && <Loader2 size={14} className="animate-spin" />}
      {formatPrice(amount)} で支援する
    </button>
  )
}
