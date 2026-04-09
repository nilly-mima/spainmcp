import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function getServiceClient() {
  return createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  if (!slug || typeof slug !== 'string') {
    return NextResponse.json({ error: 'slug requerido' }, { status: 400 })
  }

  const supabase = getServiceClient()
  const { data, error } = await supabase
    .from('skills_catalog')
    .select('id, nombre, slug, descripcion, categoria, content, icon_url, installs, stars, author, is_active, created_at')
    .eq('slug', slug)
    .eq('is_active', true)
    .single()

  if (error || !data) {
    return NextResponse.json({ error: 'Skill no encontrada' }, { status: 404 })
  }

  return NextResponse.json({ skill: data })
}

// Increment installs on download
export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  if (!slug) return NextResponse.json({ error: 'slug requerido' }, { status: 400 })

  const supabase = getServiceClient()

  // Fetch current installs then increment
  const { data: current } = await supabase
    .from('skills_catalog')
    .select('id, installs')
    .eq('slug', slug)
    .single()

  if (current) {
    await supabase
      .from('skills_catalog')
      .update({ installs: (current.installs ?? 0) + 1 })
      .eq('id', current.id)
  }

  return NextResponse.json({ success: true })
}
