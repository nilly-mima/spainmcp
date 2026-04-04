'use client'

import { useState, useMemo } from 'react'
import { ImportedMcp } from '@/lib/mcps'
import ImportedMcpCard from './ImportedMcpCard'

const PAGE_SIZE = 21

const CAT_LABELS: Record<string, string> = {
  'desarrollo': 'Desarrollo',
  'otros': 'Otros',
  'finanzas': 'Finanzas',
  'productividad': 'Productividad',
  'busqueda': 'Búsqueda',
  'bases-de-datos': 'Bases de datos',
  'seguridad': 'Seguridad',
  'datos': 'Datos',
  'comunicacion': 'Comunicación',
  'cloud': 'Cloud',
  'agregadores': 'Agregadores',
  'automatizacion': 'Automatización',
  'arte': 'Arte',
  'gaming': 'Gaming',
  'archivos': 'Archivos',
  'multimedia': 'Multimedia',
  'infraestructura': 'Infraestructura',
  'lenguaje': 'Lenguaje',
  'legal': 'Legal',
  'marketing': 'Marketing',
  'noticias': 'Noticias',
  'scraping': 'Scraping',
  'salud': 'Salud',
  'viajes': 'Viajes',
  'educacion': 'Educación',
  'entretenimiento': 'Entretenimiento',
  'redes-sociales': 'Redes sociales',
}

function GlobeIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10"/>
      <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
    </svg>
  )
}
function HomeIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
      <polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
  )
}
function CheckIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  )
}

function Pagination({
  page, totalPages, onPage,
}: {
  page: number
  totalPages: number
  onPage: (p: number) => void
}) {
  const items: (number | '...')[] = []

  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) items.push(i)
  } else {
    items.push(1)
    if (page > 3) items.push('...')
    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) {
      items.push(i)
    }
    if (page < totalPages - 2) items.push('...')
    items.push(totalPages)
  }

  const btnBase = 'min-w-[32px] h-8 px-2 rounded-lg text-sm transition-colors flex items-center justify-center'

  return (
    <div className="flex items-center justify-center gap-1 pt-4">
      <button
        onClick={() => onPage(page - 1)}
        disabled={page === 1}
        className={`${btnBase} text-stone-500 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 disabled:opacity-30 disabled:cursor-not-allowed gap-1`}
      >
        ‹ Anterior
      </button>

      {items.map((item, i) =>
        item === '...' ? (
          <span key={`dot-${i}`} className="text-stone-400 px-1">…</span>
        ) : (
          <button
            key={item}
            onClick={() => onPage(item as number)}
            className={`${btnBase} font-medium ${
              item === page
                ? 'bg-orange-600 text-white shadow-sm'
                : 'text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800'
            }`}
          >
            {item}
          </button>
        )
      )}

      <button
        onClick={() => onPage(page + 1)}
        disabled={page === totalPages}
        className={`${btnBase} text-stone-500 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 disabled:opacity-30 disabled:cursor-not-allowed gap-1`}
      >
        Siguiente ›
      </button>
    </div>
  )
}

export default function ImportedDirectory({ mcps }: { mcps: ImportedMcp[]; catLabels?: Record<string, string> }) {
  const [search, setSearch]       = useState('')
  const [location, setLocation]   = useState<'all' | 'remote' | 'local'>('all')
  const [selectedCat, setSelectedCat] = useState<string | null>(null)
  const [page, setPage]           = useState(1)

  const catCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    mcps.forEach(m => { counts[m.categoria] = (counts[m.categoria] || 0) + 1 })
    return Object.entries(counts).sort((a, b) => b[1] - a[1])
  }, [mcps])

  const filtered = useMemo(() => {
    let result = mcps
    if (location === 'remote') result = result.filter(m => m.scope === 'cloud')
    if (location === 'local')  result = result.filter(m => m.scope === 'local')
    if (selectedCat)           result = result.filter(m => m.categoria === selectedCat)
    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(m =>
        m.nombre.toLowerCase().includes(q) ||
        m.descripcion_en.toLowerCase().includes(q)
      )
    }
    return result
  }, [mcps, location, selectedCat, search])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage   = Math.min(page, totalPages)
  const visible    = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)

  const reset = () => setPage(1)
  const handleSearch   = (v: string) => { setSearch(v); reset() }
  const handleLocation = (v: typeof location) => { setLocation(v); reset() }
  const handleCat      = (v: string | null) => { setSelectedCat(v); reset() }

  const remoteCount = useMemo(() => mcps.filter(m => m.scope === 'cloud').length, [mcps])
  const localCount  = useMemo(() => mcps.filter(m => m.scope === 'local').length,  [mcps])

  return (
    <div className="flex flex-col gap-5">

      {/* Search bar prominente */}
      <div className="relative">
        <svg
          className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 dark:text-stone-500 pointer-events-none"
          width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
        >
          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
        </svg>
        <input
          type="text"
          placeholder="Buscar MCPs..."
          value={search}
          onChange={e => handleSearch(e.target.value)}
          className="w-full pl-11 pr-4 py-3 rounded-xl bg-white dark:bg-[var(--card)] text-stone-800 dark:text-stone-200 placeholder-stone-400 dark:placeholder-stone-500 outline-none focus:ring-2 focus:ring-orange-300 dark:focus:ring-orange-800 text-sm"
          style={{ border: '1px solid var(--border)' }}
        />
      </div>

      {/* Layout: sidebar + contenido */}
      <div className="flex gap-8 items-start">

        {/* ── Sidebar ── */}
        <div className="w-52 shrink-0 flex flex-col gap-6">

          {/* Location */}
          <div>
            <p className="text-xs font-semibold text-stone-400 dark:text-stone-500 uppercase tracking-widest mb-2">Location</p>
            <div className="flex flex-col gap-0.5">
              {([
                { value: 'remote', label: 'Remote', icon: <GlobeIcon />, count: remoteCount },
                { value: 'local',  label: 'Local',  icon: <HomeIcon />,  count: localCount  },
              ] as const).map(opt => (
                <button
                  key={opt.value}
                  onClick={() => handleLocation(location === opt.value ? 'all' : opt.value)}
                  className={`flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm transition-colors text-left w-full ${
                    location === opt.value
                      ? 'text-orange-600 dark:text-orange-500 bg-orange-50 dark:bg-orange-950/30'
                      : 'text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200 hover:bg-stone-50 dark:hover:bg-stone-800/50'
                  }`}
                >
                  <span className="shrink-0">{opt.icon}</span>
                  <span>{opt.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Status */}
          <div>
            <p className="text-xs font-semibold text-stone-400 dark:text-stone-500 uppercase tracking-widest mb-2">Status</p>
            <button className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200 hover:bg-stone-50 dark:hover:bg-stone-800/50 transition-colors w-full text-left opacity-50 cursor-not-allowed">
              <CheckIcon />
              <span>Verified</span>
            </button>
          </div>

          {/* Categories */}
          <div>
            <p className="text-xs font-semibold text-stone-400 dark:text-stone-500 uppercase tracking-widest mb-2">Categories</p>
            <div className="flex flex-col gap-0.5">
              <button
                onClick={() => handleCat(null)}
                className={`flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm transition-colors text-left w-full ${
                  selectedCat === null
                    ? 'text-orange-600 dark:text-orange-500 bg-orange-50 dark:bg-orange-950/30 font-medium'
                    : 'text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200 hover:bg-stone-50 dark:hover:bg-stone-800/50'
                }`}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
                  <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
                </svg>
                All
              </button>
              {catCounts.map(([cat]) => (
                <button
                  key={cat}
                  onClick={() => handleCat(selectedCat === cat ? null : cat)}
                  className={`px-2 py-1.5 rounded-lg text-sm transition-colors text-left w-full truncate ${
                    selectedCat === cat
                      ? 'text-orange-600 dark:text-orange-500 bg-orange-50 dark:bg-orange-950/30 font-medium'
                      : 'text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200 hover:bg-stone-50 dark:hover:bg-stone-800/50'
                  }`}
                >
                  {CAT_LABELS[cat] || cat}
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* ── Contenido principal ── */}
        <div className="flex-1 min-w-0">

          {/* Conteo */}
          <p className="text-sm text-stone-400 dark:text-stone-500 mb-4">
            <span className="text-stone-700 dark:text-stone-300 font-medium">{filtered.length}</span> servidores encontrados
          </p>

          {/* Grid */}
          {filtered.length === 0 ? (
            <p className="text-stone-400 text-sm py-16 text-center">
              Sin resultados para &ldquo;{search}&rdquo;
            </p>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {visible.map(mcp => (
                  <ImportedMcpCard key={mcp.id + mcp.github_url} mcp={mcp} />
                ))}
              </div>

              {totalPages > 1 && (
                <Pagination
                  page={safePage}
                  totalPages={totalPages}
                  onPage={p => { setPage(p); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
                />
              )}
            </>
          )}

        </div>
      </div>
    </div>
  )
}
