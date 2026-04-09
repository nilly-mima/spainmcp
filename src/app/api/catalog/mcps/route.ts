import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function getServiceClient() {
  return createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const q = searchParams.get('q')?.trim() ?? ''
  const scope = searchParams.get('scope')?.trim() ?? ''
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10) || 1)
  const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get('pageSize') ?? '50', 10) || 50))
  const offset = (page - 1) * pageSize

  const supabase = getServiceClient()

  let query = supabase
    .from('mcp_catalog')
    .select('id, nombre, slug, descripcion_es, descripcion_en, scope, icon_url, upstream_url, downloads, is_active, created_at, categoria', { count: 'exact' })
    .eq('is_active', true)
    .order('downloads', { ascending: false })
    .range(offset, offset + pageSize - 1)

  if (q) {
    query = query.or(`nombre.ilike.%${q}%,descripcion_es.ilike.%${q}%,descripcion_en.ilike.%${q}%,slug.ilike.%${q}%`)
  }

  if (scope) {
    query = query.eq('scope', scope)
  }

  const { data, error, count } = await query

  if (error) {
    console.error('catalog/mcps GET error:', error)
    return NextResponse.json({ error: 'Error loading catalog' }, { status: 500 })
  }

  return NextResponse.json({
    mcps: data ?? [],
    pagination: {
      currentPage: page,
      pageSize,
      totalPages: Math.ceil((count ?? 0) / pageSize),
      totalCount: count ?? 0,
    },
  })
}
