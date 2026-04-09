import { getStripe } from './stripe'
import { createClient } from '@supabase/supabase-js'

function getServiceClient() {
  return createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
}

// Report RPC usage to Stripe Billing Meter Events API (Stripe SDK v17+, available in v22).
// Always fire-and-forget — never block the RPC response.
export async function reportRpcUsage(stripeCustomerId: string, quantity: number = 1): Promise<void> {
  try {
    const stripe = getStripe()
    await stripe.billing.meterEvents.create({
      event_name: 'mcp_rpcs',
      payload: {
        stripe_customer_id: stripeCustomerId,
        value: String(quantity),
      },
    })
  } catch (err) {
    console.error('Stripe metering error (non-blocking):', err)
  }
}

// Resolve the Stripe customer ID for a given API key email.
// Returns null if the user has no Stripe customer (free tier).
export async function resolveStripeCustomerId(email: string): Promise<string | null> {
  const supabase = getServiceClient()
  const { data } = await supabase
    .from('api_keys')
    .select('stripe_customer_id')
    .eq('email', email)
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  return data?.stripe_customer_id ?? null
}
