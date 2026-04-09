'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { supabaseBrowser } from '@/lib/supabase-client'
import Link from 'next/link'
import { usePlan } from '@/hooks/usePlan'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Namespace {
  name: string
  createdAt: string
}

interface Connection {
  connectionId: string
  name: string | null
  mcpUrl: string
  status: string
  metadata: Record<string, unknown>
  createdAt: string
  updatedAt: string
}

interface AvailableMcp {
  id: string
  name: string
  description: string
  icon: string
  mcpUrl: string
  requiresAuth: 'apikey' | 'oauth' | 'none'
}

// ---------------------------------------------------------------------------
// Catalog (hardcoded — no fetch needed)
// ---------------------------------------------------------------------------

const AVAILABLE_MCPS: AvailableMcp[] = [
  {
    id: 'spainmcp-tools',
    name: 'SpainMCP Tools',
    description: 'BOE, BORME, INE, AEMET — datos oficiales españoles',
    icon: '/logos/boe.svg',
    mcpUrl: 'https://spainmcp-fngo.vercel.app/api/mcp',
    requiresAuth: 'none',
  },
  {
    id: 'github',
    name: 'GitHub',
    description: 'Repositorios, issues y pull requests',
    icon: '/logos/github.svg',
    mcpUrl: 'https://api.githubcopilot.com/mcp',
    requiresAuth: 'oauth',
  },
  {
    id: 'brave-search',
    name: 'Brave Search',
    description: 'Búsqueda web con resultados estructurados',
    icon: 'https://api.smithery.ai/servers/brave/icon',
    mcpUrl: 'https://brave-search-mcp.vercel.app/api/mcp',
    requiresAuth: 'apikey',
  },
]

// ---------------------------------------------------------------------------
// Small helper components
// ---------------------------------------------------------------------------

function McpIconFallback({ name }: { name: string }) {
  const initials = name
    .split(/[\s\-_]/)
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
  return (
    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold shrink-0 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
      {initials}
    </div>
  )
}

function McpIconImg({ src, name }: { src: string; name: string }) {
  const [failed, setFailed] = useState(false)
  if (failed) return <McpIconFallback name={name} />
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={name}
      className="w-10 h-10 rounded-xl object-contain shrink-0 bg-white dark:bg-gray-800 p-1"
      onError={() => setFailed(true)}
    />
  )
}

const STATUS_DOT: Record<string, string> = {
  connected: 'bg-green-500',
  auth_required: 'bg-yellow-500',
  error: 'bg-red-500',
  pending: 'bg-gray-400',
}

const STATUS_BADGE: Record<string, string> = {
  connected: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
  error: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
  auth_required: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400',
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

export default function ConnectionsPage() {
  const router = useRouter()
  const { tier } = usePlan()
  const [apiKey, setApiKey] = useState<string | null>(null)
  const [namespaces, setNamespaces] = useState<Namespace[]>([])
  const [selectedNs, setSelectedNs] = useState<string | null>(null)
  const [connections, setConnections] = useState<Connection[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  // Per-MCP loading state: id → 'connecting' | 'disconnecting' | null
  const [actionPending, setActionPending] = useState<Record<string, string>>({})

  // Auth guard
  useEffect(() => {
    supabaseBrowser.auth.getSession().then(({ data }) => {
      if (!data.session?.user) {
        router.replace('/login?redirect=/account/connections')
      }
    })
  }, [router])

  // Load API key
  useEffect(() => {
    const stored = localStorage.getItem('spainmcp_api_key')
    if (stored) setApiKey(stored)
    setLoading(false)
  }, [])

  // Fetch namespaces — auto-create "default" if none
  const fetchNamespaces = useCallback(async (key: string) => {
    const res = await fetch('/api/v1/namespaces', {
      headers: { Authorization: `Bearer ${key}` },
    })
    if (!res.ok) throw new Error('Error al cargar namespaces')
    const data = await res.json()
    let nsList: Namespace[] = data.namespaces ?? []

    if (nsList.length === 0) {
      // Auto-create default namespace
      const create = await fetch('/api/v1/namespaces', {
        method: 'POST',
        headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'default' }),
      })
      if (create.ok) {
        const created = await create.json()
        nsList = [{ name: created.name, createdAt: created.createdAt }]
      }
    }
    return nsList
  }, [])

  useEffect(() => {
    if (!apiKey) return
    fetchNamespaces(apiKey)
      .then((nsList) => {
        setNamespaces(nsList)
        if (nsList.length > 0) setSelectedNs((prev) => prev ?? nsList[0].name)
      })
      .catch((e) => setError(e.message))
  }, [apiKey, fetchNamespaces])

  // Fetch connections for selected namespace
  const fetchConnections = useCallback(
    async (key: string, ns: string) => {
      const res = await fetch(`/api/v1/connections/${encodeURIComponent(ns)}`, {
        headers: { Authorization: `Bearer ${key}` },
      })
      if (!res.ok) throw new Error('Error al cargar conexiones')
      const data = await res.json()
      setConnections(data.data ?? [])
    },
    []
  )

  useEffect(() => {
    if (!apiKey || !selectedNs) return
    fetchConnections(apiKey, selectedNs).catch((e) => setError(e.message))
  }, [apiKey, selectedNs, fetchConnections])

  // Derive which catalog MCPs are already connected (match by mcpUrl)
  const connectedUrls = new Set(connections.map((c) => c.mcpUrl))
  const connectionByUrl = Object.fromEntries(connections.map((c) => [c.mcpUrl, c]))

  // ---------------------------------------------------------------------------
  // Actions
  // ---------------------------------------------------------------------------

  async function handleConnect(mcp: AvailableMcp) {
    if (!apiKey || !selectedNs) return
    setActionPending((p) => ({ ...p, [mcp.id]: 'connecting' }))
    setError(null)
    try {
      const res = await fetch(`/api/v1/connections/${encodeURIComponent(selectedNs)}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ mcpUrl: mcp.mcpUrl, name: mcp.name }),
      })
      const data = await res.json()
      if (!res.ok) {
        if (res.status === 403) {
          setShowUpgradeModal(true)
        } else {
          setError(data.error ?? 'Error al conectar')
        }
        return
      }
      // If OAuth and there's an authorizationUrl, open it
      if (data.authorizationUrl) {
        window.open(data.authorizationUrl, '_blank', 'noopener')
      }
      await fetchConnections(apiKey, selectedNs)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error al conectar')
    } finally {
      setActionPending((p) => ({ ...p, [mcp.id]: '' }))
    }
  }

  async function handleDisconnect(connectionId: string, mcpId?: string) {
    if (!apiKey || !selectedNs) return
    const pendingKey = mcpId ?? connectionId
    setActionPending((p) => ({ ...p, [pendingKey]: 'disconnecting' }))
    setError(null)
    try {
      const res = await fetch(
        `/api/v1/connections/${encodeURIComponent(selectedNs)}/${encodeURIComponent(connectionId)}`,
        { method: 'DELETE', headers: { Authorization: `Bearer ${apiKey}` } }
      )
      if (!res.ok) {
        const data = await res.json()
        setError(data.error ?? 'Error al desconectar')
        return
      }
      await fetchConnections(apiKey, selectedNs)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error al desconectar')
    } finally {
      setActionPending((p) => ({ ...p, [pendingKey]: '' }))
    }
  }

  // ---------------------------------------------------------------------------
  // Render — no API key state
  // ---------------------------------------------------------------------------

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4">
        <p className="text-sm text-gray-400">Cargando...</p>
      </div>
    )
  }

  if (!apiKey) {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Conexiones</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
          Necesitas una API key para gestionar conexiones.
        </p>
        <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-8 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Introduce tu API key para conectar el dashboard.
          </p>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              const input = (e.target as HTMLFormElement).elements.namedItem(
                'key'
              ) as HTMLInputElement
              if (input.value.startsWith('sk-spainmcp-')) {
                localStorage.setItem('spainmcp_api_key', input.value)
                setApiKey(input.value)
              }
            }}
            className="flex gap-2 max-w-md mx-auto"
          >
            <input
              name="key"
              type="password"
              placeholder="sk-spainmcp-..."
              className="flex-1 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent text-sm"
            />
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700"
            >
              Guardar
            </button>
          </form>
          <p className="text-xs text-gray-400 mt-3">
            No tienes key?{' '}
            <Link href="/account/api-keys" className="text-blue-500 hover:underline">
              Genera una aqui
            </Link>
          </p>
        </div>
      </div>
    )
  }

  // ---------------------------------------------------------------------------
  // Render — main view
  // ---------------------------------------------------------------------------

  // Connections NOT in catalog (manually added via CLI/API)
  const catalogUrls = new Set(AVAILABLE_MCPS.map((m) => m.mcpUrl))
  const extraConnections = connections.filter((c) => !catalogUrls.has(c.mcpUrl))

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Conexiones</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Conecta MCPs a tu namespace y gestionalos desde aqui.
          </p>
        </div>
        {/* Namespace tabs */}
        {namespaces.length > 1 && (
          <div className="flex gap-2">
            {namespaces.map((ns) => (
              <button
                key={ns.name}
                onClick={() => setSelectedNs(ns.name)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  selectedNs === ns.name
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                {ns.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Plan banner */}
      {tier === 'free' && (
        <div className="mb-6 flex items-center justify-between p-3 rounded-xl border border-amber-200 dark:border-amber-800/50 bg-amber-50 dark:bg-amber-950/20 text-sm">
          <span className="text-amber-700 dark:text-amber-400">
            Plan gratuito: maximo 3 conexiones.
          </span>
          <Link href="/account/billing" className="text-xs font-semibold text-amber-700 dark:text-amber-400 hover:text-amber-900 dark:hover:text-amber-200 underline underline-offset-2 transition-colors">
            Actualizar a Pro →
          </Link>
        </div>
      )}
      {tier === 'pro' && (
        <div className="mb-6 flex items-center gap-2 p-3 rounded-xl border border-green-200 dark:border-green-800/50 bg-green-50 dark:bg-green-950/20 text-sm text-green-700 dark:text-green-400">
          <span className="w-2 h-2 rounded-full bg-green-500 shrink-0" />
          Plan Pro — conexiones ilimitadas
        </div>
      )}

      {error && (
        <div className="mb-6 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* Available MCPs catalog */}
      {/* ------------------------------------------------------------------ */}
      <section className="mb-10">
        <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">
          MCPs disponibles
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {AVAILABLE_MCPS.map((mcp) => {
            const isConnected = connectedUrls.has(mcp.mcpUrl)
            const existingConn = connectionByUrl[mcp.mcpUrl]
            const pending = actionPending[mcp.id]
            const needsAuth =
              isConnected &&
              existingConn?.status === 'auth_required' &&
              mcp.requiresAuth === 'oauth'

            return (
              <div
                key={mcp.id}
                className="border border-gray-200 dark:border-gray-700/50 rounded-xl p-4 bg-transparent hover:bg-gray-50 dark:hover:bg-white/5 transition-colors flex flex-col gap-3"
              >
                {/* Card header */}
                <div className="flex items-start gap-3">
                  <McpIconImg src={mcp.icon} name={mcp.name} />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-gray-900 dark:text-white leading-tight">
                      {mcp.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">
                      {mcp.description}
                    </p>
                  </div>
                </div>

                {/* Auth type pill */}
                <div className="flex items-center gap-2">
                  {mcp.requiresAuth === 'oauth' && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 font-medium">
                      OAuth
                    </span>
                  )}
                  {mcp.requiresAuth === 'apikey' && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 font-medium">
                      API key
                    </span>
                  )}
                  {mcp.requiresAuth === 'none' && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 font-medium">
                      Abierto
                    </span>
                  )}
                </div>

                {/* Action button */}
                <div className="mt-auto">
                  {isConnected && !needsAuth ? (
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-sm font-medium text-green-600 dark:text-green-400">
                        <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
                        Conectado
                      </span>
                      <button
                        onClick={() =>
                          handleDisconnect(existingConn.connectionId, mcp.id)
                        }
                        disabled={!!pending}
                        className="text-xs text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors disabled:opacity-40"
                      >
                        {pending === 'disconnecting' ? 'Desconectando...' : 'Desconectar'}
                      </button>
                    </div>
                  ) : needsAuth ? (
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-yellow-600 dark:text-yellow-400 font-medium">
                        Pendiente autorizar
                      </span>
                      <button
                        onClick={() => {
                          // In real OAuth flow this would open authorizationUrl
                          window.open(mcp.mcpUrl, '_blank', 'noopener')
                        }}
                        className="text-xs px-3 py-1 rounded-lg bg-yellow-500 hover:bg-yellow-600 text-white font-medium transition-colors"
                      >
                        Autorizar
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleConnect(mcp)}
                      disabled={!!pending || !selectedNs}
                      className="w-full px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors disabled:opacity-40"
                    >
                      {pending === 'connecting' ? 'Conectando...' : 'Conectar'}
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* Active connections (all, with Desconectar) */}
      {/* ------------------------------------------------------------------ */}
      <section>
        <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">
          Conexiones activas
          {connections.length > 0 && (
            <span className="ml-2 px-1.5 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-500 text-xs font-medium normal-case">
              {connections.length}
            </span>
          )}
        </h2>

        {connections.length === 0 ? (
          <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-10 text-center">
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              className="text-gray-400 mb-3 mx-auto"
            >
              <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" />
              <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" />
            </svg>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Sin conexiones en{' '}
              <span className="font-medium text-gray-700 dark:text-gray-300">{selectedNs}</span>.
              Usa los MCPs de arriba para conectar.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {connections.map((conn) => {
              const pending = actionPending[conn.connectionId]
              return (
                <div
                  key={conn.connectionId}
                  className="border border-gray-200 dark:border-gray-700/50 rounded-xl p-4 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0">
                      <div
                        className={`w-2 h-2 rounded-full shrink-0 ${STATUS_DOT[conn.status] ?? 'bg-gray-400'}`}
                      />
                      <span className="font-medium text-sm text-gray-900 dark:text-white truncate">
                        {conn.name ?? conn.connectionId}
                      </span>
                      <span className="text-xs text-gray-400 dark:text-gray-500 font-mono shrink-0">
                        {conn.connectionId}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 shrink-0 ml-4">
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          STATUS_BADGE[conn.status] ??
                          'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                        }`}
                      >
                        {conn.status}
                      </span>
                      <button
                        onClick={() => handleDisconnect(conn.connectionId)}
                        disabled={!!pending}
                        className="text-xs text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors disabled:opacity-40"
                      >
                        {pending === 'disconnecting' ? 'Eliminando...' : 'Desconectar'}
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-gray-400 dark:text-gray-500 truncate mt-1.5 pl-4">
                    {conn.mcpUrl}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 pl-4">
                    Creado: {new Date(conn.createdAt).toLocaleDateString('es-ES')}
                  </p>
                </div>
              )
            })}
          </div>
        )}

        {/* Extra connections added via CLI (not in catalog) */}
        {extraConnections.length > 0 && (
          <p className="mt-3 text-xs text-gray-400 dark:text-gray-500">
            {extraConnections.length} conexion{extraConnections.length !== 1 ? 'es' : ''} anadida
            {extraConnections.length !== 1 ? 's' : ''} via CLI no aparecen en el catalogo de arriba.
          </p>
        )}
      </section>

      {/* Upgrade modal */}
      {showUpgradeModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          onClick={() => setShowUpgradeModal(false)}
        >
          <div
            className="bg-[var(--card)] border border-[var(--border)] rounded-2xl shadow-xl w-full max-w-sm p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-bold text-[var(--foreground)]">Limite alcanzado</h2>
              <button
                onClick={() => setShowUpgradeModal(false)}
                className="text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            <p className="text-sm text-[var(--muted)] mb-5">
              Has alcanzado el limite del plan gratuito. Actualiza a Pro para conexiones ilimitadas.
            </p>
            <div className="flex flex-col gap-2">
              <Link
                href="/account/billing"
                className="w-full px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold text-center transition-colors"
                onClick={() => setShowUpgradeModal(false)}
              >
                Actualizar a Pro — €29/mes
              </Link>
              <button
                onClick={() => setShowUpgradeModal(false)}
                className="w-full px-4 py-2.5 rounded-xl border border-[var(--border)] text-sm font-medium text-[var(--foreground)] hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
