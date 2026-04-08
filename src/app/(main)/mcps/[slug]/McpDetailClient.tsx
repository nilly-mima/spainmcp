'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import type { Mcp } from '@/lib/mcps'
import { CATEGORIA_LABELS } from '@/lib/mcps-constants'

/* ── Icons ── */
const VerifiedIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-blue-500 shrink-0">
    <circle cx="12" cy="12" r="10" fill="currentColor" opacity="0.2"/>
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5"/>
    <polyline points="8 12 11 15 16 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)
const GlobeIcon   = ({ size = 12 }: { size?: number }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
const ToolIcon    = ({ size = 13 }: { size?: number }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>
const LinkIcon    = ({ size = 14 }: { size?: number }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
const InfoIcon    = ({ size = 14 }: { size?: number }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
const ChevronIcon = ({ open }: { open: boolean }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
    className={`transition-transform duration-200 ${open ? 'rotate-180' : ''}`}>
    <polyline points="6 9 12 15 18 9"/>
  </svg>
)
const CopyIcon    = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
const CliIcon     = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/></svg>
const PerfIcon    = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>
const UsageIcon   = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/></svg>
const PersonIcon  = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
const SearchIcon        = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
const VerifiedBadgeIcon = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="9 12 11 15 16 9"/></svg>
const MsgIcon           = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
const CalendarIcon      = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>

/* ── Sparkline ── */
function Sparkline({ data }: { data: number[] }) {
  const max = Math.max(...data), min = Math.min(...data)
  const range = max - min || 1
  const W = 220, H = 48
  const pts = data.map((v, i) => ({ x: (i / (data.length - 1)) * W, y: H - ((v - min) / range) * (H - 4) - 2 }))
  const line = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')
  const area = `${line} L${W},${H} L0,${H} Z`
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: H }}>
      <defs>
        <linearGradient id="sg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.25"/>
          <stop offset="100%" stopColor="#3B82F6" stopOpacity="0"/>
        </linearGradient>
      </defs>
      <path d={area} fill="url(#sg)" />
      <path d={line} fill="none" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

/* ── Client data ── */
type ClientInfo = { label: string; color: string; install: string }
const MCP_REMOTE = `npx -y mcp-remote https://mcp.lat/api/mcp --header "Authorization: Bearer TU_API_KEY"`
const ALL_CLIENTS: Record<string, ClientInfo> = {
  'api':             { label: 'API',              color: '#6B7280', install: `URL: https://mcp.lat/api/mcp\nHeader: Authorization: Bearer TU_API_KEY` },
  'claude-code':     { label: 'Claude Code',      color: '#7C3AED', install: `claude mcp add spainmcp -- npx -y mcp-remote https://mcp.lat/api/mcp --header "Authorization: Bearer TU_API_KEY"` },
  'codex':           { label: 'Codex',            color: '#10A37F', install: MCP_REMOTE },
  'openclaw':        { label: 'OpenClaw',         color: '#DC2626', install: MCP_REMOTE },
  'cursor':          { label: 'Cursor',           color: '#1A1A1A', install: MCP_REMOTE },
  'poke':            { label: 'Poke',             color: '#16A34A', install: MCP_REMOTE },
  'claude':          { label: 'Claude',           color: '#2563EB', install: MCP_REMOTE },
  'chatgpt':         { label: 'ChatGPT',          color: '#10A37F', install: MCP_REMOTE },
  'librechat':       { label: 'LibreChat',        color: '#7C3AED', install: MCP_REMOTE },
  'gemini-cli':      { label: 'Gemini CLI',       color: '#1A73E8', install: MCP_REMOTE },
  'vscode':          { label: 'VS Code',          color: '#0078D4', install: `code --add-mcp '{"name":"spainmcp","command":"npx","args":["-y","mcp-remote","https://mcp.lat/api/mcp","--header","Authorization: Bearer TU_API_KEY"]}'` },
  'cline':           { label: 'Cline',            color: '#1C1C1C', install: MCP_REMOTE },
  'windsurf':        { label: 'Windsurf',         color: '#0369A1', install: MCP_REMOTE },
  'vscode-insiders': { label: 'VS Code Insiders', color: '#1C9E5B', install: `code-insiders --add-mcp '{"name":"spainmcp","command":"npx","args":["-y","mcp-remote","https://mcp.lat/api/mcp","--header","Authorization: Bearer TU_API_KEY"]}'` },
  'qordinate':       { label: 'Qordinate',        color: '#0D9488', install: MCP_REMOTE },
  'goose':           { label: 'Goose',            color: '#4B5563', install: MCP_REMOTE },
  'deepgram-saga':   { label: 'Deepgram Saga',    color: '#1E1E1E', install: MCP_REMOTE },
  'highlight':       { label: 'Highlight',        color: '#2563EB', install: MCP_REMOTE },
  'raycast':         { label: 'Raycast',          color: '#FF6363', install: MCP_REMOTE },
  'roo-code':        { label: 'Roo Code',         color: '#1D4ED8', install: MCP_REMOTE },
  'augment':         { label: 'Augment',          color: '#2563EB', install: MCP_REMOTE },
  'boltai':          { label: 'BoltAI',           color: '#D97706', install: MCP_REMOTE },
  'witsy':           { label: 'Witsy',            color: '#DB2777', install: MCP_REMOTE },
  'enconvo':         { label: 'Enconvo',          color: '#0891B2', install: MCP_REMOTE },
  'amazon-bedrock':  { label: 'Amazon Bedrock',   color: '#FF9900', install: MCP_REMOTE },
  'amazon-q':        { label: 'Amazon Q',         color: '#232F3E', install: MCP_REMOTE },
  'claude-desktop':  { label: 'Claude Desktop',   color: '#2563EB', install: MCP_REMOTE },
}

/* ── Big icon ── */
function McpBigIcon({ nombre, id }: { nombre: string; id: string }) {
  const initials = nombre.split(/[\s\-_—]/).map(w => w[0]).join('').slice(0, 2).toUpperCase()
  const palettes = [
    { bg: 'linear-gradient(135deg,#FF6B35,#F7C59F)', text: '#fff' },
    { bg: 'linear-gradient(135deg,#667EEA,#764BA2)', text: '#fff' },
    { bg: 'linear-gradient(135deg,#11998E,#38EF7D)', text: '#fff' },
    { bg: 'linear-gradient(135deg,#FC5C7D,#6A3093)', text: '#fff' },
    { bg: 'linear-gradient(135deg,#F7971E,#FFD200)', text: '#fff' },
    { bg: 'linear-gradient(135deg,#4776E6,#8E54E9)', text: '#fff' },
    { bg: 'linear-gradient(135deg,#00B09B,#96C93D)', text: '#fff' },
  ]
  const p = palettes[id.charCodeAt(0) % palettes.length]
  return (
    <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-bold shrink-0 shadow-md"
      style={{ background: p.bg, color: p.text }}>
      {initials}
    </div>
  )
}

/* ── Separator with text ── */
function SectionSep({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 my-1">
      <div className="flex-1 h-px bg-stone-200 dark:bg-stone-700" />
      <span className="text-xs text-stone-400 whitespace-nowrap">{label}</span>
      <div className="flex-1 h-px bg-stone-200 dark:bg-stone-700" />
    </div>
  )
}

/* ── Tool accordion item ── */
type ToolParam = { name: string; type: string; required?: boolean; description?: string }
function ToolItem({ name, description, parameters }: { name: string; description: string; parameters?: ToolParam[] }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="rounded-lg overflow-hidden" style={{ border: '1px solid var(--border)' }}>
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-stone-50 dark:hover:bg-stone-800/50 transition-colors"
      >
        <span className={`font-mono text-xs font-semibold tracking-wide uppercase ${open ? 'text-blue-600' : 'text-stone-700 dark:text-stone-300'}`}>
          {name}
        </span>
        <ChevronIcon open={open} />
      </button>
      {open && (
        <div className="px-4 py-4 border-t border-stone-100 dark:border-stone-800 flex flex-col gap-4">
          <p className="text-sm text-stone-500 dark:text-stone-400">{description}</p>
          {parameters && parameters.length > 0 && (
            <div className="flex flex-col gap-1">
              <p className="text-xs font-medium text-stone-400 mb-2">Parámetros</p>
              {parameters.map(p => (
                <div key={p.name} className="flex flex-col gap-1 py-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold text-stone-800 dark:text-stone-200">{p.name}</span>
                    {p.required && <span className="text-blue-500 text-xs font-bold">*</span>}
                    <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-blue-600 font-mono dark:bg-blue-950/30 dark:border-blue-800 dark:text-blue-400">
                      {p.type}
                    </span>
                  </div>
                  {p.description && <p className="text-xs text-stone-400 dark:text-stone-500">{p.description}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

/* ── Code block ── */
function CodeBlock({ code, lang = 'bash' }: { code: string; lang?: string }) {
  const [copied, setCopied] = useState(false)
  const copy = () => { navigator.clipboard.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 1500) }
  return (
    <div className="rounded-xl overflow-hidden border border-stone-800">
      <div className="flex items-center justify-between px-4 py-2 bg-stone-800 border-b border-stone-700">
        <span className="text-xs text-stone-400">{lang}</span>
        <button onClick={copy} className="flex items-center gap-1.5 text-xs text-stone-400 hover:text-stone-200 transition-colors">
          <CopyIcon /> {copied ? 'Copiado ✓' : 'Copiar'}
        </button>
      </div>
      <div className="bg-stone-900 p-4 overflow-x-auto">
        <pre className="text-sm leading-relaxed">
          <code className="text-green-400 font-mono whitespace-pre-wrap break-all">{code}</code>
        </pre>
      </div>
    </div>
  )
}

/* ── URL copiable ── */
function UrlBox({ url }: { url: string }) {
  const [copied, setCopied] = useState(false)
  const copy = () => { navigator.clipboard.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 1500) }
  return (
    <button
      onClick={copy}
      className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-left transition-colors bg-white hover:bg-stone-50 dark:bg-stone-900 dark:hover:bg-stone-800"
      style={{ border: '1px solid var(--border)' }}
    >
      <GlobeIcon size={13} />
      <span className="flex-1 text-sm text-stone-600 dark:text-stone-400 font-mono truncate">{url}</span>
      <span className="text-stone-400 shrink-0">{copied ? <span className="text-green-500 text-xs">✓</span> : <CopyIcon />}</span>
    </button>
  )
}

/* ── Client search list ── */
function ClientList() {
  const [q, setQ] = useState('')
  const [selected, setSelected] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const entries = Object.entries(ALL_CLIENTS)
  const filtered = entries.filter(([, info]) => info.label.toLowerCase().includes(q.toLowerCase()))

  if (selected) {
    const info = ALL_CLIENTS[selected]!
    const copy = () => { navigator.clipboard.writeText(info.install); setCopied(true); setTimeout(() => setCopied(false), 1500) }
    return (
      <div className="flex flex-col gap-4 rounded-xl bg-white dark:bg-stone-900 p-4" style={{ border: '1px solid var(--border)' }}>
        <button onClick={() => { setSelected(null); setCopied(false) }}
          className="flex items-center gap-1 text-sm text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 transition-colors w-fit">
          ← Volver
        </button>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold shrink-0"
            style={{ background: info.color }}>
            {info.label[0]}
          </div>
          <span className="text-base font-semibold text-stone-800 dark:text-stone-200">{info.label}</span>
        </div>
        <p className="text-sm text-stone-500 dark:text-stone-400">Instala este servidor con el siguiente comando:</p>
        <div className="rounded-lg flex items-start gap-2 px-3 py-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40">
          <code className="font-mono text-xs text-stone-700 dark:text-stone-300 flex-1 leading-relaxed break-all">{info.install}</code>
          <button onClick={copy} className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-300 shrink-0 mt-0.5 transition-colors">
            {copied ? <span className="text-green-500 text-xs">✓</span> : <CopyIcon />}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg mb-1 bg-stone-50 dark:bg-stone-800" style={{ border: '1px solid var(--border)' }}>
        <SearchIcon />
        <input value={q} onChange={e => setQ(e.target.value)} placeholder="Buscar clientes"
          className="flex-1 text-sm bg-transparent outline-none text-stone-700 dark:text-stone-300 placeholder:text-stone-400" />
      </div>
      <div className="flex flex-col rounded-xl bg-white dark:bg-stone-900 px-3 max-h-72 overflow-y-auto" style={{ border: '1px solid var(--border)' }}>
        {filtered.map(([id, info]) => (
          <button key={id} onClick={() => setSelected(id)}
            className="flex items-center gap-3 py-2.5 px-1 hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors text-left w-full border-b border-stone-100 dark:border-stone-800 last:border-0">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold shrink-0"
              style={{ background: info.color }}>
              {info.label[0]}
            </div>
            <span className="text-sm text-stone-700 dark:text-stone-300">{info.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

/* ── Agent connection prompt card ── */
function AgentPromptCard({ nombre, instalacion_npx }: { nombre: string; instalacion_npx: string }) {
  const promptText = `Conecta ${nombre} en mi asistente usando: ${instalacion_npx}`
  const [copied, setCopied] = useState(false)
  const copy = () => { navigator.clipboard.writeText(promptText); setCopied(true); setTimeout(() => setCopied(false), 1500) }
  return (
    <div className="rounded-xl flex flex-col bg-white dark:bg-stone-900 overflow-hidden" style={{ border: '1px solid var(--border)' }}>
      {/* Header */}
      <div className="flex items-start justify-between gap-3 px-4 pt-4 pb-2">
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-2">
            <MsgIcon />
            <span className="text-base font-semibold text-stone-800 dark:text-stone-200">Connection Prompt</span>
          </div>
          <span className="text-xs text-stone-400 pl-[22px]">Envía este prompt a tu agente</span>
        </div>
        <button onClick={copy}
          className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors shrink-0 mt-0.5">
          <CopyIcon />{copied ? 'Copiado' : 'Copy'}
        </button>
      </div>
      {/* Quote box */}
      <div className="mx-4 mb-4 mt-2 rounded-lg bg-white dark:bg-stone-800/40 px-4 py-3 text-sm text-stone-600 dark:text-stone-400 leading-relaxed" style={{ border: '1px solid var(--border)' }}>
        &#8220;Conecta a{' '}
        <strong className="font-semibold text-stone-800 dark:text-stone-200">{nombre}</strong>
        {' '}usando{' '}
        <code className="font-mono text-xs bg-stone-200 dark:bg-stone-700 text-stone-700 dark:text-stone-300 px-1.5 py-0.5 rounded">{instalacion_npx}</code>
        &#8221;
      </div>
    </div>
  )
}

/* ── Syntax-highlighted amber code block ── */
function SyntaxBlock({ code }: { code: string }) {
  const [copied, setCopied] = useState(false)
  const copy = () => { navigator.clipboard.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 1500) }
  const lines = code.split('\n')
  return (
    <div className="relative rounded-xl overflow-hidden bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40">
      <button onClick={copy}
        className="absolute top-3 right-3 flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg border border-amber-200 dark:border-amber-800/40 bg-white/80 dark:bg-stone-900/80 text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 transition-colors z-10">
        <CopyIcon /> {copied ? 'Copiado' : 'Copy'}
      </button>
      <pre className="p-4 pr-24 overflow-x-auto text-xs font-mono leading-relaxed">
        {lines.map((line, i) => {
          const trimmed = line.trimStart()
          if (trimmed.startsWith('#') || trimmed.startsWith('//')) {
            return <div key={i}><span style={{ color: '#9CA3AF' }}>{line || ' '}</span></div>
          }
          if (!line.trim()) return <div key={i}>&nbsp;</div>
          const re = /("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|\b(import|from|export|const|let|var|await|async|new|return|if|else|true|false|null)\b)/g
          const parts: React.ReactNode[] = []
          let last = 0, k = 0, m: RegExpExecArray | null
          while ((m = re.exec(line)) !== null) {
            if (m.index > last) parts.push(<span key={k++} style={{ color: '#92400E' }}>{line.slice(last, m.index)}</span>)
            const isStr = m[0][0] === '"' || m[0][0] === "'"
            parts.push(<span key={k++} style={{ color: isStr ? '#1D4ED8' : '#D97706' }}>{m[0]}</span>)
            last = m.index + m[0].length
          }
          if (last < line.length) parts.push(<span key={k++} style={{ color: '#92400E' }}>{line.slice(last)}</span>)
          return <div key={i}>{parts.length ? parts : <span style={{ color: '#92400E' }}>{line}</span>}</div>
        })}
      </pre>
    </div>
  )
}

/* ── Latency line chart ── */
function LatencyChart({ data }: { data: number[] }) {
  const max = Math.max(...data) * 1.08
  const W = 500, H = 200, PAD_R = 44, PAD_B = 28, PAD_T = 16, PAD_L = 6
  const iW = W - PAD_L - PAD_R, iH = H - PAD_B - PAD_T
  const toX = (i: number) => PAD_L + (i / (data.length - 1)) * iW
  const toY = (v: number) => PAD_T + iH - (v / max) * iH
  const pts = data.map((v, i) => ({ x: toX(i), y: toY(v) }))
  // Smooth bezier path
  const smooth = pts.reduce((d, p, i) => {
    if (i === 0) return `M${p.x.toFixed(1)},${p.y.toFixed(1)}`
    const prev = pts[i - 1]
    const cx = ((prev.x + p.x) / 2).toFixed(1)
    return d + ` C${cx},${prev.y.toFixed(1)} ${cx},${p.y.toFixed(1)} ${p.x.toFixed(1)},${p.y.toFixed(1)}`
  }, '')
  const fmtMs = (v: number) => v >= 1000 ? `${(v / 1000).toFixed(1)}s` : v === 0 ? '0ms' : `${Math.round(v / 50) * 50}ms`
  const gridVals = [0, max * 0.25, max * 0.5, max * 0.75, max]
  const xIdx = [0, 4, 9, 14, 19, 24, 27, 29]
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full" preserveAspectRatio="xMidYMid meet">
      {gridVals.map((v, i) => (
        <g key={i}>
          <line x1={PAD_L} y1={toY(v)} x2={W - PAD_R} y2={toY(v)} stroke="#D6D0C8" strokeWidth="1" strokeDasharray="4,4"/>
          <text x={W - PAD_R + 5} y={toY(v) + 4} fontSize="10" fill="#A8A29E">{fmtMs(v)}</text>
        </g>
      ))}
      {xIdx.map(i => {
        const d = new Date(); d.setDate(d.getDate() - (29 - i))
        return <text key={i} x={toX(i)} y={H - 6} textAnchor="middle" fontSize="10" fill="#A8A29E">{d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}</text>
      })}
      <path d={smooth} fill="none" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

/* ── Performance tab ── */
function PerformanceTab({ mcp }: { mcp: Mcp }) {
  const tools = mcp.tools_list ?? []
  const seed = mcp.id.charCodeAt(0)
  const toolStats = tools.map((tool, i) => {
    const calls = Math.max(10, 420 - i * 85 + (tool.name.charCodeAt(0) % 40))
    const latencyMs = 180 + (tool.name.charCodeAt(0) % 600) + seed % 200
    const uptime = i === 0 ? 100 : i % 4 === 0 ? 98.5 : 100
    return { name: tool.name, calls, latencyMs, uptime }
  })
  const total = { calls: toolStats.reduce((s, t) => s + t.calls, 0), latencyMs: toolStats.length ? toolStats.reduce((s, t) => s + t.latencyMs, 0) / toolStats.length : 300, uptime: toolStats.length ? toolStats.reduce((s, t) => s + t.uptime, 0) / toolStats.length : 100 }
  const fmtL = (ms: number) => ms >= 1000 ? `${(ms / 1000).toFixed(1)}s` : `${Math.round(ms)}ms`
  const fmtN = (n: string) => n.length > 20 ? n.slice(0, 17) + '...' : n
  const uptimeBars = Array.from({ length: 30 }, (_, i) => i < 4 ? 'grey' : i % 11 === 7 ? 'grey' : 'blue')
  const base = total.latencyMs
  const latencyData = [30,base*0.9,base*1.1,base*1.0,base*0.95,base*0.85,base*0.9,base*0.88,base*0.92,base*0.9,base*0.87,base*0.9,base*0.88,base*0.91,base*0.89,base*0.9,base*1.1,base*1.4,base*1.0,base*2.2,base*0.2,base*0.15,base*2.8,base*0.1,base*0.1,base*1.6,base*1.4,base*1.1,base*2.2,base*1.3]

  return (
    <div className="flex flex-col gap-6">
      <h2 className="flex items-center gap-2 text-lg font-bold text-stone-800 dark:text-stone-200">
        <PerfIcon /> Rendimiento
      </h2>
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,380px)_1fr] gap-4">

        {/* Tool table */}
        <div className="rounded-xl overflow-hidden bg-white dark:bg-stone-900" style={{ border: '1px solid var(--border)' }}>
          <table className="w-full text-xs">
            <thead><tr className="border-b border-stone-100 dark:border-stone-800 text-stone-400">
              <th className="text-left px-4 py-3 font-medium">Tool</th>
              <th className="text-right px-3 py-3 font-medium">Calls</th>
              <th className="text-right px-3 py-3 font-medium">Latency</th>
              <th className="text-right px-4 py-3 font-medium">Uptime</th>
            </tr></thead>
            <tbody>
              {toolStats.map((t, i) => (
                <tr key={t.name} className={`border-b border-stone-50 dark:border-stone-800/30 ${i === 0 ? 'bg-blue-50/70 dark:bg-blue-950/20' : ''}`}>
                  <td className="px-4 py-2.5 font-mono text-stone-700 dark:text-stone-300">{fmtN(t.name)}</td>
                  <td className="px-3 py-2.5 text-right text-stone-600 dark:text-stone-400 tabular-nums">{t.calls.toLocaleString()}</td>
                  <td className="px-3 py-2.5 text-right text-stone-600 dark:text-stone-400">{fmtL(t.latencyMs)}</td>
                  <td className="px-4 py-2.5 text-right text-stone-600 dark:text-stone-400">{t.uptime.toFixed(1)}%</td>
                </tr>
              ))}
            </tbody>
            <tfoot><tr className="border-t border-stone-200 dark:border-stone-700">
              <td className="px-4 py-2.5" />
              <td className="px-3 py-2.5 text-right font-semibold text-stone-700 dark:text-stone-300 tabular-nums">{total.calls.toLocaleString()}</td>
              <td className="px-3 py-2.5 text-right font-semibold text-stone-700 dark:text-stone-300">{fmtL(total.latencyMs)}</td>
              <td className="px-4 py-2.5 text-right font-semibold text-stone-700 dark:text-stone-300">{total.uptime.toFixed(1)}%</td>
            </tr></tfoot>
          </table>
        </div>

        {/* Right charts */}
        <div className="flex flex-col gap-4 h-full">
          <div className="rounded-xl p-4 bg-white dark:bg-stone-900 flex flex-col gap-3" style={{ border: '1px solid var(--border)' }}>
            <div className="flex items-center gap-2 text-xs text-stone-500">
              <span>Uptime (30d)</span>
              <span className="font-semibold text-stone-700 dark:text-stone-300">{total.uptime.toFixed(1)}%</span>
            </div>
            <div className="flex gap-0.5">
              {uptimeBars.map((c, i) => (
                <div key={i} className={`flex-1 h-8 rounded-sm ${c === 'blue' ? 'bg-blue-400' : 'bg-stone-200 dark:bg-stone-700'}`} />
              ))}
            </div>
          </div>
          <div className="rounded-xl p-4 bg-white dark:bg-stone-900 flex flex-col flex-1 min-h-0" style={{ border: '1px solid var(--border)' }}>
            <div className="flex items-center gap-2 text-xs text-stone-500 mb-3">
              <span>Latency (30d)</span>
              <span className="font-semibold text-stone-700 dark:text-stone-300">{fmtL(total.latencyMs)}</span>
            </div>
            <div className="flex-1 min-h-0">
              <LatencyChart data={latencyData} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── Usage tab ── */
function UsageTab({ mcp }: { mcp: Mcp }) {
  const topClients = [
    { label: 'SpainMCP',    color: '#3B82F6', count: 14537 },
    { label: 'Claude Code', color: '#7C3AED', count: 7907 },
    { label: 'Claude.ai',   color: '#3B82F6', count: 4264 },
    { label: 'Codex',       color: '#10B981', count: 883 },
    { label: 'Cursor',      color: '#3B82F6', count: 511 },
  ]
  const maxCount = topClients[0].count
  const total = topClients.reduce((s, c) => s + c.count, 0)

  // 31 días Mar 7 → Apr 6
  const sessionData = [45,380,340,350,340,280,480,760,1220,1060,900,1280,1320,1420,1310,2000,1450,1420,1380,780,1100,1200,1380,1250,1400,730,740,1460,1320,1370,700]
  const n = sessionData.length
  const maxSes = 2000
  const W = 500, H = 200, PT = 12, PB = 36, PL = 6, PR = 50
  const iW = W - PL - PR, iH = H - PT - PB
  const bW = (iW / n) * 0.72
  const toX = (i: number) => PL + (i + 0.5) * (iW / n)
  const toY = (v: number) => PT + iH - (v / maxSes) * iH
  const gridVals = [0, 500, 1000, 1500, 2000]
  // labels cada 3 días
  const xLabels: { i: number; label: string }[] = []
  const startDate = new Date('2026-03-07')
  for (let i = 0; i < n; i += 3) {
    const d = new Date(startDate); d.setDate(d.getDate() + i)
    xLabels.push({ i, label: d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }) })
  }

  return (
    <div className="flex flex-col gap-6">
      <h2 className="flex items-center gap-2 text-lg font-bold text-stone-800 dark:text-stone-200">
        <UsageIcon /> Uso
      </h2>
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,300px)_1fr] gap-4">

        {/* Top Clients */}
        <div className="rounded-xl bg-white dark:bg-stone-900 p-5 flex flex-col gap-4 h-full" style={{ border: '1px solid var(--border)' }}>
          <h3 className="text-sm font-medium text-stone-500">Top Clients</h3>
          <div className="flex flex-col gap-3.5">
            {topClients.map((c, i) => (
              <div key={c.label} className="flex items-center gap-2.5">
                <span className="text-xs text-stone-400 w-3 text-right shrink-0">{i + 1}</span>
                <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0"
                  style={{ background: c.color }}>
                  {c.label[0]}
                </div>
                <div className="flex-1 flex flex-col gap-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-medium text-stone-700 dark:text-stone-300 truncate">{c.label}</span>
                    <span className="text-xs text-stone-500 tabular-nums shrink-0">{c.count.toLocaleString('de-DE')}</span>
                  </div>
                  <div className="h-1 bg-stone-100 dark:bg-stone-800 rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-blue-500" style={{ width: `${(c.count / maxCount) * 100}%` }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="border-t border-stone-100 dark:border-stone-800 pt-3 flex justify-between">
            <span className="text-sm text-stone-500">Total</span>
            <span className="text-sm font-bold text-stone-800 dark:text-stone-200">{total.toLocaleString('de-DE')}</span>
          </div>
        </div>

        {/* Daily Sessions bar chart */}
        <div className="rounded-xl bg-white dark:bg-stone-900 p-5 flex flex-col h-full" style={{ border: '1px solid var(--border)' }}>
          <h3 className="text-sm font-medium text-stone-500 mb-3">Daily Sessions</h3>
          <div className="flex-1 min-h-0">
          <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full" preserveAspectRatio="xMidYMid meet">
            {/* Gridlines + Y labels */}
            {gridVals.map(v => (
              <g key={v}>
                <line x1={PL} y1={toY(v)} x2={W - PR} y2={toY(v)} stroke="#E5E7EB" strokeWidth="1" strokeDasharray="4,4"/>
                <text x={W - PR + 6} y={toY(v) + 4} fontSize="10" fill="#A8A29E">{v}</text>
              </g>
            ))}
            {/* Bars */}
            {sessionData.map((v, i) => (
              <rect key={i}
                x={toX(i) - bW / 2} y={toY(v)}
                width={bW} height={toY(0) - toY(v)}
                fill="#3B82F6" rx="2"
              />
            ))}
            {/* X labels */}
            {xLabels.map(({ i, label }) => (
              <text key={i} x={toX(i)} y={H - 6} textAnchor="middle" fontSize="9.5" fill="#A8A29E">{label}</text>
            ))}
          </svg>
          </div>
        </div>
      </div>
    </div>
  )
}

type Tab = 'overview' | 'api' | 'performance' | 'uso'
const TABS: { id: Tab; label: string; icon: React.ReactNode; soon?: boolean }[] = [
  { id: 'overview',    label: 'Visión General', icon: <InfoIcon size={13} /> },
  { id: 'performance', label: 'Rendimiento',    icon: <PerfIcon /> },
  { id: 'uso',         label: 'Uso',            icon: <UsageIcon /> },
  { id: 'api',         label: 'API',            icon: <CliIcon /> },
]

/* ── Main ── */
export default function McpDetailClient({ mcp }: { mcp: Mcp }) {
  const [tab, setTab]       = useState<Tab>('overview')
  const [apiTab, setApiTab] = useState<'cli' | 'aisdk' | 'ts'>('cli')
  const [connectTab, setConnectTab] = useState<'agents' | 'humans'>('humans')
  const [capTab, setCapTab] = useState<'tools'>('tools')
  const perfRef = useRef<HTMLDivElement>(null)
  const usoRef  = useRef<HTMLDivElement>(null)
  const apiRef  = useRef<HTMLDivElement>(null)

  const handleTabClick = (t: Tab) => {
    if (t === 'performance') {
      setTab('overview')
      setTimeout(() => perfRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50)
    } else if (t === 'uso') {
      setTab('overview')
      setTimeout(() => usoRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50)
    } else if (t === 'api') {
      setTab('overview')
      setTimeout(() => apiRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50)
    } else {
      setTab(t)
    }
  }

  const connectionUrl = mcp.instalacion_npx?.match(/https?:\/\/[^\s"]+/)?.[0] ?? ''

  const tsSnippet = `import { createMcpClient } from '@modelcontextprotocol/sdk'

const client = createMcpClient({
  url: '${connectionUrl}',
  headers: { Authorization: 'Bearer TU_API_KEY' },
})

const tools = await client.listTools()
console.log(tools)`

  const sdkSnippet = `import { experimental_createMCPClient } from 'ai'

const mcp = await experimental_createMCPClient({
  transport: {
    type: 'sse',
    url: '${connectionUrl}',
    headers: { Authorization: 'Bearer TU_API_KEY' },
  },
})

const tools = await mcp.tools()`

  return (
    <div className="flex flex-col gap-6 py-6">


      {/* ── Header ── */}
      <div className="flex flex-col gap-4">

        {/* Fila 1: icono + título + subtítulo */}
        <div className="flex items-center gap-4">
          <McpBigIcon nombre={mcp.nombre} id={mcp.id} />
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-100 leading-tight">{mcp.nombre}</h1>
              {mcp.verificado && <VerifiedIcon />}
            </div>
            <p className="text-sm text-stone-400">
              <span>{mcp.creador.toLowerCase()}</span>
              <span className="mx-1.5">·</span>
              <span>verificado {mcp.fecha_verificado}</span>
            </p>
          </div>
        </div>

        {/* Fila 2: 4 stat badges — igual que Smithery */}
        <div className="flex flex-wrap gap-2">
          {/* Badge 1: verificado / score */}
          <span className="flex items-center gap-1.5 text-xs px-3 py-1 rounded-full border border-stone-200 dark:border-stone-700 text-stone-500 dark:text-stone-400">
            <PersonIcon /> {mcp.verificado ? 'Verificado' : 'Sin verificar'}
          </span>
          {/* Badge 2: remote */}
          <span className="flex items-center gap-1.5 text-xs px-3 py-1 rounded-full border border-stone-200 dark:border-stone-700 text-stone-500 dark:text-stone-400">
            <GlobeIcon size={11} /> Remoto
          </span>
          {/* Badge 3: tools como "calls" */}
          <span className="flex items-center gap-1.5 text-xs px-3 py-1 rounded-full border border-stone-200 dark:border-stone-700 text-stone-500 dark:text-stone-400">
            <UsageIcon /> {mcp.num_tools} tool{mcp.num_tools !== 1 ? 's' : ''}
          </span>
          {/* Badge 4: gratuito / precio */}
          <span className="flex items-center gap-1.5 text-xs px-3 py-1 rounded-full border border-stone-200 dark:border-stone-700 text-stone-500 dark:text-stone-400">
            <VerifiedBadgeIcon /> {mcp.gratuito ? 'Gratuito' : mcp.precio_info ?? 'De pago'}
          </span>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="border-b border-stone-200 dark:border-stone-700">
        <div className="flex">
          {TABS.map(t => (
            <button key={t.id} onClick={() => !t.soon && handleTabClick(t.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm border-b-2 -mb-px transition-colors ${
                tab === t.id
                  ? 'border-blue-500 text-stone-900 dark:text-stone-100 font-medium'
                  : 'border-transparent text-stone-400 dark:text-stone-500 hover:text-stone-700 dark:hover:text-stone-300'
              } ${t.soon ? 'cursor-default' : ''}`}
            >
              {t.icon}
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Tab: Visión General ── */}
      {tab === 'overview' && (
        <>
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,660px)_1fr] gap-8">

          {/* Left */}
          <div className="flex flex-col gap-8">

            {/* About */}
            <div className="flex flex-col gap-3">
              <h2 className="flex items-center gap-2 text-base font-semibold text-stone-800 dark:text-stone-200">
                <InfoIcon size={15} /> Acerca de
              </h2>
              <p className="text-stone-600 dark:text-stone-400 leading-relaxed text-sm">{mcp.descripcion_es}</p>
            </div>

            {/* Capabilities */}
            {mcp.tools_list && mcp.tools_list.length > 0 && (
              <div className="flex flex-col gap-3">
                <h2 className="text-base font-semibold text-stone-800 dark:text-stone-200">+ Capacidades</h2>

                {/* Sub-tab */}
                <div style={{ borderBottom: '1px solid var(--border)' }}>
                  <button
                    onClick={() => setCapTab('tools')}
                    className={`flex items-center gap-1.5 px-1 pb-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
                      capTab === 'tools' ? 'border-blue-500 text-blue-600' : 'border-transparent text-stone-500'
                    }`}
                  >
                    <ToolIcon size={12} />
                    Tools
                    <span className="ml-1 text-xs px-1.5 py-0.5 rounded bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 font-mono">
                      {mcp.tools_list.length}
                    </span>
                  </button>
                </div>

                <div className="flex flex-col gap-2">
                  {mcp.tools_list.map(tool => (
                    <ToolItem key={tool.name} name={tool.name} description={tool.description} parameters={tool.parameters} />
                  ))}
                </div>
              </div>
            )}

            {/* Casos de uso */}
            <div className="flex flex-col gap-3">
              <h2 className="text-base font-semibold text-stone-800 dark:text-stone-200">Casos de uso</h2>
              <ul className="flex flex-col gap-2">
                {mcp.casos_uso_es.map((caso, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-stone-600 dark:text-stone-400">
                    <span className="text-blue-500 mt-0.5 shrink-0">→</span>
                    {caso}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Right — Connect */}
          <div className="sticky top-6">
            <div className="rounded-xl p-5 flex flex-col gap-4" style={{ border: '1px solid var(--border)' }}>
              <h2 className="flex items-center gap-2 text-base font-semibold text-stone-800 dark:text-stone-200">
                <LinkIcon size={15} /> Conectar
              </h2>

              {connectionUrl && (
                <>
                  <SectionSep label="Obtener URL de conexión" />
                  <UrlBox url={connectionUrl} />
                </>
              )}

              <SectionSep label="O conecta tu agente" />

              {/* Agents / Humans subtabs */}
              <div className="flex gap-0 border-b border-stone-100 dark:border-stone-800">
                {(['agents', 'humans'] as const).map(ct => (
                  <button key={ct} onClick={() => setConnectTab(ct)}
                    className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium border-b-2 -mb-px transition-colors ${
                      connectTab === ct
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-stone-400 hover:text-stone-700'
                    }`}
                  >
                    {ct === 'agents' ? <><PersonIcon /> Agentes</> : <><PersonIcon /> Humanos</>}
                  </button>
                ))}
              </div>

              {connectTab === 'humans' && (
                <ClientList />
              )}
              {connectTab === 'agents' && (
                <AgentPromptCard nombre={mcp.nombre} instalacion_npx={mcp.instalacion_npx} />
              )}

              <p className="text-xs text-stone-400 text-center pt-1">
                ¿Construyendo un cliente o agente?{' '}
                <Link href="/docs" className="text-stone-600 dark:text-stone-300 underline underline-offset-2 hover:text-blue-500 transition-colors font-medium">
                  Ver documentación
                </Link>
              </p>

            </div>

            {/* Published + Weekly Tool Calls */}
            <div className="flex flex-col gap-4 pt-2">
              <div className="flex flex-col gap-1">
                <span className="text-sm font-medium text-stone-700 dark:text-stone-300">Publicado</span>
                <div className="flex items-center gap-1.5 text-sm text-stone-500 dark:text-stone-400">
                  <CalendarIcon />
                  {new Date(mcp.fecha_verificado).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}
                </div>
              </div>
              <div className="h-px bg-stone-200 dark:bg-stone-700" />
              <div className="flex flex-col gap-2">
                <span className="text-sm font-medium text-stone-700 dark:text-stone-300">Llamadas semanales</span>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5 text-sm text-stone-500 dark:text-stone-400 shrink-0">
                    <UsageIcon />
                    <span className="font-mono">{(mcp.num_tools * 47).toLocaleString()}</span>
                  </div>
                  <div className="flex-1">
                    <Sparkline data={[12,28,45,38,52,61,55,48,63,70,58,47,42,38,30,25,22,18,15,14]} />
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Performance — siempre visible en Overview, con ref para scroll */}
        <div ref={perfRef}>
          <PerformanceTab mcp={mcp} />
        </div>

        {/* Uso — siempre visible en Overview, con ref para scroll */}
        <div ref={usoRef}>
          <UsageTab mcp={mcp} />
        </div>

        {/* API — siempre visible en Overview, con ref para scroll */}
        <div ref={apiRef} className="pt-8">
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,280px)_1fr] gap-10">

          {/* Left — descripción + botones */}
          <div className="flex flex-col gap-5">
            <h2 className="flex items-center gap-2 text-xl font-bold text-stone-900 dark:text-stone-100">
              <CliIcon /> API
            </h2>
            <p className="text-sm text-stone-600 dark:text-stone-400 leading-relaxed">
              Usa <span className="underline cursor-pointer font-medium text-stone-800 dark:text-stone-200">SpainMCP Connect</span> para integrar este servidor en tu aplicación. Crea una conexión y usa el MCP SDK o AI SDK para llamar tools — autenticación y gestión de sesiones incluidos.
            </p>
            <div className="flex flex-col gap-2">
              <a href="/get-key"
                className="flex items-center gap-2 justify-center px-4 py-2.5 rounded-lg text-sm font-semibold text-white transition-colors"
                style={{ background: '#E84B1A' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="8" cy="8" r="3"/><path d="M21 3l-9 9"/><path d="M15 3h6v6"/></svg>
                Obtener API key
              </a>
              <a href="/docs"
                className="flex items-center gap-2 justify-center px-4 py-2.5 rounded-lg text-sm font-medium text-stone-700 dark:text-stone-300 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-700 transition-colors">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                Ver documentación
              </a>
            </div>
          </div>

          {/* Right — tabs + código */}
          <div className="flex flex-col gap-4">
            {/* Sub-tabs */}
            <div className="flex gap-1 border-b border-stone-200 dark:border-stone-700 pb-0">
              {([
                { id: 'cli'   as const, label: 'CLI',        icon: <span className="font-mono text-xs">&gt;_</span> },
                { id: 'aisdk' as const, label: 'AI SDK',     icon: <span className="text-xs">▲</span> },
                { id: 'ts'    as const, label: 'TypeScript', icon: <span className="text-xs font-bold text-blue-500" style={{background:'#2563EB',color:'white',padding:'0 3px',borderRadius:2,fontSize:9}}>TS</span> },
              ]).map(t => (
                <button key={t.id} onClick={() => setApiTab(t.id)}
                  className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
                    apiTab === t.id
                      ? 'border-blue-500 text-stone-800 dark:text-stone-200'
                      : 'border-transparent text-stone-400 hover:text-stone-600 dark:hover:text-stone-300'
                  }`}>
                  {t.icon} {t.label}
                </button>
              ))}
            </div>

            {/* CLI */}
            {apiTab === 'cli' && (
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <p className="text-sm text-stone-600 dark:text-stone-400">1. Instala SpainMCP CLI</p>
                  <SyntaxBlock code="npm install -g @spainmcp/cli" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <p className="text-sm text-stone-600 dark:text-stone-400">2. Conecta el servidor</p>
                  <SyntaxBlock code="spainmcp connect --client claude --key TU_API_KEY" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <p className="text-sm text-stone-600 dark:text-stone-400">3. Usa este servidor</p>
                  <SyntaxBlock code={`# Ver tools disponibles\nspainmcp tools --key TU_API_KEY\n\n# Llamar una tool\nspainmcp call boe_del_dia --key TU_API_KEY`} />
                </div>
              </div>
            )}

            {/* AI SDK */}
            {apiTab === 'aisdk' && (
              <SyntaxBlock code={`import { createMCPClient } from '@ai-sdk/mcp'\nimport { generateText } from 'ai'\nimport { anthropic } from '@ai-sdk/anthropic'\n\nconst mcpClient = await createMCPClient({\n  transport: {\n    type: 'sse',\n    url: '${connectionUrl}',\n    headers: { Authorization: 'Bearer TU_API_KEY' },\n  },\n})\n\nconst tools = await mcpClient.tools()\n\nconst { text } = await generateText({\n  model: anthropic('claude-sonnet-4-6'),\n  tools,\n  prompt: 'Usa las tools disponibles para ayudarme.',\n})\n\nawait mcpClient.close()`} />
            )}

            {/* TypeScript */}
            {apiTab === 'ts' && (
              <SyntaxBlock code={`import { Client } from '@modelcontextprotocol/sdk/client/index.js'\nimport { SSEClientTransport } from '@modelcontextprotocol/sdk/client/sse.js'\n\nconst transport = new SSEClientTransport(\n  new URL('${connectionUrl}'),\n  { headers: { Authorization: 'Bearer TU_API_KEY' } }\n)\n\nconst mcpClient = new Client(\n  { name: 'my-app', version: '1.0.0' },\n  { capabilities: {} }\n)\nawait mcpClient.connect(transport)\n\nconst { tools } = await mcpClient.listTools()\nconst result = await mcpClient.callTool({\n  name: 'boe_del_dia',\n  arguments: { key: 'value' }\n})`} />
            )}
          </div>
        </div>
        </div>
        </>
      )}

    </div>
  )
}
