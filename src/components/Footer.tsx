'use client'
import Link from 'next/link'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

function SunIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="4"/>
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>
    </svg>
  )
}

function MonitorIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="20" height="14" rx="2"/>
      <path d="M8 21h8M12 17v4"/>
    </svg>
  )
}

function MoonIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
    </svg>
  )
}

function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])
  if (!mounted) return <div className="w-[100px] h-8" />

  const btn = (mode: string, label: string, Icon: React.FC) =>
    <button
      key={mode}
      onClick={() => setTheme(mode)}
      title={label}
      className={`p-1.5 rounded-md transition-colors cursor-pointer ${
        theme === mode
          ? 'bg-white dark:bg-stone-700 text-stone-800 dark:text-stone-100 shadow-sm'
          : 'text-stone-400 dark:text-stone-500 hover:text-stone-700 dark:hover:text-stone-300 hover:bg-stone-200/70 dark:hover:bg-stone-700/50'
      }`}
    >
      <Icon />
    </button>

  return (
    <div className="flex items-center gap-0.5 rounded-lg p-1 bg-stone-100 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700">
      {btn('light', 'Modo claro', SunIcon)}
      {btn('system', 'Sistema', MonitorIcon)}
      {btn('dark', 'Modo oscuro', MoonIcon)}
    </div>
  )
}

const LINKS = {
  recursos: [
    { label: 'MCPs',    href: '/mcps'   },
    { label: 'Guías',   href: '/guias'  },
    { label: 'Docs',    href: '/docs'   },
    { label: 'Estado',  href: '/status' },
  ],
  empresa: [
    { label: 'Precios',    href: '/precios'  },
    { label: 'Acerca de', href: '/about'    },
    { label: 'Blog',       href: '/blog'     },
  ],
}

export default function Footer() {
  return (
    <footer className="mt-16 bg-[var(--background)] border-t border-[var(--border)]">
      <div className="max-w-6xl mx-auto px-6 py-12">

        {/* Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10">

          {/* Brand */}
          <div className="col-span-2 md:col-span-1 flex flex-col gap-3">
            <Link href="/" className="flex items-center gap-2 font-bold text-stone-900 dark:text-stone-100 hover:text-orange-600 dark:hover:text-orange-500 transition-colors w-fit">
              <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                <rect x="1"  y="1"  width="8" height="8" rx="2" fill="#EA580C"/>
                <rect x="11" y="1"  width="8" height="8" rx="2" fill="#EA580C"/>
                <rect x="1"  y="11" width="8" height="8" rx="2" fill="#EA580C"/>
                <rect x="11" y="11" width="8" height="8" rx="2" fill="#EA580C"/>
              </svg>
              SpainMCP
            </Link>
            <p className="text-sm text-stone-400 dark:text-stone-500 leading-relaxed">
              El directorio MCP<br />en español
            </p>
          </div>

          {/* Recursos */}
          <div>
            <h3 className="text-sm font-semibold text-stone-700 dark:text-stone-300 mb-4">Recursos</h3>
            <ul className="flex flex-col gap-2.5">
              {LINKS.recursos.map(({ label, href }) => (
                <li key={href}>
                  <Link href={href} className="text-sm text-stone-400 dark:text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Empresa */}
          <div>
            <h3 className="text-sm font-semibold text-stone-700 dark:text-stone-300 mb-4">Empresa</h3>
            <ul className="flex flex-col gap-2.5">
              {LINKS.empresa.map(({ label, href }) => (
                <li key={href}>
                  <Link href={href} className="text-sm text-stone-400 dark:text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Conectar */}
          <div>
            <h3 className="text-sm font-semibold text-stone-700 dark:text-stone-300 mb-4">Conectar</h3>
            <div className="flex items-center gap-3">

              {/* X / Twitter */}
              <a href="https://x.com/spainmcp" target="_blank" rel="noopener noreferrer"
                className="text-stone-400 dark:text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 transition-colors"
                title="X (Twitter)">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>

              {/* GitHub */}
              <a href="https://github.com/nilly-mima/spainmcp" target="_blank" rel="noopener noreferrer"
                className="text-stone-400 dark:text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 transition-colors"
                title="GitHub">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
              </a>

              {/* Discord */}
              <a href="https://discord.gg/spainmcp" target="_blank" rel="noopener noreferrer"
                className="text-stone-400 dark:text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 transition-colors"
                title="Discord">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057c.002.022.015.04.032.052a19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
                </svg>
              </a>

            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 pt-6 border-t border-[var(--border)] flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-stone-400 dark:text-stone-500">
            © 2026 SpainMCP. Todos los derechos reservados.
          </p>
          <ThemeToggle />
        </div>

      </div>
    </footer>
  )
}
