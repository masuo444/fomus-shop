import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import DigitalItemDetailClient from './DigitalItemDetailClient'

interface Props {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const supabase = await createClient()
  const { data } = await supabase
    .from('digital_items')
    .select('name, description')
    .eq('id', id)
    .single()

  return {
    title: data?.name || 'デジタルアイテム',
    description: data?.description || undefined,
  }
}

export default async function DigitalItemDetailPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const { data: item } = await supabase
    .from('digital_items')
    .select('*')
    .eq('id', id)
    .eq('is_published', true)
    .single()

  if (!item) {
    notFound()
  }

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

  return <DigitalItemDetailClient item={item} transfers={transfers} isLoggedIn={isLoggedIn} hasDigitalAccess={hasDigitalAccess} />
}
