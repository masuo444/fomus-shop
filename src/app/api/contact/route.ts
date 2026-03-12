import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: NextRequest) {
  try {
    const { name, email, subject, message } = await request.json()

    if (!name || !email || !message) {
      return NextResponse.json({ error: '必須項目を入力してください' }, { status: 400 })
    }

    const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL
    if (!adminEmail) {
      console.error('ADMIN_NOTIFICATION_EMAIL not set')
      return NextResponse.json({ error: 'サーバーエラー' }, { status: 500 })
    }

    await resend.emails.send({
      from: process.env.EMAIL_FROM || `Contact <noreply@resend.dev>`,
      to: adminEmail,
      subject: `【お問い合わせ】${subject} - ${name}`,
      html: `
        <h2>お問い合わせ</h2>
        <table style="border-collapse:collapse;width:100%;max-width:600px">
          <tr><td style="padding:8px;border:1px solid #eee;font-weight:bold;width:120px">お名前</td><td style="padding:8px;border:1px solid #eee">${name}</td></tr>
          <tr><td style="padding:8px;border:1px solid #eee;font-weight:bold">メール</td><td style="padding:8px;border:1px solid #eee">${email}</td></tr>
          <tr><td style="padding:8px;border:1px solid #eee;font-weight:bold">種別</td><td style="padding:8px;border:1px solid #eee">${subject}</td></tr>
          <tr><td style="padding:8px;border:1px solid #eee;font-weight:bold">内容</td><td style="padding:8px;border:1px solid #eee;white-space:pre-wrap">${message}</td></tr>
        </table>
      `,
      replyTo: email,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Contact form error:', error)
    return NextResponse.json({ error: '送信に失敗しました' }, { status: 500 })
  }
}
