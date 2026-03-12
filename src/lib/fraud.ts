import { createClient } from '@supabase/supabase-js'

const adminClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

interface FraudCheckResult {
  flagged: boolean
  reasons: string[]
}

export async function checkOrderFraud(
  userId: string | null,
  email: string,
  ip: string,
  totalAmount: number
): Promise<FraudCheckResult> {
  const reasons: string[] = []

  // High-value order check (over 500,000 JPY)
  if (totalAmount > 500000) {
    reasons.push('high_value_order')
  }

  if (userId) {
    // Velocity check: more than 5 orders in last 10 minutes
    const tenMinAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString()
    const { count } = await adminClient
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('created_at', tenMinAgo)

    if (count && count >= 5) {
      reasons.push('velocity_exceeded')
    }
  }

  // Email pattern check - disposable email domains
  const disposableDomains = ['tempmail.com', 'throwaway.email', 'guerrillamail.com', 'mailinator.com']
  const emailDomain = email.split('@')[1]?.toLowerCase()
  if (emailDomain && disposableDomains.includes(emailDomain)) {
    reasons.push('disposable_email')
  }

  return {
    flagged: reasons.length > 0,
    reasons,
  }
}
