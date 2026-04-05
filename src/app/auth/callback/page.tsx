'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabaseBrowser } from '@/lib/supabase-client'

export default function AuthCallback() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const code = searchParams.get('code')
    const next = searchParams.get('next') ?? '/'

    if (code) {
      // OAuth code flow (Google, GitHub)
      supabaseBrowser.auth
        .exchangeCodeForSession(code)
        .then(() => router.replace(next))
        .catch(() => router.replace('/login'))
    } else {
      // Magic link — sesión extraída automáticamente del hash por supabase-js
      supabaseBrowser.auth.getSession().then(() => router.replace(next))
    }
  }, [router, searchParams])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-[var(--muted)] text-sm">Iniciando sesión...</p>
    </div>
  )
}
