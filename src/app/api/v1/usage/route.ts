import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest } from '@/lib/api-auth'
import { checkRateLimit } from '@/lib/rate-limit'

export async function GET(req: NextRequest) {
  const auth = await authenticateRequest(req)
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const result = await checkRateLimit(auth.userId)

  const now = new Date()
  const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  const resetDate = new Date(now.getFullYear(), now.getMonth() + 1, 1)
    .toISOString()
    .slice(0, 10)

  return NextResponse.json({
    plan: result.plan,
    used: result.used,
    limit: result.limit,
    month,
    resetDate,
  })
}
