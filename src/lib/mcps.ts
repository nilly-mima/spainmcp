import fs from 'fs'
import path from 'path'

export interface Mcp {
  id: string
  nombre: string
  descripcion_es: string
  descripcion_corta: string
  categoria: string[]
  tags: string[]
  instalacion_npx: string
  instalacion_claude_code: string
  variables_entorno: string[]
  github_url: string
  web_oficial?: string
  compatible_con: string[]
  verificado: boolean
  destacado: boolean
  gratuito: boolean
  precio_info?: string
  creador: string
  num_tools: number
  casos_uso_es: string[]
  fecha_verificado: string
  dificultad_instalacion: 'facil' | 'media' | 'avanzada'
  especifico_espana?: boolean
  nota_es?: string
  tools_list?: { name: string; description: string; parameters?: { name: string; type: string; required?: boolean; description?: string }[] }[]
  prompts_list?: { name: string; description?: string; arguments?: { name: string; description?: string; required?: boolean }[] }[]
  logo_url?: string

  // Local MCP fields (scope='local')
  scope?: 'local' | 'remote' | 'remoto'
  bundle_url?: string
  bundle_sha256?: string
  bundle_size_bytes?: number
  bundle_source?: 'spainmcp' | 'smithery-mirror' | 'direct-host'
  bundle_version?: string
  runtime?: string
  npm_package?: string
  homepage?: string
  license?: string
  repository_url?: string
  downloads?: number
}

const DATA_DIR = path.join(process.cwd(), 'src/data/mcps')

export function getAllMcps(): Mcp[] {
  const files = fs.readdirSync(DATA_DIR).filter(f => f.endsWith('.json'))
  return files.map(file => {
    const content = fs.readFileSync(path.join(DATA_DIR, file), 'utf-8')
    return JSON.parse(content) as Mcp
  }).sort((a, b) => {
    if (a.destacado && !b.destacado) return -1
    if (!a.destacado && b.destacado) return 1
    return a.nombre.localeCompare(b.nombre)
  })
}

export function getMcpById(id: string): Mcp | null {
  const filePath = path.join(DATA_DIR, `${id}.json`)
  if (!fs.existsSync(filePath)) return null
  return JSON.parse(fs.readFileSync(filePath, 'utf-8')) as Mcp
}

export function getMcpsByCategoria(categoria: string): Mcp[] {
  return getAllMcps().filter(mcp =>
    mcp.categoria.includes(categoria)
  )
}

export function searchMcps(query: string): Mcp[] {
  const q = query.toLowerCase()
  return getAllMcps().filter(mcp =>
    mcp.nombre.toLowerCase().includes(q) ||
    mcp.descripcion_es.toLowerCase().includes(q) ||
    mcp.tags.some(t => t.includes(q)) ||
    mcp.categoria.some(c => c.includes(q))
  )
}

export function getAllCategorias(): string[] {
  const mcps = getAllMcps()
  const cats = new Set<string>()
  mcps.forEach(m => m.categoria.forEach(c => cats.add(c)))
  return Array.from(cats).sort()
}

export { CATEGORIA_LABELS, DIFICULTAD_LABELS } from '@/lib/mcps-constants'
