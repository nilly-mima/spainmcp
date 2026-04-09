import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { isAdmin } from '@/lib/admin-auth'

function getServiceClient() {
  return createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
}

async function verifyAdmin(req: NextRequest): Promise<boolean> {
  const email = req.headers.get('x-admin-email') ?? ''
  return isAdmin(email)
}

export async function GET(req: NextRequest) {
  if (!(await verifyAdmin(req))) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
  }

  const supabase = getServiceClient()
  const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()

  const [
    { count: totalUsers },
    { count: proUsers },
    { count: rpcsMonth },
    { count: publishedServers },
    { count: activeServers },
  ] = await Promise.all([
    supabase.from('api_keys').select('*', { count: 'exact', head: true }),
    supabase.from('api_keys').select('*', { count: 'exact', head: true }).eq('tier', 'pro').eq('is_active', true),
    supabase.from('connection_logs').select('*', { count: 'exact', head: true }).gte('created_at', monthStart),
    supabase.from('mcp_servers').select('*', { count: 'exact', head: true }),
    supabase.from('mcp_servers').select('*', { count: 'exact', head: true }).eq('is_active', true),
  ])

  // Top 10 users by RPCs this month via namespaces join
  const { data: topUsersRaw } = await supabase
    .from('connection_logs')
    .select('namespace_id')
    .gte('created_at', monthStart)

  // Top 10 tools by usage
  const { data: topToolsRaw } = await supabase
    .from('connection_logs')
    .select('tool_name')
    .gte('created_at', monthStart)
    .not('tool_name', 'is', null)

  // Count tool usage
  const toolCounts: Record<string, number> = {}
  for (const row of topToolsRaw ?? []) {
    if (row.tool_name) {
      toolCounts[row.tool_name] = (toolCounts[row.tool_name] ?? 0) + 1
    }
  }
  const topTools = Object.entries(toolCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([tool, count]) => ({ tool, count }))

  // Signups per day last 30 days
  const { data: signups } = await supabase
    .from('api_keys')
    .select('created_at')
    .gte('created_at', thirtyDaysAgo)
    .order('created_at', { ascending: true })

  const signupsByDay: Record<string, number> = {}
  for (const row of signups ?? []) {
    const day = row.created_at.slice(0, 10)
    signupsByDay[day] = (signupsByDay[day] ?? 0) + 1
  }

  const signupsChart = Object.entries(signupsByDay)
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date))

  // Namespace counts by user for top RPC users
  const nsCounts: Record<string, number> = {}
  for (const row of topUsersRaw ?? []) {
    if (row.namespace_id) {
      nsCounts[row.namespace_id] = (nsCounts[row.namespace_id] ?? 0) + 1
    }
  }

  const revenueEstimado = (proUsers ?? 0) * 29

  return NextResponse.json({
    stats: {
      total_usuarios: totalUsers ?? 0,
      usuarios_pro: proUsers ?? 0,
      rpcs_mes: rpcsMonth ?? 0,
      revenue_estimado: revenueEstimado,
      mcps_publicados: publishedServers ?? 0,
      servidores_activos: activeServers ?? 0,
    },
    top_tools: topTools,
    signups_chart: signupsChart,
  })
}
