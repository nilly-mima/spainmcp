export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-10 pb-16">

      <div className="flex flex-col gap-3">
        <h1 className="text-4xl font-bold text-stone-900 dark:text-stone-100 tracking-tight">
          Política de Privacidad
        </h1>
        <p className="text-sm text-stone-400 dark:text-stone-500">
          Última actualización: abril de 2026
        </p>
      </div>

      <section className="flex flex-col gap-4 text-stone-600 dark:text-stone-400 leading-relaxed">
        <p>
          SpainMCP (<a href="https://mcp.lat" className="underline underline-offset-2 hover:text-stone-900 dark:hover:text-stone-200 transition-colors">mcp.lat</a>) es una plataforma que permite a desarrolladores descubrir, conectar y gestionar servidores MCP (Model Context Protocol) para agentes de inteligencia artificial. Este documento describe cómo tratamos tus datos personales, de conformidad con el Reglamento (UE) 2016/679 (RGPD) y la Ley Orgánica 3/2018 de Protección de Datos Personales y garantía de los derechos digitales (LOPDGDD).
        </p>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-2xl font-semibold text-stone-900 dark:text-stone-100">
          1. Responsable del tratamiento
        </h2>
        <div className="rounded-xl p-5 bg-white dark:bg-[var(--card)] flex flex-col gap-2 text-stone-600 dark:text-stone-400" style={{ border: '1px solid var(--border)' }}>
          <p><strong className="text-stone-800 dark:text-stone-200">Denominación:</strong> SpainMCP</p>
          <p><strong className="text-stone-800 dark:text-stone-200">Forma jurídica:</strong> Autónomo (en proceso de alta)</p>
          <p><strong className="text-stone-800 dark:text-stone-200">Correo electrónico de privacidad:</strong>{' '}
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
          Recopilamos únicamente los datos necesarios para prestar el servicio:
        </p>
        <ul className="list-disc pl-6 text-stone-600 dark:text-stone-400 leading-relaxed flex flex-col gap-2">
          <li>
            <strong className="text-stone-800 dark:text-stone-200">Correo electrónico:</strong> utilizado para la autenticación (magic link o Google OAuth) y comunicaciones transaccionales.
          </li>
          <li>
            <strong className="text-stone-800 dark:text-stone-200">Claves API:</strong> almacenadas en forma de hash SHA-256. El valor original no se conserva en nuestros servidores tras la generación.
          </li>
          <li>
            <strong className="text-stone-800 dark:text-stone-200">Tokens OAuth:</strong> cifrados con AES-256 en base de datos. Se utilizan exclusivamente para mantener la sesión activa.
          </li>
          <li>
            <strong className="text-stone-800 dark:text-stone-200">Registros de uso:</strong> nombre de la herramienta MCP invocada, marca de tiempo y duración de la llamada. No almacenamos el contenido de las respuestas MCP.
          </li>
        </ul>
        <p className="text-stone-600 dark:text-stone-400 leading-relaxed">
          No recopilamos contraseñas (usamos autenticación sin contraseña), ni el contenido de las respuestas de los servidores MCP, ni datos especialmente protegidos conforme al artículo 9 del RGPD.
        </p>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-2xl font-semibold text-stone-900 dark:text-stone-100">
          3. Finalidades del tratamiento
        </h2>
        <ul className="list-disc pl-6 text-stone-600 dark:text-stone-400 leading-relaxed flex flex-col gap-2">
          <li>
            <strong className="text-stone-800 dark:text-stone-200">Prestación del servicio:</strong> crear y mantener tu cuenta, autenticarte y permitirte acceder a los servidores MCP conectados.
          </li>
          <li>
            <strong className="text-stone-800 dark:text-stone-200">Autenticación:</strong> verificar tu identidad mediante magic link o Google OAuth y gestionar sesiones activas.
          </li>
          <li>
            <strong className="text-stone-800 dark:text-stone-200">Analítica de uso:</strong> entender cómo se utiliza la plataforma de forma agregada para mejorar el servicio y detectar anomalías.
          </li>
          <li>
            <strong className="text-stone-800 dark:text-stone-200">Facturación:</strong> gestionar suscripciones y el historial de uso cuando aplique un plan de pago.
          </li>
        </ul>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-2xl font-semibold text-stone-900 dark:text-stone-100">
          4. Base jurídica del tratamiento
        </h2>
        <ul className="list-disc pl-6 text-stone-600 dark:text-stone-400 leading-relaxed flex flex-col gap-2">
          <li>
            <strong className="text-stone-800 dark:text-stone-200">Ejecución de un contrato (art. 6.1.b RGPD):</strong> el tratamiento de tu correo electrónico, tokens de sesión y claves API es necesario para prestarte el servicio que has solicitado.
          </li>
          <li>
            <strong className="text-stone-800 dark:text-stone-200">Interés legítimo (art. 6.1.f RGPD):</strong> los registros de uso anonimizados y los datos de seguridad se tratan para proteger la integridad de la plataforma y mejorar el servicio. Este interés no prevalece sobre tus derechos y libertades fundamentales.
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
            <strong className="text-stone-800 dark:text-stone-200">Supabase Inc. (Frankfurt, UE):</strong> base de datos PostgreSQL y autenticación. Infraestructura alojada en la región eu-central-1 (Alemania), dentro del Espacio Económico Europeo.
          </li>
          <li>
            <strong className="text-stone-800 dark:text-stone-200">Cloudflare Inc. (global):</strong> red de entrega de contenido y protección DDoS. Certificado bajo el EU-US Data Privacy Framework (DPF).
          </li>
          <li>
            <strong className="text-stone-800 dark:text-stone-200">Vercel Inc. (EE.UU.):</strong> alojamiento y despliegue de la aplicación. Certificado bajo el EU-US Data Privacy Framework (DPF).
          </li>
          <li>
            <strong className="text-stone-800 dark:text-stone-200">Resend Inc. (EE.UU.):</strong> envío de correos transaccionales (magic links). Vinculado mediante Cláusulas Contractuales Tipo de la Comisión Europea.
          </li>
        </ul>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-2xl font-semibold text-stone-900 dark:text-stone-100">
          6. Transferencias internacionales de datos
        </h2>
        <div className="text-stone-600 dark:text-stone-400 leading-relaxed flex flex-col gap-3">
          <p>
            Nuestra base de datos principal está alojada en Frankfurt (Alemania), dentro del EEE. Para los proveedores con sede en Estados Unidos (Vercel, Cloudflare, Resend), las transferencias están amparadas por alguna de las siguientes garantías previstas en el Capítulo V del RGPD:
          </p>
          <ul className="list-disc pl-6 flex flex-col gap-2">
            <li>Adhesión al <strong className="text-stone-800 dark:text-stone-200">EU-US Data Privacy Framework</strong> (Decisión de adecuación de la Comisión Europea de julio de 2023) para Vercel y Cloudflare.</li>
            <li><strong className="text-stone-800 dark:text-stone-200">Cláusulas Contractuales Tipo</strong> aprobadas por la Comisión Europea (Decisión 2021/914) para Resend.</li>
          </ul>
          <p>
            Puedes solicitar copia de las garantías aplicables escribiendo a <a href="mailto:privacidad@spainmcp.com" className="underline underline-offset-2 hover:text-stone-900 dark:hover:text-stone-200 transition-colors">privacidad@spainmcp.com</a>.
          </p>
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-2xl font-semibold text-stone-900 dark:text-stone-100">
          7. Plazos de conservación
        </h2>
        <ul className="list-disc pl-6 text-stone-600 dark:text-stone-400 leading-relaxed flex flex-col gap-2">
          <li>
            <strong className="text-stone-800 dark:text-stone-200">Cuentas de usuario:</strong> hasta que solicites la eliminación de tu cuenta. Tras la solicitud, los datos se borran o anonimizan en un plazo máximo de 30 días, salvo obligación legal de conservación.
          </li>
          <li>
            <strong className="text-stone-800 dark:text-stone-200">Tokens OAuth:</strong> hasta que revoques el acceso o cierres tu cuenta.
          </li>
          <li>
            <strong className="text-stone-800 dark:text-stone-200">Registros de uso:</strong> 90 días. Transcurrido ese plazo se eliminan automáticamente.
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
          <li><strong className="text-stone-800 dark:text-stone-200">Acceso (art. 15):</strong> obtener confirmación de si tratamos tus datos y, en su caso, acceder a ellos.</li>
          <li><strong className="text-stone-800 dark:text-stone-200">Rectificación (art. 16):</strong> corregir datos inexactos o incompletos.</li>
          <li><strong className="text-stone-800 dark:text-stone-200">Supresión (art. 17):</strong> solicitar el borrado de tus datos cuando ya no sean necesarios o retires el consentimiento.</li>
          <li><strong className="text-stone-800 dark:text-stone-200">Portabilidad (art. 20):</strong> recibir tus datos en formato estructurado y de lectura mecánica, o solicitar que se transmitan a otro responsable.</li>
          <li><strong className="text-stone-800 dark:text-stone-200">Limitación del tratamiento (art. 18):</strong> solicitar la restricción del tratamiento mientras se resuelve una impugnación de exactitud o una reclamación.</li>
          <li><strong className="text-stone-800 dark:text-stone-200">Oposición (art. 21):</strong> oponerte al tratamiento basado en interés legítimo por motivos relacionados con tu situación particular.</li>
        </ul>
        <p className="text-stone-600 dark:text-stone-400 leading-relaxed">
          Para ejercer cualquiera de estos derechos, envía un correo a{' '}
          <a href="mailto:privacidad@spainmcp.com" className="underline underline-offset-2 hover:text-stone-900 dark:hover:text-stone-200 transition-colors">privacidad@spainmcp.com</a>{' '}
          indicando el derecho que deseas ejercer y adjuntando una copia de tu documento de identidad. Responderemos en un plazo máximo de 30 días desde la recepción de la solicitud, prorrogable dos meses adicionales en casos complejos con notificación previa.
        </p>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-2xl font-semibold text-stone-900 dark:text-stone-100">
          9. Derecho a reclamar ante la autoridad de control
        </h2>
        <p className="text-stone-600 dark:text-stone-400 leading-relaxed">
          Si consideras que el tratamiento de tus datos personales infringe el RGPD o la LOPDGDD, tienes derecho a presentar una reclamación ante la autoridad de control competente. En España, la autoridad de control es la Agencia Española de Protección de Datos (AEPD):
        </p>
        <div className="rounded-xl p-5 bg-white dark:bg-[var(--card)] flex flex-col gap-2 text-stone-600 dark:text-stone-400" style={{ border: '1px solid var(--border)' }}>
          <p><strong className="text-stone-800 dark:text-stone-200">Agencia Española de Protección de Datos (AEPD)</strong></p>
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
          SpainMCP utiliza exclusivamente <strong className="text-stone-800 dark:text-stone-200">cookies de sesión</strong> necesarias para la autenticación y el mantenimiento de la sesión del usuario. Estas cookies están exentas de consentimiento previo conforme al artículo 22.2 de la LSSI y al considerando 25 de la Directiva ePrivacy, al ser estrictamente necesarias para la prestación del servicio solicitado.
        </p>
        <p className="text-stone-600 dark:text-stone-400 leading-relaxed">
          No utilizamos cookies de seguimiento, publicidad ni analítica de terceros. No se instala ninguna cookie de terceros al navegar por la plataforma.
        </p>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-2xl font-semibold text-stone-900 dark:text-stone-100">
          11. Modificaciones de esta política
        </h2>
        <p className="text-stone-600 dark:text-stone-400 leading-relaxed">
          Podemos actualizar esta Política de Privacidad para reflejar cambios en nuestras prácticas, en los servicios que ofrecemos o en la legislación aplicable. Cuando los cambios sean sustanciales, te notificaremos mediante un aviso visible en la plataforma o por correo electrónico con al menos 15 días de antelación. La fecha de la última revisión aparece al inicio de este documento.
        </p>
        <p className="text-stone-600 dark:text-stone-400 leading-relaxed">
          El uso continuado de SpainMCP tras la entrada en vigor de la nueva versión implica la aceptación de los cambios. Si no estás de acuerdo, puedes eliminar tu cuenta enviando un correo a <a href="mailto:privacidad@spainmcp.com" className="underline underline-offset-2 hover:text-stone-900 dark:hover:text-stone-200 transition-colors">privacidad@spainmcp.com</a>.
        </p>
      </section>

    </div>
  )
}
