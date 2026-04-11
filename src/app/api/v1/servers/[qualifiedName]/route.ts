import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function getServiceClient() {
  return createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
}

// GET /api/v1/servers/:qualifiedName — Detalle de un MCP curado.
// Acepta "slug" o "author/slug". No permite escritura (catálogo curado).
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ qualifiedName: string }> }
) {
  const { qualifiedName: rawParam } = await params
  const qualifiedName = decodeURIComponent(rawParam)
  const slash = qualifiedName.indexOf('/')
  const slug = slash >= 0 ? qualifiedName.slice(slash + 1) : qualifiedName

  const supabase = getServiceClient()

  const { data, error } = await supabase
    .from('mcp_catalog')
    .select('slug, nombre, descripcion_es, descripcion_en, author, scope, icon_url, categoria, verified, downloads, upstream_url, runtime, npm_package, bundle_url, bundle_version, bundle_sha256, bundle_size_bytes, homepage, license, repository_url, prompts_list, tools_list, created_at, updated_at')
    .eq('slug', slug)
    .eq('is_active', true)
    .eq('status', 'approved')
    .eq('is_public', true)
    .single()

  if (error || !data) {
    return NextResponse.json({ error: 'Server not found' }, { status: 404 })
  }

  return NextResponse.json({
    qualifiedName: data.author ? `${data.author}/${data.slug}` : data.slug,
    slug: data.slug,
    displayName: data.nombre,
    description: data.descripcion_es ?? data.descripcion_en ?? '',
    descriptionEn: data.descripcion_en ?? '',
    author: data.author ?? 'spainmcp',
    category: data.categoria ?? 'general',
    scope: data.scope ?? 'local',
    isVerified: data.verified ?? false,
    iconUrl: data.icon_url ?? null,
    upstreamUrl: data.upstream_url ?? null,
    runtime: data.runtime ?? null,
    npmPackage: data.npm_package ?? null,
    bundle: data.bundle_url
      ? {
          url: data.bundle_url,
          version: data.bundle_version,
          sha256: data.bundle_sha256,
          sizeBytes: data.bundle_size_bytes,
        }
      : null,
    homepage: data.homepage ?? null,
    license: data.license ?? null,
    repositoryUrl: data.repository_url ?? null,
    tools: data.tools_list ?? [],
    prompts: data.prompts_list ?? [],
    useCount: data.downloads ?? 0,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  })
}
