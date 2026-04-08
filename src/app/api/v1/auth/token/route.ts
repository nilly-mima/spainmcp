import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'
import { authenticateRequest } from '@/lib/api-auth'

function getServiceClient() {
  return createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
}

const VALID_RESOURCES = new Set(['connections', 'servers', 'namespaces', 'skills'])
const VALID_OPERATIONS = new Set(['read', 'write', 'execute'])

const TTL_MAP: Record<string, number> = {
  '30m': 30 * 60 * 1000,
  '1h': 60 * 60 * 1000,
  '2h': 2 * 60 * 60 * 1000,
  '4h': 4 * 60 * 60 * 1000,
  '8h': 8 * 60 * 60 * 1000,
  '12h': 12 * 60 * 60 * 1000,
  '24h': 24 * 60 * 60 * 1000,
}

function parseTTL(ttl?: string): number {
  if (!ttl) return TTL_MAP['1h']
  const ms = TTL_MAP[ttl]
  if (!ms) return -1
  return ms
}

type PolicyEntry = {
  namespaces: string | string[]
  resources?: string | string[]
  operations?: string | string[]
  metadata?: Record<string, unknown>
  ttl?: string
}

function validatePolicy(policy: unknown): { valid: true; entries: PolicyEntry[] } | { valid: false; error: string } {
  if (!Array.isArray(policy) || policy.length === 0) {
    return { valid: false, error: 'policy must be a non-empty array' }
  }

  for (let i = 0; i < policy.length; i++) {
    const entry = policy[i]
    if (typeof entry !== 'object' || entry === null) {
      return { valid: false, error: `policy[${i}] must be an object` }
    }

    if (!entry.namespaces) {
      return { valid: false, error: `policy[${i}].namespaces is required` }
    }

    const namespaces = Array.isArray(entry.namespaces) ? entry.namespaces : [entry.namespaces]
    for (const ns of namespaces) {
      if (typeof ns !== 'string' || ns.trim() === '') {
        return { valid: false, error: `policy[${i}].namespaces contains an invalid value` }
      }
    }

    if (entry.resources !== undefined) {
      const resources = Array.isArray(entry.resources) ? entry.resources : [entry.resources]
      for (const r of resources) {
        if (!VALID_RESOURCES.has(r)) {
          return { valid: false, error: `policy[${i}].resources "${r}" is not valid. Allowed: ${[...VALID_RESOURCES].join(', ')}` }
        }
      }
    }

    if (entry.operations !== undefined) {
      const operations = Array.isArray(entry.operations) ? entry.operations : [entry.operations]
      for (const op of operations) {
        if (!VALID_OPERATIONS.has(op)) {
          return { valid: false, error: `policy[${i}].operations "${op}" is not valid. Allowed: ${[...VALID_OPERATIONS].join(', ')}` }
        }
      }
    }

    if (entry.metadata !== undefined && (typeof entry.metadata !== 'object' || Array.isArray(entry.metadata))) {
      return { valid: false, error: `policy[${i}].metadata must be an object` }
    }

    if (entry.ttl !== undefined) {
      if (parseTTL(entry.ttl) === -1) {
        return { valid: false, error: `policy[${i}].ttl "${entry.ttl}" is not valid. Allowed: ${Object.keys(TTL_MAP).join(', ')}` }
      }
    }
  }

  return { valid: true, entries: policy as PolicyEntry[] }
}

export async function POST(req: NextRequest) {
  const auth = await authenticateRequest(req)
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: { policy?: unknown }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const validation = validatePolicy(body.policy)
  if (!validation.valid) {
    return NextResponse.json({ error: validation.error }, { status: 400 })
  }

  const { entries } = validation

  // Use the smallest TTL across all entries, or default "1h"
  let maxTTLMs = TTL_MAP['1h']
  for (const entry of entries) {
    if (entry.ttl) {
      const ms = parseTTL(entry.ttl)
      if (ms > maxTTLMs) maxTTLMs = ms
    }
  }

  const rawToken = 'smc_tk_' + crypto.randomBytes(32).toString('hex')
  const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex')
  const tokenPrefix = rawToken.slice(0, 16) + '...'
  const expiresAt = new Date(Date.now() + maxTTLMs).toISOString()

  const supabase = getServiceClient()
  const { error } = await supabase
    .from('scoped_tokens')
    .insert({
      token_hash: tokenHash,
      token_prefix: tokenPrefix,
      owner_id: auth.userId,
      policy: entries,
      expires_at: expiresAt,
      is_active: true,
    })

  if (error) {
    console.error('Supabase insert error:', error)
    return NextResponse.json({ error: 'Failed to create token' }, { status: 500 })
  }

  return NextResponse.json({ token: rawToken, expiresAt }, { status: 201 })
}
