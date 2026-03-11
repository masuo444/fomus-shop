'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Copy, Check, Loader2, CheckCircle, AlertCircle, ExternalLink } from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import { clearLocalCart } from '@/lib/cart'

export default function JpycPaymentPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const orderId = searchParams.get('order_id')
  const orderNumber = searchParams.get('order_number')
  const total = Number(searchParams.get('total') || 0)
  const walletAddress = searchParams.get('wallet')

  const [txHash, setTxHash] = useState('')
  const [verifying, setVerifying] = useState(false)
  const [verified, setVerified] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState<'address' | 'amount' | null>(null)

  // Auto-poll mode
  const [polling, setPolling] = useState(false)

  useEffect(() => {
    if (!orderId || !walletAddress) {
      router.push('/cart')
    }
  }, [orderId, walletAddress, router])

  const copyToClipboard = (text: string, type: 'address' | 'amount') => {
    navigator.clipboard.writeText(text)
    setCopied(type)
    setTimeout(() => setCopied(null), 2000)
  }

  const handleVerify = async () => {
    if (!txHash.trim()) {
      setError('トランザクションハッシュを入力してください')
      return
    }

    setVerifying(true)
    setError('')

    try {
      const res = await fetch('/api/jpyc/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order_id: orderId,
          tx_hash: txHash.trim(),
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || '検証に失敗しました')
      }

      if (data.verified) {
        setVerified(true)
        clearLocalCart()
        window.dispatchEvent(new Event('cart-updated'))
      } else {
        setError(data.error || '送金が確認できませんでした。しばらく待ってから再度お試しください。')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'エラーが発生しました')
    } finally {
      setVerifying(false)
    }
  }

  if (!orderId || !walletAddress) return null

  if (verified) {
    return (
      <div className="max-w-lg mx-auto px-4 py-24 text-center">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-6" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          お支払いが確認されました
        </h1>
        <p className="text-sm text-gray-500 mb-2">
          JPYC決済が正常に完了しました。
        </p>
        <p className="text-sm text-gray-500 mb-8">
          注文番号: <span className="font-mono font-medium">{orderNumber}</span>
        </p>
        <div className="space-y-3">
          <Link
            href="/shop"
            className="block w-full text-sm text-gray-500 hover:text-gray-900 py-2 transition-colors"
          >
            ショッピングを続ける
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">JPYC決済</h1>
      <p className="text-sm text-gray-500 mb-8">
        以下のウォレットアドレスにJPYCを送金してください
      </p>

      {/* Order Info */}
      <div className="bg-[var(--color-subtle)] rounded-xl p-5 mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs text-[var(--color-muted)]">注文番号</span>
          <span className="text-sm font-mono">{orderNumber}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-xs text-[var(--color-muted)]">お支払い金額</span>
          <span className="text-lg font-bold">{total.toLocaleString()} JPYC</span>
        </div>
      </div>

      {/* Wallet Address */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          送金先アドレス（Polygon）
        </label>
        <div className="flex items-center gap-2 bg-white border border-[var(--color-border)] rounded-lg p-3">
          <code className="text-xs font-mono text-gray-900 flex-1 break-all select-all">
            {walletAddress}
          </code>
          <button
            onClick={() => copyToClipboard(walletAddress, 'address')}
            className="flex-shrink-0 p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            {copied === 'address' ? (
              <Check size={16} className="text-green-600" />
            ) : (
              <Copy size={16} className="text-gray-400" />
            )}
          </button>
        </div>
      </div>

      {/* Amount */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          送金額
        </label>
        <div className="flex items-center gap-2 bg-white border border-[var(--color-border)] rounded-lg p-3">
          <span className="text-lg font-bold text-gray-900 flex-1">
            {total.toLocaleString()} JPYC
          </span>
          <button
            onClick={() => copyToClipboard(String(total), 'amount')}
            className="flex-shrink-0 p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            {copied === 'amount' ? (
              <Check size={16} className="text-green-600" />
            ) : (
              <Copy size={16} className="text-gray-400" />
            )}
          </button>
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl px-5 py-3 mb-6">
        <p className="text-sm font-medium text-amber-800 mb-2">送金手順</p>
        <ol className="text-xs text-amber-700 space-y-1 list-decimal list-inside">
          <li>MetaMask等のウォレットでPolygonネットワークに接続</li>
          <li>上記アドレスに <strong>{total.toLocaleString()} JPYC</strong> を送金</li>
          <li>トランザクションが完了したら、ハッシュを下に貼り付け</li>
          <li>「送金を確認する」ボタンを押して完了</li>
        </ol>
      </div>

      {/* TX Hash Input */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          トランザクションハッシュ
        </label>
        <input
          type="text"
          value={txHash}
          onChange={(e) => { setTxHash(e.target.value); setError('') }}
          placeholder="0x..."
          className="w-full border border-[var(--color-border)] rounded-lg px-4 py-3 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[var(--foreground)]/10 focus:border-[var(--foreground)]"
        />
      </div>

      {error && (
        <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 mb-4">
          <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <button
        onClick={handleVerify}
        disabled={verifying || !txHash.trim()}
        className="w-full bg-[var(--foreground)] text-[var(--background)] py-3 rounded-full text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {verifying ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            ブロックチェーンを確認中...
          </>
        ) : (
          '送金を確認する'
        )}
      </button>

      <div className="mt-4 text-center">
        <a
          href="https://polygonscan.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs text-[var(--color-muted)] hover:text-[var(--foreground)] transition-colors"
        >
          PolygonScanで確認
          <ExternalLink size={12} />
        </a>
      </div>

      <div className="mt-8 text-center">
        <Link
          href="/cart"
          className="text-sm text-[var(--color-muted)] hover:text-[var(--foreground)] transition-colors"
        >
          カートに戻る
        </Link>
      </div>
    </div>
  )
}
