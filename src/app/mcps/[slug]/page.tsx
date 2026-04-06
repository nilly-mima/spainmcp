import { notFound } from 'next/navigation'
import { getMcpById, getAllMcps } from '@/lib/mcps'
import McpDetailClient from './McpDetailClient'

export async function generateStaticParams() {
  return getAllMcps().map(mcp => ({ slug: mcp.id }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const mcp = getMcpById(slug)
  if (!mcp) return {}
  return {
    title: `${mcp.nombre} — SpainMCP`,
    description: mcp.descripcion_corta,
  }
}

export default async function McpPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const mcp = getMcpById(slug)
  if (!mcp) notFound()

  return <McpDetailClient mcp={mcp} />
}
