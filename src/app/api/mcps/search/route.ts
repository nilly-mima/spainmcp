import { NextResponse } from 'next/server'
import { searchMcps } from '@/lib/mcps'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const q = searchParams.get('q') || ''

  if (q.length < 2) {
    return NextResponse.json({ mcps: [], total: 0 })
  }

  const mcps = searchMcps(q)
  return NextResponse.json({ mcps, total: mcps.length })
}
