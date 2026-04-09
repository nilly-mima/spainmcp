import McpCatalogPageClient from '@/components/McpCatalogPageClient'
import { createClient } from '@supabase/supabase-js'
import { getAllMcps } from '@/lib/mcps'
import type { CatalogMcp } from '@/components/McpCatalogCard'

export const metadata = {
  title: 'MCPs — SpainMCP',
  description: 'Servidores MCP verificados, con guías en español para España y LATAM.',
}

async function getCatalogMcps(q?: string): Promise<{ mcps: CatalogMcp[]; total: number }> {
  try {
    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    let query = supabase
      .from('mcp_catalog')
      .select('id, nombre, slug, descripcion_es, descripcion_en, scope, icon_url, upstream_url, downloads, is_active, created_at', { count: 'exact' })
      .eq('is_active', true)
      .eq('status', 'approved')
      .eq('is_public', true)
      .order('downloads', { ascending: false })
      .limit(200)

    if (q) {
      query = query.or(`nombre.ilike.%${q}%,descripcion_es.ilike.%${q}%,descripcion_en.ilike.%${q}%,slug.ilike.%${q}%`)
    }

    const { data, count, error } = await query

    if (error || !data || data.length === 0) throw new Error('empty')

    return { mcps: data as CatalogMcp[], total: count ?? data.length }
  } catch {
    // Fallback: convert curated JSON MCPs to CatalogMcp shape
    const jsonMcps = getAllMcps()
    const fallback: CatalogMcp[] = jsonMcps.map(m => ({
      id: m.id,
      nombre: m.nombre,
      slug: m.id,
      descripcion_es: m.descripcion_es,
      descripcion_en: m.descripcion_es,
      scope: m.instalacion_npx?.includes('localhost') ? 'local' : 'remote',
      icon_url: m.logo_url ?? '',
      upstream_url: m.github_url ?? '',
      downloads: 0,
      is_active: true,
      created_at: m.fecha_verificado,
    }))
    return { mcps: fallback, total: fallback.length }
  }
}

export default async function McpsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const { q } = await searchParams
  const { mcps } = await getCatalogMcps(q)

  return (
    <McpCatalogPageClient
      initialMcps={mcps}
      initialQuery={q ?? ''}
    />
  )
}
