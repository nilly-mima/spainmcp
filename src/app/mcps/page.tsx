import McpCard from '@/components/McpCard'
import CuradosGrid from '@/components/CuradosGrid'
import ImportedCategoryGroup from '@/components/ImportedCategoryGroup'
import { getAllMcps, getAllCategorias, getImportedMcps, getImportedTotal, CATEGORIA_LABELS } from '@/lib/mcps'
import Link from 'next/link'

export const metadata = {
  title: 'Directorio de servidores MCP — SpainMCP',
  description: 'Más de 1800 servidores MCP con guías en español. El directorio MCP más completo para España y LATAM.',
}

const IMPORTED_CAT_LABELS: Record<string, string> = {
  'desarrollo': 'Desarrollo',
  'otros': 'Otros',
  'finanzas': 'Finanzas',
  'productividad': 'Productividad',
  'busqueda': 'Búsqueda',
  'bases-de-datos': 'Bases de datos',
  'seguridad': 'Seguridad',
  'datos': 'Datos',
  'comunicacion': 'Comunicación',
  'cloud': 'Cloud',
  'agregadores': 'Agregadores',
  'automatizacion': 'Automatización',
  'arte': 'Arte y cultura',
  'gaming': 'Gaming',
  'archivos': 'Archivos',
  'multimedia': 'Multimedia',
  'infraestructura': 'Infraestructura',
  'lenguaje': 'Lenguaje',
  'legal': 'Legal',
  'marketing': 'Marketing',
  'noticias': 'Noticias',
  'scraping': 'Scraping',
  'salud': 'Salud',
  'viajes': 'Viajes',
  'educacion': 'Educación',
  'entretenimiento': 'Entretenimiento',
  'redes-sociales': 'Redes sociales',
}

export default function DirectorioPage() {
  const curados = getAllMcps()
  const importados = getImportedMcps()
  const totalImportados = getImportedTotal()
  const categorias = getAllCategorias()

  // Agrupar por categoría y ordenar alfabéticamente dentro de cada grupo
  const grupos = importados.reduce<Record<string, typeof importados>>((acc, mcp) => {
    const cat = mcp.categoria || 'otros'
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(mcp)
    return acc
  }, {})
  Object.values(grupos).forEach(g => g.sort((a, b) => a.nombre.localeCompare(b.nombre)))
  const gruposOrdenados = Object.entries(grupos).sort(([a], [b]) => a.localeCompare(b))

  return (
    <div className="flex flex-col gap-10">

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-stone-900">Directorio MCP</h1>
        <p className="text-stone-500 mt-2">
          <span className="font-semibold text-stone-700">{curados.length}</span> curados con guías en español
          · <span className="font-semibold text-stone-700">{totalImportados.toLocaleString()}</span> importados de awesome-mcp-servers
        </p>
      </div>

      {/* Filtros categoría */}
      <div className="flex flex-wrap gap-2">
        <span className="text-xs text-stone-400 self-center uppercase tracking-wider mr-1">Categoría:</span>
        {categorias.map(cat => (
          <Link
            key={cat}
            href={`/categoria/${cat}`}
            className="bg-white text-stone-600 px-3 py-1 rounded-lg text-sm hover:text-orange-600 transition-colors"
            style={{ border: '1px solid #E8E2D9' }}
          >
            {CATEGORIA_LABELS[cat] || cat}
          </Link>
        ))}
      </div>

      {/* Curados con guía en español */}
      <section className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <h2 className="text-sm font-semibold text-stone-400 uppercase tracking-wider">
            Curados — Guías en español
          </h2>
          <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">
            {curados.length} MCPs
          </span>
        </div>
        <CuradosGrid>
          {curados.map(mcp => (
            <McpCard key={mcp.id} mcp={mcp} />
          ))}
        </CuradosGrid>
      </section>

      {/* Importados agrupados por categoría */}
      <section className="flex flex-col gap-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-sm font-semibold text-stone-400 uppercase tracking-wider">
              Todos los servidores MCP
            </h2>
            <span
              className="text-xs text-stone-400 px-2 py-0.5 rounded-full"
              style={{ background: '#F5F0E8', border: '1px solid #E8E2D9' }}
            >
              {totalImportados.toLocaleString()} MCPs · awesome-mcp-servers
            </span>
          </div>
          <a
            href="https://github.com/punkpeye/awesome-mcp-servers"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-stone-400 hover:text-stone-600 transition-colors"
          >
            Fuente: GitHub →
          </a>
        </div>

        {gruposOrdenados.map(([cat, mcps]) => (
          <ImportedCategoryGroup
            key={cat}
            label={IMPORTED_CAT_LABELS[cat] || cat}
            mcps={mcps}
          />
        ))}
      </section>

    </div>
  )
}
