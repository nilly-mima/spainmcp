// ═══════════════════════════════════════════════════
// SpainMCP Connect Proxy — Cloudflare Worker
// Handles: MCP JSON-RPC proxying, credential injection,
//          SSE streaming, RPC metering
// ═══════════════════════════════════════════════════

import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { createHash } from 'node:crypto'

interface Env {
  SUPABASE_URL: string
  SUPABASE_SERVICE_ROLE_KEY: string
  // OAUTH_KV: KVNamespace  // Phase 2
  // MCP_SESSION: DurableObjectNamespace  // Phase 2+
}

interface ConnectionRow {
  id: string
  connection_id: string
  namespace_id: string
  mcp_url: string
  status: string
  headers_encrypted: string | null
  metadata: Record<string, unknown>
  server_info: unknown
}

interface NamespaceRow {
  id: string
  name: string
  owner_id: string
}

const app = new Hono<{ Bindings: Env }>()

// CORS
app.use('*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Authorization', 'Content-Type'],
}))

// Health
app.get('/health', (c) =>
  c.json({ status: 'ok', service: 'spainmcp-connect', timestamp: new Date().toISOString() }),
)

// ── Auth helper ──

function getSupabase(env: Env): SupabaseClient {
  return createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY)
}

function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex')
}

async function authenticate(
  authorization: string | undefined,
  env: Env,
): Promise<{ userId: string; email?: string } | null> {
  if (!authorization?.startsWith('Bearer ')) return null
  const token = authorization.slice(7)
  const hash = hashToken(token)
  const sb = getSupabase(env)

  if (token.startsWith('smc_tk_')) {
    const { data } = await sb
      .from('scoped_tokens')
      .select('owner_id, expires_at, is_active')
      .eq('token_hash', hash)
      .single()
    if (!data?.is_active || new Date(data.expires_at) < new Date()) return null
    return { userId: data.owner_id }
  }

  // API key
  const { data } = await sb
    .from('api_keys')
    .select('email, is_active')
    .eq('key_hash', hash)
    .single()
  if (!data?.is_active) return null
  return { userId: data.email, email: data.email }
}

// ── MCP Proxy endpoint ──
// POST /proxy/:namespace/:connectionId/mcp

app.post('/proxy/:namespace/:connectionId/mcp', async (c) => {
  const start = Date.now()
  const env = c.env

  // Auth
  const auth = await authenticate(c.req.header('Authorization'), env)
  if (!auth) return c.json({ error: 'Unauthorized' }, 401)

  const { namespace, connectionId } = c.req.param()
  const sb = getSupabase(env)

  // Lookup namespace
  const { data: ns } = await sb
    .from('namespaces')
    .select('id, owner_id')
    .eq('name', namespace)
    .single()

  if (!ns) return c.json({ error: 'Namespace not found' }, 404)

  // Lookup connection
  const { data: conn } = await sb
    .from('connections')
    .select('id, connection_id, mcp_url, status, headers_encrypted, namespace_id, metadata, server_info')
    .eq('namespace_id', ns.id)
    .eq('connection_id', connectionId)
    .single() as { data: ConnectionRow | null }

  if (!conn) return c.json({ error: 'Connection not found' }, 404)
  if (conn.status !== 'connected') {
    return c.json({ error: `Connection status: ${conn.status}`, status: conn.status }, 409)
  }

  // Parse JSON-RPC body
  const body = await c.req.json()
  const method = body.method as string
  const toolName = method === 'tools/call' ? (body.params?.name as string) : undefined

  // Build upstream request headers
  const upstreamHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json, text/event-stream',
  }

  // Inject stored credentials
  if (conn.headers_encrypted) {
    try {
      const stored = JSON.parse(conn.headers_encrypted) as Record<string, string>
      Object.assign(upstreamHeaders, stored)
    } catch { /* ignore parse errors */ }
  }

  // Forward to upstream MCP server
  let upstreamRes: Response
  try {
    upstreamRes = await fetch(conn.mcp_url, {
      method: 'POST',
      headers: upstreamHeaders,
      body: JSON.stringify(body),
    })
  } catch (err) {
    const duration = Date.now() - start
    // Log failed RPC
    await sb.from('connection_logs').insert({
      connection_id: conn.id,
      namespace_id: ns.id,
      method,
      tool_name: toolName,
      duration_ms: duration,
      status_code: 502,
      error: String(err),
    }).then(() => {}, () => {})

    return c.json({ error: 'Upstream server unreachable' }, 502)
  }

  const duration = Date.now() - start

  // Log successful RPC (fire and forget)
  sb.from('connection_logs').insert({
    connection_id: conn.id,
    namespace_id: ns.id,
    method,
    tool_name: toolName,
    duration_ms: duration,
    status_code: upstreamRes.status,
    error: upstreamRes.ok ? null : `HTTP ${upstreamRes.status}`,
  }).then(() => {}, () => {})

  // Update last_used_at (fire and forget)
  sb.from('connections')
    .update({ last_used_at: new Date().toISOString() })
    .eq('id', conn.id)
    .then(() => {}, () => {})

  // Stream or return response
  const contentType = upstreamRes.headers.get('content-type') ?? ''

  if (contentType.includes('text/event-stream') && upstreamRes.body) {
    // SSE streaming — forward the ReadableStream directly
    return new Response(upstreamRes.body, {
      status: upstreamRes.status,
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
        'X-SpainMCP-Namespace': namespace,
        'X-SpainMCP-Proxy': '1',
      },
    })
  }

  // JSON response
  const responseBody = await upstreamRes.text()
  return new Response(responseBody, {
    status: upstreamRes.status,
    headers: {
      'Content-Type': contentType || 'application/json',
      'X-SpainMCP-Namespace': namespace,
      'X-SpainMCP-Proxy': '1',
      'X-SpainMCP-Duration': String(duration),
    },
  })
})

// ── Connection management endpoints (lightweight, delegates to Supabase) ──

app.get('/proxy/:namespace', async (c) => {
  const auth = await authenticate(c.req.header('Authorization'), c.env)
  if (!auth) return c.json({ error: 'Unauthorized' }, 401)

  const { namespace } = c.req.param()
  const sb = getSupabase(c.env)

  const { data: ns } = await sb
    .from('namespaces')
    .select('id')
    .eq('name', namespace)
    .single()

  if (!ns) return c.json({ error: 'Namespace not found' }, 404)

  const { data: connections } = await sb
    .from('connections')
    .select('connection_id, name, mcp_url, status, metadata, server_info, created_at, updated_at')
    .eq('namespace_id', ns.id)
    .order('created_at', { ascending: false })

  return c.json({ data: connections ?? [], count: connections?.length ?? 0 })
})

// Default export for CF Workers
export default app
