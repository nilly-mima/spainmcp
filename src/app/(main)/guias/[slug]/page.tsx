import { notFound } from 'next/navigation'
import { getSkillById } from '@/lib/skills'
import { createClient } from '@supabase/supabase-js'
import SkillDetailClient from './SkillDetailClient'
import type { Skill } from '@/lib/skills'

async function getSkillFromCatalog(id: string): Promise<Skill | null> {
  try {
    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    const { data, error } = await supabase
      .from('skills_catalog')
      .select('id, nombre, descripcion, categoria')
      .eq('id', id)
      .single()

    if (error || !data) return null

    return {
      id: data.id,
      creator: 'spainmcp',
      nombre: data.nombre,
      descripcion: data.descripcion ?? '',
      categoria: data.categoria ?? 'general',
      installs: 0,
      stars: 0,
      verified: true,
    }
  } catch {
    return null
  }
}

export default async function SkillDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params

  const skill = getSkillById(slug) ?? await getSkillFromCatalog(slug)
  if (!skill) notFound()

  return <SkillDetailClient skill={skill} />
}
