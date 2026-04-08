import { NextResponse } from 'next/server'

const BASE = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://spainmcp-fngo.vercel.app'

const CONTENT = `# SpainMCP

> El directorio de servidores MCP para España y LATAM. Conecta herramientas españolas (BOE, BORME, INE, AEMET) directamente con tu agente IA.

## Herramientas MCP

- [BOE (Boletín Oficial del Estado)](${BASE}/api/docs/tools/boe.md): Consulta legislación española publicada en el BOE directamente desde tu agente.
- [BORME (Registro Mercantil)](${BASE}/api/docs/tools/borme.md): Información de empresas y actos mercantiles del registro oficial español.
- [INE (Estadísticas)](${BASE}/api/docs/tools/ine.md): Datos estadísticos oficiales de España — población, economía, demografía.
- [AEMET (Tiempo)](${BASE}/api/docs/tools/aemet.md): Previsión meteorológica y datos climáticos de la Agencia Estatal de Meteorología.

## Guías de uso

- [Conectar (Conexiones MCP)](${BASE}/api/docs/use/connect.md): Cómo gestionar sesiones MCP con SpainMCP.
- [Scoping de Tokens](${BASE}/api/docs/use/token-scoping.md): Credenciales restringidas para uso seguro en agentes.
- [Restricciones de Herramientas](${BASE}/api/docs/use/restrictions.md): Control granular de acceso via rpcReqMatch.

## Skills

- [BOE Skill](${BASE}/guias/spainmcp-boe-skill): Skill para consultar el BOE desde cualquier agente compatible con SpainMCP CLI.

## API

- [MCP Server](${BASE}/api/mcp): Endpoint principal del servidor MCP de SpainMCP (SSE + Streamable HTTP).
- [Registry](${BASE}/api/servers/publish): Registra tu propio servidor MCP en el directorio de SpainMCP.
- [Gateway](${BASE}/api/gateway): Proxy universal para servidores MCP de terceros registrados.
`

export async function GET() {
  return new NextResponse(CONTENT, {
    status: 200,
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  })
}
