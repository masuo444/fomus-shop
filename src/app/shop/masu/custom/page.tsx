'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChevronLeft, Send, CheckCircle } from 'lucide-react'

const masuSizes = [
  '三勺枡（54ml）',
  '五勺枡（100ml）',
  '八勺枡（144ml）',
  '一合枡（180ml）',
  '二合半枡（450ml）',
  '五合枡（900ml）',
  '一升枡（1800ml）',
  'サイズ相談したい',
]

const purposes = [
  '個人ギフト（結婚・出産・新築祝い等）',
  '企業ノベルティ・記念品',
  '飲食店用（日本酒・ドリンク）',
  'イベント・鏡開き',
  'インテリア・小物入れ',
  'アート・コラボレーション',
  'その他',
]

export default function CustomOrderPage() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    size: '',
    quantity: '',
    purpose: '',
    engravingType: 'laser',
    engravingText: '',
    deadline: '',
    message: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')

    try {
      const res = await fetch('/api/contact/custom-masu', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || '送信に失敗しました')
      }

      setSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'エラーが発生しました')
    } finally {
      setSubmitting(false)
    }
  }

  if (success) {
    return (
      <div className="max-w-lg mx-auto px-4 py-24 text-center">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-6" />
        <h1 className="text-2xl font-bold text-[var(--foreground)] mb-2">
          お問い合わせを受け付けました
        </h1>
        <p className="text-sm text-[var(--color-muted)] mb-2">
          内容を確認し、担当者よりご連絡いたします。
        </p>
        <p className="text-sm text-[var(--color-muted)] mb-8">
          通常1〜3営業日以内にお返事いたします。
        </p>
        <div className="space-y-3">
          <Link href="/shop/masu" className="block w-full btn-primary text-center">
            枡のページに戻る
          </Link>
          <Link href="/shop" className="block text-sm text-[var(--color-muted)] hover:text-[var(--foreground)] transition-colors">
            商品一覧を見る
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <Link
        href="/shop/masu"
        className="inline-flex items-center gap-1 text-sm text-[var(--color-muted)] hover:text-[var(--foreground)] mb-8 transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
        枡のページに戻る
      </Link>

      <h1 className="font-display text-3xl md:text-4xl font-light text-[var(--foreground)] mb-3">
        名入れ・オーダーメイド枡
      </h1>
      <p className="text-sm text-[var(--color-muted)] mb-10">
        ご要望をお聞かせください。内容を確認し、お見積りとともにご連絡いたします。
      </p>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Contact Info */}
        <div>
          <h2 className="text-xs tracking-[0.15em] uppercase text-[var(--color-muted)] mb-5">お客様情報</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-[var(--foreground)] mb-1.5">お名前 *</label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full border border-[var(--color-border)] bg-transparent px-4 py-3 text-sm focus:outline-none focus:border-[var(--foreground)] transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm text-[var(--foreground)] mb-1.5">会社名・団体名</label>
              <input
                type="text"
                value={form.company}
                onChange={(e) => setForm({ ...form, company: e.target.value })}
                className="w-full border border-[var(--color-border)] bg-transparent px-4 py-3 text-sm focus:outline-none focus:border-[var(--foreground)] transition-colors"
                placeholder="任意"
              />
            </div>
            <div>
              <label className="block text-sm text-[var(--foreground)] mb-1.5">メールアドレス *</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full border border-[var(--color-border)] bg-transparent px-4 py-3 text-sm focus:outline-none focus:border-[var(--foreground)] transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm text-[var(--foreground)] mb-1.5">電話番号</label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full border border-[var(--color-border)] bg-transparent px-4 py-3 text-sm focus:outline-none focus:border-[var(--foreground)] transition-colors"
                placeholder="任意"
              />
            </div>
          </div>
        </div>

        <div className="divider" />

        {/* Order Details */}
        <div>
          <h2 className="text-xs tracking-[0.15em] uppercase text-[var(--color-muted)] mb-5">枡のご希望</h2>
          <div className="space-y-5">
            <div>
              <label className="block text-sm text-[var(--foreground)] mb-1.5">枡のサイズ *</label>
              <select
                required
                value={form.size}
                onChange={(e) => setForm({ ...form, size: e.target.value })}
                className="w-full border border-[var(--color-border)] bg-transparent px-4 py-3 text-sm focus:outline-none focus:border-[var(--foreground)] transition-colors"
              >
                <option value="">選択してください</option>
                {masuSizes.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-[var(--foreground)] mb-1.5">数量 *</label>
                <input
                  type="text"
                  required
                  value={form.quantity}
                  onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                  className="w-full border border-[var(--color-border)] bg-transparent px-4 py-3 text-sm focus:outline-none focus:border-[var(--foreground)] transition-colors"
                  placeholder="例: 50個"
                />
              </div>
              <div>
                <label className="block text-sm text-[var(--foreground)] mb-1.5">ご希望納期</label>
                <input
                  type="text"
                  value={form.deadline}
                  onChange={(e) => setForm({ ...form, deadline: e.target.value })}
                  className="w-full border border-[var(--color-border)] bg-transparent px-4 py-3 text-sm focus:outline-none focus:border-[var(--foreground)] transition-colors"
                  placeholder="例: 2026年5月末まで"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-[var(--foreground)] mb-1.5">用途 *</label>
              <select
                required
                value={form.purpose}
                onChange={(e) => setForm({ ...form, purpose: e.target.value })}
                className="w-full border border-[var(--color-border)] bg-transparent px-4 py-3 text-sm focus:outline-none focus:border-[var(--foreground)] transition-colors"
              >
                <option value="">選択してください</option>
                {purposes.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="divider" />

        {/* Engraving */}
        <div>
          <h2 className="text-xs tracking-[0.15em] uppercase text-[var(--color-muted)] mb-5">名入れ・刻印</h2>
          <div className="space-y-5">
            <div>
              <label className="block text-sm text-[var(--foreground)] mb-3">刻印方法</label>
              <div className="flex gap-6">
                {[
                  { value: 'laser', label: 'レーザー刻印' },
                  { value: 'branding', label: '焼印' },
                  { value: 'undecided', label: '相談したい' },
                ].map((opt) => (
                  <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="engravingType"
                      value={opt.value}
                      checked={form.engravingType === opt.value}
                      onChange={(e) => setForm({ ...form, engravingType: e.target.value })}
                      className="accent-[var(--foreground)]"
                    />
                    <span className="text-sm text-[var(--foreground)]">{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm text-[var(--foreground)] mb-1.5">刻印内容</label>
              <input
                type="text"
                value={form.engravingText}
                onChange={(e) => setForm({ ...form, engravingText: e.target.value })}
                className="w-full border border-[var(--color-border)] bg-transparent px-4 py-3 text-sm focus:outline-none focus:border-[var(--foreground)] transition-colors"
                placeholder="お名前、ロゴ、日付、メッセージなど"
              />
            </div>
          </div>
        </div>

        <div className="divider" />

        {/* Message */}
        <div>
          <label className="block text-sm text-[var(--foreground)] mb-1.5">その他ご要望</label>
          <textarea
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
            rows={4}
            className="w-full border border-[var(--color-border)] bg-transparent px-4 py-3 text-sm focus:outline-none focus:border-[var(--foreground)] transition-colors resize-none"
            placeholder="デザインのイメージ、参考画像、その他ご質問など"
          />
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-5 py-3 rounded-lg">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full btn-primary flex items-center justify-center gap-2 py-4 disabled:opacity-50"
        >
          {submitting ? (
            '送信中...'
          ) : (
            <>
              <Send className="w-4 h-4" />
              お見積り・ご相談を送信
            </>
          )}
        </button>

        <p className="text-[10px] text-[var(--color-muted)] text-center">
          通常1〜3営業日以内にご返信いたします
        </p>
      </form>
    </div>
  )
}
