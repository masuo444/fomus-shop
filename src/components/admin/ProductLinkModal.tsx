'use client'

import { useState } from 'react'
import { X, Copy, Check, ExternalLink } from 'lucide-react'

interface ProductLinkModalProps {
  product: {
    id: string
    name: string
    price: number
    images?: string[]
  }
  isOpen: boolean
  onClose: () => void
}

function getBaseUrl() {
  return process.env.NEXT_PUBLIC_BASE_URL || (typeof window !== 'undefined' ? window.location.origin : '')
}

function formatPriceRaw(price: number): string {
  return `¥${price.toLocaleString()}`
}

type TabKey = 'links' | 'button' | 'card' | 'qr'

export default function ProductLinkModal({ product, isOpen, onClose }: ProductLinkModalProps) {
  const [activeTab, setActiveTab] = useState<TabKey>('links')
  const [copiedKey, setCopiedKey] = useState<string | null>(null)

  if (!isOpen) return null

  const baseUrl = getBaseUrl()
  const productUrl = `${baseUrl}/shop/${product.id}`
  const cartUrl = `${baseUrl}/shop/${product.id}?add=true`
  const imageUrl = product.images?.[0] || ''

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text)
    setCopiedKey(key)
    setTimeout(() => setCopiedKey(null), 2000)
  }

  const CopyButton = ({ text, copyKey, label }: { text: string; copyKey: string; label?: string }) => (
    <button
      onClick={() => copyToClipboard(text, copyKey)}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-member text-white text-xs font-medium rounded hover:opacity-90 transition-colors"
    >
      {copiedKey === copyKey ? (
        <>
          <Check size={14} />
          コピーしました！
        </>
      ) : (
        <>
          <Copy size={14} />
          {label || 'コピー'}
        </>
      )}
    </button>
  )

  const embedButtonHtml = `<a href="${cartUrl}" target="_blank" rel="noopener noreferrer" style="display:inline-block;background:#00A8A0;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;font-family:sans-serif;">購入する - ${formatPriceRaw(product.price)}</a>`

  const embedCardHtml = `<div style="border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;max-width:300px;font-family:sans-serif;">
${imageUrl ? `  <img src="${imageUrl}" style="width:100%;height:200px;object-fit:cover;" alt="${product.name}" />` : ''}
  <div style="padding:16px;">
    <p style="font-weight:bold;margin:0 0 8px;">${product.name}</p>
    <p style="color:#00A8A0;font-weight:bold;font-size:18px;margin:0 0 12px;">${formatPriceRaw(product.price)}</p>
    <a href="${cartUrl}" target="_blank" rel="noopener noreferrer" style="display:block;background:#00A8A0;color:white;padding:10px;border-radius:8px;text-decoration:none;text-align:center;font-weight:bold;">購入する</a>
  </div>
</div>`

  const embedInlineHtml = `<a href="${productUrl}" target="_blank" rel="noopener noreferrer" style="color:#00A8A0;font-weight:bold;text-decoration:underline;font-family:sans-serif;">「${product.name}」を購入する（${formatPriceRaw(product.price)}）</a>`

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(productUrl)}`

  const tabs: { key: TabKey; label: string }[] = [
    { key: 'links', label: 'リンク' },
    { key: 'button', label: '埋め込みボタン' },
    { key: 'card', label: '埋め込みカード' },
    { key: 'qr', label: 'QRコード' },
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div>
            <h2 className="text-lg font-bold text-gray-900">商品リンク・埋め込み</h2>
            <p className="text-sm text-gray-500 mt-0.5">{product.name}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 px-6">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.key
                  ? 'border-member text-member'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-6">
          {activeTab === 'links' && (
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">購入リンク</label>
                <p className="text-xs text-gray-400 mb-2">商品ページに移動します</p>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={productUrl}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm bg-gray-50 text-gray-700"
                  />
                  <CopyButton text={productUrl} copyKey="productUrl" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">直接カート追加リンク</label>
                <p className="text-xs text-gray-400 mb-2">商品を自動的にカートに追加します</p>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={cartUrl}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm bg-gray-50 text-gray-700"
                  />
                  <CopyButton text={cartUrl} copyKey="cartUrl" />
                </div>
              </div>
              <div className="pt-2">
                <a
                  href={productUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm text-member hover:underline"
                >
                  <ExternalLink size={14} />
                  商品ページを開く
                </a>
              </div>
            </div>
          )}

          {activeTab === 'button' && (
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">スタイル1: ボタン</label>
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 mb-2">
                  <div dangerouslySetInnerHTML={{ __html: embedButtonHtml }} />
                </div>
                <div className="relative">
                  <pre className="p-3 bg-gray-900 text-gray-300 text-xs rounded-lg overflow-x-auto whitespace-pre-wrap break-all">
                    {embedButtonHtml}
                  </pre>
                  <div className="absolute top-2 right-2">
                    <CopyButton text={embedButtonHtml} copyKey="embedButton" />
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">スタイル2: インラインリンク</label>
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 mb-2">
                  <div dangerouslySetInnerHTML={{ __html: embedInlineHtml }} />
                </div>
                <div className="relative">
                  <pre className="p-3 bg-gray-900 text-gray-300 text-xs rounded-lg overflow-x-auto whitespace-pre-wrap break-all">
                    {embedInlineHtml}
                  </pre>
                  <div className="absolute top-2 right-2">
                    <CopyButton text={embedInlineHtml} copyKey="embedInline" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'card' && (
            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">埋め込みカード</label>
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 flex justify-center">
                <div dangerouslySetInnerHTML={{ __html: embedCardHtml }} />
              </div>
              <div className="relative">
                <pre className="p-3 bg-gray-900 text-gray-300 text-xs rounded-lg overflow-x-auto whitespace-pre-wrap break-all">
                  {embedCardHtml}
                </pre>
                <div className="absolute top-2 right-2">
                  <CopyButton text={embedCardHtml} copyKey="embedCard" />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'qr' && (
            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">QRコード</label>
              <p className="text-xs text-gray-400">このQRコードをスキャンすると商品ページに移動します</p>
              <div className="flex flex-col items-center gap-4 p-6 bg-gray-50 rounded-lg border border-gray-200">
                <img
                  src={qrUrl}
                  alt={`QRコード: ${product.name}`}
                  width={200}
                  height={200}
                  className="rounded"
                />
                <p className="text-xs text-gray-500 text-center max-w-xs break-all">{productUrl}</p>
              </div>
              <div className="flex items-center gap-2">
                <CopyButton text={productUrl} copyKey="qrLink" label="リンクをコピー" />
                <a
                  href={qrUrl}
                  download={`qr-${product.id}.png`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-gray-300 text-gray-700 text-xs font-medium rounded hover:bg-gray-50 transition-colors"
                >
                  QR画像をダウンロード
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
