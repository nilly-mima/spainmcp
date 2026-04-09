'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabaseBrowser } from '@/lib/supabase-client'

type UsageData = {
  used: number
  limit: number
  tier: string
  month: string
  resetDate: string
  byTool: Record<string, number>
}

const FREE_FEATURES = [
  '25.000 RPCs/mes',
  '3 Namespaces',
  'OAuth gestionado',
  'Conexiones persistentes',
  'Soporte por email',
]

const PRO_FEATURES = [
  'RPCs ilimitados',
  'Namespaces ilimitados',
  'Conexiones ilimitadas',
  'OAuth gestionado',
  'Soporte prioritario',
  'Analytics avanzado',
]

export default function BillingPageWrapper() {
  return (
    <Suspense fallback={<div className="max-w-4xl mx-auto py-12"><div className="h-32 rounded-2xl bg-stone-100 dark:bg-stone-800 animate-pulse" /></div>}>
      <BillingPage />
    </Suspense>
  )
}

function BillingPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [usage, setUsage] = useState<UsageData | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [flash, setFlash] = useState<{ type: 'success' | 'error'; msg: string } | null>(null)

  useEffect(() => {
    supabaseBrowser.auth.getSession().then(async ({ data }) => {
      const session = data.session
      if (!session?.user?.email) {
        router.replace('/login?redirect=/account/billing')
        return
      }

      setAccessToken(session.access_token)

      const res = await fetch(
        `/api/account/usage?email=${encodeURIComponent(session.user.email)}`
      )
      if (res.ok) {
        setUsage(await res.json())
      }
      setLoading(false)
    })
  }, [router])

  useEffect(() => {
    if (searchParams.get('success') === 'true') {
      setFlash({ type: 'success', msg: 'Plan actualizado a Pro correctamente.' })
    } else if (searchParams.get('canceled') === 'true') {
      setFlash({ type: 'error', msg: 'Proceso de pago cancelado.' })
    }
  }, [searchParams])

  async function handleUpgrade() {
    if (!accessToken) return
    setActionLoading(true)
    try {
      const res = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ plan: 'pro' }),
      })
      const json = await res.json()
      if (json.url) {
        window.location.href = json.url
      } else {
        setFlash({ type: 'error', msg: json.error ?? 'Error al crear sesion de pago' })
      }
    } finally {
      setActionLoading(false)
    }
  }

  async function handlePortal() {
    if (!accessToken) return
    setActionLoading(true)
    try {
      const res = await fetch('/api/billing/portal', {
        method: 'POST',
        headers: { Authorization: `Bearer ${accessToken}` },
      })
      const json = await res.json()
      if (json.url) {
        window.location.href = json.url
      } else {
        setFlash({ type: 'error', msg: json.error ?? 'Error al abrir portal' })
      }
    } finally {
      setActionLoading(false)
    }
  }

  const isPro = usage?.tier === 'pro'
  const used = usage?.used ?? 0
  const limit = usage?.limit ?? 25000
  const pct = isPro ? 0 : Math.min(100, Math.round((used / limit) * 100))
  const barColor = pct >= 90 ? 'bg-red-500' : pct >= 70 ? 'bg-yellow-400' : 'bg-blue-500'
  const toolEntries = Object.entries(usage?.byTool ?? {}).sort((a, b) => b[1] - a[1]).slice(0, 8)

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4 flex flex-col gap-4">
        <div className="h-8 w-40 rounded-xl bg-stone-100 dark:bg-stone-800 animate-pulse" />
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-4">
          <div className="h-72 rounded-xl bg-stone-100 dark:bg-stone-800 animate-pulse" />
          <div className="h-72 rounded-xl bg-stone-100 dark:bg-stone-800 animate-pulse" />
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[var(--foreground)]">Facturacion</h1>
        <p className="text-sm text-[var(--muted)] mt-1">Gestiona tu suscripcion y ajustes de facturacion.</p>
      </div>

      {flash && (
        <div
          className={`mb-5 px-4 py-3 rounded-lg text-sm font-medium ${
            flash.type === 'success'
              ? 'bg-green-50 text-green-700 border border-green-200 dark:bg-green-950/30 dark:text-green-400 dark:border-green-900'
              : 'bg-red-50 text-red-700 border border-red-200 dark:bg-red-950/30 dark:text-red-400 dark:border-red-900'
          }`}
        >
          {flash.msg}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-4 mb-6">
        {/* Plan actual */}
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-6">
          <div className="flex items-start justify-between mb-1">
            <h2 className="text-lg font-bold text-[var(--foreground)]">Plan actual</h2>
            <div className="flex items-center gap-2">
              <span
                className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                  isPro
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400'
                    : 'bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-400'
                }`}
              >
                {isPro ? 'Pro' : 'Gratis'}
              </span>
              {isPro && (
                <span className="text-2xl font-bold text-[var(--foreground)]">€29/mes</span>
              )}
            </div>
          </div>
          <p className="text-sm text-[var(--muted)] mb-5">
            {isPro
              ? 'Tienes acceso completo a todas las funciones Pro.'
              : 'Actualmente estas en el plan gratuito.'}
          </p>

          <hr className="border-[var(--border)] mb-5" />

          <p className="text-sm font-bold text-[var(--foreground)] mb-3">Caracteristicas incluidas</p>
          <div className="flex flex-col gap-2.5 mb-6">
            {(isPro ? PRO_FEATURES : FREE_FEATURES).map(f => (
              <div key={f} className="flex items-center gap-2.5 text-sm text-[var(--foreground)]">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                {f}
              </div>
            ))}
          </div>

          <hr className="border-[var(--border)] mb-5" />

          <div className="flex justify-center">
            {isPro ? (
              <button
                onClick={handlePortal}
                disabled={actionLoading}
                className="px-6 py-2.5 rounded-lg bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-[var(--foreground)] text-sm font-semibold transition-colors disabled:opacity-50"
              >
                {actionLoading ? 'Cargando...' : 'Gestionar suscripcion'}
              </button>
            ) : (
              <button
                onClick={handleUpgrade}
                disabled={actionLoading}
                className="px-6 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors disabled:opacity-50"
              >
                {actionLoading ? 'Redirigiendo...' : 'Actualizar a Pro — €29/mes'}
              </button>
            )}
          </div>
        </div>

        {/* Uso mensual */}
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-6">
          <h2 className="text-lg font-bold text-[var(--foreground)] mb-4">Uso este mes</h2>

          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-[var(--muted)]">RPCs</span>
            <span className="text-[var(--foreground)] font-medium">
              {used.toLocaleString('es-ES')}
              {!isPro && ` / ${limit.toLocaleString('es-ES')}`}
              {isPro && ' / ilimitados'}
            </span>
          </div>

          {!isPro && (
            <div className="w-full h-2 bg-stone-100 dark:bg-stone-800 rounded-full overflow-hidden mb-1">
              <div className={`h-full ${barColor} rounded-full transition-all`} style={{ width: `${pct}%` }} />
            </div>
          )}

          <p className="text-xs text-[var(--muted)] mb-5">
            Reinicio el {usage?.resetDate ?? '—'}
          </p>

          <hr className="border-[var(--border)] mb-4" />

          <p className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wide mb-3">Por herramienta</p>

          {toolEntries.length === 0 ? (
            <p className="text-sm text-[var(--muted)]">Sin datos aun este mes.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {toolEntries.map(([tool, count]) => (
                <div key={tool} className="flex items-center justify-between text-sm">
                  <span className="font-mono text-xs text-[var(--foreground)] truncate max-w-[160px]">{tool}</span>
                  <span className="text-[var(--muted)] tabular-nums">{count.toLocaleString('es-ES')}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Comparacion de planes */}
      {!isPro && (
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-[var(--border)]">
            <h2 className="text-sm font-semibold text-[var(--foreground)]">Comparativa de planes</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border)]">
                  <th className="text-left px-6 py-3 text-xs font-semibold text-[var(--muted)] uppercase tracking-wide">Caracteristica</th>
                  <th className="text-center px-6 py-3 text-xs font-semibold text-[var(--muted)] uppercase tracking-wide">Gratis</th>
                  <th className="text-center px-6 py-3 text-xs font-semibold text-blue-600 uppercase tracking-wide">Pro</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['RPCs/mes', '25.000', 'Ilimitados'],
                  ['Namespaces', '3', 'Ilimitados'],
                  ['Conexiones', '3', 'Ilimitadas'],
                  ['Servidores publicados', '3', 'Ilimitados'],
                  ['Soporte', 'Email', 'Prioritario'],
                  ['Analytics', 'Basico', 'Avanzado'],
                ].map(([feature, free, pro]) => (
                  <tr key={feature} className="border-b border-[var(--border)] last:border-0">
                    <td className="px-6 py-3 text-[var(--foreground)]">{feature}</td>
                    <td className="px-6 py-3 text-center text-[var(--muted)]">{free}</td>
                    <td className="px-6 py-3 text-center text-blue-600 font-medium">{pro}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-6 py-4 border-t border-[var(--border)] flex justify-center">
            <button
              onClick={handleUpgrade}
              disabled={actionLoading}
              className="px-8 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors disabled:opacity-50"
            >
              {actionLoading ? 'Redirigiendo...' : 'Empezar con Pro — €29/mes'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
