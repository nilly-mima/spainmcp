import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function getServiceClient() {
  return createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
}

// GET /api/v1/skills — Lista pública del catálogo curado de skills.
// Las skills se publican vía formulario en /publish/skill y admin las aprueba.
// No hay publicación programática — este endpoint es solo lectura.
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const q = searchParams.get('q')?.trim() ?? ''
  const author = searchParams.get('author')?.trim() ?? ''
  const categoria = searchParams.get('categoria')?.trim() ?? ''
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10) || 1)
  const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get('pageSize') ?? '20', 10) || 20))
  const offset = (page - 1) * pageSize

  const supabase = getServiceClient()

  let query = supabase
    .from('skills_catalog')
    .select(
      'slug, nombre, descripcion, author, installs, stars, icon_url, categoria, created_at',
      { count: 'exact' }
    )
    .eq('is_active', true)
    .eq('status', 'approved')
    .eq('is_public', true)
    .order('created_at', { ascending: false })
    .range(offset, offset + pageSize - 1)

  if (q) {
    const esc = q.replace(/[%_]/g, '\\$&')
    query = query.or(`nombre.ilike.%${esc}%,descripcion.ilike.%${esc}%,slug.ilike.%${esc}%`)
  }
  if (author) query = query.eq('author', author)
  if (categoria) query = query.eq('categoria', categoria)

  const { data, error, count } = await query

  if (error) {
    console.error('List skills error:', error)
    return NextResponse.json({ error: 'Failed to list skills' }, { status: 500 })
  }

  const totalCount = count ?? 0

  return NextResponse.json({
    skills: (data ?? []).map((row) => ({
      qualifiedName: row.author ? `${row.author}/${row.slug}` : row.slug,
      slug: row.slug,
      displayName: row.nombre,
      description: row.descripcion ?? '',
      author: row.author ?? 'spainmcp',
      category: row.categoria ?? 'general',
      iconUrl: row.icon_url ?? null,
      installCount: row.installs ?? 0,
      stars: row.stars ?? 0,
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
