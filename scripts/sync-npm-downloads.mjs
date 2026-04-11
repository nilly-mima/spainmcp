/**
 * sync-npm-downloads.mjs
 * Sincroniza downloads desde npm registry para todos los MCPs locales con npm_package.
 * Uso: node scripts/sync-npm-downloads.mjs
 */
import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'node:fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
for (const line of readFileSync(resolve(__dirname, '../.env.local'), 'utf8').split('\n')) {
  const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/)
  if (m) process.env[m[1]] ??= m[2].replace(/^["']|["']$/g, '')
}

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

const { data: mcps, error } = await supabase
  .from('mcp_catalog')
  .select('slug, npm_package')
  .eq('scope', 'local')
  .not('npm_package', 'is', null)

if (error) { console.error('Error leyendo catalog:', error); process.exit(1) }

console.log(`Sincronizando ${mcps.length} MCPs...`)

for (const mcp of mcps) {
  try {
    const res = await fetch(`https://api.npmjs.org/downloads/point/last-month/${mcp.npm_package}`)
    const json = await res.json()
    const downloads = json.downloads ?? 0

    await supabase
      .from('mcp_catalog')
      .update({ downloads })
      .eq('slug', mcp.slug)

    console.log(`✓ ${mcp.slug}: ${downloads} descargas`)
  } catch (e) {
    console.warn(`✗ ${mcp.slug}: ${e.message}`)
  }
}

console.log('Sincronización completada.')
