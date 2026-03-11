'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ChevronLeft, Coins, Gift, Loader2, Copy, Check, Banknote } from 'lucide-react'
import { formatPrice, formatDate } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import type { PointTransaction } from '@/lib/types'

interface ExchangeTier {
  points: number
  value: number
  label: string
}

type Tab = 'coupon' | 'payout'

export default function PointsExchangePage() {
  const [tab, setTab] = useState<Tab>('coupon')
  const [points, setPoints] = useState(0)
  const [tiers, setTiers] = useState<ExchangeTier[]>([])
  const [transactions, setTransactions] = useState<PointTransaction[]>([])
  const [loading, setLoading] = useState(true)
  const [exchanging, setExchanging] = useState<number | null>(null)
  const [result, setResult] = useState<{ code: string; value: number; expires_at: string } | null>(null)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  // Payout state
  const [payoutPoints, setPayoutPoints] = useState('')
  const [bankName, setBankName] = useState('')
  const [branchName, setBranchName] = useState('')
  const [accountType, setAccountType] = useState('ordinary')
  const [accountNumber, setAccountNumber] = useState('')
  const [accountHolder, setAccountHolder] = useState('')
  const [payoutSubmitting, setPayoutSubmitting] = useState(false)
  const [payoutSuccess, setPayoutSuccess] = useState(false)
  const [payoutRequests, setPayoutRequests] = useState<any[]>([])

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    // Load exchange tiers and points
    const res = await fetch('/api/account/exchange-points')
    if (res.ok) {
      const data = await res.json()
      setPoints(data.points)
      setTiers(data.tiers)
    }

    // Load payout requests
    const payoutRes = await fetch('/api/account/payout')
    if (payoutRes.ok) {
      const payoutData = await payoutRes.json()
      setPayoutRequests(payoutData.requests || [])
    }

    // Load point transactions
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data: txns } = await supabase
        .from('point_transactions')
        .select('*')
        .eq('user_id', user.id)
        .in('type', ['resale', 'point_exchange', 'payout'])
        .order('created_at', { ascending: false })
        .limit(30)
      setTransactions((txns as PointTransaction[]) || [])
    }

    setLoading(false)
  }

  const handleExchange = async (tierPoints: number) => {
    setExchanging(tierPoints)
    setError('')
    setResult(null)

    try {
      const res = await fetch('/api/account/exchange-points', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ points: tierPoints }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      setResult(data.coupon)
      loadData()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'エラーが発生しました')
    } finally {
      setExchanging(null)
    }
  }

  const handlePayout = async (e: React.FormEvent) => {
    e.preventDefault()
    setPayoutSubmitting(true)
    setError('')
    setPayoutSuccess(false)

    try {
      const res = await fetch('/api/account/payout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          points: Number(payoutPoints),
          bank_name: bankName,
          branch_name: branchName,
          account_type: accountType,
          account_number: accountNumber,
          account_holder: accountHolder,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      setPayoutSuccess(true)
      setPayoutPoints('')
      setBankName('')
      setBranchName('')
      setAccountNumber('')
      setAccountHolder('')
      loadData()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'エラーが発生しました')
    } finally {
      setPayoutSubmitting(false)
    }
  }

  const copyCode = () => {
    if (result) {
      navigator.clipboard.writeText(result.code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const currentPoints = Number(payoutPoints) || 0
  const currentFee = currentPoints >= 100000 ? Math.ceil(currentPoints * 0.03) : 500
  const payoutAmount = currentPoints > currentFee ? currentPoints - currentFee : 0

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <div className="animate-pulse text-gray-400">読み込み中...</div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <Link
        href="/account"
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900 mb-6 transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
        マイページに戻る
      </Link>

      <h1 className="text-2xl font-bold text-gray-900 mb-2">ポイント交換</h1>
      <p className="text-sm text-gray-500 mb-8">ポイントをクーポンまたは現金に交換できます</p>

      {/* Points Balance */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-700 text-white rounded-2xl p-6 mb-8">
        <p className="text-sm text-gray-300 mb-1">保有ポイント</p>
        <p className="text-4xl font-bold">{points.toLocaleString()} <span className="text-lg font-normal text-gray-300">pt</span></p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-gray-100 rounded-lg p-1">
        <button
          onClick={() => { setTab('coupon'); setError('') }}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium rounded-md transition-colors ${
            tab === 'coupon' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'
          }`}
        >
          <Gift size={16} />
          クーポン交換
        </button>
        <button
          onClick={() => { setTab('payout'); setError(''); setResult(null) }}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium rounded-md transition-colors ${
            tab === 'payout' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'
          }`}
        >
          <Banknote size={16} />
          現金振込
        </button>
      </div>

      {/* Exchange Result */}
      {result && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-5 mb-6">
          <div className="flex items-center gap-2 mb-2">
            <Gift className="w-5 h-5 text-green-600" />
            <span className="font-semibold text-green-800">クーポンを発行しました！</span>
          </div>
          <div className="flex items-center gap-3 bg-white rounded-lg p-3 border border-green-200">
            <code className="text-lg font-bold text-gray-900 flex-1">{result.code}</code>
            <button
              onClick={copyCode}
              className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 rounded-lg text-sm hover:bg-gray-200 transition-colors"
            >
              {copied ? <Check size={14} className="text-green-600" /> : <Copy size={14} />}
              {copied ? 'コピー済み' : 'コピー'}
            </button>
          </div>
          <p className="text-xs text-green-700 mt-2">
            {formatPrice(result.value)} 割引 / 有効期限: {formatDate(result.expires_at)}
          </p>
        </div>
      )}

      {/* Payout Success */}
      {payoutSuccess && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-5 mb-6">
          <p className="font-semibold text-green-800">振込申請を受け付けました</p>
          <p className="text-sm text-green-600 mt-1">管理者が確認後、振込処理を行います。</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-5 py-3 mb-6">
          {error}
        </div>
      )}

      {/* Coupon Tab */}
      {tab === 'coupon' && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">クーポンに交換</h2>
          <div className="grid grid-cols-2 gap-3">
            {tiers.map((tier) => {
              const canExchange = points >= tier.points
              return (
                <button
                  key={tier.points}
                  onClick={() => canExchange && handleExchange(tier.points)}
                  disabled={!canExchange || exchanging !== null}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    canExchange
                      ? 'border-gray-200 hover:border-gray-400 hover:shadow-sm cursor-pointer'
                      : 'border-gray-100 opacity-50 cursor-not-allowed'
                  }`}
                >
                  <p className="text-sm font-bold text-gray-900">{tier.label}</p>
                  <p className="text-xs text-gray-500 mt-1">{tier.points.toLocaleString()} ポイント</p>
                  {exchanging === tier.points && (
                    <Loader2 size={14} className="animate-spin text-gray-400 mt-2" />
                  )}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Payout Tab */}
      {tab === 'payout' && (
        <div className="mb-8">
          <div className="bg-amber-50 border border-amber-200 rounded-xl px-5 py-3 mb-6">
            <p className="text-sm text-amber-800">振込手数料（申請ポイントから差し引かれます）</p>
            <ul className="text-xs text-amber-700 mt-1.5 space-y-0.5 list-disc list-inside">
              <li>10万pt未満: <strong>¥500</strong>（固定）</li>
              <li>10万pt以上: <strong>3%</strong>（例: 10万pt → 手数料¥3,000）</li>
            </ul>
            <p className="text-xs text-amber-600 mt-1.5">最低1,000ポイントから申請可能です</p>
          </div>

          <form onSubmit={handlePayout} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">振込ポイント数</label>
              <input
                type="number"
                value={payoutPoints}
                onChange={(e) => setPayoutPoints(e.target.value)}
                required
                min={1000}
                max={points}
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10"
                placeholder="1000"
              />
              {currentPoints >= 1000 && (
                <p className="text-xs text-gray-500 mt-1">
                  手数料: ¥{currentFee.toLocaleString()}{currentPoints >= 100000 ? ' (3%)' : ' (固定)'} → 振込額: <strong>¥{payoutAmount.toLocaleString()}</strong>
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">銀行名</label>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">支店名</label>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">口座番号</label>
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
              <label className="block text-sm font-medium text-gray-700 mb-1">口座名義（カタカナ）</label>
              <input
                type="text"
                value={accountHolder}
                onChange={(e) => setAccountHolder(e.target.value)}
                required
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10"
                placeholder="フォマス タロウ"
              />
            </div>

            <button
              type="submit"
              disabled={payoutSubmitting || points < 1000}
              className="w-full bg-gray-900 text-white py-3 rounded-full text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
            >
              {payoutSubmitting ? '申請中...' : '振込を申請する'}
            </button>
          </form>

          {/* Payout Request History */}
          {payoutRequests.length > 0 && (
            <div className="mt-8">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">振込申請履歴</h3>
              <div className="space-y-2">
                {payoutRequests.map((req: any) => (
                  <div key={req.id} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                    <div>
                      <p className="text-sm text-gray-900">¥{req.amount.toLocaleString()} 振込申請</p>
                      <p className="text-xs text-gray-400">{formatDate(req.created_at)}</p>
                    </div>
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                      req.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                      req.status === 'completed' ? 'bg-green-100 text-green-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {req.status === 'pending' ? '処理中' : req.status === 'completed' ? '振込済み' : '却下'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Transaction History */}
      {transactions.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">リセール・交換履歴</h2>
          <div className="space-y-2">
            {transactions.map((txn) => (
              <div key={txn.id} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900 truncate">{txn.description}</p>
                  <p className="text-xs text-gray-400">{formatDate(txn.created_at)}</p>
                </div>
                <span className={`text-sm font-bold ml-4 ${txn.amount > 0 ? 'text-green-600' : 'text-red-500'}`}>
                  {txn.amount > 0 ? '+' : ''}{txn.amount.toLocaleString()} pt
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {transactions.length === 0 && (
        <div className="text-center py-12">
          <Coins className="w-12 h-12 text-gray-200 mx-auto mb-3" />
          <p className="text-gray-400">まだリセール履歴がありません</p>
          <p className="text-xs text-gray-400 mt-1">デジタルアイテムを転売すると、売上分のポイントが付与されます</p>
        </div>
      )}
    </div>
  )
}
