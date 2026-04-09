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
  const page = parseInt(searchParams.get('page') ?? '1', 10)
  const limit = 20
  const offset = (page - 1) * limit

  const { data, count, error } = await supabase
    .from('mcp_servers')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ servers: data ?? [], total: count ?? 0, page, limit })
}

export async function PATCH(req: NextRequest) {
  if (!(await verifyAdmin(req))) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
  }

  let body: { namespace?: string; is_verified?: boolean; is_active?: boolean }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Body inválido' }, { status: 400 })
  }

  const { namespace, ...updates } = body
  if (!namespace) {
    return NextResponse.json({ error: 'namespace requerido' }, { status: 400 })
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'Nada que actualizar' }, { status: 400 })
  }

  const supabase = getServiceClient()
  const { error } = await supabase
    .from('mcp_servers')
    .update(updates)
    .eq('namespace', namespace)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}

export async function DELETE(req: NextRequest) {
  if (!(await verifyAdmin(req))) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
  }

  const namespace = req.nextUrl.searchParams.get('namespace')
  if (!namespace) {
    return NextResponse.json({ error: 'namespace requerido' }, { status: 400 })
  }

  const supabase = getServiceClient()
  const { error } = await supabase
    .from('mcp_servers')
    .update({ is_active: false })
    .eq('namespace', namespace)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
