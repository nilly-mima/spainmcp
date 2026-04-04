import Link from 'next/link'
import McpCard from '@/components/McpCard'
import NetworkAnimation from '@/components/NetworkAnimation'
import FadeIn from '@/components/FadeIn'
import CopyButton from '@/components/CopyButton'
import { getAllMcps, getAllCategorias, CATEGORIA_LABELS, getImportedTotal } from '@/lib/mcps'

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
          <div className="inline-flex items-center gap-2 bg-orange-50 text-orange-700 text-xs font-medium px-3 py-1.5 rounded-full w-fit" style={{ border: '1px solid #FDBA74' }}>
            <span className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-pulse" />
            Directorio MCP en español · España y LATAM
          </div>
          <h1 className="text-6xl md:text-7xl lg:text-8xl font-black text-stone-900 leading-none tracking-tighter">
            La forma más rápida de extender tu IA
          </h1>
          <p className="text-lg text-stone-500 max-w-sm leading-relaxed">
            Conecta Claude a miles de herramientas con servidores MCP.
            Guías en español, verificados, para España y LATAM.
          </p>
          <div className="flex items-center gap-3 flex-wrap">
            <div
              className="flex items-center gap-3 bg-white rounded-xl px-4 py-2.5 text-sm font-mono text-stone-600"
              style={{ border: '1px solid #E8E2D9' }}
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

      {/* ── Stats ── */}
      <FadeIn>
        <div
          className="grid grid-cols-2 md:grid-cols-4 gap-px rounded-2xl overflow-hidden"
          style={{ background: '#E8E2D9' }}
        >
          {[
            { n: totalImportados.toLocaleString(), label: 'servidores MCP' },
            { n: mcps.length.toString(), label: 'guías en español' },
            { n: categorias.length.toString(), label: 'categorías' },
            { n: '650M', label: 'hispanohablantes' },
          ].map(({ n, label }) => (
            <div key={label} className="bg-white flex flex-col items-center justify-center py-6 gap-1">
              <span className="text-3xl font-bold text-stone-900">{n}</span>
              <span className="text-xs text-stone-400">{label}</span>
            </div>
          ))}
        </div>
      </FadeIn>

      {/* ── Destacados ── */}
      <FadeIn>
        <section className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-stone-400 uppercase tracking-wider">Destacados</h2>
            <Link href="/mcps" className="text-sm text-orange-600 hover:text-orange-700 font-medium transition-colors">
              Ver todos →
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {destacados.map((mcp, i) => (
              <FadeIn key={mcp.id} delay={i * 60} className="h-full">
                <McpCard mcp={mcp} />
              </FadeIn>
            ))}
          </div>
        </section>
      </FadeIn>

      {/* ── Categorías ── */}
      <FadeIn>
        <section className="flex flex-col gap-4">
          <h2 className="text-sm font-semibold text-stone-400 uppercase tracking-wider">Categorías</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {categorias.slice(0, 8).map((cat, i) => {
              const meta = CAT_META[cat]
              return (
                <FadeIn key={cat} delay={i * 50}>
                  <Link
                    href={`/categoria/${cat}`}
                    className="bg-white rounded-xl p-4 flex items-center gap-3 hover:shadow-md transition-all group"
                    style={{ border: '1px solid #E8E2D9' }}
                  >
                    {meta && (
                      <span
                        className="w-9 h-9 rounded-lg flex items-center justify-center text-lg shrink-0"
                        style={{ background: meta.bg }}
                      >
                        {meta.emoji}
                      </span>
                    )}
                    <div className="min-w-0">
                      <span
                        className="font-medium text-stone-800 text-sm block group-hover:transition-colors"
                        style={{ '--hover-color': meta?.accent } as React.CSSProperties}
                      >
                        {CATEGORIA_LABELS[cat] || cat}
                      </span>
                      <span className="text-xs text-stone-400">Explorar →</span>
                    </div>
                  </Link>
                </FadeIn>
              )
            })}
          </div>
        </section>
      </FadeIn>

      {/* ── Todos los MCPs curados ── */}
      <FadeIn>
        <section className="flex flex-col gap-4">
          <h2 className="text-sm font-semibold text-stone-400 uppercase tracking-wider">Todos los servidores MCP</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {mcps.filter(m => !m.destacado).map((mcp, i) => (
              <FadeIn key={mcp.id} delay={i * 40} className="h-full">
                <McpCard mcp={mcp} />
              </FadeIn>
            ))}
          </div>
        </section>
      </FadeIn>

      {/* ── CTA banner ── */}
      <FadeIn>
        <section
          className="rounded-2xl p-10 text-center flex flex-col items-center gap-4 relative overflow-hidden"
          style={{ background: '#1C1917' }}
        >
          {/* Decoración fondo */}
          <div className="absolute inset-0 opacity-5" style={{
            backgroundImage: 'radial-gradient(circle at 20% 50%, #EA580C 0%, transparent 50%), radial-gradient(circle at 80% 50%, #EA580C 0%, transparent 50%)'
          }} />
          <div className="relative flex flex-col items-center gap-4">
            <span className="text-3xl">⚡</span>
            <h2 className="text-2xl font-bold text-white">¿Tu empresa quiere su MCP?</h2>
            <p className="text-stone-400 max-w-md">
              Publica tu servidor MCP en SpainMCP. Visibilidad en toda la comunidad hispanohablante de España y LATAM.
            </p>
            <div className="flex gap-3 flex-wrap justify-center">
              <a
                href="https://github.com/nilly-mima/spainmcp"
                target="_blank"
                rel="noopener noreferrer"
                className="border border-stone-600 text-stone-300 px-4 py-2 rounded-lg hover:bg-stone-800 transition-colors text-sm"
              >
                Abrir PR en GitHub
              </a>
              <Link
                href="/submit"
                className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-500 transition-colors text-sm font-medium shadow-lg shadow-orange-900/30"
              >
                Publicar MCP →
              </Link>
            </div>
          </div>
        </section>
      </FadeIn>

    </div>
  )
}
