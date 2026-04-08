import { getAllSkills, getSkillsTotal } from '@/lib/skills'
import SkillsDirectory from '@/components/SkillsDirectory'

export const metadata = {
  title: 'Skills — SpainMCP',
  description: 'Directorio de skills para Claude en español. Encuentra y conecta skills de Anthropic, GitHub y la comunidad.',
}

export default async function SkillsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const { q } = await searchParams
  const skills = getAllSkills()
  const total  = getSkillsTotal()

  return (
    <div className="flex flex-col gap-6">
      <SkillsDirectory key={q ?? ''} skills={skills} total={total} initialSearch={q ?? ''} />
    </div>
  )
}
