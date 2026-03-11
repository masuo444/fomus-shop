'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Plus, Package, Search, Loader2 } from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import type { Product } from '@/lib/types'

export default function PartnerProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [togglingId, setTogglingId] = useState<string | null>(null)

  const fetchProducts = useCallback(async () => {
    try {
      const res = await fetch('/api/partner/products')
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

  const togglePublish = async (product: Product) => {
    setTogglingId(product.id)
    try {
      const res = await fetch(`/api/partner/products/${product.id}`, {
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

  return (
    <div>
      {/* Top bar */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-gray-900">商品</h1>
        <Link
          href="/partner/products/new"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-member text-white text-sm font-medium rounded hover:opacity-90 transition-colors"
        >
          <Plus size={16} />
          商品を登録
        </Link>
      </div>

      {/* Search */}
      <div className="flex items-center gap-3 mb-4">
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
      </div>

      {/* Product table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <Loader2 size={24} className="animate-spin mx-auto text-gray-400" />
          </div>
        ) : filteredProducts.length > 0 ? (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left py-2.5 px-3 font-medium text-gray-500 w-16"></th>
                <th className="text-left py-2.5 px-3 font-medium text-gray-500">商品名</th>
                <th className="text-right py-2.5 px-3 font-medium text-gray-500 w-28">価格</th>
                <th className="text-right py-2.5 px-3 font-medium text-gray-500 w-20">在庫</th>
                <th className="text-center py-2.5 px-3 font-medium text-gray-500 w-28">公開状態</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredProducts.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-2.5 px-3">
                    <Link href={`/partner/products/${product.id}`}>
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
                      href={`/partner/products/${product.id}`}
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
                  href="/partner/products/new"
                  className="text-member hover:underline text-sm mt-2 inline-block"
                >
                  最初の商品を追加する
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
