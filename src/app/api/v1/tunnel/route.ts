import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'
import { authenticateRequest } from '@/lib/api-auth'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://spainmcp-fngo.vercel.app'
const TUNNEL_TTL_MS = 2 * 60 * 60 * 1000 // 2 horas

function getServiceClient() {
  return createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
}

function generateTunnelId(): string {
  return crypto.randomBytes(12).toString('hex')
}

export async function POST(req: NextRequest) {
  const auth = await authenticateRequest(req)
  if (!auth) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  let body: { port?: unknown; localUrl?: unknown; name?: unknown }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Cuerpo de la solicitud inválido' }, { status: 400 })
  }

  // Accept either a port (we build the local URL) or an explicit localUrl
  let localUrl: string
  if (typeof body.localUrl === 'string' && body.localUrl.trim()) {
    localUrl = body.localUrl.trim()
  } else if (typeof body.port === 'number' && Number.isInteger(body.port) && body.port > 0 && body.port < 65536) {
    localUrl = `http://localhost:${body.port}`
  } else {
    return NextResponse.json(
      { error: 'Se requiere "port" (número 1-65535) o "localUrl" (string)' },
      { status: 400 }
    )
  }

  const name = typeof body.name === 'string' ? body.name.trim().slice(0, 100) : null
  const tunnelId = generateTunnelId()
  const expiresAt = new Date(Date.now() + TUNNEL_TTL_MS).toISOString()
  const publicUrl = `${BASE_URL}/api/v1/tunnel/${tunnelId}/mcp`

  const supabase = getServiceClient()
  const { error } = await supabase.from('tunnels').insert({
    tunnel_id: tunnelId,
    owner_email: auth.email ?? auth.userId,
    local_url: localUrl,
    name,
    is_active: true,
    expires_at: expiresAt,
  })

  if (error) {
    console.error('Supabase tunnel insert error:', error)
    return NextResponse.json({ error: 'Error al crear el túnel' }, { status: 500 })
  }

  return NextResponse.json(
    { tunnelId, publicUrl, expiresAt, localUrl, name },
    { status: 201 }
  )
}

export async function DELETE(req: NextRequest) {
  const auth = await authenticateRequest(req)
  if (!auth) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const tunnelId = searchParams.get('tunnelId')
  if (!tunnelId) {
    return NextResponse.json({ error: 'Se requiere el parámetro tunnelId' }, { status: 400 })
  }

  const supabase = getServiceClient()
  const { data, error } = await supabase
    .from('tunnels')
    .update({ is_active: false })
    .eq('tunnel_id', tunnelId)
    .eq('owner_email', auth.email ?? auth.userId)
    .select('tunnel_id')
    .single()

  if (error || !data) {
    return NextResponse.json(
      { error: 'Túnel no encontrado o no tienes permiso para cerrarlo' },
      { status: 404 }
    )
  }

  return NextResponse.json({ ok: true, tunnelId })
}
