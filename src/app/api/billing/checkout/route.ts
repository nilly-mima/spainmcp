import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getStripe } from '@/lib/stripe'

function getServiceClient() {
  return createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null)
    if (!body || body.plan !== 'pro') {
      return NextResponse.json({ error: 'plan inválido' }, { status: 400 })
    }

    const supabase = getServiceClient()
    const accessToken = req.headers.get('Authorization')?.replace('Bearer ', '').trim()
    if (!accessToken) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    const { data: userData, error: userError } = await supabase.auth.getUser(accessToken)
    if (userError || !userData.user?.email) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    const email = userData.user.email
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://spainmcp-fngo.vercel.app'
    const stripe = getStripe()

    // Reuse existing Stripe customer if one exists
    let customerId: string | undefined
    const { data: keyData } = await supabase
      .from('api_keys')
      .select('stripe_customer_id')
      .eq('email', email)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    customerId = keyData?.stripe_customer_id ?? undefined

    if (!customerId) {
      const customer = await stripe.customers.create({ email, metadata: { spainmcp_email: email } })
      customerId = customer.id

      await supabase
        .from('api_keys')
        .update({ stripe_customer_id: customerId })
        .eq('email', email)
        .eq('is_active', true)
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      line_items: [{ price: process.env.STRIPE_PRO_PRICE_ID!, quantity: 1 }],
      success_url: `${baseUrl}/account/billing?success=true`,
      cancel_url: `${baseUrl}/account/billing?canceled=true`,
      metadata: { email },
      subscription_data: { metadata: { email } },
    })

    return NextResponse.json({ url: session.url })
  } catch (err) {
    console.error('Stripe checkout error:', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
