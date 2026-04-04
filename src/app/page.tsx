import Link from 'next/link'
import McpCard from '@/components/McpCard'
import NetworkAnimation from '@/components/NetworkAnimation'
import { getAllMcps, getAllCategorias, CATEGORIA_LABELS } from '@/lib/mcps'

export default function Home() {
  const mcps = getAllMcps()
  const destacados = mcps.filter(m => m.destacado)
  const categorias = getAllCategorias()

  return (
    <div className="flex flex-col gap-16">

      {/* Hero */}
      <section className="pt-12 pb-4 flex flex-col lg:flex-row items-center gap-8">

        {/* Texto izquierda */}
        <div className="flex flex-col gap-6 flex-1 min-w-0">
          <h1 className="text-5xl md:text-6xl font-bold text-stone-900 leading-tight tracking-tight">
            La forma más rápida de extender tu IA
          </h1>
          <p className="text-lg text-stone-500 max-w-md leading-relaxed">
            Conecta Claude a miles de herramientas con servidores MCP.
            Guías en español, verificados, para España y LATAM.
          </p>
          <div className="flex items-center gap-3 flex-wrap">
            <div
              className="flex items-center gap-2 bg-white rounded-xl px-4 py-2.5 text-sm font-mono text-stone-600"
              style={{ border: '1px solid #E8E2D9' }}
            >
              <span className="text-stone-400">$</span>
              claude mcp add github
            </div>
            <Link
              href="/mcps"
              className="bg-orange-600 text-white px-5 py-2.5 rounded-xl hover:bg-orange-700 transition-colors font-medium text-sm"
            >
              Ver {mcps.length}+ MCPs
            </Link>
          </div>
        </div>

        {/* Red neuronal derecha */}
        <div className="hidden lg:block w-[520px] h-[380px] shrink-0">
          <NetworkAnimation />
        </div>

      </section>

      {/* Cards grid destacados — sin sección header, directo */}
      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-stone-400 uppercase tracking-wider">Destacados</h2>
          <Link href="/mcps" className="text-sm text-orange-600 hover:text-orange-700 font-medium">
            Ver todos →
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {destacados.map(mcp => (
            <McpCard key={mcp.id} mcp={mcp} />
          ))}
        </div>
      </section>

      {/* Categorías */}
      <section className="flex flex-col gap-4">
        <h2 className="text-sm font-semibold text-stone-400 uppercase tracking-wider">Categorías</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {categorias.slice(0, 8).map(cat => (
            <Link
              key={cat}
              href={`/categoria/${cat}`}
              className="bg-white rounded-xl p-4 flex flex-col gap-1 hover:shadow-md transition-shadow group"
              style={{ border: '1px solid #E8E2D9' }}
            >
              <span className="font-medium text-stone-800 group-hover:text-orange-600 transition-colors text-sm">
                {CATEGORIA_LABELS[cat] || cat}
              </span>
              <span className="text-xs text-stone-400">Explorar →</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Todos */}
      <section className="flex flex-col gap-4">
        <h2 className="text-sm font-semibold text-stone-400 uppercase tracking-wider">Todos los servidores MCP</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {mcps.filter(m => !m.destacado).map(mcp => (
            <McpCard key={mcp.id} mcp={mcp} />
          ))}
        </div>
      </section>

      {/* CTA banner oscuro — estilo Smithery */}
      <section
        className="rounded-2xl p-10 text-center flex flex-col items-center gap-4"
        style={{ background: '#1C1917' }}
      >
        <h2 className="text-2xl font-bold text-white">¿Tu empresa quiere su MCP?</h2>
        <p className="text-stone-400 max-w-md">
          Publica tu servidor MCP en SpainMCP. Visibilidad en toda la comunidad hispanohablante.
        </p>
        <div className="flex gap-3">
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
            className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors text-sm font-medium"
          >
            Publicar MCP →
          </Link>
        </div>
      </section>

    </div>
  )
}
