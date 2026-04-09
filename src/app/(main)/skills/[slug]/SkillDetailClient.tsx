'use client'

import { useState } from 'react'
import type { SkillFull } from './page'

/* ── Icons ── */
const StarIcon = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
const DownloadIcon = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
const InfoIcon = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
const CopyIcon = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
const FileIcon = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
const SearchIcon = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
const LinkIcon = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
const FolderIcon = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>

const VerifiedIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" className="text-blue-500 shrink-0">
    <circle cx="12" cy="12" r="10" fill="currentColor" opacity="0.15"/>
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5"/>
    <polyline points="8 12 11 15 16 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

/* ── Skill icon with fallback to initials ── */
function SkillIcon({ iconUrl, nombre, author }: { iconUrl: string | null; nombre: string; author: string | null }) {
  const [imgFailed, setImgFailed] = useState(false)

  const palettes = [
    { bg: '#FFF0E8', text: '#C2400C' },
    { bg: '#EEF2FF', text: '#4338CA' },
    { bg: '#F0FDF4', text: '#15803D' },
    { bg: '#FDF4FF', text: '#9333EA' },
    { bg: '#FEFCE8', text: '#A16207' },
  ]
  const key = (author ?? '') + nombre
  const p = palettes[key.charCodeAt(0) % palettes.length]
  const initials = ((author?.[0] ?? '') + (nombre[0] ?? '')).toUpperCase()

  if (iconUrl && !imgFailed) {
    return (
      <img
        src={iconUrl}
        alt={nombre}
        width={64}
        height={64}
        className="w-16 h-16 rounded-xl object-contain border border-[var(--border)] shrink-0"
        onError={() => setImgFailed(true)}
      />
    )
  }

  return (
    <div
      className="w-16 h-16 rounded-xl flex items-center justify-center text-xl font-bold shrink-0"
      style={{ background: p.bg, color: p.text }}
    >
      {initials || '?'}
    </div>
  )
}

/* ── Inline renderer: `code` ── */
function renderInline(text: string): React.ReactNode {
  const parts = text.split(/(`[^`]+`|\[[^\]]+\]\([^)]+\))/g)
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith('`') && part.endsWith('`')) {
          return (
            <code key={i} className="text-xs font-mono px-1.5 py-0.5 rounded mx-0.5 bg-[var(--card)] border border-[var(--border)] text-[var(--foreground)]">
              {part.slice(1, -1)}
            </code>
          )
        }
        const link = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/)
        if (link) {
          return (
            <a key={i} href={link[2]} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
              {link[1]}
            </a>
          )
        }
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
          <li key={j} className="flex items-start gap-2 text-sm text-[var(--muted)] leading-relaxed">
            <span className="mt-2 w-1.5 h-1.5 rounded-full bg-[var(--muted)] shrink-0 opacity-60" />
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
      if (!inCode) {
        inCode = true
        codeLines = []
        flushList(i)
      } else {
        nodes.push(
          <pre key={i} className="rounded-lg p-4 text-xs font-mono leading-relaxed overflow-x-auto my-3 whitespace-pre-wrap bg-[var(--card)] border border-[var(--border)] text-[var(--foreground)]">
            {codeLines.join('\n')}
          </pre>
        )
        inCode = false
      }
    } else if (inCode) {
      codeLines.push(line)
    } else if (line.startsWith('### ')) {
      flushList(i)
      nodes.push(
        <h3 key={i} className="text-base font-bold mt-5 mb-1.5 text-blue-600 dark:text-blue-400">
          {renderInline(line.slice(4))}
        </h3>
      )
    } else if (line.startsWith('## ')) {
      flushList(i)
      nodes.push(
        <h2 key={i} className="text-lg font-bold mt-6 mb-2 text-[var(--foreground)]">
          {renderInline(line.slice(3))}
        </h2>
      )
    } else if (line.startsWith('# ')) {
      flushList(i)
      nodes.push(
        <h1 key={i} className="text-2xl font-bold text-[var(--foreground)] mb-2">
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
      // Handle **bold**
      const boldParts = line.split(/(\*\*[^*]+\*\*)/g)
      const rendered = boldParts.map((part, j) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={j} className="font-semibold text-[var(--foreground)]">{part.slice(2, -2)}</strong>
        }
        return <span key={j}>{renderInline(part)}</span>
      })
      nodes.push(
        <p key={i} className="text-sm text-[var(--muted)] leading-relaxed">
          {rendered}
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
  { label: 'Cursor',         color: '#1A1A2E', flag: 'cursor',       path: '.cursor/skills' },
  { label: 'Gemini CLI',     color: '#4285F4', flag: 'gemini',       path: '.gemini/skills' },
  { label: 'Codex',          color: '#10A37F', flag: 'codex',        path: '.codex/skills' },
  { label: 'Windsurf',       color: '#06B6D4', flag: 'windsurf',     path: '.windsurf/skills' },
  { label: 'GitHub Copilot', color: '#24292F', flag: 'copilot',      path: '.vscode/skills' },
  { label: 'Amp',            color: '#E85D2F', flag: 'amp',          path: '.amp/skills' },
  { label: 'Kilo Code',      color: '#7C3AED', flag: 'kilo-code',    path: '.kilocode/skills' },
  { label: 'Cline',          color: '#F97316', flag: 'cline',        path: '.cline/skills' },
  { label: 'Roo Code',       color: '#8B5CF6', flag: 'roo-code',     path: '.roocode/skills' },
  { label: 'VS Code',        color: '#0078D4', flag: 'vscode',       path: '.vscode/skills' },
]

export default function SkillDetailClient({ skill }: { skill: SkillFull }) {
  const [copied, setCopied] = useState(false)
  const [agentQ, setAgentQ] = useState('')
  const [selectedAgent, setSelectedAgent] = useState<typeof AGENTS[0] | null>(null)
  const [agentCopied, setAgentCopied] = useState(false)
  const [aboutExpanded, setAboutExpanded] = useState(false)

  const ABOUT_LIMIT = 180
  const author = skill.author ?? 'spainmcp'
  const isVerified = author === 'spainmcp'
  const installCmd = `npx @spainmcp/cli skill add ${author}/${skill.slug}`
  const filteredAgents = AGENTS.filter(a => a.label.toLowerCase().includes(agentQ.toLowerCase()))

  const copy = () => {
    navigator.clipboard.writeText(installCmd)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const downloadSkill = async () => {
    const mdContent = skill.content ?? `# ${skill.nombre}\n\n${skill.descripcion ?? ''}`
    const blob = new Blob([mdContent], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${skill.slug}.md`
    a.click()
    URL.revokeObjectURL(url)

    // Fire-and-forget increment
    fetch(`/api/catalog/skills/${skill.slug}`, { method: 'POST' }).catch(() => {})
  }

  const catLabel = skill.categoria.charAt(0).toUpperCase() + skill.categoria.slice(1)

  return (
    <div className="flex flex-col gap-6 py-6">

      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-start gap-4">
          <SkillIcon iconUrl={skill.icon_url} nombre={skill.nombre} author={author} />
          <div className="flex flex-col gap-1.5">
            <h1 className="text-2xl font-bold text-[var(--foreground)]">
              {skill.nombre}
            </h1>
            <div className="flex items-center gap-2 text-sm text-[var(--muted)]">
              <span className="text-blue-600 dark:text-blue-400 font-medium font-mono">
                {author}/{skill.slug}
              </span>
              {isVerified && <VerifiedIcon />}
            </div>
            <div className="flex items-center gap-3 text-xs text-[var(--muted)] mt-0.5 flex-wrap">
              <span className="px-2 py-0.5 rounded-full bg-blue-600/10 text-blue-600 dark:text-blue-400 font-medium text-[11px]">
                {catLabel}
              </span>
              <span className="flex items-center gap-1">
                <StarIcon /> {(skill.stars ?? 0).toLocaleString()}
              </span>
              <span className="flex items-center gap-1">
                <DownloadIcon /> {(skill.installs ?? 0).toLocaleString()} installs
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={downloadSkill}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors shrink-0"
        >
          <DownloadIcon />
          Descargar skill
        </button>
      </div>

      {/* ── Tab bar ── */}
      <div className="border-b border-[var(--border)]">
        <button className="flex items-center gap-1.5 px-1 pb-2.5 text-sm font-medium border-b-2 border-blue-600 text-[var(--foreground)] -mb-px">
          <InfoIcon /> Overview
        </button>
      </div>

      {/* ── Two-column layout ── */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8">

        {/* Left column */}
        <div className="flex flex-col gap-6 min-w-0">

          {/* About */}
          <div className="flex flex-col gap-2">
            <h2 className="flex items-center gap-2 text-base font-semibold text-[var(--foreground)]">
              <InfoIcon /> About
            </h2>
            <p className="text-sm text-[var(--muted)] leading-relaxed">
              {skill.descripcion && skill.descripcion.length > ABOUT_LIMIT && !aboutExpanded
                ? skill.descripcion.slice(0, ABOUT_LIMIT) + '...'
                : skill.descripcion}
            </p>
            {skill.descripcion && skill.descripcion.length > ABOUT_LIMIT && (
              <button
                onClick={() => setAboutExpanded(v => !v)}
                className="text-sm text-blue-600 dark:text-blue-400 hover:underline text-left w-fit"
              >
                {aboutExpanded ? 'Ver menos' : 'Ver más'}
              </button>
            )}
          </div>

          {/* SKILL.md content */}
          {skill.content && (
            <div className="flex flex-col gap-3">
              <h2 className="flex items-center gap-2 text-base font-semibold text-[var(--foreground)]">
                <FileIcon /> SKILL.md
              </h2>
              <div
                className="rounded-xl p-5 overflow-y-auto border border-[var(--border)] bg-[var(--card)]"
                style={{ maxHeight: '520px' }}
              >
                <SkillMd content={skill.content} />
              </div>
            </div>
          )}
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-4">

          {/* Install card */}
          <div className="rounded-xl flex flex-col gap-4 p-5 border border-[var(--border)] bg-[var(--card)]">
            <h2 className="flex items-center gap-2 text-base font-semibold text-[var(--foreground)]">
              <LinkIcon /> Instalar
            </h2>

            {/* CLI command */}
            <div className="flex flex-col gap-1.5">
              <p className="text-xs text-[var(--muted)]">Instalar via CLI</p>
              <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-[var(--background)] border border-[var(--border)]">
                <code className="flex-1 text-xs font-mono text-[var(--foreground)] truncate">{installCmd}</code>
                <button
                  onClick={copy}
                  className="text-[var(--muted)] hover:text-[var(--foreground)] shrink-0 transition-colors"
                  title="Copiar comando"
                >
                  {copied ? (
                    <span className="text-green-500 text-xs font-medium">Copiado</span>
                  ) : (
                    <CopyIcon />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-[var(--border)]" />
              <span className="text-xs text-[var(--muted)]">o añadir a tu agente</span>
              <div className="flex-1 h-px bg-[var(--border)]" />
            </div>

            {/* Agent selector */}
            <div
              className="flex flex-col rounded-xl overflow-hidden bg-[var(--background)] border border-[var(--border)]"
              style={{ minHeight: '240px' }}
            >
              {selectedAgent ? (
                <div className="flex flex-col gap-3 p-4">
                  <button
                    onClick={() => setSelectedAgent(null)}
                    className="flex items-center gap-1.5 text-sm text-[var(--muted)] hover:text-[var(--foreground)] transition-colors w-fit"
                  >
                    ← Volver
                  </button>
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold shrink-0"
                      style={{ background: selectedAgent.color }}
                    >
                      {selectedAgent.label[0]}
                    </div>
                    <span className="text-base font-bold text-[var(--foreground)]">{selectedAgent.label}</span>
                  </div>
                  <div className="flex items-center gap-2 rounded-lg px-3 py-2.5 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800/40">
                    <code className="flex-1 text-xs font-mono text-[var(--foreground)] break-all">
                      {`npx @spainmcp/cli skill add ${author}/${skill.slug} --agent ${selectedAgent.flag}`}
                    </code>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(`npx @spainmcp/cli skill add ${author}/${skill.slug} --agent ${selectedAgent.flag}`)
                        setAgentCopied(true)
                        setTimeout(() => setAgentCopied(false), 1500)
                      }}
                      className="shrink-0 text-[var(--muted)] hover:text-[var(--foreground)] transition-colors text-xs"
                    >
                      {agentCopied ? '✓' : <CopyIcon />}
                    </button>
                  </div>
                  <p className="text-xs text-[var(--muted)]">
                    Instala en{' '}
                    <code className="text-xs font-mono px-1 py-0.5 rounded bg-[var(--card)] border border-[var(--border)]">
                      {selectedAgent.path}
                    </code>
                  </p>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-2 px-3 py-2.5 border-b border-[var(--border)]">
                    <SearchIcon />
                    <input
                      value={agentQ}
                      onChange={e => setAgentQ(e.target.value)}
                      placeholder="Buscar agentes..."
                      className="flex-1 text-sm bg-transparent outline-none text-[var(--foreground)] placeholder:text-[var(--muted)]"
                    />
                  </div>
                  <div className="flex flex-col max-h-48 overflow-y-auto">
                    {filteredAgents.map(a => (
                      <button
                        key={a.flag}
                        onClick={() => setSelectedAgent(a)}
                        className="flex items-center gap-3 px-4 py-3 hover:bg-blue-50 dark:hover:bg-blue-950/20 transition-colors text-left"
                      >
                        <div
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0"
                          style={{ background: a.color }}
                        >
                          {a.label[0]}
                        </div>
                        <span className="text-sm text-[var(--foreground)]">{a.label}</span>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Files card */}
          <div className="rounded-xl p-4 flex flex-col gap-3 border border-[var(--border)] bg-[var(--card)]">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-[var(--foreground)]">
              <FolderIcon /> Archivos
            </h3>
            <button
              onClick={downloadSkill}
              className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 hover:underline w-fit"
            >
              <FileIcon /> SKILL.md
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
