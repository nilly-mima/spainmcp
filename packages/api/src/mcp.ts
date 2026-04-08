// ═══════════════════════════════════════════════════
// SpainMCP MCP Connection Helper
// import { createConnection } from '@spainmcp/api/mcp'
// ═══════════════════════════════════════════════════

import { SpainMCP } from './client.js'
import {
  SpainMCPAuthorizationError,
  SpainMCPError,
  type Connection,
  type CreateConnectionOptions,
  type JsonRpcRequest,
  type JsonRpcResponse,
  type SpainMCPConfig,
} from './types.js'

export interface SmcpConnection {
  connectionId: string
  status: Connection['status']
  /** Call a JSON-RPC method on the connected MCP server */
  call: (method: string, params?: Record<string, unknown>) => Promise<JsonRpcResponse>
  /** List available tools on the connected MCP server */
  listTools: () => Promise<unknown[]>
  /** Call a specific tool by name */
  callTool: (name: string, args?: Record<string, unknown>) => Promise<unknown>
}

export interface CreateConnectionOpts {
  /** SpainMCP client instance or config. Auto-created from SPAINMCP_API_KEY env var if omitted. */
  client?: SpainMCP | SpainMCPConfig
  /** URL of the MCP server to connect to */
  mcpUrl?: string
  /** Namespace to use. Uses first existing or creates new if omitted. */
  namespace?: string
  /** Connection ID. Auto-generated if omitted. */
  connectionId?: string
  /** Display name */
  name?: string
  /** Custom metadata for filtering */
  metadata?: Record<string, unknown>
  /** HTTP headers to pass to upstream (e.g., API keys) */
  headers?: Record<string, string>
}

/**
 * Create a managed MCP connection via SpainMCP Connect.
 *
 * @example
 * ```typescript
 * import { createConnection } from '@spainmcp/api/mcp'
 *
 * const conn = await createConnection({
 *   mcpUrl: 'https://server.example.com/mcp',
 *   namespace: 'my-app',
 * })
 *
 * const tools = await conn.listTools()
 * const result = await conn.callTool('search', { query: 'MCP servers' })
 * ```
 *
 * @throws {SpainMCPAuthorizationError} When the MCP server requires OAuth.
 *         Contains `authorizationUrl` to redirect the user.
 */
export async function createConnection(opts: CreateConnectionOpts): Promise<SmcpConnection> {
  // Resolve client
  let client: SpainMCP
  if (opts.client instanceof SpainMCP) {
    client = opts.client
  } else {
    const apiKey =
      (opts.client as SpainMCPConfig | undefined)?.apiKey ??
      (typeof process !== 'undefined' ? process.env?.SPAINMCP_API_KEY : undefined)
    if (!apiKey) {
      throw new SpainMCPError(
        'No API key provided. Pass client option or set SPAINMCP_API_KEY env var.',
        401,
      )
    }
    client = new SpainMCP({
      apiKey,
      baseUrl: (opts.client as SpainMCPConfig | undefined)?.baseUrl,
    })
  }

  // Resolve namespace
  let namespace = opts.namespace
  if (!namespace) {
    const { namespaces } = await client.namespaces.list(1, 1)
    if (namespaces.length > 0) {
      namespace = namespaces[0].name
    } else {
      const ns = await client.namespaces.createGenerated()
      namespace = ns.name
    }
  }

  // Build connection options
  const connOpts: CreateConnectionOptions = {
    mcpUrl: opts.mcpUrl!,
    ...(opts.connectionId ? { connectionId: opts.connectionId } : {}),
    ...(opts.name ? { name: opts.name } : {}),
    ...(opts.metadata ? { metadata: opts.metadata } : {}),
    ...(opts.headers ? { headers: opts.headers } : {}),
  }

  // Create or get existing connection
  let conn: Connection
  if (opts.connectionId && !opts.mcpUrl) {
    // Reconnect to existing connection
    conn = await client.connections.get(namespace, opts.connectionId)
  } else {
    conn = await client.connections.create(namespace, connOpts)
  }

  // Check status
  if (conn.status === 'auth_required' && conn.authorizationUrl) {
    throw new SpainMCPAuthorizationError(conn.authorizationUrl, conn.connectionId)
  }

  if (conn.status === 'error') {
    throw new SpainMCPError(`Connection failed: ${conn.connectionId}`, 502, 'CONNECTION_ERROR')
  }

  // Build the connection interface
  let rpcId = 0

  const call = async (
    method: string,
    params?: Record<string, unknown>,
  ): Promise<JsonRpcResponse> => {
    const message: JsonRpcRequest = {
      jsonrpc: '2.0',
      id: ++rpcId,
      method,
      ...(params ? { params } : {}),
    }
    return client.connections.mcp(namespace!, conn.connectionId, message)
  }

  const listTools = async (): Promise<unknown[]> => {
    const res = await call('tools/list')
    return (res.result as { tools?: unknown[] })?.tools ?? []
  }

  const callTool = async (
    name: string,
    args?: Record<string, unknown>,
  ): Promise<unknown> => {
    const res = await call('tools/call', { name, arguments: args ?? {} })
    if (res.error) {
      throw new SpainMCPError(res.error.message, 500, String(res.error.code))
    }
    return res.result
  }

  return {
    connectionId: conn.connectionId,
    status: conn.status,
    call,
    listTools,
    callTool,
  }
}
