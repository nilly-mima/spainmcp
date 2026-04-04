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
    <Link href={`/mcps/${mcp.id}`} className="block group p-4 hover:bg-stone-50/60 dark:hover:bg-stone-800/30 transition-colors">
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
    <svg viewBox="0 0 218 340" fill="none" className="w-full">

      {/* Colina cálida */}
      <path d="M-10,318 Q109,292 228,318 L228,340 L-10,340 Z"
        fill="#EDB99A" fillOpacity="0.55"/>

      {/* Sombra */}
      <path fill="#1C1917" fillOpacity="0.65"
        d="M109.59,312.69c44.17,0,79.99-6.32,79.99-14.12s-35.82-14.12-79.99-14.12-79.99,6.33-79.99,14.12,35.82,14.12,79.99,14.12Z"/>

      {/* Pierna izquierda */}
      <path fill="white"
        d="M76.92,235.37c-1.32,28.81,19,49.25,19,49.25l13.67,3.63v-50.59l-32.67-2.29Z"/>
      <path fill="#1C1917"
        d="M111.44,290.64l-16.46-4.37-.35-.35c-.85-.86-20.88-21.34-19.54-50.63l.09-1.88,36.26,2.54v54.69ZM96.9,282.97l10.86,2.88v-46.48l-29.05-2.03c-.31,24.68,15.68,42.92,18.2,45.63Z"/>

      {/* Zapato izquierdo */}
      <path fill="white"
        d="M109.59,299.2v-10.97s-7.99-3.38-13.67-3.63c-5.68-.25-15.33,2.99-14.99,14.59h28.67Z"/>
      <path fill="#1C1917"
        d="M109.59,301.03h-30.45l-.05-1.79c-.14-4.84,1.36-8.95,4.33-11.87,3.71-3.65,8.93-4.79,12.59-4.61,5.94.26,13.97,3.63,14.31,3.77l1.12.48v12.18h-1.84v1.83ZM82.8,297.35h24.95v-7.87c-2.34-.9-7.84-2.86-11.91-3.04-2.75-.11-6.98.74-9.84,3.56-1.89,1.86-2.96,4.33-3.19,7.35Z"/>

      {/* Pierna derecha */}
      <path fill="white"
        d="M142.26,235.37c1.32,28.81-19,49.25-19,49.25l-13.67,3.63v-50.59l32.67-2.29Z"/>
      <path fill="#1C1917"
        d="M107.75,290.64v-54.69l36.26-2.54.09,1.88c1.34,29.28-18.68,49.77-19.54,50.63l-.35.35-16.46,4.37ZM111.43,239.38v46.48l10.86-2.88c2.51-2.71,18.5-20.95,18.2-45.63l-29.05,2.03Z"/>

      {/* Zapato derecho */}
      <path fill="white"
        d="M109.59,299.2v-10.97s7.99-3.38,13.67-3.63c5.68-.25,15.32,2.99,14.99,14.59h-28.67Z"/>
      <path fill="#1C1917"
        d="M140.04,301.03h-30.45v-1.83h-1.84v-12.18l1.12-.48c.34-.14,8.36-3.51,14.3-3.77,3.66-.17,8.88.96,12.59,4.61,2.97,2.92,4.46,7.02,4.33,11.87l-.05,1.79ZM111.43,297.35h24.95c-.23-3.02-1.3-5.49-3.19-7.35-2.87-2.82-7.08-3.67-9.84-3.56-4.07.18-9.58,2.14-11.91,3.04v7.87Z"/>

      {/* Cuerpo + llama — UNA sola ruta orgánica */}
      <path fill="#EA580C"
        d="M116.62,68.77C127.45,8.85,65.6-13.33,33.04,7.84c0,0,42.64,28.61,19.6,63.31-5.27-20.8-26.59-25.1-43.83-14.57,0,0,26.69,11.64,2.2,67.36-2.7,6.12-22.98,50.16-.58,92.12,19.66,36.82,53.23,50.8,96.02,45.83,47.69-5.55,107.27-33.51,111.09-98,6.01-101.22-100.9-95.11-100.9-95.11h0Z"/>

      {/* Barriga amarilla */}
      <path fill="#FCD34D"
        d="M80.03,241.2c24.8-2.99,42.56-24.84,39.67-48.81-2.89-23.97-25.33-40.98-50.13-37.99-24.8,2.99-42.56,24.84-39.67,48.81,2.89,23.97,25.33,40.98,50.13,37.99Z"/>

      {/* Ojo izquierdo */}
      <path fill="#1C1917"
        d="M134.05,135.19c2.43-.46,3.77-4.23,2.98-8.42-.79-4.19-3.4-7.22-5.84-6.76s-3.77,4.23-2.98,8.42c.79,4.19,3.4,7.22,5.84,6.76Z"/>

      {/* Ojo derecho */}
      <path fill="#1C1917"
        d="M166.54,124.36c2.47-.2,4.19-3.82,3.84-8.07-.35-4.25-2.63-7.53-5.1-7.33-2.47.2-4.19,3.81-3.84,8.07.35,4.25,2.63,7.54,5.1,7.33Z"/>

      {/* Ceja — arco superior */}
      <path fill="#1C1917"
        d="M112.19,126.28c-1.08,0-2.17-.03-3.26-.08-1.01-.05-1.8-.92-1.74-1.93.05-1.01.93-1.79,1.93-1.74,15.71.79,30.45-4.49,40.44-14.5,10.43-10.45,15.45-25.46,14.51-43.41-.05-1.01.73-1.88,1.74-1.93,1-.07,1.88.73,1.93,1.74.99,19.02-4.4,34.99-15.59,46.2-10.02,10.04-24.45,15.65-39.97,15.65Z"/>

      {/* Ceja — detalle enfado */}
      <path fill="#1C1917"
        d="M145.08,164.43c-.53,0-1.07-.07-1.62-.22-2.83-.91-4.58-2.9-5.02-5.62-.85-5.32,3.41-12.27,10.87-17.71,5.87-4.29,18.65-8.87,25.32-6.3,2.33.9,3.81,2.59,4.29,4.89,1.52,7.35-3.69,9.08-9.2,10.92-2.54.84-5.39,1.79-8.28,3.37l-.61.35c-2.2,1.26-4.26,3.08-6.25,4.85-3.18,2.81-6.2,5.48-9.49,5.48ZM169.94,137.49c-5.55,0-13.79,2.96-18.45,6.36-7.19,5.24-9.92,11.01-9.41,14.16.22,1.34,1.01,2.22,2.44,2.68,1.93.53,4.7-1.91,7.62-4.5,1.78-1.58,3.77-3.34,5.94-4.72v-.03l.93-.54c3.42-1.96,6.83-3.09,9.56-4,5.92-1.97,7.59-2.72,6.76-6.69-.22-1.06-.86-1.76-2.01-2.2-.92-.36-2.08-.52-3.37-.52ZM159.91,152.5h0,0Z"/>

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
        <h2 className="text-4xl font-black text-stone-900 dark:text-stone-100 tracking-tight">MCPs Verificados</h2>
        <p className="text-stone-500 dark:text-stone-400 max-w-sm">
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
              className="bg-orange-600 text-white px-7 py-2.5 rounded-xl font-bold text-sm hover:bg-orange-700 transition-colors shadow-sm"
            >
              Ver {total}+ MCPs
            </Link>
            <Link
              href="/submit"
              className="border border-stone-300 dark:border-stone-700 bg-white dark:bg-[var(--card)] text-stone-700 dark:text-stone-300 px-7 py-2.5 rounded-xl font-bold text-sm hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors"
            >
              Publicar MCP
            </Link>
          </div>
        </div>

        {/* Ilustración red neuronal */}
        <div className="hidden lg:flex lg:w-[224px] shrink-0 items-end self-stretch">
          <MascotSvg />
        </div>

      </div>
    </div>
  )
}
