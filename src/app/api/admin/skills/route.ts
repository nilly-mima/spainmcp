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
  const { data, error } = await supabase
    .from('skills_catalog')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    // Table may not exist yet — return empty gracefully
    return NextResponse.json({ skills: [] })
  }

  return NextResponse.json({ skills: data ?? [] })
}

export async function POST(req: NextRequest) {
  if (!(await verifyAdmin(req))) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
  }

  let body: { nombre?: string; descripcion?: string; categoria?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Body inválido' }, { status: 400 })
  }

  const { nombre, descripcion, categoria } = body
  if (!nombre) {
    return NextResponse.json({ error: 'nombre es obligatorio' }, { status: 400 })
  }

  const supabase = getServiceClient()
  const { data, error } = await supabase
    .from('skills_catalog')
    .insert({ nombre, descripcion: descripcion ?? '', categoria: categoria ?? 'general', is_active: true })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ skill: data })
}

export async function PATCH(req: NextRequest) {
  if (!(await verifyAdmin(req))) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
  }

  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Body inválido' }, { status: 400 })
  }

  const { id, ...updates } = body
  if (!id || typeof id !== 'string') {
    return NextResponse.json({ error: 'id requerido' }, { status: 400 })
  }

  const supabase = getServiceClient()
  const { error } = await supabase
    .from('skills_catalog')
    .update(updates)
    .eq('id', id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}

export async function DELETE(req: NextRequest) {
  if (!(await verifyAdmin(req))) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
  }

  const id = req.nextUrl.searchParams.get('id')
  if (!id) {
    return NextResponse.json({ error: 'id requerido' }, { status: 400 })
  }

  const supabase = getServiceClient()
  const { error } = await supabase
    .from('skills_catalog')
    .update({ is_active: false })
    .eq('id', id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
