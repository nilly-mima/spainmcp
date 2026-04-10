#!/usr/bin/env node
/**
 * Universal skills importer — finds any SKILL.md anywhere in a repo.
 * Reusable for any owner/repo. $0 LLM cost.
 *
 * Usage:
 *   node scripts/import-skills-universal.mjs vercel/next.js --branch=canary --author=vercel --icon=vercel.com
 *   node scripts/import-skills-universal.mjs vercel/next.js --all --branch=canary --author=vercel --icon=vercel.com
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

// --- CLI args ---
const args = process.argv.slice(2);
const REPO_ARG = args.find(a => !a.startsWith('--'));
if (!REPO_ARG) throw new Error('Usage: node import-skills-universal.mjs owner/repo [--all] [--branch=main] [--author=name] [--icon=domain.com]');
const [OWNER, REPO] = REPO_ARG.split('/');
const DO_ALL = args.includes('--all');
const BRANCH = args.find(a => a.startsWith('--branch='))?.slice(9) || 'main';
const AUTHOR = args.find(a => a.startsWith('--author='))?.slice(9) || OWNER;
const ICON_DOMAIN = args.find(a => a.startsWith('--icon='))?.slice(7) || `${OWNER}.com`;
const ICON_URL = `https://www.google.com/s2/favicons?domain=${ICON_DOMAIN}&sz=32`;

// --- category heuristic ---
function guessCategory(slug, desc = '') {
  const s = (slug + ' ' + desc).toLowerCase();
  if (s.includes('figma') || s.includes('design') || s.includes('screenshot') || s.includes('imagegen') || s.includes('slide')) return 'diseño';
  if (s.includes('pdf') || s.includes('docx') || s.includes('spreadsheet') || s.includes('notion') || s.includes('docstring') || s.includes('document')) return 'documentos';
  if (s.includes('security') || s.includes('threat')) return 'seguridad';
  if (s.includes('jupyter') || s.includes('transcribe') || s.includes('speech') || s.includes('data')) return 'datos';
  if (s.includes('linear') || s.includes('sentry') || s.includes('issue') || s.includes('triag') || s.includes('scrub')) return 'productividad';
  if (s.includes('playwright') || s.includes('yeet') || s.includes('ci') || s.includes('deploy')) return 'automatización';
  if (s.includes('writer') || s.includes('write-')) return 'escritura';
  return 'programación';
}

function slugToTitle(slug) {
  return slug.split('-').map(w => w[0].toUpperCase() + w.slice(1)).join(' ');
}

function parseFrontmatter(md) {
  const m = md.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!m) return {};
  const out = {};
  let currentKey = null;
  let buffer = [];
  for (const line of m[1].split(/\r?\n/)) {
    const kv = line.match(/^([a-zA-Z_-]+):\s*(.*)$/);
    if (kv) {
      if (currentKey) out[currentKey] = buffer.join(' ').trim();
      currentKey = kv[1];
      buffer = [kv[2].replace(/^["']|["']$/g, '').trim()];
    } else if (currentKey && line.trim()) {
      buffer.push(line.trim());
    }
  }
  if (currentKey) out[currentKey] = buffer.join(' ').trim();
  return out;
}

// --- 1. Fetch tree ---
console.log(`Fetching ${OWNER}/${REPO} (branch: ${BRANCH})...`);
const treeRes = await fetch(`https://api.github.com/repos/${OWNER}/${REPO}/git/trees/${BRANCH}?recursive=1`);
if (!treeRes.ok) throw new Error(`GitHub ${treeRes.status}: ${await treeRes.text()}`);
const treeData = await treeRes.json();
if (treeData.truncated) console.warn('WARN: tree truncated');
console.log(`Tree has ${treeData.tree.length} entries`);

// --- 2. Find all SKILL.md and their parent dirs ---
const skillDirs = new Map(); // parentDir → slug
for (const entry of treeData.tree) {
  if (entry.type !== 'blob') continue;
  if (!entry.path.endsWith('/SKILL.md')) continue;
  const parentDir = entry.path.slice(0, -'/SKILL.md'.length);
  const slug = parentDir.split('/').pop();
  skillDirs.set(parentDir, slug);
}
console.log(`Found ${skillDirs.size} SKILL.md files`);

// --- 3. Build file_tree per skill ---
function buildTreeForDir(parentDir) {
  const prefix = parentDir + '/';
  const entries = [];
  for (const entry of treeData.tree) {
    if (!entry.path.startsWith(prefix)) continue;
    const rel = entry.path.slice(prefix.length);
    if (!rel) continue;
    entries.push({ path: rel, type: entry.type === 'tree' ? 'dir' : 'file' });
  }

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

async function fetchFile(path) {
  const url = `https://raw.githubusercontent.com/${OWNER}/${REPO}/${BRANCH}/${path}`;
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

// --- 4. Process ---
const dirs = [...skillDirs.entries()];
const targets = DO_ALL ? dirs : dirs.slice(0, 1);
console.log(`Importing ${targets.length} (${DO_ALL ? 'all' : 'dry run'})`);

let done = 0, failed = 0, skipped = 0;
for (const [parentDir, slug] of targets) {
  process.stdout.write(`[${done + failed + skipped + 1}/${targets.length}] ${slug} (${parentDir})... `);
  try {
    const md = await fetchFile(`${parentDir}/SKILL.md`);
    const fm = parseFrontmatter(md);
    const fileTree = buildTreeForDir(parentDir);
    if (!fileTree.some(n => n.name === 'SKILL.md')) {
      fileTree.push({ name: 'SKILL.md', path: 'SKILL.md', type: 'file' });
    }

    const row = {
      slug,
      nombre: slugToTitle(slug),
      descripcion: (fm.description || `Skill de ${AUTHOR}: ${slug}`).slice(0, 400),
      categoria: guessCategory(slug, fm.description || ''),
      content: md,
      author: AUTHOR,
      icon_url: ICON_URL,
      repo_url: `https://github.com/${OWNER}/${REPO}/tree/${BRANCH}/${parentDir}`,
      status: 'approved',
      is_public: true,
      installs: 0,
      stars: 0,
      file_tree: fileTree,
    };

    if (!DO_ALL) {
      console.log('DRY RUN:');
      console.log(JSON.stringify({ ...row, content: row.content.slice(0, 200) + '...' }, null, 2));
      break;
    }

    await insertSkill(row);
    console.log(`OK (${row.categoria})`);
    done++;
  } catch (e) {
    if (e.message.includes('23505')) {
      console.log('SKIP (duplicate)');
      skipped++;
    } else {
      console.log(`FAIL: ${e.message}`);
      failed++;
    }
  }
}

console.log(`\n--- Summary ---\nOK: ${done}   Skipped: ${skipped}   Failed: ${failed}   Cost: $0.00`);
