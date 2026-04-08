import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function getSupabase() {
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function GET(req: NextRequest) {
  const email = req.nextUrl.searchParams.get('email')
  if (!email) {
    return NextResponse.json({ error: 'email required' }, { status: 400 })
  }

  const { data, error } = await getSupabase()
    .from('api_keys')
    .select('id, key_prefix, name, is_active, created_at')
    .eq('email', email)
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const keys = (data ?? []).map(k => ({
    id: k.id,
    key_preview: k.key_prefix || '••••••••',
    name: k.name || 'Unnamed Key',
    is_default: false,
    created_at: k.created_at,
  }))

  return NextResponse.json({ has_key: keys.length > 0, keys })
}

export async function PATCH(req: NextRequest) {
  const email = req.nextUrl.searchParams.get('email')
  if (!email) {
    return NextResponse.json({ error: 'email required' }, { status: 400 })
  }

  let body: { id?: string; name?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 })
  }

  if (!body.id || !body.name) {
    return NextResponse.json({ error: 'id and name required' }, { status: 400 })
  }

  const supabase = getSupabase()
  const { error } = await supabase
    .from('api_keys')
    .update({ name: body.name })
    .eq('id', body.id)
    .eq('email', email)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}

export async function DELETE(req: NextRequest) {
  const email = req.nextUrl.searchParams.get('email')
  if (!email) {
    return NextResponse.json({ error: 'email required' }, { status: 400 })
  }

  let body: { id?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 })
  }

  if (!body.id) {
    return NextResponse.json({ error: 'id required' }, { status: 400 })
  }

  const supabase = getSupabase()
  const { error } = await supabase
    .from('api_keys')
    .update({ is_active: false })
    .eq('id', body.id)
    .eq('email', email)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
