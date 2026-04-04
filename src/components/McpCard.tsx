import Link from 'next/link'
import { Mcp, CATEGORIA_LABELS } from '@/lib/mcps'

export default function McpCard({ mcp }: { mcp: Mcp }) {
  return (
    <Link href={`/mcps/${mcp.id}`} className="group block">
      <div className="border border-gray-200 rounded-xl p-5 hover:border-orange-400 hover:shadow-md transition-all bg-white h-full flex flex-col gap-3">

        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-gray-900 group-hover:text-orange-600 transition-colors">
            {mcp.nombre}
          </h3>
          <div className="flex gap-1 shrink-0">
            {mcp.verificado && (
              <span className="text-xs bg-green-50 text-green-700 border border-green-200 px-2 py-0.5 rounded-full">
                ✓ Verificado
              </span>
            )}
            {mcp.especifico_espana && (
              <span className="text-xs bg-yellow-50 text-yellow-700 border border-yellow-200 px-2 py-0.5 rounded-full">
                🇪🇸 España
              </span>
            )}
          </div>
        </div>

        {/* Descripción */}
        <p className="text-sm text-gray-600 leading-relaxed flex-1">
          {mcp.descripcion_corta}
        </p>

        {/* Categorías */}
        <div className="flex flex-wrap gap-1">
          {mcp.categoria.slice(0, 3).map(cat => (
            <span
              key={cat}
              className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full"
            >
              {CATEGORIA_LABELS[cat] || cat}
            </span>
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between text-xs text-gray-400 pt-1 border-t border-gray-100">
          <span>{mcp.num_tools} tools</span>
          <span className={mcp.gratuito ? 'text-green-600' : 'text-gray-500'}>
            {mcp.gratuito ? 'Gratuito' : mcp.precio_info || 'De pago'}
          </span>
        </div>
      </div>
    </Link>
  )
}
