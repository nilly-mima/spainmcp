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

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const q = searchParams.get('q')?.trim() ?? ''
  const namespace = searchParams.get('namespace')?.trim() ?? ''
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10) || 1)
  const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get('pageSize') ?? '20', 10) || 20))
  const offset = (page - 1) * pageSize

  const supabase = getServiceClient()

  let query = supabase
    .from('skills')
    .select(
      'qualified_name, display_name, description, install_count, created_at, updated_at, namespaces!inner(name)',
      { count: 'exact' }
    )
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .range(offset, offset + pageSize - 1)

  if (q) {
    query = query.or(`display_name.ilike.%${q}%,description.ilike.%${q}%`)
  }

  if (namespace) {
    query = query.eq('namespaces.name', namespace)
  }

  const { data, error, count } = await query

  if (error) {
    console.error('List skills error:', error)
    return NextResponse.json({ error: 'Failed to list skills' }, { status: 500 })
  }

  const totalCount = count ?? 0
  const totalPages = Math.ceil(totalCount / pageSize)

  return NextResponse.json({
    skills: (data ?? []).map((row) => ({
      qualifiedName: row.qualified_name,
      displayName: row.display_name,
      description: row.description,
      installCount: row.install_count,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    })),
    pagination: {
      currentPage: page,
      pageSize,
      totalPages,
      totalCount,
    },
  })
}

// DEPRECATED — use PUT /api/v1/skills/:qualifiedName instead
export async function POST(req: NextRequest) {
  const auth = await authenticateRequest(req)
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: {
    qualifiedName?: string
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

  if (!body.qualifiedName || typeof body.qualifiedName !== 'string') {
    return NextResponse.json({ error: 'qualifiedName is required' }, { status: 400 })
  }
  if (!body.displayName || typeof body.displayName !== 'string') {
    return NextResponse.json({ error: 'displayName is required' }, { status: 400 })
  }
  if (!body.content || typeof body.content !== 'string') {
    return NextResponse.json({ error: 'content is required' }, { status: 400 })
  }

  const parsed = parseNamespace(body.qualifiedName)
  if (!parsed) {
    return NextResponse.json(
      { error: 'qualifiedName must be in format "namespace/skill-name"' },
      { status: 400 }
    )
  }

  const supabase = getServiceClient()
  const nsResult = await resolveNamespaceOwnership(supabase, parsed.namespace, auth.userId)
  if ('error' in nsResult) {
    return NextResponse.json({ error: nsResult.error }, { status: nsResult.status })
  }

  const { data, error } = await supabase
    .from('skills')
    .insert({
      qualified_name: body.qualifiedName,
      namespace_id: nsResult.id,
      display_name: body.displayName,
      description: body.description ?? null,
      content: body.content,
      agent_configs: body.agentConfigs ?? null,
      is_active: true,
    })
    .select('qualified_name, display_name, description, content, agent_configs, install_count, created_at, updated_at')
    .single()

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json({ error: 'Skill with this qualifiedName already exists' }, { status: 409 })
    }
    console.error('Insert skill error:', error)
    return NextResponse.json({ error: 'Failed to create skill' }, { status: 500 })
  }

  return NextResponse.json(
    {
      qualifiedName: data.qualified_name,
      displayName: data.display_name,
      description: data.description,
      content: data.content,
      agentConfigs: data.agent_configs,
      installCount: data.install_count,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    },
    { status: 201 }
  )
}
