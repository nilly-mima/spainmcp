'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'

type Item = {
  nombre: string
  descripcion_en: string
  scope: string
  icon_url?: string
  slug?: string
  downloads?: string
}

const COLORS = [
  { bg: 'bg-blue-50 dark:bg-blue-950/30', text: 'text-blue-600' },
  { bg: 'bg-green-50 dark:bg-green-950/30', text: 'text-green-600' },
  { bg: 'bg-purple-50 dark:bg-purple-950/30', text: 'text-purple-600' },
  { bg: 'bg-amber-50 dark:bg-amber-950/30', text: 'text-amber-600' },
  { bg: 'bg-rose-50 dark:bg-rose-950/30', text: 'text-rose-600' },
  { bg: 'bg-teal-50 dark:bg-teal-950/30', text: 'text-teal-600' },
  { bg: 'bg-indigo-50 dark:bg-indigo-950/30', text: 'text-indigo-600' },
  { bg: 'bg-cyan-50 dark:bg-cyan-950/30', text: 'text-cyan-600' },
]

function hashCode(s: string) {
  let h = 0
  for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0
  return Math.abs(h)
}

function Card({ item }: { item: Item }) {
  const initials = item.nombre.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
  const color = COLORS[item.nombre.charCodeAt(0) % COLORS.length]
  const displaySlug = item.slug ?? item.nombre.toLowerCase().replace(/\s+/g, '-')
  const displayDownloads = item.downloads ?? `${((hashCode(item.nombre) % 50) + 1).toFixed(1)}k`

  return (
    <div className="w-[270px] bg-white dark:bg-gray-900 rounded-md p-3.5 flex flex-col gap-2 shrink-0 border border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 transition-colors">
      <div className="flex items-center gap-3">
        {item.icon_url ? (
          <img src={item.icon_url} alt="" className="w-9 h-9 rounded-md object-contain shrink-0" />
        ) : (
          <div className={`w-9 h-9 rounded-md flex items-center justify-center text-xs font-bold shrink-0 ${color.bg} ${color.text}`}>
            {initials}
          </div>
        )}
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">{item.nombre}</p>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" className="text-blue-500 shrink-0">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
              <polyline points="9 12 11 14 15 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span className="text-xs text-gray-400 dark:text-gray-500 truncate block">{displaySlug}</span>
        </div>
      </div>
      <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed line-clamp-2">{item.descripcion_en}</p>
      <div className="flex items-center justify-between pt-1 border-t border-gray-100 dark:border-gray-800">
        <span className="text-[10px] text-gray-400 dark:text-gray-500 flex items-center gap-1">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
          {item.scope === 'remote' ? 'Remoto' : 'Local'}
        </span>
        <span className="text-[10px] text-gray-400 dark:text-gray-500 flex items-center gap-1">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
          {displayDownloads}
        </span>
      </div>
    </div>
  )
}

export default function HeroCards({
  row1, row2, row3, total,
}: {
  row1: Item[]
  row2: Item[]
  row3: Item[]
  total: number
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect() } },
      { threshold: 0.05 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const rows = [row1, row2, row3]
  const offsets = ['', '-ml-[148px]', '-ml-[74px]']

  return (
    <div ref={ref} className="relative overflow-hidden">
      {/* Background decorative lines */}
      <svg
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full pointer-events-none"
        viewBox="0 0 1200 380"
        fill="none"
        preserveAspectRatio="xMidYMax slice"
        aria-hidden="true"
      >
        <path d="M600,380 Q520,260 80,180 Q0,140 0,60"    stroke="#2563EB" strokeOpacity="0.11" strokeWidth="1.5"/>
        <path d="M600,380 Q545,240 200,140 Q90,80 20,0"   stroke="#2563EB" strokeOpacity="0.09" strokeWidth="1.5"/>
        <path d="M600,380 Q568,220 360,110 Q290,55 310,0" stroke="#2563EB" strokeOpacity="0.12" strokeWidth="1.5"/>
        <path d="M600,380 Q592,190 510,90 Q488,40 490,0"  stroke="#2563EB" strokeOpacity="0.10" strokeWidth="1.5"/>
        <path d="M600,380 Q600,180 600,80 Q600,30 600,0"  stroke="#2563EB" strokeOpacity="0.14" strokeWidth="2"/>
        <path d="M600,380 Q608,190 690,90 Q712,40 710,0"  stroke="#2563EB" strokeOpacity="0.10" strokeWidth="1.5"/>
        <path d="M600,380 Q632,220 840,110 Q910,55 890,0" stroke="#2563EB" strokeOpacity="0.12" strokeWidth="1.5"/>
        <path d="M600,380 Q655,240 1000,140 Q1110,80 1180,0" stroke="#2563EB" strokeOpacity="0.09" strokeWidth="1.5"/>
        <path d="M600,380 Q680,260 1120,180 Q1200,140 1200,60" stroke="#2563EB" strokeOpacity="0.11" strokeWidth="1.5"/>
      </svg>

      {/* 3 filas con stagger al entrar en viewport */}
      <div
        className="relative flex flex-col gap-3"
        style={{
          maskImage: 'linear-gradient(to right, transparent, black 5%, black 95%, transparent)',
          WebkitMaskImage: 'linear-gradient(to right, transparent, black 5%, black 95%, transparent)',
        }}
      >
        {rows.map((row, rowIdx) => (
          <div
            key={rowIdx}
            className={`flex gap-3 ${offsets[rowIdx]}`}
            style={{
              transition: 'opacity 0.65s ease, transform 0.65s cubic-bezier(0.22, 1, 0.36, 1)',
              transitionDelay: `${rowIdx * 130}ms`,
              opacity: visible ? 1 : 0,
              transform: visible ? 'translateY(0)' : 'translateY(28px)',
            }}
          >
            {row.map((item, i) => <Card key={i} item={item} />)}
          </div>
        ))}
      </div>

      {/* Botones CTA — entran tras las filas */}
      <div
        className="relative flex justify-center gap-3 mt-4"
        style={{
          transition: 'opacity 0.65s ease, transform 0.65s cubic-bezier(0.22, 1, 0.36, 1)',
          transitionDelay: '390ms',
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0)' : 'translateY(16px)',
        }}
      >
        <Link
          href="/mcps"
          className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-semibold text-sm hover:bg-blue-700 transition-colors shadow-sm"
        >
          Ver {total}+ MCPs
        </Link>
        <Link
          href="/publish/mcp"
          className="border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 px-6 py-2.5 rounded-xl font-semibold text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        >
          Publicar MCP
        </Link>
      </div>
    </div>
  )
}
