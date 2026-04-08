import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { authenticateRequest } from '@/lib/api-auth'

function getServiceClient() {
  return createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
}

// POST /api/v1/servers/:qualifiedName/deploy — Deploy MCP server code
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

  let body: { code?: unknown; version?: unknown }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const { code, version } = body

  if (!code || typeof code !== 'string' || code.trim() === '') {
    return NextResponse.json({ error: 'code is required and must be a non-empty string' }, { status: 400 })
  }

  const resolvedVersion = typeof version === 'string' && version.trim() !== '' ? version.trim() : '1.0.0'

  if (!code.includes('export default') || !code.includes('fetch')) {
    return NextResponse.json(
      { error: 'code must contain "export default" and a "fetch" handler' },
      { status: 422 }
    )
  }

  const supabase = getServiceClient()

  const { data: server, error: serverError } = await supabase
    .from('mcp_servers')
    .select('id, namespace, owner_email')
    .eq('namespace', qualifiedName)
    .single()

  if (serverError || !server) {
    return NextResponse.json({ error: 'Server not found' }, { status: 404 })
  }

  const ownerIdentity = auth.email ?? auth.userId
  if (server.owner_email !== ownerIdentity) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { data: release, error: releaseError } = await supabase
    .from('releases')
    .insert({
      server_id: server.id,
      version: resolvedVersion,
      source_code: code,
      status: 'building',
      build_log: `Build started at ${new Date().toISOString()}`,
    })
    .select('id')
    .single()

  if (releaseError || !release) {
    console.error('Failed to create release:', releaseError)
    return NextResponse.json({ error: 'Failed to create release' }, { status: 500 })
  }

  const deployUrl = `https://spainmcp-connect.nilmiq.workers.dev/hosted/${qualifiedName}`
  const deployedAt = new Date().toISOString()

  const { error: serverUpdateError } = await supabase
    .from('mcp_servers')
    .update({
      source_code: code,
      is_deployed: true,
      deploy_url: deployUrl,
      current_release_id: release.id,
    })
    .eq('id', server.id)

  if (serverUpdateError) {
    console.error('Failed to update mcp_servers:', serverUpdateError)
    return NextResponse.json({ error: 'Failed to update server deploy state' }, { status: 500 })
  }

  const { error: releaseUpdateError } = await supabase
    .from('releases')
    .update({
      status: 'active',
      deploy_url: deployUrl,
      deployed_at: deployedAt,
      build_log: `Build started at ${deployedAt}\nBuild complete. Code stored. Awaiting CF Workers for Platforms activation.`,
    })
    .eq('id', release.id)

  if (releaseUpdateError) {
    console.error('Failed to finalize release:', releaseUpdateError)
    return NextResponse.json({ error: 'Failed to finalize release' }, { status: 500 })
  }

  return NextResponse.json({
    qualifiedName,
    version: resolvedVersion,
    status: 'active',
    deployUrl,
    releaseId: release.id,
  })
}

// GET /api/v1/servers/:qualifiedName/deploy — Get latest deploy status
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ qualifiedName: string }> }
) {
  const { qualifiedName: rawParam } = await params
  const qualifiedName = decodeURIComponent(rawParam)

  const supabase = getServiceClient()

  const { data: server, error: serverError } = await supabase
    .from('mcp_servers')
    .select('id, namespace, is_deployed, deploy_url, current_release_id')
    .eq('namespace', qualifiedName)
    .single()

  if (serverError || !server) {
    return NextResponse.json({ error: 'Server not found' }, { status: 404 })
  }

  if (!server.is_deployed || !server.current_release_id) {
    return NextResponse.json({ error: 'No deploy found for this server' }, { status: 404 })
  }

  const { data: release, error: releaseError } = await supabase
    .from('releases')
    .select('id, version, status, deploy_url, build_log, deployed_at, created_at')
    .eq('id', server.current_release_id)
    .single()

  if (releaseError || !release) {
    return NextResponse.json({ error: 'Release not found' }, { status: 404 })
  }

  return NextResponse.json({
    version: release.version,
    status: release.status,
    deployUrl: release.deploy_url,
    deployedAt: release.deployed_at,
    buildLog: release.build_log,
    releaseId: release.id,
    createdAt: release.created_at,
  })
}
