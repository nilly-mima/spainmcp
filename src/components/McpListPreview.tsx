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

function MascotSvg() {
  return (
    <svg viewBox="0 0 280 420" fill="none" className="w-full">

      {/* Colina cálida */}
      <path d="M-20,372 Q140,308 300,372 L300,420 L-20,420 Z"
        fill="#EDB99A" fillOpacity="0.55"/>

      {/* Sombra */}
      <ellipse cx="140" cy="372" rx="57" ry="14"
        fill="#1C1917" fillOpacity="0.65"/>

      {/* Piernas */}
      <rect x="108" y="332" width="26" height="44" rx="13" fill="white"/>
      <rect x="146" y="332" width="26" height="44" rx="13" fill="white"/>

      {/* Cuerpo */}
      <circle cx="140" cy="234" r="84" fill="#EA580C"/>

      {/* Llama — ASIMÉTRICA: borde izquierdo sube alto,
          cruza por arriba y forma un curl a la derecha */}
      <path d="
        M 100,158
        C 76,118  80,62  112,36
        C 140,10  200,52  194,88
        C 190,116  174,140  168,158
        Z
      " fill="#EA580C"/>

      {/* Barriga */}
      <ellipse cx="140" cy="268" rx="48" ry="41" fill="#FCD34D"/>

      {/* Ceja principal (arco largo, grueso) */}
      <path d="M 103,202 Q 122,188 148,198"
        stroke="#1C1917" strokeWidth="5.5" fill="none" strokeLinecap="round"/>

      {/* Segunda línea bajo ceja (fruncido — más corta) */}
      <path d="M 106,212 L 130,210"
        stroke="#1C1917" strokeWidth="4" fill="none" strokeLinecap="round"/>

      {/* Ojo — óvalo pequeño entre las dos líneas */}
      <ellipse cx="127" cy="221" rx="5" ry="4.5" fill="#1C1917"/>

      {/* Boca — rectángulo redondeado (boca abierta, grimace) */}
      <rect x="112" y="238" width="20" height="15" rx="4.5" fill="#1C1917"/>

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
          <MascotSvg />
        </div>

      </div>
    </div>
  )
}
