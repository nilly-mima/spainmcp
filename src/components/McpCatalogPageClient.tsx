'use client'

import { useState, useMemo, useEffect, useRef } from 'react'
import McpCatalogCard, { CatalogMcp } from '@/components/McpCatalogCard'

/* ── Icons ── */
function GridIcon()    { return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg> }
function RemoteIcon()  { return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg> }
function LocalIcon()   { return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg> }
function VerifiedIcon(){ return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="8 12 11 15 16 9"/></svg> }
function UserIcon()    { return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> }
function PlusIcon()    { return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg> }

const CATEGORIES: { id: string; label: string; icon: React.ReactNode }[] = [
  { id: 'all',                    label: 'Todos',                   icon: <GridIcon /> },
  { id: 'búsqueda',              label: 'Búsqueda Web',            icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg> },
  { id: 'automatización',        label: 'Automatización Web',      icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg> },
  { id: 'investigación',         label: 'Investigación Académica', icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg> },
  { id: 'finanzas',              label: 'Finanzas',                icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg> },
  { id: 'razonamiento',          label: 'Razonamiento',            icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg> },
  { id: 'desarrollo',            label: 'Herramientas Dev',        icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg> },
]

/* ── Query parsing (same system as skills) ── */
function parseQuery(q: string) {
  const tokens = q.split(/\s+/)
  let verified = false
  let category: string | null = null
  let location: string | null = null
  let namespace: string | null = null
  let ownerMe = false
  const textParts: string[] = []

  for (const t of tokens) {
    if (t === 'is:verified') verified = true
    else if (t === 'owner:me') ownerMe = true
    else if (t.startsWith('category:')) category = t.slice('category:'.length)
    else if (t.startsWith('location:')) location = t.slice('location:'.length)
    else if (t.startsWith('namespace:')) namespace = t.slice('namespace:'.length)
    else if (t.trim()) textParts.push(t)
  }

  return { verified, category, location, namespace, ownerMe, text: textParts.join(' ') }
}

function toggleToken(query: string, token: string): string {
  if (query.includes(token)) {
    return query.replace(token, '').replace(/\s+/g, ' ').trim()
  }
  return (query + ' ' + token).trim()
}

/* ── Chip ── */
function Chip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-medium">
      {label}
      <button onClick={onRemove} className="hover:text-blue-800 dark:hover:text-blue-200 leading-none" aria-label={`Eliminar filtro ${label}`}>×</button>
    </span>
  )
}

/* ── Pagination ── */
function Pagination({ page, total, onChange }: { page: number; total: number; onChange: (p: number) => void }) {
  if (total <= 1) return null
  const btn = 'min-w-[32px] h-8 px-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center'
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
      <button onClick={() => onChange(page - 1)} disabled={page === 1} className={`${btn} gap-1 px-3 ${page === 1 ? 'text-stone-300 dark:text-stone-600 cursor-not-allowed' : 'text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-800'}`}>
        ‹ Anterior
      </button>
      {pages.map((p, i) =>
        p === '...' ? (
          <span key={`d${i}`} className="px-1 text-stone-400">…</span>
        ) : (
          <button key={p} onClick={() => onChange(p as number)} className={`${btn} ${p === page ? 'bg-blue-500 text-white' : 'text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-800'}`}>{p}</button>
        )
      )}
      <button onClick={() => onChange(page + 1)} disabled={page === total} className={`${btn} gap-1 px-3 ${page === total ? 'text-stone-300 dark:text-stone-600 cursor-not-allowed' : 'text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-800'}`}>
        Siguiente ›
      </button>
    </div>
  )
}

const PER_PAGE = 24

export default function McpCatalogPageClient({
  initialQuery = '',
  initialPage = 1,
}: {
  initialQuery?: string
  initialPage?: number
}) {
  const [query, setQuery] = useState(initialQuery)
  const [page, setPage] = useState(initialPage)
  const [ms, setMs] = useState<number | null>(null)
  const [mcps, setMcps] = useState<CatalogMcp[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  useEffect(() => {
    setQuery(initialQuery)
    setPage(initialPage)
  }, [initialQuery, initialPage])

  // Listen for header-search-set events
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<string>).detail
      setQuery(prev => {
        if (prev.includes(detail.trim())) return prev
        return (prev + ' ' + detail).trim()
      })
      setPage(1)
    }
    window.addEventListener('header-search-set', handler)
    return () => window.removeEventListener('header-search-set', handler)
  }, [])

  const parsed = useMemo(() => parseQuery(query), [query])

  // Fetch from API + sync URL
  useEffect(() => {
    // Update URL without navigation
    const urlParams = new URLSearchParams()
    if (query.trim()) urlParams.set('q', query.trim())
    if (page > 1) urlParams.set('page', String(page))
    const qs = urlParams.toString()
    window.history.replaceState({}, '', `/mcps${qs ? '?' + qs : ''}`)

    // Abort previous inflight
    if (abortRef.current) abortRef.current.abort()
    const ac = new AbortController()
    abortRef.current = ac

    const { category, location, namespace, text } = parsed

    const api = new URLSearchParams()
    api.set('page', String(page))
    api.set('pageSize', String(PER_PAGE))
    if (category) api.set('categoria', category)
    if (location === 'remote') api.set('scope', 'remote')
    if (location === 'local') api.set('scope', 'local')
    if (namespace) api.set('namespace', namespace)
    if (text) api.set('q', text)
    // verified + ownerMe are no-ops server-side (no schema support yet) —
    // keep chips for UX but they don't narrow results.

    setLoading(true)
    setError(null)
    const t0 = performance.now()

    fetch(`/api/catalog/mcps?${api.toString()}`, { signal: ac.signal })
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.json()
      })
      .then((data: { mcps: CatalogMcp[]; pagination: { totalCount: number } }) => {
        setMcps(data.mcps || [])
        setTotalCount(data.pagination?.totalCount ?? 0)
        setMs(Math.round(performance.now() - t0))
        setLoading(false)
      })
      .catch(err => {
        if (err.name === 'AbortError') return
        console.error('mcps fetch error', err)
        setError('No se pudieron cargar los MCPs')
        setLoading(false)
      })

    return () => { ac.abort() }
  }, [query, page, parsed])

  const totalPages = Math.max(1, Math.ceil(totalCount / PER_PAGE))
  const safePage = Math.min(page, totalPages)
  const visible = mcps

  const updateQuery = (newQuery: string) => { setQuery(newQuery); setPage(1) }

  const sideLabel = 'text-xs font-bold text-stone-600 dark:text-stone-400 uppercase tracking-widest mb-2'
  const sideBtn   = 'flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm transition-colors text-left w-full'
  const inactive  = 'text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200 hover:bg-stone-50 dark:hover:bg-stone-800/50'
  const active    = 'text-blue-600 dark:text-blue-500 bg-blue-50 dark:bg-blue-950/30 font-medium'
  const divider   = <div className="h-px bg-stone-200 dark:bg-stone-700 my-1" />

  return (
    <div className="py-6 flex flex-col gap-5">
      <div className="flex gap-8 items-start">

        {/* ── Sidebar ── */}
        <div className="w-52 shrink-0 flex flex-col pl-8">

          {/* Ubicación */}
          <div className="py-4">
            <p className={sideLabel}>Ubicación</p>
            <div className="flex flex-col gap-0.5">
              <button onClick={() => updateQuery(toggleToken(query.replace(/location:\S+/g, '').trim(), 'location:remote'))} className={`${sideBtn} ${parsed.location === 'remote' ? active : inactive}`}>
                <RemoteIcon /><span>Remoto</span>
              </button>
              <button onClick={() => updateQuery(toggleToken(query.replace(/location:\S+/g, '').trim(), 'location:local'))} className={`${sideBtn} ${parsed.location === 'local' ? active : inactive}`}>
                <LocalIcon /><span>Local</span>
              </button>
            </div>
          </div>

          {divider}

          {/* Estado */}
          <div className="py-4">
            <p className={sideLabel}>Estado</p>
            <button onClick={() => updateQuery(toggleToken(query, 'is:verified'))} className={`${sideBtn} ${parsed.verified ? active : inactive}`}>
              <VerifiedIcon /><span>Verificado</span>
            </button>
          </div>

          {divider}

          {/* Propiedad */}
          <div className="py-4">
            <p className={sideLabel}>Propiedad</p>
            <button onClick={() => updateQuery(toggleToken(query, 'owner:me'))} className={`${sideBtn} ${parsed.ownerMe ? active : inactive}`}>
              <UserIcon /><span>Mis Servidores</span>
            </button>
          </div>

          {divider}

          {/* Avanzado */}
          <div className="py-4">
            <p className={sideLabel}>Avanzado</p>
            <button
              onClick={() => window.dispatchEvent(new CustomEvent('header-search-set', { detail: 'namespace:' }))}
              className={`${sideBtn} ${parsed.namespace !== null ? active : inactive}`}
            >
              <PlusIcon /><span>Namespace</span>
            </button>
          </div>

          {divider}

          {/* Categorías */}
          <div className="py-4">
            <p className={sideLabel}>Categorías</p>
            <div className="flex flex-col gap-0.5">
              {CATEGORIES.map(cat => {
                const isActive = cat.id === 'all'
                  ? parsed.category === null
                  : query.includes(`category:${cat.id}`)
                return (
                  <button
                    key={cat.id}
                    onClick={() => {
                      if (cat.id === 'all') {
                        updateQuery(query.replace(/category:\S+/g, '').replace(/\s+/g, ' ').trim())
                      } else {
                        updateQuery(toggleToken(
                          query.replace(/category:\S+/g, '').replace(/\s+/g, ' ').trim(),
                          `category:${cat.id}`
                        ))
                      }
                    }}
                    className={`${sideBtn} ${isActive ? active : inactive}`}
                  >
                    {cat.icon}<span>{cat.label}</span>
                  </button>
                )
              })}
            </div>
          </div>

        </div>

        {/* ── Contenido principal ── */}
        <div className="flex-1 min-w-0 pr-6">

          {/* Conteo + chips */}
          <div className="flex items-center flex-wrap gap-2 mb-4">
            <p className="text-sm text-stone-400 dark:text-stone-500">
              {loading ? (
                <span className="text-stone-500 dark:text-stone-400">Cargando…</span>
              ) : (
                <>
                  <span className="text-stone-700 dark:text-stone-300 font-medium">{totalCount}</span> servidor{totalCount !== 1 ? 'es' : ''} encontrado{totalCount !== 1 ? 's' : ''}{ms !== null && <span className="ml-1">({ms}ms)</span>}
                </>
              )}
            </p>
            {parsed.location && (
              <Chip label={`location:${parsed.location}`} onRemove={() => updateQuery(query.replace(/location:\S+/g, '').trim())} />
            )}
            {parsed.verified && (
              <Chip label="is:verified" onRemove={() => updateQuery(toggleToken(query, 'is:verified'))} />
            )}
            {parsed.category && (
              <Chip label={`category:${parsed.category}`} onRemove={() => updateQuery(query.replace(/category:\S+/g, '').trim())} />
            )}
            {parsed.namespace && (
              <Chip label={`namespace:${parsed.namespace}`} onRemove={() => updateQuery(query.replace(/namespace:\S+/g, '').trim())} />
            )}
            {parsed.ownerMe && (
              <Chip label="owner:me" onRemove={() => updateQuery(toggleToken(query, 'owner:me'))} />
            )}
            {parsed.text && (
              <Chip label={`"${parsed.text}"`} onRemove={() => {
                const newQ = parsed.text.split(' ').reduce((acc, word) => toggleToken(acc, word), query)
                updateQuery(newQ)
              }} />
            )}
          </div>

          {error ? (
            <p className="text-red-500 text-sm py-16 text-center">{error}</p>
          ) : loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 items-stretch">
              {Array.from({ length: PER_PAGE }).map((_, i) => (
                <div key={i} className="rounded-xl p-3 h-[140px] border border-gray-200 dark:border-gray-700/50 animate-pulse bg-gray-50 dark:bg-white/5" />
              ))}
            </div>
          ) : visible.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 items-stretch">
                {visible.map(mcp => <McpCatalogCard key={mcp.id} mcp={mcp} />)}
              </div>
              <Pagination
                page={safePage}
                total={totalPages}
                onChange={p => { setPage(p); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
              />
            </>
          ) : (
            <div className="text-center py-16 text-stone-400">
              <p className="text-2xl mb-2">&#128269;</p>
              <p className="text-sm">Sin resultados con los filtros aplicados</p>
              <button
                onClick={() => updateQuery('')}
                className="mt-3 text-xs text-blue-600 hover:underline"
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
