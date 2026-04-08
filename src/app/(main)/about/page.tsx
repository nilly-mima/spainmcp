export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold text-[var(--foreground)] mb-3">Acerca de SpainMCP</h1>
      <p className="text-sm text-[var(--muted)] mb-10">El directorio MCP de referencia para España y Latinoamerica.</p>

      <div className="flex flex-col gap-8 text-[var(--foreground)] text-sm leading-relaxed">
        <section>
          <h2 className="text-lg font-bold mb-2">Que es SpainMCP</h2>
          <p className="text-[var(--muted)]">
            SpainMCP es la plataforma que conecta desarrolladores y empresas con el ecosistema de servidores Model Context Protocol (MCP). Ofrecemos un directorio curado de servidores MCP, herramientas para publicar y distribuir tus propios servidores, documentacion completa en español y una CLI para gestionar conexiones desde la terminal.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold mb-2">Por que existimos</h2>
          <p className="text-[var(--muted)]">
            El protocolo MCP permite a los modelos de IA conectarse con herramientas y datos externos de forma estandarizada. Pero la mayor parte del ecosistema esta en ingles y orientado al mercado estadounidense. SpainMCP nace para cerrar esa brecha: documentacion en español, servidores conectados a APIs españolas (BOE, BORME, INE, AEMET) y soporte para la comunidad hispanohablante.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold mb-2">Que ofrecemos</h2>
          <ul className="text-[var(--muted)] list-disc pl-5 flex flex-col gap-1.5">
            <li><strong>Directorio de MCPs</strong> — Descubre, prueba e instala servidores MCP verificados</li>
            <li><strong>Skills para agentes</strong> — Instrucciones reutilizables que potencian agentes de IA</li>
            <li><strong>Gateway</strong> — Proxy gestionado para conectar clientes con servidores MCP</li>
            <li><strong>Documentacion</strong> — Guias completas en español para desarrolladores y empresas</li>
            <li><strong>CLI</strong> — Herramienta de linea de comandos para gestionar todo desde la terminal</li>
            <li><strong>APIs españolas</strong> — BOE, BORME, INE y AEMET disponibles como herramientas MCP</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold mb-2">Contacto</h2>
          <p className="text-[var(--muted)]">
            Si tienes preguntas, sugerencias o quieres colaborar, escribenos a{' '}
            <a href="mailto:contacto@spainmcp.com" className="text-blue-600 hover:underline">contacto@spainmcp.com</a>
            {' '}o unete a nuestra{' '}
            <a href="https://discord.gg/spainmcp" target="_blank" className="text-blue-600 hover:underline">comunidad de Discord</a>.
          </p>
        </section>
      </div>
    </div>
  )
}
