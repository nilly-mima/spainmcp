#!/usr/bin/env node
/**
 * Batch import ALL local MCP servers from Smithery registry into mcp_catalog.
 *
 * - Fetches all 401 local servers from Smithery (paginated)
 * - Skips servers already in mcp_catalog
 * - Imports each one using the same logic as import-mcp-local.mjs
 * - Saves a progress log to batch-import-progress.json
 *
 * Usage:
 *   node scripts/batch-import-local.mjs              # import all
 *   node scripts/batch-import-local.mjs --dry-run    # list only, no import
 *   node scripts/batch-import-local.mjs --resume     # skip already-processed
 *   node scripts/batch-import-local.mjs --limit 50   # import first N
 */

import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { createHash } from 'node:crypto'

// --- env loader ---
const envPath = resolve(process.cwd(), '.env.local')
for (const line of readFileSync(envPath, 'utf8').split('\n')) {
  const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/)
  if (m) process.env[m[1]] ??= m[2].replace(/^["']|["']$/g, '')
}

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!SUPABASE_URL || !SUPABASE_KEY) { console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY'); process.exit(1) }

const BUCKET = 'mcp-bundles'
const PROGRESS_FILE = resolve(process.cwd(), 'scripts/batch-import-progress.json')

// --- CLI args ---
const args = process.argv.slice(2)
const DRY_RUN = args.includes('--dry-run')
const RESUME = args.includes('--resume')
const limitArg = args.find(a => a.startsWith('--limit=') || a === '--limit')
const LIMIT = limitArg ? parseInt(args[args.indexOf('--limit') + 1] || limitArg.split('=')[1]) : null

// --- progress tracker ---
let progress = { imported: [], failed: [], skipped: [] }
if (RESUME && existsSync(PROGRESS_FILE)) {
  progress = JSON.parse(readFileSync(PROGRESS_FILE, 'utf8'))
  console.log(`Resuming — already done: ${progress.imported.length} imported, ${progress.failed.length} failed, ${progress.skipped.length} skipped`)
}

function saveProgress() {
  writeFileSync(PROGRESS_FILE, JSON.stringify(progress, null, 2))
}

// --- helpers ---
function guessCategory(name, description) {
  const s = (name + ' ' + (description || '')).toLowerCase()
  if (/\b(blockchain|crypto|ethereum|bitcoin|starknet|solana|web3|nft|defi|token|wallet)\b/.test(s)) return 'cripto'
  if (/\b(database|sql|postgres|mysql|mongo|redis|neo4j|supabase)\b/.test(s)) return 'datos'
  if (/\b(github|git|code|developer|programming|ide|vscode|cursor)\b/.test(s)) return 'desarrollo'
  if (/\b(ai|llm|gpt|claude|agent|ml|machine.learning|reasoning|thought)\b/.test(s)) return 'ai'
  if (/\b(email|gmail|slack|discord|notion|calendar|schedule|todoist|task)\b/.test(s)) return 'productividad'
  if (/\b(search|web|browser|scraping|crawler|internet)\b/.test(s)) return 'investigación'
  if (/\b(design|figma|image|video|photo|icon|paint|canvas|art|museum)\b/.test(s)) return 'diseño'
  if (/\b(finance|payment|stripe|billing|stock|financial)\b/.test(s)) return 'finanzas'
  if (/\b(terminal|shell|command|file|filesystem|desktop|computer)\b/.test(s)) return 'sistema'
  return 'desarrollo'
}

function transformTools(tools = []) {
  return tools.map(tool => {
    const schema = tool.inputSchema
    const params = []
    if (schema?.properties) {
      const required = Array.isArray(schema.required) ? schema.required : []
      for (const [name, def] of Object.entries(schema.properties)) {
        params.push({ name, type: def.type || 'string', description: def.description, required: required.includes(name) })
      }
    }
    return { name: tool.name, description: tool.description || '', ...(params.length > 0 ? { parameters: params } : {}) }
  })
}

// --- 1. Fetch all local servers from Smithery ---
console.log('\n📋 Fetching full list of local servers from Smithery...')
let allServers = []
let page = 1
let totalPages = 1

while (page <= totalPages) {
  const res = await fetch(`https://registry.smithery.ai/servers?q=is%3Alocal&page=${page}&pageSize=100`)
  if (!res.ok) { console.error(`Failed to fetch page ${page}`); break }
  const data = await res.json()
  allServers = allServers.concat(data.servers || [])
  totalPages = data.pagination?.totalPages || 1
  process.stdout.write(`  page ${page}/${totalPages} (${allServers.length} servers)...\r`)
  page++
}
console.log(`\n✓ Total local servers: ${allServers.length}`)

// Apply limit
if (LIMIT) {
  allServers = allServers.slice(0, LIMIT)
  console.log(`  Limited to first ${LIMIT}`)
}

// --- 2. Get existing slugs from Supabase ---
console.log('\n🔍 Checking existing MCPs in Supabase...')
const existingRes = await fetch(
  `${SUPABASE_URL}/rest/v1/mcp_catalog?select=slug&scope=eq.local`,
  { headers: { apikey: SUPABASE_KEY, authorization: `Bearer ${SUPABASE_KEY}` } }
)
const existingRows = await existingRes.json()
const existingSlugs = new Set(existingRows.map(r => r.slug))
console.log(`  ✓ Already in DB: ${existingSlugs.size} local MCPs`)

// Filter out already-imported (unless re-importing forced)
const toImport = allServers.filter(s => {
  const slug = s.qualifiedName.split('/')[1]
  if (existingSlugs.has(slug) && !args.includes('--force')) return false
  if (RESUME && (progress.imported.includes(s.qualifiedName) || progress.skipped.includes(s.qualifiedName))) return false
  return true
})

console.log(`\n📦 To import: ${toImport.length} servers (${allServers.length - toImport.length} already done)\n`)

if (DRY_RUN) {
  console.log('--- DRY RUN: servers to import ---')
  toImport.forEach((s, i) => console.log(`${i+1}. ${s.qualifiedName} — ${s.displayName} (${s.useCount} uses)`))
  process.exit(0)
}

// --- 3. Import each server ---
let imported = 0, failed = 0, skipped = 0

for (const server of toImport) {
  const { qualifiedName, displayName, useCount } = server
  const [owner, slugPart] = qualifiedName.split('/')
  const npmPkg = `@${owner}/${slugPart}`

  process.stdout.write(`[${imported+failed+skipped+1}/${toImport.length}] ${qualifiedName}... `)

  try {
    // Fetch full registry entry
    const regRes = await fetch(`https://registry.smithery.ai/servers/${qualifiedName}`)
    if (!regRes.ok) throw new Error(`Registry ${regRes.status}`)
    const reg = await regRes.json()

    if (reg.remote !== false) {
      process.stdout.write('⏭  remote, skip\n')
      progress.skipped.push(qualifiedName)
      skipped++
      saveProgress()
      continue
    }

    const connection = reg.connections?.[0]
    if (!connection || connection.type !== 'stdio') {
      process.stdout.write('⏭  no stdio, skip\n')
      progress.skipped.push(qualifiedName)
      skipped++
      saveProgress()
      continue
    }

    const runtime = connection.runtime || 'node'
    const isNpmBased = !connection.bundleUrl && !!connection.stdioFunction

    // npm metadata
    let npmMeta = { homepage: null, license: null, version: null, bundleUrl: null, repository: null }
    if (isNpmBased) {
      try {
        const npmRes = await fetch(`https://registry.npmjs.org/${npmPkg}/latest`)
        if (npmRes.ok) {
          const npmData = await npmRes.json()
          npmMeta.homepage = npmData.homepage || null
          npmMeta.license = typeof npmData.license === 'string' ? npmData.license : (npmData.license?.type || null)
          npmMeta.version = npmData.version || null
          if (npmMeta.version) {
            npmMeta.bundleUrl = `https://registry.npmjs.org/${npmPkg}/-/${slugPart}-${npmMeta.version}.tgz`
          }
          const repoUrl = npmData.repository?.url || npmData.repository || null
          if (repoUrl) {
            npmMeta.repository = repoUrl.replace(/^git\+/, '').replace(/\.git$/, '').replace('git://github.com', 'https://github.com')
          } else if (npmMeta.homepage?.includes('github.com')) {
            npmMeta.repository = npmMeta.homepage
          }
        }
      } catch {}
    }

    // bundle
    let publicBundleUrl = null, sha256 = null, sizeBytes = null, bundleSource = 'smithery-mirror'
    if (isNpmBased) {
      publicBundleUrl = npmMeta.bundleUrl
      bundleSource = 'direct-host'
    } else if (connection.bundleUrl) {
      // Try to download bundle — skip gracefully if host is inaccessible (e.g. backend.smithery.ai)
      try {
        const bundleRes = await fetch(connection.bundleUrl, { signal: AbortSignal.timeout(10000) })
        if (bundleRes.ok) {
          const bundleBuffer = Buffer.from(await bundleRes.arrayBuffer())
          sizeBytes = bundleBuffer.length
          sha256 = createHash('sha256').update(bundleBuffer).digest('hex')
          const storagePath = `${owner}/${slugPart}/server.mcpb`
          const uploadRes = await fetch(`${SUPABASE_URL}/storage/v1/object/${BUCKET}/${storagePath}`, {
            method: 'POST',
            headers: { authorization: `Bearer ${SUPABASE_KEY}`, apikey: SUPABASE_KEY, 'content-type': 'application/octet-stream', 'x-upsert': 'true', 'cache-control': 'public, max-age=31536000, immutable' },
            body: bundleBuffer,
          })
          if (uploadRes.ok) {
            publicBundleUrl = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${storagePath}`
          }
        }
      } catch {
        // Bundle inaccessible (internal CDN) — import metadata only, no bundle
      }
    }

    const descEn = reg.description || ''
    const row = {
      nombre: reg.displayName,
      slug: slugPart,
      descripcion_es: descEn,
      descripcion_en: descEn,
      scope: 'local',
      icon_url: reg.iconUrl || null,
      upstream_url: null,
      config: { type: 'stdio', runtime, configSchema: connection.configSchema || null },
      downloads: 0,
      categoria: guessCategory(reg.displayName, descEn),
      author: owner,
      verified: false,
      status: 'approved',
      is_public: true,
      is_active: true,
      bundle_url: publicBundleUrl,
      bundle_sha256: sha256,
      bundle_size_bytes: sizeBytes,
      bundle_source: bundleSource,
      bundle_version: npmMeta.version || null,
      runtime,
      npm_package: npmPkg,
      homepage: npmMeta.homepage || null,
      license: npmMeta.license || null,
      repository_url: npmMeta.repository || `https://github.com/${qualifiedName}`,
      tools_list: transformTools(reg.tools),
      prompts_list: reg.prompts || [],
    }

    const upsertRes = await fetch(`${SUPABASE_URL}/rest/v1/mcp_catalog?on_conflict=slug`, {
      method: 'POST',
      headers: { apikey: SUPABASE_KEY, authorization: `Bearer ${SUPABASE_KEY}`, 'content-type': 'application/json', prefer: 'resolution=merge-duplicates,return=minimal' },
      body: JSON.stringify(row),
    })
    if (!upsertRes.ok) {
      const err = await upsertRes.text()
      throw new Error(`Upsert ${upsertRes.status}: ${err.slice(0, 100)}`)
    }

    process.stdout.write(`✓ (${reg.tools?.length || 0} tools, ${useCount} uses)\n`)
    progress.imported.push(qualifiedName)
    imported++
    saveProgress()

    // Delay to avoid rate limiting
    await new Promise(r => setTimeout(r, 800))

  } catch (err) {
    const detail = err.cause?.message || err.cause?.code || err.stack?.split('\n')[0] || err.message
    process.stdout.write(`✗ ${err.message} [${detail}]\n`)
    progress.failed.push({ qualifiedName, error: `${err.message}: ${detail}` })
    failed++
    saveProgress()
  }
}

// --- 4. Summary ---
console.log(`\n${'='.repeat(50)}`)
console.log(`✅ Imported:  ${imported}`)
console.log(`⏭  Skipped:   ${skipped}`)
console.log(`❌ Failed:    ${failed}`)
console.log(`${'='.repeat(50)}`)
if (progress.failed.length > 0) {
  console.log('\nFailed servers:')
  progress.failed.forEach(f => console.log(`  - ${f.qualifiedName}: ${f.error}`))
}
console.log('\n💡 Run sync-npm-downloads.mjs to get real download counts.')
