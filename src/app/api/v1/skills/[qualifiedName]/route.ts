import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function getServiceClient() {
  return createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
}

// GET /api/v1/skills/:qualifiedName — Detalle de una skill curada.
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
    .from('skills_catalog')
    .select(
      'slug, nombre, descripcion, author, installs, stars, icon_url, categoria, content, repo_url, file_tree, created_at'
    )
    .eq('slug', slug)
    .eq('is_active', true)
    .eq('status', 'approved')
    .eq('is_public', true)
    .single()

  if (error || !data) {
    return NextResponse.json({ error: 'Skill not found' }, { status: 404 })
  }

  return NextResponse.json({
    qualifiedName: data.author ? `${data.author}/${data.slug}` : data.slug,
    slug: data.slug,
    displayName: data.nombre,
    description: data.descripcion ?? '',
    author: data.author ?? 'spainmcp',
    category: data.categoria ?? 'general',
    iconUrl: data.icon_url ?? null,
    installCount: data.installs ?? 0,
    stars: data.stars ?? 0,
    content: data.content ?? '',
    repositoryUrl: data.repo_url ?? null,
    fileTree: data.file_tree ?? null,
    createdAt: data.created_at,
  })
}
