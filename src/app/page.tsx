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
import { getAllMcps, getAllCategorias, CATEGORIA_LABELS, getImportedTotal, getImportedMcps } from '@/lib/mcps'

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
  const imported = getImportedMcps(36)
  const heroRow1 = imported.slice(0, 12)
  const heroRow2 = imported.slice(12, 24)
  const heroRow3 = imported.slice(24, 36)

  return (
    <div className="flex flex-col gap-16">

      {/* ── Hero ── */}
      <section className="pt-6 pb-4 flex flex-col lg:flex-row items-center gap-10">
        <div className="flex flex-col gap-7 flex-1 min-w-0 animate-fade-in-up">
          <h1 className="text-[3.375rem] md:text-[4.05rem] lg:text-[5.4rem] font-black text-stone-900 dark:text-stone-100 leading-none tracking-tighter">
            La forma más rápida de extender tu IA
          </h1>
          <p className="text-lg text-stone-500 dark:text-stone-400 max-w-sm leading-relaxed">
            Conecta Claude a miles de herramientas con servidores MCP.
            Guías en español, verificados, para España y LATAM.
          </p>
          <div className="flex items-center gap-3 flex-wrap">
            <div
              className="flex items-center gap-3 bg-white dark:bg-[var(--card)] rounded-xl px-4 py-2.5 text-sm font-mono text-stone-600 dark:text-stone-300"
              style={{ border: '1px solid var(--border)' }}
            >
              <span className="text-stone-400">$</span>
              <span>claude mcp add github</span>
              <CopyButton text="claude mcp add github" />
            </div>
            <Link
              href="/mcps"
              className="bg-orange-600 text-white px-5 py-2.5 rounded-xl hover:bg-orange-700 transition-colors font-medium text-sm shadow-sm hover:shadow-md"
            >
              Ver {mcps.length}+ MCPs →
            </Link>
          </div>
        </div>

        <div className="hidden lg:block relative w-[520px] h-[420px] shrink-0">
          {/* Sparkle decorations */}
          <span className="sparkle-1 absolute top-6  left-20 text-2xl text-stone-400 select-none pointer-events-none">✦</span>
          <span className="sparkle-2 absolute top-12 right-8  text-xl  text-stone-400 select-none pointer-events-none">✦</span>
          <span className="sparkle-3 absolute bottom-24 left-6 text-lg  text-stone-400 select-none pointer-events-none">✦</span>
          <span className="sparkle-4 absolute top-1/2 right-2 text-base text-stone-400 select-none pointer-events-none">✦</span>
          <NetworkAnimation />
        </div>
      </section>

      {/* ── Hero cards ── */}
      <HeroCards row1={heroRow1} row2={heroRow2} row3={heroRow3} total={totalImportados} />


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
