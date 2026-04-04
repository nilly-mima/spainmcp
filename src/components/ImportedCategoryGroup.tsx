'use client'

import { useState } from 'react'
import { ImportedMcp } from '@/lib/mcps'
import ImportedMcpCard from './ImportedMcpCard'

const LIMIT = 8

export default function ImportedCategoryGroup({
  label,
  mcps,
}: {
  label: string
  mcps: ImportedMcp[]
}) {
  const [expanded, setExpanded] = useState(false)
  const visible = expanded ? mcps : mcps.slice(0, LIMIT)

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
          {label}
        </span>
        <span className="text-xs text-stone-300">{mcps.length}</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {visible.map(mcp => (
          <ImportedMcpCard key={mcp.id + mcp.github_url} mcp={mcp} />
        ))}
      </div>
      {mcps.length > LIMIT && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-sm text-stone-400 hover:text-orange-600 transition-colors text-center py-2 rounded-lg"
          style={{ border: '1px solid #E8E2D9', background: '#FAFAF9' }}
        >
          {expanded ? '↑ Ver menos' : `↓ Ver ${mcps.length - LIMIT} más`}
        </button>
      )}
    </div>
  )
}
