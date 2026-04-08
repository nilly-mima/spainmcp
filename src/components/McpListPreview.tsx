import Link from 'next/link'
import { Mcp } from '@/lib/mcps'

const COLORS = [
  'bg-blue-100 text-blue-700',
  'bg-blue-100 text-blue-700',
  'bg-green-100 text-green-700',
  'bg-purple-100 text-purple-700',
  'bg-amber-100 text-amber-700',
  'bg-rose-100 text-rose-700',
]

function McpListItem({ mcp }: { mcp: Mcp }) {
  const initials = mcp.nombre.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
  const color = COLORS[mcp.nombre.charCodeAt(0) % COLORS.length]

  return (
    <Link href={`/mcps/${mcp.id}`} className="block group p-4 hover:bg-gray-50 dark:bg-gray-800/60 dark:hover:bg-stone-800/30 transition-colors">
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            {mcp.logo_url ? (
              <img src={mcp.logo_url} alt="" className="w-7 h-7 rounded-md object-contain shrink-0" />
            ) : (
              <div className={`w-7 h-7 rounded-md flex items-center justify-center text-[11px] font-bold shrink-0 ${color}`}>
                {initials}
              </div>
            )}
            <span className="text-sm font-medium text-gray-900 dark:text-gray-100 group-hover:text-blue-600 transition-colors">
              {mcp.creador}/{mcp.id}
            </span>
            {mcp.verificado && (
              <span className="text-blue-400 text-xs" title="Verificado">⊕</span>
            )}
          </div>
          <span className="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1 shrink-0">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="3"/><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/>
            </svg>
            {mcp.num_tools} tools
          </span>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed pl-9">
          {mcp.descripcion_corta}
        </p>
        <span className="text-xs text-gray-400 dark:text-gray-500 pl-9">
          ↓ {mcp.gratuito ? 'Gratuito' : 'De pago'}
        </span>
      </div>
    </Link>
  )
}

function MascotSvg() {
  return (
    <svg viewBox="0 0 180 280" fill="none" className="w-full">

      {/* Colina */}
      <path d="M-10,260 Q90,240 190,260 L190,280 L-10,280 Z" fill="#DBEAFE" fillOpacity="0.35"/>

      {/* Sombra */}
      <ellipse cx="90" cy="252" rx="50" ry="9" fill="#1C1917" opacity="0.1"/>

      {/* Pajarita */}
      <path d="M76,172 L90,165 L104,172 L90,179 Z" fill="#1D4ED8"/>
      <circle cx="90" cy="172" r="3" fill="#93C5FD"/>

      {/* Pierna izquierda — pegada */}
      <rect x="72" y="165" width="11" height="70" rx="5.5" fill="white" stroke="#1C1917" strokeWidth="2"/>
      {/* Pierna derecha — pegada */}
      <rect x="97" y="165" width="11" height="70" rx="5.5" fill="white" stroke="#1C1917" strokeWidth="2"/>

      {/* Zapato izquierdo */}
      <ellipse cx="77.5" cy="237" rx="12" ry="6" fill="white" stroke="#1C1917" strokeWidth="2"/>
      {/* Zapato derecho */}
      <ellipse cx="102.5" cy="237" rx="12" ry="6" fill="white" stroke="#1C1917" strokeWidth="2"/>

      {/* Rayos */}
      <g opacity="0.75">
        <rect x="86" y="10" width="8" height="20" rx="4" fill="#60A5FA"/>
        <rect x="86" y="170" width="8" height="20" rx="4" fill="#60A5FA"/>
        <rect x="12" y="96" width="20" height="8" rx="4" fill="#60A5FA"/>
        <rect x="148" y="96" width="20" height="8" rx="4" fill="#60A5FA"/>
        <rect x="34" y="40" width="8" height="20" rx="4" fill="#60A5FA" transform="rotate(-45 38 50)"/>
        <rect x="138" y="40" width="8" height="20" rx="4" fill="#60A5FA" transform="rotate(45 142 50)"/>
        <rect x="34" y="138" width="8" height="20" rx="4" fill="#60A5FA" transform="rotate(45 38 148)"/>
        <rect x="138" y="138" width="8" height="20" rx="4" fill="#60A5FA" transform="rotate(-45 142 148)"/>
      </g>

      {/* Cuerpo */}
      <circle cx="90" cy="110" r="62" fill="#2563EB" stroke="#1D4ED8" strokeWidth="2"/>

      {/* Barriga */}
      <circle cx="90" cy="125" r="28" fill="#93C5FD" opacity="0.4"/>

      {/* Ojo izquierdo */}
      <circle cx="76" cy="100" r="8" fill="white"/>
      <circle cx="77.5" cy="101" r="4" fill="#1C1917"/>
      <circle cx="79" cy="99.5" r="1.5" fill="white"/>

      {/* Ojo derecho */}
      <circle cx="104" cy="100" r="8" fill="white"/>
      <circle cx="105.5" cy="101" r="4" fill="#1C1917"/>
      <circle cx="107" cy="99.5" r="1.5" fill="white"/>

      {/* Mejillas */}
      <circle cx="65" cy="112" r="6" fill="#1D4ED8" opacity="0.3"/>
      <circle cx="115" cy="112" r="6" fill="#1D4ED8" opacity="0.3"/>

      {/* Sonrisa feliz grande */}
      <path d="M78,118 Q90,132 102,118" stroke="white" strokeWidth="3" strokeLinecap="round" fill="none"/>

      {/* Mejillas */}
      <circle cx="64" cy="112" r="6" fill="#1D4ED8" opacity="0.25"/>
      <circle cx="116" cy="112" r="6" fill="#1D4ED8" opacity="0.25"/>

    </svg>
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
    <div className="w-full flex flex-col gap-8">
      {/* Título + subtítulo */}
      <div className="flex flex-col items-center gap-2 text-center">
        <h2 className="text-4xl font-black text-gray-900 dark:text-gray-100 tracking-tight">MCPs Verificados</h2>
        <p className="text-gray-500 dark:text-gray-400 max-w-sm">
          Guías en español, verificadas y listas para instalar en minutos.
        </p>
      </div>

      {/* Lista + ilustración */}
      <div className="flex gap-8 items-start">

        {/* Lista bordeada */}
        <div className="flex-1 min-w-0">
          <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
            {visible.map((mcp, i) => (
              <div key={mcp.id} style={i > 0 ? { borderTop: '1px solid var(--border)' } : {}}>
                <McpListItem mcp={mcp} />
              </div>
            ))}
            {ghost && (
              <div className="opacity-25" style={{ borderTop: '1px solid var(--border)' }}>
                <McpListItem mcp={ghost} />
              </div>
            )}
          </div>

          {/* CTAs debajo de la lista */}
          <div className="flex justify-center gap-3 mt-6">
            <Link
              href="/mcps"
              className="bg-blue-600 text-white px-7 py-2.5 rounded-xl font-bold text-sm hover:bg-blue-700 transition-colors shadow-sm"
            >
              Ver {total}+ MCPs
            </Link>
            <Link
              href="/publish/mcp"
              className="border border-gray-300 dark:border-gray-700 dark:border-stone-700 bg-white dark:bg-[var(--card)] text-gray-700 dark:text-gray-300 dark:text-gray-300 dark:text-gray-600 px-7 py-2.5 rounded-xl font-bold text-sm hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-stone-800 transition-colors"
            >
              Publicar MCP
            </Link>
          </div>
        </div>


      </div>
    </div>
  )
}
