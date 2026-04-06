import McpsPageClient from '@/components/McpsPageClient'
import { getAllMcps, getAllCategorias } from '@/lib/mcps'

export const metadata = {
  title: 'MCPs — SpainMCP',
  description: 'Servidores MCP verificados, con guías en español para España y LATAM.',
}

export default async function McpsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const { q } = await searchParams
  const mcps = getAllMcps()
  const categorias = getAllCategorias()

  return (
    <McpsPageClient
      key={q ?? ''}
      mcps={mcps}
      categorias={categorias}
      initialQuery={q ?? ''}
    />
  )
}
