import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getMcpById, getAllMcps, CATEGORIA_LABELS, DIFICULTAD_LABELS } from '@/lib/mcps'
import CopyButton from '@/components/CopyButton'

export async function generateStaticParams() {
  const mcps = getAllMcps()
  return mcps.map(mcp => ({ slug: mcp.id }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const mcp = getMcpById(slug)
  if (!mcp) return {}
  return {
    title: `${mcp.nombre} — SpainMCP`,
    description: mcp.descripcion_corta,
  }
}

export default async function McpPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const mcp = getMcpById(slug)
  if (!mcp) notFound()

  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-8">

      {/* Breadcrumb */}
      <nav className="text-sm text-[var(--muted)] flex items-center gap-2">
        <Link href="/" className="hover:text-[var(--foreground)]">Inicio</Link>
        <span>/</span>
        <Link href="/mcps" className="hover:text-[var(--foreground)]">Directorio</Link>
        <span>/</span>
        <span className="text-[var(--foreground)]">{mcp.nombre}</span>
      </nav>

      {/* Header */}
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6 flex flex-col gap-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[var(--foreground)]">{mcp.nombre}</h1>
            <p className="text-[var(--muted)] mt-1">por {mcp.creador}</p>
          </div>
          <div className="flex flex-wrap gap-2 justify-end">
            {mcp.verificado && (
              <span className="bg-green-50 text-green-700 border border-green-200 px-3 py-1 rounded-full text-sm">
                ✓ Verificado
              </span>
            )}
            {mcp.especifico_espana && (
              <span className="bg-yellow-50 text-yellow-700 border border-yellow-200 px-3 py-1 rounded-full text-sm">
                🇪🇸 España
              </span>
            )}
            <span className={`px-3 py-1 rounded-full text-sm border ${mcp.gratuito ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-50 text-gray-600 border-gray-200'}`}>
              {mcp.gratuito ? 'Gratuito' : mcp.precio_info || 'De pago'}
            </span>
          </div>
        </div>

        <p className="text-[var(--foreground)] leading-relaxed">{mcp.descripcion_es}</p>

        <div className="flex flex-wrap gap-2">
          {mcp.categoria.map(cat => (
            <Link
              key={cat}
              href={`/categoria/${cat}`}
              className="bg-[var(--border)] text-[var(--muted)] px-2 py-0.5 rounded-full text-xs hover:bg-orange-50 hover:text-orange-600 transition-colors"
            >
              {CATEGORIA_LABELS[cat] || cat}
            </Link>
          ))}
        </div>

        <div className="flex gap-4 text-sm text-[var(--muted)] pt-2 border-t border-[var(--border)]">
          <span>{mcp.num_tools} tools disponibles</span>
          <span>Dificultad: {DIFICULTAD_LABELS[mcp.dificultad_instalacion]}</span>
          <span>Verificado: {mcp.fecha_verificado}</span>
        </div>
      </div>

      {/* Instalación */}
      <div className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold">Instalación en Claude Code</h2>
        <div className="bg-gray-900 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-gray-400 text-xs">Terminal</p>
            <CopyButton text={mcp.instalacion_claude_code} />
          </div>
          <code className="text-green-400 text-sm font-mono">{mcp.instalacion_claude_code}</code>
        </div>

        {mcp.variables_entorno.length > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
            <p className="font-medium text-yellow-800 text-sm mb-2">Variables de entorno necesarias:</p>
            <ul className="flex flex-col gap-1">
              {mcp.variables_entorno.map(v => (
                <li key={v} className="font-mono text-sm text-yellow-900 bg-yellow-100 px-2 py-1 rounded">
                  {v}
                </li>
              ))}
            </ul>
          </div>
        )}

        <h2 className="text-lg font-semibold mt-2">Instalación con npx</h2>
        <div className="bg-gray-900 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-gray-400 text-xs">Terminal</p>
            <CopyButton text={mcp.instalacion_npx} />
          </div>
          <code className="text-green-400 text-sm font-mono">{mcp.instalacion_npx}</code>
        </div>
      </div>

      {/* Compatible con */}
      <div className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">Compatible con</h2>
        <div className="flex flex-wrap gap-2">
          {mcp.compatible_con.map(app => (
            <span key={app} className="bg-white border border-gray-200 px-3 py-1.5 rounded-lg text-sm text-gray-700">
              {app}
            </span>
          ))}
        </div>
      </div>

      {/* Casos de uso */}
      <div className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">Casos de uso</h2>
        <ul className="flex flex-col gap-2">
          {mcp.casos_uso_es.map((caso, i) => (
            <li key={i} className="flex items-start gap-3 bg-[var(--card)] border border-[var(--border)] rounded-xl p-4">
              <span className="text-orange-500 mt-0.5">→</span>
              <span className="text-[var(--foreground)]">{caso}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-2">
        {mcp.tags.map(tag => (
          <span key={tag} className="text-xs text-[var(--muted)] bg-[var(--border)] px-2 py-1 rounded">
            #{tag}
          </span>
        ))}
      </div>

      {/* Links */}
      <div className="flex gap-3 pb-8">
        <a
          href={mcp.github_url}
          target="_blank"
          rel="noopener noreferrer"
          className="border border-[var(--border)] text-[var(--foreground)] px-4 py-2 rounded-lg hover:bg-[var(--card)] transition-colors text-sm"
        >
          Ver en GitHub →
        </a>
        {mcp.web_oficial && (
          <a
            href={mcp.web_oficial}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors text-sm"
          >
            Web oficial →
          </a>
        )}
      </div>

      {mcp.nota_es && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800">
          <strong>Nota:</strong> {mcp.nota_es}
        </div>
      )}
    </div>
  )
}
