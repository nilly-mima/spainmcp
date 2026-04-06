import { createMCPClient } from '@ai-sdk/mcp'

const DEFAULT_URL = 'https://spainmcp-fngo.vercel.app/api/mcp'

export interface StripeBillingOptions {
  /** Stripe customer ID (cus_xxx) a facturar por tokens */
  customerId: string
  /** Stripe restricted key con permisos de meter events */
  restrictedKey: string
}

export interface SpainMCPOptions {
  /** API key de SpainMCP (sk-spainmcp-...) */
  apiKey: string
  /** URL del MCP server. Por defecto: producción SpainMCP */
  url?: string
  /** Stripe billing automático por tokens — emite meter events a Stripe */
  stripe?: StripeBillingOptions
  /** ID de usuario para Custom Reporting (GET /v1/report?group_by=user) */
  user?: string
  /** Tags para filtrar en Custom Reporting */
  tags?: string[]
  /** Solo usar providers con Zero Data Retention. Por defecto: true */
  zeroDataRetention?: boolean
  /** BYOK: tus propias API keys de providers (zero markup Vercel) */
  byok?: {
    anthropic?: Array<{ apiKey: string }>
    openai?: Array<{ apiKey: string }>
    vertex?: Array<{ project: string; location: string; googleCredentials: { privateKey: string; clientEmail: string } }>
    bedrock?: Array<{ accessKeyId: string; secretAccessKey: string; region?: string }>
  }
}

export interface SpainMCPProvider {
  /** Tools MCP listos para pasar a generateText/streamText */
  tools: Record<string, unknown>
  /** providerOptions para Vercel AI Gateway (ZDR, user, tags, BYOK) */
  providerOptions: Record<string, unknown>
  /** Headers HTTP — incluye Stripe billing si se configuró */
  headers?: Record<string, string>
  /** Cerrar la conexión MCP cuando hayas terminado */
  close: () => Promise<void>
}

/**
 * Crea un provider de SpainMCP listo para usar con el Vercel AI SDK.
 *
 * @example
 * ```typescript
 * import { createSpainMCPProvider } from '@spainmcp/ai-provider'
 * import { generateText } from 'ai'
 *
 * const spain = await createSpainMCPProvider({
 *   apiKey: process.env.SPAINMCP_API_KEY!,
 *   stripe: { customerId: 'cus_xxx', restrictedKey: process.env.STRIPE_KEY! },
 *   user: userId,
 *   tags: ['boe', 'gestoría'],
 * })
 *
 * const { text } = await generateText({
 *   model: 'anthropic/claude-sonnet-4.6',
 *   tools: spain.tools,
 *   providerOptions: spain.providerOptions,
 *   headers: spain.headers,
 *   prompt: '¿Qué leyes se publicaron hoy en el BOE?',
 * })
 *
 * await spain.close()
 * ```
 */
export async function createSpainMCPProvider(options: SpainMCPOptions): Promise<SpainMCPProvider> {
  const client = await createMCPClient({
    transport: {
      type: 'http',
      url: options.url ?? DEFAULT_URL,
      headers: { Authorization: `Bearer ${options.apiKey}` },
    },
  })

  const tools = await client.tools()

  // providerOptions para Vercel AI Gateway
  const gateway: Record<string, unknown> = {
    zeroDataRetention: options.zeroDataRetention ?? true,
  }
  if (options.user) gateway.user = options.user
  if (options.tags?.length) gateway.tags = options.tags
  if (options.byok) gateway.byok = options.byok

  const providerOptions = { gateway }

  // Headers Stripe (emite meter events automáticamente por token)
  let headers: Record<string, string> | undefined
  if (options.stripe) {
    headers = {
      'stripe-customer-id': options.stripe.customerId,
      'stripe-restricted-access-key': options.stripe.restrictedKey,
    }
  }

  return {
    tools,
    providerOptions,
    headers,
    close: () => client.close(),
  }
}

/**
 * Versión simplificada para usar sin Stripe ni tracking.
 * Solo necesitas la API key.
 */
export async function connectSpainMCP(apiKey: string, url?: string): Promise<SpainMCPProvider> {
  return createSpainMCPProvider({ apiKey, url })
}
