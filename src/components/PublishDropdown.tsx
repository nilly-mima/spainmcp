'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabaseBrowser } from '@/lib/supabase-client'

export default function PublishDropdown() {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const router = useRouter()

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  async function handlePublishClick(path: string) {
    setOpen(false)
    const { data } = await supabaseBrowser.auth.getSession()
    if (data.session) {
      router.push(path)
    } else {
      router.push(`/login?redirect=${encodeURIComponent(path)}`)
    }
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(v => !v)}
        className="flex items-center gap-1 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 px-3 py-1.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors font-medium text-sm"
      >
        Publicar
        <svg
          width="10" height="10" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2.5"
          className={`transition-transform duration-150 ${open ? 'rotate-180' : ''}`}
        >
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>

      {open && (
        <div
          className="absolute right-0 top-full mt-1.5 w-36 rounded-xl bg-white dark:bg-[var(--card)] shadow-lg z-50 py-1 overflow-hidden"
          style={{ border: '1px solid var(--border)' }}
        >
          <button
            onClick={() => handlePublishClick('/publish/mcp')}
            className="w-full flex items-center px-4 py-2.5 text-sm text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800/60 transition-colors text-left"
          >
            MCP
          </button>
          <button
            onClick={() => handlePublishClick('/publish/skill')}
            className="w-full flex items-center px-4 py-2.5 text-sm text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800/60 transition-colors text-left"
          >
            Skill
          </button>
        </div>
      )}
    </div>
  )
}
