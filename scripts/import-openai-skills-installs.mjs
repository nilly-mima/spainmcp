#!/usr/bin/env node
/**
 * Backfill install counts (and stars) for openai skills from Smithery registry.
 * Source: https://registry.smithery.ai/skills/openai/{slug}
 * Fields used: totalActivations → installs, externalStars → stars
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

// Fetch slugs currently in DB
const listRes = await fetch(`${SUPABASE_URL}/rest/v1/skills_catalog?author=eq.openai&select=slug`, {
  headers: { apikey: SUPABASE_KEY, authorization: `Bearer ${SUPABASE_KEY}` },
});
const rows = await listRes.json();
console.log(`${rows.length} openai skills in DB`);

let done = 0, failed = 0;
for (const { slug } of rows) {
  process.stdout.write(`[${done + failed + 1}/${rows.length}] ${slug}... `);
  try {
    const r = await fetch(`https://registry.smithery.ai/skills/openai/${slug}`);
    if (!r.ok) throw new Error(`Smithery ${r.status}`);
    const s = await r.json();
    const installs = s.totalActivations ?? 0;
    const stars = s.externalStars ?? 0;

    const upd = await fetch(`${SUPABASE_URL}/rest/v1/skills_catalog?slug=eq.${slug}&author=eq.openai`, {
      method: 'PATCH',
      headers: {
        'content-type': 'application/json',
        apikey: SUPABASE_KEY,
        authorization: `Bearer ${SUPABASE_KEY}`,
        prefer: 'return=minimal',
      },
      body: JSON.stringify({ installs, stars }),
    });
    if (!upd.ok) throw new Error(`Supabase ${upd.status}`);
    console.log(`installs=${installs}, stars=${stars}`);
    done++;
  } catch (e) {
    console.log(`FAIL: ${e.message}`);
    failed++;
  }
}
console.log(`\n--- Summary ---\nOK: ${done}   Failed: ${failed}   Cost: $0.00`);
