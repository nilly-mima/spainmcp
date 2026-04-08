'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabaseBrowser } from '@/lib/supabase-client'
import Link from 'next/link'

const TEMPLATE = `// ═══════════════════════════════════════════════════
// SpainMCP — MCP Server Template
// Customiza las tools y despliega en SpainMCP
// Zero dependencies — funciona como CF Worker directo
// ═══════════════════════════════════════════════════

// ── Define tus tools aquí ──

const TOOLS = [
  {
    name: "hello",
    description: "Saluda a alguien por su nombre",
    inputSchema: {
      type: "object",
      properties: {
        name: { type: "string", description: "Nombre de la persona" },
      },
    },
  },
  {
    name: "sumar",
    description: "Suma dos números",
    inputSchema: {
      type: "object",
      properties: {
        a: { type: "number", description: "Primer número" },
        b: { type: "number", description: "Segundo número" },
      },
      required: ["a", "b"],
    },
  },
];

// ── Implementa tus tools aquí ──

async function handleTool(
  name: string,
  args: Record<string, unknown>,
): Promise<{ type: string; text: string }[]> {
  switch (name) {
    case "hello": {
      const who = (args.name as string) ?? "Mundo";
      return [{ type: "text", text: \`¡Hola, \${who}!\` }];
    }
    case "sumar": {
      const a = Number(args.a ?? 0);
      const b = Number(args.b ?? 0);
      return [{ type: "text", text: \`\${a} + \${b} = \${a + b}\` }];
    }
    default:
      throw new Error(\`Tool no encontrada: \${name}\`);
  }
}

// ═══════════════════════════════════════════════════
// MCP Protocol handler — NO TOCAR
// ═══════════════════════════════════════════════════

const SERVER_NAME = "mi-mcp-server";
const SERVER_VERSION = "1.0.0";

export default {
  async fetch(request: Request): Promise<Response> {
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization, Accept",
        },
      });
    }

    if (request.method === "GET") {
      return Response.json({
        name: SERVER_NAME,
        version: SERVER_VERSION,
        protocol: "MCP Streamable HTTP",
        tools: TOOLS.length,
      });
    }

    if (request.method !== "POST") {
      return Response.json({ error: "Method not allowed" }, { status: 405 });
    }

    let body: { jsonrpc?: string; id?: unknown; method?: string; params?: Record<string, unknown> };
    try {
      body = await request.json();
    } catch {
      return Response.json(
        { jsonrpc: "2.0", error: { code: -32700, message: "Parse error" }, id: null },
        { status: 400 },
      );
    }

    const { method, id, params } = body;

    if (method === "initialize") {
      return Response.json({
        jsonrpc: "2.0",
        id,
        result: {
          protocolVersion: "2024-11-05",
          serverInfo: { name: SERVER_NAME, version: SERVER_VERSION },
          capabilities: { tools: { listChanged: false } },
        },
      });
    }

    if (method === "notifications/initialized") {
      return Response.json({ jsonrpc: "2.0", id, result: {} });
    }

    if (method === "tools/list") {
      return Response.json({
        jsonrpc: "2.0",
        id,
        result: { tools: TOOLS },
      });
    }

    if (method === "tools/call") {
      const toolName = (params?.name as string) ?? "";
      const args = (params?.arguments as Record<string, unknown>) ?? {};

      const tool = TOOLS.find((t) => t.name === toolName);
      if (!tool) {
        return Response.json({
          jsonrpc: "2.0",
          id,
          error: { code: -32601, message: \`Tool not found: \${toolName}\` },
        });
      }

      try {
        const content = await handleTool(toolName, args);
        return Response.json({ jsonrpc: "2.0", id, result: { content } });
      } catch (err) {
        return Response.json({
          jsonrpc: "2.0",
          id,
          error: { code: -32000, message: String(err) },
        });
      }
    }

    return Response.json({
      jsonrpc: "2.0",
      id,
      error: { code: -32601, message: \`Method not found: \${method}\` },
    });
  },
};
`

type DeployState = 'idle' | 'deploying' | 'success' | 'error'

interface DeployResult {
  qualifiedName: string
  version: string
  status: string
  deployUrl: string
  releaseId: string
}

export default function DeployPage() {
  const router = useRouter()
  const [apiKey, setApiKey] = useState<string | null>(null)
  const [apiKeyInput, setApiKeyInput] = useState('')
  const [qualifiedName, setQualifiedName] = useState('')
  const [code, setCode] = useState(TEMPLATE)
  const [deployState, setDeployState] = useState<DeployState>('idle')
  const [deployResult, setDeployResult] = useState<DeployResult | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [authLoading, setAuthLoading] = useState(true)

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

  function handleSaveKey(e: React.FormEvent) {
    e.preventDefault()
    if (apiKeyInput.startsWith('sk-spainmcp-')) {
      localStorage.setItem('spainmcp_api_key', apiKeyInput)
      setApiKey(apiKeyInput)
    }
  }

  async function handleDeploy() {
    if (!apiKey || !qualifiedName.trim() || !code.trim()) return

    setDeployState('deploying')
    setErrorMsg(null)
    setDeployResult(null)

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
        setDeployState('error')
        setErrorMsg(data.error ?? `Error ${res.status}`)
        return
      }

      setDeployResult(data as DeployResult)
      setDeployState('success')
    } catch (err) {
      setDeployState('error')
      setErrorMsg(err instanceof Error ? err.message : 'Error de red')
    }
  }

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text).catch(() => {})
  }

  if (authLoading) {
    return (
      <div className="max-w-5xl mx-auto py-8 px-4">
        <p className="text-sm" style={{ color: 'var(--muted)' }}>Verificando sesion...</p>
      </div>
    )
  }

  if (!apiKey) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4">
        <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--foreground)' }}>
          Despliega un MCP Server
        </h1>
        <p className="text-sm mb-8" style={{ color: 'var(--muted)' }}>
          Necesitas una API key para desplegar.
        </p>
        <div
          className="rounded-xl p-8 text-center"
          style={{ border: '1px solid var(--border)' }}
        >
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

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--foreground)' }}>
          Despliega un MCP Server
        </h1>
        <p className="text-sm" style={{ color: 'var(--muted)' }}>
          Escribe tu codigo y despliega en segundos. Sin servidor propio.
        </p>
      </div>

      {/* Namespace input */}
      <div className="mb-4">
        <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--muted)' }}>
          Nombre del servidor (namespace/server-name)
        </label>
        <input
          type="text"
          value={qualifiedName}
          onChange={(e) => setQualifiedName(e.target.value)}
          placeholder="mi-namespace/mi-servidor"
          className="w-full max-w-sm px-3 py-2 rounded-lg text-sm bg-transparent font-mono"
          style={{ border: '1px solid var(--border)', color: 'var(--foreground)' }}
        />
        <p className="text-xs mt-1" style={{ color: 'var(--muted)' }}>
          El servidor debe existir en tu cuenta. Formato: <span className="font-mono">namespace/nombre</span>
        </p>
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LEFT: Code editor */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium" style={{ color: 'var(--muted)' }}>
              Codigo del servidor
            </span>
            <button
              onClick={() => setCode(TEMPLATE)}
              className="text-xs px-2 py-1 rounded-md hover:opacity-80 transition-opacity"
              style={{ color: 'var(--muted)', border: '1px solid var(--border)' }}
            >
              Resetear template
            </button>
          </div>
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            rows={30}
            spellCheck={false}
            className="w-full rounded-xl p-4 text-sm font-mono resize-y leading-relaxed"
            style={{
              background: '#0d1117',
              color: '#e6edf3',
              border: '1px solid #30363d',
              outline: 'none',
            }}
          />
          <button
            onClick={handleDeploy}
            disabled={deployState === 'deploying' || !qualifiedName.trim() || !code.trim()}
            className="w-full py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            style={
              deployState === 'deploying' || !qualifiedName.trim() || !code.trim()
                ? { background: '#2563eb80', color: '#fff' }
                : { background: '#2563eb', color: '#fff' }
            }
          >
            {deployState === 'deploying' ? 'Desplegando...' : 'Desplegar'}
          </button>
        </div>

        {/* RIGHT: Status panel */}
        <div className="flex flex-col gap-4">
          {/* Idle state */}
          {deployState === 'idle' && (
            <div
              className="rounded-xl p-6 h-full"
              style={{ border: '1px solid var(--border)' }}
            >
              <h2 className="text-base font-semibold mb-4" style={{ color: 'var(--foreground)' }}>
                Como funciona
              </h2>
              <ol className="flex flex-col gap-3">
                {[
                  { n: '1', title: 'Escribe tu codigo', body: 'Edita el template de la izquierda. Define tools en TOOLS[] e implementalas en handleTool().' },
                  { n: '2', title: 'Asigna un nombre', body: 'Usa el formato namespace/servidor. El namespace debe existir en tu cuenta.' },
                  { n: '3', title: 'Haz clic en Desplegar', body: 'Tu codigo se guarda y queda disponible en el gateway de SpainMCP al instante.' },
                  { n: '4', title: 'Conecta tu agente', body: 'Usa la URL desplegada como endpoint MCP desde Claude, Cursor o cualquier cliente compatible.' },
                ].map((step) => (
                  <li key={step.n} className="flex gap-3">
                    <span
                      className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                      style={{ background: '#2563eb20', color: '#2563eb' }}
                    >
                      {step.n}
                    </span>
                    <div>
                      <p className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>
                        {step.title}
                      </p>
                      <p className="text-xs mt-0.5" style={{ color: 'var(--muted)' }}>
                        {step.body}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>

              <div
                className="mt-6 p-4 rounded-lg"
                style={{ background: '#2563eb10', border: '1px solid #2563eb30' }}
              >
                <p className="text-xs font-medium mb-1" style={{ color: '#60a5fa' }}>
                  Sobre el template
                </p>
                <p className="text-xs" style={{ color: 'var(--muted)' }}>
                  El template incluye dos tools de ejemplo (hello y sumar) y el handler MCP completo
                  compatible con el protocolo MCP Streamable HTTP 2024-11-05.
                  Solo necesitas tocar TOOLS[] y handleTool().
                </p>
              </div>
            </div>
          )}

          {/* Deploying state */}
          {deployState === 'deploying' && (
            <div
              className="rounded-xl p-6 flex flex-col items-center justify-center gap-4 min-h-64"
              style={{ border: '1px solid var(--border)' }}
            >
              <div
                className="w-10 h-10 rounded-full border-2 border-t-transparent animate-spin"
                style={{ borderColor: '#2563eb', borderTopColor: 'transparent' }}
              />
              <div className="text-center">
                <p className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>
                  Desplegando...
                </p>
                <p className="text-xs mt-1" style={{ color: 'var(--muted)' }}>
                  Guardando codigo y activando el servidor
                </p>
              </div>
            </div>
          )}

          {/* Error state */}
          {deployState === 'error' && (
            <div
              className="rounded-xl p-6 flex flex-col gap-4"
              style={{ border: '1px solid var(--border)' }}
            >
              <div
                className="flex items-center gap-2 p-3 rounded-lg"
                style={{ background: '#ef444415', border: '1px solid #ef444430' }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="15" y1="9" x2="9" y2="15"/>
                  <line x1="9" y1="9" x2="15" y2="15"/>
                </svg>
                <p className="text-sm" style={{ color: '#ef4444' }}>
                  {errorMsg ?? 'Error desconocido'}
                </p>
              </div>
              <button
                onClick={() => { setDeployState('idle'); setErrorMsg(null) }}
                className="text-sm text-blue-500 hover:underline text-left"
              >
                Volver a intentar
              </button>
            </div>
          )}

          {/* Success state */}
          {deployState === 'success' && deployResult && (
            <div
              className="rounded-xl p-6 flex flex-col gap-5"
              style={{ border: '1px solid var(--border)' }}
            >
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: '#22c55e20' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5">
                    <polyline points="20 6 9 17 4 12"/>
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
                  <button
                    onClick={() => copyToClipboard(deployResult.deployUrl)}
                    className="flex-shrink-0 p-1 rounded hover:opacity-70 transition-opacity"
                    title="Copiar URL"
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#8b949e" strokeWidth="2">
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                      <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
                    </svg>
                  </button>
                </div>
              </div>

              <div>
                <p className="text-xs font-medium mb-2" style={{ color: 'var(--muted)' }}>
                  Como conectarlo
                </p>
                <div className="flex flex-col gap-2">
                  {[
                    { label: 'Claude Desktop', snippet: `{"mcpServers":{"${deployResult.qualifiedName}":{"url":"${deployResult.deployUrl}"}}}` },
                    { label: 'Cursor / VS Code', snippet: `npx mcp-remote ${deployResult.deployUrl}` },
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
                        <button
                          onClick={() => copyToClipboard(item.snippet)}
                          className="flex-shrink-0 p-1 rounded hover:opacity-70 transition-opacity mt-0.5"
                          title="Copiar"
                        >
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#8b949e" strokeWidth="2">
                            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                            <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => { setDeployState('idle'); setDeployResult(null) }}
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
        </div>
      </div>
    </div>
  )
}
