import Link from 'next/link'

export default function Header() {
  return (
    <header className="border-b border-gray-200 bg-white sticky top-0 z-10">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg text-gray-900 hover:text-orange-600 transition-colors">
          <span className="text-orange-500">⚡</span>
          SpainMCP
        </Link>
        <nav className="flex items-center gap-6 text-sm text-gray-600">
          <Link href="/mcps" className="hover:text-gray-900 transition-colors">Directorio</Link>
          <Link href="/guias" className="hover:text-gray-900 transition-colors">Guías</Link>
          <a
            href="https://github.com/nilly-mima/spainmcp"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-gray-900 transition-colors"
          >
            GitHub
          </a>
          <Link
            href="/submit"
            className="bg-orange-500 text-white px-3 py-1.5 rounded-lg hover:bg-orange-600 transition-colors text-xs font-medium"
          >
            Añadir MCP
          </Link>
        </nav>
      </div>
    </header>
  )
}
