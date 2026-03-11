import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'ログインが必要です' }, { status: 401 })
  }

  const { project_id, tier_id } = await request.json()

  if (!project_id || !tier_id) {
    return NextResponse.json({ error: '無効なリクエストです' }, { status: 400 })
  }

  const admin = createAdminClient()

  // Get project
  const { data: project } = await admin
    .from('crowdfunding_projects')
    .select('*')
    .eq('id', project_id)
    .eq('status', 'active')
    .single()

  if (!project) {
    return NextResponse.json({ error: 'プロジェクトが見つかりません' }, { status: 404 })
  }

  // Check deadline
  if (new Date(project.deadline) < new Date()) {
    return NextResponse.json({ error: '募集期間が終了しています' }, { status: 400 })
  }

  // Get tier
  const { data: tier } = await admin
    .from('crowdfunding_tiers')
    .select('*')
    .eq('id', tier_id)
    .eq('project_id', project_id)
    .single()

  if (!tier) {
    return NextResponse.json({ error: 'リターンが見つかりません' }, { status: 404 })
  }

  // Check max backers
  if (tier.max_backers && tier.current_backers >= tier.max_backers) {
    return NextResponse.json({ error: 'このリターンは上限に達しました' }, { status: 400 })
  }

  // Prevent self-backing
  if (project.creator_id === user.id) {
    return NextResponse.json({ error: '自分のプロジェクトは支援できません' }, { status: 400 })
  }

  // Create backer record (pending)
  const { data: backer, error: backerError } = await admin
    .from('crowdfunding_backers')
    .insert({
      project_id,
      tier_id,
      user_id: user.id,
      amount: tier.amount,
      status: 'pending',
    })
    .select()
    .single()

  if (backerError || !backer) {
    return NextResponse.json({ error: '支援の処理に失敗しました' }, { status: 500 })
  }

  // Create Stripe Checkout session
  const origin = request.headers.get('origin') || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    line_items: [
      {
        price_data: {
          currency: 'jpy',
          product_data: {
            name: `${project.title} - ${tier.title}`,
            description: tier.description || undefined,
          },
          unit_amount: tier.amount,
        },
        quantity: 1,
      },
    ],
    metadata: {
      type: 'crowdfunding',
      project_id,
      tier_id,
      backer_id: backer.id,
      user_id: user.id,
      amount: String(tier.amount),
    },
    success_url: `${origin}/market/crowdfunding/${project_id}?backed=true`,
    cancel_url: `${origin}/market/crowdfunding/${project_id}`,
  })

  return NextResponse.json({ url: session.url })
}
