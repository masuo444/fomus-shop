import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { checkAdmin } from '@/lib/auth'

// GET: List payout requests
export async function GET(request: NextRequest) {
  if (!(await checkAdmin())) {
    return NextResponse.json({ error: '権限がありません' }, { status: 403 })
  }

  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status') || 'pending'

  const admin = createAdminClient()

  let query = admin
    .from('payout_requests')
    .select('*, user:profiles(id, name, email)')
    .order('created_at', { ascending: status === 'pending' })

  if (status !== 'all') {
    query = query.eq('status', status)
  }

  const { data } = await query.limit(50)

  return NextResponse.json({ requests: data || [] })
}

// PATCH: Update payout request status
export async function PATCH(request: NextRequest) {
  if (!(await checkAdmin())) {
    return NextResponse.json({ error: '権限がありません' }, { status: 403 })
  }

  const { id, status, admin_note } = await request.json()

  if (!id || !status || !['completed', 'rejected'].includes(status)) {
    return NextResponse.json({ error: '無効なリクエストです' }, { status: 400 })
  }

  const admin = createAdminClient()

  // Get the payout request
  const { data: payout } = await admin
    .from('payout_requests')
    .select('*')
    .eq('id', id)
    .eq('status', 'pending')
    .single()

  if (!payout) {
    return NextResponse.json({ error: '振込申請が見つかりません' }, { status: 404 })
  }

  // Update status
  const updateData: any = {
    status,
    admin_note: admin_note || null,
  }
  if (status === 'completed') {
    updateData.completed_at = new Date().toISOString()
  }

  await admin
    .from('payout_requests')
    .update(updateData)
    .eq('id', id)

  // If rejected, refund points
  if (status === 'rejected') {
    const { data: profile } = await admin
      .from('profiles')
      .select('points')
      .eq('id', payout.user_id)
      .single()

    if (profile) {
      await admin
        .from('profiles')
        .update({ points: profile.points + payout.points })
        .eq('id', payout.user_id)

      await admin.from('point_transactions').insert({
        user_id: payout.user_id,
        amount: payout.points,
        type: 'payout',
        description: `振込申請却下: ${payout.points}pt返還`,
      })
    }
  }

  return NextResponse.json({ success: true })
}
