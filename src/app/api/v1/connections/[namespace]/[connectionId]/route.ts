import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { authenticateRequest } from '@/lib/api-auth'

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

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ namespace: string; connectionId: string }> }
) {
  const auth = await authenticateRequest(req)
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { namespace, connectionId } = await params
  const supabase = getServiceClient()
  const { ns, err, status } = await resolveNamespace(supabase, namespace, auth.userId)
  if (!ns) return NextResponse.json({ error: err }, { status })

  const { data, error: fetchError } = await supabase
    .from('connections')
    .select('connection_id, name, mcp_url, status, metadata, server_info, created_at, updated_at')
    .eq('namespace_id', ns.id)
    .eq('connection_id', connectionId)
    .single()

  if (fetchError || !data) {
    return NextResponse.json({ error: 'Connection not found' }, { status: 404 })
  }

  return NextResponse.json({
    connectionId: data.connection_id,
    name: data.name,
    mcpUrl: data.mcp_url,
    status: data.status,
    metadata: data.metadata,
    serverInfo: data.server_info,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  })
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ namespace: string; connectionId: string }> }
) {
  const auth = await authenticateRequest(req)
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { namespace, connectionId } = await params

  let body: {
    mcpUrl?: string
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

  const headersEncrypted = body.headers ? JSON.stringify(body.headers) : null
  const alive = await pingUpstream(body.mcpUrl)
  const connectionStatus = alive ? 'connected' : 'error'

  const { data, error: upsertError } = await supabase
    .from('connections')
    .upsert(
      {
        connection_id: connectionId,
        namespace_id: ns.id,
        mcp_url: body.mcpUrl,
        name: body.name ?? null,
        status: connectionStatus,
        metadata: body.metadata ?? {},
        headers_encrypted: headersEncrypted,
      },
      { onConflict: 'namespace_id,connection_id' }
    )
    .select('connection_id, name, mcp_url, status, metadata, server_info, created_at, updated_at')
    .single()

  if (upsertError) {
    console.error('Upsert connection error:', upsertError)
    return NextResponse.json({ error: 'Failed to upsert connection' }, { status: 500 })
  }

  return NextResponse.json({
    connectionId: data.connection_id,
    name: data.name,
    mcpUrl: data.mcp_url,
    status: data.status,
    metadata: data.metadata,
    serverInfo: data.server_info,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  })
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ namespace: string; connectionId: string }> }
) {
  const auth = await authenticateRequest(req)
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { namespace, connectionId } = await params
  const supabase = getServiceClient()
  const { ns, err, status } = await resolveNamespace(supabase, namespace, auth.userId)
  if (!ns) return NextResponse.json({ error: err }, { status })

  const { data: existing, error: fetchError } = await supabase
    .from('connections')
    .select('id')
    .eq('namespace_id', ns.id)
    .eq('connection_id', connectionId)
    .single()

  if (fetchError || !existing) {
    return NextResponse.json({ error: 'Connection not found' }, { status: 404 })
  }

  const { error: deleteError } = await supabase
    .from('connections')
    .delete()
    .eq('id', existing.id)

  if (deleteError) {
    console.error('Delete connection error:', deleteError)
    return NextResponse.json({ error: 'Failed to delete connection' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
