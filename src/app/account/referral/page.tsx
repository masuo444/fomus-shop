'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function ReferralPage() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/account')
  }, [router])

  return (
    <div className="max-w-2xl mx-auto px-4 py-16 text-center">
      <div className="animate-pulse text-gray-400">リダイレクト中...</div>
    </div>
  )
}
