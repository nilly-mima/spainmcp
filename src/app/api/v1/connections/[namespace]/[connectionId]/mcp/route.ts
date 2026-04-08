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

export async function POST(
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

  const { data: conn, error: connError } = await supabase
    .from('connections')
    .select('id, mcp_url, status, headers_encrypted')
    .eq('namespace_id', ns.id)
    .eq('connection_id', connectionId)
    .single()

  if (connError || !conn) {
    return NextResponse.json({ error: 'Connection not found' }, { status: 404 })
  }

  if (conn.status !== 'connected') {
    return NextResponse.json(
      { error: `Connection is not active (status: ${conn.status})` },
      { status: 409 }
    )
  }

  let rpcBody: { method?: string; params?: unknown }
  try {
    rpcBody = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON-RPC body' }, { status: 400 })
  }

  const upstreamHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
  }

  if (conn.headers_encrypted) {
    try {
      const stored = JSON.parse(conn.headers_encrypted) as Record<string, string>
      Object.assign(upstreamHeaders, stored)
    } catch {
      // malformed stored headers — skip
    }
  }

  const method = typeof rpcBody.method === 'string' ? rpcBody.method : 'unknown'
  const toolName =
    method === 'tools/call' && rpcBody.params && typeof (rpcBody.params as Record<string, unknown>).name === 'string'
      ? ((rpcBody.params as Record<string, unknown>).name as string)
      : null

  const startMs = Date.now()

  let upstreamResponse: Response
  try {
    upstreamResponse = await fetch(conn.mcp_url, {
      method: 'POST',
      headers: upstreamHeaders,
      body: JSON.stringify(rpcBody),
    })
  } catch (fetchErr) {
    const duration = Date.now() - startMs
    await logRpc(supabase, conn.id, ns.id, method, toolName, duration, 0, String(fetchErr))
    return NextResponse.json(
      { error: 'Upstream unreachable', detail: String(fetchErr) },
      { status: 502 }
    )
  }

  const duration = Date.now() - startMs

  // Log and update last_used_at in parallel — fire and forget
  Promise.all([
    logRpc(supabase, conn.id, ns.id, method, toolName, duration, upstreamResponse.status, null),
    supabase.from('connections').update({ last_used_at: new Date().toISOString() }).eq('id', conn.id),
  ]).catch(console.error)

  const contentType = upstreamResponse.headers.get('content-type') ?? ''

  // Stream SSE responses directly
  if (contentType.includes('text/event-stream') && upstreamResponse.body) {
    return new NextResponse(upstreamResponse.body, {
      status: upstreamResponse.status,
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    })
  }

  const responseBody = await upstreamResponse.text()

  return new NextResponse(responseBody, {
    status: upstreamResponse.status,
    headers: {
      'Content-Type': contentType || 'application/json',
    },
  })
}

async function logRpc(
  supabase: ReturnType<typeof getServiceClient>,
  connectionPk: string,
  namespaceId: string,
  method: string,
  toolName: string | null,
  durationMs: number,
  statusCode: number,
  errorMsg: string | null
) {
  await supabase.from('connection_logs').insert({
    connection_id: connectionPk,
    namespace_id: namespaceId,
    method,
    tool_name: toolName,
    duration_ms: durationMs,
    status_code: statusCode,
    error: errorMsg,
  })
}
