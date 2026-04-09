'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import McpCatalogCard, { CatalogMcp } from '@/components/McpCatalogCard'

function GridIcon()   { return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg> }
function RemoteIcon() { return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg> }
function LocalIcon()  { return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg> }
function SearchIcon() { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg> }

function Pagination({ page, total, onChange }: { page: number; total: number; onChange: (p: number) => void }) {
  if (total <= 1) return null
  const btnBase = 'min-w-[32px] h-8 px-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center'
  const btnActive = 'bg-blue-500 text-white'
  const btnInactive = 'text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-800'
  const btnDisabled = 'text-stone-300 dark:text-stone-600 cursor-not-allowed'
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
      <button onClick={() => onChange(page - 1)} disabled={page === 1} className={`${btnBase} gap-1 px-3 ${page === 1 ? btnDisabled : btnInactive}`}>
        <span>‹</span> Anterior
      </button>
      {pages.map((p, i) =>
        p === '...' ? (
          <span key={`dots-${i}`} className="px-1 text-stone-400">···</span>
        ) : (
          <button key={p} onClick={() => onChange(p as number)} className={`${btnBase} ${p === page ? btnActive : btnInactive}`}>{p}</button>
        )
      )}
      <button onClick={() => onChange(page + 1)} disabled={page === total} className={`${btnBase} gap-1 px-3 ${page === total ? btnDisabled : btnInactive}`}>
        Siguiente <span>›</span>
      </button>
    </div>
  )
}

const PER_PAGE = 12

export default function McpCatalogPageClient({
  initialMcps,
  initialQuery = '',
}: {
  initialMcps: CatalogMcp[]
  initialQuery?: string
}) {
  const router = useRouter()
  const [mcps, setMcps] = useState<CatalogMcp[]>(initialMcps)
  const [location, setLocation] = useState<'all' | 'remote' | 'local'>('all')
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [query, setQuery] = useState(initialQuery)
  const [ms, setMs] = useState<number | null>(null)
  const t0 = useRef(typeof performance !== 'undefined' ? performance.now() : 0)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  useEffect(() => { setMs(Math.round(performance.now() - t0.current)) }, [])

  const fetchCatalog = useCallback(async (q: string) => {
    setLoading(true)
    const t = performance.now()
    try {
      const params = new URLSearchParams()
      if (q) params.set('q', q)
      params.set('pageSize', '200')
      const res = await fetch(`/api/catalog/mcps?${params}`)
      if (!res.ok) throw new Error('fetch error')
      const data = await res.json()
      setMcps(data.mcps ?? [])
      setPage(1)
    } catch {
      // keep current data on error
    } finally {
      setLoading(false)
      setMs(Math.round(performance.now() - t))
    }
  }, [])

  function handleQueryChange(v: string) {
    setQuery(v)
    router.push(v ? `/mcps?q=${encodeURIComponent(v)}` : '/mcps', { scroll: false })
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => fetchCatalog(v), 350)
  }

  const filtered = mcps.filter(m => {
    if (location === 'remote') return m.scope === 'remote' || m.scope === 'remoto'
    if (location === 'local') return m.scope === 'local'
    return true
  })

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE))
  const safePage = Math.min(page, totalPages)
  const visible = filtered.slice((safePage - 1) * PER_PAGE, safePage * PER_PAGE)

  const sideLabel = 'text-xs font-bold text-stone-600 dark:text-stone-400 uppercase tracking-widest mb-2'
  const sideBtn   = 'flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm transition-colors text-left w-full'
  const inactive  = 'text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200 hover:bg-stone-50 dark:hover:bg-stone-800/50'
  const active    = 'text-blue-600 dark:text-blue-500 bg-blue-50 dark:bg-blue-950/30 font-medium'

  return (
    <div className="py-6 flex flex-col gap-5">
      <div className="flex gap-8 items-start">

        {/* Sidebar */}
        <div className="w-52 shrink-0 flex flex-col gap-6 pl-8">
          <div>
            <p className={sideLabel}>Ubicacion</p>
            <div className="flex flex-col gap-0.5">
              <button onClick={() => { setLocation('all'); setPage(1) }} className={`${sideBtn} ${location === 'all' ? active : inactive}`}>
                <GridIcon /><span>Todos</span>
              </button>
              <button onClick={() => { setLocation('remote'); setPage(1) }} className={`${sideBtn} ${location === 'remote' ? active : inactive}`}>
                <RemoteIcon /><span>Remoto</span>
              </button>
              <button onClick={() => { setLocation('local'); setPage(1) }} className={`${sideBtn} ${location === 'local' ? active : inactive}`}>
                <LocalIcon /><span>Local</span>
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 pr-6">

          {/* Search input */}
          <div className="relative mb-4">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none">
              <SearchIcon />
            </span>
            <input
              type="search"
              value={query}
              onChange={e => handleQueryChange(e.target.value)}
              placeholder="Buscar MCP..."
              className="w-full pl-9 pr-4 py-2 text-sm bg-[var(--background)] border border-[var(--border)] rounded-lg text-[var(--foreground)] placeholder:text-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-blue-600/40"
            />
            {loading && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2">
                <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
              </span>
            )}
          </div>

          <p className="text-sm text-stone-400 dark:text-stone-500 mb-4">
            <span className="text-stone-700 dark:text-stone-300 font-medium">{filtered.length}</span> servidor{filtered.length !== 1 ? 'es' : ''} encontrado{filtered.length !== 1 ? 's' : ''}{ms !== null && <span className="ml-1">({ms}ms)</span>}
          </p>

          {visible.length > 0 ? (
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
              <p className="text-2xl mb-2">🔍</p>
              <p className="text-sm">Sin resultados con los filtros aplicados</p>
              <button
                onClick={() => { setLocation('all'); setPage(1); handleQueryChange('') }}
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
