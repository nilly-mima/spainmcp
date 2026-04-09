import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getStripe } from '@/lib/stripe'
import type Stripe from 'stripe'

// Next.js App Router: disable body parsing so we can verify Stripe signature
export const config = { api: { bodyParser: false } }

function getServiceClient() {
  return createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
}

async function setTier(email: string, tier: 'free' | 'pro') {
  const supabase = getServiceClient()
  await supabase
    .from('api_keys')
    .update({ tier })
    .eq('email', email)
    .eq('is_active', true)
}

async function emailFromCustomer(customerId: string): Promise<string | null> {
  try {
    const customer = await getStripe().customers.retrieve(customerId)
    if (customer.deleted) return null
    return (customer as Stripe.Customer).email ?? null
  } catch {
    return null
  }
}

export async function POST(req: NextRequest) {
  const rawBody = await req.arrayBuffer()
  const sig = req.headers.get('stripe-signature')

  if (!sig) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
  }

  let event: Stripe.Event
  try {
    event = getStripe().webhooks.constructEvent(
      Buffer.from(rawBody),
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    return NextResponse.json({ error: `Webhook error: ${String(err)}` }, { status: 400 })
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      const email =
        session.metadata?.email ??
        session.customer_email ??
        (session.customer ? await emailFromCustomer(session.customer as string) : null)

      if (email) {
        await setTier(email, 'pro')
      }
      break
    }

    case 'customer.subscription.deleted': {
      const sub = event.data.object as Stripe.Subscription
      const email = sub.metadata?.email ?? await emailFromCustomer(sub.customer as string)
      if (email) await setTier(email, 'free')
      break
    }

    case 'customer.subscription.updated': {
      const sub = event.data.object as Stripe.Subscription
      const status = sub.status
      const email = sub.metadata?.email ?? await emailFromCustomer(sub.customer as string)
      if (email) {
        const tier = status === 'active' || status === 'trialing' ? 'pro' : 'free'
        await setTier(email, tier)
      }
      break
    }

    case 'invoice.payment_failed': {
      // Leave on pro for grace period — Stripe will retry and eventually cancel subscription
      break
    }

    default:
      // Ignore unhandled event types
      break
  }

  return NextResponse.json({ received: true })
}
