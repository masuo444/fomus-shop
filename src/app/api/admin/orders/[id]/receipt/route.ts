import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { checkAdmin } from '@/lib/auth'
import { getPublishedShopIds } from '@/lib/shop'
import { formatPrice } from '@/lib/utils'
import siteConfig from '@/site.config'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await checkAdmin()
  if (!user) {
    return NextResponse.json({ error: '権限がありません' }, { status: 403 })
  }

  const publishedIds = await getPublishedShopIds()
  const shopId = publishedIds[0] ?? ''
  const { id } = await params
  const supabase = await createClient()

  const [{ data: order }, { data: items }, { data: shop }] = await Promise.all([
    supabase
      .from('orders')
      .select('*')
      .eq('id', id)
      .eq('shop_id', shopId)
      .single(),
    supabase
      .from('order_items')
      .select('*')
      .eq('order_id', id),
    supabase
      .from('shops')
      .select('name, invoice_registration_number')
      .eq('id', shopId)
      .single(),
  ])

  if (!order) {
    return new NextResponse('注文が見つかりません', { status: 404 })
  }

  const orderItems = items ?? []
  const orderDate = new Date(order.created_at).toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  const itemRows = orderItems
    .map(
      (item: { product_name: string; quantity: number; price: number }) => `
      <tr>
        <td style="padding:10px 12px;border-bottom:1px solid #eee;font-size:14px;">${item.product_name}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #eee;font-size:14px;text-align:center;">${item.quantity}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #eee;font-size:14px;text-align:right;">${formatPrice(item.price)}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #eee;font-size:14px;text-align:right;">${formatPrice(item.price * item.quantity)}</td>
      </tr>`
    )
    .join('')

  const discount = order.subtotal + order.shipping_fee - order.total
  const discountRow = discount > 0
    ? `<tr>
        <td colspan="3" style="padding:6px 12px;font-size:14px;text-align:right;color:#666;">割引</td>
        <td style="padding:6px 12px;font-size:14px;text-align:right;color:#c00;">-${formatPrice(discount)}</td>
      </tr>`
    : ''

  const html = `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1.0">
  <title>領収書 #${order.order_number} - ${siteConfig.name}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Hiragino Sans', sans-serif;
      color: #333;
      background: #f5f5f5;
      padding: 20px;
    }
    .receipt {
      max-width: 800px;
      margin: 0 auto;
      background: #fff;
      border: 1px solid #ddd;
      border-radius: 8px;
      overflow: hidden;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      padding: 40px 40px 20px;
    }
    .shop-info h1 { font-size: 24px; font-weight: 700; letter-spacing: 2px; }
    .shop-info p { font-size: 12px; color: #888; margin-top: 4px; }
    .receipt-title {
      font-size: 28px;
      font-weight: 700;
      color: #111;
    }
    .meta {
      display: flex;
      justify-content: space-between;
      padding: 0 40px 30px;
      border-bottom: 2px solid #111;
    }
    .meta-block p { font-size: 13px; color: #666; line-height: 1.8; }
    .meta-block p strong { color: #111; }
    .items { padding: 0 40px; }
    .items table { width: 100%; border-collapse: collapse; }
    .items th {
      padding: 12px;
      font-size: 12px;
      font-weight: 600;
      color: #999;
      text-transform: uppercase;
      border-bottom: 2px solid #eee;
    }
    .totals {
      padding: 20px 40px 30px;
    }
    .totals table { width: 100%; border-collapse: collapse; }
    .total-row td {
      padding: 8px 12px;
      font-size: 18px;
      font-weight: 700;
      border-top: 2px solid #111;
    }
    .footer {
      padding: 20px 40px 30px;
      text-align: center;
      border-top: 1px solid #eee;
    }
    .footer p { font-size: 12px; color: #999; }
    .print-note {
      text-align: center;
      padding: 20px;
      font-size: 13px;
      color: #888;
    }
    @media print {
      body { background: #fff; padding: 0; }
      .receipt { border: none; border-radius: 0; }
      .print-note { display: none; }
    }
  </style>
</head>
<body>
  <div class="print-note">この画面を印刷してご利用ください（Ctrl+P / Cmd+P）</div>

  <div class="receipt">
    <div class="header">
      <div class="shop-info">
        <h1>${shop?.name || '${siteConfig.name}'}</h1>
        ${shop?.invoice_registration_number ? `<p style="font-size:11px;color:#666;margin-top:4px;">登録番号: ${shop.invoice_registration_number}</p>` : ''}
      </div>
      <div style="text-align:right;">
        <div class="receipt-title">領収書</div>
      </div>
    </div>

    <div class="meta">
      <div class="meta-block">
        <p><strong>${order.shipping_name}</strong> 様</p>
        <p>〒${order.shipping_postal_code}</p>
        <p>${order.shipping_address}</p>
        <p>${order.shipping_phone}</p>
      </div>
      <div class="meta-block" style="text-align:right;">
        <p>注文番号: <strong>#${order.order_number}</strong></p>
        ${order.invoice_number ? `<p>インボイス番号: <strong>${order.invoice_number}</strong></p>` : ''}
        <p>注文日: <strong>${orderDate}</strong></p>
        <p>メール: ${order.email}</p>
      </div>
    </div>

    <div class="items">
      <table>
        <thead>
          <tr>
            <th style="text-align:left;">商品名</th>
            <th style="text-align:center;">数量</th>
            <th style="text-align:right;">単価</th>
            <th style="text-align:right;">小計</th>
          </tr>
        </thead>
        <tbody>
          ${itemRows}
        </tbody>
      </table>
    </div>

    <div class="totals">
      <table>
        <tbody>
          <tr>
            <td colspan="3" style="padding:6px 12px;font-size:14px;text-align:right;color:#666;">小計</td>
            <td style="padding:6px 12px;font-size:14px;text-align:right;">${formatPrice(order.subtotal)}</td>
          </tr>
          <tr>
            <td colspan="3" style="padding:6px 12px;font-size:14px;text-align:right;color:#666;">送料</td>
            <td style="padding:6px 12px;font-size:14px;text-align:right;">${formatPrice(order.shipping_fee)}</td>
          </tr>
          ${discountRow}
          <tr class="total-row">
            <td colspan="3" style="text-align:right;">合計（税込）</td>
            <td style="text-align:right;">${formatPrice(order.total)}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="footer">
      <p>上記の通り領収いたしました。</p>
      <p style="margin-top:8px;">${shop?.name || '${siteConfig.name}'}</p>
      ${shop?.invoice_registration_number ? `<p style="font-size:11px;color:#888;margin-top:4px;">適格請求書発行事業者登録番号: ${shop.invoice_registration_number}</p>` : ''}
    </div>
  </div>
</body>
</html>`

  return new NextResponse(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
    },
  })
}
