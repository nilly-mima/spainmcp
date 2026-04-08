// ═══════════════════════════════════════════════════
// SpainMCP Connect Proxy — Cloudflare Worker
// OAuth 2.1 server + MCP JSON-RPC proxy + credential injection
// ═══════════════════════════════════════════════════

import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { createClient } from '@supabase/supabase-js'

interface Env {
  SUPABASE_URL: string
  SUPABASE_SERVICE_ROLE_KEY: string
  OAUTH_KV: KVNamespace
  GITHUB_CLIENT_ID?: string
  GITHUB_CLIENT_SECRET?: string
  GOOGLE_CLIENT_ID?: string
  GOOGLE_CLIENT_SECRET?: string
}

// ── Crypto helpers (Web Crypto API) ──

async function hashToken(token: string): Promise<string> {
  const data = new TextEncoder().encode(token)
  const hash = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('')
}

function randomHex(bytes: number): string {
  const arr = new Uint8Array(bytes)
  crypto.getRandomValues(arr)
  return Array.from(arr).map(b => b.toString(16).padStart(2, '0')).join('')
}

// ── Supabase helper ──

function getSupabase(env: Env) {
  return createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY)
}

// ── Auth helper ──

async function authenticate(authorization: string | undefined, env: Env) {
  if (!authorization?.startsWith('Bearer ')) return null
  const token = authorization.slice(7)
  const hash = await hashToken(token)
  const sb = getSupabase(env)

  if (token.startsWith('smc_tk_')) {
    const { data } = await sb.from('scoped_tokens')
      .select('owner_id, expires_at, is_active')
      .eq('token_hash', hash).single()
    if (!data?.is_active || new Date(data.expires_at) < new Date()) return null
    return { userId: data.owner_id }
  }

  const { data } = await sb.from('api_keys')
    .select('email, is_active')
    .eq('key_hash', hash).single()
  if (!data?.is_active) return null
  return { userId: data.email, email: data.email }
}

// ── OAuth provider configs ──

interface OAuthProviderConfig {
  authUrl: string
  tokenUrl: string
  scopes: string[]
  clientId: string
  clientSecret: string
}

function getOAuthProvider(providerName: string, env: Env): OAuthProviderConfig | null {
  switch (providerName) {
    case 'github':
      if (!env.GITHUB_CLIENT_ID || !env.GITHUB_CLIENT_SECRET) return null
      return {
        authUrl: 'https://github.com/login/oauth/authorize',
        tokenUrl: 'https://github.com/login/oauth/access_token',
        scopes: ['repo', 'read:user'],
        clientId: env.GITHUB_CLIENT_ID,
        clientSecret: env.GITHUB_CLIENT_SECRET,
      }
    case 'google':
      if (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET) return null
      return {
        authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
        tokenUrl: 'https://oauth2.googleapis.com/token',
        scopes: ['openid', 'email', 'https://www.googleapis.com/auth/gmail.readonly'],
        clientId: env.GOOGLE_CLIENT_ID,
        clientSecret: env.GOOGLE_CLIENT_SECRET,
      }
    default:
      return null
  }
}

function detectProvider(mcpUrl: string): string | null {
  if (mcpUrl.includes('github')) return 'github'
  if (mcpUrl.includes('google') || mcpUrl.includes('gmail') || mcpUrl.includes('sheets')) return 'google'
  if (mcpUrl.includes('notion')) return 'notion'
  if (mcpUrl.includes('slack')) return 'slack'
  return null
}

// ── App ──

const app = new Hono<{ Bindings: Env }>()

app.use('*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Authorization', 'Content-Type'],
}))

// Health
app.get('/health', (c) =>
  c.json({ status: 'ok', service: 'spainmcp-connect', timestamp: new Date().toISOString() }),
)

// ═══════════════════════════════════════════════════
// OAuth endpoints
// ═══════════════════════════════════════════════════

// Start OAuth flow — redirect user to upstream provider
app.get('/oauth/start/:connectionId', async (c) => {
  const connectionId = c.req.param('connectionId')
  const env = c.env

  // Get OAuth state from KV
  const stateData = await env.OAUTH_KV.get(`oauth_pending:${connectionId}`, 'json') as {
    provider: string
    namespace_id: string
    connection_pk: string
    redirect_after?: string
  } | null

  if (!stateData) {
    return c.json({ error: 'OAuth session not found or expired' }, 404)
  }

  const provider = getOAuthProvider(stateData.provider, env)
  if (!provider) {
    return c.json({ error: `OAuth provider ${stateData.provider} not configured` }, 500)
  }

  // Generate state token
  const state = randomHex(16)
  await env.OAUTH_KV.put(`oauth_state:${state}`, JSON.stringify({
    connectionId,
    ...stateData,
  }), { expirationTtl: 600 }) // 10 min

  const params = new URLSearchParams({
    client_id: provider.clientId,
    redirect_uri: `https://spainmcp-connect.nilmiq.workers.dev/oauth/callback`,
    scope: provider.scopes.join(' '),
    state,
    response_type: 'code',
    ...(stateData.provider === 'google' ? { access_type: 'offline', prompt: 'consent' } : {}),
  })

  return c.redirect(`${provider.authUrl}?${params.toString()}`)
})

// OAuth callback — exchange code for tokens, store credentials
app.get('/oauth/callback', async (c) => {
  const { code, state, error: oauthError } = c.req.query()
  const env = c.env

  if (oauthError) {
    return c.html(`<h1>Error</h1><p>${oauthError}</p>`)
  }

  if (!code || !state) {
    return c.html('<h1>Error</h1><p>Missing code or state</p>')
  }

  // Lookup state
  const stateData = await env.OAUTH_KV.get(`oauth_state:${state}`, 'json') as {
    connectionId: string
    provider: string
    namespace_id: string
    connection_pk: string
    redirect_after?: string
  } | null

  if (!stateData) {
    return c.html('<h1>Error</h1><p>Invalid or expired OAuth state</p>')
  }

  // Clean up state
  await env.OAUTH_KV.delete(`oauth_state:${state}`)
  await env.OAUTH_KV.delete(`oauth_pending:${stateData.connectionId}`)

  const provider = getOAuthProvider(stateData.provider, env)
  if (!provider) {
    return c.html(`<h1>Error</h1><p>Provider not configured</p>`)
  }

  // Exchange code for tokens
  const tokenRes = await fetch(provider.tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Accept: 'application/json',
    },
    body: new URLSearchParams({
      client_id: provider.clientId,
      client_secret: provider.clientSecret,
      code,
      redirect_uri: `https://spainmcp-connect.nilmiq.workers.dev/oauth/callback`,
      grant_type: 'authorization_code',
    }).toString(),
  })

  const tokens = await tokenRes.json() as {
    access_token?: string
    refresh_token?: string
    expires_in?: number
    token_type?: string
    error?: string
  }

  if (!tokens.access_token) {
    return c.html(`<h1>Error</h1><p>Token exchange failed: ${tokens.error ?? 'unknown'}</p>`)
  }

  // Store credentials in Supabase (encrypted via Vault)
  const sb = getSupabase(env)

  // Store as encrypted headers
  const credentialHeaders = JSON.stringify({
    Authorization: `${tokens.token_type ?? 'Bearer'} ${tokens.access_token}`,
  })

  await sb.from('connections').update({
    headers_encrypted: credentialHeaders,
    status: 'connected',
    auth_url: null,
    error_message: null,
    updated_at: new Date().toISOString(),
  }).eq('id', stateData.connection_pk)

  // Store refresh token in KV (for token refresh cron)
  if (tokens.refresh_token) {
    await env.OAUTH_KV.put(`refresh:${stateData.connection_pk}`, JSON.stringify({
      refresh_token: tokens.refresh_token,
      provider: stateData.provider,
      expires_in: tokens.expires_in ?? 3600,
      stored_at: Date.now(),
    }), { expirationTtl: 86400 * 30 }) // 30 days
  }

  // Redirect to success page or dashboard
  const redirectUrl = stateData.redirect_after ?? 'https://spainmcp-fngo.vercel.app/account/connections'
  return c.html(`
    <html>
    <head><meta http-equiv="refresh" content="2;url=${redirectUrl}"></head>
    <body style="font-family:system-ui;display:flex;justify-content:center;align-items:center;height:100vh;background:#0a0a0a;color:white">
      <div style="text-align:center">
        <h2>Conexion establecida</h2>
        <p>Redirigiendo...</p>
      </div>
    </body>
    </html>
  `)
})

// ═══════════════════════════════════════════════════
// Connection management (enhanced with OAuth)
// ═══════════════════════════════════════════════════

// Create connection — detects if OAuth is needed
app.post('/proxy/:namespace', async (c) => {
  const auth = await authenticate(c.req.header('Authorization'), c.env)
  if (!auth) return c.json({ error: 'Unauthorized' }, 401)

  const { namespace } = c.req.param()
  const body = await c.req.json() as {
    mcpUrl: string
    connectionId?: string
    name?: string
    metadata?: Record<string, unknown>
    headers?: Record<string, string>
  }

  const sb = getSupabase(c.env)

  // Resolve namespace
  const { data: ns } = await sb.from('namespaces')
    .select('id, owner_id').eq('name', namespace).single()
  if (!ns) return c.json({ error: 'Namespace not found' }, 404)

  const connId = body.connectionId ?? randomHex(8)

  // Detect if OAuth is needed
  const provider = detectProvider(body.mcpUrl)
  const oauthConfig = provider ? getOAuthProvider(provider, c.env) : null

  // If OAuth provider detected and no headers provided
  if (oauthConfig && !body.headers) {
    // Insert connection with auth_required status
    const authUrl = `https://spainmcp-connect.nilmiq.workers.dev/oauth/start/${connId}`

    const { data: conn, error } = await sb.from('connections').insert({
      connection_id: connId,
      namespace_id: ns.id,
      mcp_url: body.mcpUrl,
      name: body.name ?? null,
      status: 'auth_required',
      auth_url: authUrl,
      metadata: body.metadata ?? {},
    }).select('id').single()

    if (error) return c.json({ error: error.message }, 500)

    // Store OAuth state in KV
    await c.env.OAUTH_KV.put(`oauth_pending:${connId}`, JSON.stringify({
      provider,
      namespace_id: ns.id,
      connection_pk: conn.id,
    }), { expirationTtl: 3600 })

    return c.json({
      connectionId: connId,
      status: 'auth_required',
      authorizationUrl: authUrl,
      createdAt: new Date().toISOString(),
    })
  }

  // Non-OAuth: direct connection with headers
  // Ping upstream
  let status = 'connected'
  try {
    const ping = await fetch(body.mcpUrl, {
      method: 'GET',
      headers: { Accept: 'application/json, text/event-stream' },
      signal: AbortSignal.timeout(8000),
    })
    if (ping.status >= 500) status = 'error'
  } catch {
    status = 'error'
  }

  const { error } = await sb.from('connections').insert({
    connection_id: connId,
    namespace_id: ns.id,
    mcp_url: body.mcpUrl,
    name: body.name ?? null,
    status,
    metadata: body.metadata ?? {},
    headers_encrypted: body.headers ? JSON.stringify(body.headers) : null,
  })

  if (error) return c.json({ error: error.message }, 500)

  return c.json({
    connectionId: connId,
    status,
    serverInfo: null,
    createdAt: new Date().toISOString(),
  })
})

// List connections
app.get('/proxy/:namespace', async (c) => {
  const auth = await authenticate(c.req.header('Authorization'), c.env)
  if (!auth) return c.json({ error: 'Unauthorized' }, 401)

  const { namespace } = c.req.param()
  const sb = getSupabase(c.env)

  const { data: ns } = await sb.from('namespaces')
    .select('id').eq('name', namespace).single()
  if (!ns) return c.json({ error: 'Namespace not found' }, 404)

  const { data } = await sb.from('connections')
    .select('connection_id, name, mcp_url, status, auth_url, metadata, server_info, created_at, updated_at')
    .eq('namespace_id', ns.id)
    .order('created_at', { ascending: false })

  return c.json({ data: data ?? [], count: data?.length ?? 0 })
})

// ═══════════════════════════════════════════════════
// MCP Proxy — forward JSON-RPC with credential injection
// ═══════════════════════════════════════════════════

app.post('/proxy/:namespace/:connectionId/mcp', async (c) => {
  const start = Date.now()
  const env = c.env
  const auth = await authenticate(c.req.header('Authorization'), env)
  if (!auth) return c.json({ error: 'Unauthorized' }, 401)

  const { namespace, connectionId } = c.req.param()
  const sb = getSupabase(env)

  const { data: ns } = await sb.from('namespaces')
    .select('id, owner_id').eq('name', namespace).single()
  if (!ns) return c.json({ error: 'Namespace not found' }, 404)

  const { data: conn } = await sb.from('connections')
    .select('id, mcp_url, status, headers_encrypted')
    .eq('namespace_id', ns.id).eq('connection_id', connectionId).single()

  if (!conn) return c.json({ error: 'Connection not found' }, 404)
  if (conn.status !== 'connected') {
    return c.json({ error: `Connection status: ${conn.status}`, status: conn.status }, 409)
  }

  const body = await c.req.json()
  const method = (body.method as string) ?? 'unknown'
  const toolName = method === 'tools/call' ? (body.params?.name as string) : undefined

  // Build upstream headers with credential injection
  const upstreamHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept': 'application/json, text/event-stream',
  }
  if (conn.headers_encrypted) {
    try {
      Object.assign(upstreamHeaders, JSON.parse(conn.headers_encrypted))
    } catch { /* ignore */ }
  }

  // Forward to upstream
  let upstreamRes: Response
  try {
    upstreamRes = await fetch(conn.mcp_url, {
      method: 'POST',
      headers: upstreamHeaders,
      body: JSON.stringify(body),
    })
  } catch (err) {
    const duration = Date.now() - start
    sb.from('connection_logs').insert({
      connection_id: conn.id, namespace_id: ns.id, method,
      tool_name: toolName, duration_ms: duration, status_code: 502, error: String(err),
    }).then(() => {}, () => {})
    return c.json({ error: 'Upstream unreachable' }, 502)
  }

  const duration = Date.now() - start

  // Log + update (fire and forget)
  sb.from('connection_logs').insert({
    connection_id: conn.id, namespace_id: ns.id, method,
    tool_name: toolName, duration_ms: duration, status_code: upstreamRes.status,
    error: upstreamRes.ok ? null : `HTTP ${upstreamRes.status}`,
  }).then(() => {}, () => {})
  sb.from('connections').update({ last_used_at: new Date().toISOString() })
    .eq('id', conn.id).then(() => {}, () => {})

  // Stream or return
  const ct = upstreamRes.headers.get('content-type') ?? ''
  if (ct.includes('text/event-stream') && upstreamRes.body) {
    return new Response(upstreamRes.body, {
      status: upstreamRes.status,
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'X-SpainMCP-Proxy': '1',
        'X-SpainMCP-Duration': String(duration),
      },
    })
  }

  const responseBody = await upstreamRes.text()
  return new Response(responseBody, {
    status: upstreamRes.status,
    headers: {
      'Content-Type': ct || 'application/json',
      'X-SpainMCP-Proxy': '1',
      'X-SpainMCP-Duration': String(duration),
    },
  })
})

// ═══════════════════════════════════════════════════
// GATEWAY PER-USER — /mcp/@username
// One URL = all user's tools from all connections
// MCP Streamable HTTP endpoint (JSON-RPC over POST)
// ═══════════════════════════════════════════════════

// Cache: username → { namespaceId, connections[] } (KV, 60s TTL)
async function getUserConnections(username: string, env: Env) {
  const cacheKey = `gateway:${username}`
  const cached = await env.OAUTH_KV.get(cacheKey, 'json') as {
    namespaceId: string
    connections: { id: string; connectionId: string; name: string | null; mcpUrl: string; headersEncrypted: string | null }[]
  } | null

  if (cached) return cached

  const sb = getSupabase(env)

  // Find namespace by name (username = namespace name)
  const { data: ns } = await sb.from('namespaces')
    .select('id').eq('name', username).single()
  if (!ns) return null

  // Get all connected connections for this namespace
  const { data: conns } = await sb.from('connections')
    .select('id, connection_id, name, mcp_url, headers_encrypted')
    .eq('namespace_id', ns.id)
    .eq('status', 'connected')

  if (!conns || conns.length === 0) return null

  const result = {
    namespaceId: ns.id,
    connections: conns.map(c => ({
      id: c.id,
      connectionId: c.connection_id,
      name: c.name,
      mcpUrl: c.mcp_url,
      headersEncrypted: c.headers_encrypted,
    })),
  }

  // Cache for 60s
  await env.OAUTH_KV.put(cacheKey, JSON.stringify(result), { expirationTtl: 60 })
  return result
}

// Fetch tools from a single upstream MCP server
async function fetchToolsFromUpstream(
  mcpUrl: string,
  headersEncrypted: string | null,
): Promise<{ name: string; description?: string; inputSchema?: unknown }[]> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept': 'application/json, text/event-stream',
  }
  if (headersEncrypted) {
    try { Object.assign(headers, JSON.parse(headersEncrypted)) } catch { /* skip */ }
  }

  try {
    const res = await fetch(mcpUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'tools/list', params: {} }),
    })

    const text = await res.text()

    // Handle SSE response (event: message\ndata: {...})
    let data: unknown
    if (text.includes('event:') || text.includes('data:')) {
      const dataLine = text.split('\n').find(l => l.startsWith('data:'))
      if (dataLine) data = JSON.parse(dataLine.slice(5).trim())
    } else {
      data = JSON.parse(text)
    }

    const result = (data as { result?: { tools?: unknown[] } })?.result?.tools
    return (result as { name: string; description?: string; inputSchema?: unknown }[]) ?? []
  } catch {
    return []
  }
}

// Forward a tool call to the right upstream
async function forwardToolCall(
  toolName: string,
  args: Record<string, unknown>,
  conn: { id: string; mcpUrl: string; headersEncrypted: string | null },
  env: Env,
): Promise<Response> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept': 'application/json, text/event-stream',
  }
  if (conn.headersEncrypted) {
    try { Object.assign(headers, JSON.parse(conn.headersEncrypted)) } catch { /* skip */ }
  }

  const body = {
    jsonrpc: '2.0',
    id: 1,
    method: 'tools/call',
    params: { name: toolName, arguments: args },
  }

  const start = Date.now()
  const upstreamRes = await fetch(conn.mcpUrl, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  })
  const duration = Date.now() - start

  // Log RPC (fire and forget)
  const sb = getSupabase(env)
  sb.from('connection_logs').insert({
    connection_id: conn.id,
    namespace_id: '', // filled below
    method: 'tools/call',
    tool_name: toolName,
    duration_ms: duration,
    status_code: upstreamRes.status,
  }).then(() => {}, () => {})

  return upstreamRes
}

// Main gateway endpoint: POST /mcp/@username
app.post('/mcp/:username', async (c) => {
  const username = c.req.param('username').replace(/^@/, '')
  const env = c.env

  const userData = await getUserConnections(username, env)
  if (!userData) {
    return c.json({
      jsonrpc: '2.0',
      error: { code: -32001, message: `User @${username} not found or has no active connections` },
      id: null,
    }, 404)
  }

  const body = await c.req.json() as {
    jsonrpc: string
    id: number | string
    method: string
    params?: Record<string, unknown>
  }

  const { method, id: rpcId } = body

  // ── tools/list: aggregate from all connections ──
  if (method === 'tools/list') {
    const allTools: { name: string; description?: string; inputSchema?: unknown; _connectionId?: string }[] = []

    // Fetch tools from all connections in parallel
    const results = await Promise.all(
      userData.connections.map(async (conn) => {
        const tools = await fetchToolsFromUpstream(conn.mcpUrl, conn.headersEncrypted)
        return tools.map(t => ({
          ...t,
          // Prefix tool name with connection name to avoid collisions
          name: userData.connections.length > 1 ? `${conn.connectionId}__${t.name}` : t.name,
          description: `[${conn.name ?? conn.connectionId}] ${t.description ?? ''}`.trim(),
        }))
      })
    )

    for (const tools of results) allTools.push(...tools)

    return c.json({
      jsonrpc: '2.0',
      id: rpcId,
      result: { tools: allTools },
    })
  }

  // ── tools/call: route to correct connection ──
  if (method === 'tools/call') {
    const toolName = (body.params?.name as string) ?? ''
    const args = (body.params?.arguments as Record<string, unknown>) ?? {}

    // Parse: "connectionId__toolName" or just "toolName"
    let targetConn = userData.connections[0] // default: first connection
    let actualToolName = toolName

    if (toolName.includes('__')) {
      const [connId, ...rest] = toolName.split('__')
      actualToolName = rest.join('__')
      const found = userData.connections.find(c => c.connectionId === connId)
      if (found) targetConn = found
    } else if (userData.connections.length === 1) {
      targetConn = userData.connections[0]
    } else {
      // Try to find which connection has this tool (check KV cache)
      // For now: try first connection
      targetConn = userData.connections[0]
    }

    try {
      const upstreamRes = await forwardToolCall(actualToolName, args, targetConn, env)
      const ct = upstreamRes.headers.get('content-type') ?? ''
      const responseText = await upstreamRes.text()

      // Parse SSE → JSON for Streamable HTTP clients (Claude Code)
      let jsonBody: string
      if (ct.includes('text/event-stream') || responseText.includes('event:')) {
        const dataLine = responseText.split('\n').find(l => l.startsWith('data:'))
        if (dataLine) {
          jsonBody = dataLine.slice(5).trim()
        } else {
          jsonBody = responseText
        }
      } else {
        jsonBody = responseText
      }

      return new Response(jsonBody, {
        status: upstreamRes.status,
        headers: {
          'Content-Type': 'application/json',
          'X-SpainMCP-Gateway': `@${username}`,
        },
      })
    } catch (err) {
      return c.json({
        jsonrpc: '2.0',
        error: { code: -32000, message: `Upstream error: ${String(err)}` },
        id: rpcId,
      }, 502)
    }
  }

  // ── initialize / other MCP methods ──
  if (method === 'initialize') {
    return c.json({
      jsonrpc: '2.0',
      id: rpcId,
      result: {
        protocolVersion: '2024-11-05',
        capabilities: { tools: { listChanged: false } },
        serverInfo: {
          name: `SpainMCP Gateway @${username}`,
          version: '1.0.0',
        },
      },
    })
  }

  if (method === 'notifications/initialized') {
    return c.json({ jsonrpc: '2.0', id: rpcId, result: {} })
  }

  return c.json({
    jsonrpc: '2.0',
    error: { code: -32601, message: `Method not found: ${method}` },
    id: rpcId,
  })
})

// Gateway info (GET for browsers / discovery)
app.get('/mcp/:username', (c) => {
  const username = c.req.param('username').replace(/^@/, '')
  return c.json({
    name: `SpainMCP Gateway @${username}`,
    version: '1.0.0',
    protocol: 'MCP Streamable HTTP',
    endpoint: `https://spainmcp-connect.nilmiq.workers.dev/mcp/@${username}`,
    instructions: {
      claude_desktop: {
        mcpServers: {
          spainmcp: {
            url: `https://spainmcp-connect.nilmiq.workers.dev/mcp/@${username}`,
          },
        },
      },
      claude_code: `claude mcp add spainmcp https://spainmcp-connect.nilmiq.workers.dev/mcp/@${username}`,
      cursor: `Add to .cursor/mcp.json: { "url": "https://spainmcp-connect.nilmiq.workers.dev/mcp/@${username}" }`,
    },
  })
})

// ═══════════════════════════════════════════════════
// Token refresh endpoint (called by cron or manually)
// ═══════════════════════════════════════════════════

app.post('/internal/refresh-tokens', async (c) => {
  return c.json({ message: 'Token refresh not yet implemented', refreshed: 0 })
})

export default app
