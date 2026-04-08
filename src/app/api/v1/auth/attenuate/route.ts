import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'
import { authenticateRequest } from '@/lib/api-auth'

function getServiceClient() {
  return createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
}

const TTL_MAP: Record<string, number> = {
  '15m':  15 * 60 * 1000,
  '30m':  30 * 60 * 1000,
  '1h':   60 * 60 * 1000,
  '2h':    2 * 60 * 60 * 1000,
  '4h':    4 * 60 * 60 * 1000,
  '8h':    8 * 60 * 60 * 1000,
  '12h':  12 * 60 * 60 * 1000,
  '24h':  24 * 60 * 60 * 1000,
}

type Restriction =
  | { type: 'namespace'; values: string[] }
  | { type: 'tools'; values: string[] }
  | { type: 'rate_limit'; max_calls: number }
  | { type: 'ip'; values: string[] }
  | { type: 'expire'; after: string }

function validateRestrictions(
  raw: unknown
): { valid: true; restrictions: Restriction[] } | { valid: false; error: string } {
  if (!Array.isArray(raw) || raw.length === 0) {
    return { valid: false, error: '"restrictions" debe ser un array no vacío' }
  }

  const out: Restriction[] = []

  for (let i = 0; i < raw.length; i++) {
    const r = raw[i]
    if (typeof r !== 'object' || r === null || typeof r.type !== 'string') {
      return { valid: false, error: `restrictions[${i}] debe tener campo "type"` }
    }

    switch (r.type) {
      case 'namespace':
      case 'tools':
      case 'ip': {
        if (!Array.isArray(r.values) || r.values.length === 0 || r.values.some((v: unknown) => typeof v !== 'string')) {
          return { valid: false, error: `restrictions[${i}].values debe ser un array de strings no vacío` }
        }
        out.push({ type: r.type, values: r.values as string[] })
        break
      }
      case 'rate_limit': {
        if (typeof r.max_calls !== 'number' || !Number.isInteger(r.max_calls) || r.max_calls < 1) {
          return { valid: false, error: `restrictions[${i}].max_calls debe ser un entero positivo` }
        }
        out.push({ type: 'rate_limit', max_calls: r.max_calls })
        break
      }
      case 'expire': {
        if (typeof r.after !== 'string' || !TTL_MAP[r.after]) {
          return {
            valid: false,
            error: `restrictions[${i}].after inválido. Valores permitidos: ${Object.keys(TTL_MAP).join(', ')}`,
          }
        }
        out.push({ type: 'expire', after: r.after })
        break
      }
      default:
        return {
          valid: false,
          error: `restrictions[${i}].type "${r.type}" no reconocido. Tipos: namespace, tools, rate_limit, ip, expire`,
        }
    }
  }

  return { valid: true, restrictions: out }
}

/**
 * Merge parent restrictions with new ones. Child can only restrict further,
 * never expand. Rules:
 * - namespace/tools/ip: intersection with parent (or parent value if child not present)
 * - rate_limit: min(parent, child)
 * - expire: min TTL wins
 */
function mergeRestrictions(
  parent: Restriction[],
  child: Restriction[]
): { ok: true; merged: Restriction[] } | { ok: false; error: string } {
  const merged: Restriction[] = []

  const parentByType = new Map<string, Restriction>()
  for (const r of parent) parentByType.set(r.type, r)

  const childByType = new Map<string, Restriction>()
  for (const r of child) childByType.set(r.type, r)

  // All types that appear in either set
  const allTypes = new Set([...parentByType.keys(), ...childByType.keys()])

  for (const type of allTypes) {
    const p = parentByType.get(type)
    const c = childByType.get(type)

    if (type === 'namespace' || type === 'tools' || type === 'ip') {
      const narrowType = type as 'namespace' | 'tools' | 'ip'
      const pEntry = p as { type: 'namespace' | 'tools' | 'ip'; values: string[] } | undefined
      const cEntry = c as { type: 'namespace' | 'tools' | 'ip'; values: string[] } | undefined

      if (pEntry && cEntry) {
        const intersection = pEntry.values.filter((v) => cEntry.values.includes(v))
        if (intersection.length === 0) {
          return {
            ok: false,
            error: `La restricción "${type}" del token hijo no tiene intersección con el padre. Ampliación no permitida.`,
          }
        }
        merged.push({ type: narrowType, values: intersection })
      } else if (pEntry) {
        merged.push({ type: narrowType, values: pEntry.values })
      } else if (cEntry) {
        merged.push({ type: narrowType, values: cEntry.values })
      }
    } else if (type === 'rate_limit') {
      const pEntry = p as { type: 'rate_limit'; max_calls: number } | undefined
      const cEntry = c as { type: 'rate_limit'; max_calls: number } | undefined
      const maxCalls = Math.min(pEntry?.max_calls ?? Infinity, cEntry?.max_calls ?? Infinity)
      if (isFinite(maxCalls)) merged.push({ type: 'rate_limit', max_calls: maxCalls })
    } else if (type === 'expire') {
      const pEntry = p as { type: 'expire'; after: string } | undefined
      const cEntry = c as { type: 'expire'; after: string } | undefined
      const pMs = pEntry ? TTL_MAP[pEntry.after] : Infinity
      const cMs = cEntry ? TTL_MAP[cEntry.after] : Infinity
      const minMs = Math.min(pMs, cMs)
      const minKey = Object.keys(TTL_MAP).find((k) => TTL_MAP[k] === minMs)
      if (minKey) merged.push({ type: 'expire', after: minKey })
    }
  }

  return { ok: true, merged }
}

function resolveExpiresAt(restrictions: Restriction[], parentExpiresAt: string | null): Date {
  const expireRestriction = restrictions.find((r) => r.type === 'expire') as
    | { type: 'expire'; after: string }
    | undefined

  const childTTLMs = expireRestriction ? TTL_MAP[expireRestriction.after] : TTL_MAP['1h']
  const childExpires = new Date(Date.now() + childTTLMs)

  if (parentExpiresAt) {
    const parentExpires = new Date(parentExpiresAt)
    return childExpires < parentExpires ? childExpires : parentExpires
  }

  return childExpires
}

export async function POST(req: NextRequest) {
  const auth = await authenticateRequest(req)
  if (!auth) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  let body: { restrictions?: unknown; ttl?: unknown }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Cuerpo de la solicitud inválido' }, { status: 400 })
  }

  const validation = validateRestrictions(body.restrictions)
  if (!validation.valid) {
    return NextResponse.json({ error: validation.error }, { status: 400 })
  }

  const supabase = getServiceClient()

  // Resolve parent token record to inherit restrictions
  let parentRestrictions: Restriction[] = []
  let parentExpiresAt: string | null = null
  let parentTokenId: string | null = null

  const authHeader = req.headers.get('Authorization')!
  const rawToken = authHeader.slice(7).trim()
  const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex')

  if (rawToken.startsWith('smc_at_') || rawToken.startsWith('smc_tk_')) {
    const { data: parentRecord } = await supabase
      .from('scoped_tokens')
      .select('id, restrictions, expires_at')
      .eq('token_hash', tokenHash)
      .eq('is_active', true)
      .single()

    if (parentRecord) {
      parentTokenId = parentRecord.id
      parentRestrictions = (parentRecord.restrictions as Restriction[]) ?? []
      parentExpiresAt = parentRecord.expires_at ?? null
    }
  }

  // Merge: child inherits all parent restrictions and can only add more
  const mergeResult = mergeRestrictions(parentRestrictions, validation.restrictions)
  if (!mergeResult.ok) {
    return NextResponse.json({ error: mergeResult.error }, { status: 400 })
  }

  const finalRestrictions = mergeResult.merged
  const expiresAt = resolveExpiresAt(finalRestrictions, parentExpiresAt).toISOString()

  const newRawToken = 'smc_at_' + crypto.randomBytes(32).toString('hex')
  const newTokenHash = crypto.createHash('sha256').update(newRawToken).digest('hex')
  const tokenPrefix = newRawToken.slice(0, 16) + '...'

  const { error: insertError } = await supabase.from('scoped_tokens').insert({
    token_hash: newTokenHash,
    token_prefix: tokenPrefix,
    owner_id: auth.userId,
    policy: finalRestrictions,
    restrictions: finalRestrictions,
    parent_token_id: parentTokenId,
    expires_at: expiresAt,
    is_active: true,
    usage_count: 0,
  })

  if (insertError) {
    console.error('Supabase attenuate insert error:', insertError)
    return NextResponse.json({ error: 'Error al crear el token atenuado' }, { status: 500 })
  }

  return NextResponse.json(
    { token: newRawToken, restrictions: finalRestrictions, expiresAt },
    { status: 201 }
  )
}
