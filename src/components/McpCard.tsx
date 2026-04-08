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
    'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300',
    'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300',
    'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300',
    'bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300',
    'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-300',
    'bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300',
    'bg-sky-100 dark:bg-sky-900/40 text-sky-700 dark:text-sky-300',
  ]
  const p = palettes[id.charCodeAt(0) % palettes.length]

  return (
    <div
      className={`w-9 h-9 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${p}`}
    >
      {initials}
    </div>
  )
}

function CheckBadge() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" className="text-blue-500 shrink-0">
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
        className="bg-transparent rounded-xl p-3 h-full flex flex-col gap-2 transition-colors hover:bg-gray-50 dark:hover:bg-white/5 cursor-pointer border border-gray-200 dark:border-gray-700/50"
      >
        {/* Header */}
        <div className="flex items-start gap-3">
          {mcp.logo_url ? (
            <img src={mcp.logo_url} alt="" className="w-9 h-9 rounded-lg object-contain shrink-0" />
          ) : (
            <McpIcon nombre={mcp.nombre} id={mcp.id} />
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <h3 className="font-bold text-blue-600 dark:text-white text-sm leading-tight truncate group-hover:underline">
                {mcp.nombre}
              </h3>
              {mcp.verificado && <CheckBadge />}
            </div>
            <p className="text-xs text-stone-400 dark:text-stone-500 truncate mt-0.5">{mcp.creador}</p>
          </div>
        </div>

        {/* Descripción */}
        <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed flex-1 line-clamp-2">
          {mcp.descripcion_corta}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between pt-1.5" style={{ borderTop: '1px solid var(--border)' }}>
          <span
            className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full text-stone-500 font-medium bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
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
