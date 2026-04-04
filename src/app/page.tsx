import Link from 'next/link'
import McpCard from '@/components/McpCard'
import { getAllMcps, getAllCategorias, CATEGORIA_LABELS } from '@/lib/mcps'

export default function Home() {
  const mcps = getAllMcps()
  const destacados = mcps.filter(m => m.destacado)
  const categorias = getAllCategorias()

  return (
    <div className="flex flex-col gap-12">

      {/* Hero */}
      <section className="text-center py-12 flex flex-col items-center gap-6">
        <div className="inline-flex items-center gap-2 bg-orange-50 text-orange-700 border border-orange-200 px-3 py-1 rounded-full text-sm font-medium">
          <span>⚡</span>
          El directorio MCP en español
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 max-w-2xl leading-tight">
          Servidores MCP para{' '}
          <span className="text-orange-500">España y LATAM</span>
        </h1>
        <p className="text-lg text-gray-500 max-w-xl">
          Encuentra, instala y aprende a usar servidores MCP con guías en español.
          Conecta Claude a tus herramientas favoritas.
        </p>
        <div className="flex gap-3">
          <Link
            href="/mcps"
            className="bg-orange-500 text-white px-5 py-2.5 rounded-lg hover:bg-orange-600 transition-colors font-medium"
          >
            Ver directorio →
          </Link>
          <Link
            href="/guias"
            className="border border-gray-200 text-gray-700 px-5 py-2.5 rounded-lg hover:border-gray-300 hover:bg-white transition-colors font-medium"
          >
            Guías de instalación
          </Link>
        </div>
        <p className="text-sm text-gray-400">{mcps.length} servidores MCP · Guías en español · Verificados</p>
      </section>

      {/* Categorías */}
      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold text-gray-700">Explorar por categoría</h2>
        <div className="flex flex-wrap gap-2">
          {categorias.map(cat => (
            <Link
              key={cat}
              href={`/categoria/${cat}`}
              className="bg-white border border-gray-200 text-gray-600 px-3 py-1.5 rounded-lg text-sm hover:border-orange-400 hover:text-orange-600 transition-colors"
            >
              {CATEGORIA_LABELS[cat] || cat}
            </Link>
          ))}
        </div>
      </section>

      {/* Destacados */}
      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-700">⭐ Destacados</h2>
          <Link href="/mcps" className="text-sm text-orange-500 hover:text-orange-600">
            Ver todos →
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {destacados.map(mcp => (
            <McpCard key={mcp.id} mcp={mcp} />
          ))}
        </div>
      </section>

      {/* Todos */}
      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold text-gray-700">Todos los servidores MCP</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {mcps.filter(m => !m.destacado).map(mcp => (
            <McpCard key={mcp.id} mcp={mcp} />
          ))}
        </div>
      </section>

      {/* CTA contribuir */}
      <section className="bg-white border border-gray-200 rounded-2xl p-8 text-center flex flex-col items-center gap-4">
        <h2 className="text-xl font-semibold">¿Conoces un MCP que falta?</h2>
        <p className="text-gray-500 max-w-md">
          SpainMCP es un directorio abierto. Abre un PR en GitHub o usa el formulario
          para proponer nuevos servidores MCP.
        </p>
        <div className="flex gap-3">
          <a
            href="https://github.com/nilly-mima/spainmcp"
            target="_blank"
            rel="noopener noreferrer"
            className="border border-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors text-sm"
          >
            Abrir PR en GitHub
          </a>
          <Link
            href="/submit"
            className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors text-sm"
          >
            Proponer MCP
          </Link>
        </div>
      </section>

    </div>
  )
}
