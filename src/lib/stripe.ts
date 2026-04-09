// Required env vars:
//   STRIPE_SECRET_KEY            — Stripe secret key (sk_live_... / sk_test_...)
//   STRIPE_WEBHOOK_SECRET        — Webhook signing secret (whsec_...)
//   STRIPE_PRO_PRICE_ID          — Price ID for Pro plan (price_...)
//   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY — Only needed if client-side Stripe.js is used

import Stripe from 'stripe'

let _stripe: Stripe | null = null

export function getStripe(): Stripe {
  if (!_stripe) {
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? '')
  }
  return _stripe
}

// Re-export as lazy singleton — import { stripe } from '@/lib/stripe' then use stripe.xxx
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const stripe: Stripe = new Proxy({} as any, {
  get(_, prop) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (getStripe() as any)[prop]
  },
})
