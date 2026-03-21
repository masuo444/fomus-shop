'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function AnnouncementBar() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const dismissed = sessionStorage.getItem('announcement_dismissed')
    if (dismissed) return

    const check = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) setVisible(true)
    }
    check()
  }, [])

  if (!visible) return null

  return (
    <div className="bg-[var(--foreground)] text-white text-center py-2.5 px-4 relative">
      <p className="text-xs tracking-wide">
        会員登録で<span className="font-bold mx-1">500円OFFクーポン</span>プレゼント中
        <Link href="/auth/register" className="ml-2 underline underline-offset-2 hover:opacity-80">
          無料登録
        </Link>
      </p>
      <button
        onClick={() => { setVisible(false); sessionStorage.setItem('announcement_dismissed', '1') }}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}
