import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { isAdmin } from '@/lib/admin-auth'

function getServiceClient() {
  return createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
}

function checkAdmin(req: NextRequest): boolean {
  const email = req.headers.get('x-admin-email') ?? ''
  return isAdmin(email)
}

/* ── GET: list pending_review items ── */
export async function GET(req: NextRequest) {
  if (!checkAdmin(req)) return NextResponse.json({ error: 'No autorizado' }, { status: 403 })

  const supabase = getServiceClient()

  const { data: mcps } = await supabase
    .from('mcp_catalog')
    .select('id, nombre, slug, owner_id, status, is_public, created_at')
    .eq('status', 'pending_review')
    .order('created_at', { ascending: true })

  const { data: skills } = await supabase
    .from('skills_catalog')
    .select('id, nombre, slug, owner_id, status, is_public, created_at')
    .eq('status', 'pending_review')
    .order('created_at', { ascending: true })

  const items = [
    ...(mcps ?? []).map(m => ({ ...m, type: 'mcp' as const })),
    ...(skills ?? []).map(s => ({ ...s, type: 'skill' as const })),
  ].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())

  return NextResponse.json({ items })
}

/* ── PATCH: approve or reject ── */
export async function PATCH(req: NextRequest) {
  if (!checkAdmin(req)) return NextResponse.json({ error: 'No autorizado' }, { status: 403 })

  const body = await req.json()
  const { id, type, action } = body as { id: string; type: 'mcp' | 'skill'; action: 'approve' | 'reject' }

  const supabase = getServiceClient()
  const table = type === 'mcp' ? 'mcp_catalog' : 'skills_catalog'

  if (action === 'approve') {
    await supabase.from(table).update({ status: 'approved', is_public: true }).eq('id', id)
  } else if (action === 'reject') {
    await supabase.from(table).update({ status: 'rejected' }).eq('id', id)
  }

  return NextResponse.json({ success: true })
}
