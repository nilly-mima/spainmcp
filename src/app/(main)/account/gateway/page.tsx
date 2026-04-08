'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabaseBrowser } from '@/lib/supabase-client'

interface Connection {
  connectionId: string
  name: string | null
  mcpUrl: string
  status: string
  createdAt: string
}

type Tab = 'claude-code' | 'claude-desktop' | 'cursor'

const GATEWAY_BASE = 'https://spainmcp-connect.nilmiq.workers.dev/mcp/@'

const statusColor: Record<string, string> = {
  connected: 'bg-green-500',
  auth_required: 'bg-yellow-500',
  error: 'bg-red-500',
  pending: 'bg-gray-400',
}

export default function GatewayPage() {
  const router = useRouter()
  const [apiKey, setApiKey] = useState<string | null>(null)
  const [namespace, setNamespace] = useState<string | null>(null)
  const [connections, setConnections] = useState<Connection[]>([])
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const [activeTab, setActiveTab] = useState<Tab>('claude-code')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    supabaseBrowser.auth.getSession().then(({ data }) => {
      if (!data.session?.user) {
        router.replace('/login?redirect=/account/gateway')
      }
    })
  }, [router])

  useEffect(() => {
    const stored = localStorage.getItem('spainmcp_api_key')
    if (stored) setApiKey(stored)
    setLoading(false)
  }, [])

  useEffect(() => {
    if (!apiKey) return
    fetch('/api/v1/namespaces', {
      headers: { Authorization: `Bearer ${apiKey}` },
    })
      .then((r) => r.json())
      .then((data) => {
        const first = data.namespaces?.[0]?.name ?? null
        setNamespace(first)
      })
      .catch((e) => setError(e.message))
  }, [apiKey])

  useEffect(() => {
    if (!apiKey || !namespace) return
    fetch(`/api/v1/connections/${encodeURIComponent(namespace)}`, {
      headers: { Authorization: `Bearer ${apiKey}` },
    })
      .then((r) => r.json())
      .then((data) => setConnections(data.data ?? []))
      .catch((e) => setError(e.message))
  }, [apiKey, namespace])

  const gatewayUrl = namespace ? `${GATEWAY_BASE}${namespace}` : null

  async function handleCopy() {
    if (!gatewayUrl) return
    await navigator.clipboard.writeText(gatewayUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto py-8 px-4">
        <p className="text-sm text-[var(--muted)]">Cargando...</p>
      </div>
    )
  }

  if (!apiKey) {
    return (
      <div className="max-w-3xl mx-auto py-8 px-4">
        <h1 className="text-2xl font-bold text-[var(--foreground)] mb-1">Tu Gateway MCP</h1>
        <p className="text-sm text-[var(--muted)] mb-6">Una URL, todas tus herramientas de IA</p>
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-8 text-center">
          <p className="text-sm text-[var(--muted)] mb-4">
            Introduce tu API key para acceder a la configuracion del gateway.
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
              className="flex-1 px-3 py-2 rounded-lg border border-[var(--border)] bg-transparent text-sm text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors"
            >
              Conectar
            </button>
          </form>
          <p className="text-xs text-[var(--muted)] mt-3">
            No tienes key?{' '}
            <Link href="/account/api-keys" className="text-blue-500 hover:underline">
              Genera una aqui
            </Link>
          </p>
        </div>
      </div>
    )
  }

  const clauCodeSnippet = gatewayUrl
    ? `claude mcp add spainmcp ${gatewayUrl}`
    : 'claude mcp add spainmcp <URL>'

  const clauDesktopSnippet = gatewayUrl
    ? `{
  "mcpServers": {
    "spainmcp": {
      "url": "${gatewayUrl}"
    }
  }
}`
    : '{ /* cargando namespace... */ }'

  const cursorSnippet = gatewayUrl
    ? `{
  "mcpServers": {
    "spainmcp": {
      "url": "${gatewayUrl}"
    }
  }
}`
    : '{ /* cargando namespace... */ }'

  const tabs: { id: Tab; label: string }[] = [
    { id: 'claude-code', label: 'Claude Code' },
    { id: 'claude-desktop', label: 'Claude Desktop' },
    { id: 'cursor', label: 'Cursor' },
  ]

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[var(--foreground)]">Tu Gateway MCP</h1>
        <p className="text-sm text-[var(--muted)] mt-1">Una URL, todas tus herramientas de IA</p>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Gateway URL card */}
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5 mb-6">
        <p className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider mb-3">
          Tu URL de gateway
        </p>
        {gatewayUrl ? (
          <div className="flex items-center gap-2">
            <code className="flex-1 text-sm font-mono bg-stone-100 dark:bg-stone-800 text-blue-600 dark:text-blue-400 px-4 py-3 rounded-lg break-all">
              {gatewayUrl}
            </code>
            <button
              onClick={handleCopy}
              className="shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[var(--border)] text-sm text-[var(--foreground)] hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors"
            >
              {copied ? (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-green-500">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  <span className="text-green-500">Copiado</span>
                </>
              ) : (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
                  </svg>
                  Copiar
                </>
              )}
            </button>
          </div>
        ) : (
          <div className="h-10 rounded-lg bg-stone-100 dark:bg-stone-800 animate-pulse" />
        )}
        {namespace && (
          <p className="text-xs text-[var(--muted)] mt-2">
            Namespace: <span className="font-mono text-[var(--foreground)]">@{namespace}</span>
          </p>
        )}
      </div>

      {/* Setup tabs */}
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl overflow-hidden mb-6">
        <div className="flex border-b border-[var(--border)]">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400 -mb-px'
                  : 'text-[var(--muted)] hover:text-[var(--foreground)]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-5">
          {activeTab === 'claude-code' && (
            <div>
              <p className="text-sm text-[var(--muted)] mb-3">
                Ejecuta este comando en tu terminal para añadir SpainMCP a Claude Code:
              </p>
              <pre className="bg-stone-100 dark:bg-stone-800 rounded-lg px-4 py-3 text-sm font-mono text-[var(--foreground)] overflow-x-auto">
                {clauCodeSnippet}
              </pre>
              <p className="text-xs text-[var(--muted)] mt-3">
                Requiere Claude Code CLI instalado.{' '}
                <a href="https://docs.anthropic.com/claude/docs/claude-code" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                  Ver documentacion
                </a>
              </p>
            </div>
          )}

          {activeTab === 'claude-desktop' && (
            <div>
              <p className="text-sm text-[var(--muted)] mb-3">
                Pega esto en tu fichero{' '}
                <code className="text-xs bg-stone-100 dark:bg-stone-800 px-1.5 py-0.5 rounded">claude_desktop_config.json</code>:
              </p>
              <pre className="bg-stone-100 dark:bg-stone-800 rounded-lg px-4 py-3 text-sm font-mono text-[var(--foreground)] overflow-x-auto">
                {clauDesktopSnippet}
              </pre>
              <p className="text-xs text-[var(--muted)] mt-3">
                Ruta del fichero: <code className="text-xs">~/Library/Application Support/Claude/claude_desktop_config.json</code> (macOS) o{' '}
                <code className="text-xs">%APPDATA%\Claude\claude_desktop_config.json</code> (Windows)
              </p>
            </div>
          )}

          {activeTab === 'cursor' && (
            <div>
              <p className="text-sm text-[var(--muted)] mb-3">
                Crea o edita{' '}
                <code className="text-xs bg-stone-100 dark:bg-stone-800 px-1.5 py-0.5 rounded">.cursor/mcp.json</code>{' '}
                en la raiz de tu proyecto:
              </p>
              <pre className="bg-stone-100 dark:bg-stone-800 rounded-lg px-4 py-3 text-sm font-mono text-[var(--foreground)] overflow-x-auto">
                {cursorSnippet}
              </pre>
              <p className="text-xs text-[var(--muted)] mt-3">
                Reinicia Cursor despues de guardar el fichero para que cargue el servidor MCP.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Active connections */}
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border)]">
          <h2 className="text-sm font-semibold text-[var(--foreground)]">MCPs conectados</h2>
          <Link
            href="/account/connections"
            className="text-xs text-blue-500 hover:underline"
          >
            Anadir mas MCPs
          </Link>
        </div>

        {connections.length === 0 ? (
          <div className="px-5 py-10 text-center">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-[var(--muted)] mb-3 mx-auto">
              <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/>
              <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/>
            </svg>
            <p className="text-sm text-[var(--muted)] mb-4">
              {namespace ? `No hay conexiones en @${namespace} todavia.` : 'Sin namespace configurado.'}
            </p>
            <Link
              href="/account/connections"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              Anadir primer MCP
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-[var(--border)]">
            {connections.map((conn) => (
              <div key={conn.connectionId} className="flex items-center justify-between px-5 py-3.5 hover:bg-stone-50 dark:hover:bg-white/5 transition-colors">
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-2 h-2 rounded-full shrink-0 ${statusColor[conn.status] ?? 'bg-gray-400'}`} />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-[var(--foreground)] truncate">
                      {conn.name ?? conn.connectionId}
                    </p>
                    <p className="text-xs text-[var(--muted)] truncate">{conn.mcpUrl}</p>
                  </div>
                </div>
                <span className={`shrink-0 text-xs px-2 py-0.5 rounded-full font-medium ml-4 ${
                  conn.status === 'connected'
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                    : conn.status === 'error'
                    ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                    : 'bg-stone-100 dark:bg-stone-800 text-[var(--muted)]'
                }`}>
                  {conn.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
