import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET(request: Request) {
  // Verify cron secret
  const cronSecret = request.headers.get('x-cron-secret')
  if (cronSecret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const admin = createAdminClient()

    // Call the DB function to expire past-deadline projects
    const { data, error } = await admin.rpc('expire_crowdfunding_projects')

    if (error) {
      console.error('Expire crowdfunding error:', error)
      return NextResponse.json({ error: 'Failed to expire projects' }, { status: 500 })
    }

    return NextResponse.json({
      expired_count: data || 0,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Cron expire-crowdfunding error:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
