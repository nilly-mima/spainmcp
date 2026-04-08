export default function LegalPage() {
  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-10 pb-16">

      <div className="flex flex-col gap-3">
        <h1 className="text-4xl font-bold text-stone-900 dark:text-stone-100 tracking-tight">
          Aviso Legal
        </h1>
        <p className="text-sm text-stone-400 dark:text-stone-500">
          En cumplimiento de la Ley 34/2002, de 11 de julio, de Servicios de la Sociedad de la Informacion y de Comercio Electronico (LSSI-CE)
        </p>
      </div>

      <section className="flex flex-col gap-4">
        <h2 className="text-2xl font-semibold text-stone-900 dark:text-stone-100">
          1. Datos identificativos del titular
        </h2>
        <div className="rounded-xl p-5 bg-white dark:bg-[var(--card)] flex flex-col gap-2 text-stone-600 dark:text-stone-400" style={{ border: '1px solid var(--border)' }}>
          <p><strong className="text-stone-800 dark:text-stone-200">Denominacion:</strong> SpainMCP</p>
          <p><strong className="text-stone-800 dark:text-stone-200">Titular:</strong> [Nombre y apellidos — pendiente alta como autonomo]</p>
          <p><strong className="text-stone-800 dark:text-stone-200">NIF:</strong> [NIF — pendiente alta como autonomo]</p>
          <p><strong className="text-stone-800 dark:text-stone-200">Domicilio:</strong> [Direccion — pendiente de publicacion]</p>
          <p><strong className="text-stone-800 dark:text-stone-200">Correo electronico:</strong>{' '}
            <a href="mailto:info@spainmcp.com" className="underline underline-offset-2 hover:text-stone-900 dark:hover:text-stone-200 transition-colors">info@spainmcp.com</a>
          </p>
          <p><strong className="text-stone-800 dark:text-stone-200">Sitio web:</strong>{' '}
            <a href="https://mcp.lat" className="underline underline-offset-2 hover:text-stone-900 dark:hover:text-stone-200 transition-colors">mcp.lat</a>
          </p>
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-2xl font-semibold text-stone-900 dark:text-stone-100">
          2. Actividad
        </h2>
        <p className="text-stone-600 dark:text-stone-400 leading-relaxed">
          SpainMCP es una plataforma de servicios MCP (Model Context Protocol) orientada a desarrolladores, empresas y profesionales de Espana y Latinoamerica. El servicio comprende un directorio de servidores MCP, un gateway de conexion y herramientas de gestion de claves API para la integracion de agentes de inteligencia artificial.
        </p>
        <p className="text-stone-600 dark:text-stone-400 leading-relaxed">
          El protocolo MCP es un estandar abierto desarrollado por Anthropic y cedido a la Linux Foundation bajo licencia Apache 2.0. SpainMCP es un servicio independiente y no esta afiliado a Anthropic, Inc.
        </p>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-2xl font-semibold text-stone-900 dark:text-stone-100">
          3. Condiciones de uso
        </h2>
        <div className="text-stone-600 dark:text-stone-400 leading-relaxed flex flex-col gap-3">
          <p>
            El acceso y uso de SpainMCP implica la aceptacion plena y sin reservas de las presentes condiciones. Si no aceptas estas condiciones, debes abstenerte de utilizar el servicio.
          </p>
          <p>
            El usuario se compromete a hacer un uso adecuado de la plataforma y, en particular, a no:
          </p>
          <ul className="list-disc pl-6 flex flex-col gap-2">
            <li>Realizar acciones que puedan degradar, interrumpir o sobrecargar los sistemas de SpainMCP.</li>
            <li>Publicar servidores MCP que contengan codigo malicioso, que infrinjan derechos de terceros o que sean contrarios a la legalidad vigente.</li>
            <li>Usar la plataforma para actividades fraudulentas, ilegales o que vulneren derechos de terceros.</li>
            <li>Intentar acceder sin autorizacion a cuentas, sistemas o redes relacionadas con SpainMCP.</li>
          </ul>
          <p>
            SpainMCP se reserva el derecho a suspender o cancelar, de forma temporal o definitiva, el acceso de cualquier usuario que incumpla las presentes condiciones, sin necesidad de preaviso y sin que ello genere derecho a indemnizacion alguna.
          </p>
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-2xl font-semibold text-stone-900 dark:text-stone-100">
          4. Propiedad intelectual e industrial
        </h2>
        <div className="text-stone-600 dark:text-stone-400 leading-relaxed flex flex-col gap-3">
          <p>
            La marca SpainMCP, el logotipo, el diseno de la plataforma, los textos originales y el codigo fuente propio son propiedad del titular de SpainMCP y estan protegidos por la legislacion espanola e internacional sobre propiedad intelectual e industrial.
          </p>
          <p>
            Queda prohibida la reproduccion, distribucion, comunicacion publica o transformacion de dichos elementos sin autorizacion expresa y por escrito del titular, salvo que la ley lo permita expresamente.
          </p>
          <p>
            El protocolo MCP y las especificaciones asociadas son propiedad de la Linux Foundation y se distribuyen bajo licencia <strong className="text-stone-800 dark:text-stone-200">Apache 2.0</strong>. Los servidores MCP listados en el directorio son propiedad de sus respectivos autores y estan sujetos a sus propias licencias.
          </p>
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-2xl font-semibold text-stone-900 dark:text-stone-100">
          5. Limitacion de responsabilidad
        </h2>
        <div className="text-stone-600 dark:text-stone-400 leading-relaxed flex flex-col gap-3">
          <p>
            SpainMCP proporciona el servicio en el estado en que se encuentra (<em>as-is</em>), sin garantias de disponibilidad continua, exactitud o adecuacion para un fin concreto. Realizamos esfuerzos razonables para mantener el servicio operativo, pero no podemos garantizar una disponibilidad del 100 %.
          </p>
          <p>
            SpainMCP no es responsable del contenido, calidad, seguridad ni disponibilidad de los servidores MCP de terceros listados o accesibles a traves de la plataforma. El usuario es el unico responsable de evaluar la idoneidad de los servidores MCP que decida utilizar.
          </p>
          <p>
            En la maxima medida permitida por la legislacion aplicable, SpainMCP no sera responsable de danos indirectos, lucro cesante, perdida de datos o cualquier otro dano derivado del uso o la imposibilidad de uso del servicio, incluso si se hubiera advertido de la posibilidad de tales danos.
          </p>
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-2xl font-semibold text-stone-900 dark:text-stone-100">
          6. Legislacion aplicable y jurisdiccion
        </h2>
        <p className="text-stone-600 dark:text-stone-400 leading-relaxed">
          Las presentes condiciones se rigen por la legislacion espanola. Para la resolucion de cualquier controversia derivada del acceso o uso de SpainMCP, las partes se someten, con renuncia expresa a cualquier otro fuero que pudiera corresponderles, a la jurisdiccion de los Juzgados y Tribunales de la ciudad de <strong className="text-stone-800 dark:text-stone-200">Barcelona</strong>.
        </p>
        <p className="text-stone-600 dark:text-stone-400 leading-relaxed">
          En caso de conflicto entre la version en castellano y cualquier traduccion de este Aviso Legal, prevalecera la version en castellano.
        </p>
      </section>

    </div>
  )
}
