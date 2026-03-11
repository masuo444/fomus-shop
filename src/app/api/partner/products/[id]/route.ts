import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { checkPartner } from '@/lib/auth'
import { requireString, sanitizeString, validatePositiveInt, clampNumber, ValidationError } from '@/lib/validation'

// GET: Get a single product (verify it belongs to partner's shop)
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const partner = await checkPartner()
  if (!partner) {
    return NextResponse.json({ error: '権限がありません' }, { status: 403 })
  }

  const { id } = await params
  const supabase = await createClient()

  const { data: product, error } = await supabase
    .from('products')
    .select('*, category:categories(*)')
    .eq('id', id)
    .eq('shop_id', partner.shopId)
    .single()

  if (error || !product) {
    return NextResponse.json({ error: '商品が見つかりません' }, { status: 404 })
  }

  return NextResponse.json(product)
}

// PUT: Update a product (verify ownership, don't allow changing shop_id)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const partner = await checkPartner()
  if (!partner) {
    return NextResponse.json({ error: '権限がありません' }, { status: 403 })
  }

  const { id } = await params
  const supabase = await createClient()

  // Verify product belongs to partner's shop
  const { data: existing } = await supabase
    .from('products')
    .select('id')
    .eq('id', id)
    .eq('shop_id', partner.shopId)
    .single()

  if (!existing) {
    return NextResponse.json({ error: '商品が見つかりません' }, { status: 404 })
  }

  const body = await request.json()

  try {
    const admin = createAdminClient()

    // If body has nested structure with product/options/shipping
    const productData = body.product ?? body
    const optionsList = body.options
    const shippingIds: string[] | undefined = body.shipping_method_ids

    // Build update fields - only include fields that are present
    // Never allow changing shop_id
    const updateFields: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    }

    if ('name' in productData) updateFields.name = requireString(productData.name, '商品名').slice(0, 200)
    if ('description' in productData) updateFields.description = sanitizeString(productData.description, 5000) || null
    if ('price' in productData) updateFields.price = validatePositiveInt(productData.price, '価格')
    if ('compare_at_price' in productData) updateFields.compare_at_price = productData.compare_at_price ? Number(productData.compare_at_price) : null
    if ('images' in productData) updateFields.images = Array.isArray(productData.images) ? productData.images.slice(0, 10) : []
    if ('category_id' in productData) updateFields.category_id = productData.category_id || null
    if ('stock' in productData) updateFields.stock = validatePositiveInt(productData.stock, '在庫数')
    if ('is_published' in productData) updateFields.is_published = productData.is_published
    if ('item_type' in productData) updateFields.item_type = productData.item_type
    if ('tax_rate' in productData) updateFields.tax_rate = clampNumber(productData.tax_rate, 0, 1, 0.1)
    if ('quantity_limit' in productData) updateFields.quantity_limit = productData.quantity_limit != null ? Number(productData.quantity_limit) : null
    if ('sort_order' in productData) updateFields.sort_order = Number(productData.sort_order ?? 0)
    if ('preorder_enabled' in productData) updateFields.preorder_enabled = productData.preorder_enabled
    if ('preorder_start_date' in productData) updateFields.preorder_start_date = productData.preorder_start_date || null
    if ('preorder_end_date' in productData) updateFields.preorder_end_date = productData.preorder_end_date || null
    if ('weight_grams' in productData) updateFields.weight_grams = productData.weight_grams != null ? Number(productData.weight_grams) : null

    // Update product
    const { data, error } = await admin
      .from('products')
      .update(updateFields)
      .eq('id', id)
      .eq('shop_id', partner.shopId) // Extra safety: ensure shop_id match
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

  // Update options if provided
  if (optionsList !== undefined) {
    // Delete existing options (cascades to choices via DB)
    const { data: existingOptions } = await admin
      .from('product_options')
      .select('id')
      .eq('product_id', id)

    if (existingOptions && existingOptions.length > 0) {
      const optionIds = existingOptions.map((o: { id: string }) => o.id)

      // Delete choices first
      await admin
        .from('product_option_choices')
        .delete()
        .in('option_id', optionIds)

      // Then delete options
      await admin
        .from('product_options')
        .delete()
        .eq('product_id', id)
    }

    // Create new options and choices
    for (const opt of optionsList) {
      const { data: option, error: optError } = await admin
        .from('product_options')
        .insert({
          product_id: id,
          name: opt.name,
          required: opt.required ?? false,
          sort_order: opt.sort_order ?? 0,
        })
        .select()
        .single()

      if (optError) continue

      if (opt.choices && opt.choices.length > 0) {
        const choices = opt.choices.map((c: { label: string; price_adjustment?: number; stock?: number | null; sort_order?: number }) => ({
          option_id: option.id,
          label: c.label,
          price_adjustment: Number(c.price_adjustment ?? 0),
          stock: c.stock != null ? Number(c.stock) : null,
          sort_order: c.sort_order ?? 0,
        }))

        await admin.from('product_option_choices').insert(choices)
      }
    }
  }

  // Update shipping method links if provided
  if (shippingIds !== undefined) {
    // Delete existing links
    await admin
      .from('product_shipping_methods')
      .delete()
      .eq('product_id', id)

    // Create new links
    if (shippingIds.length > 0) {
      const links = shippingIds.map((sid: string) => ({
        product_id: id,
        shipping_method_id: sid,
      }))

      await admin.from('product_shipping_methods').insert(links)
    }
  }

    return NextResponse.json(data)
  } catch (err) {
    if (err instanceof ValidationError) {
      return NextResponse.json({ error: err.message }, { status: 400 })
    }
    throw err
  }
}

// DELETE: Delete a product (verify ownership)
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const partner = await checkPartner()
  if (!partner) {
    return NextResponse.json({ error: '権限がありません' }, { status: 403 })
  }

  const { id } = await params
  const supabase = await createClient()

  // Verify product belongs to partner's shop
  const { data: existing } = await supabase
    .from('products')
    .select('id')
    .eq('id', id)
    .eq('shop_id', partner.shopId)
    .single()

  if (!existing) {
    return NextResponse.json({ error: '商品が見つかりません' }, { status: 404 })
  }

  const admin = createAdminClient()

  // Delete related data first
  const { data: existingOptions } = await admin
    .from('product_options')
    .select('id')
    .eq('product_id', id)

  if (existingOptions && existingOptions.length > 0) {
    const optionIds = existingOptions.map((o: { id: string }) => o.id)
    await admin
      .from('product_option_choices')
      .delete()
      .in('option_id', optionIds)
  }

  await admin
    .from('product_options')
    .delete()
    .eq('product_id', id)

  await admin
    .from('product_shipping_methods')
    .delete()
    .eq('product_id', id)

  // Delete product
  const { error } = await admin
    .from('products')
    .delete()
    .eq('id', id)
    .eq('shop_id', partner.shopId) // Extra safety

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json({ success: true })
}
