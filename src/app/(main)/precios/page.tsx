import Link from 'next/link'
import FaqAccordion from '@/components/FaqAccordion'

export const metadata = {
  title: 'Precios — SpainMCP',
  description: 'Conecta a servidores MCP con OAuth gestionado y almacenamiento seguro de credenciales.',
}

function CheckIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-green-500 shrink-0">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  )
}

const faqs = [
  {
    q: '¿Qué es una RPC?',
    a: <>Una RPC (Remote Procedure Call) es una única petición <a href="https://modelcontextprotocol.io/specification/2025-03-26/basic" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">JSON-RPC 2.0</a> a un servidor MCP — como listar herramientas, llamar a una herramienta o leer un recurso. El uso de RPCs se factura a la cuenta que realiza las llamadas.</>,
  },
  {
    q: '¿Qué es el OAuth gestionado?',
    a: 'SpainMCP mantiene el flujo OAuth para las integraciones más populares, por lo que no necesitas configurar redirect URIs, client IDs ni secrets. Los tokens se renuevan automáticamente antes de expirar.',
  },
  {
    q: '¿Qué son las conexiones persistentes?',
    a: 'SpainMCP mantiene tus conexiones MCP activas y gestiona todo el ciclo de vida — almacenamiento de credenciales, renovación de tokens y reconexión. Tú haces las peticiones; nosotros gestionamos la fontanería.',
  },
  {
    q: '¿Es gratuito publicar un servidor MCP?',
    a: 'Sí, publicar tu servidor MCP en el directorio de SpainMCP es completamente gratuito. Solo pagas por las llamadas RPC cuando consumes servidores MCP.',
  },
]

export default function PreciosPage() {
  return (
    <div className="max-w-5xl mx-auto flex flex-col gap-16 pb-16">

      {/* Header */}
      <div className="flex flex-col gap-3">
        <h1 className="text-5xl font-bold text-stone-900 dark:text-stone-100 tracking-tight">Precios</h1>
        <p className="text-lg text-stone-500 dark:text-stone-400">
          Conecta a servidores MCP con OAuth gestionado y almacenamiento seguro de credenciales.
        </p>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-start">

        {/* HOBBY */}
        <div className="rounded-2xl p-7 flex flex-col gap-6 bg-white dark:bg-[var(--card)]" style={{ border: '1px solid var(--border)' }}>
          <div className="flex flex-col gap-1">
            <p className="text-xs font-semibold text-stone-400 dark:text-stone-500 uppercase tracking-widest">Hobby</p>
            <p className="text-4xl font-bold text-stone-900 dark:text-stone-100">Gratis</p>
          </div>

          <div className="h-px bg-[var(--border)]" />

          <div className="flex flex-col gap-3">
            {[
              { label: 'RPCs/mes', value: '25K' },
              { label: 'Namespaces', value: '3' },
              { label: 'OAuth gestionado', value: <CheckIcon /> },
              { label: 'Conexiones persistentes', value: <CheckIcon /> },
            ].map(({ label, value }) => (
              <div key={label} className="flex items-center justify-between gap-3">
                <span className="text-sm text-stone-500 dark:text-stone-400 border-b border-dashed border-stone-300 dark:border-stone-600 cursor-default">
                  {label}
                </span>
                <span className="text-sm font-medium text-stone-700 dark:text-stone-300 flex items-center">
                  {value}
                </span>
              </div>
            ))}
          </div>

          <Link
            href="/docs"
            className="w-full text-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-colors"
          >
            Ver documentación
          </Link>
        </div>

        {/* PAY AS YOU GO — destacado */}
        <div
          className="rounded-2xl p-7 flex flex-col gap-6 bg-white dark:bg-[var(--card)] shadow-lg"
          style={{ border: '2px solid #2563EB' }}
        >
          <div className="flex flex-col gap-1">
            <p className="text-xs font-semibold text-blue-600 dark:text-blue-500 uppercase tracking-widest">Pay as you Go</p>
            <div className="flex items-end gap-1">
              <p className="text-4xl font-bold text-stone-900 dark:text-stone-100">$30</p>
              <p className="text-stone-400 dark:text-stone-500 text-sm mb-1">/mes</p>
            </div>
          </div>

          <div className="h-px bg-[var(--border)]" />

          <div className="flex flex-col gap-3">
            {[
              { label: 'RPCs/mes', value: '$0,50 / 1K' },
              { label: 'Namespaces', value: '100' },
              { label: 'OAuth gestionado', value: <CheckIcon /> },
              { label: 'Conexiones persistentes', value: <CheckIcon /> },
            ].map(({ label, value }) => (
              <div key={label} className="flex items-center justify-between gap-3">
                <span className="text-sm text-stone-500 dark:text-stone-400 border-b border-dashed border-stone-300 dark:border-stone-600 cursor-default">
                  {label}
                </span>
                <span className="text-sm font-medium text-stone-700 dark:text-stone-300 flex items-center">
                  {value}
                </span>
              </div>
            ))}
          </div>

          <p className="text-xs text-stone-400 dark:text-stone-500 text-center -mt-2">
            $30 de crédito incluido cada mes
          </p>

          <button
            disabled
            className="w-full text-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-colors opacity-60 cursor-not-allowed"
          >
            Suscribirse — próximamente
          </button>
        </div>

        {/* CUSTOM */}
        <div className="rounded-2xl p-7 flex flex-col gap-6 bg-white dark:bg-[var(--card)]" style={{ border: '1px solid var(--border)' }}>
          <div className="flex flex-col gap-1">
            <p className="text-xs font-semibold text-stone-400 dark:text-stone-500 uppercase tracking-widest">Custom</p>
            <p className="text-4xl font-bold text-stone-900 dark:text-stone-100">Contáctanos</p>
          </div>

          <div className="h-px bg-[var(--border)]" />

          <div className="flex flex-col gap-3">
            {[
              'Todo lo del plan Pay as you Go',
              'Límites de tasa personalizados',
              'SLA de disponibilidad',
              'Soporte por Slack',
            ].map(item => (
              <div key={item} className="flex items-center gap-2">
                <CheckIcon />
                <span className="text-sm text-stone-500 dark:text-stone-400">{item}</span>
              </div>
            ))}
          </div>

          <a
            href="mailto:hola@mcp.lat"
            className="w-full text-center border border-stone-300 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors"
          >
            Contáctanos
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
