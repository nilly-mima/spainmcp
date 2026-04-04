import Link from 'next/link'
import { Mcp } from '@/lib/mcps'

function McpIcon({ nombre }: { nombre: string }) {
  const initials = nombre
    .split(' ')
    .map(w => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  const colors = [
    'bg-orange-100 text-orange-700',
    'bg-blue-100 text-blue-700',
    'bg-green-100 text-green-700',
    'bg-purple-100 text-purple-700',
    'bg-yellow-100 text-yellow-700',
    'bg-rose-100 text-rose-700',
  ]
  const color = colors[nombre.charCodeAt(0) % colors.length]

  return (
    <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${color}`}>
      {initials}
    </div>
  )
}

export default function McpCard({ mcp }: { mcp: Mcp }) {
  return (
    <Link href={`/mcps/${mcp.id}`} className="group block h-full">
      <div
        className="bg-white rounded-xl p-5 h-full flex flex-col gap-3 transition-shadow hover:shadow-md"
        style={{ border: '1px solid #E8E2D9' }}
      >
        {/* Header: icono + nombre + badge */}
        <div className="flex items-start gap-3">
          <McpIcon nombre={mcp.nombre} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h3 className="font-semibold text-stone-900 text-sm group-hover:text-orange-600 transition-colors truncate">
                {mcp.nombre}
              </h3>
              {mcp.verificado && (
                <span className="text-orange-500 text-sm shrink-0" title="Verificado">⊕</span>
              )}
              {mcp.especifico_espana && (
                <span className="text-xs shrink-0">🇪🇸</span>
              )}
            </div>
            <p className="text-xs text-stone-400 truncate mt-0.5">{mcp.creador}</p>
          </div>
        </div>

        {/* Descripción */}
        <p className="text-sm text-stone-500 leading-relaxed flex-1 line-clamp-3">
          {mcp.descripcion_corta}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2" style={{ borderTop: '1px solid #F0EBE3' }}>
          <span
            className="text-xs px-2 py-0.5 rounded-full text-stone-500 font-medium"
            style={{ background: '#F5F0E8', border: '1px solid #E8E2D9' }}
          >
            {mcp.gratuito ? 'Gratuito' : 'De pago'}
          </span>
          <span className="text-xs text-stone-400 flex items-center gap-1">
            <span className="text-orange-500">↗</span>
            {mcp.num_tools} tools
          </span>
        </div>
      </div>
    </Link>
  )
}
