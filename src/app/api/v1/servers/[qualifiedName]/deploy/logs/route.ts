import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { authenticateRequest } from '@/lib/api-auth'

function getServiceClient() {
  return createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
}

// GET /api/v1/servers/:qualifiedName/deploy/logs — Get build logs (owner only)
export async function GET(
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
    .select('id, namespace, owner_email, current_release_id')
    .eq('namespace', qualifiedName)
    .single()

  if (serverError || !server) {
    return NextResponse.json({ error: 'Server not found' }, { status: 404 })
  }

  const ownerIdentity = auth.email ?? auth.userId
  if (server.owner_email !== ownerIdentity) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  if (!server.current_release_id) {
    return new NextResponse('No deploy found for this server', {
      status: 404,
      headers: { 'Content-Type': 'text/plain' },
    })
  }

  const { data: release, error: releaseError } = await supabase
    .from('releases')
    .select('build_log, version, status, deployed_at')
    .eq('id', server.current_release_id)
    .single()

  if (releaseError || !release) {
    return new NextResponse('Release not found', {
      status: 404,
      headers: { 'Content-Type': 'text/plain' },
    })
  }

  const log = release.build_log ?? `version: ${release.version}\nstatus: ${release.status}\ndeployed_at: ${release.deployed_at ?? 'pending'}`

  return new NextResponse(log, {
    status: 200,
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  })
}
