import { createClient } from '@supabase/supabase-js'
import { getAllSkills, getSkillsTotal } from '@/lib/skills'
import SkillsDirectory from '@/components/SkillsDirectory'
import type { Skill } from '@/lib/skills'

export const metadata = {
  title: 'Skills — SpainMCP',
  description: 'Directorio de skills para Claude en español. Encuentra y conecta skills de Anthropic, GitHub y la comunidad.',
}

async function getSkillsCatalog(): Promise<{ skills: Skill[]; total: number }> {
  try {
    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data, count, error } = await supabase
      .from('skills_catalog')
      .select('id, nombre, slug, descripcion, categoria, installs, stars, author, icon_url, is_active, created_at', { count: 'exact' })
      .eq('is_active', true)
      .eq('status', 'approved')
      .eq('is_public', true)
      .order('created_at', { ascending: false })
      .limit(500)

    if (error || !data || data.length === 0) throw new Error('empty')

    // Map skills_catalog shape to the Skill interface used by SkillsDirectory
    const mapped: Skill[] = data.map(row => ({
      id: row.id,
      creator: row.author ?? 'spainmcp',
      nombre: row.nombre,
      descripcion: row.descripcion ?? '',
      categoria: row.categoria ?? 'general',
      installs: row.installs ?? 0,
      stars: row.stars ?? 0,
      verified: (row.author ?? 'spainmcp') === 'spainmcp',
      slug: row.slug ?? '',
      author: row.author ?? 'spainmcp',
      icon_url: row.icon_url ?? '',
    }))

    return { skills: mapped, total: count ?? mapped.length }
  } catch {
    // Fallback to JSON file
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
