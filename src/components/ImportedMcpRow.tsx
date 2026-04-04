'use client'

import { ImportedMcp } from '@/lib/mcps'

const LANG_ICON: Record<string, string> = {
  python: '🐍', typescript: '📇', go: '🏎️',
  rust: '🦀', csharp: '#️⃣', java: '☕', cpp: '🌊', ruby: '💎',
}

function McpInitials({ nombre }: { nombre: string }) {
  const initials = nombre.split(/[\s\-\/]/).map(w => w[0]).join('').slice(0, 2).toUpperCase()
  const colors = ['bg-slate-100 text-slate-600', 'bg-zinc-100 text-zinc-600',
    'bg-stone-100 text-stone-600', 'bg-neutral-100 text-neutral-600']
  const color = colors[nombre.charCodeAt(0) % colors.length]
  return (
    <div className={`w-7 h-7 rounded-md flex items-center justify-center text-xs font-bold shrink-0 ${color}`}>
      {initials}
    </div>
  )
}

export default function ImportedMcpRow({ mcp }: { mcp: ImportedMcp }) {
  return (
    <a
      href={mcp.github_url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex items-center gap-3 py-3 px-3 rounded-lg hover:bg-white transition-all"
      style={{ border: '1px solid transparent' }}
      onMouseEnter={e => (e.currentTarget.style.borderColor = '#E8E2D9')}
      onMouseLeave={e => (e.currentTarget.style.borderColor = 'transparent')}
    >
      <McpInitials nombre={mcp.nombre} />

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-stone-800 group-hover:text-orange-600 transition-colors truncate">
            {mcp.nombre}
          </span>
          {mcp.lenguaje && (
            <span className="text-xs shrink-0">{LANG_ICON[mcp.lenguaje] || ''}</span>
          )}
        </div>
        <p className="text-xs text-stone-400 truncate mt-0.5">{mcp.descripcion_en}</p>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <span
          className="text-xs px-2 py-0.5 rounded-full text-stone-400"
          style={{ background: '#F5F0E8' }}
        >
          {mcp.scope === 'local' ? '🏠 Local' : '☁️ Cloud'}
        </span>
        <span className="text-stone-300 group-hover:text-orange-400 transition-colors text-sm">↗</span>
      </div>
    </a>
  )
}
