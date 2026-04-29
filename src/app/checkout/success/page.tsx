'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle, UserPlus } from 'lucide-react'
import Image from 'next/image'
import { clearLocalCart } from '@/lib/cart'
import { createClient } from '@/lib/supabase/client'
import { formatPrice } from '@/lib/utils'
import type { Product } from '@/lib/types'

export default function CheckoutSuccessPage() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null)
  const [showRegister, setShowRegister] = useState(false)
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const [recommended, setRecommended] = useState<Product[]>([])
  const router = useRouter()

  useEffect(() => {
    clearLocalCart()
    window.dispatchEvent(new Event('cart-updated'))

    const params = new URLSearchParams(window.location.search)
    const nameParam = params.get('name')
    if (nameParam) setName(nameParam)

    const init = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      setIsLoggedIn(!!user)

      // Load recommended products
      const { data: products } = await supabase
        .from('products')
        .select('*')
        .eq('is_published', true)
        .eq('item_type', 'physical')
        .order('created_at', { ascending: false })
        .limit(4)
      if (products) setRecommended(products as Product[])
    }
    init()
  }, [])

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const supabase = createClient()

    // Get email from URL params (passed from checkout)
    const params = new URLSearchParams(window.location.search)
    const email = params.get('email')

    if (!email) {
      setError('メールアドレスが見つかりません')
      setLoading(false)
      return
    }

    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name },
      },
    })

    if (signUpError) {
      if (signUpError.message.includes('already registered')) {
        setError('このメールアドレスは既に登録されています。ログインしてください。')
      } else {
        setError(signUpError.message)
      }
      setLoading(false)
      return
    }

    setSuccess(true)
    setLoading(false)
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-24 text-center">
      <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-6" />
      <h1 className="text-2xl font-bold text-gray-900 mb-2">
        ご注文ありがとうございます
      </h1>
      <p className="text-sm text-gray-500 mb-2">
        ご注文の確認メールをお送りしました。
      </p>
      <p className="text-sm text-gray-500 mb-8">
        商品の発送準備が整い次第、発送通知をお送りいたします。
      </p>

      {/* Guest user: prompt to register */}
      {isLoggedIn === false && !showRegister && !success && (
        <div className="mb-8 bg-blue-50 border border-blue-100 rounded-xl p-6 text-left">
          <div className="flex items-start gap-3">
            <UserPlus className="w-5 h-5 text-blue-500 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-medium text-gray-900 mb-1">
                アカウントを作成しませんか？
              </p>
              <p className="text-xs text-gray-500 mb-2">
                次回のお買い物で配送先の入力が不要になります。注文履歴の確認やデジタルアイテムの購入もできるようになります。
              </p>
              <button
                onClick={() => setShowRegister(true)}
                className="bg-blue-500 text-white text-sm px-5 py-2 rounded-full hover:bg-blue-600 transition-colors"
              >
                無料でアカウント作成
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Registration form */}
      {showRegister && !success && (
        <div className="mb-8 bg-white border border-gray-200 rounded-xl p-6 text-left">
          <h3 className="font-medium text-gray-900 mb-4">アカウント作成</h3>
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1">お名前</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">パスワード</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                placeholder="6文字以上"
                minLength={6}
                required
              />
            </div>
            {error && (
              <p className="text-xs text-red-500">{error}</p>
            )}
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-blue-500 text-white text-sm py-2.5 rounded-full hover:bg-blue-600 transition-colors disabled:opacity-50"
              >
                {loading ? '作成中...' : 'アカウント作成'}
              </button>
              <button
                type="button"
                onClick={() => setShowRegister(false)}
                className="text-sm text-gray-400 hover:text-gray-600 px-3"
              >
                キャンセル
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Registration success */}
      {success && (
        <div className="mb-8 space-y-4">
          <div className="bg-green-50 border border-green-100 rounded-xl p-6 text-left">
            <p className="text-sm font-medium text-green-700 mb-1">
              アカウントを作成しました！
            </p>
            <p className="text-xs text-green-600">
              確認メールをお送りしました。メール内のリンクをクリックしてアカウントを有効化してください。
            </p>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {isLoggedIn ? (
          <Link
            href="/account/orders"
            className="block w-full bg-black text-white py-3 rounded-full text-sm font-medium hover:bg-gray-800 transition-colors"
          >
            注文履歴を確認
          </Link>
        ) : success ? (
          <Link
            href="/auth/login"
            className="block w-full bg-black text-white py-3 rounded-full text-sm font-medium hover:bg-gray-800 transition-colors"
          >
            ログインする
          </Link>
        ) : null}
        <Link
          href="/shop"
          className="block w-full text-sm text-gray-500 hover:text-gray-900 py-2 transition-colors"
        >
          ショッピングを続ける
        </Link>
      </div>

      {/* Recommended Products */}
      {recommended.length > 0 && (
        <div className="mt-16 border-t border-gray-100 pt-10">
          <h2 className="text-sm font-medium text-gray-500 mb-6 text-center">こちらもおすすめ</h2>
          <div className="grid grid-cols-2 gap-4">
            {recommended.map((product) => (
              <Link key={product.id} href={`/shop/${product.id}`} className="group">
                <div className="aspect-square bg-gray-50 rounded-lg overflow-hidden relative">
                  {product.images?.[0] && (
                    <Image
                      src={product.images[0]}
                      alt={product.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      sizes="(max-width: 640px) 50vw, 200px"
                    />
                  )}
                </div>
                <p className="mt-2 text-xs text-gray-900 line-clamp-1">{product.name}</p>
                <p className="text-xs text-gray-500">{formatPrice(product.price)}</p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
