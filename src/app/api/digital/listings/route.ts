import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'

// GET: List active resale listings (public)
export async function GET() {
  try {
    const admin = createAdminClient()

    const { data: listings, error } = await admin
      .from('resale_listings')
      .select(`
        *,
        digital_token:digital_tokens(
          *,
          digital_item:digital_items(*)
        ),
        seller:profiles(id, name)
      `)
      .eq('status', 'active')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Listings fetch error:', error)
      return NextResponse.json({ error: 'リスティングの取得に失敗しました' }, { status: 500 })
    }

    return NextResponse.json({ listings: listings || [] })
  } catch (error) {
    console.error('Listings error:', error)
    return NextResponse.json({ error: 'エラーが発生しました' }, { status: 500 })
  }
}

// POST: Create resale listing (auth required, must own the token)
export async function POST(request: Request) {
  try {
    const { digital_token_id, price } = await request.json()

    if (!digital_token_id || !price || price <= 0) {
      return NextResponse.json({ error: 'トークンIDと有効な価格が必要です' }, { status: 400 })
    }

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'ログインが必要です' }, { status: 401 })
    }

    const admin = createAdminClient()

    // Verify token ownership
    const { data: token } = await admin
      .from('digital_tokens')
      .select('*, digital_item:digital_items(resale_enabled)')
      .eq('id', digital_token_id)
      .eq('current_owner_id', user.id)
      .eq('status', 'owned')
      .single()

    if (!token) {
      return NextResponse.json(
        { error: 'このトークンを出品する権限がありません' },
        { status: 403 }
      )
    }

    if (!token.digital_item?.resale_enabled) {
      return NextResponse.json(
        { error: 'このアイテムはリセールが許可されていません' },
        { status: 400 }
      )
    }

    // Check for existing active listing
    const { data: existingListing } = await admin
      .from('resale_listings')
      .select('id')
      .eq('digital_token_id', digital_token_id)
      .eq('status', 'active')
      .single()

    if (existingListing) {
      return NextResponse.json(
        { error: 'このトークンはすでに出品されています' },
        { status: 400 }
      )
    }

    // Create listing
    const { data: listing, error: listingError } = await admin
      .from('resale_listings')
      .insert({
        digital_token_id,
        seller_id: user.id,
        price: Math.floor(price),
        status: 'active',
      })
      .select()
      .single()

    if (listingError) {
      console.error('Listing creation error:', listingError)
      return NextResponse.json({ error: '出品に失敗しました' }, { status: 500 })
    }

    // Update token status to listed
    await admin
      .from('digital_tokens')
      .update({ status: 'listed' })
      .eq('id', digital_token_id)

    return NextResponse.json({ listing })
  } catch (error) {
    console.error('Create listing error:', error)
    return NextResponse.json({ error: '出品処理に失敗しました' }, { status: 500 })
  }
}

// DELETE: Cancel listing (auth required, must be seller)
export async function DELETE(request: Request) {
  try {
    const { listing_id } = await request.json()

    if (!listing_id) {
      return NextResponse.json({ error: 'リスティングIDが必要です' }, { status: 400 })
    }

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'ログインが必要です' }, { status: 401 })
    }

    const admin = createAdminClient()

    // Get listing and verify ownership
    const { data: listing } = await admin
      .from('resale_listings')
      .select('*, digital_token:digital_tokens(id)')
      .eq('id', listing_id)
      .eq('seller_id', user.id)
      .eq('status', 'active')
      .single()

    if (!listing) {
      return NextResponse.json(
        { error: 'この出品をキャンセルする権限がありません' },
        { status: 403 }
      )
    }

    // Update listing status
    await admin
      .from('resale_listings')
      .update({ status: 'cancelled' })
      .eq('id', listing_id)

    // Update token status back to owned
    await admin
      .from('digital_tokens')
      .update({ status: 'owned' })
      .eq('id', listing.digital_token.id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Cancel listing error:', error)
    return NextResponse.json({ error: 'キャンセル処理に失敗しました' }, { status: 500 })
  }
}
