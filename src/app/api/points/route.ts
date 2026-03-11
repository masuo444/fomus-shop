import { NextResponse } from 'next/server'

export async function GET() {
  // Points system has been removed
  return NextResponse.json([])
}
