import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { authenticateRequest } from '@/lib/api-auth'

function getServiceClient() {
  return createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ name: string }> }
) {
  const auth = await authenticateRequest(req)
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { name } = await params

  const supabase = getServiceClient()

  const { data, error: fetchError } = await supabase
    .from('namespaces')
    .select('id, owner_id')
    .eq('name', name)
    .single()

  if (fetchError || !data) {
    return NextResponse.json({ error: 'Namespace not found' }, { status: 404 })
  }

  if (data.owner_id !== auth.userId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { error: deleteError } = await supabase
    .from('namespaces')
    .delete()
    .eq('id', data.id)

  if (deleteError) {
    console.error('Supabase delete error:', deleteError)
    return NextResponse.json({ error: 'Failed to delete namespace' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
