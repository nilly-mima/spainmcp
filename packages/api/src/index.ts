// ═══════════════════════════════════════════════════
// @spainmcp/api — SpainMCP SDK
// ═══════════════════════════════════════════════════

export { SpainMCP } from './client.js'
export { createConnection } from './mcp.js'
export type {
  SpainMCPConfig,
  Namespace,
  NamespaceListResponse,
  Connection,
  ConnectionStatus,
  ConnectionListResponse,
  CreateConnectionOptions,
  Server,
  ServerListResponse,
  CreateServerOptions,
  CreateTokenOptions,
  TokenResponse,
  PolicyConstraint,
  JsonRpcRequest,
  JsonRpcResponse,
  Pagination,
} from './types.js'
export { SpainMCPError, SpainMCPAuthorizationError } from './types.js'
