import McpsPageClient from '@/components/McpsPageClient'
import { getAllMcps, getAllCategorias } from '@/lib/mcps'

export const metadata = {
  title: 'MCPs — SpainMCP',
  description: 'Servidores MCP verificados, con guías en español para España y LATAM.',
}

export default function McpsPage() {
  const mcps = getAllMcps()
  const categorias = getAllCategorias()

  return <McpsPageClient mcps={mcps} categorias={categorias} />
}
