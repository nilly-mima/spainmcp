'use client'

import { useState, Children } from 'react'

const LIMIT = 10

export default function CuradosGrid({ children }: { children: React.ReactNode }) {
  const [expanded, setExpanded] = useState(false)
  const all = Children.toArray(children)
  const visible = expanded ? all : all.slice(0, LIMIT)
  const hasMore = all.length > LIMIT

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {visible}
      </div>
      {hasMore && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-sm text-stone-400 hover:text-orange-600 transition-colors text-center py-2 rounded-lg"
          style={{ border: '1px solid #E8E2D9', background: '#FAFAF9' }}
        >
          {expanded ? '↑ Ver menos' : `↓ Ver ${all.length - LIMIT} más`}
        </button>
      )}
    </div>
  )
}
