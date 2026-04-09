import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { authenticateRequest } from '@/lib/api-auth'
import { checkPlanLimit } from '@/lib/plan-limits'

function getServiceClient() {
  return createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
}

async function pingUpstream(url: string): Promise<boolean> {
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json, text/event-stream' },
      body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'ping', params: {} }),
      signal: AbortSignal.timeout(8000),
    })
    return res.status < 500
  } catch {
    return false
  }
}

async function verifyNamespaceOwnership(
  supabase: ReturnType<typeof getServiceClient>,
  namespace: string,
  userId: string
): Promise<boolean> {
  const { data, error } = await supabase
    .from('namespaces')
    .select('owner_id')
    .eq('name', namespace)
    .single()

  if (error || !data) return false
  return data.owner_id === userId
}

// PUT /api/v1/servers/:qualifiedName — Create/upsert server
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ qualifiedName: string }> }
) {
  const auth = await authenticateRequest(req)
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { qualifiedName: rawParam } = await params
  const qualifiedName = decodeURIComponent(rawParam)

  // Validate format: "namespace/server-name" or "server-name"
  const QUALIFIED_REGEX = /^[a-z0-9][a-z0-9-]*(?:\/[a-z0-9][a-z0-9-]*)?$/
  if (!QUALIFIED_REGEX.test(qualifiedName) || qualifiedName.length > 128) {
    return NextResponse.json(
      { error: 'qualifiedName must be "namespace/server-name" or "server-name" (lowercase, hyphens, max 128 chars)' },
      { status: 400 }
    )
  }

  let body: {
    displayName?: string
    description?: string
    upstreamUrl?: string
    configSchema?: Record<string, unknown>
    isPrivate?: boolean
  }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const { displayName, description, upstreamUrl, configSchema, isPrivate } = body

  if (!displayName || typeof displayName !== 'string') {
    return NextResponse.json({ error: 'displayName is required' }, { status: 400 })
  }
  if (!upstreamUrl || typeof upstreamUrl !== 'string') {
    return NextResponse.json({ error: 'upstreamUrl is required' }, { status: 400 })
  }
  if (!upstreamUrl.startsWith('https://')) {
    return NextResponse.json({ error: 'upstreamUrl must be HTTPS' }, { status: 400 })
  }

  const supabase = getServiceClient()

  const ownerEmail = auth.email ?? auth.userId

  const planCheck = await checkPlanLimit(supabase, ownerEmail, 'servers')
  if (!planCheck.allowed) {
    // Only block if this is a new server (not an upsert update of an existing one)
    const { data: existing } = await supabase
      .from('mcp_servers')
      .select('namespace')
      .eq('namespace', qualifiedName)
      .eq('owner_email', ownerEmail)
      .maybeSingle()

    if (!existing) {
      return NextResponse.json(
        {
          error: `Has alcanzado el límite de ${planCheck.limit} servers en el plan gratuito. Actualiza a Pro para ilimitados.`,
        },
        { status: 403 }
      )
    }
  }

  // If qualifiedName contains "/", verify namespace ownership
  if (qualifiedName.includes('/')) {
    const namespace = qualifiedName.split('/')[0]
    const owns = await verifyNamespaceOwnership(supabase, namespace, auth.userId)
    if (!owns) {
      return NextResponse.json({ error: 'Forbidden: namespace not owned by this account' }, { status: 403 })
    }
  }

  const alive = await pingUpstream(upstreamUrl)
  if (!alive) {
    return NextResponse.json(
      { error: 'Upstream server did not respond. Verify it is online and accessible.' },
      { status: 422 }
    )
  }

  const upsertPayload: Record<string, unknown> = {
    namespace: qualifiedName,
    display_name: displayName,
    description: description ?? '',
    upstream_url: upstreamUrl,
    owner_email: ownerEmail,
    is_active: true,
    is_private: isPrivate === true,
  }
  if (configSchema !== undefined) {
    upsertPayload.config_schema = configSchema
  }

  const { data, error: dbError } = await supabase
    .from('mcp_servers')
    .upsert(upsertPayload, { onConflict: 'namespace' })
    .select('namespace, display_name, description, upstream_url, is_active, created_at')
    .single()

  if (dbError) {
    console.error('Supabase upsert error:', dbError)
    return NextResponse.json({ error: 'Failed to save server' }, { status: 500 })
  }

  return NextResponse.json(
    {
      qualifiedName: data.namespace,
      displayName: data.display_name,
      description: data.description,
      upstreamUrl: data.upstream_url,
      isActive: data.is_active,
      createdAt: data.created_at,
    },
    { status: 200 }
  )
}

// GET /api/v1/servers/:qualifiedName — Get server details
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ qualifiedName: string }> }
) {
  const { qualifiedName: rawParam } = await params
  const qualifiedName = decodeURIComponent(rawParam)

  const auth = await authenticateRequest(req)
  const supabase = getServiceClient()

  const { data, error } = await supabase
    .from('mcp_servers')
    .select('namespace, display_name, description, upstream_url, owner_email, is_active, is_verified, is_private, install_count, last_used_at, created_at')
    .eq('namespace', qualifiedName)
    .eq('is_active', true)
    .single()

  if (error || !data) {
    return NextResponse.json({ error: 'Server not found' }, { status: 404 })
  }

  // Private servers are only visible to their owner
  if (data.is_private) {
    const requestorEmail = auth?.email ?? auth?.userId
    if (!requestorEmail || requestorEmail !== data.owner_email) {
      return NextResponse.json({ error: 'Server not found' }, { status: 404 })
    }
  }

  return NextResponse.json({
    qualifiedName: data.namespace,
    displayName: data.display_name,
    description: data.description ?? '',
    upstreamUrl: data.upstream_url,
    ownerEmail: data.owner_email,
    isActive: data.is_active,
    isVerified: data.is_verified,
    isPrivate: data.is_private ?? false,
    useCount: data.install_count,
    lastUsedAt: data.last_used_at,
    createdAt: data.created_at,
  })
}

// PATCH /api/v1/servers/:qualifiedName — Update server metadata
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ qualifiedName: string }> }
) {
  const auth = await authenticateRequest(req)
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { qualifiedName: rawParam } = await params
  const qualifiedName = decodeURIComponent(rawParam)

  let body: {
    displayName?: string
    description?: string
    configSchema?: Record<string, unknown>
    isActive?: boolean
  }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const supabase = getServiceClient()

  // Verify ownership
  const { data: existing, error: fetchError } = await supabase
    .from('mcp_servers')
    .select('namespace, owner_email')
    .eq('namespace', qualifiedName)
    .single()

  if (fetchError || !existing) {
    return NextResponse.json({ error: 'Server not found' }, { status: 404 })
  }

  const ownerIdentity = auth.email ?? auth.userId
  if (existing.owner_email !== ownerIdentity) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const updates: Record<string, unknown> = {}
  if (body.displayName !== undefined) updates.display_name = body.displayName
  if (body.description !== undefined) updates.description = body.description
  if (body.configSchema !== undefined) updates.config_schema = body.configSchema
  if (body.isActive !== undefined) updates.is_active = body.isActive

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'No fields to update' }, { status: 400 })
  }

  const { data, error: updateError } = await supabase
    .from('mcp_servers')
    .update(updates)
    .eq('namespace', qualifiedName)
    .select('namespace, display_name, description, is_active, created_at')
    .single()

  if (updateError) {
    console.error('Supabase update error:', updateError)
    return NextResponse.json({ error: 'Failed to update server' }, { status: 500 })
  }

  return NextResponse.json({
    qualifiedName: data.namespace,
    displayName: data.display_name,
    description: data.description,
    isActive: data.is_active,
    createdAt: data.created_at,
  })
}

// DELETE /api/v1/servers/:qualifiedName — Soft delete
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ qualifiedName: string }> }
) {
  const auth = await authenticateRequest(req)
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { qualifiedName: rawParam } = await params
  const qualifiedName = decodeURIComponent(rawParam)

  const supabase = getServiceClient()

  const { data: existing, error: fetchError } = await supabase
    .from('mcp_servers')
    .select('namespace, owner_email')
    .eq('namespace', qualifiedName)
    .single()

  if (fetchError || !existing) {
    return NextResponse.json({ error: 'Server not found' }, { status: 404 })
  }

  const ownerIdentity = auth.email ?? auth.userId
  if (existing.owner_email !== ownerIdentity) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { error: updateError } = await supabase
    .from('mcp_servers')
    .update({ is_active: false })
    .eq('namespace', qualifiedName)

  if (updateError) {
    console.error('Supabase soft-delete error:', updateError)
    return NextResponse.json({ error: 'Failed to delete server' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
