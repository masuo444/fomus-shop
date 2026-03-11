'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Loader2, Trash2 } from 'lucide-react'
import type { Shop, Profile } from '@/lib/types'

export default function EditPartnerPage() {
  const router = useRouter()
  const { id } = useParams<{ id: string }>()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [description, setDescription] = useState('')
  const [contactEmail, setContactEmail] = useState('')
  const [commissionRate, setCommissionRate] = useState('')
  const [status, setStatus] = useState<'active' | 'suspended'>('active')
  const [isPublished, setIsPublished] = useState(false)
  const [partnerUsers, setPartnerUsers] = useState<Profile[]>([])

  const fetchPartner = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/partners/${id}`)
      if (!res.ok) {
        setError('パートナーが見つかりません')
        return
      }
      const data = await res.json()
      const shop: Shop = data.shop
      setName(shop.name)
      setSlug(shop.slug)
      setDescription(shop.description || '')
      setContactEmail(shop.contact_email || '')
      setCommissionRate(String(shop.commission_rate))
      setStatus(shop.status)
      setIsPublished(shop.is_published)
      setPartnerUsers(data.partners || [])
    } catch {
      setError('読み込みに失敗しました')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchPartner()
  }, [fetchPartner])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      setError('ショップ名は必須です')
      return
    }

    setSaving(true)
    setError('')

    try {
      const res = await fetch(`/api/admin/partners/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          slug: slug.trim(),
          description: description || null,
          contact_email: contactEmail || null,
          commission_rate: Number(commissionRate),
          status,
          is_published: isPublished,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || '更新に失敗しました')
      }

      router.push('/admin/partners')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : '更新に失敗しました')
    } finally {
      setSaving(false)
    }
  }

  const handleSuspend = async () => {
    if (!confirm('このパートナーを停止してもよろしいですか？ショップは非公開になります。')) return

    setSaving(true)
    setError('')

    try {
      const res = await fetch(`/api/admin/partners/${id}`, {
        method: 'DELETE',
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || '停止に失敗しました')
      }

      router.push('/admin/partners')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : '停止に失敗しました')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="p-12 text-center text-gray-400">読み込み中...</div>
  }

  return (
    <div>
      <Link
        href="/admin/partners"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 mb-4 transition-colors"
      >
        <ArrowLeft size={16} />
        パートナー一覧に戻る
      </Link>

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-900">パートナー編集</h1>
        {status === 'active' && (
          <button
            onClick={handleSuspend}
            disabled={saving}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded hover:bg-red-100 transition-colors disabled:opacity-50"
          >
            <Trash2 size={15} />
            停止する
          </button>
        )}
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-red-50 text-red-700 text-sm mb-6">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ショップ名 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">スラッグ</label>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent font-mono"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">説明</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">連絡先メール</label>
            <input
              type="email"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">手数料率（%）</label>
              <div className="relative">
                <input
                  type="number"
                  value={commissionRate}
                  onChange={(e) => setCommissionRate(e.target.value)}
                  min="0"
                  max="100"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">
                  %
                </span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ステータス</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as 'active' | 'suspended')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              >
                <option value="active">有効</option>
                <option value="suspended">停止中</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-gray-700">公開する</label>
            <button
              type="button"
              onClick={() => setIsPublished(!isPublished)}
              className="inline-flex items-center gap-2 cursor-pointer"
            >
              <div
                className={`relative w-10 h-5 rounded-full transition-colors ${
                  isPublished ? 'bg-member' : 'bg-gray-300'
                }`}
              >
                <div
                  className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                    isPublished ? 'translate-x-5' : 'translate-x-0.5'
                  }`}
                />
              </div>
              <span
                className={`text-xs font-medium ${
                  isPublished ? 'text-member' : 'text-gray-500'
                }`}
              >
                {isPublished ? '公開' : '非公開'}
              </span>
            </button>
          </div>
        </div>

        {/* Partner Users */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-sm font-semibold text-gray-900 mb-3">パートナーユーザー</h2>
          {partnerUsers.length > 0 ? (
            <div className="space-y-2">
              {partnerUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {user.name || '名前未設定'}
                    </p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-member/10 text-member font-medium">
                    パートナー
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400">
              このショップに紐づくパートナーユーザーはいません
            </p>
          )}
        </div>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
          >
            {saving && <Loader2 size={16} className="animate-spin" />}
            保存する
          </button>
          <Link
            href="/admin/partners"
            className="px-6 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
          >
            キャンセル
          </Link>
        </div>
      </form>
    </div>
  )
}
