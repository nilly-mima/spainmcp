'use client'

import { useCallback } from 'react'
import { supabaseBrowser } from '@/lib/supabase-client'

export function useAdminFetch() {
  const adminFetch = useCallback(async (url: string, options: RequestInit = {}) => {
    const { data } = await supabaseBrowser.auth.getSession()
    const email = data.session?.user?.email ?? ''
    return fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'x-admin-email': email,
        ...(options.headers ?? {}),
      },
    })
  }, [])

  return { adminFetch }
}
