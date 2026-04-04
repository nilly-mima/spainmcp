'use client'

import { useState } from 'react'

export default function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  const [flying, setFlying] = useState(false)

  const copy = () => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setFlying(true)
    setTimeout(() => setCopied(false), 2000)
    setTimeout(() => setFlying(false), 450)
  }

  return (
    <button
      onClick={copy}
      title={copied ? 'Copiado' : 'Copiar'}
      className="relative text-stone-300 hover:text-stone-500 transition-colors"
    >
      {flying && (
        <span className="animate-fly-up absolute left-1/2 top-0 -translate-x-1/2 text-orange-500 font-mono text-xs font-bold pointer-events-none select-none">
          $
        </span>
      )}
      {copied ? (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-orange-500">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      ) : (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="9" y="9" width="13" height="13" rx="2" />
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
        </svg>
      )}
    </button>
  )
}
