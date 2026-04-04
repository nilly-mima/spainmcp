import McpCard from '@/components/McpCard'
import ImportedMcpRow from '@/components/ImportedMcpRow'
import { getAllMcps, getAllCategorias, getImportedMcps, getImportedTotal, CATEGORIA_LABELS } from '@/lib/mcps'
import Link from 'next/link'

export const metadata = {
  title: 'Directorio de servidores MCP — SpainMCP',
  description: 'Más de 1800 servidores MCP con guías en español. El directorio MCP más completo para España y LATAM.',
}

export default function DirectorioPage() {
  const curados = getAllMcps()
  const importados = getImportedMcps()
  const totalImportados = getImportedTotal()
  const categorias = getAllCategorias()

  return (
    <div className="flex flex-col gap-10">

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-stone-900">Directorio MCP</h1>
        <p className="text-stone-500 mt-2">
          <span className="font-semibold text-stone-700">{curados.length}</span> curados con guías en español
          · <span className="font-semibold text-stone-700">{totalImportados.toLocaleString()}</span> importados de awesome-mcp-servers
        </p>
      </div>

      {/* Filtros categoría */}
      <div className="flex flex-wrap gap-2">
        <span className="text-xs text-stone-400 self-center uppercase tracking-wider mr-1">Categoría:</span>
        {categorias.map(cat => (
          <Link
            key={cat}
            href={`/categoria/${cat}`}
            className="bg-white text-stone-600 px-3 py-1 rounded-lg text-sm hover:text-orange-600 transition-colors"
            style={{ border: '1px solid #E8E2D9' }}
          >
            {CATEGORIA_LABELS[cat] || cat}
          </Link>
        ))}
      </div>

      {/* Curados con guía en español */}
      <section className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <h2 className="text-sm font-semibold text-stone-400 uppercase tracking-wider">
            Curados — Guías en español
          </h2>
          <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">
            {curados.length} MCPs
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {curados.map(mcp => (
            <McpCard key={mcp.id} mcp={mcp} />
          ))}
        </div>
      </section>

      {/* Importados de awesome-mcp-servers */}
      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-sm font-semibold text-stone-400 uppercase tracking-wider">
              Todos los servidores MCP
            </h2>
            <span
              className="text-xs text-stone-400 px-2 py-0.5 rounded-full"
              style={{ background: '#F5F0E8', border: '1px solid #E8E2D9' }}
            >
              {totalImportados.toLocaleString()} MCPs · awesome-mcp-servers
            </span>
          </div>
          <a
            href="https://github.com/punkpeye/awesome-mcp-servers"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-stone-400 hover:text-stone-600 transition-colors"
          >
            Fuente: GitHub →
          </a>
        </div>
        <div
          className="bg-white rounded-xl divide-y"
          style={{ border: '1px solid #E8E2D9' }}
        >
          {importados.map(mcp => (
            <ImportedMcpRow key={mcp.id + mcp.github_url} mcp={mcp} />
          ))}
        </div>
      </section>

    </div>
  )
}
