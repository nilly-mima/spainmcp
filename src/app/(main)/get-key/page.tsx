"use client"

import { useState } from "react"
import Link from "next/link"
import Turnstile from "@/components/Turnstile"

type State = "idle" | "loading" | "success" | "error"

const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? ""

export default function GetKeyPage() {
  const [email, setEmail] = useState("")
  const [state, setState] = useState<State>("idle")
  const [apiKey, setApiKey] = useState("")
  const [copied, setCopied] = useState(false)
  const [errorMsg, setErrorMsg] = useState("")
  const [turnstileToken, setTurnstileToken] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (TURNSTILE_SITE_KEY && !turnstileToken) {
      setErrorMsg("Esperando verificación de seguridad...")
      setState("error")
      return
    }
    setState("loading")
    try {
      const res = await fetch("/api/keys/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, turnstileToken }),
      })
      const data = await res.json()
      if (!res.ok || !data.success) {
        setErrorMsg(data.error ?? "Error inesperado")
        setState("error")
        return
      }
      setApiKey(data.key)
      setState("success")
    } catch {
      setErrorMsg("Error de red. Inténtalo de nuevo.")
      setState("error")
    }
  }

  function copyKey() {
    navigator.clipboard.writeText(apiKey)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <main className="min-h-screen bg-[var(--background)] flex items-center justify-center px-4">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 font-bold text-xl text-stone-900 dark:text-stone-100">
            <svg width="24" height="24" viewBox="0 0 20 20" fill="none">
              <rect x="1"  y="1"  width="8" height="8" rx="2" fill="#2563EB"/>
              <rect x="11" y="1"  width="8" height="8" rx="2" fill="#2563EB"/>
              <rect x="1"  y="11" width="8" height="8" rx="2" fill="#2563EB"/>
              <rect x="11" y="11" width="8" height="8" rx="2" fill="#2563EB"/>
            </svg>
            SpainMCP
          </Link>
        </div>

        <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-8">

          {state !== "success" ? (
            <>
              <h1 className="text-xl font-bold text-[var(--foreground)] mb-1">Obtén tu API key gratis</h1>
              <p className="text-sm text-stone-500 dark:text-stone-400 mb-6">
                Accede al BOE, Registro Mercantil e INE desde Claude, Cursor o cualquier cliente MCP.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-[var(--foreground)] mb-1.5">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="tu@email.com"
                    className="w-full px-3 py-2.5 rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] placeholder-stone-400 dark:placeholder-stone-600 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {state === "error" && (
                  <p className="text-sm text-red-500">{errorMsg}</p>
                )}

                {TURNSTILE_SITE_KEY && (
                  <Turnstile
                    siteKey={TURNSTILE_SITE_KEY}
                    onVerify={setTurnstileToken}
                  />
                )}

                <button
                  type="submit"
                  disabled={state === "loading"}
                  className="w-full py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold text-sm transition-colors"
                >
                  {state === "loading" ? "Generando..." : "Obtener mi API key →"}
                </button>
              </form>

              <div className="mt-6 pt-6 border-t border-[var(--border)]">
                <p className="text-xs text-stone-500 dark:text-stone-400 text-center">
                  Plan gratuito · 100 llamadas/día · Sin tarjeta
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h1 className="text-xl font-bold text-[var(--foreground)]">Tu API key</h1>
              </div>

              <p className="text-sm text-blue-600 dark:text-blue-400 font-medium mb-3">
                Cópiala ahora — no la volveremos a mostrar.
              </p>

              <div className="bg-stone-100 dark:bg-stone-900 rounded-lg p-3 mb-3 flex items-center justify-between gap-2">
                <code className="text-xs text-stone-800 dark:text-stone-200 break-all">{apiKey}</code>
                <button
                  onClick={copyKey}
                  className="shrink-0 text-xs px-2.5 py-1.5 rounded-md bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors"
                >
                  {copied ? "✓" : "Copiar"}
                </button>
              </div>

              <div className="bg-stone-50 dark:bg-stone-900/50 rounded-lg p-4 text-xs text-stone-600 dark:text-stone-400 space-y-1.5 mb-6">
                <p className="font-semibold text-[var(--foreground)] mb-2">Cómo conectarte:</p>
                <p><span className="font-medium">Claude Desktop / Cursor:</span></p>
                <code className="block bg-stone-100 dark:bg-stone-800 rounded p-2 text-xs">
                  {`"url": "https://spainmcp-fngo.vercel.app/api/mcp"`}<br/>
                  {`"headers": { "Authorization": "Bearer ${apiKey}" }`}
                </code>
              </div>

              <Link
                href="/"
                className="block text-center text-sm text-stone-500 dark:text-stone-400 hover:text-[var(--foreground)] transition-colors"
              >
                ← Volver al inicio
              </Link>
            </>
          )}
        </div>
      </div>
    </main>
  )
}
