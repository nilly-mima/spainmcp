import Link from 'next/link'

function PublishMascot() {
  return (
    <svg viewBox="0 0 200 280" fill="none" className="w-full">

      {/* Sombra */}
      <ellipse cx="100" cy="260" rx="55" ry="10" fill="#1C1917" opacity="0.12"/>

      {/* Pierna izquierda — corta */}
      <rect x="80" y="178" width="12" height="40" rx="6" fill="white" stroke="#1C1917" strokeWidth="2.5"/>
      {/* Pierna derecha — corta */}
      <rect x="108" y="178" width="12" height="40" rx="6" fill="white" stroke="#1C1917" strokeWidth="2.5"/>

      {/* Zapato izquierdo */}
      <ellipse cx="86" cy="220" rx="14" ry="7" fill="white" stroke="#1C1917" strokeWidth="2"/>
      {/* Zapato derecho */}
      <ellipse cx="114" cy="220" rx="14" ry="7" fill="white" stroke="#1C1917" strokeWidth="2"/>

      {/* Rayos */}
      <g opacity="0.8">
        <rect x="96" y="18" width="8" height="22" rx="4" fill="#60A5FA"/>
        <rect x="96" y="175" width="8" height="22" rx="4" fill="#60A5FA"/>
        <rect x="20" y="103" width="22" height="8" rx="4" fill="#60A5FA"/>
        <rect x="158" y="103" width="22" height="8" rx="4" fill="#60A5FA"/>
        <rect x="44" y="50" width="8" height="22" rx="4" fill="#60A5FA" transform="rotate(-45 48 61)"/>
        <rect x="148" y="50" width="8" height="22" rx="4" fill="#60A5FA" transform="rotate(45 152 61)"/>
        <rect x="44" y="142" width="8" height="22" rx="4" fill="#60A5FA" transform="rotate(45 48 153)"/>
        <rect x="148" y="142" width="8" height="22" rx="4" fill="#60A5FA" transform="rotate(-45 152 153)"/>
      </g>

      {/* Cuerpo */}
      <circle cx="100" cy="115" r="68" fill="#2563EB" stroke="#1D4ED8" strokeWidth="2.5"/>

      {/* Barriga */}
      <circle cx="100" cy="130" r="32" fill="#93C5FD" opacity="0.45"/>

      {/* Ojo izquierdo */}
      <circle cx="83" cy="104" r="9" fill="white"/>
      <circle cx="84.5" cy="105.5" r="4.5" fill="#1C1917"/>
      <circle cx="86.5" cy="103.5" r="1.5" fill="white"/>

      {/* Ojo derecho */}
      <circle cx="117" cy="104" r="9" fill="white"/>
      <circle cx="118.5" cy="105.5" r="4.5" fill="#1C1917"/>
      <circle cx="120.5" cy="103.5" r="1.5" fill="white"/>

      {/* Boca "o" */}
      <circle cx="100" cy="128" r="8" fill="#1D4ED8"/>
      <circle cx="100" cy="128" r="8" stroke="white" strokeWidth="2.5" fill="none"/>

      {/* Mejillas */}
      <circle cx="70" cy="120" r="7" fill="#1D4ED8" opacity="0.3"/>
      <circle cx="130" cy="120" r="7" fill="#1D4ED8" opacity="0.3"/>

    </svg>
  )
}

export default function PublishSection() {
  return (
    <section className="flex gap-10 lg:gap-14 items-center py-6">

      {/* Terminal mockup */}
      <div className="hidden lg:flex w-[260px] shrink-0 items-center">
        <div className="w-full rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700/50 bg-gray-950 shadow-lg">
          <div className="flex items-center gap-1.5 px-3 py-2 bg-gray-900 border-b border-gray-800">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/70" />
            <div className="w-2.5 h-2.5 rounded-full bg-green-500/70" />
            <span className="ml-2 text-[10px] text-gray-500 font-mono">Terminal</span>
          </div>
          <div className="px-4 py-3 font-mono text-[11px] leading-relaxed">
            <p className="text-gray-500">$ npx spainmcp publish</p>
            <p className="text-green-400 mt-1">? Namespace: <span className="text-white">mi-empresa</span></p>
            <p className="text-green-400">? Server ID: <span className="text-white">mi-mcp</span></p>
            <p className="text-green-400">? URL: <span className="text-white">https://...</span></p>
            <p className="text-gray-500 mt-2">Publishing to SpainMCP...</p>
            <p className="text-blue-400 mt-1">Published mi-empresa/mi-mcp</p>
            <p className="text-gray-500">→ mcp.lat/mi-empresa/mi-mcp</p>
          </div>
        </div>
      </div>

      {/* Contenido derecha */}
      <div className="flex flex-col gap-6 flex-1">

        {/* Título */}
        <div className="flex flex-col gap-1.5">
          <h2 className="text-4xl font-black text-gray-900 dark:text-gray-100 tracking-tight">Publica en SpainMCP</h2>
          <p className="text-gray-500 dark:text-gray-400">
            Publica tu MCP una vez, disponible para toda España y LATAM.
          </p>
        </div>

        {/* Dos feature cards */}
        <div className="flex flex-col sm:flex-row gap-3">

          {/* Card: Distribución */}
          <div
            className="flex-1 rounded-xl p-5 flex flex-col gap-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700"
          >
            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
              <strong>Distribución.</strong>{' '}
              Publica en SpainMCP. Llega a toda la comunidad IA hispanohablante.
            </p>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <span
                  className="px-3 py-1 rounded-full text-xs font-mono text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
                >
                  tu-slug.mcp.lat
                </span>
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center text-gray-400 dark:text-gray-500 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shrink-0"
                >
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M12 5v14M5 12l7 7 7-7"/>
                  </svg>
                </div>
              </div>
              <span className="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1.5">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
                </svg>
                1.2k instalaciones
              </span>
            </div>
          </div>

          {/* Card: Visibilidad */}
          <div
            className="flex-1 rounded-xl p-5 flex flex-col gap-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700"
          >
            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
              <strong>Visibilidad.</strong>{' '}
              Ve cómo se usa tu MCP. Atrae proyectos de toda España y LATAM.
            </p>
            <svg viewBox="0 0 200 44" className="w-full" preserveAspectRatio="none" aria-hidden="true">
              <path
                d="M0,36 Q18,30 35,33 Q52,36 68,22 Q84,8 100,16 Q116,24 132,11 Q148,0 164,7 Q178,13 192,5 Q196,3 200,6"
                fill="none" stroke="#1C1917" strokeOpacity="0.7" strokeWidth="1.5" strokeLinecap="round"
              />
            </svg>
          </div>
        </div>

        {/* CTAs */}
        <div className="flex gap-3">
          <Link
            href="/publish/mcp"
            className="bg-blue-600 text-white px-7 py-2.5 rounded-xl font-bold text-sm hover:bg-blue-700 transition-colors shadow-sm"
          >
            Publicar MCP
          </Link>
          <Link
            href="/docs"
            className="border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 px-7 py-2.5 rounded-xl font-bold text-sm hover:bg-gray-50 dark:bg-gray-800 transition-colors"
          >
            Documentación
          </Link>
        </div>

      </div>
    </section>
  )
}
