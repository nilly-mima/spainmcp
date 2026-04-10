#!/usr/bin/env node
/**
 * translate-batch4b-composio-gn.mjs
 * Traduce nombre+descripcion de skills al español neutro.
 * Autor: composio | slugs g-n (slug >= 'g' AND slug < 'o')
 * NO toca: content, file_tree, repo_url, categoria, icon_url.
 */

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

// --- Cargar .env.local ---
const envPath = resolve(process.cwd(), '.env.local');
for (const line of readFileSync(envPath, 'utf8').split('\n')) {
  const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
  if (m) process.env[m[1]] ??= m[2].replace(/^["']|["']$/g, '');
}
const BASE = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!BASE || !KEY) throw new Error('Faltan SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en .env.local');

// ---------------------------------------------------------------------------
// HELPER — convierte slug -automation en nombre de app legible
// ---------------------------------------------------------------------------
function slugToAppName(slug) {
  const base = slug.replace(/-automation$/, '');
  return base
    .split('-')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

// ---------------------------------------------------------------------------
// TRADUCCIONES ESPECIALES — skills sin patrón -automation
// nombre: máx 60 chars | descripcion: máx 400 chars
// ---------------------------------------------------------------------------
const SPECIAL = {
  'git-butler': {
    nombre: 'Git Butler — gestión visual de ramas',
    descripcion: 'Para gestionar ramas y cambios de Git de forma visual con Git Butler. Úsalo cuando necesites organizar commits, gestionar stacks de ramas o revisar diferencias antes de hacer push.'
  },
  'github-mcp-server': {
    nombre: 'GitHub MCP Server',
    descripcion: 'Para interactuar con GitHub vía el servidor MCP oficial: leer y crear issues, pull requests, commits, ramas y archivos de repositorios directamente desde el agente.'
  },
  'hackernews-digest': {
    nombre: 'Resumen diario de Hacker News',
    descripcion: 'Para obtener un resumen curado de las historias más relevantes de Hacker News del día. Úsalo cuando quieras mantenerte al día con tendencias tech sin revisar el feed manualmente.'
  },
  'issue-solver': {
    nombre: 'Resolutor de issues de código',
    descripcion: 'Para analizar y resolver issues de código de forma sistemática: reproduce el problema, identifica la causa raíz y propone la solución mínima necesaria.'
  },
  'jira-helper': {
    nombre: 'Asistente para Jira',
    descripcion: 'Para crear, actualizar y gestionar tickets de Jira desde el agente. Úsalo cuando necesites registrar bugs, tareas o épicas sin salir del flujo de trabajo.'
  },
  'knowledge-graph-memory': {
    nombre: 'Memoria en grafo de conocimiento',
    descripcion: 'Para mantener y consultar una memoria persistente estructurada como grafo de conocimiento. Úsalo cuando necesites recordar relaciones entre entidades a lo largo de conversaciones.'
  },
  'lead-generator': {
    nombre: 'Generador de leads de ventas',
    descripcion: 'Para identificar y calificar prospectos de ventas a partir de criterios de audiencia objetivo. Úsalo cuando necesites construir listas de contactos cualificados para outreach.'
  },
  'linear-helper': {
    nombre: 'Asistente para Linear',
    descripcion: 'Para crear y gestionar issues, proyectos y ciclos en Linear desde el agente. Úsalo cuando quieras registrar tareas de desarrollo sin cambiar de contexto.'
  },
  'memory': {
    nombre: 'Memoria persistente entre sesiones',
    descripcion: 'Para guardar y recuperar información importante entre sesiones de conversación. Úsalo cuando el usuario pida recordar datos, preferencias o contexto para conversaciones futuras.'
  },
  'meeting-notetaker': {
    nombre: 'Tomador de notas de reunión',
    descripcion: 'Para transcribir, resumir y extraer elementos de acción de reuniones. Úsalo cuando necesites documentar decisiones, compromisos y próximos pasos después de una llamada.'
  },
  'notion-helper': {
    nombre: 'Asistente para Notion',
    descripcion: 'Para crear, actualizar y organizar páginas y bases de datos en Notion desde el agente. Úsalo para documentar proyectos, notas o wikis sin salir del flujo de trabajo.'
  },
  'help': {
    nombre: 'Ayuda del skill-bus',
    descripcion: 'Para ver el resumen del skill-bus, su estado y los comandos disponibles. Úsalo como referencia rápida de todas las funciones del skill-bus.'
  },
  'image-enhancer': {
    nombre: 'Mejora de calidad de imágenes',
    descripcion: 'Para mejorar la calidad de imágenes, especialmente capturas de pantalla: aumenta resolución, nitidez y claridad. Úsalo cuando necesites presentar imágenes con mejor definición visual.'
  },
  'investigation-logger': {
    nombre: 'Registro de investigaciones de rendimiento',
    descripcion: 'Para añadir notas estructuradas y evidencias durante una investigación de rendimiento. Úsalo cuando necesites documentar hallazgos, hipótesis y pruebas de forma ordenada.'
  },
  'invoice-organizer': {
    nombre: 'Organizador de facturas y recibos',
    descripcion: 'Para organizar automáticamente facturas y recibos de cara a la declaración fiscal: extrae datos clave, renombra archivos y agrupa por categorías. Úsalo para preparar la documentación contable sin esfuerzo manual.'
  },
  'langsmith-fetch': {
    nombre: 'Depurar agentes con LangSmith',
    descripcion: 'Para depurar agentes LangChain y LangGraph obteniendo trazas de ejecución desde LangSmith Studio. Úsalo cuando necesites diagnosticar comportamientos inesperados en pipelines de agentes.'
  },
  'lead-research-assistant': {
    nombre: 'Asistente de investigación de leads',
    descripcion: 'Para identificar leads de alta calidad analizando tu negocio, buscando empresas objetivo y recopilando información de contacto relevante. Úsalo para construir listas de prospectos cualificados de forma eficiente.'
  },
  'list-subs': {
    nombre: 'Listar suscripciones del skill-bus',
    descripcion: 'Para listar todas las suscripciones activas del skill-bus en ámbitos global y de proyecto, mostrando estado de fusión y condiciones de inserción y suscripción.'
  },
  'meeting-insights-analyzer': {
    nombre: 'Analizador de insights de reuniones',
    descripcion: 'Para analizar transcripciones y grabaciones de reuniones e identificar patrones de comportamiento, insights de comunicación y recomendaciones accionables. Úsalo para sacar más valor de cada reunión.'
  },
  'meeting-notes-and-actions': {
    nombre: 'Notas y acciones de reunión',
    descripcion: 'Para convertir transcripciones o notas de reunión en resúmenes concisos con decisiones, riesgos y elementos de acción asignados a responsables. Úsalo para documentar reuniones de forma estructurada y con seguimiento claro.'
  },
};

// ---------------------------------------------------------------------------
// OVERRIDES de nombres de marca para skills -automation (g-n)
// ---------------------------------------------------------------------------
const APP_NAME_OVERRIDES = {
  // G
  'gamer-power-automation':                 'GamerPower',
  'geoapify-automation':                    'Geoapify',
  'getform-automation':                     'Getform',
  'getresponse-automation':                 'GetResponse',
  'ghost-automation':                       'Ghost',
  'giphy-automation':                       'Giphy',
  'github-automation':                      'GitHub',
  'gitlab-automation':                      'GitLab',
  'gladia-automation':                      'Gladia',
  'glean-automation':                       'Glean',
  'gocardless-automation':                  'GoCardless',
  'godaddy-automation':                     'GoDaddy',
  'google-ads-automation':                  'Google Ads',
  'google-analytics-automation':            'Google Analytics',
  'google-calendar-automation':             'Google Calendar',
  'google-classroom-automation':            'Google Classroom',
  'google-cloud-storage-automation':        'Google Cloud Storage',
  'google-contacts-automation':             'Google Contacts',
  'google-docs-automation':                 'Google Docs',
  'google-drive-automation':                'Google Drive',
  'google-forms-automation':                'Google Forms',
  'google-maps-automation':                 'Google Maps',
  'google-meet-automation':                 'Google Meet',
  'google-my-business-automation':          'Google My Business',
  'google-sheets-automation':               'Google Sheets',
  'google-slides-automation':               'Google Slides',
  'google-tasks-automation':                'Google Tasks',
  'google-workspace-automation':            'Google Workspace',
  'gotify-automation':                      'Gotify',
  'gotowebinar-automation':                 'GoToWebinar',
  'gravity-forms-automation':               'Gravity Forms',
  'greenhouse-automation':                  'Greenhouse',
  'groundhogg-automation':                  'Groundhogg',
  'gumroad-automation':                     'Gumroad',
  'guru-automation':                        'Guru',

  // H
  'harvest-automation':                     'Harvest',
  'helpdesk-automation':                    'HelpDesk',
  'helpscout-automation':                   'Help Scout',
  'heroku-automation':                      'Heroku',
  'highlevel-automation':                   'HighLevel',
  'hippo-video-automation':                 'Hippo Video',
  'hipchat-automation':                     'HipChat',
  'holiday-api-automation':                 'Holiday API',
  'hubspot-automation':                     'HubSpot',
  'hubspot-crm-automation':                 'HubSpot CRM',
  'hunter-automation':                      'Hunter',
  'hypefury-automation':                    'Hypefury',

  // I
  'iauditor-automation':                    'iAuditor',
  'icontact-automation':                    'iContact',
  'if-else-automation':                     'If/Else',
  'imagekit-automation':                    'ImageKit',
  'infusionsoft-automation':                'Infusionsoft',
  'instagram-automation':                   'Instagram',
  'instasent-automation':                   'Instasent',
  'intercom-automation':                    'Intercom',
  'invoiceninja-automation':                'Invoice Ninja',
  'iterable-automation':                    'Iterable',

  // J
  'jira-automation':                        'Jira',
  'jira-service-management-automation':     'Jira Service Management',
  'jotform-automation':                     'JotForm',
  'jumplead-automation':                    'Jumplead',

  // K
  'klaviyo-automation':                     'Klaviyo',
  'knack-automation':                       'Knack',
  'kommo-automation':                       'Kommo',

  // L
  'lagrowthmachine-automation':             'La Growth Machine',
  'lemlist-automation':                     'Lemlist',
  'lever-automation':                       'Lever',
  'linear-automation':                      'Linear',
  'linkedin-automation':                    'LinkedIn',
  'listmonk-automation':                    'Listmonk',
  'lob-automation':                         'Lob',
  'loops-automation':                       'Loops',
  'luma-automation':                        'Luma',

  // M
  'mailchimp-automation':                   'Mailchimp',
  'mailerlite-automation':                  'MailerLite',
  'mailgun-automation':                     'Mailgun',
  'mailjet-automation':                     'Mailjet',
  'mailmodo-automation':                    'Mailmodo',
  'mambu-automation':                       'Mambu',
  'mattermost-automation':                  'Mattermost',
  'medallia-automation':                    'Medallia',
  'metabase-automation':                    'Metabase',
  'microsoft-clarity-automation':           'Microsoft Clarity',
  'microsoft-teams-automation':             'Microsoft Teams',
  'mixpanel-automation':                    'Mixpanel',
  'monday-automation':                      'Monday.com',
  'mongo-db-automation':                    'MongoDB',
  'mongodb-automation':                     'MongoDB',
  'moonclerk-automation':                   'MoonClerk',
  'moxo-automation':                        'Moxo',
  'msg91-automation':                       'MSG91',
  'mysql-automation':                       'MySQL',

  // N
  'netbox-automation':                      'NetBox',
  'netlify-automation':                     'Netlify',
  'newrelic-automation':                    'New Relic',
  'next-cloud-automation':                  'Nextcloud',
  'nextcloud-automation':                   'Nextcloud',
  'notion-automation':                      'Notion',
  'notifly-automation':                     'Notifly',
  'notionhq-automation':                    'Notion',
  'nowpayments-automation':                 'NOWPayments',
};

// ---------------------------------------------------------------------------
// FUNCIÓN PRINCIPAL DE TRADUCCIÓN
// ---------------------------------------------------------------------------
function getTranslation(slug, nombreOrig) {
  // Especiales manuales
  if (SPECIAL[slug]) return SPECIAL[slug];

  // Patrón -automation
  if (slug.endsWith('-automation')) {
    const appName = APP_NAME_OVERRIDES[slug] || slugToAppName(slug);
    return {
      nombre: `Automatización de ${appName}`,
      descripcion: `Para automatizar tareas de ${appName} vía Composio. Busca siempre las herramientas disponibles primero para obtener los esquemas actualizados.`
    };
  }

  // Fallback: no traducir
  return null;
}

// ---------------------------------------------------------------------------
// EJECUCIÓN
// ---------------------------------------------------------------------------
const AUTHOR = 'composio';

async function fetchSkills() {
  let all = [];
  let offset = 0;
  const limit = 500;

  while (true) {
    const url = `${BASE}/rest/v1/skills_catalog?author=eq.${AUTHOR}&select=slug,nombre,descripcion&slug=gte.g&slug=lt.o&order=slug.asc&limit=${limit}&offset=${offset}`;
    const res = await fetch(url, {
      headers: { apikey: KEY, authorization: `Bearer ${KEY}` }
    });
    if (!res.ok) throw new Error(`GET failed: ${res.status} ${await res.text()}`);
    const batch = await res.json();
    all = all.concat(batch);
    if (batch.length < limit) break;
    offset += limit;
    console.log(`  Paginando... offset=${offset}, total acumulado=${all.length}`);
  }
  return all;
}

async function patchSkill(slug, nombre, descripcion) {
  const url = `${BASE}/rest/v1/skills_catalog?slug=eq.${encodeURIComponent(slug)}&author=eq.${AUTHOR}`;
  const res = await fetch(url, {
    method: 'PATCH',
    headers: {
      apikey: KEY,
      authorization: `Bearer ${KEY}`,
      'content-type': 'application/json',
      prefer: 'return=minimal'
    },
    body: JSON.stringify({ nombre, descripcion })
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`PATCH ${slug}: ${res.status} ${txt}`);
  }
}

async function main() {
  const startTime = Date.now();
  console.log(`[translate-batch4b-composio-gn] Cargando skills de autor: ${AUTHOR} (slugs g-n)...`);

  const skills = await fetchSkills();
  console.log(`Total skills en BD: ${skills.length}`);

  let ok = 0;
  let fail = 0;
  let skipped = 0;
  const failures = [];
  const noTranslation = [];

  for (let i = 0; i < skills.length; i++) {
    const { slug, nombre: nombreOrig, descripcion: descOrig } = skills[i];
    const t = getTranslation(slug, nombreOrig);

    if (!t) {
      noTranslation.push(slug);
      skipped++;
      continue;
    }

    // Respetar campos vacíos/null
    const nombre      = (nombreOrig === null || nombreOrig === '') ? nombreOrig : t.nombre;
    const descripcion = (descOrig   === null || descOrig   === '') ? descOrig  : t.descripcion;

    // Validaciones de longitud
    if (nombre && nombre.length > 60) {
      console.warn(`  WARN: nombre demasiado largo (${nombre.length} chars) para ${slug}`);
    }
    if (descripcion && descripcion.length > 400) {
      console.warn(`  WARN: descripcion demasiado larga (${descripcion.length} chars) para ${slug}`);
    }

    try {
      await patchSkill(slug, nombre, descripcion);
      ok++;
    } catch (err) {
      fail++;
      failures.push({ slug, error: err.message });
      console.error(`  FAIL: ${slug} — ${err.message}`);
    }

    if ((ok + fail) % 50 === 0 && (ok + fail) > 0) {
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
      console.log(`  Progreso: ${ok + fail}/${skills.length - skipped} procesados (OK=${ok}, FAIL=${fail}) — ${elapsed}s`);
    }
  }

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);

  console.log('\n========== RESUMEN FINAL ==========');
  console.log(`Total skills en BD: ${skills.length}`);
  console.log(`OK: ${ok}`);
  console.log(`FAIL: ${fail}`);
  console.log(`Sin traducción (skipped): ${skipped}`);
  console.log(`Tiempo total: ${elapsed}s`);

  if (failures.length > 0) {
    console.log('\nFallos:');
    for (const f of failures) console.log(`  - ${f.slug}: ${f.error}`);
  }

  if (noTranslation.length > 0) {
    console.log(`\nSlugs sin traducción (${noTranslation.length}):`);
    for (const s of noTranslation) console.log(`  - ${s}`);
  }

  // 3 ejemplos de muestra
  console.log('\n========== EJEMPLOS ==========');
  const ejemplos = [
    'github-automation',
    'hubspot-automation',
    'notion-automation',
  ];
  for (const slug of ejemplos) {
    const found = skills.find(s => s.slug === slug);
    if (found) {
      const t = getTranslation(slug, found.nombre);
      console.log(`\n[${slug}]`);
      console.log(`  nombre ANTES:  ${found.nombre}`);
      console.log(`  nombre DESPUÉS: ${t?.nombre}`);
      console.log(`  desc ANTES:  ${found.descripcion?.substring(0, 60)}...`);
      console.log(`  desc DESPUÉS: ${t?.descripcion?.substring(0, 60)}...`);
    }
  }
}

main().catch(err => { console.error('ERROR FATAL:', err); process.exit(1); });
