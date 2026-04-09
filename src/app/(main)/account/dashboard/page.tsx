'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabaseBrowser } from '@/lib/supabase-client'
import { usePlan } from '@/hooks/usePlan'

type Range = '7d' | '30d' | '90d'
type MyItem = { id: string; nombre: string; slug: string; status: string; is_public: boolean; created_at: string }

type Stats = {
  total_calls: number
  active_connections: number
  published_servers: number
  quota_used: number
  quota_limit: number
}

type ActivityRow = {
  timestamp: string
  tool: string
  status: 'success' | 'error'
  latency_ms: number | null
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    draft: 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400',
    pending_review: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400',
    approved: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
    rejected: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
  }
  const labels: Record<string, string> = {
    draft: 'Borrador',
    pending_review: 'En revisión',
    approved: 'Aprobado',
    rejected: 'Rechazado',
  }
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${styles[status] ?? styles.draft}`}>
      {labels[status] ?? status}
    </span>
  )
}

function ItemActions({ item, type, onAction }: {
  item: MyItem
  type: 'mcp' | 'skill'
  onAction: (id: string, type: 'mcp' | 'skill', action: 'request_review' | 'toggle_public' | 'delete') => void
}) {
  const btnClass = 'text-xs px-2 py-1 rounded-lg transition-colors'
  return (
    <div className="flex items-center gap-1 justify-end">
      {(item.status === 'draft' || item.status === 'rejected') && (
        <button onClick={() => onAction(item.id, type, 'request_review')} className={`${btnClass} text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/30`}>
          Solicitar revisión
        </button>
      )}
      {item.status === 'approved' && (
        <button onClick={() => onAction(item.id, type, 'toggle_public')} className={`${btnClass} text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800`}>
          {item.is_public ? 'Hacer privado' : 'Hacer público'}
        </button>
      )}
      <button onClick={() => onAction(item.id, type, 'delete')} className={`${btnClass} text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30`}>
        Eliminar
      </button>
    </div>
  )
}

export default function DashboardPage() {
  const router = useRouter()
  const { tier } = usePlan()
  const [email, setEmail] = useState('')
  const [range, setRange] = useState<Range>('30d')
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<Stats | null>(null)
  const [activity, setActivity] = useState<ActivityRow[]>([])
  const [myMcps, setMyMcps] = useState<MyItem[]>([])
  const [mySkills, setMySkills] = useState<MyItem[]>([])
  const [accessToken, setAccessToken] = useState('')

  useEffect(() => {
    supabaseBrowser.auth.getSession().then(async ({ data }) => {
      const user = data.session?.user
      if (!user?.email) {
        router.replace('/login?redirect=/account/dashboard')
        return
      }
      setEmail(user.email)
      setAccessToken(data.session?.access_token ?? '')
      await loadDashboard(user.email, '30d')
      await loadMyItems(data.session?.access_token ?? '')
      setLoading(false)
    })
  }, [router])

  async function loadDashboard(e: string, r: Range) {
    setLoading(true)
    const res = await fetch(`/api/account/dashboard?email=${encodeURIComponent(e)}&range=${r}`)
    if (res.ok) {
      const json = await res.json()
      setStats(json.stats)
      setActivity(json.recent_activity ?? [])
    }
    setLoading(false)
  }

  async function loadMyItems(token: string) {
    const res = await fetch('/api/account/my-items', { headers: { Authorization: `Bearer ${token}` } })
    if (res.ok) {
      const json = await res.json()
      setMyMcps(json.mcps ?? [])
      setMySkills(json.skills ?? [])
    }
  }

  async function handleItemAction(id: string, type: 'mcp' | 'skill', action: 'request_review' | 'toggle_public' | 'delete') {
    if (action === 'delete' && !confirm('¿Eliminar este item?')) return
    await fetch('/api/account/my-items', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
      body: JSON.stringify({ id, type, action }),
    })
    await loadMyItems(accessToken)
  }

  function handleRangeChange(r: Range) {
    setRange(r)
    if (email) loadDashboard(email, r)
  }

  function formatDate(iso: string) {
    return new Date(iso).toLocaleString('es-ES', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (loading && !stats) {
    return (
      <div className="max-w-5xl mx-auto py-12 px-4 flex flex-col gap-4">
        <div className="h-10 w-48 rounded-xl bg-stone-100 dark:bg-stone-800 animate-pulse" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-28 rounded-2xl bg-stone-100 dark:bg-stone-800 animate-pulse" />
          ))}
        </div>
        <div className="h-48 rounded-2xl bg-stone-100 dark:bg-stone-800 animate-pulse" />
        <div className="h-64 rounded-2xl bg-stone-100 dark:bg-stone-800 animate-pulse" />
      </div>
    )
  }

  const quotaPct = stats ? Math.min(100, Math.round((stats.quota_used / stats.quota_limit) * 100)) : 0
  const quotaColor = quotaPct >= 90 ? 'bg-red-500' : quotaPct >= 70 ? 'bg-yellow-400' : 'bg-blue-500'

  return (
    <div className="max-w-5xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold text-[var(--foreground)]">Dashboard</h1>
            {tier === 'pro' && (
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-600 text-white">Plan Pro</span>
            )}
            {tier === 'free' && (
              <Link href="/account/billing" className="text-xs font-medium px-2 py-0.5 rounded-full border border-[var(--border)] text-[var(--muted)] hover:text-blue-600 hover:border-blue-400 transition-colors">
                Plan gratuito
              </Link>
            )}
          </div>
          <p className="text-sm text-[var(--muted)] mt-0.5">Resumen de actividad y uso de tu cuenta.</p>
        </div>
        <div className="flex items-center gap-1 bg-[var(--card)] border border-[var(--border)] rounded-xl p-1">
          {(['7d', '30d', '90d'] as Range[]).map(r => (
            <button
              key={r}
              onClick={() => handleRangeChange(r)}
              className={`px-3 py-1.5 text-sm rounded-lg font-medium transition-colors ${
                range === r
                  ? 'bg-blue-600 text-white'
                  : 'text-[var(--muted)] hover:text-[var(--foreground)]'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Total API calls */}
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-5">
          <p className="text-xs font-medium text-[var(--muted)] uppercase tracking-wide mb-2">API Calls</p>
          <p className="text-3xl font-bold text-[var(--foreground)]">
            {loading ? '—' : (stats?.total_calls ?? 0).toLocaleString('es-ES')}
          </p>
          <p className="text-xs text-[var(--muted)] mt-1">ultimos {range}</p>
        </div>

        {/* Active connections */}
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-5">
          <p className="text-xs font-medium text-[var(--muted)] uppercase tracking-wide mb-2">Conexiones activas</p>
          <p className="text-3xl font-bold text-[var(--foreground)]">
            {loading ? '—' : stats?.active_connections ?? 0}
          </p>
          <p className="text-xs text-[var(--muted)] mt-1">estado connected</p>
        </div>

        {/* Published servers */}
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-5">
          <p className="text-xs font-medium text-[var(--muted)] uppercase tracking-wide mb-2">Servidores publicados</p>
          <p className="text-3xl font-bold text-[var(--foreground)]">
            {loading ? '—' : stats?.published_servers ?? 0}
          </p>
          <p className="text-xs text-[var(--muted)] mt-1">activos en el registry</p>
        </div>

        {/* Quota used */}
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-5">
          <p className="text-xs font-medium text-[var(--muted)] uppercase tracking-wide mb-2">Cuota mensual</p>
          {tier === 'pro' ? (
            <>
              <p className="text-2xl font-bold text-[var(--foreground)] mb-2">
                {loading ? '—' : (stats?.quota_used ?? 0).toLocaleString('es-ES')}
                <span className="text-sm font-normal text-blue-500"> / Ilimitados</span>
              </p>
              <div className="w-full h-1.5 bg-blue-100 dark:bg-blue-950/40 rounded-full overflow-hidden">
                <div className="h-full rounded-full bg-blue-500" style={{ width: '2%' }} />
              </div>
              <p className="text-xs text-blue-500 mt-1 font-medium">Sin limite en plan Pro</p>
            </>
          ) : (
            <>
              <p className="text-2xl font-bold text-[var(--foreground)] mb-2">
                {loading ? '—' : (stats?.quota_used ?? 0).toLocaleString('es-ES')}
                <span className="text-sm font-normal text-[var(--muted)]">
                  {' '}/ {(stats?.quota_limit ?? 25000).toLocaleString('es-ES')}
                </span>
              </p>
              <div className="w-full h-1.5 bg-stone-100 dark:bg-stone-800 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${quotaColor}`}
                  style={{ width: `${quotaPct}%` }}
                />
              </div>
              <p className="text-xs text-[var(--muted)] mt-1">{quotaPct}% usado este mes</p>
            </>
          )}
        </div>
      </div>

      {/* Usage chart placeholder */}
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-8 mb-6 flex flex-col items-center justify-center min-h-[160px]">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-[var(--muted)] mb-3 opacity-40">
          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
        </svg>
        <p className="text-sm font-medium text-[var(--muted)]">Grafico de uso disponible proximamente</p>
        <p className="text-xs text-[var(--muted)] mt-1 opacity-60">Los datos ya se estan recopilando</p>
      </div>

      {/* Recent Activity */}
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl overflow-hidden mb-6">
        <div className="px-5 py-4 border-b border-[var(--border)]">
          <h2 className="text-sm font-semibold text-[var(--foreground)]">Actividad reciente</h2>
          <p className="text-xs text-[var(--muted)] mt-0.5">Ultimas 20 llamadas a herramientas</p>
        </div>

        {loading ? (
          <div className="p-5 flex flex-col gap-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-8 rounded-lg bg-stone-100 dark:bg-stone-800 animate-pulse" />
            ))}
          </div>
        ) : activity.length === 0 ? (
          <div className="px-5 py-10 text-center">
            <p className="text-sm text-[var(--muted)]">Aun no hay actividad registrada.</p>
            <p className="text-xs text-[var(--muted)] mt-1">Las llamadas apareceran aqui en tiempo real.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border)]">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-[var(--muted)] uppercase tracking-wide">Fecha</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-[var(--muted)] uppercase tracking-wide">Herramienta</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-[var(--muted)] uppercase tracking-wide">Estado</th>
                  <th className="text-right px-5 py-3 text-xs font-semibold text-[var(--muted)] uppercase tracking-wide">Latencia</th>
                </tr>
              </thead>
              <tbody>
                {activity.map((row, i) => (
                  <tr
                    key={i}
                    className="border-b border-[var(--border)] last:border-0 hover:bg-stone-50 dark:hover:bg-stone-800/40 transition-colors"
                  >
                    <td className="px-5 py-3 text-xs text-[var(--muted)] font-mono whitespace-nowrap">
                      {formatDate(row.timestamp)}
                    </td>
                    <td className="px-5 py-3 font-mono text-xs text-[var(--foreground)]">{row.tool}</td>
                    <td className="px-5 py-3">
                      <span
                        className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${
                          row.status === 'success'
                            ? 'bg-green-50 text-green-700 dark:bg-green-950/40 dark:text-green-400'
                            : 'bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${row.status === 'success' ? 'bg-green-500' : 'bg-red-500'}`} />
                        {row.status === 'success' ? 'OK' : 'Error'}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-xs text-[var(--muted)] text-right font-mono">
                      {row.latency_ms != null ? `${row.latency_ms} ms` : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* My MCPs & Skills */}
      {(myMcps.length > 0 || mySkills.length > 0) && (
        <div className="mb-6">
          <h2 className="text-lg font-bold text-[var(--foreground)] mb-3">Mis publicaciones</h2>
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-[var(--muted)] text-xs uppercase tracking-wider">
                  <th className="text-left px-4 py-3 font-medium">Tipo</th>
                  <th className="text-left px-4 py-3 font-medium">Nombre</th>
                  <th className="text-left px-4 py-3 font-medium">Estado</th>
                  <th className="text-left px-4 py-3 font-medium">Visible</th>
                  <th className="text-right px-4 py-3 font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {myMcps.map(item => (
                  <tr key={item.id} className="border-b border-[var(--border)] last:border-0">
                    <td className="px-4 py-3 text-xs font-medium text-blue-600">MCP</td>
                    <td className="px-4 py-3 font-medium text-[var(--foreground)]">{item.nombre}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={item.status} />
                    </td>
                    <td className="px-4 py-3 text-xs">
                      {item.is_public ? <span className="text-green-600">Publico</span> : <span className="text-stone-400">Privado</span>}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <ItemActions item={item} type="mcp" onAction={handleItemAction} />
                    </td>
                  </tr>
                ))}
                {mySkills.map(item => (
                  <tr key={item.id} className="border-b border-[var(--border)] last:border-0">
                    <td className="px-4 py-3 text-xs font-medium text-purple-600">Skill</td>
                    <td className="px-4 py-3 font-medium text-[var(--foreground)]">{item.nombre}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={item.status} />
                    </td>
                    <td className="px-4 py-3 text-xs">
                      {item.is_public ? <span className="text-green-600">Publico</span> : <span className="text-stone-400">Privado</span>}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <ItemActions item={item} type="skill" onAction={handleItemAction} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Link
          href="/account/api-keys"
          className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-5 flex items-center gap-3 hover:border-blue-400 dark:hover:border-blue-600 transition-colors group"
        >
          <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-100 dark:group-hover:bg-blue-950/70 transition-colors">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2">
              <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/>
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-[var(--foreground)]">Generar API Key</p>
            <p className="text-xs text-[var(--muted)]">Acceso programatico</p>
          </div>
        </Link>

        <Link
          href="/account/connections"
          className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-5 flex items-center gap-3 hover:border-blue-400 dark:hover:border-blue-600 transition-colors group"
        >
          <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-100 dark:group-hover:bg-blue-950/70 transition-colors">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2">
              <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/>
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-[var(--foreground)]">Conectar MCP</p>
            <p className="text-xs text-[var(--muted)]">Gestiona conexiones</p>
          </div>
        </Link>

        <Link
          href="/publish/deploy"
          className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-5 flex items-center gap-3 hover:border-blue-400 dark:hover:border-blue-600 transition-colors group"
        >
          <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-100 dark:group-hover:bg-blue-950/70 transition-colors">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-[var(--foreground)]">Publicar servidor</p>
            <p className="text-xs text-[var(--muted)]">Anadir al registry</p>
          </div>
        </Link>
      </div>
    </div>
  )
}
