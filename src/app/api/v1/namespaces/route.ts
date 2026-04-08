import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { authenticateRequest } from '@/lib/api-auth'

function getServiceClient() {
  return createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
}

const NAME_REGEX = /^[a-z0-9][a-z0-9-]{1,62}[a-z0-9]$|^[a-z0-9]{3}$/

function isValidName(name: string): boolean {
  return NAME_REGEX.test(name) && name.length >= 3 && name.length <= 64
}

export async function POST(req: NextRequest) {
  const auth = await authenticateRequest(req)
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: { name?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const { name } = body
  if (!name || typeof name !== 'string') {
    return NextResponse.json({ error: 'name is required' }, { status: 400 })
  }

  if (!isValidName(name)) {
    return NextResponse.json(
      { error: 'name must be 3-64 lowercase alphanumeric characters and hyphens' },
      { status: 400 }
    )
  }

  const supabase = getServiceClient()
  const { data, error } = await supabase
    .from('namespaces')
    .insert({ name, owner_id: auth.userId })
    .select('name, created_at')
    .single()

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json({ error: 'Namespace already exists' }, { status: 409 })
    }
    console.error('Supabase insert error:', error)
    return NextResponse.json({ error: 'Failed to create namespace' }, { status: 500 })
  }

  return NextResponse.json(
    { name: data.name, createdAt: data.created_at },
    { status: 201 }
  )
}

export async function GET(req: NextRequest) {
  const auth = await authenticateRequest(req)
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = req.nextUrl
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10) || 1)
  const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get('pageSize') ?? '20', 10) || 20))
  const offset = (page - 1) * pageSize

  const supabase = getServiceClient()

  const { data, error, count } = await supabase
    .from('namespaces')
    .select('name, created_at', { count: 'exact' })
    .eq('owner_id', auth.userId)
    .order('created_at', { ascending: false })
    .range(offset, offset + pageSize - 1)

  if (error) {
    console.error('Supabase query error:', error)
    return NextResponse.json({ error: 'Failed to list namespaces' }, { status: 500 })
  }

  const totalCount = count ?? 0
  const totalPages = Math.ceil(totalCount / pageSize)

  return NextResponse.json({
    namespaces: (data ?? []).map((row) => ({ name: row.name, createdAt: row.created_at })),
    pagination: {
      currentPage: page,
      pageSize,
      totalPages,
      totalCount,
    },
  })
}
