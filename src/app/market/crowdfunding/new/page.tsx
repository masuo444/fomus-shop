'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Plus, Trash2 } from 'lucide-react'
import type { User } from '@supabase/supabase-js'

interface TierInput {
  title: string
  description: string
  amount: string
  max_backers: string
}

export default function NewCrowdfundingPage() {
  const router = useRouter()
  const supabase = createClient()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [goalAmount, setGoalAmount] = useState('')
  const [deadline, setDeadline] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  // Bank info
  const [bankName, setBankName] = useState('')
  const [branchName, setBranchName] = useState('')
  const [accountType, setAccountType] = useState('ordinary')
  const [accountNumber, setAccountNumber] = useState('')
  const [accountHolder, setAccountHolder] = useState('')

  // Tiers
  const [tiers, setTiers] = useState<TierInput[]>([
    { title: '', description: '', amount: '', max_backers: '' },
  ])

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth/login?redirect=/market/crowdfunding/new')
        return
      }
      setUser(user)
      setLoading(false)
    }
    checkAuth()
  }, [])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImageFile(file)
    const reader = new FileReader()
    reader.onloadend = () => setImagePreview(reader.result as string)
    reader.readAsDataURL(file)
  }

  const addTier = () => {
    setTiers([...tiers, { title: '', description: '', amount: '', max_backers: '' }])
  }

  const removeTier = (index: number) => {
    if (tiers.length <= 1) return
    setTiers(tiers.filter((_, i) => i !== index))
  }

  const updateTier = (index: number, field: keyof TierInput, value: string) => {
    const updated = [...tiers]
    updated[index] = { ...updated[index], [field]: value }
    setTiers(updated)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    // Validate tiers
    for (const tier of tiers) {
      if (!tier.title || !tier.amount) {
        setError('すべてのリターンにタイトルと金額を入力してください')
        return
      }
      if (Number(tier.amount) < 100) {
        setError('リターンの金額は¥100以上にしてください')
        return
      }
    }

    setSubmitting(true)
    setError('')

    try {
      let imageUrl: string | null = null

      if (imageFile) {
        const ext = imageFile.name.split('.').pop()
        const fileName = `crowdfunding/${user.id}/${Date.now()}.${ext}`
        const { error: uploadError } = await supabase.storage
          .from('images')
          .upload(fileName, imageFile)

        if (uploadError) throw new Error('画像のアップロードに失敗しました')

        const { data: { publicUrl } } = supabase.storage
          .from('images')
          .getPublicUrl(fileName)

        imageUrl = publicUrl
      }

      const res = await fetch('/api/crowdfunding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description: description || null,
          image_url: imageUrl,
          goal_amount: Number(goalAmount),
          deadline,
          bank_name: bankName,
          branch_name: branchName,
          account_type: accountType,
          account_number: accountNumber,
          account_holder: accountHolder,
          tiers: tiers.map((t) => ({
            title: t.title,
            description: t.description || null,
            amount: Number(t.amount),
            max_backers: t.max_backers ? Number(t.max_backers) : null,
          })),
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || '作成に失敗しました')
      }

      router.push('/market/crowdfunding?submitted=true')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <p className="text-gray-400">読み込み中...</p>
      </div>
    )
  }

  // Min deadline: tomorrow. Max: 30 days from now
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const maxDate = new Date()
  maxDate.setDate(maxDate.getDate() + 30)

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">プロジェクトを作成</h1>
      <p className="text-sm text-gray-500 mb-8">クラウドファンディングで夢を実現しよう</p>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Project Info */}
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">プロジェクト情報</h2>
          <div className="space-y-4">
            {/* Image */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">カバー画像</label>
              <div className="flex items-start gap-4">
                {imagePreview ? (
                  <div className="w-40 h-24 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                    <img src={imagePreview} alt="preview" className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="w-40 h-24 rounded-xl bg-gray-100 flex items-center justify-center text-gray-300 flex-shrink-0">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
                <div>
                  <input type="file" accept="image/*" onChange={handleImageChange} className="text-sm text-gray-600" />
                  <p className="text-xs text-gray-400 mt-1">推奨: 16:9の横長画像</p>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">プロジェクト名 *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                maxLength={100}
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10"
                placeholder="プロジェクトのタイトル"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">説明</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={6}
                maxLength={5000}
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10 resize-none"
                placeholder="プロジェクトの詳しい説明"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">目標金額（円） *</label>
                <input
                  type="number"
                  value={goalAmount}
                  onChange={(e) => setGoalAmount(e.target.value)}
                  required
                  min={1000}
                  max={100000000}
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10"
                  placeholder="100000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">締切日 *</label>
                <input
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  required
                  min={tomorrow.toISOString().split('T')[0]}
                  max={maxDate.toISOString().split('T')[0]}
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Tiers */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">リターン</h2>
            <button
              type="button"
              onClick={addTier}
              className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900"
            >
              <Plus size={16} />
              追加
            </button>
          </div>

          <div className="space-y-4">
            {tiers.map((tier, i) => (
              <div key={i} className="border border-gray-200 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-medium text-gray-400">リターン {i + 1}</span>
                  {tiers.length > 1 && (
                    <button type="button" onClick={() => removeTier(i)} className="text-gray-400 hover:text-red-500">
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      value={tier.title}
                      onChange={(e) => updateTier(i, 'title', e.target.value)}
                      placeholder="リターン名 *"
                      required
                      className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10"
                    />
                    <input
                      type="number"
                      value={tier.amount}
                      onChange={(e) => updateTier(i, 'amount', e.target.value)}
                      placeholder="金額（円） *"
                      required
                      min={100}
                      className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10"
                    />
                  </div>
                  <input
                    type="text"
                    value={tier.description}
                    onChange={(e) => updateTier(i, 'description', e.target.value)}
                    placeholder="リターンの説明（任意）"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10"
                  />
                  <input
                    type="number"
                    value={tier.max_backers}
                    onChange={(e) => updateTier(i, 'max_backers', e.target.value)}
                    placeholder="上限人数（空欄で無制限）"
                    min={1}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10"
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Bank Info */}
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">振込先口座</h2>
          <p className="text-xs text-gray-500 mb-4">目標達成時に支援金の90%が振り込まれます（プラットフォーム手数料10%）</p>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">銀行名 *</label>
                <input
                  type="text"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  required
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10"
                  placeholder="○○銀行"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">支店名 *</label>
                <input
                  type="text"
                  value={branchName}
                  onChange={(e) => setBranchName(e.target.value)}
                  required
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10"
                  placeholder="○○支店"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">口座種類</label>
                <select
                  value={accountType}
                  onChange={(e) => setAccountType(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10"
                >
                  <option value="ordinary">普通</option>
                  <option value="current">当座</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">口座番号 *</label>
                <input
                  type="text"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  required
                  maxLength={8}
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10"
                  placeholder="1234567"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">口座名義（カタカナ） *</label>
              <input
                type="text"
                value={accountHolder}
                onChange={(e) => setAccountHolder(e.target.value)}
                required
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10"
                placeholder="フォマス タロウ"
              />
            </div>
          </div>
        </section>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-gray-900 text-white py-3 rounded-full text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
        >
          {submitting ? '作成中...' : 'プロジェクトを申請する'}
        </button>

        <p className="text-xs text-gray-400 text-center">
          申請後、管理者の審査を経て公開されます。募集終了後、支援金の90%が振り込まれます。
        </p>
      </form>
    </div>
  )
}
