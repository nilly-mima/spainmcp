'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabaseBrowser } from '@/lib/supabase-client'
import Link from 'next/link'

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

export default function ConnectionsPage() {
  const router = useRouter()
  const [apiKey, setApiKey] = useState<string | null>(null)
  const [namespaces, setNamespaces] = useState<Namespace[]>([])
  const [selectedNs, setSelectedNs] = useState<string | null>(null)
  const [connections, setConnections] = useState<Connection[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Check auth
  useEffect(() => {
    supabaseBrowser.auth.getSession().then(({ data }) => {
      if (!data.session?.user) {
        router.replace('/login?redirect=/account/connections')
      }
    })
  }, [router])

  // Load API key from localStorage (set by api-keys page)
  useEffect(() => {
    const stored = localStorage.getItem('spainmcp_api_key')
    if (stored) setApiKey(stored)
    setLoading(false)
  }, [])

  // Fetch namespaces
  useEffect(() => {
    if (!apiKey) return
    fetch('/api/v1/namespaces', {
      headers: { Authorization: `Bearer ${apiKey}` },
    })
      .then((r) => r.json())
      .then((data) => {
        setNamespaces(data.namespaces ?? [])
        if (data.namespaces?.length > 0 && !selectedNs) {
          setSelectedNs(data.namespaces[0].name)
        }
      })
      .catch((e) => setError(e.message))
  }, [apiKey, selectedNs])

  // Fetch connections for selected namespace
  useEffect(() => {
    if (!apiKey || !selectedNs) return
    fetch(`/api/v1/connections/${encodeURIComponent(selectedNs)}`, {
      headers: { Authorization: `Bearer ${apiKey}` },
    })
      .then((r) => r.json())
      .then((data) => setConnections(data.data ?? []))
      .catch((e) => setError(e.message))
  }, [apiKey, selectedNs])

  const statusColor: Record<string, string> = {
    connected: 'bg-green-500',
    auth_required: 'bg-yellow-500',
    error: 'bg-red-500',
    pending: 'bg-gray-400',
  }

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto py-8 px-4">
        <p className="text-sm text-gray-400">Cargando...</p>
      </div>
    )
  }

  // No API key — prompt to set one
  if (!apiKey) {
    return (
      <div className="max-w-3xl mx-auto py-8 px-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Conexiones</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
          Necesitas una API key para ver tus conexiones.
        </p>
        <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-8 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Introduce tu API key para conectar el dashboard.
          </p>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              const input = (e.target as HTMLFormElement).elements.namedItem('key') as HTMLInputElement
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
              Conectar
            </button>
          </form>
          <p className="text-xs text-gray-400 mt-3">
            ¿No tienes key? <Link href="/account/api-keys" className="text-blue-500 hover:underline">Genera una aquí</Link>
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Conexiones</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Tus namespaces y conexiones MCP gestionadas.
          </p>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Namespace tabs */}
      {namespaces.length > 0 && (
        <div className="flex gap-2 mb-4 overflow-x-auto">
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

      {/* Connections list */}
      {namespaces.length === 0 ? (
        <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-12 text-center">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-gray-400 mb-4 mx-auto">
            <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/>
            <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/>
          </svg>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Sin namespaces</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-5 max-w-sm mx-auto">
            Crea tu primer namespace con la CLI o la API para empezar.
          </p>
          <code className="text-xs bg-gray-100 dark:bg-gray-800 px-3 py-1.5 rounded-lg text-gray-600 dark:text-gray-400">
            spainmcp namespace create mi-app
          </code>
        </div>
      ) : connections.length === 0 ? (
        <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-12 text-center">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Sin conexiones en {selectedNs}</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-5 max-w-sm mx-auto">
            Crea una conexión para empezar a usar MCPs a través del proxy.
          </p>
          <code className="text-xs bg-gray-100 dark:bg-gray-800 px-3 py-1.5 rounded-lg text-gray-600 dark:text-gray-400">
            spainmcp mcp add https://server.example.com/mcp
          </code>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {connections.map((conn) => (
            <div
              key={conn.connectionId}
              className="border border-gray-200 dark:border-gray-700/50 rounded-xl p-4 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${statusColor[conn.status] ?? 'bg-gray-400'}`} />
                  <span className="font-medium text-sm text-gray-900 dark:text-white">
                    {conn.name ?? conn.connectionId}
                  </span>
                  <span className="text-xs text-gray-400 dark:text-gray-500">
                    {conn.connectionId}
                  </span>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  conn.status === 'connected'
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                    : conn.status === 'error'
                    ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                }`}>
                  {conn.status}
                </span>
              </div>
              <p className="text-xs text-gray-400 dark:text-gray-500 truncate mb-1">
                {conn.mcpUrl}
              </p>
              <div className="flex items-center gap-3 text-xs text-gray-400 dark:text-gray-500">
                <span>Creado: {new Date(conn.createdAt).toLocaleDateString('es-ES')}</span>
                {Object.keys(conn.metadata).length > 0 && (
                  <span>Metadata: {JSON.stringify(conn.metadata)}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
