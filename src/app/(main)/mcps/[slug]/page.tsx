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

  // 2) Supabase mcp_catalog (imported — supports both remote and local MCPs)
  try {
    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    const { data, error } = await supabase
      .from('mcp_catalog')
      .select(
        `id, nombre, slug, descripcion_es, descripcion_en, scope, icon_url, upstream_url, downloads,
         categoria, verified, author, created_at, config,
         bundle_url, bundle_sha256, bundle_size_bytes, bundle_source, bundle_version,
         runtime, npm_package, homepage, license, repository_url,
         tools_list, prompts_list`
      )
      .eq('slug', slug)
      .eq('is_active', true)
      .eq('status', 'approved')
      .eq('is_public', true)
      .maybeSingle()

    if (error || !data) return null

    const desc = data.descripcion_es || data.descripcion_en || ''
    const cfg = (data.config ?? {}) as Record<string, unknown>

    // Derive instalacion_npx from config.installCommands if present, else use npm_package
    const installCmds = (cfg.installCommands ?? {}) as { npx?: string; claudeCode?: string }
    const instalacionNpx = installCmds.npx || (data.npm_package ? `npx -y ${data.npm_package}` : '')
    const instalacionClaude = installCmds.claudeCode || ''

    return {
      id: data.slug,
      nombre: data.nombre,
      descripcion_es: desc,
      descripcion_corta: desc.slice(0, 160),
      categoria: data.categoria ? [data.categoria] : ['otros'],
      tags: (cfg.tags as string[]) ?? [],
      instalacion_npx: instalacionNpx,
      instalacion_claude_code: instalacionClaude,
      variables_entorno: (cfg.variables_entorno as string[]) ?? [],
      github_url: data.repository_url || data.upstream_url || '',
      web_oficial: data.homepage || (cfg.web_oficial as string | undefined),
      compatible_con: (cfg.compatible_con as string[]) ?? [],
      verificado: !!data.verified,
      destacado: false,
      gratuito: (cfg.gratuito as boolean | undefined) ?? true,
      precio_info: cfg.precio_info as string | undefined,
      creador: data.author || 'spainmcp',
      num_tools: Array.isArray(data.tools_list) ? data.tools_list.length : ((cfg.num_tools as number | undefined) ?? 0),
      casos_uso_es: (cfg.casos_uso_es as string[]) ?? [],
      fecha_verificado: data.created_at?.slice(0, 10) || '',
      dificultad_instalacion: (cfg.dificultad_instalacion as 'facil' | 'media' | 'avanzada') ?? 'media',
      especifico_espana: cfg.especifico_espana as boolean | undefined,
      nota_es: cfg.nota_es as string | undefined,
      tools_list: (data.tools_list ?? cfg.tools_list) as Mcp['tools_list'],
      prompts_list: (data.prompts_list ?? cfg.prompts_list) as Mcp['prompts_list'],
      logo_url: data.icon_url || undefined,

      // Local MCP fields
      scope: data.scope as Mcp['scope'],
      bundle_url: data.bundle_url ?? undefined,
      bundle_sha256: data.bundle_sha256 ?? undefined,
      bundle_size_bytes: data.bundle_size_bytes ?? undefined,
      bundle_source: data.bundle_source as Mcp['bundle_source'],
      bundle_version: data.bundle_version ?? undefined,
      runtime: data.runtime ?? undefined,
      npm_package: data.npm_package ?? undefined,
      homepage: data.homepage ?? undefined,
      license: data.license ?? undefined,
      repository_url: data.repository_url ?? undefined,
      downloads: data.downloads ?? undefined,
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
