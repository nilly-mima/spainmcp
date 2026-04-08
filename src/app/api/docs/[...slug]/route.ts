import { NextRequest, NextResponse } from 'next/server'
import { getDoc } from '@/data/docs'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string[] }> }
) {
  const { slug } = await params
  // Strip .md extension from last segment if present
  const normalised = [...slug]
  normalised[normalised.length - 1] = normalised[normalised.length - 1].replace(/\.md$/, '')
  const content = getDoc(normalised)
  if (!content) {
    return new NextResponse('# 404\n\nDocumentación no encontrada.', {
      status: 404,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    })
  }
  return new NextResponse(content, {
    status: 200,
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  })
}
