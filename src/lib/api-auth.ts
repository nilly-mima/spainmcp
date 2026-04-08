import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'

export type Restriction =
  | { type: 'namespace'; values: string[] }
  | { type: 'tools'; values: string[] }
  | { type: 'rate_limit'; max_calls: number }
  | { type: 'ip'; values: string[] }
  | { type: 'expire'; after: string }

export type AuthResult = {
  userId: string
  type: 'api_key' | 'scoped_token' | 'attenuated_token'
  policy?: object
  restrictions?: Restriction[]
  email?: string
  scopedTokenId?: string
}

function getServiceClient() {
  return createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
}

function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex')
}

export async function authenticateRequest(req: Request): Promise<AuthResult | null> {
  const authHeader = req.headers.get('Authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }

  const token = authHeader.slice(7).trim()
  if (!token) return null

  const supabase = getServiceClient()
  const hash = hashToken(token)

  if (token.startsWith('sk-spainmcp-')) {
    const { data, error } = await supabase
      .from('api_keys')
      .select('id, email, is_active')
      .eq('key_hash', hash)
      .eq('is_active', true)
      .single()

    if (error || !data) return null

    return {
      userId: data.email,
      type: 'api_key',
      email: data.email,
    }
  }

  if (token.startsWith('smc_tk_')) {
    const { data, error } = await supabase
      .from('scoped_tokens')
      .select('id, owner_id, policy, expires_at, is_active')
      .eq('token_hash', hash)
      .eq('is_active', true)
      .single()

    if (error || !data) return null

    if (data.expires_at && new Date(data.expires_at) < new Date()) {
      return null
    }

    return {
      userId: data.owner_id,
      type: 'scoped_token',
      policy: data.policy,
      scopedTokenId: data.id,
    }
  }

  if (token.startsWith('smc_at_')) {
    const { data, error } = await supabase
      .from('scoped_tokens')
      .select('id, owner_id, policy, restrictions, expires_at, is_active, usage_count')
      .eq('token_hash', hash)
      .eq('is_active', true)
      .single()

    if (error || !data) return null

    if (data.expires_at && new Date(data.expires_at) < new Date()) {
      return null
    }

    const restrictions: Restriction[] = (data.restrictions as Restriction[]) ?? []

    // Enforce rate_limit usage count
    const rateLimitRestriction = restrictions.find((r) => r.type === 'rate_limit') as
      | { type: 'rate_limit'; max_calls: number }
      | undefined
    if (rateLimitRestriction) {
      const usageCount = (data.usage_count as number) ?? 0
      if (usageCount >= rateLimitRestriction.max_calls) {
        return null
      }
      // Increment usage count (fire-and-forget)
      supabase
        .from('scoped_tokens')
        .update({ usage_count: usageCount + 1 })
        .eq('id', data.id)
        .then(() => undefined)
    }

    return {
      userId: data.owner_id,
      type: 'attenuated_token',
      policy: data.policy,
      restrictions,
      scopedTokenId: data.id,
    }
  }

  return null
}

/**
 * Returns true if the attenuated token allows access to the given namespace and tool.
 * Call this in gateway/proxy routes when auth.type === 'attenuated_token'.
 */
export function checkAttenuation(
  auth: AuthResult,
  context: { namespace?: string; tool?: string; ip?: string }
): { allowed: boolean; reason?: string } {
  if (!auth.restrictions || auth.restrictions.length === 0) {
    return { allowed: true }
  }

  for (const r of auth.restrictions) {
    if (r.type === 'namespace' && context.namespace) {
      if (!r.values.includes(context.namespace)) {
        return { allowed: false, reason: `Namespace "${context.namespace}" no permitido por este token` }
      }
    }
    if (r.type === 'tools' && context.tool) {
      if (!r.values.includes(context.tool)) {
        return { allowed: false, reason: `Tool "${context.tool}" no permitida por este token` }
      }
    }
    if (r.type === 'ip' && context.ip) {
      const allowed = r.values.some((cidr) => ipMatchesCidr(context.ip!, cidr))
      if (!allowed) {
        return { allowed: false, reason: `IP "${context.ip}" no permitida por este token` }
      }
    }
  }

  return { allowed: true }
}

function ipMatchesCidr(ip: string, cidr: string): boolean {
  if (!cidr.includes('/')) return ip === cidr
  const [network, prefixStr] = cidr.split('/')
  const prefix = parseInt(prefixStr, 10)
  const ipNum = ipToInt(ip)
  const netNum = ipToInt(network)
  if (ipNum === null || netNum === null) return false
  const mask = prefix === 0 ? 0 : (~0 << (32 - prefix)) >>> 0
  return (ipNum & mask) === (netNum & mask)
}

function ipToInt(ip: string): number | null {
  const parts = ip.split('.')
  if (parts.length !== 4) return null
  const nums = parts.map(Number)
  if (nums.some((n) => isNaN(n) || n < 0 || n > 255)) return null
  return ((nums[0] << 24) | (nums[1] << 16) | (nums[2] << 8) | nums[3]) >>> 0
}
