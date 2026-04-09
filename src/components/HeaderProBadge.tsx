'use client'

import { usePlan } from '@/hooks/usePlan'

export default function HeaderProBadge() {
  const { tier, loading } = usePlan()
  if (loading || tier !== 'pro') return null
  return (
    <span className="text-xs font-bold px-1.5 py-0.5 rounded-full bg-purple-600 text-white leading-none ml-1">
      Pro
    </span>
  )
}
