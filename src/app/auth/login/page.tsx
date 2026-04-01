'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import siteConfig from '@/site.config'

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="max-w-sm mx-auto px-4 py-16 text-center text-gray-400">読み込み中...</div>}>
      <LoginContent />
    </Suspense>
  )
}

function LoginContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') || '/'
  const errorParam = searchParams.get('error')

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(
    errorParam === 'invalid_token' ? 'SSO認証に失敗しました。再度お試しください。' :
    errorParam === 'sso_failed' ? 'SSOログインに失敗しました。' :
    ''
  )
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError('メールアドレスまたはパスワードが正しくありません')
      setLoading(false)
      return
    }

    router.push(redirect)
    router.refresh()
  }

  return (
    <div className="max-w-sm mx-auto px-4 py-16">
      <h1 className="text-2xl font-bold text-gray-900 text-center mb-8">ログイン</h1>

      {/* GUILD Member CTA */}
      {siteConfig.features.membershipSso && siteConfig.features.membershipUrl && (
        <div className="mb-8">
          <a
            href="https://guild-app.fomusglobal.com/invite/FOMUS-SHOP"
            className="block w-full rounded-xl border-2 border-[var(--color-member)] px-5 py-4 text-center hover:bg-[var(--color-member-bg)] transition-colors"
          >
            <p className="text-sm font-bold" style={{ color: 'var(--color-member)' }}>
              {siteConfig.features.membershipName}メンバーの方
            </p>
            <p className="text-xs text-gray-500 mt-1">
              会員限定価格でお買い物できます
            </p>
          </a>
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400">または</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
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
            value={password}
            onChange={(e) => setPassword(e.target.value)}
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
          {loading ? 'ログイン中...' : 'ログイン'}
        </button>
      </form>

      <div className="mt-6 space-y-3 text-center text-sm">
        <p className="text-gray-500">
          アカウントをお持ちでない方は{' '}
          <Link href="/auth/register" className="text-gray-900 font-medium hover:underline">
            アカウント作成
          </Link>
        </p>
        <Link
          href="/checkout"
          className="block text-gray-400 hover:text-gray-600 transition-colors"
        >
          ゲストとして購入
        </Link>
      </div>
    </div>
  )
}
