import Link from 'next/link'

function PublishMascot() {
  return (
    <svg viewBox="0 0 290 315" fill="none" className="w-full">

      {/* Sombra */}
      <path fill="#1C1917" fillOpacity="0.3"
        d="M150.49,296.42c54.64,0,98.93-6.1,98.93-13.65s-44.3-13.65-98.93-13.65-98.93,6.11-98.93,13.65,44.3,13.65,98.93,13.65h0Z"/>

      {/* Pierna izquierda (angled, front) */}
      <path fill="white"
        d="M174.24,239.62c27.47,4.66,42.6,28.04,42.6,28.04l.62,13.65-47.76-10.38,4.54-31.32h0Z"/>
      <path fill="#1C1917"
        d="M219.34,283.54l-51.64-11.22,5.04-34.76,1.79.3c27.92,4.74,43.16,27.85,43.79,28.83l.26.4.75,16.44h.01ZM171.7,269.55l43.89,9.54-.49-10.84c-2.04-2.93-15.98-21.77-39.35-26.54l-4.04,27.85h-.01Z"/>

      {/* Zapato izquierdo */}
      <path fill="white"
        d="M227.81,283.56l-10.35-2.25s-1.55-8.24-.62-13.65c.93-5.42,5.97-13.86,16.85-11.17l-5.87,27.07h-.01Z"/>
      <path fill="#1C1917"
        d="M229.17,285.67l-13.24-2.88-.22-1.16c-.07-.35-1.6-8.61-.63-14.28.6-3.48,2.73-8.19,6.94-10.94,3.36-2.2,7.54-2.77,12.09-1.65l1.68.41-6.61,30.49h0ZM219.01,279.83l7.44,1.62,5.11-23.56c-2.9-.41-5.45.1-7.59,1.5-3.25,2.13-4.93,5.95-5.38,8.57-.66,3.88.06,9.48.43,11.87h0Z"/>

      {/* Cuerpo + llama — una sola ruta orgánica */}
      <path fill="#EA580C"
        d="M174.54,103.7c31.32-49.8-16.13-92-52.95-84.76,0,0,27.9,41.02-5.27,63.82,2.78-20.55-14.78-32.09-34.04-28.87,0,0,19.73,20.06-22.32,61.17-4.62,4.51-38.69,36.67-33.75,82.36,4.34,40.09,29.39,64.73,69.54,75.71,44.74,12.23,108.23,8.65,134.92-47.78,41.9-88.56-56.14-121.64-56.14-121.64h0Z"/>

      {/* Barriga amarilla */}
      <path fill="#FCD34D"
        d="M79.54,245.07c23.31,6.26,47.11-6.92,53.17-29.45,6.06-22.53-7.93-45.87-31.23-52.14-23.31-6.26-47.11,6.92-53.17,29.45-6.06,22.53,7.93,45.87,31.23,52.14Z"/>

      {/* Ojo izquierdo */}
      <path fill="#1C1917"
        d="M177.11,183.05c2.35.47,4.9-2.43,5.71-6.47.81-4.04-.45-7.7-2.79-8.17-2.35-.47-4.9,2.43-5.71,6.47-.81,4.04.45,7.7,2.79,8.17Z"/>

      {/* Ojo derecho */}
      <path fill="#1C1917"
        d="M210.14,185.07c2.29.71,5.13-1.91,6.35-5.85s.36-7.7-1.93-8.41-5.13,1.91-6.35,5.85-.36,7.71,1.93,8.41Z"/>

      {/* Ceja — arco superior */}
      <path fill="#1C1917"
        d="M182.49,171.5c-8.2,0-16.64-1.86-24.65-5.56-.89-.41-1.28-1.47-.87-2.36s1.47-1.28,2.36-.87c13.8,6.38,28.92,6.95,41.48,1.59,13.12-5.61,23.03-17.25,28.67-33.68.32-.93,1.33-1.42,2.26-1.1.93.32,1.42,1.33,1.1,2.26-5.97,17.4-16.56,29.78-30.63,35.79-6.14,2.62-12.84,3.93-19.71,3.93h0Z"/>

      {/* Ceja — detalle enfado */}
      <path fill="#1C1917"
        d="M179.04,213.7c-1.44,0-2.77-.35-3.95-1.24-2.21-1.83-3.06-4.25-2.47-6.85,1.15-5.07,7.49-9.77,16.13-11.95,6.81-1.72,19.92-1.22,24.97,3.48,1.76,1.65,2.48,3.7,2.08,5.93-1.29,7.14-6.59,6.81-12.19,6.47-2.57-.16-5.45-.33-8.6.02l-.71.1c-2.43.34-4.93,1.23-7.35,2.09-2.8,1-5.5,1.96-7.9,1.96h0ZM197.27,196.27c-2.76,0-5.45.28-7.65.83-8.33,2.11-12.86,6.3-13.54,9.3-.29,1.28.11,2.36,1.22,3.28,1.54,1.17,4.9-.02,8.45-1.28,2.13-.76,4.51-1.6,6.92-2.07v-.04l1.14-.17c3.78-.52,7.24-.31,10.01-.14,6.02.37,7.78.3,8.47-3.55.19-1.03-.13-1.88-1.01-2.7-2.47-2.31-8.39-3.47-14.02-3.47h0ZM194.05,207.9h0Z"/>

      {/* Pierna derecha (atrás, elipse — encima del cuerpo en render) */}
      <ellipse fill="white" cx="138.35" cy="274.06" rx="12.51" ry="17.82"/>
      <path fill="#1C1917"
        d="M138.35,293.65c-7.88,0-14.29-8.79-14.29-19.59s6.41-19.59,14.29-19.59,14.29,8.79,14.29,19.59-6.41,19.59-14.29,19.59ZM138.35,258.02c-5.92,0-10.73,7.2-10.73,16.04s4.81,16.04,10.73,16.04,10.73-7.2,10.73-16.04-4.81-16.04-10.73-16.04Z"/>

    </svg>
  )
}

export default function PublishSection() {
  return (
    <section className="flex gap-10 lg:gap-14 items-center py-6">

      {/* Mascot izquierda — mirando hacia el contenido */}
      <div className="hidden lg:block w-[200px] shrink-0">
        <PublishMascot />
      </div>

      {/* Contenido derecha */}
      <div className="flex flex-col gap-6 flex-1">

        {/* Título */}
        <div className="flex flex-col gap-1.5">
          <h2 className="text-4xl font-black text-stone-900 tracking-tight">Publica en SpainMCP</h2>
          <p className="text-stone-500">
            Publica tu MCP una vez, disponible para toda España y LATAM.
          </p>
        </div>

        {/* Dos feature cards */}
        <div className="flex flex-col sm:flex-row gap-3">

          {/* Card: Distribución */}
          <div
            className="flex-1 rounded-xl p-5 flex flex-col gap-4 bg-white"
            style={{ border: '1px solid #E8E2D9' }}
          >
            <p className="text-sm text-stone-700 leading-relaxed">
              <strong>Distribución.</strong>{' '}
              Publica en SpainMCP. Llega a toda la comunidad IA hispanohablante.
            </p>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <span
                  className="px-3 py-1 rounded-full text-xs font-mono text-stone-600 bg-stone-50"
                  style={{ border: '1px solid #E8E2D9' }}
                >
                  tu-slug.mcp.lat
                </span>
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center text-stone-400 bg-white shrink-0"
                  style={{ border: '1px solid #E8E2D9' }}
                >
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M12 5v14M5 12l7 7 7-7"/>
                  </svg>
                </div>
              </div>
              <span className="text-xs text-stone-400 flex items-center gap-1.5">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
                </svg>
                1.2k instalaciones
              </span>
            </div>
          </div>

          {/* Card: Visibilidad */}
          <div
            className="flex-1 rounded-xl p-5 flex flex-col gap-4 bg-white"
            style={{ border: '1px solid #E8E2D9' }}
          >
            <p className="text-sm text-stone-700 leading-relaxed">
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
            href="/submit"
            className="bg-orange-600 text-white px-7 py-2.5 rounded-xl font-bold text-sm hover:bg-orange-700 transition-colors shadow-sm"
          >
            Publicar MCP
          </Link>
          <Link
            href="/docs"
            className="border border-stone-300 bg-white text-stone-700 px-7 py-2.5 rounded-xl font-bold text-sm hover:bg-stone-50 transition-colors"
          >
            Documentación
          </Link>
        </div>

      </div>
    </section>
  )
}
