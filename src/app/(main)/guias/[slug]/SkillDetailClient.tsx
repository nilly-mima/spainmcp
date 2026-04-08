'use client'

import { useState } from 'react'
import type { Skill } from '@/lib/skills'

/* ── ZIP builder (no deps) ── */
function createZip(filename: string, content: string): Uint8Array {
  const enc = new TextEncoder()
  const fileData = enc.encode(content)
  const fnBytes  = enc.encode(filename)
  const fnLen    = fnBytes.length
  const dataLen  = fileData.length

  // CRC-32
  const t = new Uint32Array(256)
  for (let i = 0; i < 256; i++) {
    let c = i
    for (let j = 0; j < 8; j++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1)
    t[i] = c
  }
  let crc = 0xFFFFFFFF
  for (const b of fileData) crc = t[(crc ^ b) & 0xFF] ^ (crc >>> 8)
  const crcVal = (crc ^ 0xFFFFFFFF) >>> 0

  const localHdrSize = 30 + fnLen
  const cdHdrSize    = 46 + fnLen
  const total        = localHdrSize + dataLen + cdHdrSize + 22
  const buf  = new ArrayBuffer(total)
  const view = new DataView(buf)
  const u8   = new Uint8Array(buf)
  let p = 0

  // Local file header
  view.setUint32(p, 0x04034b50, true); p+=4
  view.setUint16(p, 20, true); p+=2
  view.setUint16(p, 0, true); p+=2  // bit flag
  view.setUint16(p, 0, true); p+=2  // store (no compression)
  view.setUint16(p, 0, true); p+=2  // mod time
  view.setUint16(p, 0, true); p+=2  // mod date
  view.setUint32(p, crcVal, true); p+=4
  view.setUint32(p, dataLen, true); p+=4
  view.setUint32(p, dataLen, true); p+=4
  view.setUint16(p, fnLen, true); p+=2
  view.setUint16(p, 0, true); p+=2  // extra length
  u8.set(fnBytes, p); p+=fnLen
  u8.set(fileData, p); p+=dataLen

  const cdOffset = p

  // Central directory header
  view.setUint32(p, 0x02014b50, true); p+=4
  view.setUint16(p, 20, true); p+=2
  view.setUint16(p, 20, true); p+=2
  view.setUint16(p, 0, true); p+=2
  view.setUint16(p, 0, true); p+=2
  view.setUint16(p, 0, true); p+=2
  view.setUint16(p, 0, true); p+=2
  view.setUint32(p, crcVal, true); p+=4
  view.setUint32(p, dataLen, true); p+=4
  view.setUint32(p, dataLen, true); p+=4
  view.setUint16(p, fnLen, true); p+=2
  view.setUint16(p, 0, true); p+=2
  view.setUint16(p, 0, true); p+=2
  view.setUint16(p, 0, true); p+=2
  view.setUint16(p, 0, true); p+=2
  view.setUint32(p, 0, true); p+=4
  view.setUint32(p, 0, true); p+=4  // local header offset
  u8.set(fnBytes, p); p+=fnLen

  const cdSize = p - cdOffset

  // End of central directory
  view.setUint32(p, 0x06054b50, true); p+=4
  view.setUint16(p, 0, true); p+=2
  view.setUint16(p, 0, true); p+=2
  view.setUint16(p, 1, true); p+=2
  view.setUint16(p, 1, true); p+=2
  view.setUint32(p, cdSize, true); p+=4
  view.setUint32(p, cdOffset, true); p+=4
  view.setUint16(p, 0, true); p+=2

  return u8
}

/* ── Icons ── */
const StarIcon    = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
const DownloadIcon = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
const InfoIcon    = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
const LinkIcon    = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
const CopyIcon    = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
const SearchIcon  = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
const RepoIcon    = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/></svg>
const FileIcon    = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
const FolderIcon  = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
const VerifiedIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" className="text-blue-500 shrink-0">
    <circle cx="12" cy="12" r="10" fill="currentColor" opacity="0.15"/>
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5"/>
    <polyline points="8 12 11 15 16 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

/* ── Skill icon ── */
function SkillIcon({ creator, nombre }: { creator: string; nombre: string }) {
  const palettes = [
    { bg: '#FFF0E8', text: '#C2400C' },
    { bg: '#EEF2FF', text: '#4338CA' },
    { bg: '#F0FDF4', text: '#15803D' },
    { bg: '#FDF4FF', text: '#9333EA' },
    { bg: '#FEFCE8', text: '#A16207' },
  ]
  const key = creator + nombre
  const p = palettes[key.charCodeAt(0) % palettes.length]
  const initials = (creator[0] + nombre[0]).toUpperCase()
  return (
    <div className="w-14 h-14 rounded-xl flex items-center justify-center text-base font-bold shrink-0"
      style={{ background: p.bg, color: p.text }}>
      {initials}
    </div>
  )
}

/* ── Inline renderer: `code` + [text](url) ── */
function renderInline(text: string): React.ReactNode {
  // Strip heading links [text](url) and render inline `code`
  const parts = text.split(/(`[^`]+`|\[[^\]]+\]\([^)]+\))/g)
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith('`') && part.endsWith('`')) {
          return (
            <code key={i} className="text-xs font-mono px-1.5 py-0.5 rounded mx-0.5 bg-[#EEEBE5] dark:bg-stone-700 text-stone-700 dark:text-stone-200">
              {part.slice(1, -1)}
            </code>
          )
        }
        const link = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/)
        if (link) return <span key={i}>{link[1]}</span>
        return part
      })}
    </>
  )
}

/* ── Markdown renderer ── */
function SkillMd({ content }: { content: string }) {
  const lines = content.split('\n')
  const nodes: React.ReactNode[] = []
  let inCode = false
  let codeLines: string[] = []
  let listItems: string[] = []
  let i = 0

  const flushList = (key: number) => {
    if (listItems.length === 0) return
    nodes.push(
      <ul key={`ul-${key}`} className="flex flex-col gap-1.5 my-1 ml-2">
        {listItems.map((item, j) => (
          <li key={j} className="flex items-start gap-2 text-sm text-stone-600 dark:text-stone-400 leading-relaxed">
            <span className="mt-2 w-1.5 h-1.5 rounded-full bg-stone-400 shrink-0" />
            <span>{renderInline(item)}</span>
          </li>
        ))}
      </ul>
    )
    listItems = []
  }

  while (i < lines.length) {
    const line = lines[i]

    if (line.startsWith('```')) {
      if (!inCode) { inCode = true; codeLines = []; flushList(i) }
      else {
        nodes.push(
          <pre key={i} className="rounded-lg p-4 text-xs font-mono leading-relaxed overflow-x-auto my-3 whitespace-pre-wrap bg-[#E2DBD1] dark:bg-stone-800 border border-[#C8BFB4] dark:border-stone-600 text-stone-800 dark:text-stone-200">
            {codeLines.join('\n')}
          </pre>
        )
        inCode = false
      }
    } else if (inCode) {
      codeLines.push(line)
    } else if (line.startsWith('### ')) {
      flushList(i)
      const raw = line.slice(4)
      const linkMatch = raw.match(/^\[([^\]]+)\]\(([^)]+)\)/)
      const text = linkMatch ? linkMatch[1] : raw.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      const href = linkMatch ? linkMatch[2] : null
      nodes.push(
        <h3 key={i} className="text-base font-bold mt-5 mb-1.5" style={{ color: '#C2400C' }}>
          {href
            ? <a href={href} target="_blank" rel="noopener noreferrer" className="hover:underline">{text}</a>
            : text}
        </h3>
      )
    } else if (line.startsWith('## ')) {
      flushList(i)
      nodes.push(
        <h2 key={i} className="text-xl font-bold mt-6 mb-2" style={{ color: '#C2400C' }}>
          {renderInline(line.slice(3))}
        </h2>
      )
    } else if (line.startsWith('# ')) {
      flushList(i)
      nodes.push(
        <h1 key={i} className="text-2xl font-bold text-stone-900 dark:text-stone-100 mb-2">
          {renderInline(line.slice(2))}
        </h1>
      )
    } else if (line.startsWith('- ')) {
      listItems.push(line.slice(2))
    } else if (line.trim() === '') {
      flushList(i)
      nodes.push(<div key={i} className="h-1" />)
    } else {
      flushList(i)
      nodes.push(
        <p key={i} className="text-sm text-stone-600 dark:text-stone-400 leading-relaxed">
          {renderInline(line)}
        </p>
      )
    }
    i++
  }
  flushList(lines.length)
  return <div className="flex flex-col gap-0.5">{nodes}</div>
}

/* ── Agents list ── */
const AGENTS = [
  { label: 'Claude Code',    color: '#D97706', flag: 'claude-code',  path: '.claude/skills' },
  { label: 'Codex',          color: '#10A37F', flag: 'codex',        path: '.codex/skills' },
  { label: 'OpenClaw',       color: '#DC2626', flag: 'openclaw',     path: '.openclaw/skills' },
  { label: 'Cursor',         color: '#1A1A2E', flag: 'cursor',       path: '.cursor/skills' },
  { label: 'Amp',            color: '#E85D2F', flag: 'amp',          path: '.amp/skills' },
  { label: 'GitHub Copilot', color: '#24292F', flag: 'copilot',      path: '.vscode/skills' },
  { label: 'Gemini CLI',     color: '#4285F4', flag: 'gemini',       path: '.gemini/skills' },
  { label: 'Kilo Code',      color: '#7C3AED', flag: 'kilo-code',    path: '.kilocode/skills' },
  { label: 'Junia',          color: '#0EA5E9', flag: 'junia',        path: '.junia/skills' },
  { label: 'Windsurf',       color: '#06B6D4', flag: 'windsurf',     path: '.windsurf/skills' },
  { label: 'VS Code',        color: '#0078D4', flag: 'vscode',       path: '.vscode/skills' },
  { label: 'Cline',          color: '#F97316', flag: 'cline',        path: '.cline/skills' },
  { label: 'Roo Code',       color: '#8B5CF6', flag: 'roo-code',     path: '.roocode/skills' },
]

export default function SkillDetailClient({ skill }: { skill: Skill }) {
  const [copied, setCopied] = useState(false)
  const [titleCopied, setTitleCopied] = useState(false)
  const [agentQ, setAgentQ] = useState('')
  const [selectedAgent, setSelectedAgent] = useState<typeof AGENTS[0] | null>(null)
  const [agentCopied, setAgentCopied] = useState(false)
  const [aboutExpanded, setAboutExpanded] = useState(false)
  const ABOUT_LIMIT = 120
  const installCmd = `npx @spainmcp/cli@latest skill add ${skill.creator}/${skill.nombre}`
  const copy = () => { navigator.clipboard.writeText(installCmd); setCopied(true); setTimeout(() => setCopied(false), 1500) }
  const copyTitle = () => { navigator.clipboard.writeText(`${skill.creator}/${skill.nombre}`); setTitleCopied(true); setTimeout(() => setTitleCopied(false), 1500) }
  const filteredAgents = AGENTS.filter(a => a.label.toLowerCase().includes(agentQ.toLowerCase()))
  const downloadSkill = () => {
    const frontmatter = `---\nname: ${skill.creator}-${skill.nombre}\ndescription: ${skill.descripcion ?? ''}\n---\n\n`
    const content = frontmatter + (skill.skill_md ?? `# ${skill.nombre}\n\n${skill.descripcion ?? ''}`)
    const zip = createZip('SKILL.md', content)
    const url = URL.createObjectURL(new Blob([zip.buffer as ArrayBuffer], { type: 'application/zip' }))
    const a = document.createElement('a')
    a.href = url; a.download = `${skill.nombre}.zip`; a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="flex flex-col gap-6 py-6 px-8">

      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <SkillIcon creator={skill.creator} nombre={skill.nombre} />
          <div className="flex flex-col gap-1">
            <div className="group relative flex items-center gap-2">
              <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-100">
                {skill.creator}-{skill.nombre}
              </h1>
              <button onClick={copyTitle}
                className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-6 left-1/2 -translate-x-1/2 text-xs px-2 py-1 rounded-md text-white font-medium shadow-sm"
                style={{ background: titleCopied ? '#16A34A' : '#1C1917' }}>
                {titleCopied ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <div className="flex items-center gap-1.5 text-sm text-stone-500">
              <span className="text-blue-600 dark:text-blue-500 font-medium">{skill.creator}/{skill.nombre}</span>
              {skill.verified && <VerifiedIcon />}
            </div>
            <div className="flex items-center gap-4 text-xs text-stone-400 mt-1">
              <span className="flex items-center gap-1"><StarIcon /> {skill.stars.toLocaleString()}</span>
              <span className="flex items-center gap-1"><DownloadIcon /> {skill.installs.toLocaleString()} installs</span>
            </div>
          </div>
        </div>
        <button
          onClick={downloadSkill}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white transition-opacity hover:opacity-90 shrink-0"
          style={{ background: '#E84B1A' }}>
          <DownloadIcon />
          Descargar skill
        </button>
      </div>

      {/* ── Tab ── */}
      <div className="border-b border-stone-200 dark:border-stone-700">
        <button className="flex items-center gap-1.5 px-1 pb-2 text-sm font-medium border-b-2 border-orange-500 text-stone-800 dark:text-stone-200 -mb-px">
          <InfoIcon /> Visión General
        </button>
      </div>

      {/* ── Overview: 2 columnas ── */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_440px] gap-8">

        {/* Left */}
        <div className="flex flex-col gap-6">

          {/* About */}
          <div className="flex flex-col gap-2">
            <h2 className="flex items-center gap-2 text-base font-semibold text-stone-800 dark:text-stone-200">
              <InfoIcon /> Acerca de
            </h2>
            <p className="text-sm text-stone-600 dark:text-stone-400 leading-relaxed">
              {skill.descripcion && skill.descripcion.length > ABOUT_LIMIT && !aboutExpanded
                ? skill.descripcion.slice(0, ABOUT_LIMIT) + '...'
                : skill.descripcion}
            </p>
            {skill.descripcion && skill.descripcion.length > ABOUT_LIMIT && (
              <button onClick={() => setAboutExpanded(v => !v)}
                className="text-sm text-stone-500 hover:text-stone-700 dark:hover:text-stone-300 text-left transition-colors">
                {aboutExpanded ? 'Ver menos' : 'Ver más'}
              </button>
            )}
          </div>

          {/* SKILL.md */}
          {skill.skill_md && (
            <div className="flex flex-col gap-3">
              <h2 className="flex items-center gap-2 text-base font-semibold text-stone-800 dark:text-stone-200">
                <FileIcon /> SKILL.md
              </h2>
              <div className="rounded-xl p-5 overflow-y-auto [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-stone-300 [&::-webkit-scrollbar-thumb]:rounded-full" style={{ border: '1px solid #E8E2D9', maxHeight: '480px' }}>
                <SkillMd content={skill.skill_md} />
              </div>
            </div>
          )}
        </div>

        {/* Right — Install */}
        <div className="flex flex-col gap-4">
          <div className="rounded-xl flex flex-col gap-4 p-5" style={{ border: '1px solid #E8E2D9' }}>

            <h2 className="flex items-center gap-2 text-base font-semibold text-stone-800 dark:text-stone-200">
              <LinkIcon /> Instalar
            </h2>

            {/* Install via CLI */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-center gap-1">
                <p className="text-xs text-stone-500">Instalar via SpainMCP CLI</p>
                <div className="relative group">
                  <span className="text-xs text-stone-400 cursor-default">ⓘ</span>
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 rounded-lg text-xs text-stone-700 bg-white shadow-md border border-stone-100 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                    Funciona con la Skills CLI
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-white dark:bg-stone-900" style={{ border: '1px solid #E8E2D9' }}>
                <code className="flex-1 text-xs font-mono text-stone-700 dark:text-stone-300 truncate">{installCmd}</code>
                <button onClick={copy} className="text-stone-400 hover:text-stone-600 shrink-0 transition-colors">
                  {copied ? <span className="text-green-500 text-xs">✓</span> : <CopyIcon />}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-stone-200 dark:bg-stone-700" />
              <span className="text-xs text-stone-500">o añade a tu agente</span>
              <div className="flex-1 h-px bg-stone-200 dark:bg-stone-700" />
            </div>

            {/* Agent search / detail */}
            <div className="flex flex-col rounded-xl overflow-hidden bg-white dark:bg-stone-900" style={{ border: '1px solid #E8E2D9', minHeight: '268px' }}>
              {selectedAgent ? (
                <div className="flex flex-col gap-3 p-4">
                  <button onClick={() => setSelectedAgent(null)}
                    className="flex items-center gap-1.5 text-sm text-stone-500 hover:text-stone-700 dark:hover:text-stone-300 transition-colors w-fit">
                    ← Volver
                  </button>
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold shrink-0"
                      style={{ background: selectedAgent.color }}>
                      {selectedAgent.label[0]}
                    </div>
                    <span className="text-base font-bold text-stone-800 dark:text-stone-200">{selectedAgent.label}</span>
                  </div>
                  <p className="text-sm text-stone-600 dark:text-stone-400">Instalar en {selectedAgent.label}:</p>
                  <div className="flex items-center gap-2 rounded-lg px-3 py-2.5" style={{ background: '#FFFBEB', border: '1px solid #FDE68A' }}>
                    <code className="flex-1 text-xs font-mono text-stone-700 truncate">
                      {`npx @spainmcp/cli@latest skill add ${skill.creator}/${skill.nombre} --agent ${selectedAgent.flag}`}
                    </code>
                    <button onClick={() => {
                      navigator.clipboard.writeText(`npx @spainmcp/cli@latest skill add ${skill.creator}/${skill.nombre} --agent ${selectedAgent.flag}`)
                      setAgentCopied(true); setTimeout(() => setAgentCopied(false), 1500)
                    }} className="shrink-0 text-stone-400 hover:text-stone-600 transition-colors text-xs">
                      {agentCopied ? '✓' : '⧉'}
                    </button>
                  </div>
                  <p className="text-sm text-stone-500">
                    Instala en <code className="text-xs font-mono px-1 py-0.5 rounded bg-[#EEEBE5] dark:bg-stone-700 text-stone-700 dark:text-stone-200">{selectedAgent.path}</code>
                  </p>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-2 px-3 py-2.5 border-b border-stone-100 dark:border-stone-800">
                    <SearchIcon />
                    <input value={agentQ} onChange={e => setAgentQ(e.target.value)}
                      placeholder="Buscar agentes..."
                      className="flex-1 text-sm bg-transparent outline-none text-stone-700 dark:text-stone-300 placeholder:text-stone-400" />
                  </div>
                  <div className="flex flex-col max-h-56 overflow-y-auto [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-stone-300 [&::-webkit-scrollbar-thumb]:rounded-full">
                    {filteredAgents.map(a => (
                      <div key={a.label} onClick={() => setSelectedAgent(a)}
                        className="flex items-center gap-3 px-4 py-3.5 hover:bg-blue-50 transition-colors cursor-pointer">
                        <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0"
                          style={{ background: a.color }}>
                          {a.label[0]}
                        </div>
                        <span className="text-sm text-stone-700 dark:text-stone-300">{a.label}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Repository */}
          {skill.repo && (
            <div className="rounded-xl p-4 flex flex-col gap-3" style={{ border: '1px solid #E8E2D9' }}>
              <h3 className="flex items-center gap-2 text-sm font-semibold text-stone-700 dark:text-stone-300">
                <RepoIcon /> Repositorio
              </h3>
              <a href={`https://github.com/${skill.repo}`} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-sm text-blue-600 dark:text-blue-500 hover:underline">
                <RepoIcon /> {skill.repo}
              </a>
              <div className="h-px bg-stone-100 dark:bg-stone-800" />
              <h3 className="flex items-center gap-2 text-sm font-semibold text-stone-700 dark:text-stone-300">
                <FolderIcon /> Archivos
              </h3>
              <div className="flex items-center gap-2 text-sm text-stone-500">
                <span className="text-stone-400">└</span>
                <FileIcon />
                <span className="text-stone-700 dark:text-stone-300">SKILL.md</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
