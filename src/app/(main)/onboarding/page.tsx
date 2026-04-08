'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { supabaseBrowser } from '@/lib/supabase-client'
import type { User } from '@supabase/supabase-js'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const GATEWAY_BASE = 'https://spainmcp-connect.nilmiq.workers.dev/mcp/@'

const AVAILABLE_MCPS = [
  {
    id: 'spainmcp-tools',
    name: 'SpainMCP Tools',
    description: 'BOE, BORME, INE, AEMET — datos oficiales españoles',
    mcpUrl: 'https://spainmcp-fngo.vercel.app/api/mcp',
    requiresAuth: 'none' as const,
  },
  {
    id: 'github',
    name: 'GitHub',
    description: 'Repositorios, issues y pull requests',
    mcpUrl: 'https://api.githubcopilot.com/mcp',
    requiresAuth: 'oauth' as const,
  },
  {
    id: 'brave-search',
    name: 'Brave Search',
    description: 'Búsqueda web con resultados estructurados',
    mcpUrl: 'https://brave-search-mcp.vercel.app/api/mcp',
    requiresAuth: 'apikey' as const,
  },
]

// ---------------------------------------------------------------------------
// Small shared components
// ---------------------------------------------------------------------------

function SpainMcpLogo() {
  return (
    <svg width="40" height="40" viewBox="0 0 20 20" fill="none">
      <rect x="1" y="1" width="8" height="8" rx="2" fill="#2563EB" />
      <rect x="11" y="1" width="8" height="8" rx="2" fill="#2563EB" />
      <rect x="1" y="11" width="8" height="8" rx="2" fill="#2563EB" />
      <rect x="11" y="11" width="8" height="8" rx="2" fill="#2563EB" />
    </svg>
  )
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  )
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className={className}>
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}

function CopyIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="9" y="9" width="13" height="13" rx="2" />
      <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
    </svg>
  )
}

function useCopy(text: string) {
  const [copied, setCopied] = useState(false)
  const copy = useCallback(async () => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [text])
  return { copied, copy }
}

// ---------------------------------------------------------------------------
// Progress bar
// ---------------------------------------------------------------------------

const STEP_LABELS = ['Cuenta', 'API Key', 'Herramientas', 'Tu URL']

function ProgressBar({ step }: { step: number }) {
  return (
    <div className="flex items-center justify-center gap-2 mb-8">
      {STEP_LABELS.map((label, i) => {
        const idx = i + 1
        const done = idx < step
        const active = idx === step
        return (
          <div key={idx} className="flex items-center gap-2">
            <div className="flex flex-col items-center gap-1">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 ${
                  done
                    ? 'bg-blue-600 text-white'
                    : active
                    ? 'bg-blue-600 text-white ring-4 ring-blue-100 dark:ring-blue-900/50'
                    : 'bg-[var(--border)] text-[var(--muted)]'
                }`}
              >
                {done ? <CheckIcon className="text-white" /> : idx}
              </div>
              <span
                className={`text-xs font-medium hidden sm:block ${
                  active ? 'text-blue-600 dark:text-blue-400' : 'text-[var(--muted)]'
                }`}
              >
                {label}
              </span>
            </div>
            {i < STEP_LABELS.length - 1 && (
              <div
                className={`w-12 sm:w-16 h-0.5 mb-5 transition-all duration-300 ${
                  done ? 'bg-blue-600' : 'bg-[var(--border)]'
                }`}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Step 1 — Auth
// ---------------------------------------------------------------------------

function Step1Auth({ onDone }: { onDone: (user: User) => void }) {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'sent' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  // Check if already logged in
  useEffect(() => {
    supabaseBrowser.auth.getSession().then(({ data }) => {
      if (data.session?.user) onDone(data.session.user)
    })

    const { data: listener } = supabaseBrowser.auth.onAuthStateChange((_event, session) => {
      if (session?.user) onDone(session.user)
    })
    return () => listener.subscription.unsubscribe()
  }, [onDone])

  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault()
    setStatus('loading')
    setErrorMsg('')
    const redirectTo = window.location.origin + '/auth/callback?next=/onboarding'
    const { error } = await supabaseBrowser.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: redirectTo },
    })
    if (error) {
      setErrorMsg(error.message)
      setStatus('error')
    } else {
      setStatus('sent')
    }
  }

  async function handleGoogle() {
    const redirectTo = window.location.origin + '/auth/callback?next=/onboarding'
    await supabaseBrowser.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo },
    })
  }

  const inputClass =
    'w-full px-4 py-2.5 rounded-xl text-sm text-[var(--foreground)] placeholder-[var(--muted)] outline-none focus:ring-2 focus:ring-blue-300 dark:focus:ring-blue-800 bg-white dark:bg-[var(--background)]'
  const btnPrimary =
    'w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white py-3 rounded-xl text-sm font-semibold transition-colors'

  if (status === 'sent') {
    return (
      <div className="flex flex-col items-center gap-5 text-center py-6">
        <div className="text-5xl">✉️</div>
        <h2 className="text-xl font-bold text-[var(--foreground)]">Revisa tu correo</h2>
        <p className="text-sm text-[var(--muted)]">
          Hemos enviado un enlace a <strong className="text-[var(--foreground)]">{email}</strong>.<br />
          Haz clic en él para continuar.
        </p>
        <button onClick={() => setStatus('idle')} className="text-sm text-blue-600 hover:underline">
          ← Volver
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="text-center">
        <h2 className="text-xl font-bold text-[var(--foreground)]">Crea tu cuenta</h2>
        <p className="text-sm text-[var(--muted)] mt-1">Accede con email o Google para empezar</p>
      </div>

      <form onSubmit={handleMagicLink} className="flex flex-col gap-3">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="tu@empresa.com"
          className={inputClass}
          style={{ border: '1px solid var(--border)' }}
        />
        {status === 'error' && <p className="text-sm text-red-500">{errorMsg}</p>}
        <button type="submit" disabled={status === 'loading'} className={btnPrimary}>
          {status === 'loading' ? 'Enviando enlace...' : 'Continuar con email →'}
        </button>
      </form>

      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-[var(--border)]" />
        <span className="text-xs text-[var(--muted)]">o</span>
        <div className="flex-1 h-px bg-[var(--border)]" />
      </div>

      <button
        onClick={handleGoogle}
        className="w-full flex items-center justify-center gap-3 py-2.5 rounded-xl text-sm font-medium text-[var(--foreground)] bg-white dark:bg-[var(--background)] hover:bg-stone-50 dark:hover:bg-stone-800/50 transition-colors"
        style={{ border: '1px solid var(--border)' }}
      >
        <GoogleIcon />
        Continuar con Google
      </button>

      <p className="text-center text-xs text-[var(--muted)]">
        Sin contraseñas. Te enviamos un enlace mágico.
      </p>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Step 2 — API Key
// ---------------------------------------------------------------------------

function Step2ApiKey({
  user,
  onDone,
  onBack,
}: {
  user: User
  onDone: (key: string) => void
  onBack: () => void
}) {
  const [apiKey, setApiKey] = useState<string | null>(null)
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const { copied, copy } = useCopy(apiKey ?? '')

  // If already have a key in localStorage, skip generation
  useEffect(() => {
    const stored = localStorage.getItem('spainmcp_api_key')
    if (stored) {
      setApiKey(stored)
    }
  }, [])

  async function generateKey() {
    setStatus('loading')
    setErrorMsg('')
    try {
      const res = await fetch('/api/keys/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email }),
      })
      const data = await res.json()
      if (!res.ok) {
        setErrorMsg(data.error ?? 'Error generando la key')
        setStatus('error')
        return
      }
      localStorage.setItem('spainmcp_api_key', data.key)
      setApiKey(data.key)
      setStatus('idle')
    } catch {
      setErrorMsg('Error de conexión')
      setStatus('error')
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="text-center">
        <h2 className="text-xl font-bold text-[var(--foreground)]">Tu API Key</h2>
        <p className="text-sm text-[var(--muted)] mt-1">
          Tu clave de acceso personal — solo se muestra una vez
        </p>
      </div>

      {!apiKey ? (
        <div className="flex flex-col gap-4">
          <div className="rounded-xl p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
            <p className="text-sm text-blue-700 dark:text-blue-300">
              Vamos a generar tu API key para{' '}
              <strong>{user.email}</strong>. Te la enviaremos también por email.
            </p>
          </div>
          {status === 'error' && (
            <p className="text-sm text-red-500">{errorMsg}</p>
          )}
          <button
            onClick={generateKey}
            disabled={status === 'loading'}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white py-3 rounded-xl text-sm font-semibold transition-colors"
          >
            {status === 'loading' ? 'Generando...' : 'Generar API Key'}
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <div className="rounded-xl p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <span className="text-sm font-semibold text-green-700 dark:text-green-400">
                Key generada
              </span>
            </div>
            <p className="text-xs text-green-600 dark:text-green-500">
              Guardala en un lugar seguro — no se puede recuperar despues.
            </p>
          </div>

          <div>
            <p className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider mb-2">
              Tu API Key
            </p>
            <div className="flex items-center gap-2">
              <code className="flex-1 font-mono text-xs bg-stone-100 dark:bg-stone-800 text-blue-600 dark:text-blue-400 px-3 py-3 rounded-lg break-all select-all">
                {apiKey}
              </code>
              <button
                onClick={copy}
                className="shrink-0 flex items-center gap-1.5 px-3 py-3 rounded-lg border border-[var(--border)] text-sm text-[var(--foreground)] hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors"
                title="Copiar"
              >
                {copied ? (
                  <CheckIcon className="text-green-500" />
                ) : (
                  <CopyIcon />
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex gap-3 pt-2">
        <button
          onClick={onBack}
          className="px-4 py-2.5 rounded-xl text-sm font-medium text-[var(--foreground)] border border-[var(--border)] hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors"
        >
          ← Volver
        </button>
        <button
          onClick={() => apiKey && onDone(apiKey)}
          disabled={!apiKey}
          className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white py-2.5 rounded-xl text-sm font-semibold transition-colors"
        >
          Siguiente →
        </button>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Step 3 — Connect tools
// ---------------------------------------------------------------------------

function Step3Connect({
  apiKey,
  onDone,
  onBack,
}: {
  apiKey: string
  onDone: (namespace: string) => void
  onBack: () => void
}) {
  const [namespace, setNamespace] = useState<string | null>(null)
  const [connectedUrls, setConnectedUrls] = useState<Set<string>>(new Set())
  const [actionPending, setActionPending] = useState<Record<string, boolean>>({})
  const [error, setError] = useState<string | null>(null)
  const [nsLoading, setNsLoading] = useState(true)

  // Ensure default namespace exists, load existing connections
  useEffect(() => {
    async function init() {
      setNsLoading(true)
      try {
        // List namespaces
        const listRes = await fetch('/api/v1/namespaces', {
          headers: { Authorization: `Bearer ${apiKey}` },
        })
        const listData = await listRes.json()
        let nsList: Array<{ name: string }> = listData.namespaces ?? []

        if (nsList.length === 0) {
          // Create default namespace
          const createRes = await fetch('/api/v1/namespaces', {
            method: 'POST',
            headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: 'default' }),
          })
          if (createRes.ok) {
            const created = await createRes.json()
            nsList = [{ name: created.name }]
          }
        }

        const ns = nsList[0]?.name ?? 'default'
        setNamespace(ns)

        // Load existing connections
        const connRes = await fetch(`/api/v1/connections/${encodeURIComponent(ns)}`, {
          headers: { Authorization: `Bearer ${apiKey}` },
        })
        const connData = await connRes.json()
        const urls = new Set<string>(
          (connData.data ?? []).map((c: { mcpUrl: string }) => c.mcpUrl)
        )
        setConnectedUrls(urls)
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : 'Error de conexión')
      } finally {
        setNsLoading(false)
      }
    }
    init()
  }, [apiKey])

  async function handleConnect(mcp: (typeof AVAILABLE_MCPS)[0]) {
    if (!namespace) return
    setActionPending((p) => ({ ...p, [mcp.id]: true }))
    setError(null)
    try {
      const res = await fetch(`/api/v1/connections/${encodeURIComponent(namespace)}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ mcpUrl: mcp.mcpUrl, name: mcp.name }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? 'Error al conectar')
        return
      }
      if (data.authorizationUrl) {
        window.open(data.authorizationUrl, '_blank', 'noopener')
      }
      setConnectedUrls((prev) => new Set([...prev, mcp.mcpUrl]))
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error al conectar')
    } finally {
      setActionPending((p) => ({ ...p, [mcp.id]: false }))
    }
  }

  const canProceed = connectedUrls.size > 0

  if (nsLoading) {
    return (
      <div className="flex flex-col gap-5">
        <div className="text-center">
          <h2 className="text-xl font-bold text-[var(--foreground)]">Conecta herramientas</h2>
        </div>
        <div className="flex flex-col gap-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-20 rounded-xl bg-stone-100 dark:bg-stone-800 animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="text-center">
        <h2 className="text-xl font-bold text-[var(--foreground)]">Conecta herramientas</h2>
        <p className="text-sm text-[var(--muted)] mt-1">
          Conecta al menos una para continuar
        </p>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm">
          {error}
        </div>
      )}

      <div className="flex flex-col gap-3">
        {AVAILABLE_MCPS.map((mcp) => {
          const isConnected = connectedUrls.has(mcp.mcpUrl)
          const pending = actionPending[mcp.id]

          return (
            <div
              key={mcp.id}
              className={`rounded-xl p-4 border transition-all ${
                isConnected
                  ? 'border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-900/10'
                  : 'border-[var(--border)] bg-[var(--card)]'
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-sm text-[var(--foreground)]">{mcp.name}</p>
                    {mcp.requiresAuth === 'oauth' && (
                      <span className="text-xs px-1.5 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 font-medium">
                        OAuth
                      </span>
                    )}
                    {mcp.requiresAuth === 'apikey' && (
                      <span className="text-xs px-1.5 py-0.5 rounded-full bg-stone-100 dark:bg-stone-800 text-[var(--muted)] font-medium">
                        API key
                      </span>
                    )}
                    {mcp.requiresAuth === 'none' && (
                      <span className="text-xs px-1.5 py-0.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 font-medium">
                        Abierto
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[var(--muted)] mt-0.5">{mcp.description}</p>
                </div>

                {isConnected ? (
                  <div className="flex items-center gap-1.5 text-sm font-medium text-green-600 dark:text-green-400 shrink-0">
                    <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                      <CheckIcon className="text-white" />
                    </div>
                    Conectado
                  </div>
                ) : (
                  <button
                    onClick={() => handleConnect(mcp)}
                    disabled={!!pending || !namespace}
                    className="shrink-0 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors disabled:opacity-40"
                  >
                    {pending ? 'Conectando...' : 'Conectar'}
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>

      <div className="flex gap-3 pt-2">
        <button
          onClick={onBack}
          className="px-4 py-2.5 rounded-xl text-sm font-medium text-[var(--foreground)] border border-[var(--border)] hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors"
        >
          ← Volver
        </button>
        <button
          onClick={() => namespace && onDone(namespace)}
          disabled={!canProceed || !namespace}
          className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white py-2.5 rounded-xl text-sm font-semibold transition-colors"
        >
          Siguiente →
        </button>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Step 4 — Gateway URL
// ---------------------------------------------------------------------------

type ConfigTab = 'claude-code' | 'claude-desktop' | 'cursor'

function Step4GatewayUrl({
  namespace,
  onBack,
}: {
  namespace: string
  onBack: () => void
}) {
  const router = useRouter()
  const gatewayUrl = `${GATEWAY_BASE}${namespace}`
  const [activeTab, setActiveTab] = useState<ConfigTab>('claude-code')
  const [celebrate, setCelebrate] = useState(false)
  const { copied, copy } = useCopy(gatewayUrl)

  useEffect(() => {
    // Trigger celebration on mount
    setCelebrate(true)
    const t = setTimeout(() => setCelebrate(false), 2000)
    return () => clearTimeout(t)
  }, [])

  const clauCodeSnippet = `claude mcp add spainmcp ${gatewayUrl}`
  const jsonSnippet = `{
  "mcpServers": {
    "spainmcp": {
      "url": "${gatewayUrl}"
    }
  }
}`

  const tabs: { id: ConfigTab; label: string }[] = [
    { id: 'claude-code', label: 'Claude Code' },
    { id: 'claude-desktop', label: 'Claude Desktop' },
    { id: 'cursor', label: 'Cursor' },
  ]

  return (
    <div className="flex flex-col gap-5">
      {/* Celebration header */}
      <div className={`text-center transition-all duration-500 ${celebrate ? 'scale-105' : 'scale-100'}`}>
        <div className="text-4xl mb-3">
          {celebrate ? '🎉' : '✅'}
        </div>
        <h2 className="text-xl font-bold text-[var(--foreground)]">Tu URL personal</h2>
        <p className="text-sm text-[var(--muted)] mt-1">
          Todo listo. Esta es tu URL de gateway MCP.
        </p>
      </div>

      {/* Gateway URL display */}
      <div className="rounded-xl p-4 bg-[var(--card)] border border-[var(--border)]">
        <p className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider mb-2">
          Tu Gateway URL
        </p>
        <div className="flex items-center gap-2">
          <code className="flex-1 font-mono text-xs bg-stone-100 dark:bg-stone-800 text-blue-600 dark:text-blue-400 px-3 py-3 rounded-lg break-all">
            {gatewayUrl}
          </code>
          <button
            onClick={copy}
            className="shrink-0 flex items-center gap-1.5 px-3 py-3 rounded-lg border border-[var(--border)] text-sm text-[var(--foreground)] hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors"
            title="Copiar URL"
          >
            {copied ? <CheckIcon className="text-green-500" /> : <CopyIcon />}
          </button>
        </div>
        <p className="text-xs text-[var(--muted)] mt-2">
          Namespace: <span className="font-mono text-[var(--foreground)]">@{namespace}</span>
        </p>
      </div>

      {/* Config tabs */}
      <div className="rounded-xl border border-[var(--border)] overflow-hidden bg-[var(--card)]">
        <div className="flex border-b border-[var(--border)]">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 text-sm font-medium transition-colors flex-1 ${
                activeTab === tab.id
                  ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400 -mb-px bg-blue-50/50 dark:bg-blue-900/10'
                  : 'text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-stone-50 dark:hover:bg-stone-800/50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="p-4">
          {activeTab === 'claude-code' && (
            <div className="flex flex-col gap-2">
              <p className="text-xs text-[var(--muted)]">
                Ejecuta en tu terminal:
              </p>
              <pre className="bg-stone-100 dark:bg-stone-800 rounded-lg px-4 py-3 text-xs font-mono text-[var(--foreground)] overflow-x-auto whitespace-pre-wrap break-all">
                {clauCodeSnippet}
              </pre>
            </div>
          )}
          {activeTab === 'claude-desktop' && (
            <div className="flex flex-col gap-2">
              <p className="text-xs text-[var(--muted)]">
                Pega en <code className="bg-stone-100 dark:bg-stone-800 px-1 rounded">claude_desktop_config.json</code>:
              </p>
              <pre className="bg-stone-100 dark:bg-stone-800 rounded-lg px-4 py-3 text-xs font-mono text-[var(--foreground)] overflow-x-auto">
                {jsonSnippet}
              </pre>
            </div>
          )}
          {activeTab === 'cursor' && (
            <div className="flex flex-col gap-2">
              <p className="text-xs text-[var(--muted)]">
                Crea <code className="bg-stone-100 dark:bg-stone-800 px-1 rounded">.cursor/mcp.json</code> en tu proyecto:
              </p>
              <pre className="bg-stone-100 dark:bg-stone-800 rounded-lg px-4 py-3 text-xs font-mono text-[var(--foreground)] overflow-x-auto">
                {jsonSnippet}
              </pre>
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <button
          onClick={onBack}
          className="px-4 py-2.5 rounded-xl text-sm font-medium text-[var(--foreground)] border border-[var(--border)] hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors"
        >
          ← Volver
        </button>
        <button
          onClick={() => router.push('/account/gateway')}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl text-sm font-semibold transition-colors"
        >
          Empezar a usar →
        </button>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main wizard
// ---------------------------------------------------------------------------

export default function OnboardingPage() {
  const [step, setStep] = useState(1)
  const [user, setUser] = useState<User | null>(null)
  const [apiKey, setApiKey] = useState<string | null>(null)
  const [namespace, setNamespace] = useState<string | null>(null)

  // Restore progress if page is revisited after OAuth redirect
  useEffect(() => {
    const stored = localStorage.getItem('spainmcp_api_key')
    if (stored) setApiKey(stored)

    supabaseBrowser.auth.getSession().then(({ data }) => {
      if (data.session?.user) {
        setUser(data.session.user)
        if (stored) {
          setStep(3)
        } else {
          setStep(2)
        }
      }
    })
  }, [])

  function handleStep1Done(u: User) {
    setUser(u)
    setStep(2)
  }

  function handleStep2Done(key: string) {
    setApiKey(key)
    setStep(3)
  }

  function handleStep3Done(ns: string) {
    setNamespace(ns)
    setStep(4)
  }

  return (
    <div className="min-h-[85vh] flex flex-col items-center justify-center py-10 px-4">
      {/* Logo */}
      <div className="flex items-center gap-3 mb-6">
        <SpainMcpLogo />
        <span className="text-lg font-bold text-[var(--foreground)]">SpainMCP</span>
      </div>

      {/* Progress */}
      <ProgressBar step={step} />

      {/* Step card */}
      <div
        key={step}
        className="w-full max-w-md bg-[var(--card)] rounded-2xl p-7 animate-fade-in"
        style={{ border: '1px solid var(--border)' }}
      >
        {step === 1 && <Step1Auth onDone={handleStep1Done} />}
        {step === 2 && user && (
          <Step2ApiKey user={user} onDone={handleStep2Done} onBack={() => setStep(1)} />
        )}
        {step === 3 && apiKey && (
          <Step3Connect
            apiKey={apiKey}
            onDone={handleStep3Done}
            onBack={() => setStep(2)}
          />
        )}
        {step === 4 && namespace && (
          <Step4GatewayUrl namespace={namespace} onBack={() => setStep(3)} />
        )}
      </div>

      {/* Step counter */}
      <p className="mt-4 text-xs text-[var(--muted)]">
        Paso {step} de 4
      </p>
    </div>
  )
}
