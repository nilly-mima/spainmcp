import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function getSupabase() {
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function GET(req: NextRequest) {
  const email = req.nextUrl.searchParams.get('email')
  if (!email) {
    return NextResponse.json({ error: 'email required' }, { status: 400 })
  }

  const range = req.nextUrl.searchParams.get('range') ?? '30d'
  const daysMap: Record<string, number> = { '7d': 7, '30d': 30, '90d': 90 }
  const days = daysMap[range] ?? 30
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()

  const supabase = getSupabase()

  // Confirm user exists via api_keys table (same lookup pattern as /api/account/keys)
  const { data: keyData } = await supabase
    .from('api_keys')
    .select('email')
    .eq('email', email)
    .limit(1)

  if (!keyData || keyData.length === 0) {
    // User exists (authenticated) but may have no keys yet — return zeros
    return NextResponse.json({
      stats: {
        total_calls: 0,
        active_connections: 0,
        published_servers: 0,
        quota_used: 0,
        quota_limit: 25000,
      },
      recent_activity: [],
    })
  }

  // Published servers count
  const { count: publishedCount } = await supabase
    .from('mcp_servers')
    .select('*', { count: 'exact', head: true })
    .eq('owner_email', email)
    .eq('is_active', true)

  // Get all namespace IDs for this user (via auth user lookup)
  // We use the service role so we can query auth.users
  const { data: authUser } = await supabase.auth.admin.listUsers()
  const owner = authUser?.users?.find(u => u.email === email)

  if (!owner) {
    return NextResponse.json({
      stats: {
        total_calls: 0,
        active_connections: 0,
        published_servers: publishedCount ?? 0,
        quota_used: 0,
        quota_limit: 25000,
      },
      recent_activity: [],
    })
  }

  const { data: namespaces } = await supabase
    .from('namespaces')
    .select('id')
    .eq('owner_id', owner.id)

  const nsIds = (namespaces ?? []).map(n => n.id)

  if (nsIds.length === 0) {
    return NextResponse.json({
      stats: {
        total_calls: 0,
        active_connections: 0,
        published_servers: publishedCount ?? 0,
        quota_used: 0,
        quota_limit: 25000,
      },
      recent_activity: [],
    })
  }

  // Active connections count
  const { count: activeConns } = await supabase
    .from('connections')
    .select('*', { count: 'exact', head: true })
    .in('namespace_id', nsIds)
    .eq('status', 'connected')

  // Total calls in range + quota used this calendar month
  const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()

  const [{ count: totalCalls }, { count: quotaUsed }] = await Promise.all([
    supabase
      .from('connection_logs')
      .select('*', { count: 'exact', head: true })
      .in('namespace_id', nsIds)
      .gte('created_at', since),
    supabase
      .from('connection_logs')
      .select('*', { count: 'exact', head: true })
      .in('namespace_id', nsIds)
      .gte('created_at', monthStart),
  ])

  // Recent activity — last 20 logs
  const { data: logs } = await supabase
    .from('connection_logs')
    .select('created_at, tool_name, status_code, duration_ms, method')
    .in('namespace_id', nsIds)
    .order('created_at', { ascending: false })
    .limit(20)

  const recent_activity = (logs ?? []).map(log => ({
    timestamp: log.created_at,
    tool: log.tool_name ?? log.method ?? '—',
    status: log.status_code && log.status_code >= 200 && log.status_code < 300 ? 'success' : 'error',
    latency_ms: log.duration_ms ?? null,
  }))

  return NextResponse.json({
    stats: {
      total_calls: totalCalls ?? 0,
      active_connections: activeConns ?? 0,
      published_servers: publishedCount ?? 0,
      quota_used: quotaUsed ?? 0,
      quota_limit: 25000,
    },
    recent_activity,
  })
}
