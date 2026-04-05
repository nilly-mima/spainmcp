"use client"

import { useState } from "react"
import Link from "next/link"

type State = "idle" | "loading" | "success" | "error"

export default function PublishMcpPage() {
  const [state, setState] = useState<State>("idle")
  const [errorMsg, setErrorMsg] = useState("")
  const [result, setResult] = useState<{ namespace: string; gateway_url: string } | null>(null)
  const [copied, setCopied] = useState(false)

  const [form, setForm] = useState({
    namespace: "",
    display_name: "",
    description: "",
    upstream_url: "",
    email: "",
    api_key: "",
  })

  function update(field: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [field]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setState("loading")
    try {
      const res = await fetch("/api/servers/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok || !data.success) {
        setErrorMsg(data.error ?? "Error inesperado")
        setState("error")
        return
      }
      setResult({ namespace: data.namespace, gateway_url: data.gateway_url })
      setState("success")
    } catch {
      setErrorMsg("Error de red. Inténtalo de nuevo.")
      setState("error")
    }
  }

  function copy() {
    if (!result) return
    navigator.clipboard.writeText(result.gateway_url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const inputClass =
    "w-full px-3 py-2.5 rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] placeholder-stone-400 dark:placeholder-stone-600 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
  const labelClass = "block text-sm font-medium text-[var(--foreground)] mb-1.5"

  return (
    <main className="min-h-screen bg-[var(--background)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">

        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 font-bold text-xl text-stone-900 dark:text-stone-100">
            <svg width="24" height="24" viewBox="0 0 20 20" fill="none">
              <rect x="1"  y="1"  width="8" height="8" rx="2" fill="#EA580C"/>
              <rect x="11" y="1"  width="8" height="8" rx="2" fill="#EA580C"/>
              <rect x="1"  y="11" width="8" height="8" rx="2" fill="#EA580C"/>
              <rect x="11" y="11" width="8" height="8" rx="2" fill="#EA580C"/>
            </svg>
            SpainMCP
          </Link>
          <p className="mt-2 text-sm text-stone-500 dark:text-stone-400">
            Publica tu MCP server en el directorio
          </p>
        </div>

        <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-8">

          {state !== "success" ? (
            <>
              <h1 className="text-xl font-bold text-[var(--foreground)] mb-1">Publicar un MCP</h1>
              <p className="text-sm text-stone-500 dark:text-stone-400 mb-6">
                Tu servidor MCP aparecerá en el directorio y recibirá una URL de gateway en SpainMCP.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">

                <div>
                  <label className={labelClass}>
                    Namespace
                    <span className="ml-1 text-stone-400 font-normal">(@usuario/nombre)</span>
                  </label>
                  <input type="text" required value={form.namespace}
                    onChange={update("namespace")}
                    placeholder="@miempresa/boe-pro"
                    pattern="^@[a-z0-9_-]+/[a-z0-9_-]+$"
                    title="Formato: @usuario/nombre — solo minúsculas, guiones y números"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>Nombre visible</label>
                  <input type="text" required value={form.display_name}
                    onChange={update("display_name")}
                    placeholder="Mi MCP de ejemplo"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>Descripción</label>
                  <textarea value={form.description}
                    onChange={update("description")}
                    placeholder="Qué hace tu MCP en una frase..."
                    rows={2}
                    className={inputClass + " resize-none"}
                  />
                </div>

                <div>
                  <label className={labelClass}>URL de tu MCP server</label>
                  <input type="url" required value={form.upstream_url}
                    onChange={update("upstream_url")}
                    placeholder="https://mi-mcp.vercel.app/api/mcp"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>Email</label>
                  <input type="email" required value={form.email}
                    onChange={update("email")}
                    placeholder="tu@empresa.com"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>
                    API key de SpainMCP
                    <Link href="/get-key" className="ml-2 text-orange-600 hover:underline font-normal">
                      Obtener una →
                    </Link>
                  </label>
                  <input type="password" required value={form.api_key}
                    onChange={update("api_key")}
                    placeholder="sk-spainmcp-..."
                    className={inputClass}
                  />
                </div>

                {state === "error" && (
                  <p className="text-sm text-red-500">{errorMsg}</p>
                )}

                <button type="submit" disabled={state === "loading"}
                  className="w-full py-2.5 rounded-lg bg-orange-600 hover:bg-orange-700 disabled:opacity-60 text-white font-semibold text-sm transition-colors"
                >
                  {state === "loading" ? "Verificando y publicando..." : "Publicar MCP →"}
                </button>
              </form>

              <p className="mt-6 text-xs text-stone-400 dark:text-stone-500 text-center">
                Al publicar aceptas que tu servidor sea listado públicamente en SpainMCP.
              </p>
            </>
          ) : (
            <>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
                  </svg>
                </div>
                <h1 className="text-xl font-bold text-[var(--foreground)]">MCP publicado</h1>
              </div>

              <p className="text-sm text-stone-500 dark:text-stone-400 mb-4">
                Tu MCP está disponible en el gateway de SpainMCP.
              </p>

              <div className="space-y-3 mb-6">
                <div>
                  <p className="text-xs font-medium text-stone-500 dark:text-stone-400 mb-1">Namespace</p>
                  <code className="block text-sm text-stone-800 dark:text-stone-200 bg-stone-100 dark:bg-stone-900 rounded-lg px-3 py-2">
                    {result?.namespace}
                  </code>
                </div>
                <div>
                  <p className="text-xs font-medium text-stone-500 dark:text-stone-400 mb-1">Gateway URL</p>
                  <div className="flex items-center gap-2 bg-stone-100 dark:bg-stone-900 rounded-lg px-3 py-2">
                    <code className="text-xs text-stone-800 dark:text-stone-200 break-all flex-1">
                      {result?.gateway_url}
                    </code>
                    <button onClick={copy}
                      className="shrink-0 text-xs px-2.5 py-1.5 rounded-md bg-orange-600 hover:bg-orange-700 text-white font-medium transition-colors"
                    >
                      {copied ? "✓" : "Copiar"}
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-stone-50 dark:bg-stone-900/50 rounded-lg p-4 text-xs text-stone-600 dark:text-stone-400 mb-6">
                <p className="font-semibold text-[var(--foreground)] mb-2">Tus usuarios se conectan con:</p>
                <code className="block bg-stone-100 dark:bg-stone-800 rounded p-2">
                  npx spainmcp connect --client claude --upstream "{result?.gateway_url}"
                </code>
              </div>

              <Link href="/mcps"
                className="block text-center text-sm text-stone-500 dark:text-stone-400 hover:text-[var(--foreground)] transition-colors"
              >
                ← Ver directorio de MCPs
              </Link>
            </>
          )}
        </div>
      </div>
    </main>
  )
}
