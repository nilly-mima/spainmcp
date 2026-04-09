import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { isAdmin } from '@/lib/admin-auth'

function getServiceClient() {
  return createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
}

async function verifyAdmin(req: NextRequest): Promise<boolean> {
  const email = req.headers.get('x-admin-email') ?? ''
  return isAdmin(email)
}

export async function GET(req: NextRequest) {
  if (!(await verifyAdmin(req))) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
  }

  const supabase = getServiceClient()
  const searchParams = req.nextUrl.searchParams
  const search = searchParams.get('search') ?? ''
  const page = parseInt(searchParams.get('page') ?? '1', 10)
  const limit = 20
  const offset = (page - 1) * limit

  const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()

  let query = supabase
    .from('api_keys')
    .select('id, email, tier, is_active, created_at, key_prefix', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (search) {
    query = query.ilike('email', `%${search}%`)
  }

  const { data: keys, count, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // RPCs this month per email
  const emails = (keys ?? []).map(k => k.email)
  const rpcMap: Record<string, number> = {}

  if (emails.length > 0) {
    const { data: authUsers } = await supabase.auth.admin.listUsers()
    const userIdByEmail: Record<string, string> = {}
    for (const u of authUsers?.users ?? []) {
      if (u.email && emails.includes(u.email)) {
        userIdByEmail[u.email] = u.id
      }
    }

    for (const email of emails) {
      const userId = userIdByEmail[email]
      if (!userId) { rpcMap[email] = 0; continue }

      const { data: nss } = await supabase
        .from('namespaces')
        .select('id')
        .eq('owner_id', userId)

      const nsIds = (nss ?? []).map(n => n.id)
      if (nsIds.length === 0) { rpcMap[email] = 0; continue }

      const { count: rpcCount } = await supabase
        .from('connection_logs')
        .select('*', { count: 'exact', head: true })
        .in('namespace_id', nsIds)
        .gte('created_at', monthStart)

      rpcMap[email] = rpcCount ?? 0
    }
  }

  const users = (keys ?? []).map(k => ({
    ...k,
    rpcs_month: rpcMap[k.email] ?? 0,
  }))

  return NextResponse.json({ users, total: count ?? 0, page, limit })
}

export async function PATCH(req: NextRequest) {
  if (!(await verifyAdmin(req))) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
  }

  let body: { id?: string; tier?: string; is_active?: boolean }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Body inválido' }, { status: 400 })
  }

  const { id, tier, is_active } = body

  if (!id) {
    return NextResponse.json({ error: 'id requerido' }, { status: 400 })
  }

  const updates: Record<string, unknown> = {}
  if (tier !== undefined) {
    if (!['free', 'pro'].includes(tier)) {
      return NextResponse.json({ error: 'tier debe ser free o pro' }, { status: 400 })
    }
    updates.tier = tier
  }
  if (is_active !== undefined) {
    updates.is_active = is_active
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'Nada que actualizar' }, { status: 400 })
  }

  const supabase = getServiceClient()
  const { error } = await supabase
    .from('api_keys')
    .update(updates)
    .eq('id', id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
