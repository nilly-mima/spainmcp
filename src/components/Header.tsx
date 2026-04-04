import Link from 'next/link'

async function getGitHubStars(): Promise<number> {
  try {
    const res = await fetch('https://api.github.com/repos/nilly-mima/spainmcp', {
      next: { revalidate: 3600 },
    })
    if (!res.ok) return 0
    const data = await res.json()
    return data.stargazers_count ?? 0
  } catch {
    return 0
  }
}

export default async function Header() {
  const stars = await getGitHubStars()

  return (
    <header className="sticky top-0 z-10 bg-[var(--background)] border-b border-[var(--border)]">
      <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">

        {/* Logo + GitHub stars */}
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2 font-bold text-base text-stone-900 dark:text-stone-100 hover:text-orange-600 dark:hover:text-orange-500 transition-colors">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <rect x="1"  y="1"  width="8" height="8" rx="2" fill="#EA580C"/>
              <rect x="11" y="1"  width="8" height="8" rx="2" fill="#EA580C"/>
              <rect x="1"  y="11" width="8" height="8" rx="2" fill="#EA580C"/>
              <rect x="11" y="11" width="8" height="8" rx="2" fill="#EA580C"/>
            </svg>
            SpainMCP
          </Link>

          <a
            href="https://github.com/nilly-mima/spainmcp"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200 transition-colors px-2 py-1 rounded-md hover:bg-stone-200/60 dark:hover:bg-stone-800/60"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
            {stars}
          </a>
        </div>

        {/* Nav */}
        <nav className="flex items-center gap-0.5 text-sm text-stone-500 dark:text-stone-400">
          <Link href="/mcps"    className="px-3 py-1.5 rounded-md hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-200/50 dark:hover:bg-stone-800/50 transition-colors">MCPs</Link>
          <Link href="/guias"   className="px-3 py-1.5 rounded-md hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-200/50 dark:hover:bg-stone-800/50 transition-colors">Guías</Link>
          <Link href="/docs"    className="px-3 py-1.5 rounded-md hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-200/50 dark:hover:bg-stone-800/50 transition-colors">Docs</Link>
          <Link href="/precios" className="px-3 py-1.5 rounded-md hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-200/50 dark:hover:bg-stone-800/50 transition-colors">Precios</Link>

          <div className="w-px h-4 bg-stone-300 dark:bg-stone-700 mx-2" />

          <Link
            href="/submit"
            className="flex items-center gap-1 border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-700 dark:text-stone-300 px-3 py-1.5 rounded-lg hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors font-medium"
          >
            Publicar <span className="text-stone-400 text-[10px]">▾</span>
          </Link>
          <Link
            href="/login"
            className="px-3 py-1.5 rounded-md text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-200/50 dark:hover:bg-stone-800/50 transition-colors"
          >
            Entrar
          </Link>
        </nav>

      </div>
    </header>
  )
}
