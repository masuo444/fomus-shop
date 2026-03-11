import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'

// GET: List active crowdfunding projects
export async function GET() {
  const admin = createAdminClient()

  const { data } = await admin
    .from('crowdfunding_projects')
    .select('*, creator:profiles(id, name), tiers:crowdfunding_tiers(*)')
    .eq('status', 'active')
    .order('created_at', { ascending: false })

  return NextResponse.json({ projects: data || [] })
}

// POST: Create a new crowdfunding project
export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'ログインが必要です' }, { status: 401 })
  }

  const body = await request.json()
  const {
    title, description, image_url, goal_amount, deadline,
    bank_name, branch_name, account_type, account_number, account_holder,
    tiers,
  } = body

  // Validation
  if (!title || !goal_amount || !deadline || !bank_name || !branch_name || !account_number || !account_holder) {
    return NextResponse.json({ error: '必須項目を入力してください' }, { status: 400 })
  }

  if (goal_amount < 1000 || goal_amount > 100000000) {
    return NextResponse.json({ error: '目標金額は¥1,000〜¥100,000,000で設定してください' }, { status: 400 })
  }

  const deadlineDate = new Date(deadline)
  const now = new Date()
  const maxDeadline = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000) // 30 days max
  if (deadlineDate <= now) {
    return NextResponse.json({ error: '締切日は未来の日付を設定してください' }, { status: 400 })
  }
  if (deadlineDate > maxDeadline) {
    return NextResponse.json({ error: '募集期間は最大30日です' }, { status: 400 })
  }

  if (!tiers || tiers.length === 0) {
    return NextResponse.json({ error: 'リターンを1つ以上追加してください' }, { status: 400 })
  }

  const admin = createAdminClient()

  // Create project (as pending, requires admin approval)
  const { data: project, error } = await admin
    .from('crowdfunding_projects')
    .insert({
      creator_id: user.id,
      title: title.trim(),
      description: description?.trim() || null,
      image_url: image_url || null,
      goal_amount: Number(goal_amount),
      deadline: deadlineDate.toISOString(),
      status: 'pending',
      bank_name: bank_name.trim(),
      branch_name: branch_name.trim(),
      account_type: account_type || 'ordinary',
      account_number: account_number.trim(),
      account_holder: account_holder.trim(),
    })
    .select()
    .single()

  if (error || !project) {
    return NextResponse.json({ error: 'プロジェクトの作成に失敗しました' }, { status: 500 })
  }

  // Create tiers
  const tierInserts = tiers.map((tier: any, i: number) => ({
    project_id: project.id,
    title: tier.title.trim(),
    description: tier.description?.trim() || null,
    amount: Number(tier.amount),
    max_backers: tier.max_backers ? Number(tier.max_backers) : null,
    sort_order: i,
  }))

  await admin.from('crowdfunding_tiers').insert(tierInserts)

  return NextResponse.json({ project })
}
