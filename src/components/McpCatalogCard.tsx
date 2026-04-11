'use client'

import { useState } from 'react'

export interface CatalogMcp {
  id: string
  nombre: string
  slug: string
  descripcion_es: string
  descripcion_en: string
  scope: string
  icon_url: string
  upstream_url: string
  downloads: number
  is_active: boolean
  created_at: string
  categoria?: string
  verified?: boolean
  author?: string | null
}

const PALETTES = [
  'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300',
  'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300',
  'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300',
  'bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300',
  'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-300',
  'bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300',
  'bg-sky-100 dark:bg-sky-900/40 text-sky-700 dark:text-sky-300',
]

function fmtDownloads(n: number): string {
  if (n >= 1000) return (n / 1000).toFixed(1) + 'k'
  return String(n)
}

function GlobeIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10"/>
      <line x1="2" y1="12" x2="22" y2="12"/>
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
    </svg>
  )
}

function DownloadIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
      <polyline points="17 6 23 6 23 12"/>
    </svg>
  )
}

function VerifiedBadge() {
  return (
    <span title="Verificado" className="inline-flex shrink-0 text-blue-500">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2l2.39 2.32 3.32-.54.94 3.23 3.05 1.47-1.43 3.04 1.43 3.04-3.05 1.47-.94 3.23-3.32-.54L12 22l-2.39-2.32-3.32.54-.94-3.23-3.05-1.47 1.43-3.04-1.43-3.04 3.05-1.47.94-3.23 3.32.54L12 2z"/>
        <polyline points="8.5 12.5 11 15 16 9" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </span>
  )
}

function InstallButton({ slug }: { slug: string }) {
  const [copied, setCopied] = useState(false)

  function handleInstall(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    const installUrl = `/open?server=${encodeURIComponent(slug)}&client=claude`
    navigator.clipboard.writeText(`${window.location.origin}${installUrl}`).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
    window.open(installUrl, '_blank', 'noopener')
  }

  return (
    <button
      onClick={handleInstall}
      title="Instalacion rapida"
      className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border transition-colors font-medium ${
        copied
          ? 'text-green-600 dark:text-green-400 border-green-300 dark:border-green-600 bg-green-50 dark:bg-green-900/20'
          : 'text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40'
      }`}
    >
      {copied ? (
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
      ) : (
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
      )}
      {copied ? 'OK' : 'Instalar'}
    </button>
  )
}

export default function McpCatalogCard({ mcp }: { mcp: CatalogMcp }) {
  const isRemote = mcp.scope === 'remote' || mcp.scope === 'remoto'
  const initials = mcp.nombre.split(/[\s\-_]/).map(w => w[0]).join('').slice(0, 2).toUpperCase()
  const palette = PALETTES[mcp.nombre.charCodeAt(0) % PALETTES.length]
  const [iconBroken, setIconBroken] = useState(false)

  return (
    <a
      href={`/mcps/${mcp.slug}`}
      className="group block h-full"
    >
      <div className="bg-transparent rounded-xl p-3 h-full flex flex-col gap-2 transition-colors hover:bg-gray-50 dark:hover:bg-white/5 cursor-pointer border border-gray-200 dark:border-gray-700/50">
        <div className="flex items-start gap-3">
          {mcp.icon_url && !iconBroken ? (
            <img
              src={mcp.icon_url}
              alt=""
              className="w-9 h-9 rounded-lg object-contain shrink-0"
              onError={() => setIconBroken(true)}
            />
          ) : (
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${palette}`}>
              {initials}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-blue-600 dark:text-white text-sm leading-tight truncate group-hover:underline">
              {mcp.nombre}
            </h3>
            <p className="text-xs text-stone-400 dark:text-stone-500 truncate mt-0.5 flex items-center gap-1">
              <span className="truncate">{mcp.author ? `${mcp.author}/${mcp.slug}` : mcp.slug}</span>
              {mcp.verified && <VerifiedBadge />}
            </p>
          </div>
        </div>

        <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed flex-1 line-clamp-2">
          {mcp.descripcion_es || mcp.descripcion_en}
        </p>

        <div className="flex items-center justify-between pt-1.5" style={{ borderTop: '1px solid var(--border)' }}>
          <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full text-stone-500 font-medium bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <GlobeIcon />
            {isRemote ? 'Remoto' : 'Local'}
          </span>
          <div className="flex items-center gap-2">
            <InstallButton slug={mcp.slug} />
            {mcp.downloads > 0 && (
              <span className="text-xs text-stone-400 flex items-center gap-1">
                <DownloadIcon />
                {fmtDownloads(mcp.downloads)}
              </span>
            )}
          </div>
        </div>
      </div>
    </a>
  )
}
