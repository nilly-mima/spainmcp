'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, usePathname } from 'next/navigation'

interface Props {
  stars: number
  namespaces: string[]
}

function NsAvatar({ name }: { name: string }) {
  const colors = ['#2563EB','#2563EB','#16A34A','#9333EA','#0284C7','#DC2626']
  const bg = colors[name.charCodeAt(0) % colors.length]
  return (
    <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0" style={{ background: bg }}>
      {name[0].toUpperCase()}
    </div>
  )
}

export default function HeaderSearch({ stars, namespaces }: Props) {
  const router   = useRouter()
  const pathname = usePathname()
  const inputRef = useRef<HTMLInputElement>(null)
  const [value, setValue]         = useState('')
  const [showDrop, setShowDrop]   = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Escucha evento del sidebar (Namespace button)
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<string>).detail
      setValue(detail)
      setShowDrop(true)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
    window.addEventListener('header-search-set', handler)
    return () => window.removeEventListener('header-search-set', handler)
  }, [])

  // Cierra dropdown al hacer click fuera
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (!target.closest('[data-header-search]')) setShowDrop(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Limpia input al salir de páginas de búsqueda
  useEffect(() => {
    if (!pathname.startsWith('/mcps') && !pathname.startsWith('/guias')) {
      setValue('')
      setShowDrop(false)
    }
  }, [pathname])

  const onMcps  = pathname.startsWith('/mcps')
  const onGuias = pathname.startsWith('/guias')
  const onHome  = pathname === '/'

  const isNamespace = value.startsWith('namespace:')
  const nsQuery     = isNamespace ? value.slice('namespace:'.length).toLowerCase() : ''
  const filteredNs  = namespaces.filter(n =>
    !nsQuery || n.toLowerCase().includes(nsQuery)
  )

  const handleChange = (v: string) => {
    setValue(v)
    setShowDrop(v.startsWith('namespace:'))
    if (debounceRef.current) clearTimeout(debounceRef.current)
    const base = onGuias ? '/guias' : '/mcps'
    debounceRef.current = setTimeout(() => {
      const params = v.trim() ? `?q=${encodeURIComponent(v.trim())}` : ''
      router.push(`${base}${params}`)
    }, 300)
  }

  const selectNamespace = (ns: string) => {
    const val = `namespace:${ns}`
    setValue(val)
    setShowDrop(false)
    router.push(`/mcps?q=${encodeURIComponent(val)}`)
  }

  const handleClear = () => {
    setValue('')
    setShowDrop(false)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    router.push(onGuias ? '/guias' : '/mcps')
  }

  // Home → GitHub badge
  if (onHome) {
    return (
      <div className="flex-1 flex justify-start">
        <a
          href="https://github.com/nilly-mima/spainmcp"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-xs text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-200 transition-colors px-2.5 py-1.5 rounded-lg hover:bg-stone-200/60 dark:hover:bg-stone-800/60"
          style={{ border: '1px solid var(--border)' }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
          </svg>
          {stars > 0 ? `${stars}` : '—'}
        </a>
      </div>
    )
  }

  // MCPs o Skills → buscador
  if (onMcps || onGuias) {
    const placeholder = onGuias ? 'Buscar skills...' : 'Buscar MCPs...'
    return (
      <div className="relative flex-1 max-w-xl mx-4" data-header-search>
        <svg
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none"
          width="15" height="15" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
        </svg>
        <input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={e => handleChange(e.target.value)}
          onFocus={() => { if (isNamespace) setShowDrop(true) }}
          className="w-full pl-10 pr-8 py-2 rounded-xl text-sm text-stone-700 dark:text-stone-200 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
          style={{ background: '#FFFFFF', border: '1px solid var(--border)' }}
        />
        {value && (
          <button onClick={handleClear} className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 transition text-xs">
            ✕
          </button>
        )}

        {/* Dropdown namespaces */}
        {showDrop && filteredNs.length > 0 && (
          <div
            className="absolute top-full mt-2 left-0 right-0 bg-white dark:bg-stone-900 rounded-xl shadow-lg z-50 py-2 overflow-hidden"
            style={{ border: '1px solid var(--border)' }}
          >
            <p className="text-xs font-semibold text-stone-400 uppercase tracking-widest px-4 pb-2 pt-1">
              Namespaces
            </p>
            {filteredNs.map(ns => (
              <button
                key={ns}
                onMouseDown={e => { e.preventDefault(); selectNamespace(ns) }}
                className="flex items-center gap-3 w-full px-4 py-2.5 hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors text-left"
              >
                <NsAvatar name={ns} />
                <span className="text-sm text-stone-700 dark:text-stone-200">{ns}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    )
  }

  return <div className="flex-1" />
}
