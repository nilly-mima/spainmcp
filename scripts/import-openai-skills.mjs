#!/usr/bin/env node
/**
 * Import skills from openai/skills/.curated → skills_catalog (Supabase).
 *
 * Zero LLM cost: fetches raw SKILL.md from GitHub, parses YAML frontmatter
 * for name/description, assigns category by slug heuristic, inserts as-is
 * (English content). Translation can be done on-demand later.
 *
 * Requires in .env.local:
 *   SUPABASE_URL=https://xxx.supabase.co
 *   SUPABASE_SERVICE_ROLE_KEY=...
 *
 * Usage:
 *   node scripts/import-openai-skills.mjs              # dry run, 1 skill
 *   node scripts/import-openai-skills.mjs --all        # all 43
 *   node scripts/import-openai-skills.mjs --only=figma,pdf
 */

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

// --- env loader ---
const envPath = resolve(process.cwd(), '.env.local');
for (const line of readFileSync(envPath, 'utf8').split('\n')) {
  const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
  if (m) process.env[m[1]] ??= m[2].replace(/^["']|["']$/g, '');
}

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!SUPABASE_URL || !SUPABASE_KEY) throw new Error('Missing SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY');

// --- CLI flags ---
const args = process.argv.slice(2);
const DO_ALL = args.includes('--all');
const ONLY = args.find(a => a.startsWith('--only='))?.slice(7).split(',').filter(Boolean);

// --- 43 openai curated skills (GitHub API 2026-04-10) ---
const SKILLS = [
  'aspnet-core', 'chatgpt-apps', 'cloudflare-deploy', 'develop-web-game', 'doc',
  'figma-code-connect-components', 'figma-create-design-system-rules', 'figma-create-new-file',
  'figma-generate-design', 'figma-generate-library', 'figma-implement-design', 'figma-use',
  'figma', 'frontend-skill', 'gh-address-comments', 'gh-fix-ci', 'imagegen',
  'jupyter-notebook', 'linear', 'netlify-deploy', 'notion-knowledge-capture',
  'notion-meeting-intelligence', 'notion-research-documentation', 'notion-spec-to-implementation',
  'openai-docs', 'pdf', 'playwright-interactive', 'playwright', 'render-deploy',
  'screenshot', 'security-best-practices', 'security-ownership-map', 'security-threat-model',
  'sentry', 'slides', 'sora', 'speech', 'spreadsheet', 'transcribe',
  'vercel-deploy', 'winui-app', 'yeet',
];

// --- category heuristic ---
function guessCategory(slug) {
  const s = slug.toLowerCase();
  if (s.includes('figma') || s.includes('design') || s.includes('screenshot') || s.includes('imagegen') || s.includes('sora') || s.includes('slides')) return 'diseño';
  if (s.includes('pdf') || s.includes('doc') || s.includes('spreadsheet') || s.includes('notion')) return 'documentos';
  if (s.includes('security')) return 'seguridad';
  if (s.includes('jupyter') || s.includes('transcribe') || s.includes('speech')) return 'datos';
  if (s.includes('linear') || s.includes('sentry')) return 'productividad';
  if (s.includes('playwright') || s.includes('yeet')) return 'automatización';
  return 'programación'; // aspnet, cloudflare, vercel, netlify, render, gh-*, frontend, openai-docs, chatgpt-apps, develop-web-game, winui, figma-code-connect
}

// --- fallback display name from slug ---
function slugToTitle(slug) {
  return slug.split('-').map(w => w[0].toUpperCase() + w.slice(1)).join(' ');
}

// --- YAML frontmatter parser (minimal) ---
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

async function fetchSkillMd(slug) {
  const url = `https://raw.githubusercontent.com/openai/skills/main/skills/.curated/${slug}/SKILL.md`;
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

// --- main ---
const targets = ONLY?.length ? ONLY : (DO_ALL ? SKILLS : [SKILLS[0]]);
console.log(`Importing ${targets.length} skills (${DO_ALL ? 'all' : ONLY ? 'only' : 'dry run'})`);

let done = 0, failed = 0;

for (const slug of targets) {
  try {
    process.stdout.write(`[${done + failed + 1}/${targets.length}] ${slug}... `);
    const md = await fetchSkillMd(slug);
    const fm = parseFrontmatter(md);

    const row = {
      slug,
      nombre: fm.name ? slugToTitle(slug) : slugToTitle(slug),
      descripcion: (fm.description || `Skill oficial de OpenAI: ${slug}`).slice(0, 400),
      categoria: guessCategory(slug),
      content: md,
      author: 'openai',
      icon_url: 'https://www.google.com/s2/favicons?domain=openai.com&sz=32',
      repo_url: `https://github.com/openai/skills/tree/main/skills/.curated/${slug}`,
      status: 'approved',
      is_public: true,
      installs: 0,
      stars: 0,
    };

    if (!DO_ALL && !ONLY) {
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
