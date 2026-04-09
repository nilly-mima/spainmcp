import { createClient } from '@supabase/supabase-js'

export const PLAN_LIMITS = {
  free: { namespaces: 3, connections: 3, servers: 3, rpcs_month: 25000 },
  pro: { namespaces: -1, connections: -1, servers: -1, rpcs_month: -1 },
} as const

export type PlanTier = 'free' | 'pro'

function getServiceClient() {
  return createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
}

export async function checkPlanLimit(
  supabase: ReturnType<typeof getServiceClient>,
  email: string,
  resource: 'namespaces' | 'connections' | 'servers'
): Promise<{ allowed: boolean; current: number; limit: number; tier: PlanTier }> {
  // Look up tier from the most recent active api_key for this user
  const { data: keyData } = await supabase
    .from('api_keys')
    .select('tier')
    .eq('email', email)
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  const tier: PlanTier = (keyData?.tier as PlanTier) ?? 'free'
  const limit = PLAN_LIMITS[tier][resource]

  // -1 = unlimited
  if (limit === -1) {
    return { allowed: true, current: 0, limit, tier }
  }

  let current = 0

  if (resource === 'namespaces') {
    const { count } = await supabase
      .from('namespaces')
      .select('id', { count: 'exact', head: true })
      .eq('owner_id', email)
    current = count ?? 0
  } else if (resource === 'connections') {
    // connections → namespace_id → namespaces.owner_id
    const { count } = await supabase
      .from('connections')
      .select('id, namespaces!inner(owner_id)', { count: 'exact', head: true })
      .eq('namespaces.owner_id', email)
    current = count ?? 0
  } else if (resource === 'servers') {
    const { count } = await supabase
      .from('mcp_servers')
      .select('id', { count: 'exact', head: true })
      .eq('owner_email', email)
      .eq('is_active', true)
    current = count ?? 0
  }

  return { allowed: current < limit, current, limit, tier }
}
