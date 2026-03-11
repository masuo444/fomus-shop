'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Plus, Package, Search, Copy, Trash2, Share2, GripVertical, ChevronDown } from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import type { Product } from '@/lib/types'
import ProductLinkModal from '@/components/admin/ProductLinkModal'

export default function AdminProductsPage() {
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState<'sort_order' | 'created_at' | 'name' | 'price'>('sort_order')
  const [togglingId, setTogglingId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [duplicatingId, setDuplicatingId] = useState<string | null>(null)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [batchMenuOpen, setBatchMenuOpen] = useState(false)
  const [batchLoading, setBatchLoading] = useState(false)
  const [shareLinkProduct, setShareLinkProduct] = useState<Product | null>(null)

  const fetchProducts = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/products')
      if (res.ok) {
        const data = await res.json()
        setProducts(data)
      }
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  const filteredProducts = products.filter((p) => {
    if (!search) return true
    const q = search.toLowerCase()
    return (
      p.name.toLowerCase().includes(q) ||
      (p.description?.toLowerCase().includes(q) ?? false)
    )
  })

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'sort_order':
        return a.sort_order - b.sort_order
      case 'created_at':
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      case 'name':
        return a.name.localeCompare(b.name, 'ja')
      case 'price':
        return a.price - b.price
      default:
        return 0
    }
  })

  const togglePublish = async (product: Product) => {
    setTogglingId(product.id)
    try {
      const res = await fetch(`/api/admin/products/${product.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_published: !product.is_published }),
      })
      if (res.ok) {
        setProducts((prev) =>
          prev.map((p) =>
            p.id === product.id ? { ...p, is_published: !p.is_published } : p
          )
        )
      }
    } catch {
      // ignore
    } finally {
      setTogglingId(null)
    }
  }

  const deleteProduct = async (product: Product) => {
    if (!confirm(`「${product.name}」を削除してもよろしいですか？`)) return
    setDeletingId(product.id)
    try {
      const res = await fetch(`/api/admin/products/${product.id}`, {
        method: 'DELETE',
      })
      if (res.ok) {
        setProducts((prev) => prev.filter((p) => p.id !== product.id))
      }
    } catch {
      // ignore
    } finally {
      setDeletingId(null)
    }
  }

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleSelectAll = () => {
    if (selectedIds.size === sortedProducts.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(sortedProducts.map((p) => p.id)))
    }
  }

  const handleBatchAction = async (action: 'publish' | 'unpublish' | 'delete') => {
    const ids = Array.from(selectedIds)
    if (ids.length === 0) return

    if (action === 'delete') {
      if (!confirm(`選択した${ids.length}件の商品を削除してもよろしいですか？`)) return
    }

    setBatchLoading(true)
    setBatchMenuOpen(false)
    try {
      const res = await fetch('/api/admin/products/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, product_ids: ids }),
      })
      if (res.ok) {
        setSelectedIds(new Set())
        fetchProducts()
      }
    } catch {
      // ignore
    } finally {
      setBatchLoading(false)
    }
  }

  const duplicateProduct = async (product: Product) => {
    setDuplicatingId(product.id)
    try {
      const res = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product: {
            shop_id: product.shop_id,
            name: `${product.name} (コピー)`,
            description: product.description,
            price: product.price,
            compare_at_price: product.compare_at_price,
            images: product.images,
            category_id: product.category_id,
            stock: product.stock,
            is_published: false,
            item_type: product.item_type,
            tax_rate: product.tax_rate,
            quantity_limit: product.quantity_limit,
            sort_order: product.sort_order,
            preorder_enabled: product.preorder_enabled,
            preorder_start_date: product.preorder_start_date,
            preorder_end_date: product.preorder_end_date,
            weight_grams: product.weight_grams,
          },
          options: [],
          shipping_method_ids: [],
        }),
      })
      if (res.ok) {
        fetchProducts()
      }
    } catch {
      // ignore
    } finally {
      setDuplicatingId(null)
    }
  }

  return (
    <div>
      {/* Top bar */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-gray-900">商品</h1>
        <Link
          href="/admin/products/new"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-member text-white text-sm font-medium rounded hover:opacity-90 transition-colors"
        >
          <Plus size={16} />
          商品を登録
        </Link>
      </div>

      {/* Sub bar */}
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <button className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-gray-300 rounded text-sm text-gray-700 hover:bg-gray-50 transition-colors">
          <GripVertical size={14} />
          並び替え
        </button>
        <div className="relative">
          <button
            onClick={() => setBatchMenuOpen(!batchMenuOpen)}
            disabled={selectedIds.size === 0 || batchLoading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-gray-300 rounded text-sm text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            一括操作 {selectedIds.size > 0 && `(${selectedIds.size})`}
            <ChevronDown size={14} />
          </button>
          {batchMenuOpen && selectedIds.size > 0 && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setBatchMenuOpen(false)} />
              <div className="absolute left-0 mt-1 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-20 py-1">
                <button
                  onClick={() => handleBatchAction('publish')}
                  className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  一括公開
                </button>
                <button
                  onClick={() => handleBatchAction('unpublish')}
                  className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  一括非公開
                </button>
                <button
                  onClick={() => handleBatchAction('delete')}
                  className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  一括削除
                </button>
              </div>
            </>
          )}
        </div>
        <div className="relative flex-1 max-w-xs">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="商品名・説明から検索"
            className="w-full pl-9 pr-3 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-member focus:border-member"
          />
        </div>
        <button className="text-sm text-member hover:underline">絞り込み</button>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
          className="px-3 py-1.5 border border-gray-300 rounded text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-member focus:border-member"
        >
          <option value="sort_order">ショップ表示順</option>
          <option value="created_at">登録日順</option>
          <option value="name">商品名順</option>
          <option value="price">価格順</option>
        </select>
      </div>

      {/* Product table */}
      <div className="bg-white rounded border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-400">読み込み中...</div>
        ) : sortedProducts.length > 0 ? (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="py-2.5 px-3 w-10">
                  <input
                    type="checkbox"
                    checked={sortedProducts.length > 0 && selectedIds.size === sortedProducts.length}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 rounded border-gray-300 text-member focus:ring-member"
                  />
                </th>
                <th className="text-left py-2.5 px-3 font-medium text-gray-500 w-16">順番</th>
                <th className="text-left py-2.5 px-3 font-medium text-gray-500 w-16"></th>
                <th className="text-left py-2.5 px-3 font-medium text-gray-500">商品名</th>
                <th className="text-right py-2.5 px-3 font-medium text-gray-500 w-28">価格</th>
                <th className="text-right py-2.5 px-3 font-medium text-gray-500 w-20">在庫</th>
                <th className="text-center py-2.5 px-3 font-medium text-gray-500 w-28">公開状態</th>
                <th className="text-center py-2.5 px-3 font-medium text-gray-500 w-32"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {sortedProducts.map((product) => (
                <tr key={product.id} className={`hover:bg-gray-50 transition-colors group ${selectedIds.has(product.id) ? 'bg-blue-50' : ''}`}>
                  <td className="py-2.5 px-3">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(product.id)}
                      onChange={() => toggleSelect(product.id)}
                      className="w-4 h-4 rounded border-gray-300 text-member focus:ring-member"
                    />
                  </td>
                  <td className="py-2.5 px-3 text-gray-500 text-center">{product.sort_order}</td>
                  <td className="py-2.5 px-3">
                    <Link href={`/admin/products/${product.id}`}>
                      {product.images?.[0] ? (
                        <img
                          src={product.images[0]}
                          alt=""
                          className="w-10 h-10 rounded object-cover bg-gray-100"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded bg-gray-100 flex items-center justify-center">
                          <Package size={16} className="text-gray-400" />
                        </div>
                      )}
                    </Link>
                  </td>
                  <td className="py-2.5 px-3">
                    <Link
                      href={`/admin/products/${product.id}`}
                      className="font-medium text-gray-900 hover:text-member transition-colors"
                    >
                      {product.name}
                    </Link>
                  </td>
                  <td className="py-2.5 px-3 text-right text-gray-900">
                    {formatPrice(product.price)}
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <span className={product.stock <= 5 ? 'text-orange-600 font-medium' : 'text-gray-600'}>
                      {product.stock}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <button
                      onClick={() => togglePublish(product)}
                      disabled={togglingId === product.id}
                      className="inline-flex items-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      <div
                        className={`relative w-10 h-5 rounded-full transition-colors ${
                          product.is_published ? 'bg-member' : 'bg-gray-300'
                        }`}
                      >
                        <div
                          className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                            product.is_published ? 'translate-x-5' : 'translate-x-0.5'
                          }`}
                        />
                      </div>
                      <span
                        className={`text-xs font-medium ${
                          product.is_published ? 'text-member' : 'text-gray-500'
                        }`}
                      >
                        {product.is_published ? '公開' : '非公開'}
                      </span>
                    </button>
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <div className="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => setShareLinkProduct(product)}
                        className="p-1.5 text-gray-400 hover:text-gray-600 rounded hover:bg-gray-100 transition-colors"
                        title="シェア"
                      >
                        <Share2 size={15} />
                      </button>
                      <button
                        onClick={() => duplicateProduct(product)}
                        disabled={duplicatingId === product.id}
                        className="p-1.5 text-gray-400 hover:text-gray-600 rounded hover:bg-gray-100 transition-colors disabled:opacity-50"
                        title="複製"
                      >
                        <Copy size={15} />
                      </button>
                      <button
                        onClick={() => deleteProduct(product)}
                        disabled={deletingId === product.id}
                        className="p-1.5 text-gray-400 hover:text-red-600 rounded hover:bg-red-50 transition-colors disabled:opacity-50"
                        title="削除"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="p-12 text-center text-gray-400">
            <Package size={32} className="mx-auto mb-3 text-gray-300" />
            {search ? (
              <p>「{search}」に一致する商品はありません</p>
            ) : (
              <>
                <p>商品はまだありません</p>
                <Link
                  href="/admin/products/new"
                  className="text-member hover:underline text-sm mt-2 inline-block"
                >
                  最初の商品を追加する
                </Link>
              </>
            )}
          </div>
        )}
      </div>

      {shareLinkProduct && (
        <ProductLinkModal
          product={shareLinkProduct}
          isOpen={!!shareLinkProduct}
          onClose={() => setShareLinkProduct(null)}
        />
      )}
    </div>
  )
}
