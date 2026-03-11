import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  try {
    const { listing_id } = await request.json()

    if (!listing_id) {
      return NextResponse.json({ error: 'リスティングIDが必要です' }, { status: 400 })
    }

    // Require login
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'ログインが必要です' }, { status: 401 })
    }

    const admin = createAdminClient()

    // Check digital access permission
    const { data: buyerProfile } = await admin
      .from('profiles')
      .select('digital_access_enabled')
      .eq('id', user.id)
      .single()

    if (!buyerProfile?.digital_access_enabled) {
      return NextResponse.json({ error: 'デジタルアイテムの購入権限がありません。管理者にお問い合わせください。' }, { status: 403 })
    }

    // Get listing with token and item
    const { data: listing } = await admin
      .from('resale_listings')
      .select(`
        *,
        digital_token:digital_tokens(
          *,
          digital_item:digital_items(*)
        )
      `)
      .eq('id', listing_id)
      .eq('status', 'active')
      .single()

    if (!listing) {
      return NextResponse.json(
        { error: 'この出品は存在しないか、すでに売れています' },
        { status: 404 }
      )
    }

    // Cannot buy your own listing
    if (listing.seller_id === user.id) {
      return NextResponse.json({ error: '自分の出品は購入できません' }, { status: 400 })
    }

    const token = listing.digital_token
    const item = token.digital_item
    const royaltyPercentage = item.royalty_percentage

    // All money goes to FOMUS via Stripe.
    // Seller receives points (not cash) equivalent to their share.
    // Royalty = FOMUS platform fee, sellerAmount = points awarded to seller
    const royaltyAmount = Math.floor(listing.price * (royaltyPercentage / 100))
    const sellerAmount = listing.price - royaltyAmount

    // Create Stripe Checkout session
    // Actual ownership transfer happens in webhook after payment succeeds
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
              name: `${item.name} #${token.token_number} (リセール)`,
              images: item.image_url ? [item.image_url] : [],
            },
            unit_amount: listing.price,
          },
          quantity: 1,
        },
      ],
      customer_email: user.email,
      metadata: {
        type: 'digital_resale',
        resale_listing_id: listing.id,
        digital_token_id: token.id,
        buyer_id: user.id,
        seller_id: listing.seller_id,
        price: listing.price.toString(),
        royalty_amount: royaltyAmount.toString(),
        seller_amount: sellerAmount.toString(),
      },
      success_url: `${origin}/account/digital?purchased=true`,
      cancel_url: `${origin}/digital/marketplace`,
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error('Resale purchase error:', error)
    return NextResponse.json({ error: '購入処理に失敗しました' }, { status: 500 })
  }
}
