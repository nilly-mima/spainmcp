'use client'

import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import { supabaseBrowser } from '@/lib/supabase-client'

type User = { email?: string } | null

export default function UserMenu() {
  const [user, setUser] = useState<User | undefined>(undefined)
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    supabaseBrowser.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null)
    })
    const { data: { subscription } } = supabaseBrowser.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  // Loading — placeholder para evitar layout shift
  if (user === undefined) {
    return <div className="w-8 h-8 rounded-full bg-stone-200 dark:bg-stone-700 animate-pulse" />
  }

  // No autenticado
  if (user === null) {
    return (
      <Link
        href="/login"
        className="px-3 py-1.5 rounded-md text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-200/50 dark:hover:bg-stone-800/50 transition-colors"
      >
        Entrar
      </Link>
    )
  }

  const initial = (user.email ?? '?')[0].toUpperCase()

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(v => !v)}
        className="w-8 h-8 rounded-full bg-orange-600 hover:bg-orange-700 text-white text-sm font-bold flex items-center justify-center transition-colors"
        title={user.email}
      >
        {initial}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-52 bg-[var(--card)] border border-[var(--border)] rounded-xl shadow-lg py-1 z-50">
          <div className="px-3 py-2 border-b border-[var(--border)]">
            <p className="text-xs text-[var(--muted)] truncate">{user.email}</p>
          </div>

          <Link
            href="/account/my-servers"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 px-3 py-2 text-sm text-[var(--foreground)] hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/>
            </svg>
            Mis Servidores
          </Link>

          <Link
            href="/account/api-keys"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 px-3 py-2 text-sm text-[var(--foreground)] hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/>
            </svg>
            Mis API Keys
          </Link>

          <div className="border-t border-[var(--border)] mt-1 pt-1">
            <button
              onClick={async () => {
                await supabaseBrowser.auth.signOut()
                setOpen(false)
              }}
              className="flex items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors w-full text-left"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
              Cerrar sesión
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
