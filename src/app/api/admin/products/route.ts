import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { checkShopAccess } from '@/lib/auth'

// GET: List all products (admin sees all shops)
export async function GET() {
  const access = await checkShopAccess('admin')
  if (!access) {
    return NextResponse.json({ error: '権限がありません' }, { status: 403 })
  }

  const admin = createAdminClient()

  const { data: products, error } = await admin
    .from('products')
    .select('*, category:categories(*)')
    .order('sort_order', { ascending: true })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json(products)
}

// POST: Create a product with options and shipping methods
export async function POST(request: NextRequest) {
  const access = await checkShopAccess('admin')
  if (!access) {
    return NextResponse.json({ error: '権限がありません' }, { status: 403 })
  }

  const shopId = access.shopId
  const body = await request.json()
  const { product: productData, options, shipping_method_ids } = body

  // Support legacy format (flat body without nesting)
  const prodFields = productData ?? body
  const optionsList = options ?? []
  const shippingIds: string[] = shipping_method_ids ?? []

  // Use shop_id from request body if provided (admin can set any shop), otherwise use access shopId
  const productShopId = prodFields.shop_id ?? shopId

  const admin = createAdminClient()

  // Create the product
  const { data: product, error: productError } = await admin
    .from('products')
    .insert({
      shop_id: productShopId,
      name: prodFields.name,
      description: prodFields.description || null,
      price: Number(prodFields.price),
      compare_at_price: prodFields.compare_at_price ? Number(prodFields.compare_at_price) : null,
      images: prodFields.images ?? [],
      category_id: prodFields.category_id || null,
      stock: Number(prodFields.stock ?? 0),
      is_published: prodFields.is_published ?? false,
      item_type: prodFields.item_type ?? 'physical',
      tax_rate: Number(prodFields.tax_rate ?? 0.1),
      quantity_limit: prodFields.quantity_limit != null ? Number(prodFields.quantity_limit) : null,
      sort_order: Number(prodFields.sort_order ?? 0),
      preorder_enabled: prodFields.preorder_enabled ?? false,
      preorder_start_date: prodFields.preorder_start_date || null,
      preorder_end_date: prodFields.preorder_end_date || null,
      weight_grams: prodFields.weight_grams != null ? Number(prodFields.weight_grams) : null,
    })
    .select()
    .single()

  if (productError) {
    return NextResponse.json({ error: productError.message }, { status: 400 })
  }

  // Create product options and choices
  for (const opt of optionsList) {
    const { data: option, error: optError } = await admin
      .from('product_options')
      .insert({
        product_id: product.id,
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

  // Create product shipping method links
  if (shippingIds.length > 0) {
    const links = shippingIds.map((sid: string) => ({
      product_id: product.id,
      shipping_method_id: sid,
    }))

    await admin.from('product_shipping_methods').insert(links)
  }

  return NextResponse.json(product)
}
