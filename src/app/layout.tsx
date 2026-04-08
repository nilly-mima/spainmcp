import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Script from 'next/script'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'SpainMCP — Directorio de servidores MCP en español',
  description: 'El hub de referencia del ecosistema MCP para España y Latinoamérica. Encuentra, instala y aprende a usar servidores MCP con guías en español.',
  keywords: ['MCP', 'servidor MCP', 'Model Context Protocol', 'Claude', 'español', 'España', 'LATAM'],
  openGraph: {
    title: 'SpainMCP — Directorio MCP en español',
    description: 'El hub de referencia del ecosistema MCP para España y Latinoamérica.',
    locale: 'es_ES',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <Script
          id="theme-init"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `try{var t=localStorage.getItem('theme');var d=t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme:dark)').matches);document.documentElement.classList.toggle('dark',d)}catch(e){}`,
          }}
        />
      </head>
      <body className={inter.className} suppressHydrationWarning>
        {children}
      </body>
    </html>
  )
}
