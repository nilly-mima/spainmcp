import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { authenticateRequest } from '@/lib/api-auth'

function getServiceClient() {
  return createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
}

function parseNamespace(qualifiedName: string): { namespace: string; skillName: string } | null {
  const slash = qualifiedName.indexOf('/')
  if (slash < 1 || slash === qualifiedName.length - 1) return null
  return {
    namespace: qualifiedName.slice(0, slash),
    skillName: qualifiedName.slice(slash + 1),
  }
}

async function resolveNamespaceOwnership(
  supabase: ReturnType<typeof getServiceClient>,
  namespaceName: string,
  userId: string
): Promise<{ id: string } | { error: string; status: number }> {
  const { data, error } = await supabase
    .from('namespaces')
    .select('id, owner_id')
    .eq('name', namespaceName)
    .single()

  if (error || !data) return { error: 'Namespace not found', status: 404 }
  if (data.owner_id !== userId) return { error: 'Forbidden', status: 403 }
  return { id: data.id }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ qualifiedName: string }> }
) {
  const auth = await authenticateRequest(req)
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { qualifiedName: rawParam } = await params
  const qualifiedName = decodeURIComponent(rawParam)

  const parsed = parseNamespace(qualifiedName)
  if (!parsed) {
    return NextResponse.json(
      { error: 'qualifiedName must be in format "namespace/skill-name"' },
      { status: 400 }
    )
  }

  let body: {
    displayName?: string
    description?: string
    content?: string
    agentConfigs?: unknown
  }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  if (!body.displayName || typeof body.displayName !== 'string') {
    return NextResponse.json({ error: 'displayName is required' }, { status: 400 })
  }
  if (!body.content || typeof body.content !== 'string') {
    return NextResponse.json({ error: 'content is required' }, { status: 400 })
  }

  const supabase = getServiceClient()
  const nsResult = await resolveNamespaceOwnership(supabase, parsed.namespace, auth.userId)
  if ('error' in nsResult) {
    return NextResponse.json({ error: nsResult.error }, { status: nsResult.status })
  }

  const { data, error } = await supabase
    .from('skills')
    .upsert(
      {
        qualified_name: qualifiedName,
        namespace_id: nsResult.id,
        display_name: body.displayName,
        description: body.description ?? null,
        content: body.content,
        agent_configs: body.agentConfigs ?? null,
        is_active: true,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'qualified_name' }
    )
    .select('qualified_name, display_name, description, content, agent_configs, install_count, created_at, updated_at')
    .single()

  if (error) {
    console.error('Upsert skill error:', error)
    return NextResponse.json({ error: 'Failed to upsert skill' }, { status: 500 })
  }

  return NextResponse.json({
    qualifiedName: data.qualified_name,
    displayName: data.display_name,
    description: data.description,
    content: data.content,
    agentConfigs: data.agent_configs,
    installCount: data.install_count,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  })
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ qualifiedName: string }> }
) {
  const { qualifiedName: rawParam } = await params
  const qualifiedName = decodeURIComponent(rawParam)

  const supabase = getServiceClient()

  const { data, error } = await supabase
    .from('skills')
    .select('qualified_name, display_name, description, content, agent_configs, install_count, created_at, updated_at')
    .eq('qualified_name', qualifiedName)
    .eq('is_active', true)
    .single()

  if (error || !data) {
    return NextResponse.json({ error: 'Skill not found' }, { status: 404 })
  }

  return NextResponse.json({
    qualifiedName: data.qualified_name,
    displayName: data.display_name,
    description: data.description,
    content: data.content,
    agentConfigs: data.agent_configs,
    installCount: data.install_count,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  })
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ qualifiedName: string }> }
) {
  const auth = await authenticateRequest(req)
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { qualifiedName: rawParam } = await params
  const qualifiedName = decodeURIComponent(rawParam)

  const parsed = parseNamespace(qualifiedName)
  if (!parsed) {
    return NextResponse.json(
      { error: 'qualifiedName must be in format "namespace/skill-name"' },
      { status: 400 }
    )
  }

  const supabase = getServiceClient()

  const { data: skill, error: fetchError } = await supabase
    .from('skills')
    .select('id, namespace_id, is_active')
    .eq('qualified_name', qualifiedName)
    .single()

  if (fetchError || !skill) {
    return NextResponse.json({ error: 'Skill not found' }, { status: 404 })
  }

  const nsResult = await resolveNamespaceOwnership(supabase, parsed.namespace, auth.userId)
  if ('error' in nsResult) {
    return NextResponse.json({ error: nsResult.error }, { status: nsResult.status })
  }

  if (skill.namespace_id !== nsResult.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { error: updateError } = await supabase
    .from('skills')
    .update({ is_active: false, updated_at: new Date().toISOString() })
    .eq('id', skill.id)

  if (updateError) {
    console.error('Soft delete skill error:', updateError)
    return NextResponse.json({ error: 'Failed to delete skill' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
