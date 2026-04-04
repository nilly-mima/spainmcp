import McpCard from '@/components/McpCard'
import { getAllMcps, getAllCategorias, CATEGORIA_LABELS } from '@/lib/mcps'
import Link from 'next/link'

export const metadata = {
  title: 'Directorio de servidores MCP — SpainMCP',
  description: 'Todos los servidores MCP disponibles en español, verificados y con guías de instalación.',
}

export default function DirectorioPage() {
  const mcps = getAllMcps()
  const categorias = getAllCategorias()

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Directorio MCP</h1>
        <p className="text-gray-500 mt-2">{mcps.length} servidores MCP con guías en español</p>
      </div>

      <div className="flex flex-wrap gap-2">
        <span className="text-sm text-gray-500 self-center mr-1">Filtrar:</span>
        {categorias.map(cat => (
          <Link
            key={cat}
            href={`/categoria/${cat}`}
            className="bg-white border border-gray-200 text-gray-600 px-3 py-1 rounded-lg text-sm hover:border-orange-400 hover:text-orange-600 transition-colors"
          >
            {CATEGORIA_LABELS[cat] || cat}
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {mcps.map(mcp => (
          <McpCard key={mcp.id} mcp={mcp} />
        ))}
      </div>
    </div>
  )
}
