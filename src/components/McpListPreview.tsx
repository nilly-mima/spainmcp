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

function McpListItem({ mcp }: { mcp: Mcp }) {
  const initials = mcp.nombre.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
  const color = COLORS[mcp.nombre.charCodeAt(0) % COLORS.length]

  return (
    <Link href={`/mcps/${mcp.id}`} className="block group p-4 hover:bg-stone-50/60 transition-colors">
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className={`w-7 h-7 rounded-md flex items-center justify-center text-[11px] font-bold shrink-0 ${color}`}>
              {initials}
            </div>
            <span className="text-sm font-medium text-orange-600 group-hover:text-orange-700 transition-colors">
              {mcp.creador}/{mcp.id}
            </span>
            {mcp.verificado && (
              <span className="text-orange-400 text-xs" title="Verificado">⊕</span>
            )}
          </div>
          <span className="text-xs text-stone-400 flex items-center gap-1 shrink-0">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="3"/><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/>
            </svg>
            {mcp.num_tools} tools
          </span>
        </div>
        <p className="text-sm text-stone-500 line-clamp-2 leading-relaxed pl-9">
          {mcp.descripcion_corta}
        </p>
        <span className="text-xs text-stone-400 pl-9">
          ↓ {mcp.gratuito ? 'Gratuito' : 'De pago'}
        </span>
      </div>
    </Link>
  )
}

function NetworkIllustration() {
  const C = { x: 150, y: 185 }
  const nodes = [
    { x: 245, y: 52,  label: 'GH', name: 'GitHub' },
    { x: 282, y: 192, label: 'NO', name: 'Notion' },
    { x: 218, y: 315, label: 'YT', name: 'YouTube' },
    { x: 66,  y: 308, label: 'FS', name: 'Files' },
    { x: 18,  y: 178, label: 'BS', name: 'Brave' },
    { x: 76,  y: 55,  label: 'SL', name: 'Slack' },
  ]

  return (
    <svg viewBox="0 0 305 390" fill="none" className="w-full">
      {/* Warm hill at bottom */}
      <path d="M-10,348 Q152,284 315,348 L315,390 L-10,390 Z" fill="#EA580C" fillOpacity="0.10"/>
      <path d="M-10,362 Q152,310 315,362 L315,390 L-10,390 Z" fill="#EA580C" fillOpacity="0.08"/>

      {/* Pulse rings around Claude */}
      <circle cx={C.x} cy={C.y} r="74"  stroke="#EA580C" strokeOpacity="0.12" fill="none" strokeWidth="1.5"/>
      <circle cx={C.x} cy={C.y} r="100" stroke="#EA580C" strokeOpacity="0.06" fill="none" strokeWidth="1"/>

      {/* Connection lines */}
      {nodes.map((n, i) => (
        <line key={`l${i}`}
          x1={C.x} y1={C.y} x2={n.x} y2={n.y}
          stroke="#EA580C" strokeOpacity="0.28" strokeWidth="1.5"/>
      ))}

      {/* Particles on lines */}
      {nodes.map((n, i) => {
        const t = 0.32 + (i % 3) * 0.14
        return (
          <circle key={`p${i}`}
            cx={C.x + (n.x - C.x) * t}
            cy={C.y + (n.y - C.y) * t}
            r="3.5" fill="#EA580C"/>
        )
      })}

      {/* Claude center */}
      <circle cx={C.x} cy={C.y} r="52" fill="#EA580C"/>
      <text x={C.x} y={C.y - 5} textAnchor="middle" fill="white"
        fontSize="14" fontWeight="bold" fontFamily="Inter, system-ui, sans-serif">Claude</text>
      <text x={C.x} y={C.y + 12} textAnchor="middle" fill="rgba(255,255,255,0.65)"
        fontSize="9" fontFamily="Inter, system-ui, sans-serif">MCP Hub</text>

      {/* Tool nodes */}
      {nodes.map((n, i) => (
        <g key={`n${i}`}>
          <circle cx={n.x} cy={n.y} r="26" fill="white" stroke="#E8E2D9" strokeWidth="1.5"/>
          <text x={n.x} y={n.y + 4} textAnchor="middle" fill="#57534E"
            fontSize="11" fontWeight="600" fontFamily="Inter, system-ui, sans-serif">
            {n.label}
          </text>
        </g>
      ))}

      {/* Node name labels */}
      {nodes.map((n, i) => {
        // Position label outside the circle
        const dx = n.x - C.x, dy = n.y - C.y
        const len = Math.sqrt(dx * dx + dy * dy)
        const lx = n.x + (dx / len) * 34
        const ly = n.y + (dy / len) * 34 + 4
        return (
          <text key={`t${i}`} x={lx} y={ly} textAnchor="middle" fill="#A8A29E"
            fontSize="9" fontFamily="Inter, system-ui, sans-serif">
            {n.name}
          </text>
        )
      })}
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
        <h2 className="text-4xl font-black text-stone-900 tracking-tight">MCPs Verificados</h2>
        <p className="text-stone-500 max-w-sm">
          Guías en español, verificadas y listas para instalar en minutos.
        </p>
      </div>

      {/* Lista + ilustración */}
      <div className="flex gap-8 items-start">

        {/* Lista bordeada */}
        <div className="flex-1 min-w-0">
          <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid #E8E2D9' }}>
            {visible.map((mcp, i) => (
              <div key={mcp.id} style={i > 0 ? { borderTop: '1px solid #E8E2D9' } : {}}>
                <McpListItem mcp={mcp} />
              </div>
            ))}
            {ghost && (
              <div className="opacity-25" style={{ borderTop: '1px solid #E8E2D9' }}>
                <McpListItem mcp={ghost} />
              </div>
            )}
          </div>

          {/* CTAs debajo de la lista */}
          <div className="flex justify-center gap-3 mt-6">
            <Link
              href="/mcps"
              className="bg-orange-600 text-white px-7 py-2.5 rounded-xl font-bold text-sm hover:bg-orange-700 transition-colors shadow-sm"
            >
              Ver {total}+ MCPs
            </Link>
            <Link
              href="/submit"
              className="border border-stone-300 bg-white text-stone-700 px-7 py-2.5 rounded-xl font-bold text-sm hover:bg-stone-50 transition-colors"
            >
              Publicar MCP
            </Link>
          </div>
        </div>

        {/* Ilustración red neuronal */}
        <div className="hidden lg:flex lg:w-[280px] shrink-0 items-end self-stretch">
          <NetworkIllustration />
        </div>

      </div>
    </div>
  )
}
