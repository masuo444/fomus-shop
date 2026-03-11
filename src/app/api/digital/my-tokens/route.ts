import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'

// GET: List user's owned digital tokens with digital_item details
export async function GET() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'ログインが必要です' }, { status: 401 })
    }

    const admin = createAdminClient()

    // Get tokens with item details
    const { data: tokens, error } = await admin
      .from('digital_tokens')
      .select('*, digital_item:digital_items(*)')
      .eq('current_owner_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Tokens fetch error:', error)
      return NextResponse.json({ error: 'トークンの取得に失敗しました' }, { status: 500 })
    }

    // Get active listings for these tokens
    const tokenIds = (tokens || []).map((t) => t.id)
    let listings: Record<string, { id: string; price: number }> = {}

    if (tokenIds.length > 0) {
      const { data: activeListings } = await admin
        .from('resale_listings')
        .select('id, digital_token_id, price')
        .in('digital_token_id', tokenIds)
        .eq('status', 'active')

      if (activeListings) {
        for (const l of activeListings) {
          listings[l.digital_token_id] = { id: l.id, price: l.price }
        }
      }
    }

    // Get transfer history for each token
    let transfersByToken: Record<string, unknown[]> = {}

    if (tokenIds.length > 0) {
      const { data: transfers } = await admin
        .from('ownership_transfers')
        .select('*')
        .in('digital_token_id', tokenIds)
        .order('created_at', { ascending: false })

      if (transfers) {
        for (const t of transfers) {
          if (!transfersByToken[t.digital_token_id]) {
            transfersByToken[t.digital_token_id] = []
          }
          transfersByToken[t.digital_token_id].push(t)
        }
      }
    }

    return NextResponse.json({
      tokens: tokens || [],
      listings,
      transfers: transfersByToken,
    })
  } catch (error) {
    console.error('My tokens error:', error)
    return NextResponse.json({ error: 'エラーが発生しました' }, { status: 500 })
  }
}
