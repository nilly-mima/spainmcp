import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { checkRateLimit } from '@/lib/rate-limit'

// NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY not used here —
// this is a server route, uses service role for full access.
function getServiceClient() {
  return createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
}

function monthStart(): string {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
}

export async function GET(req: NextRequest) {
  const email = req.nextUrl.searchParams.get('email')
  if (!email) {
    return NextResponse.json({ error: 'email requerido' }, { status: 400 })
  }

  const now = new Date()
  const resetDate = new Date(now.getFullYear(), now.getMonth() + 1, 1).toISOString().slice(0, 10)
  const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`

  const rateResult = await checkRateLimit(email)

  const supabase = getServiceClient()

  // Resolve namespace IDs for this email
  const { data: authUsers } = await supabase.auth.admin.listUsers()
  const authUser = (authUsers?.users ?? []).find((u) => u.email === email)

  let byTool: Record<string, number> = {}

  if (authUser) {
    const { data: namespaces } = await supabase
      .from('namespaces')
      .select('id')
      .eq('owner_id', authUser.id)

    const nsIds = (namespaces ?? []).map((n: { id: string }) => n.id)

    if (nsIds.length > 0) {
      const { data: logs } = await supabase
        .from('connection_logs')
        .select('tool_name')
        .in('namespace_id', nsIds)
        .gte('created_at', monthStart())

      for (const row of logs ?? []) {
        const key = (row.tool_name as string) ?? 'unknown'
        byTool[key] = (byTool[key] ?? 0) + 1
      }
    }
  }

  return NextResponse.json({
    used: rateResult.used,
    limit: rateResult.limit,
    tier: rateResult.plan,
    month,
    resetDate,
    byTool,
  })
}
