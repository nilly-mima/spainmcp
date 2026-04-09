import Link from 'next/link'
import NetworkAnimation from '@/components/NetworkAnimation'
import FadeIn from '@/components/FadeIn'
import CopyButton from '@/components/CopyButton'
import HeroCards from '@/components/HeroCards'
import HowToConnect from '@/components/HowToConnect'
import McpListPreview from '@/components/McpListPreview'
import PublishSection from '@/components/PublishSection'
import FireUpSection from '@/components/FireUpSection'
import { getAllMcps, getImportedTotal } from '@/lib/mcps'
import { smitheryRow1, smitheryRow2, smitheryRow3 } from '@/data/smithery-featured'
import { createClient } from '@supabase/supabase-js'
import type { SmitheryItem } from '@/data/smithery-featured'


function fmtDownloads(n: number): string {
  if (n >= 1000) return (n / 1000).toFixed(2).replace(/\.?0+$/, '') + 'k'
  return String(n)
}

async function getHeroRows(): Promise<{ row1: SmitheryItem[]; row2: SmitheryItem[]; row3: SmitheryItem[] }> {
  try {
    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data, error } = await supabase
      .from('mcp_catalog')
      .select('nombre, slug, descripcion_en, scope, icon_url, downloads')
      .eq('is_active', true)
      .order('downloads', { ascending: false })
      .limit(21)

    if (error || !data || data.length === 0) throw new Error('empty')

    const items: SmitheryItem[] = data.map(row => ({
      nombre: row.nombre,
      slug: row.slug,
      descripcion_en: row.descripcion_en || '',
      scope: (row.scope === 'local' ? 'local' : 'remote') as 'remote' | 'local',
      downloads: fmtDownloads(row.downloads ?? 0),
      icon_url: row.icon_url || '',
    }))

    const chunkSize = Math.ceil(items.length / 3)
    return {
      row1: items.slice(0, chunkSize),
      row2: items.slice(chunkSize, chunkSize * 2),
      row3: items.slice(chunkSize * 2),
    }
  } catch {
    return { row1: smitheryRow1, row2: smitheryRow2, row3: smitheryRow3 }
  }
}

export default async function Home() {
  const mcps = getAllMcps()
  const destacados = mcps.filter(m => m.destacado)
  const totalImportados = getImportedTotal()
  const { row1, row2, row3 } = await getHeroRows()

  return (
    <div className="flex flex-col gap-16">

      {/* Hero */}
      <section className="pt-6 pb-4 flex flex-col lg:flex-row items-center gap-10">
        <div className="flex flex-col gap-7 flex-1 min-w-0 animate-fade-in-up">
          <h1 className="text-[3.375rem] md:text-[4.05rem] lg:text-[5.4rem] font-black text-gray-900 dark:text-white leading-none tracking-tighter">
            Extiende tu IA en 2 clicks
          </h1>
          <p className="text-lg text-gray-500 dark:text-gray-400 max-w-sm leading-relaxed">
            Conecta GitHub, Gmail, Notion, Slack y más a tu IA con un solo comando. Sin código, sin configuración. En español.
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

      {/* Hero cards — now from mcp_catalog (fallback: smithery-featured.ts) */}
      <HeroCards row1={row1} row2={row2} row3={row3} total={totalImportados} />

      {/* Trust signals */}
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

      {/* Cómo conectar + lista MCPs */}
      <FadeIn>
        <div className="flex flex-col items-center gap-8">
          <HowToConnect />
          <McpListPreview mcps={destacados} total={totalImportados} />
        </div>
      </FadeIn>

      {/* Publish section */}
      <FadeIn>
        <PublishSection />
      </FadeIn>

      {/* Fire up section */}
      <FadeIn>
        <FireUpSection />
      </FadeIn>

    </div>
  )
}
