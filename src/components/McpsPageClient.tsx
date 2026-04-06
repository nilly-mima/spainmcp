'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import McpCard from '@/components/McpCard'
import { CATEGORIA_LABELS } from '@/lib/mcps-constants'
import type { Mcp } from '@/lib/mcps'

/* ── Icons ── */
function GridIcon()   { return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg> }
function CheckIcon()  { return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="9 12 11 14 15 10"/></svg> }
function NsIcon()     { return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg> }
function PersonIcon()  { return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> }
function RemoteIcon() { return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg> }
function LocalIcon()  { return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg> }

const CAT_ICONS: Record<string, React.ReactNode> = {
  'web-search':         <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>,
  'browser-automation': <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>,
  'academic-research':  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>,
  'finance':            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>,
  'reasoning':          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 4.44-1.04Z"/><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-4.44-1.04Z"/></svg>,
  'dev-tools':          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>,
}

function Pagination({ page, total, onChange }: { page: number; total: number; onChange: (p: number) => void }) {
  if (total <= 1) return null

  const btnBase = 'min-w-[32px] h-8 px-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center'
  const btnActive = 'bg-orange-500 text-white'
  const btnInactive = 'text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-800'
  const btnDisabled = 'text-stone-300 dark:text-stone-600 cursor-not-allowed'

  // Páginas a mostrar: siempre 1, current±1, last, con "..." entre huecos
  const pages: (number | '...')[] = []
  const add = (n: number) => { if (!pages.includes(n)) pages.push(n) }
  add(1)
  if (page > 3) pages.push('...')
  if (page > 2) add(page - 1)
  add(page)
  if (page < total - 1) add(page + 1)
  if (page < total - 2) pages.push('...')
  add(total)

  return (
    <div className="flex items-center justify-center gap-1 mt-8">
      <button
        onClick={() => onChange(page - 1)}
        disabled={page === 1}
        className={`${btnBase} gap-1 px-3 ${page === 1 ? btnDisabled : btnInactive}`}
      >
        <span>‹</span> Anterior
      </button>

      {pages.map((p, i) =>
        p === '...' ? (
          <span key={`dots-${i}`} className="px-1 text-stone-400">···</span>
        ) : (
          <button
            key={p}
            onClick={() => onChange(p as number)}
            className={`${btnBase} ${p === page ? btnActive : btnInactive}`}
          >
            {p}
          </button>
        )
      )}

      <button
        onClick={() => onChange(page + 1)}
        disabled={page === total}
        className={`${btnBase} gap-1 px-3 ${page === total ? btnDisabled : btnInactive}`}
      >
        Siguiente <span>›</span>
      </button>
    </div>
  )
}

export default function McpsPageClient({
  mcps,
  categorias,
  initialQuery = '',
}: {
  mcps: Mcp[]
  categorias: string[]
  initialQuery?: string
}) {
  const router = useRouter()
  const [catActiva, setCatActiva]      = useState<string | null>(null)
  const [soloVerificado, setSoloVerif] = useState(false)
  const [location, setLocation]        = useState<'all' | 'remote' | 'local'>('all')
  const [page, setPage]                = useState(1)
  const [ms, setMs]                    = useState<number | null>(null)
  const PER_PAGE = 12
  const t0 = useRef(typeof performance !== 'undefined' ? performance.now() : 0)
  useEffect(() => { setMs(Math.round(performance.now() - t0.current)) }, [])

  // Parse namespace: prefix
  const raw = initialQuery.toLowerCase().trim()
  const isNamespace = raw.startsWith('namespace:')
  const namespaceQuery = isNamespace ? raw.slice('namespace:'.length).trim() : ''
  const textQuery      = isNamespace ? '' : raw

  const filtered = mcps.filter(mcp => {
    if (soloVerificado && !mcp.verificado) return false
    if (location === 'remote' && mcp.instalacion_npx?.includes('localhost')) return false
    if (location === 'local'  && !mcp.instalacion_npx?.includes('localhost')) return false
    if (catActiva && !mcp.categoria.includes(catActiva)) return false
    if (isNamespace) return mcp.creador.toLowerCase().includes(namespaceQuery)
    if (!textQuery) return true
    return (
      mcp.nombre.toLowerCase().includes(textQuery) ||
      mcp.descripcion_corta.toLowerCase().includes(textQuery) ||
      mcp.descripcion_es.toLowerCase().includes(textQuery) ||
      mcp.tags.some(t => t.includes(textQuery)) ||
      mcp.categoria.some(c => c.includes(textQuery)) ||
      mcp.creador.toLowerCase().includes(textQuery)
    )
  })

  const handleNamespace = () => {
    // Navega + dispara evento para que HeaderSearch reciba el foco
    router.push('/mcps?q=namespace:')
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('header-search-set', { detail: 'namespace:' }))
    }
  }

  const sideLabel = 'text-xs font-bold text-stone-600 dark:text-stone-400 uppercase tracking-widest mb-2'
  const sideBtn   = 'flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm transition-colors text-left w-full'
  const inactive  = 'text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200 hover:bg-stone-50 dark:hover:bg-stone-800/50'
  const active    = 'text-orange-600 dark:text-orange-500 bg-orange-50 dark:bg-orange-950/30 font-medium'

  return (
    <div className="py-6 flex flex-col gap-5">
      <div className="flex gap-8 items-start">

        {/* ── Sidebar ── */}
        <div className="w-52 shrink-0 flex flex-col gap-6">

          {/* Location */}
          <div>
            <p className={sideLabel}>Ubicación</p>
            <div className="flex flex-col gap-0.5">
              <button onClick={() => setLocation('remote')} className={`${sideBtn} ${location === 'remote' ? active : inactive}`}>
                <RemoteIcon />
                <span>Remoto</span>
              </button>
              <button onClick={() => setLocation('local')} className={`${sideBtn} ${location === 'local' ? active : inactive}`}>
                <LocalIcon />
                <span>Local</span>
              </button>
            </div>
          </div>

          {/* Propiedad */}
          <div>
            <p className={sideLabel}>Propiedad</p>
            <button className={`${sideBtn} ${inactive}`}>
              <PersonIcon />
              <span>Mis Servidores</span>
            </button>
          </div>

          {/* Estado */}
          <div>
            <p className={sideLabel}>Estado</p>
            <button onClick={() => setSoloVerif(v => !v)} className={`${sideBtn} ${soloVerificado ? active : inactive}`}>
              <CheckIcon />
              <span>Verificado</span>
            </button>
          </div>

          {/* Advanced */}
          <div>
            <p className={sideLabel}>Avanzado</p>
            <button onClick={handleNamespace} className={`${sideBtn} ${isNamespace ? active : inactive}`}>
              <NsIcon />
              <span>Espacio de nombres</span>
            </button>
          </div>

          {/* Categorías */}
          <div>
            <p className={sideLabel}>Categorías</p>
            <div className="flex flex-col gap-0.5">
              <button onClick={() => setCatActiva(null)} className={`${sideBtn} ${catActiva === null ? active : inactive}`}>
                <GridIcon />
                <span>Todos</span>
              </button>
              {categorias.map(cat => (
                <button
                  key={cat}
                  onClick={() => setCatActiva(cat === catActiva ? null : cat)}
                  className={`${sideBtn} ${catActiva === cat ? active : inactive}`}
                >
                  <span className="shrink-0">{CAT_ICONS[cat] ?? <GridIcon />}</span>
                  <span>{CATEGORIA_LABELS[cat] ?? cat}</span>
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* ── Contenido ── */}
        <div className="flex-1 min-w-0">
          <p className="text-sm text-stone-400 dark:text-stone-500 mb-4">
            <span className="text-stone-700 dark:text-stone-300 font-medium">{filtered.length}</span> servidor{filtered.length !== 1 ? 'es' : ''} encontrado{filtered.length !== 1 ? 's' : ''}{ms !== null && <span className="ml-1">({ms}ms)</span>}
          </p>

          {filtered.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 items-stretch">
                {filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE).map(mcp => <McpCard key={mcp.id} mcp={mcp} />)}
              </div>
              <Pagination
                page={page}
                total={Math.ceil(filtered.length / PER_PAGE)}
                onChange={p => { setPage(p); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
              />
            </>
          ) : (
            <div className="text-center py-16 text-stone-400">
              <p className="text-2xl mb-2">🔍</p>
              <p className="text-sm">Sin resultados con los filtros aplicados</p>
              <button
                onClick={() => { setCatActiva(null); setSoloVerif(false) }}
                className="mt-3 text-xs text-orange-600 hover:underline"
              >
                Limpiar filtros
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
