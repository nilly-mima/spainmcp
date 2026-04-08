'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { supabaseBrowser } from '@/lib/supabase-client'
import Turnstile from '@/components/Turnstile'
import type { User } from '@supabase/supabase-js'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const GATEWAY_BASE = 'https://spainmcp-connect.nilmiq.workers.dev/mcp/@'
const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? ''

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

function Spinner() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      className="animate-spin"
    >
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
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
// Confetti — pure CSS, no deps
// ---------------------------------------------------------------------------

function Confetti() {
  const pieces = Array.from({ length: 20 }, (_, i) => i)
  const colors = ['#2563EB', '#16a34a', '#dc2626', '#ca8a04', '#7c3aed', '#0891b2']

  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden z-50">
      <style>{`
        @keyframes confetti-fall {
          0%   { transform: translateY(-20px) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
        .confetti-piece {
          position: absolute;
          top: -20px;
          animation: confetti-fall linear forwards;
        }
      `}</style>
      {pieces.map((i) => {
        const left = `${5 + (i * 4.5) % 90}%`
        const delay = `${(i * 0.15) % 2}s`
        const duration = `${1.5 + (i * 0.11) % 1.5}s`
        const color = colors[i % colors.length]
        const size = 6 + (i % 5) * 2
        return (
          <div
            key={i}
            className="confetti-piece"
            style={{
              left,
              animationDelay: delay,
              animationDuration: duration,
              width: size,
              height: size,
              background: color,
              borderRadius: i % 2 === 0 ? '50%' : '2px',
            }}
          />
        )
      })}
    </div>
  )
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
  const onDoneRef = useRef(onDone)
  onDoneRef.current = onDone

  useEffect(() => {
    supabaseBrowser.auth.getSession().then(({ data }) => {
      if (data.session?.user) onDoneRef.current(data.session.user)
    })

    const { data: listener } = supabaseBrowser.auth.onAuthStateChange((_event, session) => {
      if (session?.user) onDoneRef.current(session.user)
    })
    return () => listener.subscription.unsubscribe()
  }, [])

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
// Step 2 — API Key (auto-generate, Turnstile gated)
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
  const [status, setStatus] = useState<'waiting-turnstile' | 'generating' | 'done' | 'error'>(
    TURNSTILE_SITE_KEY ? 'waiting-turnstile' : 'generating'
  )
  const [errorMsg, setErrorMsg] = useState('')
  const [turnstileToken, setTurnstileToken] = useState('')
  const hasGenerated = useRef(false)
  const { copied, copy } = useCopy(apiKey ?? '')

  // Restore key from localStorage if present — skip generation
  useEffect(() => {
    const stored = localStorage.getItem('spainmcp_api_key')
    if (stored) {
      setApiKey(stored)
      setStatus('done')
    }
  }, [])

  // Auto-generate as soon as Turnstile is resolved (or immediately if no Turnstile)
  useEffect(() => {
    if (apiKey) return
    if (hasGenerated.current) return
    if (TURNSTILE_SITE_KEY && !turnstileToken) return

    hasGenerated.current = true
    generateKey(turnstileToken)
  }, [turnstileToken, apiKey])

  async function generateKey(token: string) {
    setStatus('generating')
    setErrorMsg('')
    try {
      const body: Record<string, string> = { email: user.email ?? '' }
      if (token) body.turnstileToken = token

      const res = await fetch('/api/keys/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) {
        setErrorMsg(data.error ?? 'Error generando la key')
        setStatus('error')
        return
      }
      localStorage.setItem('spainmcp_api_key', data.key)
      setApiKey(data.key)
      setStatus('done')
    } catch {
      setErrorMsg('Error de conexión')
      setStatus('error')
    }
  }

  function handleRetry() {
    hasGenerated.current = false
    setTurnstileToken('')
    setErrorMsg('')
    if (TURNSTILE_SITE_KEY) {
      setStatus('waiting-turnstile')
    } else {
      hasGenerated.current = true
      generateKey('')
      setStatus('generating')
    }
  }

  function handleTurnstileVerify(token: string) {
    setTurnstileToken(token)
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="text-center">
        <h2 className="text-xl font-bold text-[var(--foreground)]">Tu API Key</h2>
        <p className="text-sm text-[var(--muted)] mt-1">
          Tu clave de acceso personal — solo se muestra una vez
        </p>
      </div>

      {status === 'generating' && (
        <div className="flex flex-col items-center gap-4 py-8">
          <Spinner />
          <p className="text-sm text-[var(--muted)]">Generando tu API key...</p>
        </div>
      )}

      {status === 'waiting-turnstile' && (
        <div className="flex flex-col gap-4">
          <div className="rounded-xl p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
            <p className="text-sm text-blue-700 dark:text-blue-300">
              Generando key para{' '}
              <strong>{user.email}</strong>. Completa la verificación:
            </p>
          </div>
          <div className="flex justify-center">
            <Turnstile
              siteKey={TURNSTILE_SITE_KEY}
              onVerify={handleTurnstileVerify}
              theme="auto"
            />
          </div>
        </div>
      )}

      {status === 'error' && (
        <div className="flex flex-col gap-4">
          <div className="rounded-xl p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
            <p className="text-sm text-red-700 dark:text-red-300">{errorMsg}</p>
          </div>
          <button
            onClick={handleRetry}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl text-sm font-semibold transition-colors"
          >
            Reintentar
          </button>
        </div>
      )}

      {status === 'done' && apiKey && (
        <div className="flex flex-col gap-4">
          <div className="rounded-xl p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-300 dark:border-amber-700">
            <p className="text-sm font-semibold text-amber-700 dark:text-amber-400">
              Cópiala ahora — no la volveremos a mostrar
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
                {copied ? <CheckIcon className="text-green-500" /> : <CopyIcon />}
              </button>
            </div>
          </div>

          <div className="rounded-xl p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center shrink-0">
              <CheckIcon className="text-white" />
            </div>
            <p className="text-xs text-green-700 dark:text-green-400">
              También enviada a <strong>{user.email}</strong>
            </p>
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
          disabled={status !== 'done' || !apiKey}
          className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white py-2.5 rounded-xl text-sm font-semibold transition-colors"
        >
          Siguiente →
        </button>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Step 3 — Connect tools (toggle switches)
// ---------------------------------------------------------------------------

type ConnectionMap = Record<string, string> // mcpUrl → connectionId

function ToggleSwitch({ checked, onChange, disabled }: { checked: boolean; onChange: () => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      disabled={disabled}
      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-300 dark:focus:ring-blue-800 disabled:opacity-40 ${
        checked ? 'bg-blue-600' : 'bg-[var(--border)]'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
          checked ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  )
}

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
  const [connectionMap, setConnectionMap] = useState<ConnectionMap>({})
  const [actionPending, setActionPending] = useState<Record<string, boolean>>({})
  const [error, setError] = useState<string | null>(null)
  const [nsLoading, setNsLoading] = useState(true)

  useEffect(() => {
    async function init() {
      setNsLoading(true)
      try {
        const listRes = await fetch('/api/v1/namespaces', {
          headers: { Authorization: `Bearer ${apiKey}` },
        })
        const listData = await listRes.json()
        let nsList: Array<{ name: string }> = listData.namespaces ?? []

        if (nsList.length === 0) {
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

        const connRes = await fetch(`/api/v1/connections/${encodeURIComponent(ns)}`, {
          headers: { Authorization: `Bearer ${apiKey}` },
        })
        const connData = await connRes.json()
        const map: ConnectionMap = {}
        for (const c of connData.data ?? []) {
          map[c.mcpUrl] = c.connectionId
        }
        setConnectionMap(map)
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : 'Error de conexión')
      } finally {
        setNsLoading(false)
      }
    }
    init()
  }, [apiKey])

  async function handleToggle(mcp: (typeof AVAILABLE_MCPS)[0]) {
    if (!namespace) return
    const isConnected = mcp.mcpUrl in connectionMap
    setActionPending((p) => ({ ...p, [mcp.id]: true }))
    setError(null)

    try {
      if (isConnected) {
        const connId = connectionMap[mcp.mcpUrl]
        const res = await fetch(
          `/api/v1/connections/${encodeURIComponent(namespace)}/${encodeURIComponent(connId)}`,
          {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${apiKey}` },
          }
        )
        if (!res.ok) {
          const data = await res.json()
          setError(data.error ?? 'Error al desconectar')
          return
        }
        setConnectionMap((prev) => {
          const next = { ...prev }
          delete next[mcp.mcpUrl]
          return next
        })
      } else {
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
        setConnectionMap((prev) => ({
          ...prev,
          [mcp.mcpUrl]: data.connectionId,
        }))
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error al conectar')
    } finally {
      setActionPending((p) => ({ ...p, [mcp.id]: false }))
    }
  }

  const canProceed = Object.keys(connectionMap).length > 0

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
          Activa al menos una para continuar
        </p>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm">
          {error}
        </div>
      )}

      <div className="flex flex-col gap-3">
        {AVAILABLE_MCPS.map((mcp) => {
          const isConnected = mcp.mcpUrl in connectionMap
          const pending = !!actionPending[mcp.id]

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
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
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

                <div className="shrink-0 flex items-center gap-2">
                  {pending && <Spinner />}
                  <ToggleSwitch
                    checked={isConnected}
                    onChange={() => !pending && handleToggle(mcp)}
                    disabled={pending || !namespace}
                  />
                </div>
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
  const [showConfetti, setShowConfetti] = useState(true)
  const { copied, copy } = useCopy(gatewayUrl)

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

  const snippetMap: Record<ConfigTab, string> = {
    'claude-code': clauCodeSnippet,
    'claude-desktop': jsonSnippet,
    cursor: jsonSnippet,
  }

  const { copied: snippetCopied, copy: copySnippet } = useCopy(snippetMap[activeTab])

  useEffect(() => {
    const t = setTimeout(() => setShowConfetti(false), 3000)
    return () => clearTimeout(t)
  }, [])

  return (
    <>
      {showConfetti && <Confetti />}

      <div className="flex flex-col gap-5">
        <div className="text-center">
          <div className="text-4xl mb-3">🎉</div>
          <h2 className="text-xl font-bold text-[var(--foreground)]">Todo listo</h2>
          <p className="text-sm text-[var(--muted)] mt-1">
            Esta es tu URL de gateway MCP personal.
          </p>
        </div>

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
              <p className="text-xs text-[var(--muted)] mb-2">Ejecuta en tu terminal:</p>
            )}
            {(activeTab === 'claude-desktop' || activeTab === 'cursor') && (
              <p className="text-xs text-[var(--muted)] mb-2">
                {activeTab === 'claude-desktop'
                  ? <>Pega en <code className="bg-stone-100 dark:bg-stone-800 px-1 rounded">claude_desktop_config.json</code>:</>
                  : <>Crea <code className="bg-stone-100 dark:bg-stone-800 px-1 rounded">.cursor/mcp.json</code> en tu proyecto:</>
                }
              </p>
            )}
            <div className="relative">
              <pre className="bg-stone-100 dark:bg-stone-800 rounded-lg px-4 py-3 text-xs font-mono text-[var(--foreground)] overflow-x-auto whitespace-pre-wrap break-all pr-10">
                {snippetMap[activeTab]}
              </pre>
              <button
                onClick={copySnippet}
                className="absolute top-2 right-2 p-1.5 rounded-md text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors"
                title="Copiar snippet"
              >
                {snippetCopied ? <CheckIcon className="text-green-500" /> : <CopyIcon />}
              </button>
            </div>
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            onClick={onBack}
            className="px-4 py-2.5 rounded-xl text-sm font-medium text-[var(--foreground)] border border-[var(--border)] hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors"
          >
            ← Volver
          </button>
          <button
            onClick={() => router.push('/account/dashboard')}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl text-sm font-semibold transition-colors"
          >
            Ir al Dashboard →
          </button>
        </div>
      </div>
    </>
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

  // Restore progress after OAuth redirect
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
      <div className="flex items-center gap-3 mb-6">
        <SpainMcpLogo />
        <span className="text-lg font-bold text-[var(--foreground)]">SpainMCP</span>
      </div>

      <ProgressBar step={step} />

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
          <Step3Connect apiKey={apiKey} onDone={handleStep3Done} onBack={() => setStep(2)} />
        )}
        {step === 4 && namespace && (
          <Step4GatewayUrl namespace={namespace} onBack={() => setStep(3)} />
        )}
      </div>

      <p className="mt-4 text-xs text-[var(--muted)]">Paso {step} de 4</p>
    </div>
  )
}
