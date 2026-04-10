import { notFound } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import { getMcpById, getAllMcps, type Mcp } from '@/lib/mcps'
import McpDetailClient from './McpDetailClient'

/**
 * Static generation sólo para los MCPs curados en JSON local.
 * Los MCPs importados a `mcp_catalog` se resuelven server-side on-demand
 * (Next.js `dynamicParams = true` por defecto).
 */
export async function generateStaticParams() {
  return getAllMcps().map(mcp => ({ slug: mcp.id }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const mcp = await getMcp(slug)
  if (!mcp) return {}
  return {
    title: `${mcp.nombre} — SpainMCP`,
    description: mcp.descripcion_corta,
  }
}

/**
 * Dual source — primero busca en JSON curado (14 MCPs con info completa:
 * tools_list, casos_uso, instalacion_npx, etc), luego en mcp_catalog
 * para los importados (info simplificada).
 */
async function getMcp(slug: string): Promise<Mcp | null> {
  // 1) Curated JSON (fast path, full detail)
  const curated = getMcpById(slug)
  if (curated) return curated

  // 2) Supabase mcp_catalog (imported, simplified detail)
  try {
    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    const { data, error } = await supabase
      .from('mcp_catalog')
      .select(
        'id, nombre, slug, descripcion_es, descripcion_en, scope, icon_url, upstream_url, downloads, categoria, verified, author, created_at, config'
      )
      .eq('slug', slug)
      .eq('is_active', true)
      .eq('status', 'approved')
      .eq('is_public', true)
      .maybeSingle()

    if (error || !data) return null

    const desc = data.descripcion_es || data.descripcion_en || ''
    const cfg = (data.config ?? {}) as Partial<Mcp>

    return {
      id: data.slug,
      nombre: data.nombre,
      descripcion_es: desc,
      descripcion_corta: desc.slice(0, 160),
      categoria: data.categoria ? [data.categoria] : ['otros'],
      tags: cfg.tags ?? [],
      instalacion_npx: cfg.instalacion_npx ?? '',
      instalacion_claude_code: cfg.instalacion_claude_code ?? '',
      variables_entorno: cfg.variables_entorno ?? [],
      github_url: data.upstream_url || '',
      web_oficial: cfg.web_oficial,
      compatible_con: cfg.compatible_con ?? [],
      verificado: !!data.verified,
      destacado: false,
      gratuito: cfg.gratuito ?? true,
      precio_info: cfg.precio_info,
      creador: data.author || 'spainmcp',
      num_tools: cfg.num_tools ?? 0,
      casos_uso_es: cfg.casos_uso_es ?? [],
      fecha_verificado: data.created_at?.slice(0, 10) || '',
      dificultad_instalacion: cfg.dificultad_instalacion ?? 'media',
      especifico_espana: cfg.especifico_espana,
      nota_es: cfg.nota_es,
      tools_list: cfg.tools_list,
      logo_url: data.icon_url || undefined,
    }
  } catch {
    return null
  }
}

export default async function McpPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const mcp = await getMcp(slug)
  if (!mcp) notFound()

  return <McpDetailClient mcp={mcp} />
}
