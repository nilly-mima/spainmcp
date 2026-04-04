import ImportedDirectory from '@/components/ImportedDirectory'
import { getImportedMcps, getImportedTotal } from '@/lib/mcps'

export const metadata = {
  title: 'MCPs — SpainMCP',
  description: 'Más de 1800 servidores MCP. El directorio MCP más completo para España y LATAM.',
}

export default function McpsPage() {
  const mcps = getImportedMcps()
  const total = getImportedTotal()

  return (
    <div className="py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-100">MCPs</h1>
        <p className="text-sm text-stone-400 dark:text-stone-500 mt-1">
          {total.toLocaleString()} servidores · awesome-mcp-servers
        </p>
      </div>
      <ImportedDirectory mcps={mcps} />
    </div>
  )
}
