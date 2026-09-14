'use client'

import { useEffect } from 'react'

/**
 * 紹介リンク（?ref=CODE）を受け取って保存する。
 *
 * GUILD会員が自分のコード付きURLを共有 → 訪問者がその場で買わなくても、
 * 30日以内にチェックアウトまで進めば紹介コードが自動で入る。
 * 保存先は localStorage のみ（Cookieを増やさない）。
 */
const KEY = 'fomus_ref'
const TTL_DAYS = 30

/** サーバー側(checkout API)と同じ正規化。英数字のみ・大文字・20文字まで */
function normalize(raw: string): string {
  return raw.trim().toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 20)
}

export function readStoredReferral(): string {
  if (typeof window === 'undefined') return ''
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return ''
    const { code, at } = JSON.parse(raw) as { code?: string; at?: number }
    if (!code || !at) return ''
    if (Date.now() - at > TTL_DAYS * 24 * 60 * 60 * 1000) {
      localStorage.removeItem(KEY)
      return ''
    }
    return normalize(code)
  } catch {
    return ''
  }
}

export default function ReferralCapture() {
  useEffect(() => {
    // useSearchParams を使うと Suspense 境界が要るので、URLを直接読む
    const code = normalize(new URLSearchParams(window.location.search).get('ref') || '')
    if (!code) return
    try {
      localStorage.setItem(KEY, JSON.stringify({ code, at: Date.now() }))
    } catch {
      // プライベートブラウズ等で書けなくても、購入自体は妨げない
    }
  }, [])

  return null
}
