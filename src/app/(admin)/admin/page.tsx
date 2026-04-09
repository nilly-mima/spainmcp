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

interface RecentSignup {
  email: string
  tier: string
  created_at: string
}

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5">
      <p className="text-xs text-[var(--muted)] mb-1">{label}</p>
      <p className="text-2xl font-bold text-[var(--foreground)]">{value}</p>
      {sub && <p className="text-xs text-[var(--muted)] mt-1">{sub}</p>}
    </div>
  )
}

function fmt(n: number) {
  return n.toLocaleString('es-ES')
}

export default function AdminDashboard() {
  const { adminFetch } = useAdminFetch()
  const [stats, setStats] = useState<Stats | null>(null)
  const [signups, setSignups] = useState<RecentSignup[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function load() {
      try {
        const [analyticsRes, usersRes] = await Promise.all([
          adminFetch('/api/admin/analytics'),
          adminFetch('/api/admin/users?page=1'),
        ])
        if (!analyticsRes.ok) throw new Error('Error cargando analytics')
        const analyticsData = await analyticsRes.json()
        setStats(analyticsData.stats)

        if (usersRes.ok) {
          const usersData = await usersRes.json()
          setSignups((usersData.users ?? []).slice(0, 10))
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Error desconocido')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [adminFetch])

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
        <h1 className="text-xl font-bold text-[var(--foreground)]">Dashboard</h1>
        <p className="text-sm text-[var(--muted)] mt-0.5">Resumen general de SpainMCP</p>
      </div>

      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          <StatCard label="Total usuarios" value={fmt(stats.total_usuarios)} />
          <StatCard label="Usuarios Pro" value={fmt(stats.usuarios_pro)} sub={`${fmt(stats.total_usuarios - stats.usuarios_pro)} gratuitos`} />
          <StatCard label="RPCs este mes" value={fmt(stats.rpcs_mes)} />
          <StatCard label="Revenue estimado" value={`€${fmt(stats.revenue_estimado)}`} sub={`${stats.usuarios_pro} × €29`} />
          <StatCard label="MCPs publicados" value={fmt(stats.mcps_publicados)} />
          <StatCard label="Servidores activos" value={fmt(stats.servidores_activos)} />
        </div>
      )}

      <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-[var(--border)]">
          <h2 className="text-sm font-semibold text-[var(--foreground)]">Registros recientes</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-[var(--muted)] border-b border-[var(--border)]">
                <th className="text-left px-5 py-3 font-medium">Email</th>
                <th className="text-left px-5 py-3 font-medium">Plan</th>
                <th className="text-left px-5 py-3 font-medium">Fecha</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {signups.map((u) => (
                <tr key={u.email + u.created_at} className="hover:bg-[var(--border)]/30 transition-colors">
                  <td className="px-5 py-3 text-[var(--foreground)]">{u.email}</td>
                  <td className="px-5 py-3">
                    <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${u.tier === 'pro' ? 'bg-purple-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-[var(--muted)]'}`}>
                      {u.tier}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-[var(--muted)]">
                    {new Date(u.created_at).toLocaleDateString('es-ES')}
                  </td>
                </tr>
              ))}
              {signups.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-5 py-8 text-center text-[var(--muted)] text-sm">
                    Sin registros todavía
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
