"use client"

import { useState } from "react"
import Link from "next/link"

type State = "idle" | "loading" | "success" | "error"
type Param = { name: string; type: "string" | "number" | "boolean"; from: "query" | "header"; required: boolean; description: string; defaultValue: string }

const slides = [
  {
    title: "Distribución.",
    body: "Publica en SpainMCP. Llega a los agentes de IA.",
    visual: "distribution",
  },
  {
    title: "Observabilidad.",
    body: "Ve cómo se usan tus herramientas. Construye la mejor experiencia de agente.",
    visual: "observability",
  },
]

function DistributionVisual({ ns, sid }: { ns: string; sid: string }) {
  const label = ns && sid ? `${ns}/${sid}.mcp.lat` : "tu-namespace.mcp.lat"
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 border border-stone-300 dark:border-stone-600 rounded-full px-3 py-1">
          <span className="text-xs text-stone-600 dark:text-stone-300 font-mono">{label}</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-stone-400">
            <circle cx="12" cy="12" r="10"/><polyline points="8 12 12 16 16 12"/><line x1="12" y1="8" x2="12" y2="16"/>
          </svg>
        </div>
      </div>
      <div className="flex items-center gap-1.5 text-xs text-stone-500 dark:text-stone-400">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
        </svg>
        <span>10.2k llamadas</span>
      </div>
    </div>
  )
}

function ObservabilityVisual() {
  const points = "20,40 60,35 100,38 140,25 180,30 220,20 260,28 300,15"
  return (
    <svg width="300" height="60" viewBox="0 0 300 60" className="w-full">
      <polyline points={points} fill="none" stroke="currentColor" strokeWidth="1.5" className="text-stone-700 dark:text-stone-300"/>
    </svg>
  )
}

function GlobeLabel({ text, cx, cy, anchor = "middle" }: { text: string; cx: number; cy: number; anchor?: "middle" | "start" }) {
  const charW = 6.2
  const pad = 14
  const w = Math.max(text.length * charW + pad, 50)
  const h = 18
  const x = anchor === "middle" ? cx - w / 2 : cx
  return (
    <>
      <rect x={x} y={cy - h / 2} width={w} height={h} rx="9" fill="#EFF6FF" stroke="#2563EB" strokeWidth="1"/>
      <text x={x + w / 2} y={cy + 4} textAnchor="middle" fontSize="9" fill="#2563EB" fontWeight="500">{text}</text>
    </>
  )
}

function GlobeIllustration({ ns, serverId, upstreamUrl }: { ns: string; serverId: string; upstreamUrl: string }) {
  const gatewayLabel = ns && serverId ? `${ns}-${serverId}.mcp.lat` : "gateway SpainMCP"
  let serverLabel = "tu servidor MCP"
  if (upstreamUrl) {
    try {
      const u = new URL(upstreamUrl)
      const path = u.pathname === "/" ? "" : u.pathname
      serverLabel = (u.hostname + path).slice(0, 22)
    } catch {
      serverLabel = upstreamUrl.replace(/^https?:\/\//, "").slice(0, 22)
    }
  }

  return (
    <svg viewBox="0 0 380 290" fill="none" className="w-full max-w-sm mx-auto">
      {/* Globe base — dotted latitude lines */}
      {Array.from({ length: 12 }, (_, i) => {
        const cy = 145 + (i - 5.5) * 18
        const rx = Math.sqrt(Math.max(0, 130 * 130 - (cy - 145) * (cy - 145))) * 0.85
        return rx > 8 ? (
          <ellipse key={i} cx="175" cy={cy} rx={rx} ry={6}
            stroke="#d6d3d1" strokeWidth="1" strokeDasharray="3 4" fill="none" />
        ) : null
      })}
      {/* Vertical arcs */}
      {[-70, -35, 0, 35, 70].map((offset, i) => (
        <ellipse key={i} cx="175" cy="145" rx={Math.abs(offset) || 8} ry="130"
          stroke="#d6d3d1" strokeWidth="1" strokeDasharray="3 4" fill="none" />
      ))}
      <circle cx="175" cy="145" r="130" stroke="#e7e5e4" strokeWidth="1.5" fill="none"/>

      {/* Connection lines */}
      <line x1="175" y1="62" x2="250" y2="125" stroke="#2563EB" strokeWidth="1.5" opacity="0.6"/>
      <line x1="250" y1="125" x2="112" y2="198" stroke="#2563EB" strokeWidth="1.5" opacity="0.6"/>

      {/* Node: gateway (top center) */}
      <circle cx="175" cy="57" r="14" fill="#EFF6FF" stroke="#2563EB" strokeWidth="1.5"/>
      <rect x="169" y="51" width="12" height="4" rx="1" fill="#2563EB"/>
      <rect x="169" y="57" width="12" height="4" rx="1" fill="#2563EB"/>
      <rect x="169" y="63" width="12" height="4" rx="1" fill="#2563EB"/>

      {/* Node: server (right) */}
      <circle cx="253" cy="122" r="14" fill="#EFF6FF" stroke="#2563EB" strokeWidth="1.5"/>
      <rect x="247" y="115" width="12" height="14" rx="2" fill="none" stroke="#2563EB" strokeWidth="1.5"/>
      <line x1="250" y1="120" x2="262" y2="120" stroke="#2563EB" strokeWidth="1"/>
      <line x1="250" y1="124" x2="262" y2="124" stroke="#2563EB" strokeWidth="1"/>

      {/* Node: client (bottom left) */}
      <circle cx="110" cy="198" r="14" fill="#EFF6FF" stroke="#2563EB" strokeWidth="1.5"/>
      <circle cx="110" cy="193" r="4" fill="#2563EB"/>
      <path d="M102 206 Q110 200 118 206" stroke="#2563EB" strokeWidth="1.5" fill="none"/>

      {/* Dynamic labels */}
      <GlobeLabel text={gatewayLabel} cx={175} cy={30} />
      <GlobeLabel text={serverLabel} cx={268} cy={108} anchor="start" />
      <GlobeLabel text="cliente MCP" cx={110} cy={222} />
    </svg>
  )
}

function CarouselCard({ slide, ns, sid }: { slide: typeof slides[0]; ns: string; sid: string }) {
  return (
    <div className="border border-stone-200 dark:border-stone-700 rounded-xl p-4 bg-white dark:bg-stone-900 text-sm mb-4">
      <p className="font-semibold text-stone-800 dark:text-stone-100 mb-1">
        {slide.title}{" "}
        <span className="font-normal text-stone-500 dark:text-stone-400">{slide.body}</span>
      </p>
      <div className="mt-3">
        {slide.visual === "distribution"
          ? <DistributionVisual ns={ns} sid={sid} />
          : <ObservabilityVisual />}
      </div>
    </div>
  )
}

function DashedArrow() {
  return (
    <svg width="20" height="44" viewBox="0 0 20 44" fill="none" className="mx-auto">
      <line x1="10" y1="0" x2="10" y2="34" stroke="#2563EB" strokeWidth="1.5" strokeDasharray="4 3"/>
      <polyline points="5,30 10,38 15,30" fill="none" stroke="#2563EB" strokeWidth="1.5"/>
    </svg>
  )
}

function ConnectionDiagram({ ns, serverId, upstreamUrl, params }: { ns: string; serverId: string; upstreamUrl: string; params: Param[] }) {
  const base = ns && serverId ? `${ns}-${serverId}.mcp.lat` : "tu-namespace.mcp.lat"
  const serverBase = upstreamUrl || "https://tu-servidor.com/mcp"
  const queryParams = params.filter(p => p.name && p.from === "query")
  const qs = queryParams.map(p => `${p.name}=${p.defaultValue || `{${p.name}}`}`).join("&")
  const gatewayLabel = qs ? `${base}?${qs}` : base
  const serverLabel = qs ? `${serverBase}${serverBase.includes("?") ? "&" : "?"}${qs}` : serverBase
  return (
    <div className="flex flex-col items-center w-full max-w-sm gap-0">
      {/* MCP CLIENT */}
      <div className="flex items-center gap-2 mb-1">
        <span className="text-xs font-semibold tracking-widest text-stone-400 uppercase">MCP Client</span>
        <div className="flex items-center -space-x-1">
          <div className="w-7 h-7 rounded-full bg-blue-100 border-2 border-white flex items-center justify-center">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="#2563EB"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/></svg>
          </div>
          <div className="w-7 h-7 rounded-full bg-green-100 border-2 border-white flex items-center justify-center">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="#16a34a"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/></svg>
          </div>
          <div className="w-7 h-7 rounded-full bg-stone-100 border-2 border-white flex items-center justify-center">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2"><circle cx="12" cy="12" r="9"/><path d="M8 12h8M12 8v8"/></svg>
          </div>
        </div>
      </div>
      <DashedArrow />
      {/* SpainMCP Gateway */}
      <div className="w-full border-2 border-blue-400 rounded-lg p-4">
        <p className="text-xs font-semibold tracking-widest text-blue-500 uppercase mb-2">SpainMCP Gateway</p>
        <p className="font-mono text-sm text-stone-700 dark:text-stone-300 break-all">{gatewayLabel}</p>
        {params.length === 0 && <p className="text-xs text-stone-400 mt-1">Add parameters to define how clients will connect</p>}
      </div>
      <DashedArrow />
      {/* Your MCP Server */}
      <div className="w-full border border-stone-200 dark:border-stone-700 rounded-lg p-4">
        <p className="text-xs font-semibold tracking-widest text-stone-400 uppercase mb-2">Your MCP Server</p>
        <p className="font-mono text-sm text-stone-600 dark:text-stone-400 break-all">{serverLabel}</p>
      </div>
    </div>
  )
}

const inputClass =
  "w-full px-3 py-2.5 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 placeholder-stone-400 dark:placeholder-stone-600 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"

export default function PublishMcpPage() {
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [scanValues, setScanValues] = useState<Record<string, string>>({})
  const [slide, setSlide] = useState(0)
  const [state, setState] = useState<State>("idle")
  const [errorMsg, setErrorMsg] = useState("")
  const [result, setResult] = useState<{ namespace: string; gateway_url: string } | null>(null)
  const [copied, setCopied] = useState(false)

  const [ns, setNs] = useState("")
  const [serverId, setServerId] = useState("")
  const [upstreamUrl, setUpstreamUrl] = useState("")
  const [preview, setPreview] = useState(false)
  const [params, setParams] = useState<Param[]>([])
  const addParam = () => setParams(p => [...p, { name: "", type: "string", from: "query", required: false, description: "", defaultValue: "" }])
  const removeParam = (i: number) => setParams(p => p.filter((_, idx) => idx !== i))
  const updateParam = (i: number, field: keyof Param, value: string | boolean) => setParams(p => p.map((item, idx) => idx === i ? { ...item, [field]: value } : item))

  function handleStep1(e: React.FormEvent) {
    e.preventDefault()
    setStep(2)
  }

  async function handlePublish() {
    setState("loading")
    try {
      const res = await fetch("/api/servers/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          namespace: `@${ns}/${serverId}`,
          display_name: serverId,
          description: "",
          upstream_url: upstreamUrl,
        }),
      })
      const data = await res.json()
      if (!res.ok || !data.success) {
        setErrorMsg(data.error ?? "Error inesperado")
        setState("error")
        setStep(1)
        return
      }
      setResult({ namespace: data.namespace, gateway_url: data.gateway_url })
      setState("success")
    } catch {
      setErrorMsg("Error de red. Inténtalo de nuevo.")
      setState("error")
      setStep(1)
    }
  }

  function copy() {
    if (!result) return
    navigator.clipboard.writeText(result.gateway_url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (state === "success" && result) {
    return (
      <div className="max-w-lg mx-auto py-16">
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-2xl p-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/40 flex items-center justify-center">
              <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
              </svg>
            </div>
            <h1 className="text-xl font-bold text-stone-900 dark:text-stone-100">MCP publicado</h1>
          </div>
          <p className="text-sm text-stone-500 dark:text-stone-400 mb-6">
            Tu MCP está disponible en el gateway de SpainMCP.
          </p>
          <div className="space-y-3 mb-6">
            <div>
              <p className="text-xs font-medium text-stone-400 mb-1 uppercase tracking-wide">Namespace</p>
              <code className="block text-sm text-stone-800 dark:text-stone-200 bg-stone-100 dark:bg-stone-800 rounded-lg px-3 py-2">
                {result.namespace}
              </code>
            </div>
            <div>
              <p className="text-xs font-medium text-stone-400 mb-1 uppercase tracking-wide">Gateway URL</p>
              <div className="flex items-center gap-2 bg-stone-100 dark:bg-stone-800 rounded-lg px-3 py-2">
                <code className="text-xs text-stone-800 dark:text-stone-200 break-all flex-1">{result.gateway_url}</code>
                <button onClick={copy} className="shrink-0 text-xs px-2.5 py-1.5 rounded-md bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors">
                  {copied ? "✓" : "Copiar"}
                </button>
              </div>
            </div>
          </div>
          <Link href="/mcps" className="block text-center text-sm text-stone-400 hover:text-stone-700 dark:hover:text-stone-300 transition-colors">
            ← Ver directorio de MCPs
          </Link>
        </div>
      </div>
    )
  }

  const splitLayout = "grid grid-cols-1 lg:grid-cols-2 gap-0 min-h-[calc(100vh-56px)] -mt-2 -mb-8"
  const leftPanel = "flex flex-col justify-center px-8 py-12 lg:px-16 border-r border-stone-200 dark:border-stone-800"

  /* ── STEP 1 ── */
  if (step === 1) return (
    <div className={splitLayout}>
      <div className={leftPanel}>
        <h1 className="text-3xl font-bold text-stone-900 dark:text-stone-100 mb-2">Publica un servidor MCP</h1>
        <p className="text-sm text-stone-500 dark:text-stone-400 mb-8">
          Distribuye tu servicio a miles de usuarios en SpainMCP y más allá.
        </p>

        <form onSubmit={handleStep1}>
          <div className="border border-stone-200 dark:border-stone-700 rounded-xl p-6 bg-white dark:bg-stone-900 flex flex-col gap-5">

            <div>
              <p className="text-sm font-medium text-stone-700 dark:text-stone-300 mb-1.5">
                Namespace <span className="text-red-500">*</span>
                <span className="mx-2 text-stone-400">/</span>
                Server ID <span className="text-red-500">*</span>
              </p>
              <div className="flex items-stretch gap-0">
                <div className="relative flex-1">
                  <input type="text" required value={ns}
                    onChange={e => setNs(e.target.value.replace(/[^a-z0-9_-]/g, "").toLowerCase())}
                    placeholder="mi-empresa" className={inputClass + " rounded-r-none border-r-0 pr-8"}
                  />
                  {ns && <svg className="absolute right-2.5 top-1/2 -translate-y-1/2 text-green-500" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>}
                </div>
                <span className="flex items-center px-2 border-t border-b border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-400 text-sm select-none">/</span>
                <div className="relative flex-1">
                  <input type="text" required value={serverId}
                    onChange={e => setServerId(e.target.value.replace(/[^a-z0-9_-]/g, "").toLowerCase())}
                    placeholder="nombre-mcp" className={inputClass + " rounded-l-none border-l-0 pr-8"}
                  />
                  {serverId && <svg className="absolute right-2.5 top-1/2 -translate-y-1/2 text-green-500" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>}
                </div>
              </div>
              <p className="text-xs text-stone-400 dark:text-stone-500 mt-1.5">Los namespaces y slugs cortos son más fáciles de recordar.</p>
            </div>

            <div>
              <p className="text-sm font-medium text-stone-700 dark:text-stone-300 mb-1.5">
                URL del servidor MCP <span className="text-red-500">*</span>
              </p>
              <input type="url" required value={upstreamUrl}
                onChange={e => setUpstreamUrl(e.target.value)}
                placeholder="https://tu-servidor.com/mcp" className={inputClass}
              />
              <p className="text-xs text-stone-400 dark:text-stone-500 mt-1.5">
                La URL HTTP donde tu servidor MCP es accesible.{" "}
                <a href="/docs/servers/publish" target="_blank" className="underline underline-offset-2 hover:text-blue-600">Saber más</a>
              </p>
            </div>

            <div className="flex justify-end">
              <button type="submit" className="px-6 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition-colors">
                Continuar
              </button>
            </div>
          </div>
        </form>
      </div>

      <div className="hidden lg:flex flex-col justify-center items-center px-12 py-12 gap-6">
        <div className="w-full max-w-sm">
          <div className="flex items-center gap-3 mb-2">
            <button onClick={() => setSlide(s => Math.max(0, s - 1))} disabled={slide === 0}
              className="p-1 rounded-full hover:bg-stone-200 dark:hover:bg-stone-800 disabled:opacity-30 transition-colors">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
            </button>
            <button onClick={() => setSlide(s => Math.min(slides.length - 1, s + 1))} disabled={slide === slides.length - 1}
              className="p-1 rounded-full hover:bg-stone-200 dark:hover:bg-stone-800 disabled:opacity-30 transition-colors">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
            </button>
          </div>
          <CarouselCard slide={slides[slide]} ns={ns} sid={serverId} />
        </div>
        <GlobeIllustration ns={ns} serverId={serverId} upstreamUrl={upstreamUrl} />
      </div>
    </div>
  )

  /* ── STEP 2 ── */
  const initial = (ns[0] || "M").toUpperCase()
  /* ── STEP 2 ── */
  if (step === 2) return (
    <div className={splitLayout}>
      <div className={leftPanel}>
        <h1 className="text-3xl font-bold text-stone-900 dark:text-stone-100 mb-2">Configurar ajustes de conexión</h1>
        <p className="text-sm text-stone-500 dark:text-stone-400 mb-6">
          Define qué valores necesitan los usuarios para conectarse a tu servidor.{" "}
          <a href="/docs/servers/session-config" target="_blank" className="text-blue-600 hover:underline">Saber más</a>
        </p>

        {/* Preview card */}
        <div className="border border-stone-200 dark:border-stone-700 rounded-xl p-6 bg-white dark:bg-stone-900 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div className="w-10 h-10 rounded-lg bg-stone-200 dark:bg-stone-700 flex items-center justify-center text-base font-bold text-stone-600 dark:text-stone-300">
              {initial}
            </div>
            <button type="button" onClick={() => setPreview(p => !p)} className="flex items-center gap-2 text-xs text-stone-400">
              <span>Preview</span>
              <div className={`w-9 h-5 rounded-full relative transition-colors ${preview ? 'bg-blue-500' : 'bg-stone-300 dark:bg-stone-600'}`}>
                <div className={`w-4 h-4 rounded-full bg-white absolute top-0.5 transition-transform ${preview ? 'translate-x-4' : 'translate-x-0.5'}`}/>
              </div>
            </button>
          </div>
          <p className="font-bold text-stone-800 dark:text-stone-100 text-center">Connect MCP Server</p>

          {preview ? (
            /* ── PREVIEW MODE ── */
            params.length === 0 ? (
              <div className="mt-4">
                <p className="text-sm text-stone-400 text-center mb-4">No configuration required</p>
                <div className="w-full py-2.5 rounded-lg bg-blue-400 text-white text-sm font-semibold text-center">Connect →</div>
              </div>
            ) : (
              <div className="mt-2">
                <p className="text-xs text-stone-400 text-center mb-4">Configure settings to connect</p>
                {params.map((p, i) => (
                  <div key={i} className="mb-3">
                    <label className="block text-xs font-medium text-stone-700 dark:text-stone-300 mb-1">
                      {p.name || "param"}{p.required && <span className="text-red-500 ml-0.5">*</span>}
                    </label>
                    <input type="text" readOnly placeholder={p.defaultValue || `Enter ${p.name || "value"}`}
                      className="w-full px-2.5 py-1.5 text-sm border border-stone-200 dark:border-stone-700 rounded bg-stone-50 dark:bg-stone-800 text-stone-500" />
                    {p.description && <p className="text-[10px] text-stone-400 mt-0.5">{p.description}</p>}
                  </div>
                ))}
                <div className="w-full py-2.5 rounded-lg bg-blue-400 text-white text-sm font-semibold text-center mt-2">Connect →</div>
              </div>
            )
          ) : (
            /* ── EDIT MODE ── */
            <div className="mt-4 space-y-4">
              {params.map((p, i) => (
                <div key={i} className="border-b border-dashed border-stone-200 dark:border-stone-700 pb-4">
                  {/* Name + remove */}
                  <div className="flex items-center gap-2 mb-2">
                    <input type="text" value={p.name} onChange={e => updateParam(i, "name", e.target.value)}
                      placeholder="Parameter name"
                      className="flex-1 border-b border-stone-300 dark:border-stone-600 bg-transparent text-sm text-stone-800 dark:text-stone-200 py-1 focus:outline-none focus:border-blue-500 placeholder-stone-400" />
                    <button type="button" onClick={() => removeParam(i)}
                      className="w-7 h-7 rounded border border-stone-300 dark:border-stone-600 flex items-center justify-center text-stone-400 hover:text-red-500 hover:border-red-300 transition-colors">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12"/></svg>
                    </button>
                  </div>
                  {/* Type + From + Required */}
                  <div className="flex items-center gap-2 mb-2">
                    <select value={p.type} onChange={e => updateParam(i, "type", e.target.value)}
                      className="text-xs border border-stone-300 dark:border-stone-600 rounded px-2 py-1 bg-white dark:bg-stone-900 text-stone-700 dark:text-stone-300">
                      <option value="string">string</option>
                      <option value="number">number</option>
                      <option value="boolean">boolean</option>
                    </select>
                    <select value={p.from} onChange={e => updateParam(i, "from", e.target.value)}
                      className="text-xs border border-stone-300 dark:border-stone-600 rounded px-2 py-1 bg-white dark:bg-stone-900 text-stone-700 dark:text-stone-300">
                      <option value="query">query</option>
                      <option value="header">header</option>
                    </select>
                    <button type="button" onClick={() => updateParam(i, "required", !p.required)} className="flex items-center gap-1.5 text-xs text-stone-500">
                      <div className={`w-8 h-4.5 rounded-full relative transition-colors ${p.required ? 'bg-blue-500' : 'bg-stone-300 dark:bg-stone-600'}`}>
                        <div className={`w-3.5 h-3.5 rounded-full bg-white absolute top-0.5 transition-transform ${p.required ? 'translate-x-4' : 'translate-x-0.5'}`}/>
                      </div>
                      <span>Required</span>
                    </button>
                  </div>
                  {/* Description */}
                  <textarea value={p.description} onChange={e => updateParam(i, "description", e.target.value)}
                    placeholder="Description" rows={2}
                    className="w-full text-xs border border-dashed border-stone-300 dark:border-stone-600 rounded p-2 bg-transparent text-stone-700 dark:text-stone-300 placeholder-stone-400 focus:outline-none focus:border-blue-500 resize-none mb-2" />
                  {/* Default */}
                  <input type="text" value={p.defaultValue} onChange={e => updateParam(i, "defaultValue", e.target.value)}
                    placeholder="Default value (optional)"
                    className="w-full text-xs border border-dashed border-stone-300 dark:border-stone-600 rounded px-2 py-1.5 bg-transparent text-stone-700 dark:text-stone-300 placeholder-stone-400 focus:outline-none focus:border-blue-500" />
                </div>
              ))}
              <button type="button" onClick={addParam}
                className="w-full flex items-center justify-center gap-2 border border-dashed border-stone-300 dark:border-stone-600 rounded-lg py-2.5 text-sm text-stone-400 hover:text-stone-600 dark:hover:text-stone-300 hover:border-stone-400 transition-colors">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                Add Parameter
              </button>
            </div>
          )}
        </div>

        {state === "error" && <p className="text-sm text-red-500 mb-4">{errorMsg}</p>}

        <div className="flex items-center gap-3">
          <button onClick={() => setStep(1)}
            className="px-5 py-2.5 rounded-lg border border-stone-300 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800 text-sm font-medium transition-colors">
            Back
          </button>
          <button onClick={() => { setScanValues(Object.fromEntries(params.map(p => [p.name, p.defaultValue]))); setStep(3) }}
            className="px-6 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition-colors">
            Continue
          </button>
        </div>
      </div>

      <div className="hidden lg:flex flex-col justify-center items-center px-12 py-12">
        <ConnectionDiagram ns={ns} serverId={serverId} upstreamUrl={upstreamUrl} params={params} />
      </div>
    </div>
  )

  /* ── STEP 3: Provide scan credentials ── */
  const queryParamsScan = params.filter(p => p.name && p.from === "query")
  const qsScan = queryParamsScan.map(p => `${p.name}=${scanValues[p.name] || `{${p.name}}`}`).join("&")
  const gatewayUrl3 = (ns && serverId ? `${ns}-${serverId}.mcp.lat` : "tu-namespace.mcp.lat") + (qsScan ? `?${qsScan}` : "")
  const serverUrl3 = (upstreamUrl || "https://tu-servidor.com/mcp") + (qsScan ? `${(upstreamUrl || "").includes("?") ? "&" : "?"}${qsScan}` : "")

  return (
    <div className={splitLayout}>
      <div className={leftPanel}>
        <h1 className="text-3xl font-bold text-stone-900 dark:text-stone-100 mb-2">Provide scan credentials</h1>
        <p className="text-sm text-stone-500 dark:text-stone-400 mb-8">
          Enter values for us to scan your server for capabilities. These are private to your developer account.
        </p>

        {/* Scan form card */}
        <div className="border border-stone-200 dark:border-stone-700 rounded-xl p-6 bg-white dark:bg-stone-900 mb-6">
          <div className="flex justify-center mb-4">
            <div className="w-10 h-10 rounded-lg bg-stone-200 dark:bg-stone-700 flex items-center justify-center text-base font-bold text-stone-600 dark:text-stone-300">
              {initial}
            </div>
          </div>
          <p className="font-bold text-stone-800 dark:text-stone-100 text-center">Connect MCP Server</p>
          {params.length > 0 && <p className="text-xs text-stone-400 text-center mt-1 mb-4">Configure settings to connect</p>}

          {params.length === 0 ? (
            <p className="text-sm text-stone-400 text-center my-4">No configuration required</p>
          ) : (
            <div className="mt-4 space-y-3">
              {params.map((p, i) => (
                <div key={i}>
                  <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">
                    {p.name || "param"}{p.required && <span className="text-red-500 ml-0.5">*</span>}
                  </label>
                  {p.description && <p className="text-xs text-stone-400 mb-1">{p.description}</p>}
                  <input type="text" value={scanValues[p.name] || ""} onChange={e => setScanValues(v => ({ ...v, [p.name]: e.target.value }))}
                    placeholder={`Enter ${p.name || "value"}`}
                    className="w-full px-2.5 py-2 text-sm border border-stone-200 dark:border-stone-700 rounded-lg bg-stone-50 dark:bg-stone-800 text-stone-800 dark:text-stone-200 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              ))}
            </div>
          )}

          <button onClick={handlePublish} disabled={state === "loading"}
            className="w-full mt-4 py-2.5 rounded-lg bg-blue-400 hover:bg-blue-500 disabled:opacity-60 text-white font-semibold text-sm transition-colors">
            {state === "loading" ? "Scanning..." : "Connect →"}
          </button>
          <button onClick={() => setStep(2)}
            className="w-full mt-2 py-2.5 rounded-lg border border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400 text-sm font-medium hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors">
            Back
          </button>
          <p className="text-xs text-stone-300 dark:text-stone-600 text-center mt-3">Powered by SpainMCP</p>
        </div>

        {state === "error" && <p className="text-sm text-red-500">{errorMsg}</p>}
      </div>

      <div className="hidden lg:flex flex-col justify-center items-center px-12 py-12">
        <div className="flex flex-col items-center w-full max-w-sm gap-0">
          {/* MCP CLIENT */}
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold tracking-widest text-stone-400 uppercase">MCP Client</span>
            <div className="flex items-center -space-x-1">
              <div className="w-7 h-7 rounded-full bg-blue-100 border-2 border-white flex items-center justify-center">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="#2563EB"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/></svg>
              </div>
              <div className="w-7 h-7 rounded-full bg-green-100 border-2 border-white flex items-center justify-center">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="#16a34a"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/></svg>
              </div>
              <div className="w-7 h-7 rounded-full bg-stone-100 border-2 border-white flex items-center justify-center">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2"><circle cx="12" cy="12" r="9"/><path d="M8 12h8M12 8v8"/></svg>
              </div>
            </div>
          </div>
          <DashedArrow />
          {/* SpainMCP Gateway */}
          <div className="w-full border-2 border-blue-400 rounded-lg p-4 mb-0">
            <p className="text-xs font-semibold tracking-widest text-blue-500 uppercase mb-2">SpainMCP Gateway</p>
            <p className="font-mono text-sm text-stone-700 dark:text-stone-300 break-all">{gatewayUrl3}</p>
          </div>
          <DashedArrow />
          {/* Your MCP Server */}
          <div className="w-full border border-stone-200 dark:border-stone-700 rounded-lg p-4">
            <p className="text-xs font-semibold tracking-widest text-stone-400 uppercase mb-2">Your MCP Server</p>
            <p className="font-mono text-sm text-stone-600 dark:text-stone-400 break-all mb-3">{serverUrl3}</p>
            <div className="border-l-2 border-stone-200 dark:border-stone-700 pl-3">
              <p className="text-xs font-medium text-stone-400 mb-1">Body</p>
              <pre className="text-xs text-stone-500 dark:text-stone-400 font-mono leading-relaxed">{`{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/list",
  "params": {}
}`}</pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
