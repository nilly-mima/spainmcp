import SkillsDirectory from '@/components/SkillsDirectory'

export const metadata = {
  title: 'Skills — SpainMCP',
  description: 'Directorio de skills para Claude en español. Encuentra y conecta skills de Anthropic, GitHub y la comunidad.',
}

export default async function SkillsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>
}) {
  const { q, page } = await searchParams
  const initialPage = Math.max(1, parseInt(page ?? '1', 10) || 1)

  return (
    <div className="flex flex-col gap-6">
      <SkillsDirectory
        key={(q ?? '') + '|' + initialPage}
        initialSearch={q ?? ''}
        initialPage={initialPage}
      />
    </div>
  )
}
