import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { authenticateRequest } from '@/lib/api-auth'

function getServiceClient() {
  return createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
}

// GET /api/v1/servers/:qualifiedName/icon
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ qualifiedName: string }> }
) {
  const { qualifiedName: rawParam } = await params
  const qualifiedName = decodeURIComponent(rawParam)

  const supabase = getServiceClient()

  const { data, error } = await supabase
    .from('mcp_servers')
    .select('namespace')
    .eq('namespace', qualifiedName)
    .eq('is_active', true)
    .single()

  if (error || !data) {
    return NextResponse.json({ error: 'Server not found' }, { status: 404 })
  }

  // No logo_url column in schema yet — return 404
  return NextResponse.json({ error: 'No icon available' }, { status: 404 })
}

// PUT /api/v1/servers/:qualifiedName/icon — placeholder
export async function PUT(
  req: NextRequest,
  { params: _params }: { params: Promise<{ qualifiedName: string }> }
) {
  const auth = await authenticateRequest(req)
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  return NextResponse.json({ error: 'Not Implemented' }, { status: 501 })
}

// DELETE /api/v1/servers/:qualifiedName/icon — placeholder
export async function DELETE(
  req: NextRequest,
  { params: _params }: { params: Promise<{ qualifiedName: string }> }
) {
  const auth = await authenticateRequest(req)
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  return NextResponse.json({ error: 'Not Implemented' }, { status: 501 })
}
