import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { checkAdmin } from '@/lib/auth'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await checkAdmin()
  if (!user) {
    return NextResponse.json({ error: '権限がありません' }, { status: 403 })
  }

  const { id } = await params
  const body = await request.json()
  const admin = createAdminClient()

  // Only allow updating digital_access_enabled
  const update: Record<string, boolean> = {}
  if (typeof body.digital_access_enabled === 'boolean') {
    update.digital_access_enabled = body.digital_access_enabled
  }

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: '更新するフィールドがありません' }, { status: 400 })
  }

  const { data, error } = await admin
    .from('profiles')
    .update(update)
    .eq('id', id)
    .select('id, email, name, role, is_premium_member, digital_access_enabled')
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json(data)
}
