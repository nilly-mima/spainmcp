import Link from 'next/link'
import CopyButton from './CopyButton'

function CoolMascot() {
  return (
    <svg viewBox="0 0 518 329" fill="none" className="w-full">

      {/* Sparkles */}
      <path fill="#60A5FA" opacity="0.6" d="M120,60 l4,-12 4,12 12,4 -12,4 -4,12 -4,-12 -12,-4z"/>
      <path fill="#93C5FD" opacity="0.4" d="M460,80 l3,-9 3,9 9,3 -9,3 -3,9 -3,-9 -9,-3z"/>
      <path fill="#60A5FA" opacity="0.5" d="M80,160 l3,-9 3,9 9,3 -9,3 -3,9 -3,-9 -9,-3z"/>
      <path fill="#3B82F6" opacity="0.3" d="M480,200 l2,-7 2,7 7,2 -7,2 -2,7 -2,-7 -7,-2z"/>
      <path fill="#93C5FD" opacity="0.4" d="M150,20 l3,-9 3,9 9,3 -9,3 -3,9 -3,-9 -9,-3z"/>

      {/* Sombra */}
      <ellipse cx="280" cy="310" rx="80" ry="12" fill="#1C1917" opacity="0.15"/>

      {/* Pierna izquierda — pegada */}
      <rect x="250" y="215" width="14" height="78" rx="7" fill="#F1F5F9" stroke="#94A3B8" strokeWidth="2"/>
      {/* Pierna derecha — pegada */}
      <rect x="296" y="215" width="14" height="78" rx="7" fill="#F1F5F9" stroke="#94A3B8" strokeWidth="2"/>

      {/* Zapato izquierdo */}
      <ellipse cx="257" cy="296" rx="16" ry="8" fill="#F1F5F9" stroke="#94A3B8" strokeWidth="2"/>
      {/* Zapato derecho */}
      <ellipse cx="303" cy="296" rx="16" ry="8" fill="#F1F5F9" stroke="#94A3B8" strokeWidth="2"/>

      {/* Rayos (conexiones MCP) */}
      <g opacity="0.85">
        <rect x="275" y="30" width="10" height="30" rx="5" fill="#60A5FA"/>
        <rect x="275" y="205" width="10" height="30" rx="5" fill="#60A5FA"/>
        <rect x="165" y="125" width="30" height="10" rx="5" fill="#60A5FA"/>
        <rect x="365" y="125" width="30" height="10" rx="5" fill="#60A5FA"/>
        <rect x="190" y="62" width="10" height="30" rx="5" fill="#60A5FA" transform="rotate(-45 195 77)"/>
        <rect x="360" y="62" width="10" height="30" rx="5" fill="#60A5FA" transform="rotate(45 365 77)"/>
        <rect x="190" y="175" width="10" height="30" rx="5" fill="#60A5FA" transform="rotate(45 195 190)"/>
        <rect x="360" y="175" width="10" height="30" rx="5" fill="#60A5FA" transform="rotate(-45 365 190)"/>
      </g>

      {/* Cuerpo sol */}
      <circle cx="280" cy="140" r="85" fill="#2563EB" stroke="#1D4ED8" strokeWidth="3"/>

      {/* Barriga */}
      <circle cx="280" cy="160" r="40" fill="#93C5FD" opacity="0.5"/>

      {/* Barra gafas de sol */}
      <rect x="210" y="120" width="140" height="12" rx="6" fill="#1C1917"/>

      {/* Lente izquierda */}
      <ellipse cx="247" cy="140" rx="28" ry="22" fill="#1C1917"/>
      {/* Lente derecha */}
      <ellipse cx="313" cy="140" rx="28" ry="22" fill="#1C1917"/>

      {/* Destello lente izquierda */}
      <ellipse cx="238" cy="133" rx="6" ry="10" fill="white" opacity="0.25" transform="rotate(-15 238 133)"/>
      {/* Destello lente derecha */}
      <ellipse cx="304" cy="133" rx="6" ry="10" fill="white" opacity="0.25" transform="rotate(-15 304 133)"/>

      {/* Sonrisa grande */}
      <path d="M255,178 Q280,205 305,178" stroke="white" strokeWidth="4.5" strokeLinecap="round" fill="none"/>

    </svg>
  )
}

export default function FireUpSection() {
  return (
    <section className="relative pt-20 pb-0 overflow-x-clip overflow-y-visible" style={{ width: '100vw', marginLeft: 'calc(50% - 50vw)' }}>

      {/* Cono SVG — absolutamente posicionado, triángulo invertido con gradiente */}
      <svg
        className="absolute left-1/2 -translate-x-1/2 top-0 pointer-events-none"
        style={{ width: '120%', height: '100%' }}
        viewBox="0 0 1400 600"
        fill="none"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <defs>
          <radialGradient id="fire-spotlight" cx="50%" cy="0%" r="65%" fx="50%" fy="0%">
            <stop offset="0%"   stopColor="#2563EB" stopOpacity="0.22"/>
            <stop offset="60%"  stopColor="#2563EB" stopOpacity="0.08"/>
            <stop offset="100%" stopColor="#2563EB" stopOpacity="0"/>
          </radialGradient>
        </defs>
        {/* Triángulo: ancho en la parte superior, punta abajo en el centro */}
        <polygon points="700,600 0,0 1400,0" fill="url(#fire-spotlight)"/>
      </svg>

      {/* Contenido centrado */}
      <div className="relative z-10 flex flex-col items-center gap-8">

        {/* Titular */}
        <h2 className="text-5xl sm:text-6xl font-black text-gray-900 dark:text-gray-100 text-center leading-[1.1]">
          <span className="text-blue-600">Conecta</span> en<br/>30 segundos
        </h2>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <Link
            href="/docs"
            className="bg-blue-600 text-white px-6 h-[42px] rounded-lg font-semibold text-sm hover:bg-blue-700 transition-colors flex items-center justify-center"
          >
            Ver Docs
          </Link>
          <div
            className="flex items-center gap-2 bg-white dark:bg-gray-900 rounded-lg px-4 h-[42px] font-mono text-sm text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700"
          >
            <span className="text-gray-400 dark:text-gray-500 select-none">$</span>
            <code>claude mcp add --transport http spainmcp https://mcp.spainmcp.com</code>
            <CopyButton text="claude mcp add --transport http spainmcp https://mcp.spainmcp.com" />
          </div>
        </div>

        {/* Gradiente sutil inferior */}
        <div className="w-full h-24" />

      </div>
    </section>
  )
}
