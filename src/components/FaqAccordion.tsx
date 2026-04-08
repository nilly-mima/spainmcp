'use client'

import { useState } from 'react'
import type { ReactNode } from 'react'

interface FaqItem {
  q: string
  a: ReactNode
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2"
      className={`shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
    >
      <polyline points="6 9 12 15 18 9"/>
    </svg>
  )
}

export default function FaqAccordion({ items }: { items: FaqItem[] }) {
  const [open, setOpen] = useState<number | null>(null)

  return (
    <div className="flex flex-col" style={{ border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden' }}>
      {items.map((item, i) => (
        <div
          key={i}
          className="bg-white dark:bg-[var(--card)]"
          style={i > 0 ? { borderTop: '1px solid var(--border)' } : undefined}
        >
          <button
            onClick={() => setOpen(open === i ? null : i)}
            className="w-full flex items-center justify-between px-6 py-5 text-left hover:bg-stone-50 dark:hover:bg-stone-800/30 transition-colors"
          >
            <span className={`text-sm font-medium ${open === i ? 'text-stone-900 dark:text-stone-100' : 'text-stone-700 dark:text-stone-300'}`}>
              {item.q}
            </span>
            <span className="text-stone-400 dark:text-stone-500 ml-4">
              <ChevronIcon open={open === i} />
            </span>
          </button>

          {open === i && (
            <div className="px-6 pb-5">
              <p className="text-sm text-stone-500 dark:text-stone-400 leading-relaxed">
                {item.a}
              </p>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
