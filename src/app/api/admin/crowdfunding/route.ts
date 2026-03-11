import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { checkAdmin } from '@/lib/auth'

// GET: List all crowdfunding projects for admin
export async function GET() {
  if (!(await checkAdmin())) {
    return NextResponse.json({ error: '権限がありません' }, { status: 403 })
  }

  const admin = createAdminClient()

  const { data } = await admin
    .from('crowdfunding_projects')
    .select('*, creator:profiles(id, name, email)')
    .order('created_at', { ascending: false })

  return NextResponse.json({ projects: data || [] })
}

// PATCH: Admin actions on crowdfunding projects
export async function PATCH(request: Request) {
  if (!(await checkAdmin())) {
    return NextResponse.json({ error: '権限がありません' }, { status: 403 })
  }

  const { id, action } = await request.json()

  if (!id || !action) {
    return NextResponse.json({ error: '無効なリクエストです' }, { status: 400 })
  }

  const admin = createAdminClient()

  const { data: project } = await admin
    .from('crowdfunding_projects')
    .select('*')
    .eq('id', id)
    .single()

  if (!project) {
    return NextResponse.json({ error: 'プロジェクトが見つかりません' }, { status: 404 })
  }

  switch (action) {
    case 'approve': {
      if (project.status !== 'pending') {
        return NextResponse.json({ error: '審査待ちのプロジェクトのみ承認できます' }, { status: 400 })
      }
      await admin
        .from('crowdfunding_projects')
        .update({ status: 'active' })
        .eq('id', id)
      break
    }

    case 'reject': {
      if (project.status !== 'pending') {
        return NextResponse.json({ error: '審査待ちのプロジェクトのみ却下できます' }, { status: 400 })
      }
      await admin
        .from('crowdfunding_projects')
        .update({ status: 'cancelled' })
        .eq('id', id)
      break
    }

    case 'payout_complete': {
      if (!['funded', 'ended'].includes(project.status) || project.payout_status !== 'pending') {
        return NextResponse.json({ error: '終了済みプロジェクトのみ振込完了にできます' }, { status: 400 })
      }
      await admin
        .from('crowdfunding_projects')
        .update({
          payout_status: 'completed',
          payout_completed_at: new Date().toISOString(),
        })
        .eq('id', id)
      break
    }

    default:
      return NextResponse.json({ error: '無効なアクションです' }, { status: 400 })
  }

  return NextResponse.json({ success: true })
}
