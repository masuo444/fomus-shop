import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'ログインが必要です' }, { status: 401 })
    }

    const { data: referrals, error } = await supabase
      .from('referrals')
      .select(`
        *,
        referred:profiles!referrals_referred_id_fkey(name, email, created_at)
      `)
      .eq('referrer_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Referrals fetch error:', error)
      return NextResponse.json({ error: '紹介履歴の取得に失敗しました' }, { status: 500 })
    }

    return NextResponse.json(referrals)
  } catch (error) {
    console.error('Referrals API error:', error)
    return NextResponse.json({ error: 'エラーが発生しました' }, { status: 500 })
  }
}
