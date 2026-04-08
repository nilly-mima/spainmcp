'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabaseBrowser } from '@/lib/supabase-client'

export default function BillingPage() {
  const router = useRouter()
  const [view, setView] = useState<'billing' | 'usage'>('billing')

  useEffect(() => {
    supabaseBrowser.auth.getSession().then(({ data }) => {
      if (!data.session?.user) {
        router.replace('/login?redirect=/account/billing')
      }
    })
  }, [router])

  if (view === 'usage') {
    return (
      <div className="max-w-3xl mx-auto py-8 px-4">
        <button onClick={() => setView('billing')} className="text-sm text-[var(--foreground)] hover:text-blue-600 mb-6 flex items-center gap-1.5">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
          Volver a facturacion
        </button>
        <div className="bg-[var(--card)] border border-dashed border-[var(--border)] rounded-xl p-16 flex flex-col items-center text-center">
          <p className="text-base font-semibold text-[var(--muted)] mb-1">Aun no hay datos de uso</p>
          <p className="text-sm text-[var(--muted)]">Empieza a usar servidores MCP para ver tu consumo aqui.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[var(--foreground)]">Facturacion</h1>
        <p className="text-sm text-[var(--muted)] mt-1">Gestiona tu suscripcion y ajustes de facturacion.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-4">
        {/* Current Plan */}
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-6">
          <div className="flex items-start justify-between mb-1">
            <h2 className="text-lg font-bold text-[var(--foreground)]">Plan actual</h2>
            <span className="text-2xl font-bold text-[var(--foreground)]">Gratis</span>
          </div>
          <p className="text-sm text-[var(--muted)] mb-5">
            Actualmente estas en el plan <strong>Hobby</strong>
          </p>

          <hr className="border-[var(--border)] mb-5" />

          <p className="text-sm font-bold text-[var(--foreground)] mb-3">Caracteristicas del plan</p>
          <div className="flex flex-col gap-2.5 mb-5">
            {[
              '25.000 RPCs/mes',
              '3 Namespaces',
              'OAuth gestionado',
              'Conexiones persistentes',
            ].map(feature => (
              <div key={feature} className="flex items-center gap-2.5 text-sm text-[var(--foreground)]">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                {feature}
              </div>
            ))}
          </div>

          <hr className="border-[var(--border)] mb-5" />

          <div className="flex justify-center">
            <Link href="/precios"
              className="px-6 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors">
              Upgrade a Pay as you Go
            </Link>
          </div>
        </div>

        {/* Usage */}
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-6">
          <h2 className="text-lg font-bold text-[var(--foreground)] mb-4">Uso</h2>

          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-[var(--muted)]">RPCs este mes</span>
            <span className="text-[var(--foreground)] font-medium">0 / 100.000</span>
          </div>
          <div className="w-full h-2 bg-blue-100 dark:bg-blue-950/30 rounded-full overflow-hidden mb-4">
            <div className="h-full bg-blue-400 rounded-full" style={{ width: '0%' }} />
          </div>

          <hr className="border-[var(--border)] mb-4" />

          <button onClick={() => setView('usage')} className="text-sm text-blue-600 hover:underline">
            Ver uso de servidores
          </button>
        </div>
      </div>
    </div>
  )
}
