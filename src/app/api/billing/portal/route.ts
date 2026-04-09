import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getStripe } from '@/lib/stripe'

function getServiceClient() {
  return createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
}

export async function POST(req: NextRequest) {
  const accessToken = req.headers.get('Authorization')?.replace('Bearer ', '').trim()
  if (!accessToken) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  }

  const supabase = getServiceClient()
  const { data: userData, error: userError } = await supabase.auth.getUser(accessToken)
  if (userError || !userData.user?.email) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  }

  const email = userData.user.email

  const { data: keyData } = await supabase
    .from('api_keys')
    .select('stripe_customer_id')
    .eq('email', email)
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  const customerId = keyData?.stripe_customer_id
  if (!customerId) {
    return NextResponse.json({ error: 'No hay suscripción activa' }, { status: 404 })
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://spainmcp-fngo.vercel.app'

  const portalSession = await getStripe().billingPortal.sessions.create({
    customer: customerId,
    return_url: `${baseUrl}/account/billing`,
  })

  return NextResponse.json({ url: portalSession.url })
}
