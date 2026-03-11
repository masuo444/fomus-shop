'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Gift } from 'lucide-react'

export default function RegisterPage() {
  const router = useRouter()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [bonusMessage, setBonusMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (password.length < 6) {
      setError('パスワードは6文字以上で入力してください')
      setLoading(false)
      return
    }

    const supabase = createClient()
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (signUpError) {
      setError(signUpError.message)
      setLoading(false)
      return
    }

    const userId = signUpData.user?.id

    // Call register-bonus API
    if (userId) {
      try {
        const res = await fetch('/api/auth/register-bonus', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId }),
        })
        if (res.ok) {
          const data = await res.json()
          setBonusMessage(`500円OFFクーポンをプレゼント！（コード: ${data.coupon_code}）`)
        }
      } catch (err) {
        console.error('Register bonus error:', err)
      }
    }

    if (bonusMessage) {
      // Wait a bit to show message before redirect
      setTimeout(() => router.push('/auth/login?registered=true'), 3000)
    } else {
      router.push('/auth/login?registered=true')
    }
  }

  return (
    <div className="max-w-sm mx-auto px-4 py-16">
      <h1 className="text-2xl font-bold text-gray-900 text-center mb-8">アカウント作成</h1>

      {/* Bonus message */}
      {bonusMessage && (
        <div className="mb-6 bg-yellow-50 border border-yellow-100 rounded-xl p-4 text-center">
          <Gift className="w-6 h-6 text-yellow-500 mx-auto mb-2" />
          <p className="text-sm font-medium text-yellow-700">{bonusMessage}</p>
          <p className="text-xs text-yellow-600 mt-1">次回のお買い物でご利用いただけます。</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm text-gray-600 mb-1">お名前</label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-600 mb-1">メールアドレス</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-600 mb-1">パスワード</label>
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="6文字以上"
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black"
          />
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg">{error}</div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-black text-white py-3 rounded-full text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
        >
          {loading ? '作成中...' : 'アカウント作成'}
        </button>
      </form>

      {/* Registration benefits */}
      <div className="mt-6 bg-gray-50 rounded-xl p-4">
        <p className="text-xs font-medium text-gray-700 mb-2">登録特典</p>
        <ul className="text-xs text-gray-500 space-y-1">
          <li>- 初回500円OFFウェルカムクーポン</li>
          <li>- お気に入り機能</li>
          <li>- 注文履歴の確認</li>
        </ul>
      </div>

      <p className="mt-6 text-center text-sm text-gray-500">
        すでにアカウントをお持ちの方は{' '}
        <Link href="/auth/login" className="text-gray-900 font-medium hover:underline">
          ログイン
        </Link>
      </p>
    </div>
  )
}
