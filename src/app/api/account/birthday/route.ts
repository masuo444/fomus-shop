import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function PUT(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'ログインが必要です' }, { status: 401 })
    }

    const { birthday } = await request.json()

    if (!birthday) {
      return NextResponse.json({ error: '誕生日を入力してください' }, { status: 400 })
    }

    const { error } = await supabase
      .from('profiles')
      .update({ birthday })
      .eq('id', user.id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ message: '誕生日を保存しました' })
  } catch (error) {
    console.error('Birthday update error:', error)
    return NextResponse.json({ error: 'エラーが発生しました' }, { status: 500 })
  }
}
