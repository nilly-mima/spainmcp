export const metadata = {
  title: 'Guías de instalación MCP en español — SpainMCP',
  description: 'Aprende a instalar y configurar servidores MCP en Claude Desktop y Claude Code paso a paso.',
}

const guias = [
  {
    titulo: '¿Qué es MCP y por qué lo necesitas?',
    descripcion: 'Introducción al Model Context Protocol: cómo conecta Claude con tus herramientas.',
    tiempo: '5 min',
    nivel: 'Principiante',
  },
  {
    titulo: 'Instalar tu primer MCP en Claude Code',
    descripcion: 'Guía paso a paso para añadir un servidor MCP en Claude Code desde la terminal.',
    tiempo: '10 min',
    nivel: 'Principiante',
  },
  {
    titulo: 'Instalar MCP en Claude Desktop',
    descripcion: 'Cómo configurar servidores MCP en la app de escritorio de Claude.',
    tiempo: '10 min',
    nivel: 'Principiante',
  },
  {
    titulo: 'Crear tu propio servidor MCP con FastMCP',
    descripcion: 'Construye un MCP personalizado en Python en menos de 50 líneas usando FastMCP.',
    tiempo: '30 min',
    nivel: 'Avanzado',
  },
]

export default function GuiasPage() {
  return (
    <div className="flex flex-col gap-8 max-w-3xl">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Guías en español</h1>
        <p className="text-gray-500 mt-2">Todo lo que necesitas para empezar con MCP</p>
      </div>

      <div className="flex flex-col gap-4">
        {guias.map((guia, i) => (
          <div key={i} className="bg-white border border-gray-200 rounded-xl p-5 flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <span className={`text-xs px-2 py-0.5 rounded-full border ${
                guia.nivel === 'Principiante'
                  ? 'bg-green-50 text-green-700 border-green-200'
                  : 'bg-orange-50 text-orange-700 border-orange-200'
              }`}>
                {guia.nivel}
              </span>
              <span className="text-xs text-gray-400">{guia.tiempo}</span>
            </div>
            <h2 className="font-semibold text-gray-900">{guia.titulo}</h2>
            <p className="text-sm text-gray-500">{guia.descripcion}</p>
            <p className="text-xs text-gray-400 italic mt-1">Próximamente...</p>
          </div>
        ))}
      </div>

      <div className="bg-orange-50 border border-orange-200 rounded-xl p-6 text-center">
        <h2 className="font-semibold text-orange-900 mb-2">¿Quieres contribuir una guía?</h2>
        <p className="text-sm text-orange-700 mb-4">Abre un PR en GitHub con tu guía en markdown y la publicamos.</p>
        <a
          href="https://github.com/nilly-mima/spainmcp"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors text-sm"
        >
          Contribuir en GitHub →
        </a>
      </div>
    </div>
  )
}
