import { ImportedMcp } from '@/lib/mcps'

const COLORS = [
  'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300',
  'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300',
  'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300',
  'bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300',
  'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-300',
  'bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300',
  'bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300',
  'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300',
]

function parseName(nombre: string, githubUrl: string) {
  if (nombre.includes('/')) {
    const slash = nombre.indexOf('/')
    return {
      displayName: nombre.slice(slash + 1),
      creator: nombre.slice(0, slash),
    }
  }
  const parts = githubUrl.replace('https://github.com/', '').split('/')
  return { displayName: parts[1] || nombre, creator: parts[0] || nombre }
}

export default function ImportedMcpCard({ mcp }: { mcp: ImportedMcp }) {
  const { displayName, creator } = parseName(mcp.nombre, mcp.github_url)
  const initials = displayName
    .split(/[\s\-_]/)
    .map(w => w[0])
    .filter(Boolean)
    .join('')
    .slice(0, 2)
    .toUpperCase()
  const color = COLORS[displayName.charCodeAt(0) % COLORS.length]
  const isRemote = mcp.scope === 'cloud'

  return (
    <a href={mcp.github_url} target="_blank" rel="noopener noreferrer" className="group block h-full">
      <div
        className="bg-white dark:bg-[var(--card)] rounded-xl p-4 h-full flex flex-col gap-3 hover:shadow-md transition-shadow cursor-pointer"
        style={{ border: '1px solid var(--border)' }}
      >
        {/* Header: icono + nombre + creator */}
        <div className="flex items-start gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 ${color}`}>
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <h3 className="font-semibold text-stone-900 dark:text-stone-100 text-sm group-hover:text-blue-600 dark:group-hover:text-blue-500 transition-colors truncate">
                {displayName}
              </h3>
            </div>
            <p className="text-xs text-stone-400 dark:text-stone-500 truncate mt-0.5">{creator}</p>
          </div>
        </div>

        {/* Descripción */}
        <p className="text-sm text-stone-500 dark:text-stone-400 leading-relaxed flex-1 line-clamp-2">
          {mcp.descripcion_en}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between" style={{ borderTop: '1px solid var(--border)', paddingTop: '10px' }}>
          <div className="flex items-center gap-1 text-xs text-stone-400 dark:text-stone-500">
            {isRemote ? (
              <>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                </svg>
                Remote
              </>
            ) : (
              <>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                  <polyline points="9 22 9 12 15 12 15 22"/>
                </svg>
                Local
              </>
            )}
          </div>
          <div className="flex items-center gap-1 text-xs text-stone-400 dark:text-stone-500">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
            </svg>
            —
          </div>
        </div>
      </div>
    </a>
  )
}
