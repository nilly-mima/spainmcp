import McpCatalogPageClient from '@/components/McpCatalogPageClient'

export const metadata = {
  title: 'MCPs — SpainMCP',
  description: 'Servidores MCP verificados, con guías en español para España y LATAM.',
}

export default async function McpsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>
}) {
  const { q, page } = await searchParams
  const initialPage = Math.max(1, parseInt(page ?? '1', 10) || 1)

  return (
    <McpCatalogPageClient
      key={(q ?? '') + '|' + initialPage}
      initialQuery={q ?? ''}
      initialPage={initialPage}
    />
  )
}
