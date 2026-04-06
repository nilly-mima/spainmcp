'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabaseBrowser } from '@/lib/supabase-client'
import { createClient } from '@supabase/supabase-js'

type McpServer = {
  namespace: string
  display_name: string
  description: string
  upstream_url: string
  is_active: boolean
  is_verified: boolean
  install_count: number
  last_used_at: string | null
  created_at: string
}

function timeSince(dateStr: string | null): string {
  if (!dateStr) return 'nunca'
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  const hours = Math.floor(mins / 60)
  const days = Math.floor(hours / 24)
  if (days > 0) return `hace ${days}d`
  if (hours > 0) return `hace ${hours}h`
  if (mins > 0) return `hace ${mins}min`
  return 'ahora'
}

export default function MyServersPage() {
  const router = useRouter()
  const [servers, setServers] = useState<McpServer[]>([])
  const [loading, setLoading] = useState(true)
  const [email, setEmail] = useState('')

  useEffect(() => {
    supabaseBrowser.auth.getSession().then(async ({ data }) => {
      const user = data.session?.user
      if (!user?.email) {
        router.replace('/login?next=/account/my-servers')
        return
      }
      setEmail(user.email)

      // Fetch via API route para mantener service role en servidor
      const res = await fetch(`/api/account/servers?email=${encodeURIComponent(user.email)}`)
      if (res.ok) {
        const json = await res.json()
        setServers(json.servers ?? [])
      }
      setLoading(false)
    })
  }, [router])

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto py-12 flex flex-col gap-4">
        {[1,2,3].map(i => (
          <div key={i} className="h-20 rounded-2xl bg-stone-100 dark:bg-stone-800 animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-6 py-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">Mis Servidores</h1>
          <p className="text-sm text-[var(--muted)] mt-1">{email}</p>
        </div>
        <Link
          href="/publish/mcp"
          className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white text-sm font-medium rounded-xl transition-colors"
        >
          + Publicar MCP
        </Link>
      </div>

      {servers.length === 0 ? (
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-12 flex flex-col items-center gap-4 text-center">
          <div className="text-4xl">🔌</div>
          <h2 className="text-lg font-semibold text-[var(--foreground)]">Ningún servidor publicado</h2>
          <p className="text-sm text-[var(--muted)]">Publica tu primer MCP y aparecerá aquí.</p>
          <Link
            href="/publish/mcp"
            className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white text-sm font-medium rounded-xl transition-colors"
          >
            Publicar MCP
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {servers.map(s => (
            <div
              key={s.namespace}
              className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-5 flex items-center justify-between gap-4"
            >
              <div className="flex flex-col gap-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-[var(--foreground)]">{s.display_name}</span>
                  {s.is_verified && (
                    <span className="text-xs bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800 px-2 py-0.5 rounded-full">
                      ✓ Verificado
                    </span>
                  )}
                  {!s.is_active && (
                    <span className="text-xs bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 px-2 py-0.5 rounded-full">
                      Inactivo
                    </span>
                  )}
                </div>
                <p className="text-xs text-[var(--muted)] font-mono">{s.namespace}</p>
                <p className="text-xs text-[var(--muted)]">Último uso: {timeSince(s.last_used_at)}</p>
              </div>
              <Link
                href={`/registry/${s.namespace.replace('@', '')}`}
                className="shrink-0 text-sm text-orange-600 hover:underline font-medium"
              >
                Ver →
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
