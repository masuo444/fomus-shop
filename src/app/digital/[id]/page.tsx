import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import type { DigitalItem } from '@/lib/types'
import DigitalItemDetailClient from './DigitalItemDetailClient'
import { ProductJsonLd, BreadcrumbJsonLd } from '@/components/seo/JsonLd'
import siteConfig from '@/site.config'

interface Props {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const supabase = await createClient()
  const { data } = await supabase
    .from('digital_items')
    .select('name, description, image_url')
    .eq('id', id)
    .single()

  const title = data?.name || 'デジタルアイテム'
  const description = data?.description || siteConfig.description
  const imageUrl = data?.image_url || undefined

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: imageUrl ? [{ url: imageUrl }] : undefined,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: imageUrl ? [imageUrl] : undefined,
    },
  }
}

export default async function DigitalItemDetailPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const { data: rawItem } = await supabase
    .from('digital_items')
    .select('id, shop_id, name, description, image_url, price, total_supply, issued_count, royalty_percentage, resale_enabled, is_published, item_category, created_by, metadata, created_at, updated_at')
    .eq('id', id)
    .eq('is_published', true)
    .single()

  if (!rawItem) {
    notFound()
  }

  // Exclude secret_content from public page
  const item = { ...rawItem, secret_content: null } as DigitalItem

  // Check if user is logged in and has digital access
  const {
    data: { user },
  } = await supabase.auth.getUser()
  const isLoggedIn = !!user

  let hasDigitalAccess = false
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('digital_access_enabled')
      .eq('id', user.id)
      .single()
    hasDigitalAccess = profile?.digital_access_enabled === true
  }

  // Load ownership transfers for this item's tokens
  const { data: tokens } = await supabase
    .from('digital_tokens')
    .select('id')
    .eq('digital_item_id', id)

  const tokenIds = tokens?.map((t) => t.id) || []

  let transfers: {
    id: string
    from_user_id: string | null
    to_user_id: string
    price: number
    royalty_amount: number
    seller_amount: number
    transfer_type: string
    created_at: string
  }[] = []

  if (tokenIds.length > 0) {
    const { data: transfersData } = await supabase
      .from('ownership_transfers')
      .select('id, from_user_id, to_user_id, price, royalty_amount, seller_amount, transfer_type, created_at')
      .in('digital_token_id', tokenIds)
      .order('created_at', { ascending: false })
      .limit(20)

    transfers = transfersData || []
  }

  return (
    <>
      <ProductJsonLd
        name={item.name}
        description={item.description || siteConfig.description}
        price={item.price}
        currency="JPY"
        image={item.image_url ?? undefined}
        url={`/digital/${item.id}`}
        inStock={item.issued_count < item.total_supply}
      />
      <BreadcrumbJsonLd items={[
        { name: 'ホーム', href: '/' },
        { name: 'デジタルアイテム', href: '/digital' },
        { name: item.name, href: `/digital/${item.id}` },
      ]} />
      <DigitalItemDetailClient item={item} transfers={transfers} isLoggedIn={isLoggedIn} hasDigitalAccess={hasDigitalAccess} />
    </>
  )
}
