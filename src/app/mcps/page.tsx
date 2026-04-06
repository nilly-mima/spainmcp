import CuradosGrid from '@/components/CuradosGrid'
import McpCard from '@/components/McpCard'
import { getAllMcps, getAllCategorias, CATEGORIA_LABELS } from '@/lib/mcps'

export const metadata = {
  title: 'MCPs — SpainMCP',
  description: 'Servidores MCP verificados, con guías en español para España y LATAM.',
}

export default function McpsPage() {
  const mcps = getAllMcps()
  const categorias = getAllCategorias()

  return (
    <div className="py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-100">MCPs</h1>
        <p className="text-sm text-stone-400 dark:text-stone-500 mt-1">
          {mcps.length} servidores verificados · guías en español
        </p>
      </div>

      {categorias.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          {categorias.map(cat => (
            <span
              key={cat}
              className="text-xs px-3 py-1 rounded-full text-stone-500 font-medium"
              style={{ background: '#F5F0E8', border: '1px solid #E8E2D9' }}
            >
              {CATEGORIA_LABELS[cat] ?? cat}
            </span>
          ))}
        </div>
      )}

      <CuradosGrid>
        {mcps.map(mcp => (
          <McpCard key={mcp.id} mcp={mcp} />
        ))}
      </CuradosGrid>
    </div>
  )
}
