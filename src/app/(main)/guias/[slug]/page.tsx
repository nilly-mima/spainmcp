import { notFound } from 'next/navigation'
import { getSkillById } from '@/lib/skills'
import SkillDetailClient from './SkillDetailClient'

export default async function SkillDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const skill = getSkillById(slug)
  if (!skill) notFound()
  return <SkillDetailClient skill={skill} />
}
