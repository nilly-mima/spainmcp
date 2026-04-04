import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Header from '@/components/Header'

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
    <html lang="es">
      <body className={`${inter.className} bg-gray-50 text-gray-900`}>
        <Header />
        <main className="max-w-6xl mx-auto px-6 py-8">
          {children}
        </main>
        <footer className="mt-16 py-8 text-center text-sm text-stone-400" style={{ borderTop: '1px solid #E8E2D9' }}>
          <p>SpainMCP — El directorio MCP en español · <a href="https://github.com/nilly-mima/spainmcp" className="hover:text-stone-600 transition-colors">GitHub</a></p>
        </footer>
      </body>
    </html>
  )
}
