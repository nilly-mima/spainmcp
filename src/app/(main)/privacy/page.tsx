'use client'

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-10 pb-16">

      {/* Title */}
      <div className="flex flex-col gap-3">
        <h1 className="text-4xl font-bold text-stone-900 dark:text-stone-100 tracking-tight">
          Aviso de Privacidad de SpainMCP
        </h1>
        <p className="text-sm text-stone-400 dark:text-stone-500">
          Ultima actualizacion: 7 de abril de 2026
        </p>
      </div>

      {/* Intro */}
      <section className="flex flex-col gap-4 text-stone-600 dark:text-stone-400 leading-relaxed">
        <p>
          SpainMCP (<a href="https://mcp.lat" className="underline underline-offset-2 hover:text-stone-900 dark:hover:text-stone-200 transition-colors">mcp.lat</a>) es una plataforma que permite a desarrolladores descubrir, conectar y gestionar servidores MCP (Model Context Protocol) para agentes de inteligencia artificial. Operamos como directorio y gateway de servidores MCP en español, orientado a Espana y Latinoamerica.
        </p>
        <p>
          Este Aviso de Privacidad describe como recopilamos, utilizamos, compartimos y protegemos tus datos personales cuando utilizas nuestra plataforma, de conformidad con el Reglamento General de Proteccion de Datos (RGPD/GDPR) y la Ley Organica 3/2018 de Proteccion de Datos Personales y garantia de los derechos digitales (LOPDGDD).
        </p>
        <p>
          Al acceder o utilizar SpainMCP, aceptas las practicas descritas en este aviso. Si no estas de acuerdo, te rogamos que no utilices nuestros servicios.
        </p>
      </section>

      {/* Sections */}

      {/* 1. Responsable del tratamiento */}
      <section className="flex flex-col gap-4">
        <h2 className="text-2xl font-semibold text-stone-900 dark:text-stone-100">
          1. Nuestro rol en el tratamiento de datos personales
        </h2>
        <div className="text-stone-600 dark:text-stone-400 leading-relaxed flex flex-col gap-3">
          <p>
            SpainMCP actua como <strong className="text-stone-800 dark:text-stone-200">responsable del tratamiento</strong> respecto a los datos personales que recopilamos directamente de ti al crear una cuenta, utilizar nuestra plataforma o comunicarte con nosotros.
          </p>
          <p>
            Cuando facilitas conexiones a servidores MCP de terceros a traves de nuestra plataforma, actuamos como <strong className="text-stone-800 dark:text-stone-200">encargados del tratamiento</strong> en relacion con los datos que transitan por nuestro gateway, procesandolos unicamente segun las instrucciones necesarias para prestar el servicio.
          </p>
          <p>
            En ambos casos, aplicamos las medidas tecnicas y organizativas adecuadas para garantizar la seguridad de tus datos conforme al articulo 32 del RGPD.
          </p>
        </div>
      </section>

      {/* 2. Recopilacion y uso */}
      <section className="flex flex-col gap-4">
        <h2 className="text-2xl font-semibold text-stone-900 dark:text-stone-100">
          2. Recopilacion y uso de datos personales
        </h2>
        <p className="text-stone-600 dark:text-stone-400 leading-relaxed">
          Recopilamos datos personales de tres fuentes principales: los que tu nos proporcionas directamente, los que obtenemos automaticamente cuando usas la plataforma, y los que recibimos de fuentes externas autorizadas. A continuacion detallamos cada categoria.
        </p>
      </section>

      {/* 2a. Datos proporcionados */}
      <section className="flex flex-col gap-4">
        <h3 className="text-xl font-semibold text-stone-800 dark:text-stone-200">
          2.1 Datos proporcionados directamente por el usuario
        </h3>
        <ul className="list-disc pl-6 text-stone-600 dark:text-stone-400 leading-relaxed flex flex-col gap-2">
          <li>
            <strong className="text-stone-800 dark:text-stone-200">Datos de contacto:</strong> direccion de correo electronico utilizada para crear tu cuenta o contactarnos.
          </li>
          <li>
            <strong className="text-stone-800 dark:text-stone-200">Informacion de cuenta:</strong> nombre de usuario, preferencias de configuracion y claves API generadas dentro de la plataforma.
          </li>
          <li>
            <strong className="text-stone-800 dark:text-stone-200">Contenido del usuario:</strong> servidores MCP publicados, configuraciones de conexion y cualquier contenido que subas a tu espacio de trabajo.
          </li>
          <li>
            <strong className="text-stone-800 dark:text-stone-200">Datos de pago:</strong> cuando te suscribes a un plan de pago, los datos de facturacion se procesan a traves de Stripe. SpainMCP no almacena numeros de tarjeta ni datos financieros sensibles en sus servidores.
          </li>
          <li>
            <strong className="text-stone-800 dark:text-stone-200">Comentarios y soporte:</strong> cualquier mensaje, feedback o consulta que nos envies a traves de formularios de contacto o correo electronico.
          </li>
        </ul>
      </section>

      {/* 2b. Datos automaticos */}
      <section className="flex flex-col gap-4">
        <h3 className="text-xl font-semibold text-stone-800 dark:text-stone-200">
          2.2 Datos recopilados automaticamente
        </h3>
        <ul className="list-disc pl-6 text-stone-600 dark:text-stone-400 leading-relaxed flex flex-col gap-2">
          <li>
            <strong className="text-stone-800 dark:text-stone-200">Cookies y tecnologias similares:</strong> utilizamos cookies esenciales para el funcionamiento de la plataforma y cookies analiticas para entender como se usa el servicio. Puedes gestionar tus preferencias de cookies desde tu navegador.
          </li>
          <li>
            <strong className="text-stone-800 dark:text-stone-200">Datos del dispositivo:</strong> tipo de navegador, sistema operativo, resolucion de pantalla e identificadores del dispositivo.
          </li>
          <li>
            <strong className="text-stone-800 dark:text-stone-200">Datos de uso:</strong> paginas visitadas, funciones utilizadas, frecuencia de acceso, llamadas RPC realizadas a servidores MCP y patrones de navegacion dentro de la plataforma.
          </li>
          <li>
            <strong className="text-stone-800 dark:text-stone-200">Datos de ubicacion aproximada:</strong> derivados de tu direccion IP para fines de seguridad y para ofrecer contenido relevante a tu region.
          </li>
        </ul>
      </section>

      {/* 2c. Datos de terceros */}
      <section className="flex flex-col gap-4">
        <h3 className="text-xl font-semibold text-stone-800 dark:text-stone-200">
          2.3 Datos obtenidos de fuentes externas
        </h3>
        <ul className="list-disc pl-6 text-stone-600 dark:text-stone-400 leading-relaxed flex flex-col gap-2">
          <li>
            <strong className="text-stone-800 dark:text-stone-200">Google OAuth:</strong> si inicias sesion con tu cuenta de Google, recibimos tu nombre, direccion de correo electronico y foto de perfil, segun los permisos que otorgues.
          </li>
          <li>
            <strong className="text-stone-800 dark:text-stone-200">GitHub:</strong> si vinculas tu cuenta de GitHub, podemos acceder a tu nombre de usuario publico y direccion de correo asociada para facilitar la publicacion de servidores MCP.
          </li>
          <li>
            <strong className="text-stone-800 dark:text-stone-200">Otros proveedores de identidad:</strong> si en el futuro habilitamos otros metodos de inicio de sesion social, la informacion recibida se limitara a los datos de perfil basicos necesarios para la autenticacion.
          </li>
        </ul>
      </section>

      {/* 3. Divulgacion */}
      <section className="flex flex-col gap-4">
        <h2 className="text-2xl font-semibold text-stone-900 dark:text-stone-100">
          3. Divulgacion de datos personales
        </h2>
        <p className="text-stone-600 dark:text-stone-400 leading-relaxed">
          No vendemos tus datos personales. Podemos compartirlos en las siguientes circunstancias:
        </p>
        <ul className="list-disc pl-6 text-stone-600 dark:text-stone-400 leading-relaxed flex flex-col gap-2">
          <li>
            <strong className="text-stone-800 dark:text-stone-200">Proveedores de servicios:</strong> compartimos datos con terceros que nos ayudan a operar la plataforma, incluyendo Supabase (base de datos y autenticacion), Vercel (alojamiento y despliegue), Stripe (procesamiento de pagos) y Resend (envio de correos transaccionales). Todos ellos actuan como encargados del tratamiento bajo acuerdos contractuales conformes al RGPD.
          </li>
          <li>
            <strong className="text-stone-800 dark:text-stone-200">Servidores MCP de terceros:</strong> cuando conectas con un servidor MCP externo a traves de nuestra plataforma, los datos necesarios para la conexion (como tokens de autenticacion) se transmiten al proveedor de dicho servidor.
          </li>
          <li>
            <strong className="text-stone-800 dark:text-stone-200">Obligaciones legales:</strong> podemos divulgar datos cuando sea necesario para cumplir con una obligacion legal, responder a un requerimiento judicial o proteger nuestros derechos legitimos conforme a la legislacion aplicable.
          </li>
          <li>
            <strong className="text-stone-800 dark:text-stone-200">Operaciones corporativas:</strong> en caso de fusion, adquisicion o venta de activos, tus datos podrian transferirse como parte de dicha operacion, siempre con las garantias adecuadas.
          </li>
        </ul>
      </section>

      {/* 4. Derechos */}
      <section className="flex flex-col gap-4">
        <h2 className="text-2xl font-semibold text-stone-900 dark:text-stone-100">
          4. Tus derechos de privacidad bajo el RGPD
        </h2>
        <p className="text-stone-600 dark:text-stone-400 leading-relaxed">
          Como usuario situado en el Espacio Economico Europeo, tienes los siguientes derechos respecto a tus datos personales:
        </p>
        <ul className="list-disc pl-6 text-stone-600 dark:text-stone-400 leading-relaxed flex flex-col gap-2">
          <li>
            <strong className="text-stone-800 dark:text-stone-200">Acceso:</strong> solicitar una copia de los datos personales que mantenemos sobre ti.
          </li>
          <li>
            <strong className="text-stone-800 dark:text-stone-200">Rectificacion:</strong> corregir datos inexactos o incompletos.
          </li>
          <li>
            <strong className="text-stone-800 dark:text-stone-200">Supresion:</strong> solicitar la eliminacion de tus datos personales cuando ya no sean necesarios para la finalidad para la que fueron recogidos.
          </li>
          <li>
            <strong className="text-stone-800 dark:text-stone-200">Portabilidad:</strong> recibir tus datos en un formato estructurado, de uso comun y lectura mecanica, y transmitirlos a otro responsable.
          </li>
          <li>
            <strong className="text-stone-800 dark:text-stone-200">Oposicion:</strong> oponerte al tratamiento de tus datos cuando este se base en nuestro interes legitimo.
          </li>
          <li>
            <strong className="text-stone-800 dark:text-stone-200">Limitacion:</strong> solicitar la restriccion del tratamiento en determinadas circunstancias, por ejemplo mientras se resuelve una reclamacion de rectificacion.
          </li>
          <li>
            <strong className="text-stone-800 dark:text-stone-200">Retirada del consentimiento:</strong> cuando el tratamiento se base en tu consentimiento, puedes retirarlo en cualquier momento sin que ello afecte a la licitud del tratamiento previo.
          </li>
        </ul>
        <p className="text-stone-600 dark:text-stone-400 leading-relaxed">
          Para ejercer cualquiera de estos derechos, escribenos a{' '}
          <a href="mailto:contacto@spainmcp.com" className="underline underline-offset-2 hover:text-stone-900 dark:hover:text-stone-200 transition-colors">contacto@spainmcp.com</a>.
          Responderemos a tu solicitud en un plazo maximo de 30 dias. Tambien tienes derecho a presentar una reclamacion ante la Agencia Espanola de Proteccion de Datos (AEPD) si consideras que el tratamiento de tus datos no es conforme a la normativa vigente.
        </p>
      </section>

      {/* 5. Menores */}
      <section className="flex flex-col gap-4">
        <h2 className="text-2xl font-semibold text-stone-900 dark:text-stone-100">
          5. Datos personales de menores
        </h2>
        <p className="text-stone-600 dark:text-stone-400 leading-relaxed">
          SpainMCP no esta dirigido a menores de 16 anos, conforme al articulo 8 del RGPD y al articulo 7 de la LOPDGDD. No recopilamos intencionadamente datos personales de menores de dicha edad. Si tienes conocimiento de que un menor de 16 anos nos ha proporcionado datos personales, contactanos a{' '}
          <a href="mailto:contacto@spainmcp.com" className="underline underline-offset-2 hover:text-stone-900 dark:hover:text-stone-200 transition-colors">contacto@spainmcp.com</a>{' '}
          para que podamos proceder a su eliminacion.
        </p>
      </section>

      {/* 6. Sitios de terceros */}
      <section className="flex flex-col gap-4">
        <h2 className="text-2xl font-semibold text-stone-900 dark:text-stone-100">
          6. Sitios web y servicios de terceros
        </h2>
        <p className="text-stone-600 dark:text-stone-400 leading-relaxed">
          Nuestra plataforma puede contener enlaces a sitios web o servicios de terceros, como los propios servidores MCP listados en nuestro directorio. Este Aviso de Privacidad se aplica unicamente a SpainMCP. Te recomendamos que revises las politicas de privacidad de cualquier servicio externo al que accedas a traves de nuestra plataforma.
        </p>
      </section>

      {/* 7. Transferencias internacionales */}
      <section className="flex flex-col gap-4">
        <h2 className="text-2xl font-semibold text-stone-900 dark:text-stone-100">
          7. Transferencias internacionales de datos
        </h2>
        <div className="text-stone-600 dark:text-stone-400 leading-relaxed flex flex-col gap-3">
          <p>
            Nos esforzamos por mantener tus datos dentro del Espacio Economico Europeo siempre que sea posible. Nuestra base de datos principal esta alojada en Supabase con infraestructura en Frankfurt (Alemania).
          </p>
          <p>
            Sin embargo, algunos de nuestros proveedores de servicios pueden procesar datos fuera del EEE, particularmente en Estados Unidos. En dichos casos, nos aseguramos de que existan garantias adecuadas conforme al Capitulo V del RGPD, tales como clausulas contractuales tipo aprobadas por la Comision Europea o la adhesion del destinatario al EU-US Data Privacy Framework.
          </p>
          <p>
            Los proveedores relevantes incluyen: Vercel (alojamiento, EE.UU. con clausulas tipo), Stripe (pagos, certificado DPF) y Resend (correo transaccional, EE.UU. con clausulas tipo).
          </p>
        </div>
      </section>

      {/* 8. Conservacion */}
      <section className="flex flex-col gap-4">
        <h2 className="text-2xl font-semibold text-stone-900 dark:text-stone-100">
          8. Conservacion de datos
        </h2>
        <p className="text-stone-600 dark:text-stone-400 leading-relaxed">
          Conservamos tus datos personales mientras mantengas una cuenta activa en SpainMCP o mientras sea necesario para prestarte nuestros servicios. Si eliminas tu cuenta, procederemos a borrar o anonimizar tus datos personales en un plazo razonable, salvo que estemos obligados a conservarlos por motivos legales, contables o de seguridad. Los registros de uso anonimizados podran conservarse con fines estadisticos sin limite temporal.
        </p>
      </section>

      {/* 9. Actualizaciones */}
      <section className="flex flex-col gap-4">
        <h2 className="text-2xl font-semibold text-stone-900 dark:text-stone-100">
          9. Actualizaciones de este aviso
        </h2>
        <p className="text-stone-600 dark:text-stone-400 leading-relaxed">
          Podemos actualizar este Aviso de Privacidad periodicamente para reflejar cambios en nuestras practicas o en la legislacion aplicable. Cuando realicemos cambios sustanciales, te notificaremos a traves de un aviso en la plataforma o por correo electronico. La fecha de la ultima actualizacion aparece al principio de este documento.
        </p>
      </section>

      {/* 10. Contacto */}
      <section className="flex flex-col gap-4">
        <h2 className="text-2xl font-semibold text-stone-900 dark:text-stone-100">
          10. Contacto
        </h2>
        <div className="text-stone-600 dark:text-stone-400 leading-relaxed flex flex-col gap-3">
          <p>
            Si tienes preguntas sobre este Aviso de Privacidad o sobre el tratamiento de tus datos personales, puedes contactarnos en:
          </p>
          <div className="rounded-xl p-5 bg-white dark:bg-[var(--card)] flex flex-col gap-2" style={{ border: '1px solid var(--border)' }}>
            <p className="font-medium text-stone-800 dark:text-stone-200">SpainMCP</p>
            <p>
              Correo:{' '}
              <a href="mailto:contacto@spainmcp.com" className="underline underline-offset-2 hover:text-stone-900 dark:hover:text-stone-200 transition-colors">contacto@spainmcp.com</a>
            </p>
            <p>
              Web:{' '}
              <a href="https://mcp.lat" className="underline underline-offset-2 hover:text-stone-900 dark:hover:text-stone-200 transition-colors">mcp.lat</a>
            </p>
          </div>
          <p>
            Tambien puedes dirigirte a la Agencia Espanola de Proteccion de Datos (AEPD) en{' '}
            <a href="https://www.aepd.es" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-stone-900 dark:hover:text-stone-200 transition-colors">www.aepd.es</a>{' '}
            si consideras que tus derechos no han sido debidamente atendidos.
          </p>
        </div>
      </section>

    </div>
  )
}
