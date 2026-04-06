'use client'

import { useState, useMemo } from 'react'
import { Skill } from '@/lib/skills'

const PAGE_SIZE = 15

const CATS = [
  { id: null,            label: 'All' },
  { id: 'Research',      label: 'Research' },
  { id: 'Coding',        label: 'Coding' },
  { id: 'Writing',       label: 'Writing' },
  { id: 'Data & Analytics', label: 'Data & Analytics' },
  { id: 'Design',        label: 'Design' },
  { id: 'Planning',      label: 'Planning' },
  { id: 'Communication', label: 'Communication' },
  { id: 'Productivity',  label: 'Productivity' },
  { id: 'DevOps',        label: 'DevOps' },
  { id: 'AI & ML',       label: 'AI & ML' },
  { id: 'Security',      label: 'Security' },
  { id: 'Business',      label: 'Business' },
]

/* ── Icons ── */
function SearchIcon() {
  return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
}
function CodeIcon() {
  return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
}
function PencilIcon() {
  return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>
}
function BarChartIcon() {
  return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="20" x2="12" y2="10"/><line x1="18" y1="20" x2="18" y2="4"/><line x1="6" y1="20" x2="6" y2="16"/></svg>
}
function PaletteIcon() {
  return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="13.5" cy="6.5" r=".5" fill="currentColor"/><circle cx="17.5" cy="10.5" r=".5" fill="currentColor"/><circle cx="8.5" cy="7.5" r=".5" fill="currentColor"/><circle cx="6.5" cy="12.5" r=".5" fill="currentColor"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/></svg>
}
function CalendarIcon() {
  return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
}
function MessageIcon() {
  return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z"/></svg>
}
function ZapIcon() {
  return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
}
function ServerIcon() {
  return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="8" rx="2" ry="2"/><rect x="2" y="14" width="20" height="8" rx="2" ry="2"/><line x1="6" y1="6" x2="6.01" y2="6"/><line x1="6" y1="18" x2="6.01" y2="18"/></svg>
}
function CpuIcon() {
  return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><line x1="9" y1="1" x2="9" y2="4"/><line x1="15" y1="1" x2="15" y2="4"/><line x1="9" y1="20" x2="9" y2="23"/><line x1="15" y1="20" x2="15" y2="23"/><line x1="20" y1="9" x2="23" y2="9"/><line x1="20" y1="14" x2="23" y2="14"/><line x1="1" y1="9" x2="4" y2="9"/><line x1="1" y1="14" x2="4" y2="14"/></svg>
}
function ShieldIcon() {
  return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
}
function BriefcaseIcon() {
  return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
}
function GridIcon() {
  return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
}
function VerifiedIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="text-orange-500 shrink-0">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
      <polyline points="9 12 11 14 15 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}
function StarIcon() {
  return <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
}
function DownloadIcon() {
  return <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
}
function PersonIcon() {
  return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
}
function PlusCircleIcon() {
  return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
}
function GithubIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
    </svg>
  )
}

const CAT_ICONS: Record<string, React.ReactNode> = {
  'Research':      <SearchIcon />,
  'Coding':        <CodeIcon />,
  'Writing':       <PencilIcon />,
  'Data & Analytics': <BarChartIcon />,
  'Design':        <PaletteIcon />,
  'Planning':      <CalendarIcon />,
  'Communication': <MessageIcon />,
  'Productivity':  <ZapIcon />,
  'DevOps':        <ServerIcon />,
  'AI & ML':       <CpuIcon />,
  'Security':      <ShieldIcon />,
  'Business':      <BriefcaseIcon />,
}

/* ── Creator icon ── */
const CREATOR_COLORS: Record<string, string> = {
  'anthropics':  '#1a1a2e',
  'github':      '#24292f',
  'smithery-ai': '#EA580C',
}

function CreatorIcon({ creator }: { creator: string }) {
  if (creator === 'github') {
    return (
      <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 text-white" style={{ background: CREATOR_COLORS['github'] }}>
        <GithubIcon />
      </div>
    )
  }
  const bg = CREATOR_COLORS[creator] || '#6B7280'
  const letter = creator[0].toUpperCase()
  return (
    <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 text-white font-bold text-sm" style={{ background: bg }}>
      {letter}
    </div>
  )
}

/* ── Number formatting (stable server/client) ── */
function fmtNum(n: number): string {
  if (n >= 1000) {
    const k = n / 1000
    const s = k % 1 === 0 ? k.toFixed(0) : k.toFixed(1)
    return s + 'k'
  }
  return String(n)
}

/* ── Pagination ── */
function Pagination({ page, totalPages, onPage }: { page: number; totalPages: number; onPage: (p: number) => void }) {
  const items: (number | '...')[] = []
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) items.push(i)
  } else {
    items.push(1)
    if (page > 3) items.push('...')
    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) items.push(i)
    if (page < totalPages - 2) items.push('...')
    items.push(totalPages)
  }
  const btn = 'min-w-[32px] h-8 px-2 rounded-lg text-sm flex items-center justify-center transition-colors'
  return (
    <div className="flex items-center justify-center gap-1 pt-6">
      <button onClick={() => onPage(page - 1)} disabled={page === 1}
        className={`${btn} gap-1 text-stone-500 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 disabled:opacity-30 disabled:cursor-not-allowed`}>
        ‹ Previous
      </button>
      {items.map((item, i) =>
        item === '...' ? (
          <span key={`d${i}`} className="text-stone-400 px-1">…</span>
        ) : (
          <button key={item} onClick={() => onPage(item as number)}
            className={`${btn} font-medium ${item === page ? 'bg-orange-600 text-white shadow-sm' : 'text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800'}`}>
            {item}
          </button>
        )
      )}
      <button onClick={() => onPage(page + 1)} disabled={page === totalPages}
        className={`${btn} gap-1 text-stone-500 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 disabled:opacity-30 disabled:cursor-not-allowed`}>
        Next ›
      </button>
    </div>
  )
}

/* ── Main component ── */
export default function SkillsDirectory({ skills, total, initialSearch = '' }: { skills: Skill[]; total: number; initialSearch?: string }) {
  const [search, setSearch]       = useState(initialSearch)
  const [selectedCat, setSelectedCat] = useState<string | null>(null)
  const [page, setPage]           = useState(1)

  const filtered = useMemo(() => {
    let result = skills
    if (selectedCat) result = result.filter(s => s.categoria === selectedCat)
    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(s =>
        s.nombre.toLowerCase().includes(q) ||
        s.creator.toLowerCase().includes(q) ||
        s.descripcion.toLowerCase().includes(q)
      )
    }
    return result
  }, [skills, selectedCat, search])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage   = Math.min(page, totalPages)
  const visible    = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)

  const reset = () => setPage(1)
  const handleSearch = (v: string) => { setSearch(v); reset() }
  const handleCat    = (v: string | null) => { setSelectedCat(v); reset() }

  const sideLabel = 'text-xs font-semibold text-stone-400 dark:text-stone-500 uppercase tracking-widest mb-2'
  const sideBtn   = 'flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm transition-colors text-left w-full'
  const sideBtnInactive = 'text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200 hover:bg-stone-50 dark:hover:bg-stone-800/50'
  const sideBtnActive   = 'text-orange-600 dark:text-orange-500 bg-orange-50 dark:bg-orange-950/30 font-medium'

  return (
    <div className="flex flex-col gap-5">

      {/* Layout: sidebar + contenido */}
      <div className="flex gap-8 items-start">

        {/* ── Sidebar ── */}
        <div className="w-52 shrink-0 flex flex-col gap-6">

          {/* Status */}
          <div>
            <p className={sideLabel}>Status</p>
            <button className={`${sideBtn} ${sideBtnInactive} opacity-50 cursor-not-allowed`}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/><polyline points="9 12 11 14 15 10"/>
              </svg>
              <span>Verified</span>
            </button>
          </div>

          {/* Ownership */}
          <div>
            <p className={sideLabel}>Ownership</p>
            <button className={`${sideBtn} ${sideBtnInactive} opacity-50 cursor-not-allowed`}>
              <PersonIcon />
              <span>My Skills</span>
            </button>
          </div>

          {/* Advanced */}
          <div>
            <p className={sideLabel}>Advanced</p>
            <button className={`${sideBtn} ${sideBtnInactive} opacity-50 cursor-not-allowed`}>
              <PlusCircleIcon />
              <span>Namespace</span>
            </button>
          </div>

          {/* Categories */}
          <div>
            <p className={sideLabel}>Categories</p>
            <div className="flex flex-col gap-0.5">
              {CATS.map(cat => (
                <button
                  key={cat.label}
                  onClick={() => handleCat(cat.id)}
                  className={`${sideBtn} ${selectedCat === cat.id ? sideBtnActive : sideBtnInactive}`}
                >
                  <span className="shrink-0">
                    {cat.id === null ? <GridIcon /> : CAT_ICONS[cat.id]}
                  </span>
                  <span>{cat.label}</span>
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* ── Contenido principal ── */}
        <div className="flex-1 min-w-0">

          {/* Conteo */}
          <p className="text-sm text-stone-400 dark:text-stone-500 mb-4">
            <span className="text-stone-700 dark:text-stone-300 font-medium">{fmtNum(total)}</span> skills encontradas
          </p>

          {/* Lista */}
          {visible.length === 0 ? (
            <p className="text-stone-400 text-sm py-16 text-center">
              Sin resultados para &ldquo;{search}&rdquo;
            </p>
          ) : (
            <div className="flex flex-col" style={{ border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden' }}>
              {visible.map((skill, i) => (
                <div
                  key={skill.id}
                  className="flex items-start gap-4 px-5 py-4 bg-white dark:bg-[var(--card)] hover:bg-stone-50 dark:hover:bg-stone-800/30 transition-colors"
                  style={i > 0 ? { borderTop: '1px solid var(--border)' } : undefined}
                >
                  {/* Creator icon */}
                  <CreatorIcon creator={skill.creator} />

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    {/* Top row: name + stars */}
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-1.5 min-w-0 flex-wrap">
                        <span className="text-orange-600 dark:text-orange-500 font-semibold text-sm">
                          {skill.creator}/{skill.nombre}
                        </span>
                        {skill.verified && <VerifiedIcon />}
                      </div>
                      <div className="flex items-center gap-1 text-stone-400 dark:text-stone-500 text-xs shrink-0">
                        <StarIcon />
                        <span>{fmtNum(skill.stars)}</span>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-stone-600 dark:text-stone-400 text-sm mt-1 leading-relaxed line-clamp-2">
                      {skill.descripcion}
                    </p>

                    {/* Installs */}
                    <div className="flex items-center gap-1 text-stone-400 dark:text-stone-500 text-xs mt-2">
                      <DownloadIcon />
                      <span>{fmtNum(skill.installs)} installs</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <Pagination
              page={safePage}
              totalPages={totalPages}
              onPage={p => { setPage(p); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
            />
          )}

        </div>
      </div>
    </div>
  )
}
