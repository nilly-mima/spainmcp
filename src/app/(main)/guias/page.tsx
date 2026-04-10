import { createClient } from '@supabase/supabase-js'
import { getAllSkills, getSkillsTotal } from '@/lib/skills'
import SkillsDirectory from '@/components/SkillsDirectory'
import type { Skill } from '@/lib/skills'

export const metadata = {
  title: 'Skills — SpainMCP',
  description: 'Directorio de skills para Claude en español. Encuentra y conecta skills de Anthropic, GitHub y la comunidad.',
}

// Authors considered "verified" — official organizations whose skills come from their own repos
const VERIFIED_AUTHORS = new Set([
  'spainmcp',
  'anthropic',
  'openai',
  'github',
  'pytorch',
  'vercel',
  'cloudflare',
  'google',
])

const SELECT_COLS = 'id, nombre, slug, descripcion, categoria, installs, stars, author, icon_url, is_active, created_at'

function mapRow(row: {
  id: string
  nombre: string
  slug: string | null
  descripcion: string | null
  categoria: string | null
  installs: number | null
  stars: number | null
  author: string | null
  icon_url: string | null
}): Skill {
  return {
    id: row.id,
    creator: row.author ?? 'spainmcp',
    nombre: row.nombre,
    descripcion: row.descripcion ?? '',
    categoria: row.categoria ?? 'general',
    installs: row.installs ?? 0,
    stars: row.stars ?? 0,
    verified: VERIFIED_AUTHORS.has(row.author ?? 'spainmcp'),
    slug: row.slug ?? '',
    author: row.author ?? 'spainmcp',
    icon_url: row.icon_url ?? '',
  }
}

async function getSkillsCatalog(): Promise<{ skills: Skill[]; total: number }> {
  try {
    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Workaround Supabase PostgREST 1000-row cap: paginate in chunks of 1000.
    const notInFilter = `(${[...VERIFIED_AUTHORS].map(a => `"${a}"`).join(',')})`

    const fetchChunk = async (from: number, to: number) => {
      const { data, error, count } = await supabase
        .from('skills_catalog')
        .select(SELECT_COLS, { count: 'exact' })
        .eq('is_active', true)
        .eq('status', 'approved')
        .eq('is_public', true)
        .not('author', 'in', notInFilter)
        .order('created_at', { ascending: false })
        .range(from, to)
      if (error) throw error
      return { data: data ?? [], count: count ?? 0 }
    }

    // 1) Verified (all — fits in a single <1000 chunk, we have 331 today)
    const { data: verifiedData, error: vErr } = await supabase
      .from('skills_catalog')
      .select(SELECT_COLS)
      .eq('is_active', true)
      .eq('status', 'approved')
      .eq('is_public', true)
      .in('author', [...VERIFIED_AUTHORS])
      .order('created_at', { ascending: false })
      .range(0, 999)
    if (vErr) throw vErr

    // 2) Non-verified in 3 chunks of 1000 (cover up to 3000 total others)
    const chunk1 = await fetchChunk(0, 999)
    const chunk2 = chunk1.data.length === 1000 ? await fetchChunk(1000, 1999) : { data: [], count: chunk1.count }
    const chunk3 = chunk2.data.length === 1000 ? await fetchChunk(2000, 2999) : { data: [], count: chunk1.count }

    const verified = (verifiedData ?? []).map(mapRow)
    const others = [...chunk1.data, ...chunk2.data, ...chunk3.data].map(mapRow)
    const all = [...verified, ...others]
    if (all.length === 0) throw new Error('empty')

    return { skills: all, total: chunk1.count + verified.length }
  } catch {
    return { skills: getAllSkills(), total: getSkillsTotal() }
  }
}

export default async function SkillsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const { q } = await searchParams
  const { skills, total } = await getSkillsCatalog()

  return (
    <div className="flex flex-col gap-6">
      <SkillsDirectory key={q ?? ''} skills={skills} total={total} initialSearch={q ?? ''} />
    </div>
  )
}
