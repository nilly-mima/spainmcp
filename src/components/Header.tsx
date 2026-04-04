import Link from 'next/link'

export default function Header() {
  return (
    <header className="sticky top-0 z-10 border-b bg-[#F5F0E8]" style={{ borderColor: '#E8E2D9' }}>
      <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-base text-stone-900 hover:text-orange-600 transition-colors">
          <span className="text-orange-600">⚡</span>
          SpainMCP
        </Link>
        <nav className="flex items-center gap-7 text-sm text-stone-500">
          <Link href="/mcps" className="hover:text-stone-900 transition-colors">MCPs</Link>
          <Link href="/guias" className="hover:text-stone-900 transition-colors">Guías</Link>
          <a
            href="https://github.com/nilly-mima/spainmcp"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-stone-900 transition-colors"
          >
            Docs
          </a>
          <Link
            href="/submit"
            className="border border-stone-300 text-stone-700 px-3 py-1.5 rounded-lg hover:bg-white transition-colors text-sm font-medium flex items-center gap-1"
          >
            Publicar <span className="text-stone-400">▾</span>
          </Link>
        </nav>
      </div>
    </header>
  )
}
