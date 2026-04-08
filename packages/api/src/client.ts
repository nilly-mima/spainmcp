// ═══════════════════════════════════════════════════
// SpainMCP API Client
// ═══════════════════════════════════════════════════

import type {
  SpainMCPConfig,
  Namespace,
  NamespaceListResponse,
  Connection,
  ConnectionListResponse,
  CreateConnectionOptions,
  Server,
  ServerListResponse,
  CreateServerOptions,
  CreateTokenOptions,
  TokenResponse,
  JsonRpcRequest,
  JsonRpcResponse,
} from './types.js'
import { SpainMCPError } from './types.js'

const DEFAULT_BASE_URL = 'https://spainmcp-fngo.vercel.app'

export class SpainMCP {
  private apiKey: string
  private baseUrl: string

  constructor(config: SpainMCPConfig) {
    this.apiKey = config.apiKey
    this.baseUrl = (config.baseUrl ?? DEFAULT_BASE_URL).replace(/\/$/, '')
  }

  // ── HTTP helper ──

  private async request<T>(
    method: string,
    path: string,
    body?: unknown,
    query?: Record<string, string>,
  ): Promise<T> {
    let url = `${this.baseUrl}/api/v1${path}`
    if (query) {
      const params = new URLSearchParams(
        Object.entries(query).filter(([, v]) => v !== undefined),
      )
      const qs = params.toString()
      if (qs) url += `?${qs}`
    }

    const res = await fetch(url, {
      method,
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        ...(body ? { 'Content-Type': 'application/json' } : {}),
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    })

    if (!res.ok) {
      const data = await res.json().catch(() => ({})) as Record<string, unknown>
      throw new SpainMCPError(
        (data.error as string) ?? `Request failed: ${res.status}`,
        res.status,
        data.code as string | undefined,
      )
    }

    return res.json() as Promise<T>
  }

  // ── Namespaces ──

  namespaces = {
    create: (name: string): Promise<Namespace> =>
      this.request('POST', '/namespaces', { name }),

    createGenerated: (): Promise<Namespace> =>
      this.request('POST', '/namespaces/generated'),

    list: (page = 1, pageSize = 20): Promise<NamespaceListResponse> =>
      this.request('GET', '/namespaces', undefined, {
        page: String(page),
        pageSize: String(pageSize),
      }),

    delete: (name: string): Promise<{ success: boolean }> =>
      this.request('DELETE', `/namespaces/${encodeURIComponent(name)}`),
  }

  // ── Connections ──

  connections = {
    create: (namespace: string, options: CreateConnectionOptions): Promise<Connection> =>
      this.request('POST', `/connections/${encodeURIComponent(namespace)}`, options),

    list: (
      namespace: string,
      options?: { metadata?: Record<string, unknown>; page?: number; pageSize?: number },
    ): Promise<ConnectionListResponse> =>
      this.request('GET', `/connections/${encodeURIComponent(namespace)}`, undefined, {
        ...(options?.metadata ? { metadata: JSON.stringify(options.metadata) } : {}),
        ...(options?.page ? { page: String(options.page) } : {}),
        ...(options?.pageSize ? { pageSize: String(options.pageSize) } : {}),
      }),

    get: (namespace: string, connectionId: string): Promise<Connection> =>
      this.request(
        'GET',
        `/connections/${encodeURIComponent(namespace)}/${encodeURIComponent(connectionId)}`,
      ),

    upsert: (
      namespace: string,
      connectionId: string,
      options: CreateConnectionOptions,
    ): Promise<Connection> =>
      this.request(
        'PUT',
        `/connections/${encodeURIComponent(namespace)}/${encodeURIComponent(connectionId)}`,
        options,
      ),

    delete: (namespace: string, connectionId: string): Promise<{ success: boolean }> =>
      this.request(
        'DELETE',
        `/connections/${encodeURIComponent(namespace)}/${encodeURIComponent(connectionId)}`,
      ),

    mcp: (
      namespace: string,
      connectionId: string,
      message: JsonRpcRequest,
    ): Promise<JsonRpcResponse> =>
      this.request(
        'POST',
        `/connections/${encodeURIComponent(namespace)}/${encodeURIComponent(connectionId)}/mcp`,
        message,
      ),
  }

  // ── Servers ──

  servers = {
    list: (options?: {
      q?: string
      page?: number
      pageSize?: number
      owner?: string
    }): Promise<ServerListResponse> =>
      this.request('GET', '/servers', undefined, {
        ...(options?.q ? { q: options.q } : {}),
        ...(options?.page ? { page: String(options.page) } : {}),
        ...(options?.pageSize ? { pageSize: String(options.pageSize) } : {}),
        ...(options?.owner ? { owner: options.owner } : {}),
      }),

    get: (qualifiedName: string): Promise<Server> =>
      this.request('GET', `/servers/${encodeURIComponent(qualifiedName)}`),

    create: (qualifiedName: string, options: CreateServerOptions): Promise<Server> =>
      this.request('PUT', `/servers/${encodeURIComponent(qualifiedName)}`, options),

    update: (
      qualifiedName: string,
      updates: Partial<Pick<Server, 'displayName' | 'description'>> & {
        configSchema?: Record<string, unknown>
        isActive?: boolean
      },
    ): Promise<Server> =>
      this.request('PATCH', `/servers/${encodeURIComponent(qualifiedName)}`, updates),

    delete: (qualifiedName: string): Promise<{ success: boolean }> =>
      this.request('DELETE', `/servers/${encodeURIComponent(qualifiedName)}`),
  }

  // ── Tokens ──

  tokens = {
    create: (options: CreateTokenOptions): Promise<TokenResponse> =>
      this.request('POST', '/auth/token', options),
  }

  // ── Health ──

  health = (): Promise<{ status: string; version: string; timestamp: string }> =>
    this.request('GET', '/health')
}
