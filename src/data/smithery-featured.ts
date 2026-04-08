export type SmitheryItem = {
  nombre: string
  slug: string
  descripcion_en: string
  scope: 'remote' | 'local'
  downloads: string
  icon_url: string
}

export const smitheryRow1: SmitheryItem[] = [
  {
    nombre: 'Instagram',
    slug: 'instagram',
    descripcion_en: 'Plataforma de redes sociales para compartir fotos, vídeos y stories. Solo compatible con cuentas Business y Creator de Instagram.',
    scope: 'remote',
    downloads: '442.77k',
    icon_url: 'https://cdn.jsdelivr.net/gh/ComposioHQ/open-logos@master/instagram.svg',
  },
  {
    nombre: 'Google Sheets',
    slug: 'googlesheets',
    descripcion_en: 'Lee, escribe y formatea datos en hojas de cálculo. Gestiona hojas, ejecuta fórmulas y colabora en datos estructurados en tiempo real.',
    scope: 'remote',
    downloads: '55.61k',
    icon_url: 'https://logos.composio.dev/api/googlesheets',
  },
  {
    nombre: 'AgentMail',
    slug: 'agentmail',
    descripcion_en: 'API de bandeja de entrada para agentes IA. Da a los agentes su propio correo electrónico, como Gmail para humanos.',
    scope: 'remote',
    downloads: '23.91k',
    icon_url: 'https://icons.duckduckgo.com/ip3/agentmail.to.ico',
  },
  {
    nombre: 'Context7',
    slug: 'upstash/context7-mcp',
    descripcion_en: 'Documentación actualizada y ejemplos de código directamente en tus prompts. Mejora tu experiencia eliminando información obsoleta y APIs inventadas.',
    scope: 'remote',
    downloads: '12.88k',
    icon_url: 'https://api.smithery.ai/servers/upstash/context7-mcp/icon',
  },
  {
    nombre: 'Mesh MCP',
    slug: 'clay-inc/clay-mcp',
    descripcion_en: 'Accede a tu red de contactos con un servidor simple y eficiente. Potencia tus aplicaciones y flujos de trabajo.',
    scope: 'remote',
    downloads: '23.35k',
    icon_url: 'https://api.smithery.ai/servers/clay-inc/clay-mcp/icon',
  },
  {
    nombre: 'Linkup',
    slug: 'LinkupPlatform/linkup-mcp-server',
    descripcion_en: 'Busca en la web en tiempo real para obtener respuestas fiables con fuentes. Encuentra noticias y resultados de las fuentes más relevantes.',
    scope: 'remote',
    downloads: '38.62k',
    icon_url: 'https://api.smithery.ai/servers/LinkupPlatform/linkup-mcp-server/icon',
  },
  {
    nombre: 'Google Drive',
    slug: 'googledrive',
    descripcion_en: 'Sube, organiza y comparte archivos en la nube. Gestiona carpetas, permisos y busca en todos tus documentos.',
    scope: 'remote',
    downloads: '6.61k',
    icon_url: 'https://logos.composio.dev/api/googledrive',
  },
]

export const smitheryRow2: SmitheryItem[] = [
  {
    nombre: 'Blockscout MCP Server',
    slug: 'blockscout/mcp-server',
    descripcion_en: 'Acceso contextual a datos blockchain: saldos, tokens, NFTs y metadatos de contratos para agentes IA y herramientas de automatización.',
    scope: 'remote',
    downloads: '10.84k',
    icon_url: 'https://icons.duckduckgo.com/ip3/blockscout.com.ico',
  },
  {
    nombre: 'Supabase',
    slug: 'Supabase',
    descripcion_en: 'Consulta la documentación de Supabase y resuelve errores rápidamente. Gestiona organizaciones, proyectos, bases de datos y Edge Functions.',
    scope: 'remote',
    downloads: '7.60k',
    icon_url: 'https://api.smithery.ai/servers/Supabase/icon',
  },
  {
    nombre: 'Notion',
    slug: 'notion',
    descripcion_en: 'Busca en tu workspace de Notion para encontrar páginas, bases de datos y usuarios. Consulta detalles completos para mayor contexto.',
    scope: 'remote',
    downloads: '2.90k',
    icon_url: 'https://api.smithery.ai/servers/notion/icon',
  },
  {
    nombre: 'Exa Search',
    slug: 'exa',
    descripcion_en: 'Búsqueda web rápida e inteligente con crawling. Exa-code es una herramienta de contexto para agentes de programación.',
    scope: 'remote',
    downloads: '35.54k',
    icon_url: 'https://api.smithery.ai/servers/exa/icon',
  },
  {
    nombre: 'Google Calendar',
    slug: 'googlecalendar',
    descripcion_en: 'Programa eventos, consulta disponibilidad y gestiona calendarios. Crea reuniones, recordatorios y coordina entre zonas horarias.',
    scope: 'remote',
    downloads: '4.19k',
    icon_url: 'https://logos.composio.dev/api/googlecalendar',
  },
  {
    nombre: 'Youtube',
    slug: 'youtube',
    descripcion_en: 'Plataforma de vídeo con contenido generado por usuarios, streaming en directo y monetización. Usado en marketing, educación y entretenimiento.',
    scope: 'remote',
    downloads: '3.33k',
    icon_url: 'https://logos.composio.dev/api/youtube',
  },
  {
    nombre: 'Brave Search',
    slug: 'brave',
    descripcion_en: 'Busca en la web, negocios locales, imágenes, vídeos y noticias con resultados estructurados. Filtra por país, idioma y actualidad.',
    scope: 'remote',
    downloads: '9.22k',
    icon_url: 'https://api.smithery.ai/servers/brave/icon',
  },
]

export const smitheryRow3: SmitheryItem[] = [
  {
    nombre: 'Slack',
    slug: 'slack',
    descripcion_en: 'Plataforma de mensajería por canales. Trabaja en equipo de forma más efectiva conectando todas tus herramientas y servicios.',
    scope: 'remote',
    downloads: '23.05k',
    icon_url: 'https://logos.composio.dev/api/slack',
  },
  {
    nombre: 'Microsoft Learn MCP',
    slug: 'microsoft/learn_mcp',
    descripcion_en: 'Permite a GitHub Copilot y otros agentes IA acceder a información actualizada de la documentación oficial de Microsoft.',
    scope: 'remote',
    downloads: '6.22k',
    icon_url: 'https://api.smithery.ai/servers/microsoft/learn_mcp/icon',
  },
  {
    nombre: 'Gmail',
    slug: 'gmail',
    descripcion_en: 'Gestiona Gmail de principio a fin: envía, redacta, responde, reenvía y modifica mensajes e hilos. Organiza tu bandeja con etiquetas y archivado.',
    scope: 'remote',
    downloads: '40.38k',
    icon_url: 'https://api.smithery.ai/servers/gmail/icon',
  },
  {
    nombre: 'Google Super',
    slug: 'googlesuper',
    descripcion_en: 'Combina todos los servicios de Google: Drive, Calendar, Gmail, Sheets, Analytics, Ads y más en una sola plataforma.',
    scope: 'remote',
    downloads: '5.16k',
    icon_url: 'https://cdn.jsdelivr.net/gh/ComposioHQ/open-logos@master/google.svg',
  },
  {
    nombre: 'Docfork',
    slug: 'docfork/mcp',
    descripcion_en: 'Documentación actualizada para agentes IA. Regístrate gratis en docfork.com para obtener tu API key.',
    scope: 'remote',
    downloads: '610',
    icon_url: 'https://icons.duckduckgo.com/ip3/docfork.com.ico',
  },
  {
    nombre: 'Google Tasks',
    slug: 'googletasks',
    descripcion_en: 'Lista de tareas y gestión integrada con Gmail y Google Calendar para un seguimiento rápido y sencillo.',
    scope: 'remote',
    downloads: '1.78k',
    icon_url: 'https://logos.composio.dev/api/googletasks',
  },
  {
    nombre: 'Ticktick',
    slug: 'ticktick',
    descripcion_en: 'Aplicación multiplataforma de gestión de tareas y listas de pendientes para organizar tus tareas y horarios eficientemente.',
    scope: 'remote',
    downloads: '2.23k',
    icon_url: 'https://ticktick.com/favicon.ico',
  },
]
