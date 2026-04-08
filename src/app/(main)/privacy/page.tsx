export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-10 pb-16">

      <div className="flex flex-col gap-3">
        <h1 className="text-4xl font-bold text-stone-900 dark:text-stone-100 tracking-tight">
          Politica de Privacidad
        </h1>
        <p className="text-sm text-stone-400 dark:text-stone-500">
          Ultima actualizacion: abril de 2026
        </p>
      </div>

      <section className="flex flex-col gap-4 text-stone-600 dark:text-stone-400 leading-relaxed">
        <p>
          SpainMCP (<a href="https://mcp.lat" className="underline underline-offset-2 hover:text-stone-900 dark:hover:text-stone-200 transition-colors">mcp.lat</a>) es una plataforma que permite a desarrolladores descubrir, conectar y gestionar servidores MCP (Model Context Protocol) para agentes de inteligencia artificial. Este documento describe como tratamos tus datos personales, de conformidad con el Reglamento (UE) 2016/679 (RGPD) y la Ley Organica 3/2018 de Proteccion de Datos Personales y garantia de los derechos digitales (LOPDGDD).
        </p>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-2xl font-semibold text-stone-900 dark:text-stone-100">
          1. Responsable del tratamiento
        </h2>
        <div className="rounded-xl p-5 bg-white dark:bg-[var(--card)] flex flex-col gap-2 text-stone-600 dark:text-stone-400" style={{ border: '1px solid var(--border)' }}>
          <p><strong className="text-stone-800 dark:text-stone-200">Denominacion:</strong> SpainMCP</p>
          <p><strong className="text-stone-800 dark:text-stone-200">Forma juridica:</strong> Autonomo (en proceso de alta)</p>
          <p><strong className="text-stone-800 dark:text-stone-200">Correo electronico de privacidad:</strong>{' '}
            <a href="mailto:privacidad@spainmcp.com" className="underline underline-offset-2 hover:text-stone-900 dark:hover:text-stone-200 transition-colors">privacidad@spainmcp.com</a>
          </p>
          <p><strong className="text-stone-800 dark:text-stone-200">Sitio web:</strong>{' '}
            <a href="https://mcp.lat" className="underline underline-offset-2 hover:text-stone-900 dark:hover:text-stone-200 transition-colors">mcp.lat</a>
          </p>
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-2xl font-semibold text-stone-900 dark:text-stone-100">
          2. Datos que recopilamos
        </h2>
        <p className="text-stone-600 dark:text-stone-400 leading-relaxed">
          Recopilamos unicamente los datos necesarios para prestar el servicio:
        </p>
        <ul className="list-disc pl-6 text-stone-600 dark:text-stone-400 leading-relaxed flex flex-col gap-2">
          <li>
            <strong className="text-stone-800 dark:text-stone-200">Correo electronico:</strong> utilizado para la autenticacion (magic link o Google OAuth) y comunicaciones transaccionales.
          </li>
          <li>
            <strong className="text-stone-800 dark:text-stone-200">Claves API:</strong> almacenadas en forma de hash SHA-256. El valor original no se conserva en nuestros servidores tras la generacion.
          </li>
          <li>
            <strong className="text-stone-800 dark:text-stone-200">Tokens OAuth:</strong> cifrados con AES-256 en base de datos. Se utilizan exclusivamente para mantener la sesion activa.
          </li>
          <li>
            <strong className="text-stone-800 dark:text-stone-200">Registros de uso:</strong> nombre de la herramienta MCP invocada, marca de tiempo y duracion de la llamada. No almacenamos el contenido de las respuestas MCP.
          </li>
        </ul>
        <p className="text-stone-600 dark:text-stone-400 leading-relaxed">
          No recopilamos contrasenas (usamos autenticacion sin contrasena), ni el contenido de las respuestas de los servidores MCP, ni datos especialmente protegidos conforme al articulo 9 del RGPD.
        </p>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-2xl font-semibold text-stone-900 dark:text-stone-100">
          3. Finalidades del tratamiento
        </h2>
        <ul className="list-disc pl-6 text-stone-600 dark:text-stone-400 leading-relaxed flex flex-col gap-2">
          <li>
            <strong className="text-stone-800 dark:text-stone-200">Prestacion del servicio:</strong> crear y mantener tu cuenta, autenticarte y permitirte acceder a los servidores MCP conectados.
          </li>
          <li>
            <strong className="text-stone-800 dark:text-stone-200">Autenticacion:</strong> verificar tu identidad mediante magic link o Google OAuth y gestionar sesiones activas.
          </li>
          <li>
            <strong className="text-stone-800 dark:text-stone-200">Analitica de uso:</strong> entender como se utiliza la plataforma de forma agregada para mejorar el servicio y detectar anomalias.
          </li>
          <li>
            <strong className="text-stone-800 dark:text-stone-200">Facturacion:</strong> gestionar suscripciones y el historial de uso cuando aplique un plan de pago.
          </li>
        </ul>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-2xl font-semibold text-stone-900 dark:text-stone-100">
          4. Base juridica del tratamiento
        </h2>
        <ul className="list-disc pl-6 text-stone-600 dark:text-stone-400 leading-relaxed flex flex-col gap-2">
          <li>
            <strong className="text-stone-800 dark:text-stone-200">Ejecucion de un contrato (art. 6.1.b RGPD):</strong> el tratamiento de tu correo electronico, tokens de sesion y claves API es necesario para prestarte el servicio que has solicitado.
          </li>
          <li>
            <strong className="text-stone-800 dark:text-stone-200">Interes legitimo (art. 6.1.f RGPD):</strong> los registros de uso anonimizados y los datos de seguridad se tratan para proteger la integridad de la plataforma y mejorar el servicio. Este interes no prevalece sobre tus derechos y libertades fundamentales.
          </li>
        </ul>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-2xl font-semibold text-stone-900 dark:text-stone-100">
          5. Destinatarios de los datos
        </h2>
        <p className="text-stone-600 dark:text-stone-400 leading-relaxed">
          No vendemos tus datos. Los compartimos exclusivamente con los siguientes encargados del tratamiento, con quienes mantenemos los acuerdos contractuales exigidos por el RGPD:
        </p>
        <ul className="list-disc pl-6 text-stone-600 dark:text-stone-400 leading-relaxed flex flex-col gap-2">
          <li>
            <strong className="text-stone-800 dark:text-stone-200">Supabase Inc. (Frankfurt, UE):</strong> base de datos PostgreSQL y autenticacion. Infraestructura alojada en la region eu-central-1 (Alemania), dentro del Espacio Economico Europeo.
          </li>
          <li>
            <strong className="text-stone-800 dark:text-stone-200">Cloudflare Inc. (global):</strong> red de entrega de contenido y proteccion DDoS. Certificado bajo el EU-US Data Privacy Framework (DPF).
          </li>
          <li>
            <strong className="text-stone-800 dark:text-stone-200">Vercel Inc. (EE.UU.):</strong> alojamiento y despliegue de la aplicacion. Certificado bajo el EU-US Data Privacy Framework (DPF).
          </li>
          <li>
            <strong className="text-stone-800 dark:text-stone-200">Resend Inc. (EE.UU.):</strong> envio de correos transaccionales (magic links). Vinculado mediante Clausulas Contractuales Tipo de la Comision Europea.
          </li>
        </ul>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-2xl font-semibold text-stone-900 dark:text-stone-100">
          6. Transferencias internacionales de datos
        </h2>
        <div className="text-stone-600 dark:text-stone-400 leading-relaxed flex flex-col gap-3">
          <p>
            Nuestra base de datos principal esta alojada en Frankfurt (Alemania), dentro del EEE. Para los proveedores con sede en Estados Unidos (Vercel, Cloudflare, Resend), las transferencias estan amparadas por alguna de las siguientes garantias previstas en el Capitulo V del RGPD:
          </p>
          <ul className="list-disc pl-6 flex flex-col gap-2">
            <li>Adhesion al <strong className="text-stone-800 dark:text-stone-200">EU-US Data Privacy Framework</strong> (Decision de adecuacion de la Comision Europea de julio de 2023) para Vercel y Cloudflare.</li>
            <li><strong className="text-stone-800 dark:text-stone-200">Clausulas Contractuales Tipo</strong> aprobadas por la Comision Europea (Decision 2021/914) para Resend.</li>
          </ul>
          <p>
            Puedes solicitar copia de las garantias aplicables escribiendo a <a href="mailto:privacidad@spainmcp.com" className="underline underline-offset-2 hover:text-stone-900 dark:hover:text-stone-200 transition-colors">privacidad@spainmcp.com</a>.
          </p>
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-2xl font-semibold text-stone-900 dark:text-stone-100">
          7. Plazos de conservacion
        </h2>
        <ul className="list-disc pl-6 text-stone-600 dark:text-stone-400 leading-relaxed flex flex-col gap-2">
          <li>
            <strong className="text-stone-800 dark:text-stone-200">Cuentas de usuario:</strong> hasta que solicites la eliminacion de tu cuenta. Tras la solicitud, los datos se borran o anonimizan en un plazo maximo de 30 dias, salvo obligacion legal de conservacion.
          </li>
          <li>
            <strong className="text-stone-800 dark:text-stone-200">Tokens OAuth:</strong> hasta que revoques el acceso o cierres tu cuenta.
          </li>
          <li>
            <strong className="text-stone-800 dark:text-stone-200">Registros de uso:</strong> 90 dias. Transcurrido ese plazo se eliminan automaticamente.
          </li>
          <li>
            <strong className="text-stone-800 dark:text-stone-200">Claves API:</strong> hasta que las regeneres o elimines tu cuenta. Los hashes anteriores se borran al regenerar.
          </li>
        </ul>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-2xl font-semibold text-stone-900 dark:text-stone-100">
          8. Tus derechos como interesado
        </h2>
        <p className="text-stone-600 dark:text-stone-400 leading-relaxed">
          Conforme al RGPD, tienes los siguientes derechos respecto a tus datos personales:
        </p>
        <ul className="list-disc pl-6 text-stone-600 dark:text-stone-400 leading-relaxed flex flex-col gap-2">
          <li><strong className="text-stone-800 dark:text-stone-200">Acceso (art. 15):</strong> obtener confirmacion de si tratamos tus datos y, en su caso, acceder a ellos.</li>
          <li><strong className="text-stone-800 dark:text-stone-200">Rectificacion (art. 16):</strong> corregir datos inexactos o incompletos.</li>
          <li><strong className="text-stone-800 dark:text-stone-200">Supresion (art. 17):</strong> solicitar el borrado de tus datos cuando ya no sean necesarios o retires el consentimiento.</li>
          <li><strong className="text-stone-800 dark:text-stone-200">Portabilidad (art. 20):</strong> recibir tus datos en formato estructurado y de lectura mecanica, o solicitar que se transmitan a otro responsable.</li>
          <li><strong className="text-stone-800 dark:text-stone-200">Limitacion del tratamiento (art. 18):</strong> solicitar la restriccion del tratamiento mientras se resuelve una impugnacion de exactitud o una reclamacion.</li>
          <li><strong className="text-stone-800 dark:text-stone-200">Oposicion (art. 21):</strong> oponerte al tratamiento basado en interes legitimo por motivos relacionados con tu situacion particular.</li>
        </ul>
        <p className="text-stone-600 dark:text-stone-400 leading-relaxed">
          Para ejercer cualquiera de estos derechos, envia un correo a{' '}
          <a href="mailto:privacidad@spainmcp.com" className="underline underline-offset-2 hover:text-stone-900 dark:hover:text-stone-200 transition-colors">privacidad@spainmcp.com</a>{' '}
          indicando el derecho que deseas ejercer y adjuntando una copia de tu documento de identidad. Responderemos en un plazo maximo de 30 dias desde la recepcion de la solicitud, prorrogable dos meses adicionales en casos complejos con notificacion previa.
        </p>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-2xl font-semibold text-stone-900 dark:text-stone-100">
          9. Derecho a reclamar ante la autoridad de control
        </h2>
        <p className="text-stone-600 dark:text-stone-400 leading-relaxed">
          Si consideras que el tratamiento de tus datos personales infringe el RGPD o la LOPDGDD, tienes derecho a presentar una reclamacion ante la autoridad de control competente. En Espana, la autoridad de control es la Agencia Espanola de Proteccion de Datos (AEPD):
        </p>
        <div className="rounded-xl p-5 bg-white dark:bg-[var(--card)] flex flex-col gap-2 text-stone-600 dark:text-stone-400" style={{ border: '1px solid var(--border)' }}>
          <p><strong className="text-stone-800 dark:text-stone-200">Agencia Espanola de Proteccion de Datos (AEPD)</strong></p>
          <p>C/ Jorge Juan, 6 — 28001 Madrid</p>
          <p>
            <a href="https://www.aepd.es" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-stone-900 dark:hover:text-stone-200 transition-colors">www.aepd.es</a>
          </p>
        </div>
        <p className="text-stone-600 dark:text-stone-400 leading-relaxed">
          Antes de acudir a la AEPD, te invitamos a contactarnos directamente en <a href="mailto:privacidad@spainmcp.com" className="underline underline-offset-2 hover:text-stone-900 dark:hover:text-stone-200 transition-colors">privacidad@spainmcp.com</a> para intentar resolver la incidencia.
        </p>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-2xl font-semibold text-stone-900 dark:text-stone-100">
          10. Cookies
        </h2>
        <p className="text-stone-600 dark:text-stone-400 leading-relaxed">
          SpainMCP utiliza exclusivamente <strong className="text-stone-800 dark:text-stone-200">cookies de sesion</strong> necesarias para la autenticacion y el mantenimiento de la sesion del usuario. Estas cookies estan exentas de consentimiento previo conforme al articulo 22.2 de la LSSI y al considerando 25 de la Directiva ePrivacy, al ser estrictamente necesarias para la prestacion del servicio solicitado.
        </p>
        <p className="text-stone-600 dark:text-stone-400 leading-relaxed">
          No utilizamos cookies de seguimiento, publicidad ni analitica de terceros. No se instala ninguna cookie de terceros al navegar por la plataforma.
        </p>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-2xl font-semibold text-stone-900 dark:text-stone-100">
          11. Modificaciones de esta politica
        </h2>
        <p className="text-stone-600 dark:text-stone-400 leading-relaxed">
          Podemos actualizar esta Politica de Privacidad para reflejar cambios en nuestras practicas, en los servicios que ofrecemos o en la legislacion aplicable. Cuando los cambios sean sustanciales, te notificaremos mediante un aviso visible en la plataforma o por correo electronico con al menos 15 dias de antelacion. La fecha de la ultima revision aparece al inicio de este documento.
        </p>
        <p className="text-stone-600 dark:text-stone-400 leading-relaxed">
          El uso continuado de SpainMCP tras la entrada en vigor de la nueva version implica la aceptacion de los cambios. Si no estas de acuerdo, puedes eliminar tu cuenta enviando un correo a <a href="mailto:privacidad@spainmcp.com" className="underline underline-offset-2 hover:text-stone-900 dark:hover:text-stone-200 transition-colors">privacidad@spainmcp.com</a>.
        </p>
      </section>

    </div>
  )
}
