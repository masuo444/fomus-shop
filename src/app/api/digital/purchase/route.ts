import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { rateLimit } from '@/lib/rate-limit'

export async function POST(request: Request) {
  try {
    const { digital_item_id } = await request.json()

    if (!digital_item_id) {
      return NextResponse.json({ error: 'デジタルアイテムIDが必要です' }, { status: 400 })
    }

    // Require login
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'ログインが必要です' }, { status: 401 })
    }

    const { success } = rateLimit(`digital-purchase:${user.id}`, 5, 60000)
    if (!success) {
      return NextResponse.json({ error: 'リクエストが多すぎます。しばらく待ってから再試行してください。' }, { status: 429 })
    }

    const admin = createAdminClient()

    // Check digital access permission
    const { data: profile } = await admin
      .from('profiles')
      .select('digital_access_enabled')
      .eq('id', user.id)
      .single()

    if (!profile?.digital_access_enabled) {
      return NextResponse.json({ error: 'デジタルアイテムの購入権限がありません。管理者にお問い合わせください。' }, { status: 403 })
    }

    // Get digital item
    const { data: item } = await admin
      .from('digital_items')
      .select('*')
      .eq('id', digital_item_id)
      .eq('is_published', true)
      .single()

    if (!item) {
      return NextResponse.json({ error: 'アイテムが見つかりません' }, { status: 404 })
    }

    // Check supply
    if (item.issued_count >= item.total_supply) {
      return NextResponse.json({ error: 'このアイテムは完売しました' }, { status: 400 })
    }

    // Advisory token number for display only; actual number is assigned
    // atomically in the webhook via issue_digital_token() to prevent duplicates
    const estimatedTokenNumber = item.issued_count + 1

    // Create Stripe Checkout session for payment
    // Token creation happens in the webhook after payment succeeds
    const origin =
      request.headers.get('origin') ||
      process.env.NEXT_PUBLIC_SITE_URL ||
      'http://localhost:3000'

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'jpy',
            product_data: {
              name: item.name,
              description: `デジタルアイテム #${estimatedTokenNumber} / ${item.total_supply}`,
              images: item.image_url ? [item.image_url] : [],
            },
            unit_amount: item.price,
          },
          quantity: 1,
        },
      ],
      customer_email: user.email,
      metadata: {
        type: 'digital_purchase',
        digital_item_id: item.id,
        user_id: user.id,
        token_number: estimatedTokenNumber.toString(),
        price: item.price.toString(),
      },
      success_url: `${origin}/account/digital?purchased=true`,
      cancel_url: `${origin}/digital/${item.id}`,
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error('Digital purchase error:', error)
    return NextResponse.json({ error: '購入処理に失敗しました' }, { status: 500 })
  }
}
