'use client'

import { useState, useEffect, useCallback } from 'react'
import { Package, Copy, Check, ExternalLink, Search } from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import type { Product } from '@/lib/types'

function getBaseUrl() {
  return process.env.NEXT_PUBLIC_BASE_URL || (typeof window !== 'undefined' ? window.location.origin : '')
}

export default function ProductLinksPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [copiedKey, setCopiedKey] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const fetchProducts = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/products')
      if (res.ok) {
        const data = await res.json()
        setProducts(data.filter((p: Product) => p.is_published))
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
    return p.name.toLowerCase().includes(q)
  })

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text)
    setCopiedKey(key)
    setTimeout(() => setCopiedKey(null), 2000)
  }

  const CopyBtn = ({ text, copyKey }: { text: string; copyKey: string }) => (
    <button
      onClick={() => copyToClipboard(text, copyKey)}
      className="inline-flex items-center gap-1 px-2.5 py-1 bg-member text-white text-xs font-medium rounded hover:opacity-90 transition-colors flex-shrink-0"
    >
      {copiedKey === copyKey ? (
        <>
          <Check size={12} />
          コピーしました！
        </>
      ) : (
        <>
          <Copy size={12} />
          コピー
        </>
      )}
    </button>
  )

  const baseUrl = getBaseUrl()

  const getEmbedButtonHtml = (product: Product) => {
    const url = `${baseUrl}/shop/${product.id}?add=true`
    return `<a href="${url}" target="_blank" rel="noopener noreferrer" style="display:inline-block;background:#00A8A0;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;font-family:sans-serif;">購入する - ${formatPrice(product.price)}</a>`
  }

  const getEmbedCardHtml = (product: Product) => {
    const url = `${baseUrl}/shop/${product.id}?add=true`
    const imageUrl = product.images?.[0] || ''
    return `<div style="border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;max-width:300px;font-family:sans-serif;">
${imageUrl ? `  <img src="${imageUrl}" style="width:100%;height:200px;object-fit:cover;" alt="${product.name}" />` : ''}
  <div style="padding:16px;">
    <p style="font-weight:bold;margin:0 0 8px;">${product.name}</p>
    <p style="color:#00A8A0;font-weight:bold;font-size:18px;margin:0 0 12px;">${formatPrice(product.price)}</p>
    <a href="${url}" target="_blank" rel="noopener noreferrer" style="display:block;background:#00A8A0;color:white;padding:10px;border-radius:8px;text-decoration:none;text-align:center;font-weight:bold;">購入する</a>
  </div>
</div>`
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900">商品リンク</h1>
          <p className="text-sm text-gray-500 mt-1">
            外部サイトで商品を共有するためのリンクや埋め込みコードを取得できます
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1 max-w-xs">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="商品名で検索"
            className="w-full pl-9 pr-3 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-member focus:border-member"
          />
        </div>
        <span className="text-sm text-gray-400">
          公開中の商品: {filteredProducts.length}件
        </span>
      </div>

      {loading ? (
        <div className="bg-white rounded border border-gray-200 p-12 text-center text-gray-400">
          読み込み中...
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="bg-white rounded border border-gray-200 p-12 text-center text-gray-400">
          <Package size={32} className="mx-auto mb-3 text-gray-300" />
          <p>公開中の商品はありません</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredProducts.map((product) => {
            const productUrl = `${baseUrl}/shop/${product.id}`
            const cartUrl = `${baseUrl}/shop/${product.id}?add=true`
            const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(productUrl)}`
            const isExpanded = expandedId === product.id

            return (
              <div
                key={product.id}
                className="bg-white rounded-lg border border-gray-200 overflow-hidden"
              >
                {/* Product header row */}
                <div
                  className="flex items-center gap-4 p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => setExpandedId(isExpanded ? null : product.id)}
                >
                  {product.images?.[0] ? (
                    <img
                      src={product.images[0]}
                      alt=""
                      className="w-12 h-12 rounded-lg object-cover bg-gray-100 flex-shrink-0"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                      <Package size={20} className="text-gray-400" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold text-gray-900 truncate">{product.name}</h3>
                    <p className="text-sm text-member font-medium">{formatPrice(product.price)}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <a
                      href={productUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="p-1.5 text-gray-400 hover:text-member rounded hover:bg-gray-100 transition-colors"
                      title="商品ページを開く"
                    >
                      <ExternalLink size={16} />
                    </a>
                    <svg
                      className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>

                {/* Expanded content */}
                {isExpanded && (
                  <div className="border-t border-gray-100 p-4 space-y-5 bg-gray-50/50">
                    {/* Links */}
                    <div>
                      <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">リンク</h4>
                      <div className="space-y-2">
                        <div>
                          <label className="text-xs text-gray-500 mb-1 block">購入リンク</label>
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              readOnly
                              value={productUrl}
                              className="flex-1 px-3 py-1.5 border border-gray-200 rounded text-xs bg-white text-gray-700"
                            />
                            <CopyBtn text={productUrl} copyKey={`url-${product.id}`} />
                          </div>
                        </div>
                        <div>
                          <label className="text-xs text-gray-500 mb-1 block">直接カート追加リンク</label>
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              readOnly
                              value={cartUrl}
                              className="flex-1 px-3 py-1.5 border border-gray-200 rounded text-xs bg-white text-gray-700"
                            />
                            <CopyBtn text={cartUrl} copyKey={`cart-${product.id}`} />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Embed button */}
                    <div>
                      <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">埋め込みボタン（HTML）</h4>
                      <div className="p-3 bg-white rounded border border-gray-200 mb-2">
                        <div dangerouslySetInnerHTML={{ __html: getEmbedButtonHtml(product) }} />
                      </div>
                      <div className="relative">
                        <pre className="p-3 bg-gray-900 text-gray-300 text-xs rounded overflow-x-auto whitespace-pre-wrap break-all">
                          {getEmbedButtonHtml(product)}
                        </pre>
                        <div className="absolute top-2 right-2">
                          <CopyBtn text={getEmbedButtonHtml(product)} copyKey={`btn-${product.id}`} />
                        </div>
                      </div>
                    </div>

                    {/* Embed card */}
                    <div>
                      <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">埋め込みカード（HTML）</h4>
                      <div className="p-3 bg-white rounded border border-gray-200 mb-2 flex justify-center">
                        <div dangerouslySetInnerHTML={{ __html: getEmbedCardHtml(product) }} />
                      </div>
                      <div className="relative">
                        <pre className="p-3 bg-gray-900 text-gray-300 text-xs rounded overflow-x-auto whitespace-pre-wrap break-all">
                          {getEmbedCardHtml(product)}
                        </pre>
                        <div className="absolute top-2 right-2">
                          <CopyBtn text={getEmbedCardHtml(product)} copyKey={`card-${product.id}`} />
                        </div>
                      </div>
                    </div>

                    {/* QR Code */}
                    <div>
                      <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">QRコード</h4>
                      <div className="flex items-start gap-4">
                        <img
                          src={qrUrl}
                          alt={`QRコード: ${product.name}`}
                          width={150}
                          height={150}
                          className="rounded border border-gray-200"
                        />
                        <div className="space-y-2">
                          <p className="text-xs text-gray-500">
                            このQRコードをスキャンすると商品ページに移動します
                          </p>
                          <CopyBtn text={productUrl} copyKey={`qr-${product.id}`} />
                          <div>
                            <a
                              href={qrUrl}
                              download={`qr-${product.id}.png`}
                              className="inline-flex items-center gap-1 px-2.5 py-1 border border-gray-300 text-gray-700 text-xs font-medium rounded hover:bg-gray-50 transition-colors"
                            >
                              QR画像をダウンロード
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
