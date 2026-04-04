import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import ThemeProvider from '@/components/ThemeProvider'

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
      <body className={inter.className} suppressHydrationWarning>
        <ThemeProvider>
          <Header />
          <main className="max-w-6xl mx-auto px-6 pt-2 pb-8">
            {children}
          </main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  )
}
