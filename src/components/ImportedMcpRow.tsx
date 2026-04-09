'use client'

import { ImportedMcp } from '@/lib/mcps'

const LANG_ICON: Record<string, string> = {
  python: '🐍', typescript: '📇', go: '🏎️',
  rust: '🦀', csharp: '#️⃣', java: '☕', cpp: '🌊', ruby: '💎',
}

function McpInitials({ nombre }: { nombre: string }) {
  const initials = nombre.split(/[\s\-\/]/).map(w => w[0]).join('').slice(0, 2).toUpperCase()
  const colors = [
    'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300',
    'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300',
    'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300',
    'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300',
  ]
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
      className="group flex items-center gap-3 py-3 px-3 rounded-lg hover:bg-stone-50 dark:hover:bg-white/5 transition-all"
      style={{ border: '1px solid transparent' }}
      onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--border)')}
      onMouseLeave={e => (e.currentTarget.style.borderColor = 'transparent')}
    >
      <McpInitials nombre={mcp.nombre} />

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-stone-800 dark:text-stone-200 group-hover:text-blue-600 transition-colors truncate">
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
          className="text-xs px-2 py-0.5 rounded-full text-stone-400 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
        >
          {mcp.scope === 'local' ? '🏠 Local' : '☁️ Cloud'}
        </span>
        <span className="text-stone-400 dark:text-stone-500 group-hover:text-blue-500 transition-colors text-sm">↗</span>
      </div>
    </a>
  )
}
