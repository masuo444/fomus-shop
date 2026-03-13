'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { DigitalItem } from '@/lib/types'
import { Loader2, Trash2 } from 'lucide-react'

interface DigitalItemFormProps {
  item?: DigitalItem
  shopId: string
  apiBasePath?: string
  redirectBasePath?: string
}

export default function DigitalItemForm({ item, shopId, apiBasePath = '/api/admin', redirectBasePath = '/admin' }: DigitalItemFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    name: item?.name ?? '',
    description: item?.description ?? '',
    image_url: item?.image_url ?? '',
    price: item?.price ?? 0,
    total_supply: item?.total_supply ?? 100,
    royalty_percentage: item?.royalty_percentage ?? 10,
    resale_enabled: item?.resale_enabled ?? true,
    is_published: item?.is_published ?? false,
    secret_content: item?.secret_content ?? '',
    metadata: item?.metadata ? JSON.stringify(item.metadata, null, 2) : '{}',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    let metadata: Record<string, unknown> = {}
    try {
      metadata = JSON.parse(form.metadata)
    } catch {
      setError('メタデータのJSON形式が正しくありません')
      setLoading(false)
      return
    }

    const body = {
      shop_id: shopId,
      name: form.name,
      description: form.description || null,
      image_url: form.image_url || null,
      price: Number(form.price),
      total_supply: Number(form.total_supply),
      royalty_percentage: Number(form.royalty_percentage),
      resale_enabled: form.resale_enabled,
      is_published: form.is_published,
      secret_content: form.secret_content || null,
      metadata,
    }

    try {
      const url = item
        ? `${apiBasePath}/digital/${item.id}`
        : `${apiBasePath}/digital`
      const method = item ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || '保存に失敗しました')
      }

      router.push(`${redirectBasePath}/digital`)
      router.refresh()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : '保存に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!item) return
    if (!confirm('このデジタルアイテムを削除してもよろしいですか？')) return

    setDeleting(true)
    try {
      const res = await fetch(`${apiBasePath}/digital/${item.id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('削除に失敗しました')
      router.push(`${redirectBasePath}/digital`)
      router.refresh()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : '削除に失敗しました')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
      {error && (
        <div className="p-3 rounded-lg bg-red-50 text-red-700 text-sm">{error}</div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">アイテム名 *</label>
        <input
          type="text"
          required
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">説明</label>
        <textarea
          rows={4}
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">画像URL</label>
        <input
          type="url"
          value={form.image_url}
          onChange={(e) => setForm({ ...form, image_url: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
          placeholder="https://example.com/image.jpg"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">価格 (円) *</label>
          <input
            type="number"
            required
            min={0}
            value={form.price}
            onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">供給数 *</label>
          <input
            type="number"
            required
            min={1}
            value={form.total_supply}
            onChange={(e) => setForm({ ...form, total_supply: Number(e.target.value) })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          ロイヤリティ (%) - リセール時にショップに入る割合
        </label>
        <input
          type="number"
          min={0}
          max={100}
          step={0.1}
          value={form.royalty_percentage}
          onChange={(e) => setForm({ ...form, royalty_percentage: Number(e.target.value) })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
        />
      </div>

      <div className="space-y-3">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={form.resale_enabled}
            onChange={(e) => setForm({ ...form, resale_enabled: e.target.checked })}
            className="rounded text-gray-900 focus:ring-gray-900"
          />
          <span className="text-sm font-medium text-gray-700">リセールを許可する</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={form.is_published}
            onChange={(e) => setForm({ ...form, is_published: e.target.checked })}
            className="rounded text-gray-900 focus:ring-gray-900"
          />
          <span className="text-sm font-medium text-gray-700">公開する</span>
        </label>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          購入者限定コンテンツ
        </label>
        <textarea
          rows={3}
          value={form.secret_content}
          onChange={(e) => setForm({ ...form, secret_content: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
          placeholder="購入後に表示されるパスワード、URL、メッセージなど"
        />
        <p className="text-xs text-gray-400 mt-1">購入者のマイページにのみ表示されます（公開ページには表示されません）</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          メタデータ (JSON)
        </label>
        <textarea
          rows={5}
          value={form.metadata}
          onChange={(e) => setForm({ ...form, metadata: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
          placeholder='{ "event_date": "2026-04-01", "venue": "東京ドーム" }'
        />
        <p className="text-xs text-gray-400 mt-1">イベント日時、会場、その他の情報をJSON形式で入力</p>
      </div>

      <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
        >
          {loading && <Loader2 size={16} className="animate-spin" />}
          {item ? '更新する' : '作成する'}
        </button>
        <button
          type="button"
          onClick={() => router.push('/admin/digital')}
          className="px-5 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
        >
          キャンセル
        </button>
        {item && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="ml-auto inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
          >
            {deleting ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
            削除
          </button>
        )}
      </div>
    </form>
  )
}
