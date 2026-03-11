'use client'

import { useState, useEffect } from 'react'
import { Settings, Loader2, Save } from 'lucide-react'

interface ShopSettings {
  name: string
  description: string
  logo_url: string
  cover_url: string
  contact_email: string
}

export default function PartnerSettingsPage() {
  const [settings, setSettings] = useState<ShopSettings>({
    name: '',
    description: '',
    logo_url: '',
    cover_url: '',
    contact_email: '',
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/partner/settings')
      if (res.ok) {
        const data = await res.json()
        setSettings({
          name: data.name ?? '',
          description: data.description ?? '',
          logo_url: data.logo_url ?? '',
          cover_url: data.cover_url ?? '',
          contact_email: data.contact_email ?? '',
        })
      }
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    setMessage(null)
    try {
      const res = await fetch('/api/partner/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      })
      if (res.ok) {
        setMessage({ type: 'success', text: '設定を保存しました' })
      } else {
        setMessage({ type: 'error', text: '保存に失敗しました' })
      }
    } catch {
      setMessage({ type: 'error', text: '保存に失敗しました' })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="p-12 text-center">
        <Loader2 size={24} className="animate-spin mx-auto text-gray-400" />
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">設定</h1>
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-member text-white text-sm font-medium rounded hover:opacity-90 transition-colors disabled:opacity-50"
        >
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          保存
        </button>
      </div>

      {message && (
        <div
          className={`mb-6 px-4 py-3 rounded-lg text-sm ${
            message.type === 'success'
              ? 'bg-green-50 text-green-700 border border-green-200'
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
        {/* Shop Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">ショップ名</label>
          <input
            type="text"
            value={settings.name}
            onChange={(e) => setSettings({ ...settings, name: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-member focus:border-member"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">ショップ説明</label>
          <textarea
            value={settings.description}
            onChange={(e) => setSettings({ ...settings, description: e.target.value })}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-member focus:border-member resize-none"
          />
        </div>

        {/* Logo URL */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">ロゴURL</label>
          <input
            type="text"
            value={settings.logo_url}
            onChange={(e) => setSettings({ ...settings, logo_url: e.target.value })}
            placeholder="https://..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-member focus:border-member"
          />
          {settings.logo_url && (
            <img
              src={settings.logo_url}
              alt="ロゴプレビュー"
              className="mt-2 w-20 h-20 rounded-lg object-cover bg-gray-100"
            />
          )}
        </div>

        {/* Cover URL */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">カバー画像URL</label>
          <input
            type="text"
            value={settings.cover_url}
            onChange={(e) => setSettings({ ...settings, cover_url: e.target.value })}
            placeholder="https://..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-member focus:border-member"
          />
          {settings.cover_url && (
            <img
              src={settings.cover_url}
              alt="カバープレビュー"
              className="mt-2 w-full max-w-md h-32 rounded-lg object-cover bg-gray-100"
            />
          )}
        </div>

        {/* Contact Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">連絡先メールアドレス</label>
          <input
            type="email"
            value={settings.contact_email}
            onChange={(e) => setSettings({ ...settings, contact_email: e.target.value })}
            placeholder="shop@example.com"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-member focus:border-member"
          />
        </div>
      </div>
    </div>
  )
}
