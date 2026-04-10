#!/usr/bin/env node
/**
 * Backfill file_tree for openai skills already in skills_catalog.
 * Uses 1 single call to GitHub git/trees recursive → builds tree per skill.
 * Cost: $0.
 */

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const envPath = resolve(process.cwd(), '.env.local');
for (const line of readFileSync(envPath, 'utf8').split('\n')) {
  const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
  if (m) process.env[m[1]] ??= m[2].replace(/^["']|["']$/g, '');
}

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

// --- 1. Fetch full tree recursively (1 call) ---
console.log('Fetching openai/skills tree...');
const treeRes = await fetch('https://api.github.com/repos/openai/skills/git/trees/main?recursive=1');
if (!treeRes.ok) throw new Error(`GitHub ${treeRes.status}`);
const treeData = await treeRes.json();
if (treeData.truncated) console.warn('WARN: tree is truncated');
console.log(`Got ${treeData.tree.length} entries`);

// --- 2. Group by skill slug ---
// Path format: skills/.curated/{slug}/...
const PREFIX = 'skills/.curated/';
const bySlug = new Map();

for (const entry of treeData.tree) {
  if (!entry.path.startsWith(PREFIX)) continue;
  const rest = entry.path.slice(PREFIX.length);
  const parts = rest.split('/');
  if (parts.length < 2) continue; // just the slug dir itself
  const slug = parts[0];
  const relPath = parts.slice(1).join('/');
  if (!relPath) continue;
  if (!bySlug.has(slug)) bySlug.set(slug, []);
  bySlug.get(slug).push({ path: relPath, type: entry.type === 'tree' ? 'dir' : 'file' });
}

// --- 3. Build nested tree structure per skill ---
function buildTree(entries) {
  const root = [];
  const dirMap = new Map(); // path → node

  // Sort: dirs first, then alphabetical
  entries.sort((a, b) => {
    if (a.type !== b.type) return a.type === 'dir' ? -1 : 1;
    return a.path.localeCompare(b.path);
  });

  for (const e of entries) {
    const parts = e.path.split('/');
    const name = parts[parts.length - 1];
    const parentPath = parts.slice(0, -1).join('/');
    const node = { name, path: e.path, type: e.type };
    if (e.type === 'dir') node.children = [];

    if (parentPath === '') {
      root.push(node);
    } else {
      const parent = dirMap.get(parentPath);
      if (parent) parent.children.push(node);
      else root.push(node); // orphan — shouldn't happen
    }
    if (e.type === 'dir') dirMap.set(e.path, node);
  }
  return root;
}

// --- 4. UPDATE each skill in Supabase ---
let done = 0, failed = 0;
for (const [slug, entries] of bySlug) {
  const fileTree = buildTree(entries);
  process.stdout.write(`[${done + failed + 1}/${bySlug.size}] ${slug} (${entries.length} entries)... `);
  try {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/skills_catalog?slug=eq.${slug}&author=eq.openai`, {
      method: 'PATCH',
      headers: {
        'content-type': 'application/json',
        apikey: SUPABASE_KEY,
        authorization: `Bearer ${SUPABASE_KEY}`,
        prefer: 'return=minimal',
      },
      body: JSON.stringify({ file_tree: fileTree }),
    });
    if (!r.ok) throw new Error(`Supabase ${r.status}: ${await r.text()}`);
    console.log('OK');
    done++;
  } catch (e) {
    console.log(`FAIL: ${e.message}`);
    failed++;
  }
}

console.log(`\n--- Summary ---\nOK: ${done}   Failed: ${failed}   Cost: $0.00`);
