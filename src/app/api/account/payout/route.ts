import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { rateLimit } from '@/lib/rate-limit'

function maskAccountNumber(num: string): string {
  if (!num || num.length <= 4) return '****'
  return '****' + num.slice(-4)
}

const FLAT_FEE = 500 // ¥500 for under 100,000
const PERCENTAGE_FEE = 0.03 // 3% for 100,000+
const PERCENTAGE_THRESHOLD = 100000
const MIN_PAYOUT_POINTS = 1000 // Minimum points to request payout

function calculateFee(points: number): number {
  if (points >= PERCENTAGE_THRESHOLD) {
    return Math.ceil(points * PERCENTAGE_FEE)
  }
  return FLAT_FEE
}

// GET: Get user's payout requests
export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'ログインが必要です' }, { status: 401 })
  }

  const admin = createAdminClient()

  const { data: profile } = await admin
    .from('profiles')
    .select('points')
    .eq('id', user.id)
    .single()

  const { data: requests } = await admin
    .from('payout_requests')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(20)

  const maskedRequests = (requests || []).map((r: any) => ({
    ...r,
    account_number: r.account_number ? maskAccountNumber(r.account_number) : '****',
  }))

  return NextResponse.json({
    points: profile?.points || 0,
    min_points: MIN_PAYOUT_POINTS,
    flat_fee: FLAT_FEE,
    percentage_fee: PERCENTAGE_FEE,
    percentage_threshold: PERCENTAGE_THRESHOLD,
    requests: maskedRequests,
  })
}

// POST: Create a payout request
export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'ログインが必要です' }, { status: 401 })
  }

  const { success } = rateLimit(`payout:${user.id}`, 3, 3600000) // 3 per 60 minutes
  if (!success) {
    return NextResponse.json({ error: 'リクエストが多すぎます。しばらく待ってから再試行してください。' }, { status: 429 })
  }

  const body = await request.json()
  const { points, bank_name, branch_name, account_type, account_number, account_holder } = body

  // Validation
  if (!points || !bank_name || !branch_name || !account_number || !account_holder) {
    return NextResponse.json({ error: '必須項目を入力してください' }, { status: 400 })
  }

  const pointsNum = Number(points)
  if (pointsNum < MIN_PAYOUT_POINTS) {
    return NextResponse.json({ error: `最低${MIN_PAYOUT_POINTS}ポイントから申請できます` }, { status: 400 })
  }

  const fee = calculateFee(pointsNum)
  if (pointsNum <= fee) {
    return NextResponse.json({ error: '振込手数料を超えるポイントが必要です' }, { status: 400 })
  }

  const payoutAmount = pointsNum - fee
  const admin = createAdminClient()

  // Atomically check pending, deduct points, and create payout request
  // (locks profile row to prevent double-deduct race condition)
  const { data: result, error: rpcError } = await admin.rpc('create_payout_request', {
    p_user_id: user.id,
    p_points: pointsNum,
    p_fee: fee,
    p_amount: payoutAmount,
    p_bank_name: bank_name.trim(),
    p_branch_name: branch_name.trim(),
    p_account_type: account_type || 'ordinary',
    p_account_number: account_number.trim(),
    p_account_holder: account_holder.trim(),
  })

  if (rpcError) {
    const msg = rpcError.message || ''
    if (msg.includes('Pending request exists')) {
      return NextResponse.json({ error: '未処理の振込申請があります。完了後に再度申請してください。' }, { status: 400 })
    }
    if (msg.includes('Insufficient points')) {
      return NextResponse.json({ error: 'ポイントが不足しています' }, { status: 400 })
    }
    console.error('Payout request error:', rpcError)
    return NextResponse.json({ error: '申請に失敗しました' }, { status: 500 })
  }

  return NextResponse.json({ payout: { id: result?.request_id } })
}
