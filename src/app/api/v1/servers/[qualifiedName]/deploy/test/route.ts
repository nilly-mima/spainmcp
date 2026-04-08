import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { authenticateRequest } from '@/lib/api-auth'

function getServiceClient() {
  return createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
}

// POST /api/v1/servers/:qualifiedName/deploy/test — Send tools/list to deployed URL
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ qualifiedName: string }> }
) {
  const auth = await authenticateRequest(req)
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { qualifiedName: rawParam } = await params
  const qualifiedName = decodeURIComponent(rawParam)

  const supabase = getServiceClient()

  const { data: server, error: serverError } = await supabase
    .from('mcp_servers')
    .select('id, namespace, owner_email, is_deployed, deploy_url')
    .eq('namespace', qualifiedName)
    .single()

  if (serverError || !server) {
    return NextResponse.json({ error: 'Server not found' }, { status: 404 })
  }

  const ownerIdentity = auth.email ?? auth.userId
  if (server.owner_email !== ownerIdentity) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  if (!server.is_deployed || !server.deploy_url) {
    return NextResponse.json({ error: 'Server has not been deployed yet' }, { status: 409 })
  }

  try {
    const res = await fetch(server.deploy_url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'tools/list',
        params: {},
      }),
      signal: AbortSignal.timeout(8000),
    })

    if (!res.ok) {
      return NextResponse.json({
        ok: false,
        httpStatus: res.status,
        error: `Upstream returned HTTP ${res.status}`,
        deployUrl: server.deploy_url,
      })
    }

    const data = await res.json()
    const tools: { name: string; description?: string }[] = data?.result?.tools ?? []

    return NextResponse.json({
      ok: true,
      deployUrl: server.deploy_url,
      tools,
      toolCount: tools.length,
      raw: data,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    return NextResponse.json({
      ok: false,
      error: message,
      deployUrl: server.deploy_url,
      note: 'El servidor puede estar en modo beta (Workers for Platforms pendiente de activacion). El codigo esta guardado y se activara automaticamente.',
    })
  }
}
