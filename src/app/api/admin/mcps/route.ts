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
  const id = req.nextUrl.searchParams.get('id')

  if (id) {
    const { data, error } = await supabase
      .from('mcp_catalog')
      .select('*')
      .eq('id', id)
      .single()
    if (error) return NextResponse.json({ error: error.message }, { status: 404 })
    return NextResponse.json({ mcp: data })
  }

  const { data, error } = await supabase
    .from('mcp_catalog')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ mcps: data ?? [] })
}

export async function POST(req: NextRequest) {
  if (!(await verifyAdmin(req))) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
  }

  let body: {
    nombre?: string
    slug?: string
    descripcion_es?: string
    descripcion_en?: string
    scope?: string
    icon_url?: string
    upstream_url?: string
    config?: Record<string, unknown>
  }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Body inválido' }, { status: 400 })
  }

  const { nombre, slug, descripcion_es, descripcion_en, scope, icon_url, upstream_url, config } = body

  if (!nombre || !slug) {
    return NextResponse.json({ error: 'nombre y slug son obligatorios' }, { status: 400 })
  }

  if (!/^[a-z0-9-]+$/.test(slug)) {
    return NextResponse.json({ error: 'slug solo puede contener letras minúsculas, números y guiones' }, { status: 400 })
  }

  const supabase = getServiceClient()
  const { data, error } = await supabase
    .from('mcp_catalog')
    .insert({
      nombre,
      slug,
      descripcion_es: descripcion_es ?? '',
      descripcion_en: descripcion_en ?? '',
      scope: scope ?? 'remoto',
      icon_url: icon_url ?? '',
      upstream_url: upstream_url ?? '',
      config: config ?? {},
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ mcp: data })
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

  // Validate slug if being updated
  if (updates.slug && typeof updates.slug === 'string') {
    if (!/^[a-z0-9-]+$/.test(updates.slug)) {
      return NextResponse.json({ error: 'slug inválido' }, { status: 400 })
    }
  }

  updates.updated_at = new Date().toISOString()

  const supabase = getServiceClient()
  const { error } = await supabase
    .from('mcp_catalog')
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
    .from('mcp_catalog')
    .update({ is_active: false, updated_at: new Date().toISOString() })
    .eq('id', id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
