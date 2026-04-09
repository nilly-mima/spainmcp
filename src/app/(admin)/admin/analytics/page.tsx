'use client'

import { useEffect, useState } from 'react'
import { useAdminFetch } from '@/hooks/useAdminFetch'

interface Stats {
  total_usuarios: number
  usuarios_pro: number
  rpcs_mes: number
  revenue_estimado: number
  mcps_publicados: number
  servidores_activos: number
}

interface TopTool {
  tool: string
  count: number
}

interface SignupDay {
  date: string
  count: number
}

function fmt(n: number) { return n.toLocaleString('es-ES') }

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5">
      <p className="text-xs text-[var(--muted)] mb-1">{label}</p>
      <p className="text-2xl font-bold text-[var(--foreground)]">{value}</p>
      {sub && <p className="text-xs text-[var(--muted)] mt-1">{sub}</p>}
    </div>
  )
}

export default function AdminAnalytics() {
  const { adminFetch } = useAdminFetch()
  const [stats, setStats] = useState<Stats | null>(null)
  const [topTools, setTopTools] = useState<TopTool[]>([])
  const [signupsChart, setSignupsChart] = useState<SignupDay[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function load() {
      try {
        const res = await adminFetch('/api/admin/analytics')
        if (!res.ok) throw new Error('Error cargando analytics')
        const data = await res.json()
        setStats(data.stats)
        setTopTools(data.top_tools ?? [])
        setSignupsChart(data.signups_chart ?? [])
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Error')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [adminFetch])

  const maxSignups = Math.max(...signupsChart.map(d => d.count), 1)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-xl p-4 text-red-600 dark:text-red-400 text-sm">
        {error}
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-bold text-[var(--foreground)]">Analytics</h1>
        <p className="text-sm text-[var(--muted)] mt-0.5">Metricas del mes actual</p>
      </div>

      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          <StatCard label="Revenue estimado" value={`€${fmt(stats.revenue_estimado)}`} sub={`${stats.usuarios_pro} usuarios Pro × €29`} />
          <StatCard label="RPCs totales este mes" value={fmt(stats.rpcs_mes)} />
          <StatCard label="Usuarios Pro activos" value={fmt(stats.usuarios_pro)} />
          <StatCard label="Total usuarios" value={fmt(stats.total_usuarios)} />
          <StatCard label="Servidores activos" value={fmt(stats.servidores_activos)} />
          <StatCard label="MCPs publicados" value={fmt(stats.mcps_publicados)} />
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Top tools */}
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-[var(--border)]">
            <h2 className="text-sm font-semibold text-[var(--foreground)]">Top 10 tools por uso</h2>
          </div>
          <div className="divide-y divide-[var(--border)]">
            {topTools.length === 0 && (
              <p className="px-5 py-6 text-sm text-[var(--muted)] text-center">Sin datos todavía</p>
            )}
            {topTools.map((t, i) => (
              <div key={t.tool} className="flex items-center gap-3 px-5 py-3">
                <span className="text-xs font-mono text-[var(--muted)] w-5 text-right">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-[var(--foreground)] truncate">{t.tool}</p>
                  <div className="mt-1 h-1.5 bg-[var(--border)] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-600 rounded-full"
                      style={{ width: `${(t.count / (topTools[0]?.count ?? 1)) * 100}%` }}
                    />
                  </div>
                </div>
                <span className="text-xs text-[var(--muted)] shrink-0">{fmt(t.count)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Signups chart */}
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-[var(--border)]">
            <h2 className="text-sm font-semibold text-[var(--foreground)]">Registros ultimos 30 dias</h2>
          </div>
          {signupsChart.length === 0 ? (
            <p className="px-5 py-6 text-sm text-[var(--muted)] text-center">Sin datos todavía</p>
          ) : (
            <div className="px-5 py-4">
              <div className="flex items-end gap-1 h-32">
                {signupsChart.map((d) => (
                  <div
                    key={d.date}
                    className="flex-1 group relative"
                    title={`${d.date}: ${d.count}`}
                  >
                    <div
                      className="bg-blue-600 hover:bg-blue-500 rounded-sm transition-colors"
                      style={{ height: `${Math.max(4, (d.count / maxSignups) * 100)}%` }}
                    />
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 bg-[var(--foreground)] text-[var(--background)] text-xs px-1.5 py-0.5 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                      {d.date.slice(5)}: {d.count}
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-between mt-2 text-xs text-[var(--muted)]">
                <span>{signupsChart[0]?.date.slice(5)}</span>
                <span>{signupsChart[signupsChart.length - 1]?.date.slice(5)}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
