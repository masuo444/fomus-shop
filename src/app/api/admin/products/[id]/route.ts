import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { checkAdmin } from '@/lib/auth'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await checkAdmin()
  if (!user) {
    return NextResponse.json({ error: '権限がありません' }, { status: 403 })
  }

  const { id } = await params
  const body = await request.json()
  const admin = createAdminClient()

  // If body has nested structure with product/options/shipping
  const productData = body.product ?? body
  const optionsList = body.options
  const shippingIds: string[] | undefined = body.shipping_method_ids

  // Build update fields - only include fields that are present
  const updateFields: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  }

  const fieldMap: Record<string, string> = {
    name: 'name',
    description: 'description',
    price: 'price',
    compare_at_price: 'compare_at_price',
    images: 'images',
    category_id: 'category_id',
    stock: 'stock',
    is_published: 'is_published',
    item_type: 'item_type',
    tax_rate: 'tax_rate',
    quantity_limit: 'quantity_limit',
    sort_order: 'sort_order',
    preorder_enabled: 'preorder_enabled',
    preorder_start_date: 'preorder_start_date',
    preorder_end_date: 'preorder_end_date',
    weight_grams: 'weight_grams',
  }

  for (const [key, dbField] of Object.entries(fieldMap)) {
    if (key in productData) {
      updateFields[dbField] = productData[key]
    }
  }

  // Update product
  const { data, error } = await admin
    .from('products')
    .update(updateFields)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  // Update options if provided
  if (optionsList !== undefined) {
    // Delete existing options (cascades to choices via DB)
    // First get existing option IDs
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
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await checkAdmin()
  if (!user) {
    return NextResponse.json({ error: '権限がありません' }, { status: 403 })
  }

  const { id } = await params
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

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json({ success: true })
}
