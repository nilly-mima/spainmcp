'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabaseBrowser } from '@/lib/supabase-client'

type AuthUser = { email?: string } | null

export default function OwnerSection({ namespace, ownerEmail }: { namespace: string; ownerEmail: string }) {
  const [user, setUser] = useState<AuthUser | undefined>(undefined)

  useEffect(() => {
    supabaseBrowser.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null)
    })
    const { data: { subscription } } = supabaseBrowser.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])

  // Cargando
  if (user === undefined) return null

  // No autenticado — invitar a login
  if (user === null) {
    return (
      <div
        className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-5 flex items-center justify-between gap-4"
      >
        <p className="text-sm text-[var(--muted)]">¿Eres el creador de este MCP?</p>
        <Link
          href={`/login?next=/registry/${namespace}`}
          className="text-sm text-orange-600 hover:underline font-medium shrink-0"
        >
          Entrar para ver tu dashboard →
        </Link>
      </div>
    )
  }

  // Autenticado pero no es el owner
  if (user.email !== ownerEmail) return null

  // Es el owner
  return (
    <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-[var(--foreground)]">Panel del creador</h2>
        <span className="bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400 border border-orange-200 dark:border-orange-800 px-3 py-1 rounded-full text-xs font-medium">
          Propietario
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-[var(--background)] border border-[var(--border)] rounded-xl p-4">
          <p className="text-xs text-[var(--muted)] mb-1">Creador</p>
          <p className="text-sm font-medium text-[var(--foreground)]">{ownerEmail}</p>
        </div>
        <div className="bg-[var(--background)] border border-[var(--border)] rounded-xl p-4">
          <p className="text-xs text-[var(--muted)] mb-1">Estado</p>
          <p className="text-sm font-medium text-green-600">Activo ✓</p>
        </div>
      </div>

      <div className="bg-stone-50 dark:bg-stone-900/50 rounded-xl p-4 text-xs text-[var(--muted)]">
        <p className="font-medium text-[var(--foreground)] mb-2">Próximamente en el panel:</p>
        <ul className="space-y-1">
          <li>→ Llamadas por día / semana</li>
          <li>→ Top clientes que te usan</li>
          <li>→ Editar descripción del MCP</li>
        </ul>
      </div>

      <button
        onClick={() => supabaseBrowser.auth.signOut()}
        className="text-xs text-[var(--muted)] hover:text-[var(--foreground)] text-left transition-colors"
      >
        Cerrar sesión
      </button>
    </div>
  )
}
