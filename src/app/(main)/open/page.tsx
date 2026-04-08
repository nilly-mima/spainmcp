"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"

type Client = "claude" | "cursor" | "desktop"

function CopyIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="9" y="9" width="13" height="13" rx="2"/>
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  )
}

const PROXY_BASE = "https://spainmcp-connect.nilmiq.workers.dev"

function buildCommand(client: Client, serverSlug: string): string {
  const url = `${PROXY_BASE}/mcp/@${serverSlug}`
  if (client === "claude") {
    return `claude mcp add --transport http ${serverSlug} ${url}`
  }
  if (client === "cursor") {
    return JSON.stringify(
      { mcpServers: { [serverSlug]: { url } } },
      null,
      2
    )
  }
  if (client === "desktop") {
    return JSON.stringify(
      { mcpServers: { [serverSlug]: { url } } },
      null,
      2
    )
  }
  return url
}

function clientLabel(client: Client): string {
  if (client === "claude") return "Claude Code"
  if (client === "cursor") return "Cursor"
  return "Claude Desktop"
}

function clientInstructions(client: Client): string {
  if (client === "claude") return "Ejecuta este comando en tu terminal:"
  if (client === "cursor") return "Añade esto a tu archivo .cursor/mcp.json:"
  return "Añade esto a tu claude_desktop_config.json:"
}

function OpenPageContent() {
  const params = useSearchParams()
  const [copied, setCopied] = useState(false)
  const [activeClient, setActiveClient] = useState<Client>("claude")

  // Parse server param or uri param (for web+spainmcp:// deep links)
  let serverSlug = params.get("server") ?? ""
  const uri = params.get("uri")
  if (!serverSlug && uri) {
    try {
      const decoded = decodeURIComponent(uri)
      // web+spainmcp://namespace/server-name → namespace/server-name
      const match = decoded.replace(/^web\+spainmcp:\/\//, "")
      serverSlug = match.replace(/^\//, "")
      const clientHint = params.get("client")
      if (clientHint === "cursor") setActiveClient("cursor")
      if (clientHint === "desktop") setActiveClient("desktop")
    } catch { /* keep empty */ }
  }

  const clientHint = params.get("client")
  useEffect(() => {
    if (clientHint === "cursor") setActiveClient("cursor")
    else if (clientHint === "desktop") setActiveClient("desktop")
    else if (clientHint === "claude") setActiveClient("claude")
  }, [clientHint])

  const command = serverSlug ? buildCommand(activeClient, serverSlug) : ""

  function copy() {
    if (!command) return
    navigator.clipboard.writeText(command)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const clients: Client[] = ["claude", "cursor", "desktop"]

  return (
    <div className="max-w-xl mx-auto py-16 px-4">
      <div className="rounded-2xl border p-8" style={{ background: "var(--card)", borderColor: "var(--border)" }}>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2">
              <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/>
              <polyline points="13 2 13 9 20 9"/>
            </svg>
          </div>
          <div>
            <h1 className="text-lg font-bold" style={{ color: "var(--foreground)" }}>
              Instalar servidor MCP
            </h1>
            {serverSlug && (
              <p className="text-sm font-mono mt-0.5" style={{ color: "var(--muted)" }}>
                {serverSlug}
              </p>
            )}
          </div>
        </div>

        {!serverSlug && (
          <div className="rounded-lg px-4 py-3 mb-6 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700">
            <p className="text-sm text-amber-700 dark:text-amber-300">
              No se especificó un servidor. Accede a esta página desde un enlace de instalacion en el directorio de MCPs.
            </p>
          </div>
        )}

        {/* Client selector */}
        <div className="mb-6">
          <p className="text-xs font-medium mb-2 uppercase tracking-wide" style={{ color: "var(--muted)" }}>
            Selecciona tu cliente MCP
          </p>
          <div className="flex gap-2">
            {clients.map(c => (
              <button key={c} onClick={() => setActiveClient(c)}
                className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium border transition-colors ${
                  activeClient === c
                    ? "bg-blue-600 text-white border-blue-600"
                    : "border-stone-300 dark:border-stone-600 text-stone-600 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800"
                }`}>
                {clientLabel(c)}
              </button>
            ))}
          </div>
        </div>

        {/* Command block */}
        {serverSlug && (
          <div className="mb-6">
            <p className="text-xs font-medium mb-2" style={{ color: "var(--muted)" }}>
              {clientInstructions(activeClient)}
            </p>
            <div className="rounded-lg overflow-hidden border" style={{ borderColor: "var(--border)" }}>
              <div className="flex items-center justify-between px-3 py-1.5 border-b" style={{ background: "var(--background)", borderColor: "var(--border)" }}>
                <span className="text-xs" style={{ color: "var(--muted)" }}>
                  {activeClient === "claude" ? "terminal" : "JSON"}
                </span>
                <button onClick={copy}
                  className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded transition-colors font-medium ${
                    copied ? "text-green-600 dark:text-green-400" : "text-stone-500 hover:text-stone-800 dark:hover:text-stone-200"
                  }`}>
                  {copied ? <CheckIcon /> : <CopyIcon />}
                  {copied ? "Copiado" : "Copiar"}
                </button>
              </div>
              <pre className="text-xs p-4 overflow-x-auto leading-relaxed"
                style={{ background: "var(--card)", color: "var(--foreground)" }}>
                {command}
              </pre>
            </div>
          </div>
        )}

        {/* Docs link */}
        <div className="flex items-center justify-between pt-4 border-t" style={{ borderColor: "var(--border)" }}>
          <Link href="/docs" className="text-sm text-blue-600 hover:underline">
            Ver documentacion
          </Link>
          {serverSlug && (
            <Link href={`/mcps/${serverSlug.split("/").pop() ?? serverSlug}`}
              className="text-sm hover:underline" style={{ color: "var(--muted)" }}>
              Ver servidor →
            </Link>
          )}
        </div>
      </div>

      {/* Protocol handler info */}
      <div className="mt-4 rounded-xl border px-5 py-4" style={{ borderColor: "var(--border)", background: "var(--card)" }}>
        <p className="text-xs font-semibold mb-1" style={{ color: "var(--foreground)" }}>
          Enlace directo (web+spainmcp://)
        </p>
        <p className="text-xs" style={{ color: "var(--muted)" }}>
          SpainMCP registra automaticamente el protocolo{" "}
          <code className="bg-stone-100 dark:bg-stone-800 px-1 rounded">web+spainmcp://</code>{" "}
          en tu navegador. Los enlaces de instalacion rapida usaran este protocolo para abrir esta pagina.
        </p>
      </div>
    </div>
  )
}

export default function OpenPage() {
  return (
    <Suspense>
      <OpenPageContent />
    </Suspense>
  )
}
