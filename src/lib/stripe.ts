// Required env vars:
//   STRIPE_SECRET_KEY            — Stripe secret key (sk_live_... / sk_test_...)
//   STRIPE_WEBHOOK_SECRET        — Webhook signing secret (whsec_...)
//   STRIPE_PRO_PRICE_ID          — Price ID for Pro plan (price_...)
//   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY — Only needed if client-side Stripe.js is used

import Stripe from 'stripe'

let _stripe: Stripe | null = null

export function getStripe(): Stripe {
  if (!_stripe) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY not configured')
    }
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
  }
  return _stripe
}
