import { notFound } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import SkillDetailClient from './SkillDetailClient'

export interface SkillFull {
  id: string
  nombre: string
  slug: string
  descripcion: string
  categoria: string
  content: string | null
  icon_url: string | null
  installs: number
  stars: number
  author: string | null
  is_active: boolean
  created_at: string
}

async function getSkill(slug: string): Promise<SkillFull | null> {
  try {
    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    const { data, error } = await supabase
      .from('skills_catalog')
      .select('id, nombre, slug, descripcion, categoria, content, icon_url, installs, stars, author, is_active, created_at')
      .eq('slug', slug)
      .eq('is_active', true)
      .single()

    if (error || !data) return null
    return data as SkillFull
  } catch {
    return null
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const skill = await getSkill(slug)
  if (!skill) return { title: 'Skill no encontrada — SpainMCP' }
  return {
    title: `${skill.nombre} — SpainMCP Skills`,
    description: skill.descripcion,
  }
}

export default async function SkillDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const skill = await getSkill(slug)
  if (!skill) notFound()

  return <SkillDetailClient skill={skill} />
}
