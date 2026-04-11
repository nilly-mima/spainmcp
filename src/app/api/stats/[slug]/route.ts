import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function getServiceClient() {
  return createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
}

// GET /api/stats/:slug — estadísticas reales de un MCP en el gateway.
// Fuente: tablas gateway_logs + vista mcp_stats_daily.
// Devuelve el formato que consume PerformanceTab en el detail page.
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const supabase = getServiceClient()

  // Últimos 30 días
  const since = new Date()
  since.setDate(since.getDate() - 30)
  const sinceISO = since.toISOString()

  // 1) Stats agregadas (totales + p95)
  const { data: logs } = await supabase
    .from('gateway_logs')
    .select('status_code, duration_ms, user_agent, created_at')
    .eq('slug', slug)
    .gte('created_at', sinceISO)

  const rows = logs ?? []
  const total = rows.length
  const ok = rows.filter(r => r.status_code >= 200 && r.status_code < 300).length
  const errors = rows.filter(r => r.status_code >= 400).length
  const durations = rows.map(r => r.duration_ms ?? 0).filter(d => d > 0).sort((a, b) => a - b)
  const avg = durations.length ? Math.round(durations.reduce((s, d) => s + d, 0) / durations.length) : 0
  const p95 = durations.length ? durations[Math.floor(durations.length * 0.95)] ?? durations[durations.length - 1] : 0
  const uptimePct = total > 0 ? (ok / total) * 100 : 100

  // 2) Serie diaria de 30 puntos (días con 0 se rellenan)
  const byDay = new Map<string, { calls: number; ok: number; sum_ms: number }>()
  for (const r of rows) {
    const day = new Date(r.created_at).toISOString().slice(0, 10)
    const acc = byDay.get(day) ?? { calls: 0, ok: 0, sum_ms: 0 }
    acc.calls += 1
    if (r.status_code >= 200 && r.status_code < 300) acc.ok += 1
    acc.sum_ms += r.duration_ms ?? 0
    byDay.set(day, acc)
  }
  const daily: { day: string; calls: number; avg_ms: number; uptime: number }[] = []
  for (let i = 29; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const day = d.toISOString().slice(0, 10)
    const acc = byDay.get(day)
    if (acc) {
      daily.push({
        day,
        calls: acc.calls,
        avg_ms: Math.round(acc.sum_ms / acc.calls),
        uptime: (acc.ok / acc.calls) * 100,
      })
    } else {
      daily.push({ day, calls: 0, avg_ms: 0, uptime: 100 })
    }
  }

  // 3) Top clients (por user_agent, normalizado)
  const clientCounts = new Map<string, number>()
  for (const r of rows) {
    const ua = r.user_agent ?? 'unknown'
    // Normalizar nombre cliente
    let label = 'Otro'
    if (/claude/i.test(ua)) label = 'Claude'
    else if (/cursor/i.test(ua)) label = 'Cursor'
    else if (/curl/i.test(ua)) label = 'curl'
    else if (/python/i.test(ua)) label = 'Python'
    else if (/node/i.test(ua)) label = 'Node.js'
    else if (/mozilla/i.test(ua)) label = 'Browser'
    clientCounts.set(label, (clientCounts.get(label) ?? 0) + 1)
  }
  const topClients = Array.from(clientCounts.entries())
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)

  return NextResponse.json({
    slug,
    totals: {
      calls: total,
      ok,
      errors,
      avg_ms: avg,
      p95_ms: p95,
      uptime_pct: uptimePct,
    },
    daily,
    topClients,
    has_data: total > 0,
  })
}
