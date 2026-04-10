#!/usr/bin/env node
/**
 * Import an MCP local (stdio) server from Smithery registry into mcp_catalog.
 *
 * What it does:
 *   1. Fetches the registry JSON for the server
 *   2. Downloads the .mcpb bundle from Smithery CDN
 *   3. Uploads the bundle to our Supabase Storage (bucket: mcp-bundles)
 *   4. Computes SHA256 of the bundle
 *   5. Inserts the server into mcp_catalog with scope='local' and all metadata
 *
 * Usage:
 *   node scripts/import-mcp-local.mjs mcpdotdirect/starknet-mcp-server
 *   node scripts/import-mcp-local.mjs mcpdotdirect/starknet-mcp-server --author mcpdotdirect
 *
 * Environment (from .env.local):
 *   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 */

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { createHash } from 'node:crypto';

// --- env loader ---
const envPath = resolve(process.cwd(), '.env.local');
for (const line of readFileSync(envPath, 'utf8').split('\n')) {
  const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
  if (m) process.env[m[1]] ??= m[2].replace(/^["']|["']$/g, '');
}

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

// --- CLI args ---
const args = process.argv.slice(2);
const qualifiedName = args.find(a => !a.startsWith('--'));
if (!qualifiedName || !qualifiedName.includes('/')) {
  console.error('Usage: node scripts/import-mcp-local.mjs owner/slug');
  console.error('Example: node scripts/import-mcp-local.mjs mcpdotdirect/starknet-mcp-server');
  process.exit(1);
}

const BUCKET = 'mcp-bundles';

// --- category heuristic ---
function guessCategory(name, description) {
  const s = (name + ' ' + (description || '')).toLowerCase();
  if (/\b(blockchain|crypto|ethereum|bitcoin|starknet|solana|web3|nft|defi|token|wallet)\b/.test(s)) return 'cripto';
  if (/\b(database|sql|postgres|mysql|mongo|redis|neo4j)\b/.test(s)) return 'datos';
  if (/\b(github|git|code|developer|programming|ide)\b/.test(s)) return 'desarrollo';
  if (/\b(ai|llm|gpt|claude|agent|ml|machine.learning)\b/.test(s)) return 'ai';
  if (/\b(email|gmail|slack|discord|notion|calendar|schedule)\b/.test(s)) return 'productividad';
  if (/\b(search|web|browser|scraping|crawler)\b/.test(s)) return 'investigación';
  if (/\b(design|figma|image|video|photo)\b/.test(s)) return 'diseño';
  if (/\b(finance|payment|stripe|billing)\b/.test(s)) return 'finanzas';
  return 'desarrollo';
}

function slugify(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

// --- 1. Fetch registry ---
console.log(`\n🔍 Fetching Smithery registry for ${qualifiedName}...`);
const registryRes = await fetch(`https://registry.smithery.ai/servers/${qualifiedName}`);
if (!registryRes.ok) {
  console.error(`Registry error: ${registryRes.status} ${registryRes.statusText}`);
  process.exit(1);
}
const reg = await registryRes.json();
console.log(`  ✓ displayName: ${reg.displayName}`);
console.log(`  ✓ remote: ${reg.remote} (expected false)`);

if (reg.remote !== false) {
  console.error('❌ This server is REMOTE, not local. Use a different script.');
  process.exit(1);
}

const connection = reg.connections?.[0];
if (!connection || connection.type !== 'stdio' || !connection.bundleUrl) {
  console.error('❌ Expected stdio connection with bundleUrl');
  process.exit(1);
}

const bundleUrl = connection.bundleUrl;
const runtime = connection.runtime || 'node';
console.log(`  ✓ bundleUrl: ${bundleUrl}`);
console.log(`  ✓ runtime: ${runtime}`);
console.log(`  ✓ tools: ${reg.tools?.length ?? 0}`);
console.log(`  ✓ prompts: ${reg.prompts?.length ?? 0}`);
console.log(`  ✓ resources: ${reg.resources?.length ?? 0}`);

// --- 2. Download the .mcpb ---
console.log(`\n📥 Downloading bundle from Smithery...`);
const bundleRes = await fetch(bundleUrl);
if (!bundleRes.ok) {
  console.error(`Bundle download failed: ${bundleRes.status}`);
  process.exit(1);
}
const bundleBuffer = Buffer.from(await bundleRes.arrayBuffer());
const sizeBytes = bundleBuffer.length;
const sha256 = createHash('sha256').update(bundleBuffer).digest('hex');
console.log(`  ✓ size: ${sizeBytes} bytes (${(sizeBytes / 1024).toFixed(1)} KB)`);
console.log(`  ✓ sha256: ${sha256.slice(0, 16)}...${sha256.slice(-8)}`);

// --- 3. Upload to Supabase Storage ---
const [owner, slugPart] = qualifiedName.split('/');
const storagePath = `${owner}/${slugPart}/server.mcpb`;
const uploadUrl = `${SUPABASE_URL}/storage/v1/object/${BUCKET}/${storagePath}`;

console.log(`\n📤 Uploading to Supabase Storage (${BUCKET}/${storagePath})...`);
const uploadRes = await fetch(uploadUrl, {
  method: 'POST',
  headers: {
    authorization: `Bearer ${SUPABASE_KEY}`,
    apikey: SUPABASE_KEY,
    'content-type': 'application/octet-stream',
    'x-upsert': 'true',
    'cache-control': 'public, max-age=31536000, immutable',
  },
  body: bundleBuffer,
});
if (!uploadRes.ok) {
  const err = await uploadRes.text();
  console.error(`Upload failed: ${uploadRes.status} ${err}`);
  process.exit(1);
}
const publicBundleUrl = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${storagePath}`;
console.log(`  ✓ public URL: ${publicBundleUrl}`);

// --- 4. Build the row for mcp_catalog ---
const slug = slugPart;
const descEn = reg.description || '';
const category = guessCategory(reg.displayName, descEn);

const row = {
  nombre: reg.displayName,
  slug,
  descripcion_es: descEn, // translated later by batch
  descripcion_en: descEn,
  scope: 'local',
  icon_url: reg.iconUrl || null,
  upstream_url: null,
  config: {
    type: 'stdio',
    runtime,
    configSchema: connection.configSchema || null,
    connectionPrompt: `curl https://spainmcp.com/skill.md and connect to ${qualifiedName} using spainmcp mcp add ${qualifiedName}`,
  },
  downloads: 0,
  categoria: category,
  author: owner,
  verified: false,
  status: 'approved',
  is_public: true,
  is_active: true,
  // New columns for local MCPs
  bundle_url: publicBundleUrl,
  bundle_sha256: sha256,
  bundle_size_bytes: sizeBytes,
  bundle_source: 'smithery-mirror',
  bundle_version: null,
  runtime,
  npm_package: `@${owner}/${slugPart}`,
  homepage: null,
  license: null,
  repository_url: `https://github.com/${qualifiedName}`,
  tools_list: reg.tools || [],
  prompts_list: reg.prompts || [],
};

// --- 5. Upsert into mcp_catalog ---
console.log(`\n💾 Upserting into mcp_catalog...`);
const upsertRes = await fetch(
  `${SUPABASE_URL}/rest/v1/mcp_catalog?on_conflict=slug`,
  {
    method: 'POST',
    headers: {
      apikey: SUPABASE_KEY,
      authorization: `Bearer ${SUPABASE_KEY}`,
      'content-type': 'application/json',
      prefer: 'resolution=merge-duplicates,return=representation',
    },
    body: JSON.stringify(row),
  }
);
if (!upsertRes.ok) {
  const err = await upsertRes.text();
  console.error(`Upsert failed: ${upsertRes.status} ${err}`);
  process.exit(1);
}
const inserted = await upsertRes.json();
console.log(`  ✓ row inserted: ${inserted[0]?.id}`);
console.log(`\n🎉 Done! View at: https://spainmcp-fngo.vercel.app/mcps/${slug}`);
