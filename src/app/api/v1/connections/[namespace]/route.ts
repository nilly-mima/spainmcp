import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { authenticateRequest } from '@/lib/api-auth'
import { checkPlanLimit } from '@/lib/plan-limits'
import { randomUUID } from 'crypto'

function getServiceClient() {
  return createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
}

async function resolveNamespace(
  supabase: ReturnType<typeof getServiceClient>,
  namespace: string,
  userId: string
) {
  const { data, error } = await supabase
    .from('namespaces')
    .select('id, owner_id')
    .eq('name', namespace)
    .single()

  if (error || !data) return { ns: null, err: 'Namespace not found', status: 404 }
  if (data.owner_id !== userId) return { ns: null, err: 'Forbidden', status: 403 }
  return { ns: data, err: null, status: 200 }
}

async function pingUpstream(mcpUrl: string): Promise<boolean> {
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 8000)
    const res = await fetch(mcpUrl, { method: 'GET', signal: controller.signal })
    clearTimeout(timeout)
    return res.status < 500
  } catch {
    return false
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ namespace: string }> }
) {
  const auth = await authenticateRequest(req)
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { namespace } = await params

  let body: {
    mcpUrl?: string
    connectionId?: string
    name?: string
    metadata?: Record<string, unknown>
    headers?: Record<string, string>
  }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  if (!body.mcpUrl || typeof body.mcpUrl !== 'string') {
    return NextResponse.json({ error: 'mcpUrl is required' }, { status: 400 })
  }

  const supabase = getServiceClient()
  const { ns, err, status } = await resolveNamespace(supabase, namespace, auth.userId)
  if (!ns) return NextResponse.json({ error: err }, { status })

  const planCheck = await checkPlanLimit(supabase, auth.userId, 'connections')
  if (!planCheck.allowed) {
    return NextResponse.json(
      {
        error: `Has alcanzado el límite de ${planCheck.limit} connections en el plan gratuito. Actualiza a Pro para ilimitados.`,
      },
      { status: 403 }
    )
  }

  const connectionId = body.connectionId ?? randomUUID().replace(/-/g, '').slice(0, 12)

  const headersEncrypted = body.headers
    ? JSON.stringify(body.headers)
    : null

  const alive = await pingUpstream(body.mcpUrl)
  const connectionStatus = alive ? 'connected' : 'error'

  const { data, error: insertError } = await supabase
    .from('connections')
    .insert({
      connection_id: connectionId,
      namespace_id: ns.id,
      mcp_url: body.mcpUrl,
      name: body.name ?? null,
      status: connectionStatus,
      metadata: body.metadata ?? {},
      headers_encrypted: headersEncrypted,
    })
    .select('connection_id, status, created_at')
    .single()

  if (insertError) {
    if (insertError.code === '23505') {
      return NextResponse.json({ error: 'connectionId already exists in this namespace' }, { status: 409 })
    }
    console.error('Insert connection error:', insertError)
    return NextResponse.json({ error: 'Failed to create connection' }, { status: 500 })
  }

  return NextResponse.json(
    {
      connectionId: data.connection_id,
      status: data.status,
      serverInfo: null,
      createdAt: data.created_at,
    },
    { status: 201 }
  )
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ namespace: string }> }
) {
  const auth = await authenticateRequest(req)
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { namespace } = await params
  const { searchParams } = req.nextUrl
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10) || 1)
  const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get('pageSize') ?? '20', 10) || 20))
  const offset = (page - 1) * pageSize
  const metadataParam = searchParams.get('metadata')

  const supabase = getServiceClient()
  const { ns, err, status } = await resolveNamespace(supabase, namespace, auth.userId)
  if (!ns) return NextResponse.json({ error: err }, { status })

  let query = supabase
    .from('connections')
    .select(
      'connection_id, name, mcp_url, status, metadata, server_info, created_at, updated_at',
      { count: 'exact' }
    )
    .eq('namespace_id', ns.id)
    .order('created_at', { ascending: false })
    .range(offset, offset + pageSize - 1)

  if (metadataParam) {
    try {
      const metadataFilter = JSON.parse(metadataParam)
      query = query.contains('metadata', metadataFilter)
    } catch {
      return NextResponse.json({ error: 'metadata must be valid JSON' }, { status: 400 })
    }
  }

  const { data, error: queryError, count } = await query

  if (queryError) {
    console.error('List connections error:', queryError)
    return NextResponse.json({ error: 'Failed to list connections' }, { status: 500 })
  }

  const totalCount = count ?? 0
  const totalPages = Math.ceil(totalCount / pageSize)

  return NextResponse.json({
    data: (data ?? []).map((row) => ({
      connectionId: row.connection_id,
      name: row.name,
      mcpUrl: row.mcp_url,
      status: row.status,
      metadata: row.metadata,
      serverInfo: row.server_info,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    })),
    pagination: {
      currentPage: page,
      pageSize,
      totalPages,
      totalCount,
    },
  })
}
