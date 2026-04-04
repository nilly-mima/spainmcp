import { NextResponse } from 'next/server'
import { getAllMcps } from '@/lib/mcps'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const categoria = searchParams.get('categoria')
  const destacados = searchParams.get('destacados')

  let mcps = getAllMcps()

  if (categoria) {
    mcps = mcps.filter(m => m.categoria.includes(categoria))
  }
  if (destacados === 'true') {
    mcps = mcps.filter(m => m.destacado)
  }

  return NextResponse.json({ mcps, total: mcps.length })
}
