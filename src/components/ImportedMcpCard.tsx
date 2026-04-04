import { ImportedMcp } from '@/lib/mcps'

const LANG_ICON: Record<string, string> = {
  python: '🐍', typescript: '📇', go: '🏎️',
  rust: '🦀', csharp: '#️⃣', java: '☕', cpp: '🌊', ruby: '💎',
}

const COLORS = [
  'bg-slate-100 text-slate-600',
  'bg-zinc-100 text-zinc-600',
  'bg-stone-100 text-stone-600',
  'bg-blue-100 text-blue-700',
  'bg-teal-100 text-teal-700',
  'bg-indigo-100 text-indigo-700',
]

function McpInitials({ nombre }: { nombre: string }) {
  const initials = nombre.split(/[\s\-\/]/).map(w => w[0]).filter(Boolean).join('').slice(0, 2).toUpperCase()
  const color = COLORS[nombre.charCodeAt(0) % COLORS.length]
  return (
    <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${color}`}>
      {initials}
    </div>
  )
}

export default function ImportedMcpCard({ mcp }: { mcp: ImportedMcp }) {
  return (
    <a
      href={mcp.github_url}
      target="_blank"
      rel="noopener noreferrer"
      className="group block"
    >
      <div
        className="bg-white rounded-xl p-5 h-full flex flex-col gap-3 transition-shadow hover:shadow-md"
        style={{ border: '1px solid #E8E2D9' }}
      >
        {/* Header */}
        <div className="flex items-start gap-3">
          <McpInitials nombre={mcp.nombre} />
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-stone-900 text-sm group-hover:text-orange-600 transition-colors truncate">
              {mcp.nombre}
            </h3>
            <p className="text-xs text-stone-400 mt-0.5">
              {mcp.lenguaje ? `${LANG_ICON[mcp.lenguaje] || ''} ${mcp.lenguaje}` : 'GitHub'}
            </p>
          </div>
        </div>

        {/* Descripción */}
        <p className="text-sm text-stone-500 leading-relaxed flex-1 line-clamp-3">
          {mcp.descripcion_en}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2" style={{ borderTop: '1px solid #F0EBE3' }}>
          <span
            className="text-xs px-2 py-0.5 rounded-full text-stone-500"
            style={{ background: '#F5F0E8', border: '1px solid #E8E2D9' }}
          >
            {mcp.scope === 'local' ? '🏠 Local' : '☁️ Cloud'}
          </span>
          <span className="text-orange-400 text-sm group-hover:text-orange-600 transition-colors">↗</span>
        </div>
      </div>
    </a>
  )
}
