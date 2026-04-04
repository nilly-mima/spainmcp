'use client'

import { useState } from 'react'
import { ImportedMcp } from '@/lib/mcps'
import ImportedMcpRow from './ImportedMcpRow'

const LIMIT = 5

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
      <div
        className="bg-white rounded-xl divide-y"
        style={{ border: '1px solid #E8E2D9' }}
      >
        {visible.map(mcp => (
          <ImportedMcpRow key={mcp.id + mcp.github_url} mcp={mcp} />
        ))}
      </div>
      {mcps.length > LIMIT && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-xs text-stone-400 hover:text-orange-600 transition-colors text-left pl-2 py-1"
        >
          {expanded
            ? '↑ Ver menos'
            : `↓ Ver ${mcps.length - LIMIT} más`}
        </button>
      )}
    </div>
  )
}
