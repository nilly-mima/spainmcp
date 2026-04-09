'use client'

import { useState, useEffect } from 'react'
import { supabaseBrowser } from '@/lib/supabase-client'

export type PlanTier = 'free' | 'pro' | null

const CACHE_KEY = 'spainmcp_plan_cache'
const CACHE_TTL_MS = 5 * 60 * 1000 // 5 minutes

interface CacheEntry {
  tier: PlanTier
  expiresAt: number
}

function readCache(): PlanTier | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    if (!raw) return null
    const entry: CacheEntry = JSON.parse(raw)
    if (Date.now() > entry.expiresAt) {
      localStorage.removeItem(CACHE_KEY)
      return null
    }
    return entry.tier
  } catch {
    return null
  }
}

function writeCache(tier: PlanTier) {
  try {
    const entry: CacheEntry = { tier, expiresAt: Date.now() + CACHE_TTL_MS }
    localStorage.setItem(CACHE_KEY, JSON.stringify(entry))
  } catch {
    // localStorage unavailable — ignore
  }
}

export function usePlan(): { tier: PlanTier; loading: boolean } {
  const [tier, setTier] = useState<PlanTier>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check localStorage cache first for instant render
    const cached = readCache()
    if (cached !== null) {
      setTier(cached)
      setLoading(false)
      return
    }

    // Need user email to call usage API
    supabaseBrowser.auth.getSession().then(async ({ data }) => {
      const email = data.session?.user?.email
      if (!email) {
        setTier(null)
        setLoading(false)
        return
      }

      try {
        const res = await fetch(`/api/account/usage?email=${encodeURIComponent(email)}`)
        if (res.ok) {
          const json = await res.json()
          const resolved: PlanTier = json.tier === 'pro' ? 'pro' : 'free'
          setTier(resolved)
          writeCache(resolved)
        } else {
          setTier('free')
        }
      } catch {
        setTier('free')
      } finally {
        setLoading(false)
      }
    })
  }, [])

  return { tier, loading }
}
