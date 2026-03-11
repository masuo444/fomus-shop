'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Product, Category, ShippingMethod, ProductOption } from '@/lib/types'
import { formatPrice } from '@/lib/utils'
import { Loader2, Plus, X, ChevronDown, ChevronUp } from 'lucide-react'
import ImageUploader from '@/components/admin/ImageUploader'

interface OptionFormData {
  id?: string
  name: string
  required: boolean
  sort_order: number
  choices: ChoiceFormData[]
}

interface ChoiceFormData {
  id?: string
  label: string
  price_adjustment: number
  stock: number | null
  sort_order: number
}

interface ProductFormProps {
  product?: Product
  categories: Category[]
  shippingMethods: ShippingMethod[]
  shopId: string
  apiBasePath?: string
  redirectBasePath?: string
}

export default function ProductForm({
  product,
  categories,
  shippingMethods,
  shopId,
  apiBasePath = '/api/admin',
  redirectBasePath = '/admin',
}: ProductFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Basic fields
  const [name, setName] = useState(product?.name ?? '')
  const [description, setDescription] = useState(product?.description ?? '')
  const [price, setPrice] = useState(product?.price ?? 0)
  const [memberPrice, setMemberPrice] = useState<number | ''>(product?.member_price ?? '')
  const [priceEur, setPriceEur] = useState<number | ''>(product?.price_eur ?? '')
  const [memberPriceEur, setMemberPriceEur] = useState<number | ''>(product?.member_price_eur ?? '')
  const [compareAtPriceEur, setCompareAtPriceEur] = useState<number | ''>(product?.compare_at_price_eur ?? '')
  const [taxRate, setTaxRate] = useState(product?.tax_rate ?? 0.1)
  const [stock, setStock] = useState(product?.stock ?? 0)
  const [images, setImages] = useState<string[]>(product?.images ?? [''])
  const [categoryId, setCategoryId] = useState(product?.category_id ?? '')
  const [isPublished, setIsPublished] = useState(product?.is_published ?? false)
  const [sortToTop, setSortToTop] = useState(false)
  const [sortOrder, setSortOrder] = useState(product?.sort_order ?? 0)
  const [itemType, setItemType] = useState<'physical' | 'digital'>(product?.item_type ?? 'physical')
  const [quantityLimit, setQuantityLimit] = useState<number | ''>(product?.quantity_limit ?? '')

  // Preorder
  const [preorderEnabled, setPreorderEnabled] = useState(product?.preorder_enabled ?? false)
  const [preorderStartDate, setPreorderStartDate] = useState(product?.preorder_start_date ?? '')
  const [preorderEndDate, setPreorderEndDate] = useState(product?.preorder_end_date ?? '')

  // Shipping methods
  const [selectedShippingIds, setSelectedShippingIds] = useState<string[]>(
    product?.product_shipping_methods?.map((psm) => psm.shipping_method_id) ??
    shippingMethods.filter((m) => m.is_default).map((m) => m.id)
  )

  // Product options
  const [options, setOptions] = useState<OptionFormData[]>(
    product?.product_options?.map((opt) => ({
      id: opt.id,
      name: opt.name,
      required: opt.required,
      sort_order: opt.sort_order,
      choices: opt.choices?.map((c) => ({
        id: c.id,
        label: c.label,
        price_adjustment: c.price_adjustment,
        stock: c.stock,
        sort_order: c.sort_order,
      })) ?? [],
    })) ?? []
  )

  // New category form
  const [showNewCategory, setShowNewCategory] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState('')
  const [savingCategory, setSavingCategory] = useState(false)
  const [localCategories, setLocalCategories] = useState<Category[]>(categories)

  // AI description
  const [aiFeatures, setAiFeatures] = useState('')

  // Expanded sections
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    images: true,
    description: true,
    price: true,
    stock: true,
    display: true,
    category: true,
    shipping: true,
    preorder: false,
    options: false,
    quantity: false,
  })

  const toggleSection = (key: string) => {
    setExpandedSections((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  // Option management
  const addOption = () => {
    setOptions([
      ...options,
      { name: '', required: false, sort_order: options.length, choices: [] },
    ])
    setExpandedSections((prev) => ({ ...prev, options: true }))
  }

  const updateOption = (index: number, field: string, value: string | boolean | number) => {
    const newOptions = [...options]
    newOptions[index] = { ...newOptions[index], [field]: value }
    setOptions(newOptions)
  }

  const removeOption = (index: number) => {
    setOptions(options.filter((_, i) => i !== index))
  }

  const addChoice = (optionIndex: number) => {
    const newOptions = [...options]
    newOptions[optionIndex].choices.push({
      label: '',
      price_adjustment: 0,
      stock: null,
      sort_order: newOptions[optionIndex].choices.length,
    })
    setOptions(newOptions)
  }

  const updateChoice = (
    optionIndex: number,
    choiceIndex: number,
    field: string,
    value: string | number | null
  ) => {
    const newOptions = [...options]
    newOptions[optionIndex].choices[choiceIndex] = {
      ...newOptions[optionIndex].choices[choiceIndex],
      [field]: value,
    }
    setOptions(newOptions)
  }

  const removeChoice = (optionIndex: number, choiceIndex: number) => {
    const newOptions = [...options]
    newOptions[optionIndex].choices = newOptions[optionIndex].choices.filter(
      (_, i) => i !== choiceIndex
    )
    setOptions(newOptions)
  }

  // Shipping toggle
  const toggleShipping = (id: string) => {
    setSelectedShippingIds((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    )
  }

  // Save category
  const saveCategory = async () => {
    if (!newCategoryName.trim()) return
    setSavingCategory(true)
    try {
      const res = await fetch(`${apiBasePath}/categories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shop_id: shopId,
          name: newCategoryName.trim(),
          slug: newCategoryName.trim().toLowerCase().replace(/\s+/g, '-'),
        }),
      })
      if (res.ok) {
        const cat = await res.json()
        setLocalCategories([...localCategories, cat])
        setCategoryId(cat.id)
        setNewCategoryName('')
        setShowNewCategory(false)
      }
    } catch {
      // ignore
    } finally {
      setSavingCategory(false)
    }
  }

  // Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const filteredImages = images.map((u) => u.trim()).filter(Boolean)

    const body = {
      product: {
        shop_id: shopId,
        name,
        description: description || null,
        price: Number(price),
        member_price: memberPrice !== '' ? Number(memberPrice) : null,
        price_eur: priceEur !== '' ? Number(priceEur) : null,
        member_price_eur: memberPriceEur !== '' ? Number(memberPriceEur) : null,
        compare_at_price_eur: compareAtPriceEur !== '' ? Number(compareAtPriceEur) : null,
        tax_rate: Number(taxRate),
        stock: Number(stock),
        category_id: categoryId || null,
        images: filteredImages,
        item_type: itemType,
        is_published: isPublished,
        sort_order: sortToTop ? 0 : Number(sortOrder),
        quantity_limit: quantityLimit !== '' ? Number(quantityLimit) : null,
        preorder_enabled: preorderEnabled,
        preorder_start_date: preorderEnabled && preorderStartDate ? preorderStartDate : null,
        preorder_end_date: preorderEnabled && preorderEndDate ? preorderEndDate : null,
      },
      options: options
        .filter((o) => o.name.trim())
        .map((o, oi) => ({
          name: o.name,
          required: o.required,
          sort_order: oi,
          choices: o.choices
            .filter((c) => c.label.trim())
            .map((c, ci) => ({
              label: c.label,
              price_adjustment: Number(c.price_adjustment),
              stock: c.stock != null ? Number(c.stock) : null,
              sort_order: ci,
            })),
        })),
      shipping_method_ids: selectedShippingIds,
    }

    try {
      const url = product
        ? `${apiBasePath}/products/${product.id}`
        : `${apiBasePath}/products`
      const method = product ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || '保存に失敗しました')
      }

      router.push(`${redirectBasePath}/products`)
      router.refresh()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : '保存に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  // Section wrapper
  const Section = ({
    id,
    title,
    children,
    defaultOpen = true,
  }: {
    id: string
    title: string
    children: React.ReactNode
    defaultOpen?: boolean
  }) => {
    const isOpen = expandedSections[id] ?? defaultOpen
    return (
      <div className="bg-white rounded border border-gray-200">
        <button
          type="button"
          onClick={() => toggleSection(id)}
          className="w-full flex items-center justify-between px-5 py-4 text-left"
        >
          <h3 className="text-sm font-bold text-gray-900">{title}</h3>
          {isOpen ? (
            <ChevronUp size={16} className="text-gray-400" />
          ) : (
            <ChevronDown size={16} className="text-gray-400" />
          )}
        </button>
        {isOpen && <div className="px-5 pb-5 border-t border-gray-100 pt-4">{children}</div>}
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-4">
      {error && (
        <div className="p-3 rounded bg-red-50 text-red-700 text-sm border border-red-200">
          {error}
        </div>
      )}

      {/* 商品名 */}
      <div className="bg-white rounded border border-gray-200 px-5 py-4">
        <label className="block text-sm font-bold text-gray-900 mb-2">
          商品名 <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="商品名を入力"
          className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-member focus:border-member"
        />
      </div>

      {/* 商品画像 */}
      <Section id="images" title="商品画像">
        <ImageUploader
          images={images.filter(Boolean)}
          onImagesChange={(urls) => setImages(urls)}
        />
      </Section>

      {/* 商品説明 */}
      <Section id="description" title="商品説明">
        <textarea
          rows={6}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="サイズ・カラー・素材などのくわしい情報を入力することで、購入率がアップします。"
          className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-member focus:border-member"
        />
        <p className="text-xs text-gray-400 mt-1">
          サイズ・カラー・素材などのくわしい情報を入力することで、購入率がアップします。
        </p>

        {/* AI suggestion placeholder */}
        <div className="mt-4 p-4 bg-gray-50 rounded border border-gray-200">
          <p className="text-xs font-medium text-gray-700 mb-2">AIで説明文を作成</p>
          <div className="flex gap-2">
            <input
              type="text"
              value={aiFeatures}
              onChange={(e) => setAiFeatures(e.target.value)}
              placeholder="商品の特徴を入力"
              className="flex-1 px-3 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-member focus:border-member"
            />
            <button
              type="button"
              disabled
              className="px-3 py-1.5 bg-gray-200 text-gray-400 text-sm rounded cursor-not-allowed whitespace-nowrap"
            >
              説明文を提案してもらう
            </button>
          </div>
        </div>
      </Section>

      {/* 価格(税込) */}
      <Section id="price" title="価格（税込）">
        <div className="space-y-3">
          <div>
            <label className="block text-xs text-gray-600 mb-1">
              価格 <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                ¥
              </span>
              <input
                type="number"
                required
                min={0}
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-member focus:border-member"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">会員価格</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                ¥
              </span>
              <input
                type="number"
                min={0}
                value={memberPrice}
                onChange={(e) =>
                  setMemberPrice(e.target.value === '' ? '' : Number(e.target.value))
                }
                placeholder="設定なし"
                className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-member focus:border-member"
              />
            </div>
            <p className="text-xs text-gray-400 mt-1">空欄の場合は通常価格が適用されます</p>
          </div>
          {/* EUR Prices */}
          <div className="border-t border-gray-200 pt-3 mt-3">
            <p className="text-xs font-medium text-gray-700 mb-2">海外価格（EUR・セント単位）</p>
            <p className="text-xs text-gray-400 mb-3">海外ユーザー向けのユーロ価格。空欄の場合は海外販売対象外。例: €15.00 = 1500</p>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs text-gray-600 mb-1">EUR価格</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">€</span>
                  <input
                    type="number"
                    min={0}
                    value={priceEur}
                    onChange={(e) => setPriceEur(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="セント"
                    className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-member focus:border-member"
                  />
                </div>
                {priceEur !== '' && (
                  <p className="text-xs text-gray-400 mt-0.5">= €{(Number(priceEur) / 100).toFixed(2)}</p>
                )}
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">EUR会員価格</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">€</span>
                  <input
                    type="number"
                    min={0}
                    value={memberPriceEur}
                    onChange={(e) => setMemberPriceEur(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="セント"
                    className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-member focus:border-member"
                  />
                </div>
                {memberPriceEur !== '' && (
                  <p className="text-xs text-gray-400 mt-0.5">= €{(Number(memberPriceEur) / 100).toFixed(2)}</p>
                )}
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">EUR定価</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">€</span>
                  <input
                    type="number"
                    min={0}
                    value={compareAtPriceEur}
                    onChange={(e) => setCompareAtPriceEur(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="セント"
                    className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-member focus:border-member"
                  />
                </div>
                {compareAtPriceEur !== '' && (
                  <p className="text-xs text-gray-400 mt-0.5">= €{(Number(compareAtPriceEur) / 100).toFixed(2)}</p>
                )}
              </div>
            </div>
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">税率</label>
            <div className="flex gap-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="taxRate"
                  checked={taxRate === 0.1}
                  onChange={() => setTaxRate(0.1)}
                  className="accent-member"
                />
                <span className="text-sm">10%（標準税率）</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="taxRate"
                  checked={taxRate === 0.08}
                  onChange={() => setTaxRate(0.08)}
                  className="accent-member"
                />
                <span className="text-sm">8%（軽減税率）</span>
              </label>
            </div>
          </div>
        </div>
      </Section>

      {/* 在庫と種類 */}
      <Section id="stock" title="在庫と種類">
        <div className="space-y-3">
          <div>
            <label className="block text-xs text-gray-600 mb-1">
              在庫数 <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              min={0}
              value={stock}
              onChange={(e) => setStock(Number(e.target.value))}
              className="w-32 px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-member focus:border-member"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">商品タイプ</label>
            <div className="flex gap-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="itemType"
                  checked={itemType === 'physical'}
                  onChange={() => setItemType('physical')}
                  className="accent-member"
                />
                <span className="text-sm">物理商品</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="itemType"
                  checked={itemType === 'digital'}
                  onChange={() => setItemType('digital')}
                  className="accent-member"
                />
                <span className="text-sm">デジタル商品</span>
              </label>
            </div>
          </div>
        </div>
      </Section>

      {/* 表示と公開 */}
      <Section id="display" title="表示と公開">
        <div className="space-y-4">
          <div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={sortToTop}
                onChange={(e) => setSortToTop(e.target.checked)}
                className="rounded accent-member"
              />
              <span className="text-sm text-gray-700">商品一覧の先頭に追加する</span>
            </label>
            {!sortToTop && (
              <div className="mt-2 ml-6">
                <label className="block text-xs text-gray-600 mb-1">表示順</label>
                <input
                  type="number"
                  min={0}
                  value={sortOrder}
                  onChange={(e) => setSortOrder(Number(e.target.value))}
                  className="w-24 px-3 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-member focus:border-member"
                />
              </div>
            )}
          </div>
          <div>
            <p className="text-xs text-gray-600 mb-2">公開状態</p>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="publish"
                  checked={isPublished}
                  onChange={() => setIsPublished(true)}
                  className="accent-member"
                />
                <span className="text-sm text-gray-700">公開</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="publish"
                  checked={!isPublished}
                  onChange={() => setIsPublished(false)}
                  className="accent-member"
                />
                <span className="text-sm text-gray-700">非公開</span>
              </label>
            </div>
          </div>
        </div>
      </Section>

      {/* カテゴリ */}
      <Section id="category" title="カテゴリ">
        <div className="space-y-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="category"
              checked={categoryId === ''}
              onChange={() => setCategoryId('')}
              className="accent-member"
            />
            <span className="text-sm text-gray-700">カテゴリなし</span>
          </label>
          {localCategories.map((cat) => (
            <label key={cat.id} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="category"
                checked={categoryId === cat.id}
                onChange={() => setCategoryId(cat.id)}
                className="accent-member"
              />
              <span className="text-sm text-gray-700">{cat.name}</span>
            </label>
          ))}

          {showNewCategory ? (
            <div className="flex items-center gap-2 mt-2 ml-5">
              <input
                type="text"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="カテゴリ名"
                className="flex-1 px-3 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-member focus:border-member"
                autoFocus
              />
              <button
                type="button"
                onClick={saveCategory}
                disabled={savingCategory || !newCategoryName.trim()}
                className="px-3 py-1.5 bg-member text-white text-sm rounded hover:opacity-90 disabled:opacity-50 transition-colors"
              >
                {savingCategory ? '...' : '追加'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowNewCategory(false)
                  setNewCategoryName('')
                }}
                className="text-sm text-gray-400 hover:text-gray-600"
              >
                キャンセル
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowNewCategory(true)}
              className="text-sm text-member hover:underline mt-1"
            >
              + 新しくカテゴリを追加
            </button>
          )}
        </div>
      </Section>

      {/* 送料詳細 */}
      <Section id="shipping" title="送料詳細">
        {shippingMethods.length > 0 ? (
          <div className="space-y-2">
            {shippingMethods.map((method) => (
              <label key={method.id} className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedShippingIds.includes(method.id)}
                  onChange={() => toggleShipping(method.id)}
                  className="rounded accent-member"
                />
                <span className="text-sm text-gray-700">
                  {method.name}
                  {method.type === 'free'
                    ? '（送料無料）'
                    : method.type === 'flat'
                    ? ` ${formatPrice(method.flat_fee)}`
                    : ''}
                </span>
                {method.is_default && (
                  <span className="text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">
                    基本配送
                  </span>
                )}
              </label>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-400">
            配送方法が設定されていません。設定画面から配送方法を追加してください。
          </p>
        )}
      </Section>

      {/* 予約販売 */}
      <Section id="preorder" title="予約販売">
        <div className="space-y-3">
          <label className="flex items-center gap-2 cursor-pointer">
            <div
              onClick={() => setPreorderEnabled(!preorderEnabled)}
              className={`relative w-10 h-5 rounded-full transition-colors cursor-pointer ${
                preorderEnabled ? 'bg-member' : 'bg-gray-300'
              }`}
            >
              <div
                className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                  preorderEnabled ? 'translate-x-5' : 'translate-x-0.5'
                }`}
              />
            </div>
            <span className="text-sm text-gray-700">
              {preorderEnabled ? '予約販売を有効にする' : '予約販売を無効にする'}
            </span>
          </label>

          {preorderEnabled && (
            <div className="space-y-3 ml-12">
              <div>
                <label className="block text-xs text-gray-600 mb-1">発送開始予定日</label>
                <input
                  type="date"
                  value={preorderStartDate}
                  onChange={(e) => setPreorderStartDate(e.target.value)}
                  className="px-3 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-member focus:border-member"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">発送完了予定日</label>
                <input
                  type="date"
                  value={preorderEndDate}
                  onChange={(e) => setPreorderEndDate(e.target.value)}
                  className="px-3 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-member focus:border-member"
                />
              </div>
            </div>
          )}
        </div>
      </Section>

      {/* 商品オプション */}
      <Section id="options" title="商品オプション">
        <div className="space-y-4">
          {options.map((option, oi) => (
            <div key={oi} className="border border-gray-200 rounded p-4">
              <div className="flex items-center gap-2 mb-3">
                <input
                  type="text"
                  value={option.name}
                  onChange={(e) => updateOption(oi, 'name', e.target.value)}
                  placeholder="オプション名（例：サイズ、カラー）"
                  className="flex-1 px-3 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-member focus:border-member"
                />
                <label className="flex items-center gap-1.5 cursor-pointer text-xs text-gray-600">
                  <input
                    type="checkbox"
                    checked={option.required}
                    onChange={(e) => updateOption(oi, 'required', e.target.checked)}
                    className="rounded accent-member"
                  />
                  必須
                </label>
                <button
                  type="button"
                  onClick={() => removeOption(oi)}
                  className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Choices */}
              <div className="space-y-2 ml-4">
                {option.choices.map((choice, ci) => (
                  <div key={ci} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={choice.label}
                      onChange={(e) => updateChoice(oi, ci, 'label', e.target.value)}
                      placeholder="選択肢名"
                      className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-member focus:border-member"
                    />
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-gray-500">価格調整:</span>
                      <input
                        type="number"
                        value={choice.price_adjustment}
                        onChange={(e) =>
                          updateChoice(oi, ci, 'price_adjustment', Number(e.target.value))
                        }
                        className="w-20 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-member focus:border-member"
                      />
                      <span className="text-xs text-gray-500">円</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeChoice(oi, ci)}
                      className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addChoice(oi)}
                  className="text-xs text-member hover:underline"
                >
                  + 選択肢を追加
                </button>
              </div>

              {/* Summary */}
              {option.name && option.choices.filter((c) => c.label).length > 0 && (
                <div className="mt-2 text-xs text-gray-500 bg-gray-50 rounded px-3 py-1.5">
                  {option.name}: {option.choices.filter((c) => c.label).map((c) => c.label).join(', ')}
                </div>
              )}
            </div>
          ))}

          <button
            type="button"
            onClick={addOption}
            className="inline-flex items-center gap-1.5 text-sm text-member hover:underline"
          >
            <Plus size={14} />
            オプションを追加する
          </button>
        </div>
      </Section>

      {/* 数量制限 */}
      <Section id="quantity" title="数量制限">
        <div className="flex items-center gap-2">
          <input
            type="number"
            min={0}
            value={quantityLimit}
            onChange={(e) =>
              setQuantityLimit(e.target.value === '' ? '' : Number(e.target.value))
            }
            placeholder="制限なし"
            className="w-24 px-3 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-member focus:border-member"
          />
          <span className="text-sm text-gray-600">個まで</span>
        </div>
        <p className="text-xs text-gray-400 mt-1">空欄の場合は制限なし</p>
      </Section>

      {/* Submit */}
      <div className="flex items-center gap-3 pt-2 pb-8">
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center gap-2 px-8 py-2.5 bg-member text-white text-sm font-medium rounded hover:opacity-90 transition-colors disabled:opacity-50"
        >
          {loading && <Loader2 size={16} className="animate-spin" />}
          保存する
        </button>
        <button
          type="button"
          onClick={() => router.push('/admin/products')}
          className="px-5 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
        >
          キャンセル
        </button>
      </div>
    </form>
  )
}
