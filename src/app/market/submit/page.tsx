'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { DIGITAL_ITEM_CATEGORIES } from '@/lib/types'
import type { User } from '@supabase/supabase-js'

export default function MarketSubmitPage() {
  const router = useRouter()
  const supabase = createClient()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [totalSupply, setTotalSupply] = useState('')
  const [category, setCategory] = useState<string>('collectible')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth/login?redirect=/market/submit')
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setSubmitting(true)
    setError('')

    try {
      let imageUrl: string | null = null

      // Upload image if provided
      if (imageFile) {
        const ext = imageFile.name.split('.').pop()
        const fileName = `market/${user.id}/${Date.now()}.${ext}`
        const { error: uploadError } = await supabase.storage
          .from('images')
          .upload(fileName, imageFile)

        if (uploadError) throw new Error('画像のアップロードに失敗しました')

        const { data: { publicUrl } } = supabase.storage
          .from('images')
          .getPublicUrl(fileName)

        imageUrl = publicUrl
      }

      // Submit via API
      const res = await fetch('/api/market', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          description: description || null,
          price: Number(price),
          total_supply: Number(totalSupply),
          item_category: category,
          image_url: imageUrl,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || '出品に失敗しました')
      }

      setSuccess(true)
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

  if (success) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <div className="bg-green-50 border border-green-200 rounded-xl p-8">
          <h2 className="text-lg font-bold text-green-800 mb-2">出品が完了しました</h2>
          <p className="text-sm text-green-600 mb-6">審査後にマーケットプレイスに掲載されます。</p>
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={() => {
                setSuccess(false)
                setName('')
                setDescription('')
                setPrice('')
                setTotalSupply('')
                setCategory('collectible')
                setImageFile(null)
                setImagePreview(null)
              }}
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              続けて出品する
            </button>
            <button
              onClick={() => router.push('/market')}
              className="text-sm bg-gray-900 text-white px-6 py-2 rounded-full hover:bg-gray-800"
            >
              マーケットへ戻る
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">アイテムを出品する</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Image */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">画像</label>
          <div className="flex items-start gap-4">
            {imagePreview ? (
              <div className="w-32 h-32 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                <img src={imagePreview} alt="preview" className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="w-32 h-32 rounded-xl bg-gray-100 flex items-center justify-center text-gray-300 flex-shrink-0">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            )}
            <div>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="text-sm text-gray-600"
              />
              <p className="text-xs text-gray-400 mt-1">推奨: 1:1の正方形画像</p>
            </div>
          </div>
        </div>

        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">アイテム名 *</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            maxLength={100}
            className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10"
            placeholder="アイテム名を入力"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">説明</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            maxLength={2000}
            className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10 resize-none"
            placeholder="アイテムの説明を入力（任意）"
          />
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">カテゴリ *</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10"
          >
            {Object.entries(DIGITAL_ITEM_CATEGORIES).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
        </div>

        {/* Price */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">価格（円） *</label>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
            min={100}
            max={1000000}
            className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10"
            placeholder="500"
          />
        </div>

        {/* Total Supply */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">発行数 *</label>
          <input
            type="number"
            value={totalSupply}
            onChange={(e) => setTotalSupply(e.target.value)}
            required
            min={1}
            max={10000}
            className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10"
            placeholder="100"
          />
          <p className="text-xs text-gray-400 mt-1">一度設定すると変更できません</p>
        </div>

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
          {submitting ? '出品中...' : '出品する'}
        </button>

        <p className="text-xs text-gray-400 text-center">
          出品後、管理者の審査を経てマーケットプレイスに掲載されます。
        </p>
      </form>
    </div>
  )
}
