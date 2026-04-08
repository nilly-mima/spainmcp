'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabaseBrowser } from '@/lib/supabase-client'
import Link from 'next/link'
import { SERVER_TEMPLATES } from '@/data/server-templates'

// ── Tool preview parser ──────────────────────────────────────────────────────
// Extracts tool names + descriptions from raw code string (best-effort regex).
interface ParsedTool {
  name: string
  description: string
}

function parseToolsFromCode(code: string): ParsedTool[] {
  const tools: ParsedTool[] = []
  // Extract individual tool entries by finding name: "..." patterns in the TOOLS section.
  // We scan line-by-line to extract name + description pairs grouped by proximity.
  const lines = code.split('\n')
  let pendingName: string | null = null
  let pendingDesc: string | null = null

  for (const line of lines) {
    const nameMatch = line.match(/name\s*:\s*["'`]([^"'`]+)["'`]/)
    const descMatch = line.match(/description\s*:\s*["'`]([^"'`]+)["'`]/)

    if (nameMatch) {
      // Flush previous pending if any
      if (pendingName !== null) {
        tools.push({ name: pendingName, description: pendingDesc ?? '' })
        pendingDesc = null
      }
      pendingName = nameMatch[1]
      if (descMatch) {
        pendingDesc = descMatch[1]
      }
    } else if (descMatch && pendingName !== null) {
      pendingDesc = descMatch[1]
    } else if (line.trim() === '},' && pendingName !== null) {
      tools.push({ name: pendingName, description: pendingDesc ?? '' })
      pendingName = null
      pendingDesc = null
    }
  }
  // Flush last pending
  if (pendingName !== null) {
    tools.push({ name: pendingName, description: pendingDesc ?? '' })
  }

  // Deduplicate (handleTool switch cases also have name matches — keep only first N unique)
  const seen = new Set<string>()
  return tools.filter((t) => {
    if (seen.has(t.name)) return false
    seen.add(t.name)
    return true
  })
}

// ── Types ────────────────────────────────────────────────────────────────────

type DeployPhase = 'idle' | 'validating' | 'deploying' | 'live'

interface DeployResult {
  qualifiedName: string
  version: string
  status: string
  deployUrl: string
  releaseId: string
}

interface TestResult {
  ok: boolean
  tools?: ParsedTool[]
  toolCount?: number
  error?: string
  note?: string
}

// ── Copy helper ──────────────────────────────────────────────────────────────

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  function handleCopy() {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    }).catch(() => {})
  }
  return (
    <button
      onClick={handleCopy}
      className="flex-shrink-0 p-1 rounded hover:opacity-70 transition-opacity"
      title={copied ? 'Copiado' : 'Copiar'}
    >
      {copied ? (
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      ) : (
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#8b949e" strokeWidth="2">
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
          <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
        </svg>
      )}
    </button>
  )
}

// ── Main Page ────────────────────────────────────────────────────────────────

export default function DeployPage() {
  const router = useRouter()
  const [apiKey, setApiKey] = useState<string | null>(null)
  const [apiKeyInput, setApiKeyInput] = useState('')
  const [qualifiedName, setQualifiedName] = useState('')
  const [code, setCode] = useState(SERVER_TEMPLATES[0].code)
  const [selectedTemplate, setSelectedTemplate] = useState('blank')
  const [deployPhase, setDeployPhase] = useState<DeployPhase>('idle')
  const [deployResult, setDeployResult] = useState<DeployResult | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [testResult, setTestResult] = useState<TestResult | null>(null)
  const [testLoading, setTestLoading] = useState(false)

  useEffect(() => {
    supabaseBrowser.auth.getSession().then(({ data }) => {
      if (!data.session?.user) {
        router.replace('/login?redirect=/publish/deploy')
      } else {
        setAuthLoading(false)
      }
    })
  }, [router])

  useEffect(() => {
    const stored = localStorage.getItem('spainmcp_api_key')
    if (stored) setApiKey(stored)
  }, [])

  const parsedTools = useMemo(() => parseToolsFromCode(code), [code])

  function handleTemplateChange(id: string) {
    const tpl = SERVER_TEMPLATES.find((t) => t.id === id)
    if (tpl) {
      setSelectedTemplate(id)
      setCode(tpl.code)
      setDeployPhase('idle')
      setDeployResult(null)
      setErrorMsg(null)
      setTestResult(null)
    }
  }

  function handleSaveKey(e: React.FormEvent) {
    e.preventDefault()
    if (apiKeyInput.startsWith('sk-spainmcp-')) {
      localStorage.setItem('spainmcp_api_key', apiKeyInput)
      setApiKey(apiKeyInput)
    }
  }

  async function handleDeploy() {
    if (!apiKey || !qualifiedName.trim() || !code.trim()) return

    setDeployPhase('validating')
    setErrorMsg(null)
    setDeployResult(null)
    setTestResult(null)

    // Client-side pre-validation
    await new Promise((r) => setTimeout(r, 400))

    if (!code.includes('export default')) {
      setDeployPhase('idle')
      setErrorMsg('El codigo debe contener "export default".')
      return
    }
    if (parsedTools.length === 0) {
      setDeployPhase('idle')
      setErrorMsg('El array TOOLS debe tener al menos 1 tool.')
      return
    }

    setDeployPhase('deploying')

    try {
      const res = await fetch(
        `/api/v1/servers/${encodeURIComponent(qualifiedName.trim())}/deploy`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({ code: code.trim(), version: '1.0.0' }),
        }
      )

      const data = await res.json()

      if (!res.ok) {
        setDeployPhase('idle')
        setErrorMsg(data.error ?? `Error ${res.status}`)
        return
      }

      setDeployResult(data as DeployResult)
      setDeployPhase('live')
    } catch (err) {
      setDeployPhase('idle')
      setErrorMsg(err instanceof Error ? err.message : 'Error de red')
    }
  }

  async function handleTest() {
    if (!apiKey || !deployResult) return
    setTestLoading(true)
    setTestResult(null)
    try {
      const res = await fetch(
        `/api/v1/servers/${encodeURIComponent(deployResult.qualifiedName)}/deploy/test`,
        {
          method: 'POST',
          headers: { Authorization: `Bearer ${apiKey}` },
        }
      )
      const data = await res.json()
      setTestResult(data as TestResult)
    } catch (err) {
      setTestResult({ ok: false, error: err instanceof Error ? err.message : 'Error de red' })
    } finally {
      setTestLoading(false)
    }
  }

  // ── Derived values ──────────────────────────────────────────────────────

  function buildDeployUrl(qname: string) {
    // namespace/server-name → {namespace}-{server-name}.nilmiq.workers.dev
    return `https://${qname.replace('/', '-')}.nilmiq.workers.dev`
  }

  // ── Render: auth loading ────────────────────────────────────────────────

  if (authLoading) {
    return (
      <div className="max-w-5xl mx-auto py-8 px-4">
        <p className="text-sm" style={{ color: 'var(--muted)' }}>Verificando sesion...</p>
      </div>
    )
  }

  // ── Render: no API key ──────────────────────────────────────────────────

  if (!apiKey) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4">
        <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--foreground)' }}>
          Despliega un MCP Server
        </h1>
        <p className="text-sm mb-8" style={{ color: 'var(--muted)' }}>
          Necesitas una API key para desplegar.
        </p>
        <div className="rounded-2xl p-8 text-center" style={{ border: '1px solid var(--border)' }}>
          <p className="text-sm mb-4" style={{ color: 'var(--muted)' }}>
            Introduce tu API key para continuar.
          </p>
          <form onSubmit={handleSaveKey} className="flex gap-2 max-w-md mx-auto">
            <input
              type="password"
              value={apiKeyInput}
              onChange={(e) => setApiKeyInput(e.target.value)}
              placeholder="sk-spainmcp-..."
              className="flex-1 px-3 py-2 rounded-lg text-sm bg-transparent"
              style={{ border: '1px solid var(--border)', color: 'var(--foreground)' }}
            />
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              Conectar
            </button>
          </form>
          <p className="text-xs mt-3" style={{ color: 'var(--muted)' }}>
            No tienes key?{' '}
            <Link href="/account/api-keys" className="text-blue-500 hover:underline">
              Genera una aqui
            </Link>
          </p>
        </div>
      </div>
    )
  }

  // ── Render: main ────────────────────────────────────────────────────────

  const isDeploying = deployPhase === 'validating' || deployPhase === 'deploying'

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">

      {/* Beta banner */}
      <div
        className="flex items-start gap-3 px-4 py-3 rounded-2xl mb-8"
        style={{ background: '#2563eb12', border: '1px solid #2563eb30' }}
      >
        <svg className="flex-shrink-0 mt-0.5" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
        <p className="text-sm" style={{ color: '#93c5fd' }}>
          <span className="font-semibold">Server Deploy esta en beta.</span>{' '}
          Tu servidor se desplegara en Cloudflare Workers automaticamente cuando Workers for Platforms este activo. El codigo ya queda guardado y listo.
        </p>
      </div>

      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--foreground)' }}>
          Despliega un MCP Server
        </h1>
        <p className="text-sm" style={{ color: 'var(--muted)' }}>
          Escribe tu codigo y despliega en segundos. Sin servidor propio.
        </p>
      </div>

      {/* Top controls: namespace + template selector */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="flex-1 min-w-56">
          <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--muted)' }}>
            Nombre del servidor
          </label>
          <input
            type="text"
            value={qualifiedName}
            onChange={(e) => setQualifiedName(e.target.value)}
            placeholder="mi-namespace/mi-servidor"
            className="w-full px-3 py-2 rounded-lg text-sm bg-transparent font-mono"
            style={{ border: '1px solid var(--border)', color: 'var(--foreground)' }}
          />
          <p className="text-xs mt-1" style={{ color: 'var(--muted)' }}>
            Formato: <span className="font-mono">namespace/nombre</span>
          </p>
        </div>

        <div>
          <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--muted)' }}>
            Plantilla
          </label>
          <div className="flex gap-2">
            {SERVER_TEMPLATES.map((tpl) => (
              <button
                key={tpl.id}
                onClick={() => handleTemplateChange(tpl.id)}
                title={tpl.description}
                className="px-3 py-2 rounded-lg text-xs font-medium transition-colors"
                style={
                  selectedTemplate === tpl.id
                    ? { background: '#2563eb', color: '#fff', border: '1px solid #2563eb' }
                    : { background: 'transparent', color: 'var(--foreground)', border: '1px solid var(--border)' }
                }
              >
                {tpl.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Error banner */}
      {errorMsg && (
        <div
          className="flex items-start gap-2 px-4 py-3 rounded-xl mb-5"
          style={{ background: '#ef444415', border: '1px solid #ef444430' }}
        >
          <svg className="flex-shrink-0 mt-0.5" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="15" y1="9" x2="9" y2="15" />
            <line x1="9" y1="9" x2="15" y2="15" />
          </svg>
          <p className="text-sm flex-1" style={{ color: '#ef4444' }}>{errorMsg}</p>
          <button onClick={() => setErrorMsg(null)} className="text-xs hover:opacity-70" style={{ color: '#ef4444' }}>
            Cerrar
          </button>
        </div>
      )}

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* LEFT: Code editor */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium" style={{ color: 'var(--muted)' }}>
              Codigo del servidor
            </span>
            <button
              onClick={() => handleTemplateChange(selectedTemplate)}
              className="text-xs px-2 py-1 rounded-md hover:opacity-80 transition-opacity"
              style={{ color: 'var(--muted)', border: '1px solid var(--border)' }}
            >
              Resetear plantilla
            </button>
          </div>

          <textarea
            value={code}
            onChange={(e) => {
              setCode(e.target.value)
              if (deployPhase === 'live') {
                setDeployPhase('idle')
                setDeployResult(null)
                setTestResult(null)
              }
            }}
            rows={32}
            spellCheck={false}
            className="w-full rounded-xl p-4 text-sm font-mono resize-y leading-relaxed"
            style={{
              background: '#0d1117',
              color: '#e6edf3',
              border: '1px solid #30363d',
              outline: 'none',
            }}
          />

          {/* Deploy button + phase indicator */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleDeploy}
              disabled={isDeploying || !qualifiedName.trim() || !code.trim()}
              className="flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              style={
                isDeploying || !qualifiedName.trim() || !code.trim()
                  ? { background: '#2563eb80', color: '#fff' }
                  : { background: '#2563eb', color: '#fff' }
              }
            >
              {deployPhase === 'validating'
                ? 'Validando...'
                : deployPhase === 'deploying'
                ? 'Desplegando...'
                : deployPhase === 'live'
                ? 'Redesplegar'
                : 'Desplegar'}
            </button>

            {/* Phase dots */}
            <div className="flex items-center gap-1.5">
              {(['idle', 'validating', 'deploying', 'live'] as DeployPhase[]).map((phase, i) => {
                const active = deployPhase === phase
                const past =
                  (phase === 'idle' && ['validating', 'deploying', 'live'].includes(deployPhase)) ||
                  (phase === 'validating' && ['deploying', 'live'].includes(deployPhase)) ||
                  (phase === 'deploying' && deployPhase === 'live')
                return (
                  <div
                    key={phase}
                    title={['Listo', 'Validando', 'Desplegando', 'Activo'][i]}
                    className="rounded-full transition-all"
                    style={{
                      width: active ? 8 : 6,
                      height: active ? 8 : 6,
                      background: active
                        ? (phase === 'live' ? '#22c55e' : '#2563eb')
                        : past
                        ? '#22c55e60'
                        : 'var(--border)',
                    }}
                  />
                )
              })}
            </div>
          </div>
        </div>

        {/* RIGHT: Preview + Status */}
        <div className="flex flex-col gap-4">

          {/* Tool preview panel */}
          <div className="rounded-2xl p-4" style={{ border: '1px solid var(--border)' }}>
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-medium" style={{ color: 'var(--muted)' }}>
                Tools detectadas
              </p>
              <span
                className="text-xs px-2 py-0.5 rounded-full font-medium"
                style={{
                  background: parsedTools.length > 0 ? '#22c55e20' : 'var(--border)',
                  color: parsedTools.length > 0 ? '#22c55e' : 'var(--muted)',
                }}
              >
                {parsedTools.length} tool{parsedTools.length !== 1 ? 's' : ''}
              </span>
            </div>

            {parsedTools.length === 0 ? (
              <p className="text-xs" style={{ color: 'var(--muted)' }}>
                No se detectaron tools. Asegurate de que TOOLS[] tiene al menos una entrada con <span className="font-mono">name</span>.
              </p>
            ) : (
              <ul className="flex flex-col gap-2">
                {parsedTools.map((tool) => (
                  <li key={tool.name} className="flex items-start gap-2">
                    <span
                      className="flex-shrink-0 mt-0.5 w-4 h-4 rounded flex items-center justify-center text-[10px] font-bold"
                      style={{ background: '#2563eb20', color: '#2563eb' }}
                    >
                      T
                    </span>
                    <div className="min-w-0">
                      <p className="text-xs font-mono font-medium" style={{ color: 'var(--foreground)' }}>
                        {tool.name}
                      </p>
                      {tool.description && (
                        <p className="text-xs truncate" style={{ color: 'var(--muted)' }}>
                          {tool.description}
                        </p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Deploy URL preview (when name is filled) */}
          {qualifiedName.trim() && (
            <div className="rounded-2xl p-4" style={{ border: '1px solid var(--border)' }}>
              <p className="text-xs font-medium mb-2" style={{ color: 'var(--muted)' }}>
                URL que se generara
              </p>
              <div
                className="flex items-center gap-2 px-3 py-2 rounded-lg"
                style={{ background: '#0d1117', border: '1px solid #30363d' }}
              >
                <span className="text-xs font-mono flex-1 truncate" style={{ color: '#e6edf3' }}>
                  {buildDeployUrl(qualifiedName.trim())}
                </span>
                <CopyButton text={buildDeployUrl(qualifiedName.trim())} />
              </div>
            </div>
          )}

          {/* Deploying spinner */}
          {isDeploying && (
            <div
              className="rounded-2xl p-6 flex flex-col items-center justify-center gap-4"
              style={{ border: '1px solid var(--border)' }}
            >
              <div
                className="w-8 h-8 rounded-full border-2 animate-spin"
                style={{ borderColor: '#2563eb', borderTopColor: 'transparent' }}
              />
              <p className="text-sm" style={{ color: 'var(--muted)' }}>
                {deployPhase === 'validating' ? 'Validando codigo...' : 'Guardando y activando servidor...'}
              </p>
            </div>
          )}

          {/* Live state */}
          {deployPhase === 'live' && deployResult && (
            <div
              className="rounded-2xl p-5 flex flex-col gap-4"
              style={{ border: '1px solid #22c55e40', background: '#22c55e08' }}
            >
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full flex items-center justify-center" style={{ background: '#22c55e20' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>
                    Desplegado correctamente
                  </p>
                  <p className="text-xs" style={{ color: 'var(--muted)' }}>
                    Version {deployResult.version} — estado: {deployResult.status}
                  </p>
                </div>
              </div>

              {/* URL */}
              <div>
                <p className="text-xs font-medium mb-1.5" style={{ color: 'var(--muted)' }}>
                  URL del servidor
                </p>
                <div
                  className="flex items-center gap-2 px-3 py-2 rounded-lg"
                  style={{ background: '#0d1117', border: '1px solid #30363d' }}
                >
                  <span className="text-xs font-mono flex-1 truncate" style={{ color: '#e6edf3' }}>
                    {deployResult.deployUrl}
                  </span>
                  <CopyButton text={deployResult.deployUrl} />
                </div>
              </div>

              {/* Integration snippets */}
              <div>
                <p className="text-xs font-medium mb-2" style={{ color: 'var(--muted)' }}>
                  Como conectarlo
                </p>
                <div className="flex flex-col gap-2">
                  {[
                    {
                      label: 'Claude Desktop',
                      snippet: `{"mcpServers":{"${deployResult.qualifiedName}":{"url":"${deployResult.deployUrl}"}}}`,
                    },
                    {
                      label: 'Cursor / VS Code',
                      snippet: `npx mcp-remote ${deployResult.deployUrl}`,
                    },
                  ].map((item) => (
                    <div key={item.label}>
                      <p className="text-xs mb-1" style={{ color: 'var(--muted)' }}>{item.label}</p>
                      <div
                        className="flex items-start gap-2 px-3 py-2 rounded-lg"
                        style={{ background: '#0d1117', border: '1px solid #30363d' }}
                      >
                        <code className="text-xs font-mono flex-1 break-all" style={{ color: '#e6edf3' }}>
                          {item.snippet}
                        </code>
                        <CopyButton text={item.snippet} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Test button */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <button
                    onClick={handleTest}
                    disabled={testLoading}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
                    style={{ background: '#2563eb', color: '#fff' }}
                  >
                    {testLoading ? 'Probando...' : 'Probar servidor (tools/list)'}
                  </button>
                  {testLoading && (
                    <div
                      className="w-4 h-4 rounded-full border-2 animate-spin"
                      style={{ borderColor: '#2563eb', borderTopColor: 'transparent' }}
                    />
                  )}
                </div>

                {testResult && (
                  <div
                    className="rounded-lg px-3 py-2.5"
                    style={{
                      background: testResult.ok ? '#22c55e10' : '#ef444410',
                      border: `1px solid ${testResult.ok ? '#22c55e30' : '#ef444430'}`,
                    }}
                  >
                    {testResult.ok ? (
                      <>
                        <p className="text-xs font-medium mb-1" style={{ color: '#22c55e' }}>
                          Servidor respondio correctamente — {testResult.toolCount} tool{(testResult.toolCount ?? 0) !== 1 ? 's' : ''}
                        </p>
                        {testResult.tools && testResult.tools.length > 0 && (
                          <ul className="flex flex-col gap-0.5">
                            {testResult.tools.map((t) => (
                              <li key={t.name} className="text-xs font-mono" style={{ color: 'var(--muted)' }}>
                                · {t.name}
                              </li>
                            ))}
                          </ul>
                        )}
                      </>
                    ) : (
                      <>
                        <p className="text-xs font-medium mb-1" style={{ color: '#f87171' }}>
                          {testResult.error ?? 'Error al contactar el servidor'}
                        </p>
                        {testResult.note && (
                          <p className="text-xs" style={{ color: 'var(--muted)' }}>
                            {testResult.note}
                          </p>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>

              <div className="flex gap-2 pt-1 border-t" style={{ borderColor: 'var(--border)' }}>
                <button
                  onClick={() => {
                    setDeployPhase('idle')
                    setDeployResult(null)
                    setTestResult(null)
                  }}
                  className="text-xs px-3 py-1.5 rounded-lg hover:opacity-80 transition-opacity"
                  style={{ border: '1px solid var(--border)', color: 'var(--muted)' }}
                >
                  Nuevo deploy
                </button>
                <Link
                  href="/account/my-servers"
                  className="text-xs px-3 py-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                >
                  Ver mis servidores
                </Link>
              </div>
            </div>
          )}

          {/* Idle guide (only when not live/deploying) */}
          {deployPhase === 'idle' && (
            <div className="rounded-2xl p-5" style={{ border: '1px solid var(--border)' }}>
              <h2 className="text-sm font-semibold mb-3" style={{ color: 'var(--foreground)' }}>
                Como funciona
              </h2>
              <ol className="flex flex-col gap-3">
                {[
                  { n: '1', title: 'Elige una plantilla', body: 'Selecciona En blanco, API Proxy o Base de datos para empezar con el codigo correcto.' },
                  { n: '2', title: 'Edita las tools', body: 'Modifica TOOLS[] y handleTool(). El panel de la derecha muestra las tools detectadas en tiempo real.' },
                  { n: '3', title: 'Asigna un nombre y despliega', body: 'Formato namespace/servidor. El namespace debe existir en tu cuenta.' },
                  { n: '4', title: 'Prueba el servidor', body: 'Usa el boton Probar para enviar tools/list y verificar que el servidor responde.' },
                ].map((step) => (
                  <li key={step.n} className="flex gap-3">
                    <span
                      className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold"
                      style={{ background: '#2563eb20', color: '#2563eb' }}
                    >
                      {step.n}
                    </span>
                    <div>
                      <p className="text-xs font-medium" style={{ color: 'var(--foreground)' }}>
                        {step.title}
                      </p>
                      <p className="text-xs mt-0.5" style={{ color: 'var(--muted)' }}>
                        {step.body}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
