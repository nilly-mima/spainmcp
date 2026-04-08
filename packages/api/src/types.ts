// ═══════════════════════════════════════════════════
// SpainMCP API Types
// ═══════════════════════════════════════════════════

export interface Pagination {
  currentPage: number
  pageSize: number
  totalPages: number
  totalCount: number
}

// Namespaces
export interface Namespace {
  name: string
  createdAt: string
}

export interface NamespaceListResponse {
  namespaces: Namespace[]
  pagination: Pagination
}

// Connections
export type ConnectionStatus = 'connected' | 'auth_required' | 'error' | 'pending'

export interface Connection {
  connectionId: string
  name: string | null
  mcpUrl: string
  status: ConnectionStatus
  authorizationUrl: string | null
  metadata: Record<string, unknown>
  serverInfo: { name: string; version: string; tools?: unknown[] } | null
  createdAt: string
  updatedAt: string
}

export interface CreateConnectionOptions {
  mcpUrl: string
  connectionId?: string
  name?: string
  metadata?: Record<string, unknown>
  headers?: Record<string, string>
}

export interface ConnectionListResponse {
  data: Connection[]
  pagination: Pagination
}

// Servers
export interface Server {
  qualifiedName: string
  displayName: string
  description: string | null
  upstreamUrl?: string
  iconUrl: string | null
  isVerified: boolean
  useCount: number
  remote: boolean
  isActive: boolean
  createdAt: string
}

export interface CreateServerOptions {
  displayName: string
  upstreamUrl: string
  description?: string
  configSchema?: Record<string, unknown>
}

export interface ServerListResponse {
  servers: Server[]
  pagination: Pagination
}

// Tokens
export interface PolicyConstraint {
  namespaces?: string | string[]
  resources?: string | string[]
  operations?: string | string[]
  metadata?: Record<string, unknown>
  rpcReqMatch?: Record<string, unknown>
  ttl?: string
}

export interface CreateTokenOptions {
  policy: PolicyConstraint[]
}

export interface TokenResponse {
  token: string
  expiresAt: string
}

// MCP JSON-RPC
export interface JsonRpcRequest {
  jsonrpc: '2.0'
  id: number | string
  method: string
  params?: Record<string, unknown>
}

export interface JsonRpcResponse {
  jsonrpc: '2.0'
  id: number | string
  result?: unknown
  error?: { code: number; message: string; data?: unknown }
}

// SDK Config
export interface SpainMCPConfig {
  apiKey: string
  baseUrl?: string
}

// Errors
export class SpainMCPError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string,
  ) {
    super(message)
    this.name = 'SpainMCPError'
  }
}

export class SpainMCPAuthorizationError extends SpainMCPError {
  constructor(
    public authorizationUrl: string,
    public connectionId: string,
  ) {
    super('Authorization required', 401, 'AUTH_REQUIRED')
    this.name = 'SpainMCPAuthorizationError'
  }
}
