import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function getServiceClient() {
  return createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ tunnelId: string }> }
) {
  const { tunnelId } = await params
  const supabase = getServiceClient()

  const { data: tunnel, error } = await supabase
    .from('tunnels')
    .select('local_url, is_active, expires_at')
    .eq('tunnel_id', tunnelId)
    .single()

  if (error || !tunnel) {
    return NextResponse.json({ error: 'Túnel no encontrado' }, { status: 404 })
  }

  if (!tunnel.is_active) {
    return NextResponse.json({ error: 'El túnel ha sido cerrado' }, { status: 410 })
  }

  if (tunnel.expires_at && new Date(tunnel.expires_at) < new Date()) {
    return NextResponse.json({ error: 'El túnel ha expirado' }, { status: 410 })
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Cuerpo de la solicitud inválido' }, { status: 400 })
  }

  const targetUrl = tunnel.local_url.replace(/\/$/, '') + '/mcp'

  try {
    const upstream = await fetch(targetUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(30_000),
    })

    const responseBody = await upstream.text()

    return new NextResponse(responseBody, {
      status: upstream.status,
      headers: { 'Content-Type': upstream.headers.get('Content-Type') ?? 'application/json' },
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error desconocido'
    return NextResponse.json(
      { error: `No se pudo conectar con el servidor local: ${message}` },
      { status: 502 }
    )
  }
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ tunnelId: string }> }
) {
  const { tunnelId } = await params
  const supabase = getServiceClient()

  const { data: tunnel, error } = await supabase
    .from('tunnels')
    .select('tunnel_id, name, local_url, is_active, expires_at, created_at')
    .eq('tunnel_id', tunnelId)
    .single()

  if (error || !tunnel) {
    return NextResponse.json({ error: 'Túnel no encontrado' }, { status: 404 })
  }

  return NextResponse.json({ tunnel })
}
