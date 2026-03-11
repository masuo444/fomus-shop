'use client'

import { useEffect, useState } from 'react'
import { Loader2, CheckCircle } from 'lucide-react'

interface ShopSettings {
  id: string
  name: string
  description: string
  logo_url: string
  royalty_percentage: number
}

export default function AdminSettingsPage() {
  const [shop, setShop] = useState<ShopSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    name: '',
    description: '',
    logo_url: '',
    royalty_percentage: 10,
    shipping_fee: 500,
    invoice_registration_number: '',
  })

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    setLoading(true)
    const res = await fetch('/api/admin/settings')
    if (res.ok) {
      const data = await res.json()
      setShop(data.shop)
      setForm({
        name: data.shop?.name ?? '',
        description: data.shop?.description ?? '',
        logo_url: data.shop?.logo_url ?? '',
        royalty_percentage: data.shop?.royalty_percentage ?? 10,
        shipping_fee: data.shipping_fee ?? 500,
        invoice_registration_number: data.shop?.invoice_registration_number ?? '',
      })
    }
    setLoading(false)
  }

  const handleSave = async () => {
    setSaving(true)
    setError('')
    setSaved(false)
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || '保存に失敗しました')
      }
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : '保存に失敗しました')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={24} className="animate-spin text-gray-400" />
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">設定</h1>

      <div className="max-w-2xl space-y-8">
        {error && (
          <div className="p-3 rounded-lg bg-red-50 text-red-700 text-sm">{error}</div>
        )}
        {saved && (
          <div className="p-3 rounded-lg bg-green-50 text-green-700 text-sm flex items-center gap-2">
            <CheckCircle size={16} />
            設定を保存しました
          </div>
        )}

        {/* Shop Info */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">ショップ情報</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ショップ名</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">説明</label>
              <textarea
                rows={3}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ロゴURL</label>
              <input
                type="url"
                value={form.logo_url}
                onChange={(e) => setForm({ ...form, logo_url: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                placeholder="https://example.com/logo.png"
              />
              {form.logo_url && (
                <img
                  src={form.logo_url}
                  alt="ロゴプレビュー"
                  className="mt-2 w-20 h-20 object-contain rounded-lg border border-gray-200"
                />
              )}
            </div>
          </div>
        </div>

        {/* Stripe */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Stripe決済</h2>
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ? 'bg-green-500' : 'bg-gray-300'}`} />
            <span className="text-sm text-gray-700">
              {process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ? 'Stripe接続済み' : 'Stripe未接続'}
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-2">
            Stripeの設定は環境変数で管理されています
          </p>
        </div>

        {/* Invoice (適格請求書) */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">インボイス制度</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                適格請求書発行事業者登録番号
              </label>
              <input
                type="text"
                value={form.invoice_registration_number}
                onChange={(e) => setForm({ ...form, invoice_registration_number: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent font-mono"
                placeholder="T1234567890123"
              />
              <p className="text-xs text-gray-400 mt-1">
                T + 13桁の数字（例: T1234567890123）。Stripeインボイスに自動で記載されます。
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-600">
                登録番号を設定すると、Stripe Invoicingにより決済完了時にインボイスが自動発行されます。
                未設定の場合、インボイスは発行されません。
              </p>
            </div>
          </div>
        </div>

        {/* Shipping & Royalty */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">配送 / ロイヤリティ</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">デフォルト送料 (円)</label>
              <input
                type="number"
                min={0}
                value={form.shipping_fee}
                onChange={(e) => setForm({ ...form, shipping_fee: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">デフォルトロイヤリティ (%)</label>
              <input
                type="number"
                min={0}
                max={100}
                step={0.1}
                value={form.royalty_percentage}
                onChange={(e) => setForm({ ...form, royalty_percentage: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              />
              <p className="text-xs text-gray-400 mt-1">デジタルアイテムのリセール時にショップに入るデフォルトの割合</p>
            </div>
          </div>
        </div>

        <div className="pt-2">
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
          >
            {saving && <Loader2 size={16} className="animate-spin" />}
            設定を保存
          </button>
        </div>
      </div>
    </div>
  )
}
