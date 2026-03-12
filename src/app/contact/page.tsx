'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Mail } from 'lucide-react'
import siteConfig from '@/site.config'

const subjects = [
  '商品について',
  '注文について',
  '返品・交換',
  '配送について',
  'オーダーメイド・コラボ相談',
  'その他',
]

function ContactContent() {
  const searchParams = useSearchParams()
  const prefillSubject = searchParams.get('subject')

  const [form, setForm] = useState({ name: '', email: '', subject: subjects[0], message: '' })

  useEffect(() => {
    if (prefillSubject) {
      // If it matches a subject, select it; otherwise use it as message prefix
      const matched = subjects.find(s => s === prefillSubject)
      if (matched) {
        setForm(f => ({ ...f, subject: matched }))
      } else {
        setForm(f => ({ ...f, subject: '商品について', message: `${prefillSubject}\n\n` }))
      }
    }
  }, [prefillSubject])
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || '送信に失敗しました')
      }
      setSent(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : '送信に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <div className="max-w-lg mx-auto px-4 py-24 text-center">
        <Mail className="w-12 h-12 text-green-500 mx-auto mb-4" />
        <h1 className="text-xl font-bold text-gray-900 mb-2">送信完了</h1>
        <p className="text-sm text-gray-500">お問い合わせを受け付けました。2営業日以内にご返信いたします。</p>
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">お問い合わせ</h1>
      <p className="text-sm text-gray-500 mb-8">ご質問・ご要望がございましたら、お気軽にお問い合わせください。</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm text-gray-600 mb-1">お名前 *</label>
          <input type="text" required value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black" />
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">メールアドレス *</label>
          <input type="email" required value={form.email} onChange={(e) => setForm({...form, email: e.target.value})} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black" />
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">お問い合わせ種別</label>
          <select value={form.subject} onChange={(e) => setForm({...form, subject: e.target.value})} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black bg-white">
            {subjects.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">お問い合わせ内容 *</label>
          <textarea required value={form.message} onChange={(e) => setForm({...form, message: e.target.value})} rows={5} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black resize-none" />
        </div>
        {error && <p className="text-sm text-red-500">{error}</p>}
        <button type="submit" disabled={loading} className="w-full bg-black text-white py-3 rounded-full text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-50">
          {loading ? '送信中...' : '送信する'}
        </button>
      </form>
    </div>
  )
}

export default function ContactPage() {
  return (
    <Suspense fallback={<div className="max-w-lg mx-auto px-4 py-16 text-center"><div className="animate-pulse text-gray-400">読み込み中...</div></div>}>
      <ContactContent />
    </Suspense>
  )
}
