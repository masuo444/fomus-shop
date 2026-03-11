'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import type { Profile } from '@/lib/types'
import { Package, Sparkles, Heart, Coins } from 'lucide-react'
import MemberBadge from '@/components/ui/MemberBadge'

export default function AccountPage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  const [form, setForm] = useState({
    name: '',
    phone: '',
    postal_code: '',
    address: '',
  })

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (user) {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (data) {
        setProfile(data as Profile)
        setForm({
          name: data.name || '',
          phone: data.phone || '',
          postal_code: data.postal_code || '',
          address: data.address || '',
        })
      }
    }
    setLoading(false)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage('')

    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return

    const { error } = await supabase
      .from('profiles')
      .update({
        name: form.name,
        phone: form.phone,
        postal_code: form.postal_code,
        address: form.address,
      })
      .eq('id', user.id)

    if (error) {
      setMessage('保存に失敗しました')
    } else {
      setMessage('保存しました')
    }
    setSaving(false)
    setTimeout(() => setMessage(''), 3000)
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="animate-pulse text-gray-400">読み込み中...</div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center gap-3 mb-8">
        <h1 className="text-2xl font-bold text-gray-900">マイページ</h1>
        <MemberBadge isPremium={!!profile?.is_premium_member} size="sm" />
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
        <Link
          href="/account/orders"
          className="flex items-center gap-3 p-4 border border-gray-100 rounded-lg hover:border-gray-300 transition-colors"
        >
          <Package className="w-5 h-5 text-gray-400" />
          <div>
            <p className="text-sm font-medium text-gray-900">注文履歴</p>
            <p className="text-xs text-gray-400">過去のご注文</p>
          </div>
        </Link>
        <Link
          href="/account/digital"
          className="flex items-center gap-3 p-4 border border-gray-100 rounded-lg hover:border-gray-300 transition-colors"
        >
          <Sparkles className="w-5 h-5 text-gray-400" />
          <div>
            <p className="text-sm font-medium text-gray-900">デジタルアイテム</p>
            <p className="text-xs text-gray-400">所有アイテム</p>
          </div>
        </Link>
        <Link
          href="/account/favorites"
          className="flex items-center gap-3 p-4 border border-gray-100 rounded-lg hover:border-gray-300 transition-colors"
        >
          <Heart className="w-5 h-5 text-gray-400" />
          <div>
            <p className="text-sm font-medium text-gray-900">お気に入り</p>
            <p className="text-xs text-gray-400">気になる商品</p>
          </div>
        </Link>
        <Link
          href="/account/payouts"
          className="flex items-center gap-3 p-4 border border-gray-100 rounded-lg hover:border-gray-300 transition-colors"
        >
          <Coins className="w-5 h-5 text-gray-400" />
          <div>
            <p className="text-sm font-medium text-gray-900">ポイント交換</p>
            <p className="text-xs text-gray-400">クーポンに交換</p>
          </div>
        </Link>
      </div>

      {/* Profile Form */}
      <div className="border border-gray-100 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-1">プロフィール</h2>
        <p className="text-sm text-gray-400 mb-6">{profile?.email}</p>

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">お名前</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">電話番号</label>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">郵便番号</label>
            <input
              type="text"
              value={form.postal_code}
              onChange={(e) => setForm({ ...form, postal_code: e.target.value })}
              placeholder="000-0000"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">住所</label>
            <textarea
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              rows={3}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black resize-none"
            />
          </div>

          {message && (
            <p className={`text-sm ${message.includes('失敗') ? 'text-red-500' : 'text-green-600'}`}>
              {message}
            </p>
          )}

          <button
            type="submit"
            disabled={saving}
            className="bg-black text-white px-6 py-2 rounded-full text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
          >
            {saving ? '保存中...' : '保存'}
          </button>
        </form>
      </div>
    </div>
  )
}
