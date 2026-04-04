'use client'

import { useState, useMemo } from 'react'
import { ImportedMcp } from '@/lib/mcps'
import ImportedMcpCard from './ImportedMcpCard'

const PAGE_SIZE = 24

export default function ImportedDirectory({
  mcps,
  catLabels,
}: {
  mcps: ImportedMcp[]
  catLabels: Record<string, string>
}) {
  const [search, setSearch] = useState('')
  const [selectedCat, setSelectedCat] = useState<string | null>(null)
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)

  // Categorías ordenadas por cantidad (mayor primero)
  const catCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    mcps.forEach(m => { counts[m.categoria] = (counts[m.categoria] || 0) + 1 })
    return Object.entries(counts).sort((a, b) => b[1] - a[1])
  }, [mcps])

  // Filtrar por búsqueda y categoría
  const filtered = useMemo(() => {
    let result = mcps
    if (selectedCat) result = result.filter(m => m.categoria === selectedCat)
    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(m =>
        m.nombre.toLowerCase().includes(q) ||
        m.descripcion_en.toLowerCase().includes(q)
      )
    }
    return result
  }, [mcps, selectedCat, search])

  // Reset paginación cuando cambia el filtro
  const handleSearch = (val: string) => { setSearch(val); setVisibleCount(PAGE_SIZE) }
  const handleCat = (cat: string | null) => { setSelectedCat(cat); setVisibleCount(PAGE_SIZE) }

  const visible = filtered.slice(0, visibleCount)
  const hasMore = visibleCount < filtered.length

  return (
    <div className="flex flex-col gap-4">

      {/* Buscador */}
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-sm">🔍</span>
        <input
          type="text"
          placeholder="Buscar servidores MCP..."
          value={search}
          onChange={e => handleSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white text-sm text-stone-700 placeholder-stone-400 outline-none focus:ring-2 focus:ring-orange-200"
          style={{ border: '1px solid #E8E2D9' }}
        />
      </div>

      {/* Layout: sidebar + grid */}
      <div className="flex gap-6 items-start">

        {/* Sidebar categorías */}
        <div className="w-44 shrink-0 flex flex-col gap-0.5">
          <button
            onClick={() => handleCat(null)}
            className={`text-left px-3 py-1.5 rounded-lg text-sm transition-colors flex items-center justify-between gap-2 ${
              selectedCat === null
                ? 'bg-orange-50 text-orange-700 font-medium'
                : 'text-stone-500 hover:text-stone-800 hover:bg-stone-50'
            }`}
          >
            <span>Todos</span>
            <span className="text-xs text-stone-300">{mcps.length}</span>
          </button>
          {catCounts.map(([cat, count]) => (
            <button
              key={cat}
              onClick={() => handleCat(cat)}
              className={`text-left px-3 py-1.5 rounded-lg text-sm transition-colors flex items-center justify-between gap-2 ${
                selectedCat === cat
                  ? 'bg-orange-50 text-orange-700 font-medium'
                  : 'text-stone-500 hover:text-stone-800 hover:bg-stone-50'
              }`}
            >
              <span className="truncate">{catLabels[cat] || cat}</span>
              <span className="text-xs text-stone-300 shrink-0">{count}</span>
            </button>
          ))}
        </div>

        {/* Grid de cards */}
        <div className="flex-1 flex flex-col gap-4">
          {filtered.length === 0 ? (
            <p className="text-stone-400 text-sm py-8 text-center">
              Sin resultados para &ldquo;{search}&rdquo;
            </p>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {visible.map(mcp => (
                  <ImportedMcpCard key={mcp.id + mcp.github_url} mcp={mcp} />
                ))}
              </div>
              {hasMore && (
                <button
                  onClick={() => setVisibleCount(v => v + PAGE_SIZE)}
                  className="text-sm text-stone-400 hover:text-orange-600 transition-colors text-center py-2.5 rounded-xl"
                  style={{ border: '1px solid #E8E2D9', background: '#FAFAF9' }}
                >
                  ↓ Ver {Math.min(PAGE_SIZE, filtered.length - visibleCount)} más · {filtered.length - visibleCount} restantes
                </button>
              )}
              <p className="text-xs text-stone-300 text-right">
                {visible.length} de {filtered.length} servidores
              </p>
            </>
          )}
        </div>

      </div>
    </div>
  )
}
