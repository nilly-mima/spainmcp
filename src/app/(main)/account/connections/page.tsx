'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabaseBrowser } from '@/lib/supabase-client'

export default function ConnectionsPage() {
  const router = useRouter()

  useEffect(() => {
    supabaseBrowser.auth.getSession().then(({ data }) => {
      if (!data.session?.user) {
        router.replace('/login?redirect=/account/connections')
      }
    })
  }, [router])

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[var(--foreground)]">Conexiones</h1>
        <p className="text-sm text-[var(--muted)] mt-1">
          Consulta tus namespaces de la Connect API y sus conexiones.
        </p>
      </div>

      <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-12 flex flex-col items-center text-center">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-stone-400 mb-4">
          <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/>
          <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/>
        </svg>
        <h2 className="text-lg font-bold text-[var(--foreground)] mb-2">Aun no hay conexiones</h2>
        <p className="text-sm text-[var(--muted)] mb-5 max-w-sm">
          Crea tu primer namespace usando la Connect API para empezar a gestionar conexiones MCP para tus usuarios.
        </p>
        <a
          href="/docs/clientes/conectar-mcps"
          target="_blank"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-[var(--border)] text-sm font-medium text-[var(--foreground)] hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors"
        >
          Empezar
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
        </a>
      </div>
    </div>
  )
}
