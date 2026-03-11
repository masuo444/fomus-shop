import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import siteConfig from '@/site.config'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const { name, email, phone, company, size, quantity, purpose, engravingType, engravingText, deadline, message } = body

    // Validate required fields
    if (!name || !email || !size || !quantity || !purpose) {
      return NextResponse.json({ error: '必須項目を入力してください' }, { status: 400 })
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'メールアドレスの形式が正しくありません' }, { status: 400 })
    }

    const engravingLabels: Record<string, string> = {
      laser: 'レーザー刻印',
      branding: '焼印',
      undecided: '相談したい',
    }

    const adminEmail = siteConfig.adminNotificationEmail
    if (!adminEmail) {
      console.error('ADMIN_NOTIFICATION_EMAIL is not configured')
      return NextResponse.json({ error: '送信設定にエラーがあります' }, { status: 500 })
    }

    // Send notification to admin
    await resend.emails.send({
      from: siteConfig.emailFrom,
      to: adminEmail,
      subject: `【名入れ・オーダーメイド枡】${name}様からのお問い合わせ`,
      html: `<!DOCTYPE html>
<html lang="ja">
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
<div style="max-width:600px;margin:0 auto;padding:20px;">
  <div style="background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e5e5e5;">
    <div style="background:#111;padding:24px;text-align:center;">
      <h1 style="color:#fff;margin:0;font-size:18px;letter-spacing:2px;">${siteConfig.name}</h1>
    </div>
    <div style="padding:32px 24px;">
      <h2 style="margin:0 0 24px;font-size:20px;color:#111;">名入れ・オーダーメイド枡のお問い合わせ</h2>

      <h3 style="font-size:14px;color:#666;margin:24px 0 12px;text-transform:uppercase;letter-spacing:1px;">お客様情報</h3>
      <table style="width:100%;border-collapse:collapse;font-size:14px;">
        <tr><td style="padding:8px 0;color:#666;width:120px;">お名前</td><td style="padding:8px 0;color:#111;">${name}</td></tr>
        <tr><td style="padding:8px 0;color:#666;">メール</td><td style="padding:8px 0;color:#111;"><a href="mailto:${email}">${email}</a></td></tr>
        ${phone ? `<tr><td style="padding:8px 0;color:#666;">電話番号</td><td style="padding:8px 0;color:#111;">${phone}</td></tr>` : ''}
        ${company ? `<tr><td style="padding:8px 0;color:#666;">会社名</td><td style="padding:8px 0;color:#111;">${company}</td></tr>` : ''}
      </table>

      <h3 style="font-size:14px;color:#666;margin:24px 0 12px;text-transform:uppercase;letter-spacing:1px;">ご注文内容</h3>
      <table style="width:100%;border-collapse:collapse;font-size:14px;">
        <tr><td style="padding:8px 0;color:#666;width:120px;">サイズ</td><td style="padding:8px 0;color:#111;">${size}</td></tr>
        <tr><td style="padding:8px 0;color:#666;">数量</td><td style="padding:8px 0;color:#111;">${quantity}</td></tr>
        <tr><td style="padding:8px 0;color:#666;">用途</td><td style="padding:8px 0;color:#111;">${purpose}</td></tr>
        ${deadline ? `<tr><td style="padding:8px 0;color:#666;">希望納期</td><td style="padding:8px 0;color:#111;">${deadline}</td></tr>` : ''}
      </table>

      <h3 style="font-size:14px;color:#666;margin:24px 0 12px;text-transform:uppercase;letter-spacing:1px;">名入れ・刻印</h3>
      <table style="width:100%;border-collapse:collapse;font-size:14px;">
        <tr><td style="padding:8px 0;color:#666;width:120px;">刻印方法</td><td style="padding:8px 0;color:#111;">${engravingLabels[engravingType] || engravingType}</td></tr>
        ${engravingText ? `<tr><td style="padding:8px 0;color:#666;">刻印内容</td><td style="padding:8px 0;color:#111;">${engravingText}</td></tr>` : ''}
      </table>

      ${message ? `
      <h3 style="font-size:14px;color:#666;margin:24px 0 12px;text-transform:uppercase;letter-spacing:1px;">その他ご要望</h3>
      <p style="font-size:14px;color:#111;white-space:pre-wrap;background:#f9f9f9;padding:16px;border-radius:8px;">${message}</p>
      ` : ''}
    </div>
    <div style="padding:16px 24px;background:#f9f9f9;border-top:1px solid #eee;text-align:center;">
      <p style="margin:0;font-size:12px;color:#999;">このメールは${siteConfig.name}のオーダーフォームから自動送信されています</p>
    </div>
  </div>
</div>
</body>
</html>`,
    })

    // Send auto-reply to customer
    await resend.emails.send({
      from: siteConfig.emailFrom,
      to: email,
      subject: `【${siteConfig.name}】お問い合わせありがとうございます`,
      html: `<!DOCTYPE html>
<html lang="ja">
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
<div style="max-width:600px;margin:0 auto;padding:20px;">
  <div style="background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e5e5e5;">
    <div style="background:#111;padding:24px;text-align:center;">
      <h1 style="color:#fff;margin:0;font-size:18px;letter-spacing:2px;">${siteConfig.name}</h1>
    </div>
    <div style="padding:32px 24px;">
      <h2 style="margin:0 0 24px;font-size:20px;color:#111;">お問い合わせありがとうございます</h2>
      <p style="font-size:14px;color:#333;line-height:1.8;">
        ${name}様<br><br>
        名入れ・オーダーメイド枡のお問い合わせをいただき、ありがとうございます。<br>
        内容を確認の上、担当者より1〜3営業日以内にご連絡いたします。<br><br>
        しばらくお待ちくださいませ。
      </p>
      <div style="margin-top:24px;padding:16px;background:#f9f9f9;border-radius:8px;">
        <p style="margin:0 0 8px;font-size:13px;color:#666;">お問い合わせ内容</p>
        <p style="margin:0;font-size:14px;color:#111;">枡サイズ: ${size}</p>
        <p style="margin:0;font-size:14px;color:#111;">数量: ${quantity}</p>
        <p style="margin:0;font-size:14px;color:#111;">用途: ${purpose}</p>
      </div>
    </div>
    <div style="padding:16px 24px;background:#f9f9f9;border-top:1px solid #eee;text-align:center;">
      <p style="margin:0;font-size:12px;color:#999;">${siteConfig.name}</p>
    </div>
  </div>
</div>
</body>
</html>`,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Custom masu contact error:', error)
    return NextResponse.json({ error: '送信に失敗しました。しばらく経ってからお試しください。' }, { status: 500 })
  }
}
