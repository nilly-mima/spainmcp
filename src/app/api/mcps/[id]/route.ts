import { NextResponse } from 'next/server'
import { getMcpById } from '@/lib/mcps'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const mcp = getMcpById(id)
  if (!mcp) {
    return NextResponse.json({ error: 'MCP no encontrado' }, { status: 404 })
  }
  return NextResponse.json(mcp)
}
