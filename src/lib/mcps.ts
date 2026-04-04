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

export const CATEGORIA_LABELS: Record<string, string> = {
  'desarrollo': 'Desarrollo',
  'productividad': 'Productividad',
  'datos': 'Datos',
  'automatizacion': 'Automatización',
  'espana': 'España',
  'colaboracion': 'Colaboración',
  'comunicacion': 'Comunicación',
  'busqueda': 'Búsqueda',
  'contenido': 'Contenido',
  'investigacion': 'Investigación',
  'gobierno': 'Gobierno',
  'empresas': 'Empresas',
  'legal': 'Legal',
  'bases-de-datos': 'Bases de datos',
  'archivos': 'Archivos',
  'documentacion': 'Documentación',
  'scraping': 'Scraping',
  'informacion': 'Información',
}

export const DIFICULTAD_LABELS: Record<string, string> = {
  'facil': 'Fácil',
  'media': 'Media',
  'avanzada': 'Avanzada',
}

// --- MCPs importados desde awesome-mcp-servers ---

export interface ImportedMcp {
  id: string
  nombre: string
  github_url: string
  descripcion_en: string
  categoria: string
  seccion: string
  lenguaje: string | null
  scope: string
  fuente: string
}

const IMPORTED_FILE = path.join(process.cwd(), 'src/data/imported.json')

export function getImportedMcps(limit?: number): ImportedMcp[] {
  if (!fs.existsSync(IMPORTED_FILE)) return []
  const data = JSON.parse(fs.readFileSync(IMPORTED_FILE, 'utf-8'))
  const all: ImportedMcp[] = data.mcps || []
  return limit ? all.slice(0, limit) : all
}

export function getImportedTotal(): number {
  if (!fs.existsSync(IMPORTED_FILE)) return 0
  const data = JSON.parse(fs.readFileSync(IMPORTED_FILE, 'utf-8'))
  return data.total || 0
}

export function getImportedByCategoria(categoria: string): ImportedMcp[] {
  return getImportedMcps().filter(m => m.categoria === categoria)
}
