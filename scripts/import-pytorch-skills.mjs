#!/usr/bin/env node
/**
 * Import skills from pytorch/pytorch/.claude/skills → skills_catalog.
 * Same $0-cost pattern as openai import. Does INSERT + file_tree in one pass.
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

const args = process.argv.slice(2);
const DO_ALL = args.includes('--all');

// --- config ---
const OWNER = 'pytorch';
const REPO = 'pytorch';
const PREFIX = '.claude/skills/';
const AUTHOR = 'pytorch';
const ICON_URL = 'https://www.google.com/s2/favicons?domain=pytorch.org&sz=32';

// --- category heuristic ---
function guessCategory(slug) {
  const s = slug.toLowerCase();
  if (s.includes('doc')) return 'documentos';
  if (s.includes('writer')) return 'escritura';
  if (s.includes('issue') || s.includes('triag') || s.includes('scrub')) return 'productividad';
  return 'programación';
}

function slugToTitle(slug) {
  return slug.split('-').map(w => w[0].toUpperCase() + w.slice(1)).join(' ');
}

function parseFrontmatter(md) {
  const m = md.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!m) return {};
  const out = {};
  for (const line of m[1].split(/\r?\n/)) {
    const kv = line.match(/^([a-zA-Z_-]+):\s*(.*)$/);
    if (kv) out[kv[1]] = kv[2].replace(/^["']|["']$/g, '').trim();
  }
  return out;
}

// --- fetch full tree once ---
console.log(`Fetching ${OWNER}/${REPO} tree...`);
const treeRes = await fetch(`https://api.github.com/repos/${OWNER}/${REPO}/git/trees/main?recursive=1`);
if (!treeRes.ok) throw new Error(`GitHub tree ${treeRes.status}`);
const treeData = await treeRes.json();
if (treeData.truncated) console.warn('WARN: tree truncated (pytorch repo is huge) — filetree may be incomplete');

const bySlug = new Map();
const slugSet = new Set();
for (const entry of treeData.tree) {
  if (!entry.path.startsWith(PREFIX)) continue;
  const rest = entry.path.slice(PREFIX.length);
  const parts = rest.split('/');
  if (parts.length < 1) continue;
  const slug = parts[0];
  slugSet.add(slug);
  if (parts.length < 2) continue;
  const relPath = parts.slice(1).join('/');
  if (!relPath) continue;
  if (!bySlug.has(slug)) bySlug.set(slug, []);
  bySlug.get(slug).push({ path: relPath, type: entry.type === 'tree' ? 'dir' : 'file' });
}
console.log(`Found ${slugSet.size} skills in tree`);

function buildTree(entries) {
  const root = [];
  const dirMap = new Map();
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
    if (parentPath === '') root.push(node);
    else {
      const parent = dirMap.get(parentPath);
      if (parent) parent.children.push(node);
      else root.push(node);
    }
    if (e.type === 'dir') dirMap.set(e.path, node);
  }
  return root;
}

async function fetchSkillMd(slug) {
  const url = `https://raw.githubusercontent.com/${OWNER}/${REPO}/main/${PREFIX}${slug}/SKILL.md`;
  const r = await fetch(url);
  if (!r.ok) throw new Error(`GitHub ${r.status}`);
  return await r.text();
}

async function insertSkill(row) {
  const r = await fetch(`${SUPABASE_URL}/rest/v1/skills_catalog`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      apikey: SUPABASE_KEY,
      authorization: `Bearer ${SUPABASE_KEY}`,
      prefer: 'return=minimal,resolution=merge-duplicates',
    },
    body: JSON.stringify(row),
  });
  if (!r.ok) throw new Error(`Supabase ${r.status}: ${await r.text()}`);
}

const targets = DO_ALL ? [...slugSet].sort() : [...slugSet].sort().slice(0, 1);
console.log(`Importing ${targets.length} skills (${DO_ALL ? 'all' : 'dry run'})`);

let done = 0, failed = 0;
for (const slug of targets) {
  process.stdout.write(`[${done + failed + 1}/${targets.length}] ${slug}... `);
  try {
    const md = await fetchSkillMd(slug);
    const fm = parseFrontmatter(md);
    const entries = bySlug.get(slug) || [];
    const fileTree = buildTree(entries);

    // include SKILL.md in tree root if not already
    if (!fileTree.some(n => n.name === 'SKILL.md')) {
      fileTree.push({ name: 'SKILL.md', path: 'SKILL.md', type: 'file' });
    }

    const row = {
      slug,
      nombre: slugToTitle(slug),
      descripcion: (fm.description || `Skill de PyTorch: ${slug}`).slice(0, 400),
      categoria: guessCategory(slug),
      content: md,
      author: AUTHOR,
      icon_url: ICON_URL,
      repo_url: `https://github.com/${OWNER}/${REPO}/tree/main/${PREFIX}${slug}`,
      status: 'approved',
      is_public: true,
      installs: 0,
      stars: 0,
      file_tree: fileTree,
    };

    if (!DO_ALL) {
      console.log('DRY RUN preview:');
      console.log(JSON.stringify({ ...row, content: row.content.slice(0, 200) + '...' }, null, 2));
      break;
    }

    await insertSkill(row);
    console.log(`OK (${row.categoria})`);
    done++;
  } catch (e) {
    console.log(`FAIL: ${e.message}`);
    failed++;
  }
}

console.log(`\n--- Summary ---\nOK: ${done}   Failed: ${failed}   Cost: $0.00`);
