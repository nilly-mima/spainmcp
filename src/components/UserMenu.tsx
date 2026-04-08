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
  const username = user.email?.split('@')[0] ?? 'user'
  const linkClass = "flex items-center gap-2.5 px-3 py-2 text-sm text-[var(--foreground)] hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(v => !v)}
        className="w-8 h-8 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold flex items-center justify-center transition-colors"
        title={user.email}
      >
        {initial}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-56 bg-[var(--card)] border border-[var(--border)] rounded-xl shadow-lg py-1 z-50">
          {/* User info */}
          <div className="px-3 py-2.5 border-b border-[var(--border)]">
            <p className="text-sm font-semibold text-[var(--foreground)]">@{username}</p>
            <p className="text-xs text-[var(--muted)] truncate">{user.email}</p>
          </div>

          {/* Menu items */}
          <div className="py-1">
            <Link href="/account/api-keys" onClick={() => setOpen(false)} className={linkClass}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/>
              </svg>
              API Keys
            </Link>
            <Link href="/mcps?q=owner%3Ame" onClick={() => setOpen(false)} className={linkClass}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 7h16M4 12h16M4 17h10"/><circle cx="20" cy="17" r="2"/>
              </svg>
              My Servers
            </Link>
            <Link href="/guias?q=owner%3Ame" onClick={() => setOpen(false)} className={linkClass}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/>
              </svg>
              My Skills
            </Link>
            <Link href="/account/connections" onClick={() => setOpen(false)} className={linkClass}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/>
              </svg>
              My Connections
            </Link>
            <Link href="/account/gateway" onClick={() => setOpen(false)} className={linkClass}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="3"/><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/>
              </svg>
              Mi Gateway
            </Link>
            <Link href="/account/billing" onClick={() => setOpen(false)} className={linkClass}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/>
              </svg>
              Billing
            </Link>
          </div>

          {/* Sign out */}
          <div className="border-t border-[var(--border)] pt-1">
            <button
              onClick={async () => {
                await supabaseBrowser.auth.signOut()
                setOpen(false)
              }}
              className="flex items-center gap-2.5 px-3 py-2 text-sm text-red-500 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors w-full text-left"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
