import { notFound } from 'next/navigation'
import McpCard from '@/components/McpCard'
import { getMcpsByCategoria, getAllCategorias, CATEGORIA_LABELS } from '@/lib/mcps'
import Link from 'next/link'

export async function generateStaticParams() {
  return getAllCategorias().map(cat => ({ cat }))
}

export async function generateMetadata({ params }: { params: Promise<{ cat: string }> }) {
  const { cat } = await params
  const label = CATEGORIA_LABELS[cat] || cat
  return {
    title: `MCPs de ${label} — SpainMCP`,
    description: `Servidores MCP de la categoría ${label} con guías en español.`,
  }
}

export default async function CategoriaPage({ params }: { params: Promise<{ cat: string }> }) {
  const { cat } = await params
  const mcps = getMcpsByCategoria(cat)
  if (mcps.length === 0) notFound()

  const label = CATEGORIA_LABELS[cat] || cat

  return (
    <div className="flex flex-col gap-8">
      <div>
        <nav className="text-sm text-gray-400 flex items-center gap-2 mb-4">
          <Link href="/" className="hover:text-gray-600">Inicio</Link>
          <span>/</span>
          <Link href="/mcps" className="hover:text-gray-600">Directorio</Link>
          <span>/</span>
          <span className="text-gray-600">{label}</span>
        </nav>
        <h1 className="text-3xl font-bold text-gray-900">{label}</h1>
        <p className="text-gray-500 mt-2">{mcps.length} servidor{mcps.length > 1 ? 'es' : ''} MCP en esta categoría</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {mcps.map(mcp => (
          <McpCard key={mcp.id} mcp={mcp} />
        ))}
      </div>
    </div>
  )
}
