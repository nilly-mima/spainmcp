'use client'

import { useState } from 'react'
import McpCard from '@/components/McpCard'
import { CATEGORIA_LABELS } from '@/lib/mcps-constants'
import type { Mcp } from '@/lib/mcps'

export default function McpsPageClient({
  mcps,
  categorias,
}: {
  mcps: Mcp[]
  categorias: string[]
}) {
  const [query, setQuery] = useState('')
  const [catActiva, setCatActiva] = useState<string | null>(null)

  const q = query.toLowerCase().trim()

  const filtered = mcps.filter(mcp => {
    const matchesCat = !catActiva || mcp.categoria.includes(catActiva)
    if (!q) return matchesCat
    return matchesCat && (
      mcp.nombre.toLowerCase().includes(q) ||
      mcp.descripcion_corta.toLowerCase().includes(q) ||
      mcp.descripcion_es.toLowerCase().includes(q) ||
      mcp.tags.some(t => t.includes(q)) ||
      mcp.categoria.some(c => c.includes(q)) ||
      mcp.creador.toLowerCase().includes(q)
    )
  })

  return (
    <div className="py-6">
      {/* Cabecera */}
      <div className="mb-5">
        <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-100">MCPs</h1>
        <p className="text-sm text-stone-400 dark:text-stone-500 mt-1">
          {mcps.length} servidores verificados · guías en español
        </p>
      </div>

      {/* Buscador */}
      <div className="relative mb-5">
        <svg
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none"
          width="16" height="16" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>
        <input
          type="text"
          placeholder="Buscar MCPs..."
          value={query}
          onChange={e => setQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm text-stone-700 dark:text-stone-200 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-orange-400 transition"
          style={{ background: '#FFFFFF', border: '1px solid #E8E2D9' }}
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 transition"
          >
            ✕
          </button>
        )}
      </div>

      {/* Filtros de categoría */}
      {categorias.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-5">
          <button
            onClick={() => setCatActiva(null)}
            className="text-xs px-3 py-1 rounded-full font-medium transition"
            style={
              catActiva === null
                ? { background: '#C2410C', color: '#fff', border: '1px solid #C2410C' }
                : { background: '#F5F0E8', color: '#78716C', border: '1px solid #E8E2D9' }
            }
          >
            Todos
          </button>
          {categorias.map(cat => (
            <button
              key={cat}
              onClick={() => setCatActiva(cat === catActiva ? null : cat)}
              className="text-xs px-3 py-1 rounded-full font-medium transition"
              style={
                catActiva === cat
                  ? { background: '#C2410C', color: '#fff', border: '1px solid #C2410C' }
                  : { background: '#F5F0E8', color: '#78716C', border: '1px solid #E8E2D9' }
              }
            >
              {CATEGORIA_LABELS[cat] ?? cat}
            </button>
          ))}
        </div>
      )}

      {/* Resultado */}
      {filtered.length > 0 ? (
        <>
          {(q || catActiva) && (
            <p className="text-xs text-stone-400 mb-3">
              {filtered.length} resultado{filtered.length !== 1 ? 's' : ''}
            </p>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 items-stretch">
            {filtered.map(mcp => (
              <McpCard key={mcp.id} mcp={mcp} />
            ))}
          </div>
        </>
      ) : (
        <div className="text-center py-16 text-stone-400">
          <p className="text-2xl mb-2">🔍</p>
          <p className="text-sm">Sin resultados para <span className="font-medium text-stone-500">"{query}"</span></p>
          <button
            onClick={() => { setQuery(''); setCatActiva(null) }}
            className="mt-3 text-xs text-orange-600 hover:underline"
          >
            Limpiar filtros
          </button>
        </div>
      )}
    </div>
  )
}
