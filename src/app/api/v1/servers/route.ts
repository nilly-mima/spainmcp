import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function getServiceClient() {
  return createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
}

// GET /api/v1/servers — Lista pública del catálogo curado de MCPs.
// Los MCPs se publican vía formulario en /publish/mcp y admin los aprueba.
// No hay publicación programática — este endpoint es solo lectura.
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const q = searchParams.get('q')?.trim() ?? ''
  const author = searchParams.get('author')?.trim() ?? ''
  const categoria = searchParams.get('categoria')?.trim() ?? ''
  const scope = searchParams.get('scope')?.trim() ?? ''
  const verified = searchParams.get('verified') === 'true'
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10) || 1)
  const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get('pageSize') ?? '20', 10) || 20))
  const offset = (page - 1) * pageSize

  const supabase = getServiceClient()

  let query = supabase
    .from('mcp_catalog')
    .select(
      'slug, nombre, descripcion_es, descripcion_en, author, scope, icon_url, categoria, verified, downloads, created_at',
      { count: 'exact' }
    )
    .eq('is_active', true)
    .eq('status', 'approved')
    .eq('is_public', true)
    .order('created_at', { ascending: false })
    .range(offset, offset + pageSize - 1)

  if (q) {
    const esc = q.replace(/[%_]/g, '\\$&')
    query = query.or(
      `nombre.ilike.%${esc}%,descripcion_es.ilike.%${esc}%,descripcion_en.ilike.%${esc}%,slug.ilike.%${esc}%`
    )
  }
  if (author) query = query.eq('author', author)
  if (categoria) query = query.eq('categoria', categoria)
  if (scope) query = query.eq('scope', scope)
  if (verified) query = query.eq('verified', true)

  const { data, error, count } = await query

  if (error) {
    console.error('List servers error:', error)
    return NextResponse.json({ error: 'Failed to list servers' }, { status: 500 })
  }

  const totalCount = count ?? 0

  return NextResponse.json({
    servers: (data ?? []).map((row) => ({
      qualifiedName: row.author ? `${row.author}/${row.slug}` : row.slug,
      slug: row.slug,
      displayName: row.nombre,
      description: row.descripcion_es ?? row.descripcion_en ?? '',
      author: row.author ?? 'spainmcp',
      category: row.categoria ?? 'general',
      scope: row.scope ?? 'local',
      isVerified: row.verified ?? false,
      iconUrl: row.icon_url ?? null,
      useCount: row.downloads ?? 0,
      createdAt: row.created_at,
    })),
    pagination: {
      currentPage: page,
      pageSize,
      totalPages: Math.ceil(totalCount / pageSize),
      totalCount,
    },
  })
}
