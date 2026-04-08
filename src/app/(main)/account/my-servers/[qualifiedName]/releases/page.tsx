'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabaseBrowser } from '@/lib/supabase-client'
import Link from 'next/link'

type Release = {
  id: string
  version: string
  status: string
  deploy_url: string | null
  build_log: string | null
  error_message: string | null
  created_at: string
  deployed_at: string | null
  isCurrent: boolean
}

export default function ReleasesPage() {
  const params = useParams()
  const router = useRouter()
  const qualifiedName = decodeURIComponent(params.qualifiedName as string)

  const [releases, setReleases] = useState<Release[]>([])
  const [loading, setLoading] = useState(true)
  const [rolling, setRolling] = useState<string | null>(null)
  const [expandedLog, setExpandedLog] = useState<string | null>(null)
  const [apiKey, setApiKey] = useState('')

  useEffect(() => {
    const key = localStorage.getItem('spainmcp_api_key') ?? ''
    setApiKey(key)

    supabaseBrowser.auth.getSession().then(({ data }) => {
      if (!data.session?.user?.email) {
        router.replace('/login?redirect=/account/my-servers')
        return
      }
      loadReleases()
    })
  }, [router])

  async function loadReleases() {
    const res = await fetch(`/api/v1/servers/${encodeURIComponent(qualifiedName)}/releases`)
    if (res.ok) {
      const json = await res.json()
      setReleases(json.releases ?? [])
    }
    setLoading(false)
  }

  async function handleRollback(releaseId: string) {
    if (!confirm('Rollback a esta version? La version actual sera reemplazada.')) return
    setRolling(releaseId)

    const res = await fetch(`/api/v1/servers/${encodeURIComponent(qualifiedName)}/releases`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ releaseId }),
    })

    if (res.ok) {
      await loadReleases()
    } else {
      const json = await res.json()
      alert(`Error: ${json.error}`)
    }
    setRolling(null)
  }

  function formatDate(iso: string) {
    return new Date(iso).toLocaleString('es-ES', {
      day: 'numeric', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    })
  }

  function statusColor(status: string) {
    switch (status) {
      case 'active': return 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20'
      case 'building': return 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20'
      case 'failed': return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20'
      default: return 'text-stone-600 dark:text-stone-400 bg-stone-50 dark:bg-stone-900/20'
    }
  }

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto py-12">
        <div className="h-32 rounded-2xl bg-stone-100 dark:bg-stone-800 animate-pulse" />
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <div className="mb-6">
        <Link href="/account/my-servers" className="text-sm text-blue-600 hover:underline mb-2 inline-block">
          ← Mis servidores
        </Link>
        <h1 className="text-2xl font-bold text-[var(--foreground)]">Releases</h1>
        <p className="text-sm text-[var(--muted)] mt-1">
          <code className="bg-stone-100 dark:bg-stone-800 px-1.5 py-0.5 rounded text-xs">{qualifiedName}</code>
          {' · '}{releases.length} release{releases.length !== 1 ? 's' : ''}
        </p>
      </div>

      {releases.length === 0 ? (
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-8 text-center">
          <p className="text-sm text-[var(--muted)]">No hay releases. Despliega tu servidor desde <Link href="/publish/deploy" className="text-blue-600 hover:underline">Deploy</Link>.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {releases.map(r => (
            <div key={r.id} className="bg-[var(--card)] border border-[var(--border)] rounded-xl px-5 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-[var(--foreground)]">v{r.version}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor(r.status)}`}>
                    {r.status}
                  </span>
                  {r.isCurrent && (
                    <span className="text-xs px-2 py-0.5 rounded-full border border-blue-300 dark:border-blue-700 text-blue-600 dark:text-blue-400 font-medium">
                      Current
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {r.build_log && (
                    <button
                      onClick={() => setExpandedLog(expandedLog === r.id ? null : r.id)}
                      className="text-xs px-2.5 py-1.5 rounded-lg border border-[var(--border)] text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
                    >
                      {expandedLog === r.id ? 'Ocultar log' : 'Ver log'}
                    </button>
                  )}
                  {!r.isCurrent && r.status === 'active' && (
                    <button
                      onClick={() => handleRollback(r.id)}
                      disabled={rolling === r.id}
                      className="text-xs px-2.5 py-1.5 rounded-lg bg-yellow-500 hover:bg-yellow-600 disabled:opacity-60 text-white font-medium transition-colors"
                    >
                      {rolling === r.id ? 'Rollback...' : 'Rollback'}
                    </button>
                  )}
                </div>
              </div>

              <div className="mt-2 flex items-center gap-4 text-xs text-[var(--muted)]">
                <span>Creada: {formatDate(r.created_at)}</span>
                {r.deployed_at && <span>Desplegada: {formatDate(r.deployed_at)}</span>}
                {r.deploy_url && (
                  <a href={r.deploy_url} target="_blank" className="text-blue-600 hover:underline truncate max-w-[200px]">
                    {r.deploy_url.replace('https://', '')}
                  </a>
                )}
              </div>

              {r.error_message && (
                <div className="mt-2 p-2 rounded-lg bg-red-50 dark:bg-red-900/20 text-xs text-red-600 dark:text-red-400">
                  {r.error_message}
                </div>
              )}

              {expandedLog === r.id && r.build_log && (
                <pre className="mt-3 p-3 rounded-lg bg-stone-900 text-stone-300 text-xs overflow-x-auto max-h-48 overflow-y-auto">
                  {r.build_log}
                </pre>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
