import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { authenticateRequest } from '@/lib/api-auth'

function getServiceClient() {
  return createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
}

// GET /api/v1/servers/:qualifiedName/releases — List all releases
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ qualifiedName: string }> }
) {
  const { qualifiedName: rawParam } = await params
  const qualifiedName = decodeURIComponent(rawParam)

  const supabase = getServiceClient()

  const { data: server } = await supabase
    .from('mcp_servers')
    .select('id, current_release_id')
    .eq('namespace', qualifiedName)
    .single()

  if (!server) {
    return NextResponse.json({ error: 'Server not found' }, { status: 404 })
  }

  const { data: releases, error } = await supabase
    .from('releases')
    .select('id, version, status, deploy_url, build_log, error_message, created_at, deployed_at')
    .eq('server_id', server.id)
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({
    releases: (releases ?? []).map(r => ({
      ...r,
      isCurrent: r.id === server.current_release_id,
    })),
  })
}

// POST /api/v1/servers/:qualifiedName/releases — Rollback to a specific release
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

  let body: { releaseId?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 })
  }

  if (!body.releaseId) {
    return NextResponse.json({ error: 'releaseId required' }, { status: 400 })
  }

  const supabase = getServiceClient()

  const { data: server } = await supabase
    .from('mcp_servers')
    .select('id, owner_email')
    .eq('namespace', qualifiedName)
    .single()

  if (!server) {
    return NextResponse.json({ error: 'Server not found' }, { status: 404 })
  }

  const ownerIdentity = auth.email ?? auth.userId
  if (server.owner_email !== ownerIdentity) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // Verify release belongs to this server and is deployable
  const { data: release } = await supabase
    .from('releases')
    .select('id, version, deploy_url, status')
    .eq('id', body.releaseId)
    .eq('server_id', server.id)
    .single()

  if (!release) {
    return NextResponse.json({ error: 'Release not found' }, { status: 404 })
  }

  if (release.status !== 'active') {
    return NextResponse.json({ error: 'Can only rollback to active releases' }, { status: 400 })
  }

  // Update server to point to this release
  const { error: updateError } = await supabase
    .from('mcp_servers')
    .update({
      current_release_id: release.id,
      deploy_url: release.deploy_url,
    })
    .eq('id', server.id)

  if (updateError) {
    return NextResponse.json({ error: 'Rollback failed' }, { status: 500 })
  }

  return NextResponse.json({
    success: true,
    version: release.version,
    releaseId: release.id,
  })
}
