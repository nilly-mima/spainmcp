import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function getServiceClient() {
  return createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
}

export async function GET(req: NextRequest) {
  const supabase = getServiceClient()

  // Auth
  const token = req.headers.get('Authorization')?.replace('Bearer ', '').trim()
  if (!token) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  const { data: userData } = await supabase.auth.getUser(token)
  const email = userData.user?.email
  if (!email) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  // Fetch user's MCPs
  const { data: mcps } = await supabase
    .from('mcp_catalog')
    .select('id, nombre, slug, status, is_public, created_at')
    .eq('owner_id', email)
    .order('created_at', { ascending: false })

  // Fetch user's skills
  const { data: skills } = await supabase
    .from('skills_catalog')
    .select('id, nombre, slug, status, is_public, created_at')
    .eq('owner_id', email)
    .order('created_at', { ascending: false })

  return NextResponse.json({ mcps: mcps ?? [], skills: skills ?? [] })
}

/* ── PATCH: update status/visibility ── */
export async function PATCH(req: NextRequest) {
  const supabase = getServiceClient()

  const token = req.headers.get('Authorization')?.replace('Bearer ', '').trim()
  if (!token) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  const { data: userData } = await supabase.auth.getUser(token)
  const email = userData.user?.email
  if (!email) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const body = await req.json()
  const { id, type, action } = body as { id: string; type: 'mcp' | 'skill'; action: 'request_review' | 'toggle_public' | 'delete' }

  const table = type === 'mcp' ? 'mcp_catalog' : 'skills_catalog'

  // Verify ownership
  const { data: item } = await supabase.from(table).select('id, owner_id, status, is_public').eq('id', id).single()
  if (!item || item.owner_id !== email) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
  }

  if (action === 'request_review') {
    if (item.status !== 'draft' && item.status !== 'rejected') {
      return NextResponse.json({ error: 'Solo se puede solicitar revisión de borradores' }, { status: 400 })
    }
    await supabase.from(table).update({ status: 'pending_review' }).eq('id', id)
  } else if (action === 'toggle_public') {
    if (item.status !== 'approved') {
      return NextResponse.json({ error: 'Solo items aprobados pueden hacerse públicos' }, { status: 400 })
    }
    await supabase.from(table).update({ is_public: !item.is_public }).eq('id', id)
  } else if (action === 'delete') {
    await supabase.from(table).delete().eq('id', id)
  }

  return NextResponse.json({ success: true })
}
