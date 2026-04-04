import Link from 'next/link'
import { Mcp } from '@/lib/mcps'

const COLORS = [
  'bg-orange-100 text-orange-700',
  'bg-blue-100 text-blue-700',
  'bg-green-100 text-green-700',
  'bg-purple-100 text-purple-700',
  'bg-amber-100 text-amber-700',
  'bg-rose-100 text-rose-700',
]

function McpListItem({ mcp, faded = false }: { mcp: Mcp; faded?: boolean }) {
  const initials = mcp.nombre.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
  const color = COLORS[mcp.nombre.charCodeAt(0) % COLORS.length]

  return (
    <Link
      href={`/mcps/${mcp.id}`}
      className={`block group transition-opacity ${faded ? 'opacity-30 pointer-events-none' : ''}`}
    >
      <div className="flex flex-col gap-1.5 py-4" style={{ borderBottom: '1px solid #E8E2D9' }}>
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className={`w-7 h-7 rounded-md flex items-center justify-center text-[11px] font-bold shrink-0 ${color}`}>
              {initials}
            </div>
            <span className="text-sm font-medium text-orange-600 group-hover:text-orange-700 transition-colors">
              {mcp.creador}/{mcp.id}
            </span>
            {mcp.verificado && (
              <span className="text-orange-500 text-xs" title="Verificado">⊕</span>
            )}
          </div>
          <span className="text-xs text-stone-400 flex items-center gap-1 shrink-0">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="3"/><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/>
            </svg>
            {mcp.num_tools} tools
          </span>
        </div>

        {/* Descripción */}
        <p className="text-sm text-stone-500 line-clamp-2 leading-relaxed pl-9">
          {mcp.descripcion_corta}
        </p>

        {/* Footer */}
        <div className="pl-9">
          <span className="text-xs text-stone-400">
            {mcp.gratuito ? '↓ Gratuito' : '↓ De pago'}
          </span>
        </div>
      </div>
    </Link>
  )
}

export default function McpListPreview({
  mcps,
  total,
}: {
  mcps: Mcp[]
  total: number
}) {
  const visible = mcps.slice(0, 3)
  const ghost = mcps[3]

  return (
    <div className="max-w-2xl mx-auto w-full flex flex-col">
      {/* Lista */}
      <div>
        {visible.map(mcp => (
          <McpListItem key={mcp.id} mcp={mcp} />
        ))}
        {/* Último item parcialmente visible (fade) */}
        {ghost && <McpListItem mcp={ghost} faded />}
      </div>

      {/* CTAs */}
      <div className="flex justify-center gap-3 mt-6">
        <Link
          href="/mcps"
          className="bg-orange-600 text-white px-6 py-2.5 rounded-xl font-semibold text-sm hover:bg-orange-700 transition-colors shadow-sm"
        >
          Ver {total}+ MCPs
        </Link>
        <Link
          href="/submit"
          className="border border-stone-300 bg-white text-stone-700 px-6 py-2.5 rounded-xl font-semibold text-sm hover:bg-stone-50 transition-colors"
        >
          Publicar MCP
        </Link>
      </div>
    </div>
  )
}
