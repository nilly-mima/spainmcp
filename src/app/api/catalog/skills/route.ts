import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const VERIFIED_AUTHORS = [
  'spainmcp', 'anthropic', 'openai', 'github', 'pytorch', 'vercel', 'cloudflare', 'google',
]

function getServiceClient() {
  return createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const q = searchParams.get('q')?.trim() ?? ''
  const categoria = searchParams.get('categoria')?.trim() ?? ''
  const namespace = searchParams.get('namespace')?.trim() ?? ''
  const onlyVerified = searchParams.get('verified') === 'true'
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10) || 1)
  const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get('pageSize') ?? '24', 10) || 24))
  const offset = (page - 1) * pageSize

  const supabase = getServiceClient()

  let query = supabase
    .from('skills_catalog')
    .select(
      'id, nombre, slug, descripcion, categoria, installs, stars, author, icon_url',
      { count: 'exact' }
    )
    .eq('is_active', true)
    .eq('status', 'approved')
    .eq('is_public', true)
    .order('created_at', { ascending: false })
    .range(offset, offset + pageSize - 1)

  if (q) {
    // escape special chars for ilike pattern
    const esc = q.replace(/[%_]/g, '\\$&')
    query = query.or(`nombre.ilike.%${esc}%,descripcion.ilike.%${esc}%,slug.ilike.%${esc}%`)
  }
  if (categoria) {
    query = query.eq('categoria', categoria)
  }
  if (namespace) {
    query = query.eq('author', namespace)
  }
  if (onlyVerified) {
    query = query.in('author', VERIFIED_AUTHORS)
  }

  const { data, error, count } = await query

  if (error) {
    console.error('catalog/skills GET error:', error)
    return NextResponse.json({ error: 'Error loading skills catalog' }, { status: 500 })
  }

  const skills = (data ?? []).map(row => ({
    id: row.id,
    creator: row.author ?? 'spainmcp',
    nombre: row.nombre,
    descripcion: row.descripcion ?? '',
    categoria: row.categoria ?? 'general',
    installs: row.installs ?? 0,
    stars: row.stars ?? 0,
    verified: VERIFIED_AUTHORS.includes(row.author ?? 'spainmcp'),
    slug: row.slug ?? '',
    author: row.author ?? 'spainmcp',
    icon_url: row.icon_url ?? '',
  }))

  return NextResponse.json({
    skills,
    pagination: {
      currentPage: page,
      pageSize,
      totalPages: Math.ceil((count ?? 0) / pageSize),
      totalCount: count ?? 0,
    },
  })
}

/* ── Parse GitHub URL ── */
function parseGitHubUrl(url: string) {
  const m = url.match(/github\.com\/([^/]+)\/([^/]+)\/tree\/([^/]+)\/(.+)/)
  if (!m) return null
  return { owner: m[1], repo: m[2], branch: m[3], path: m[4] }
}

/* ── Parse YAML frontmatter ── */
function parseFrontmatter(content: string) {
  const fm = content.match(/^---\n([\s\S]*?)\n---/)
  if (!fm) return { name: '', description: '' }
  const block = fm[1]
  const name = block.match(/^name:\s*(.+)$/m)?.[1]?.trim() ?? ''
  const description = block.match(/^description:\s*(.+)$/m)?.[1]?.trim() ?? ''
  return { name, description }
}

interface FileNode {
  name: string
  type: 'file' | 'dir'
  path: string
  children?: FileNode[]
}

/* ── Fetch file tree from GitHub (1 level) ── */
async function fetchFileTree(owner: string, repo: string, branch: string, dirPath: string): Promise<FileNode[]> {
  const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${dirPath}?ref=${branch}`)
  if (!res.ok) return []
  const items = await res.json()
  if (!Array.isArray(items)) return []

  const nodes: FileNode[] = []
  for (const item of items) {
    const relPath = item.path.replace(`${dirPath}/`, '')
    const node: FileNode = { name: item.name, type: item.type === 'dir' ? 'dir' : 'file', path: relPath }
    if (item.type === 'dir') {
      node.children = await fetchFileTree(owner, repo, branch, item.path)
    }
    nodes.push(node)
  }

  return nodes.sort((a, b) => {
    if (a.type !== b.type) return a.type === 'dir' ? -1 : 1
    return a.name.localeCompare(b.name)
  })
}

/* ── Get authenticated user email ── */
async function getUserEmail(req: NextRequest): Promise<string | null> {
  const token = req.headers.get('Authorization')?.replace('Bearer ', '').trim()
  if (!token) return null
  const supabase = getServiceClient()
  const { data } = await supabase.auth.getUser(token)
  return data.user?.email ?? null
}

/* ── POST: Publish a skill ── */
export async function POST(req: NextRequest) {
  try {
    // Auth
    const userEmail = await getUserEmail(req)
    if (!userEmail) {
      return NextResponse.json({ error: 'Debes iniciar sesión para publicar' }, { status: 401 })
    }

    const body = await req.json()
    const { namespace, slug, githubUrl, content: rawContent } = body as {
      namespace?: string; slug?: string; githubUrl?: string; content?: string
    }

    if (!namespace || !slug) {
      return NextResponse.json({ error: 'namespace y slug son obligatorios' }, { status: 400 })
    }
    if (!githubUrl && !rawContent) {
      return NextResponse.json({ error: 'Proporciona una URL de GitHub o el contenido del SKILL.md' }, { status: 400 })
    }

    let skillContent = rawContent ?? ''
    let fileTree: FileNode[] | null = null
    let repoUrl: string | null = null

    // GitHub mode: fetch SKILL.md + file tree
    if (githubUrl) {
      const gh = parseGitHubUrl(githubUrl)
      if (!gh) {
        return NextResponse.json({ error: 'URL de GitHub no válida. Formato: https://github.com/owner/repo/tree/branch/path' }, { status: 400 })
      }

      // Fetch SKILL.md
      const rawUrl = `https://raw.githubusercontent.com/${gh.owner}/${gh.repo}/${gh.branch}/${gh.path}/SKILL.md`
      const skillRes = await fetch(rawUrl)
      if (!skillRes.ok) {
        return NextResponse.json({ error: `No se encontró SKILL.md en ${gh.path}` }, { status: 502 })
      }
      skillContent = await skillRes.text()

      // Fetch file tree
      fileTree = await fetchFileTree(gh.owner, gh.repo, gh.branch, gh.path)
      repoUrl = `https://github.com/${gh.owner}/${gh.repo}/tree/${gh.branch}/${gh.path}`
    }

    // Parse frontmatter
    const { name, description } = parseFrontmatter(skillContent)

    // Check duplicate
    const supabase = getServiceClient()
    const { data: existing } = await supabase
      .from('skills_catalog')
      .select('id')
      .eq('slug', slug)
      .single()

    if (existing) {
      return NextResponse.json({ error: `Ya existe una skill con slug "${slug}"` }, { status: 409 })
    }

    // Insert
    const { data, error } = await supabase
      .from('skills_catalog')
      .insert({
        nombre: name || slug,
        slug,
        descripcion: description || '',
        categoria: 'general',
        content: skillContent,
        icon_url: null,
        author: namespace,
        is_active: true,
        installs: 0,
        stars: 0,
        file_tree: fileTree,
        repo_url: repoUrl,
        owner_id: userEmail,
        status: 'draft',
        is_public: false,
      })
      .select()
      .single()

    if (error) {
      console.error('catalog/skills POST error:', error)
      return NextResponse.json({ error: 'Error al guardar la skill' }, { status: 500 })
    }

    return NextResponse.json({ skill: data }, { status: 201 })
  } catch (err) {
    console.error('catalog/skills POST unexpected error:', err)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
