/**
 * Seed script: upserts smithery-featured.ts items into mcp_catalog.
 * Run with: npx tsx src/scripts/seed-mcps.ts
 * Requires: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY env vars.
 */
import { createClient } from '@supabase/supabase-js'
import { smitheryRow1, smitheryRow2, smitheryRow3 } from '../data/smithery-featured'

function parseDownloads(raw: string): number {
  const s = raw.toLowerCase().replace(/,/g, '')
  if (s.endsWith('k')) return Math.round(parseFloat(s) * 1000)
  return parseInt(s, 10) || 0
}

async function main() {
  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !key) {
    console.error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required')
    process.exit(1)
  }

  const supabase = createClient(url, key)
  const allItems = [...smitheryRow1, ...smitheryRow2, ...smitheryRow3]

  const rows = allItems.map(item => ({
    nombre: item.nombre,
    slug: item.slug.replace(/\//g, '-').replace(/[^a-z0-9-]/gi, '-').toLowerCase(),
    descripcion_es: item.descripcion_en,
    descripcion_en: item.descripcion_en,
    scope: item.scope,
    icon_url: item.icon_url,
    upstream_url: `https://smithery.ai/server/${item.slug}`,
    downloads: parseDownloads(item.downloads),
    is_active: true,
  }))

  let inserted = 0
  let updated = 0
  let errors = 0

  for (const row of rows) {
    const { data: existing } = await supabase
      .from('mcp_catalog')
      .select('id')
      .eq('slug', row.slug)
      .single()

    if (existing) {
      const { error } = await supabase
        .from('mcp_catalog')
        .update({ ...row, updated_at: new Date().toISOString() })
        .eq('id', existing.id)

      if (error) {
        console.error(`Error updating ${row.slug}:`, error.message)
        errors++
      } else {
        console.log(`Updated: ${row.nombre} (${row.slug})`)
        updated++
      }
    } else {
      const { error } = await supabase.from('mcp_catalog').insert(row)
      if (error) {
        console.error(`Error inserting ${row.slug}:`, error.message)
        errors++
      } else {
        console.log(`Inserted: ${row.nombre} (${row.slug})`)
        inserted++
      }
    }
  }

  console.log(`\nDone: ${inserted} inserted, ${updated} updated, ${errors} errors`)
}

main()
