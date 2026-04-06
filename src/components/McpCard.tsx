import Link from 'next/link'
import { Mcp } from '@/lib/mcps'

function McpIcon({ nombre, id }: { nombre: string; id: string }) {
  const initials = nombre
    .split(/[\s\-_]/)
    .map(w => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  const palettes = [
    { bg: '#FFF0E8', text: '#C2400C' },
    { bg: '#EEF2FF', text: '#4338CA' },
    { bg: '#F0FDF4', text: '#15803D' },
    { bg: '#FDF4FF', text: '#9333EA' },
    { bg: '#FEFCE8', text: '#A16207' },
    { bg: '#FFF1F2', text: '#BE123C' },
    { bg: '#F0F9FF', text: '#0369A1' },
  ]
  const p = palettes[id.charCodeAt(0) % palettes.length]

  return (
    <div
      className="w-12 h-12 rounded-xl flex items-center justify-center text-sm font-bold shrink-0"
      style={{ background: p.bg, color: p.text }}
    >
      {initials}
    </div>
  )
}

function CheckBadge() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" className="text-orange-500 shrink-0">
      <circle cx="12" cy="12" r="10" fill="currentColor" opacity="0.15"/>
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5"/>
      <polyline points="8 12 11 15 16 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

function GlobeIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10"/>
      <line x1="2" y1="12" x2="22" y2="12"/>
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
    </svg>
  )
}

function StatsIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
      <polyline points="17 6 23 6 23 12"/>
    </svg>
  )
}

export default function McpCard({ mcp }: { mcp: Mcp }) {
  const isRemote = !mcp.instalacion_npx?.includes('localhost')

  return (
    <Link href={`/mcps/${mcp.id}`} className="group block h-full">
      <div
        className="bg-white dark:bg-stone-900 rounded-xl p-4 h-full flex flex-col gap-3 transition-shadow hover:shadow-md cursor-pointer"
        style={{ border: '1px solid #E8E2D9' }}
      >
        {/* Header */}
        <div className="flex items-start gap-3">
          <McpIcon nombre={mcp.nombre} id={mcp.id} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <h3 className="font-bold text-orange-600 dark:text-orange-500 text-sm leading-tight truncate group-hover:underline">
                {mcp.nombre}
              </h3>
              {mcp.verificado && <CheckBadge />}
            </div>
            <p className="text-xs text-stone-400 dark:text-stone-500 truncate mt-0.5">{mcp.creador}</p>
          </div>
        </div>

        {/* Descripción */}
        <p className="text-sm text-stone-500 dark:text-stone-400 leading-relaxed flex-1 line-clamp-3">
          {mcp.descripcion_corta}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2" style={{ borderTop: '1px solid #F0EBE3' }}>
          <span
            className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full text-stone-500 font-medium"
            style={{ background: '#F5F0E8', border: '1px solid #E8E2D9' }}
          >
            <GlobeIcon />
            {isRemote ? 'Remoto' : 'Local'}
          </span>
          <span className="text-xs text-stone-400 flex items-center gap-1">
            <StatsIcon />
            {mcp.num_tools} tool{mcp.num_tools !== 1 ? 's' : ''}
          </span>
        </div>
      </div>
    </Link>
  )
}
