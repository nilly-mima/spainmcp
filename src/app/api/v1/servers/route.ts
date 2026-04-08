import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function getServiceClient() {
  return createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const q = searchParams.get('q')?.trim() || null
  const owner = searchParams.get('owner')?.trim() || null
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10) || 1)
  const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get('pageSize') ?? '20', 10) || 20))
  const offset = (page - 1) * pageSize

  const supabase = getServiceClient()

  let query = supabase
    .from('mcp_servers')
    .select('namespace, display_name, description, is_verified, install_count, owner_email, created_at', { count: 'exact' })
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .range(offset, offset + pageSize - 1)

  if (q) {
    query = query.or(`display_name.ilike.%${q}%,description.ilike.%${q}%`)
  }

  if (owner) {
    query = query.eq('owner_email', owner)
  }

  const { data, error, count } = await query

  if (error) {
    console.error('Supabase query error:', error)
    return NextResponse.json({ error: 'Failed to list servers' }, { status: 500 })
  }

  const totalCount = count ?? 0
  const totalPages = Math.ceil(totalCount / pageSize)

  return NextResponse.json({
    servers: (data ?? []).map((row) => ({
      qualifiedName: row.namespace,
      displayName: row.display_name,
      description: row.description ?? '',
      iconUrl: null,
      isVerified: row.is_verified,
      useCount: row.install_count,
      remote: true,
      createdAt: row.created_at,
    })),
    pagination: {
      currentPage: page,
      pageSize,
      totalPages,
      totalCount,
    },
  })
}
