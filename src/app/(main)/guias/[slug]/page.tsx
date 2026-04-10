import { redirect } from 'next/navigation'

/**
 * Legacy ruta `/guias/[slug]` — redirige a `/skills/[slug]` que es la detail
 * page moderna conectada a `skills_catalog` en Supabase con file tree, content
 * completo, etc. Mantiene compatibilidad con enlaces externos antiguos.
 */
export default async function GuiasSlugRedirect({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  redirect(`/skills/${slug}`)
}
