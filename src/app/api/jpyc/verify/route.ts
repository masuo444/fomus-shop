import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { verifyJpycTransfer } from '@/lib/jpyc'
import { sendOrderConfirmation, sendOrderNotificationToAdmin } from '@/lib/email'
import siteConfig from '@/site.config'

export async function POST(request: Request) {
  if (!siteConfig.jpyc.enabled) {
    return NextResponse.json({ error: 'JPYC決済は利用できません' }, { status: 400 })
  }

  try {
    const { order_id, tx_hash } = await request.json()

    if (!order_id || !tx_hash) {
      return NextResponse.json({ error: 'order_id と tx_hash が必要です' }, { status: 400 })
    }

    // Validate tx hash format (0x + 64 hex chars)
    if (!/^0x[a-fA-F0-9]{64}$/.test(tx_hash)) {
      return NextResponse.json({ error: '無効なトランザクションハッシュです' }, { status: 400 })
    }

    const admin = createAdminClient()

    // Load order
    const { data: order } = await admin
      .from('orders')
      .select('*')
      .eq('id', order_id)
      .single()

    if (!order) {
      return NextResponse.json({ error: '注文が見つかりません' }, { status: 404 })
    }

    if (order.status !== 'pending') {
      return NextResponse.json({ error: 'この注文は既に処理されています' }, { status: 400 })
    }

    if (order.payment_method !== 'jpyc') {
      return NextResponse.json({ error: 'この注文はJPYC決済ではありません' }, { status: 400 })
    }

    // Check if this tx_hash is already used by another order
    const { data: existingOrder } = await admin
      .from('orders')
      .select('id')
      .eq('jpyc_tx_hash', tx_hash)
      .neq('id', order_id)
      .limit(1)

    if (existingOrder && existingOrder.length > 0) {
      return NextResponse.json({ error: 'このトランザクションは既に別の注文で使用されています' }, { status: 400 })
    }

    // Verify on-chain
    const result = await verifyJpycTransfer({
      txHash: tx_hash,
      expectedAmount: order.total,
    })

    if (!result.verified) {
      return NextResponse.json({
        verified: false,
        error: result.error || '送金が確認できませんでした',
      })
    }

    // Update order to paid
    await admin
      .from('orders')
      .update({
        status: 'paid',
        jpyc_tx_hash: tx_hash,
        jpyc_from_address: result.from,
      })
      .eq('id', order_id)

    // Deduct stock
    const { data: orderItems } = await admin
      .from('order_items')
      .select('product_id, quantity')
      .eq('order_id', order_id)

    if (orderItems) {
      for (const item of orderItems) {
        try {
          await admin.rpc('decrement_stock', {
            p_product_id: item.product_id,
            p_quantity: item.quantity,
          })
        } catch {
          console.error(`Stock decrement failed for product ${item.product_id}`)
        }
      }
    }

    // Send confirmation emails
    try {
      const { data: fullOrder } = await admin
        .from('orders')
        .select('*, order_items(*)')
        .eq('id', order_id)
        .single()

      if (fullOrder) {
        await sendOrderConfirmation(fullOrder, fullOrder.order_items)
        await sendOrderNotificationToAdmin(fullOrder, fullOrder.order_items)
      }
    } catch (emailErr) {
      console.error('Email send error:', emailErr)
    }

    return NextResponse.json({
      verified: true,
      amount: result.amount,
      from: result.from,
    })
  } catch (error) {
    console.error('JPYC verify error:', error)
    return NextResponse.json({ error: '検証に失敗しました' }, { status: 500 })
  }
}
