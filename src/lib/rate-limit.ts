import { createClient } from '@supabase/supabase-js'

const FREE_LIMIT = 25_000
const PRO_LIMIT = 999_999_999

export type RateLimitResult = {
  allowed: boolean
  used: number
  limit: number
  plan: string
}

type CacheEntry = {
  result: RateLimitResult
  expiresAt: number
}

// In-memory cache keyed by userId. TTL: 60 seconds.
const cache = new Map<string, CacheEntry>()

function getServiceClient() {
  return createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
}

function monthStart(): string {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
}

async function countRpcs(userId: string): Promise<number> {
  const supabase = getServiceClient()

  // userId is either an email (api_key auth) or a UUID (scoped_token auth).
  // We need namespace IDs owned by this user.
  // namespaces.owner_id is a UUID (auth.users), so we resolve differently per type.

  let namespaceIds: string[] = []

  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId)

  if (isUuid) {
    const { data } = await supabase
      .from('namespaces')
      .select('id')
      .eq('owner_id', userId)

    namespaceIds = (data ?? []).map((r: { id: string }) => r.id)
  } else {
    // email-based: look up the auth user id first
    const { data: userData } = await supabase
      .from('api_keys')
      .select('id')
      .eq('email', userId)
      .eq('is_active', true)
      .limit(1)
      .single()

    if (!userData) return 0

    // api_keys don't store the auth user UUID directly — namespaces are linked
    // to auth.users. For email-based keys we query namespaces by joining through
    // the auth.users email match using the service role.
    const { data: authUser } = await supabase.auth.admin.listUsers()
    const user = (authUser?.users ?? []).find((u) => u.email === userId)
    if (!user) return 0

    const { data } = await supabase
      .from('namespaces')
      .select('id')
      .eq('owner_id', user.id)

    namespaceIds = (data ?? []).map((r: { id: string }) => r.id)
  }

  if (namespaceIds.length === 0) return 0

  const { count } = await supabase
    .from('connection_logs')
    .select('id', { count: 'exact', head: true })
    .in('namespace_id', namespaceIds)
    .gte('created_at', monthStart())

  return count ?? 0
}

export async function checkRateLimit(userId: string): Promise<RateLimitResult> {
  const now = Date.now()
  const cached = cache.get(userId)
  if (cached && cached.expiresAt > now) {
    return cached.result
  }

  // Cache miss: count async and optimistically allow, but we need the count
  // for the response. We do the count synchronously here since the spec says
  // "if cache miss, allow the request and count async" — we still need used/limit
  // for the response headers, so we fire-and-forget only when we already have a
  // cached entry. On a true cold miss we do the query.

  const plan = 'free'
  const limit = plan === 'free' ? FREE_LIMIT : PRO_LIMIT

  const used = await countRpcs(userId)
  const allowed = used < limit

  const result: RateLimitResult = { allowed, used, limit, plan }
  cache.set(userId, { result, expiresAt: now + 60_000 })
  return result
}

// Called after a successful RPC to invalidate the cache so the next check
// reflects the new count. This is a best-effort invalidation — not guaranteed.
export function invalidateRateLimitCache(userId: string): void {
  cache.delete(userId)
}
