import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'

const TRANSFER_FEE = 500 // ¥500 transfer fee
const MIN_PAYOUT_POINTS = 1000 // Minimum points to request payout

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

  return NextResponse.json({
    points: profile?.points || 0,
    min_points: MIN_PAYOUT_POINTS,
    fee: TRANSFER_FEE,
    requests: requests || [],
  })
}

// POST: Create a payout request
export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'ログインが必要です' }, { status: 401 })
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

  if (pointsNum <= TRANSFER_FEE) {
    return NextResponse.json({ error: '振込手数料（¥500）を超えるポイントが必要です' }, { status: 400 })
  }

  const admin = createAdminClient()

  // Check for pending requests
  const { data: pending } = await admin
    .from('payout_requests')
    .select('id')
    .eq('user_id', user.id)
    .eq('status', 'pending')
    .limit(1)

  if (pending && pending.length > 0) {
    return NextResponse.json({ error: '未処理の振込申請があります。完了後に再度申請してください。' }, { status: 400 })
  }

  // Atomically deduct points (prevents race conditions)
  const { data: deductResult } = await admin.rpc('deduct_points', {
    p_user_id: user.id,
    p_amount: pointsNum,
  })

  if (deductResult?.error) {
    if (deductResult.error === 'insufficient_points') {
      return NextResponse.json({ error: 'ポイントが不足しています' }, { status: 400 })
    }
    return NextResponse.json({ error: 'エラーが発生しました' }, { status: 500 })
  }

  const payoutAmount = pointsNum - TRANSFER_FEE

  // Create payout request
  const { data: payout, error } = await admin
    .from('payout_requests')
    .insert({
      user_id: user.id,
      points: pointsNum,
      amount: payoutAmount,
      fee: TRANSFER_FEE,
      bank_name: bank_name.trim(),
      branch_name: branch_name.trim(),
      account_type: account_type || 'ordinary',
      account_number: account_number.trim(),
      account_holder: account_holder.trim(),
    })
    .select()
    .single()

  if (error) {
    // Refund points if payout creation failed
    await admin.from('profiles').update({
      points: (deductResult?.remaining ?? 0) + pointsNum,
    }).eq('id', user.id)
    return NextResponse.json({ error: '申請に失敗しました' }, { status: 500 })
  }

  // Record point transaction
  await admin.from('point_transactions').insert({
    user_id: user.id,
    amount: -pointsNum,
    type: 'payout',
    description: `振込申請: ¥${payoutAmount.toLocaleString()}（手数料¥${TRANSFER_FEE}）`,
  })

  return NextResponse.json({ payout })
}
