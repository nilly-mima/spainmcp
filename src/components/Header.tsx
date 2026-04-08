import Link from 'next/link'
import PublishDropdown from './PublishDropdown'
import UserMenu from './UserMenu'
import HeaderSearch from './HeaderSearch'
import { getAllMcps } from '@/lib/mcps'

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
  const namespaces = [...new Set(getAllMcps().map(m => m.creador))].sort()

  return (
    <header className="sticky top-0 z-10 bg-[var(--background)] border-b border-[var(--border)]">
      <div className="max-w-6xl mx-auto px-6 h-14 flex items-center gap-4">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-bold text-base text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400 transition-colors shrink-0">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <rect x="1"  y="1"  width="8" height="8" rx="2" fill="#2563EB"/>
            <rect x="11" y="1"  width="8" height="8" rx="2" fill="#2563EB"/>
            <rect x="1"  y="11" width="8" height="8" rx="2" fill="#2563EB"/>
            <rect x="11" y="11" width="8" height="8" rx="2" fill="#2563EB"/>
          </svg>
          SpainMCP
        </Link>

        {/* Centro contextual: GitHub en home, buscador en MCPs/Skills, nada en el resto */}
        <HeaderSearch stars={stars} namespaces={namespaces} />

        {/* Nav */}
        <nav className="flex items-center gap-0.5 text-sm text-gray-500 dark:text-gray-400 shrink-0">
          <Link href="/mcps"    className="px-3 py-1.5 rounded-md hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-colors">MCPs</Link>
          <Link href="/guias"   className="px-3 py-1.5 rounded-md hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-colors">Skills</Link>
          <Link href="/docs"    className="px-3 py-1.5 rounded-md hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-colors">Docs</Link>
          <Link href="/precios" className="px-3 py-1.5 rounded-md hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-colors">Precios</Link>

          <div className="w-px h-4 bg-gray-200 dark:bg-gray-700 mx-2" />

          <PublishDropdown />
          <div className="w-2" />
          <UserMenu />
        </nav>

      </div>
    </header>
  )
}
