import Link from 'next/link'
import FaqAccordion from '@/components/FaqAccordion'

export const metadata = {
  title: 'Precios — SpainMCP',
  description: 'Publica y destaca tu MCP en el directorio de referencia en español. Gratis para empezar.',
}

function CheckIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-green-500 shrink-0">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  )
}
function DashIcon() {
  return <span className="text-stone-300 dark:text-stone-600 text-sm">—</span>
}

interface Feature {
  label: string
  hobby: React.ReactNode
  pro: React.ReactNode
  empresa: React.ReactNode
}

const features: Feature[] = [
  {
    label: 'MCPs publicados',
    hobby:   '1',
    pro:     'Ilimitados',
    empresa: 'Ilimitados',
  },
  {
    label: 'Listado en directorio',
    hobby:   <CheckIcon />,
    pro:     <CheckIcon />,
    empresa: <CheckIcon />,
  },
  {
    label: 'Badge verificado',
    hobby:   <CheckIcon />,
    pro:     <CheckIcon />,
    empresa: <CheckIcon />,
  },
  {
    label: 'Posición destacada',
    hobby:   <DashIcon />,
    pro:     <CheckIcon />,
    empresa: <CheckIcon />,
  },
  {
    label: 'Analytics de visitas',
    hobby:   <DashIcon />,
    pro:     <CheckIcon />,
    empresa: <CheckIcon />,
  },
]

const faqs = [
  {
    q: '¿Es gratis publicar mi MCP en SpainMCP?',
    a: 'Sí, publicar tu MCP en el directorio de SpainMCP es completamente gratuito. Solo pagas si quieres destacar tu MCP, acceder a analytics avanzados o servicios B2B.',
  },
  {
    q: '¿Qué es un MCP?',
    a: 'Un MCP (Model Context Protocol) es un protocolo estándar de Anthropic que permite conectar Claude con herramientas externas: bases de datos, APIs, archivos locales, servicios web y mucho más.',
  },
  {
    q: '¿Puedo construir un MCP personalizado para mi empresa?',
    a: 'Sí. Ofrecemos servicios B2B de construcción de MCPs a medida integrados con tus sistemas internos. Contacta con nosotros para hablar de tu caso concreto.',
  },
  {
    q: '¿Qué incluye el plan Pro?',
    a: 'El plan Pro incluye posición destacada en el directorio, badge "Verificado Pro", analytics de visitas a tu MCP y publicación de MCPs ilimitados.',
  },
]

export default function PreciosPage() {
  return (
    <div className="max-w-5xl mx-auto flex flex-col gap-16 pb-16">

      {/* Header */}
      <div className="flex flex-col gap-3">
        <h1 className="text-5xl font-bold text-stone-900 dark:text-stone-100 tracking-tight">Precios</h1>
        <p className="text-lg text-stone-500 dark:text-stone-400">
          Publica tu MCP en el directorio de referencia hispanohablante. Gratis para empezar.
        </p>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-start">

        {/* BÁSICO */}
        <div className="rounded-2xl p-7 flex flex-col gap-6 bg-white dark:bg-[var(--card)]" style={{ border: '1px solid var(--border)' }}>
          <div className="flex flex-col gap-1">
            <p className="text-xs font-semibold text-stone-400 dark:text-stone-500 uppercase tracking-widest">Básico</p>
            <p className="text-4xl font-bold text-stone-900 dark:text-stone-100">Gratis</p>
          </div>

          <div className="h-px bg-[var(--border)]" />

          <div className="flex flex-col gap-3">
            {features.map(f => (
              <div key={f.label} className="flex items-center justify-between gap-3">
                <span className="text-sm text-stone-500 dark:text-stone-400 border-b border-dashed border-stone-300 dark:border-stone-600 cursor-default">
                  {f.label}
                </span>
                <span className="text-sm font-medium text-stone-700 dark:text-stone-300 flex items-center">
                  {f.hobby}
                </span>
              </div>
            ))}
          </div>

          <Link
            href="/mcps"
            className="w-full text-center bg-orange-600 hover:bg-orange-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-colors"
          >
            Ver directorio
          </Link>
        </div>

        {/* PRO — destacado */}
        <div
          className="rounded-2xl p-7 flex flex-col gap-6 bg-white dark:bg-[var(--card)] shadow-lg"
          style={{ border: '2px solid #EA580C' }}
        >
          <div className="flex flex-col gap-1">
            <p className="text-xs font-semibold text-orange-600 dark:text-orange-500 uppercase tracking-widest">Pro</p>
            <div className="flex items-end gap-1">
              <p className="text-4xl font-bold text-stone-900 dark:text-stone-100">€29</p>
              <p className="text-stone-400 dark:text-stone-500 text-sm mb-1">/mes</p>
            </div>
          </div>

          <div className="h-px bg-[var(--border)]" />

          <div className="flex flex-col gap-3">
            {features.map(f => (
              <div key={f.label} className="flex items-center justify-between gap-3">
                <span className="text-sm text-stone-500 dark:text-stone-400 border-b border-dashed border-stone-300 dark:border-stone-600 cursor-default">
                  {f.label}
                </span>
                <span className="text-sm font-medium text-stone-700 dark:text-stone-300 flex items-center">
                  {f.pro}
                </span>
              </div>
            ))}
          </div>

          <p className="text-xs text-stone-400 dark:text-stone-500 text-center -mt-2">
            Primer mes gratis
          </p>

          <button
            disabled
            className="w-full text-center bg-orange-600 hover:bg-orange-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-colors opacity-60 cursor-not-allowed"
          >
            Próximamente
          </button>
        </div>

        {/* EMPRESA */}
        <div className="rounded-2xl p-7 flex flex-col gap-6 bg-white dark:bg-[var(--card)]" style={{ border: '1px solid var(--border)' }}>
          <div className="flex flex-col gap-1">
            <p className="text-xs font-semibold text-stone-400 dark:text-stone-500 uppercase tracking-widest">Empresa</p>
            <p className="text-4xl font-bold text-stone-900 dark:text-stone-100">Contactar</p>
          </div>

          <div className="h-px bg-[var(--border)]" />

          <div className="flex flex-col gap-3">
            {[
              'Todo lo del plan Pro',
              'Construcción de MCPs a medida',
              'Integración con tus sistemas',
              'SLA de soporte',
              'Asesoría estratégica MCP',
            ].map(item => (
              <div key={item} className="flex items-center gap-2">
                <CheckIcon />
                <span className="text-sm text-stone-500 dark:text-stone-400">{item}</span>
              </div>
            ))}
          </div>

          <a
            href="mailto:hola@spainmcp.com"
            className="w-full text-center border border-stone-300 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors"
          >
            Contactar
          </a>
        </div>

      </div>

      {/* FAQ */}
      <div className="flex flex-col gap-6">
        <h2 className="text-sm font-semibold text-stone-400 dark:text-stone-500 uppercase tracking-widest">FAQ</h2>
        <FaqAccordion items={faqs} />
      </div>

    </div>
  )
}
