import Link from 'next/link'
import McpCard from '@/components/McpCard'
import NetworkAnimation from '@/components/NetworkAnimation'
import FadeIn from '@/components/FadeIn'
import CopyButton from '@/components/CopyButton'
import HeroCards from '@/components/HeroCards'
import HowToConnect from '@/components/HowToConnect'
import McpListPreview from '@/components/McpListPreview'
import PublishSection from '@/components/PublishSection'
import FireUpSection from '@/components/FireUpSection'
import { getAllMcps, getAllCategorias, CATEGORIA_LABELS, getImportedTotal } from '@/lib/mcps'
import { smitheryRow1, smitheryRow2, smitheryRow3 } from '@/data/smithery-featured'

const CAT_META: Record<string, { emoji: string; accent: string; bg: string }> = {
  'archivos':       { emoji: '📁', accent: '#D97706', bg: '#FFFBEB' },
  'automatizacion': { emoji: '⚡', accent: '#CA8A04', bg: '#FEFCE8' },
  'bases-de-datos': { emoji: '🗄️', accent: '#2563EB', bg: '#EFF6FF' },
  'busqueda':       { emoji: '🔍', accent: '#0284C7', bg: '#F0F9FF' },
  'colaboracion':   { emoji: '🤝', accent: '#16A34A', bg: '#F0FDF4' },
  'comunicacion':   { emoji: '💬', accent: '#9333EA', bg: '#FAF5FF' },
  'contenido':      { emoji: '✍️', accent: '#E11D48', bg: '#FFF1F2' },
  'datos':          { emoji: '📊', accent: '#4F46E5', bg: '#EEF2FF' },
  'desarrollo':     { emoji: '💻', accent: '#059669', bg: '#ECFDF5' },
  'documentacion':  { emoji: '📚', accent: '#EA580C', bg: '#FFF7ED' },
  'empresas':       { emoji: '🏢', accent: '#475569', bg: '#F8FAFC' },
  'espana':         { emoji: '🇪🇸', accent: '#DC2626', bg: '#FEF2F2' },
  'gobierno':       { emoji: '🏛️', accent: '#78716C', bg: '#FAFAF9' },
  'informacion':    { emoji: 'ℹ️', accent: '#0891B2', bg: '#ECFEFF' },
  'investigacion':  { emoji: '🔬', accent: '#0D9488', bg: '#F0FDFA' },
  'legal':          { emoji: '⚖️', accent: '#52525B', bg: '#FAFAFA' },
  'productividad':  { emoji: '📈', accent: '#7C3AED', bg: '#F5F3FF' },
  'scraping':       { emoji: '🕷️', accent: '#374151', bg: '#F9FAFB' },
}

export default function Home() {
  const mcps = getAllMcps()
  const destacados = mcps.filter(m => m.destacado)
  const categorias = getAllCategorias()
  const totalImportados = getImportedTotal()

  return (
    <div className="flex flex-col gap-16">

      {/* ── Hero ── */}
      <section className="pt-6 pb-4 flex flex-col lg:flex-row items-center gap-10">
        <div className="flex flex-col gap-7 flex-1 min-w-0 animate-fade-in-up">
          <h1 className="text-[3.375rem] md:text-[4.05rem] lg:text-[5.4rem] font-black text-gray-900 dark:text-white leading-none tracking-tighter">
            La forma más rápida de extender tu IA
          </h1>
          <p className="text-lg text-gray-500 dark:text-gray-400 max-w-sm leading-relaxed">
            El directorio de herramientas MCP para España. Sin código, sin configuración.
            Añade BOE, BORME, AEMET, GitHub y más a tu IA en segundos.
          </p>
          <div className="flex items-center gap-3 flex-wrap">
            <div
              className="flex items-center gap-3 bg-gray-50 dark:bg-gray-900 rounded-xl px-4 py-2.5 text-sm font-mono text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-800"
            >
              <span className="text-gray-400">$</span>
              <span>claude mcp add --transport http spainmcp https://mcp.spainmcp.com</span>
              <CopyButton text="claude mcp add --transport http spainmcp https://mcp.spainmcp.com" />
            </div>
            <Link
              href="/mcps"
              className="bg-blue-600 text-white px-5 py-2.5 rounded-xl hover:bg-blue-700 transition-colors font-medium text-sm shadow-sm hover:shadow-md"
            >
              Ver {mcps.length}+ MCPs →
            </Link>
          </div>
          <div className="flex items-center gap-4 flex-wrap text-sm text-gray-400 dark:text-gray-500">
            <span>22+ endpoints</span>
            <span className="text-gray-200 dark:text-gray-700">|</span>
            <span>5 herramientas españolas</span>
            <span className="text-gray-200 dark:text-gray-700">|</span>
            <span>OAuth automático</span>
            <span className="text-gray-200 dark:text-gray-700">|</span>
            <span>Gratis</span>
          </div>
        </div>

        <div className="hidden lg:block relative w-[640px] h-[520px] shrink-0 -ml-16 -mb-24">
          <NetworkAnimation />
        </div>
      </section>

      {/* ── Hero cards ── */}
      <HeroCards row1={smitheryRow1} row2={smitheryRow2} row3={smitheryRow3} total={totalImportados} />


      {/* ── Trust signals ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl p-5 flex flex-col gap-1.5 border" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
          <span className="text-2xl font-black text-gray-900 dark:text-gray-100">22+</span>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">API endpoints activos</span>
          <span className="text-xs text-gray-400 dark:text-gray-500">BOE, BORME, INE, AEMET y más</span>
        </div>
        <div className="rounded-xl p-5 flex flex-col gap-1.5 border" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
          <span className="text-2xl font-black text-gray-900 dark:text-gray-100">5</span>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Herramientas españolas verificadas</span>
          <span className="text-xs text-gray-400 dark:text-gray-500">Probadas y documentadas en español</span>
        </div>
        <div className="rounded-xl p-5 flex flex-col gap-1.5 border" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
          <span className="text-2xl font-black text-gray-900 dark:text-gray-100">OAuth</span>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Autenticación automática</span>
          <span className="text-xs text-gray-400 dark:text-gray-500">Sin tokens manuales, sin configuración</span>
        </div>
      </div>

      {/* ── Cómo conectar + lista MCPs ── */}
      <FadeIn>
        <div className="flex flex-col items-center gap-8">
          <HowToConnect />
          <McpListPreview mcps={destacados} total={totalImportados} />
        </div>
      </FadeIn>



      {/* ── Publish section ── */}
      <FadeIn>
        <PublishSection />
      </FadeIn>

      {/* ── Fire up section ── */}
      <FadeIn>
        <FireUpSection />
      </FadeIn>

    </div>
  )
}
