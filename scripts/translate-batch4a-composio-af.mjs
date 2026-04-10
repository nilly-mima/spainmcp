#!/usr/bin/env node
/**
 * translate-batch4a-composio-af.mjs
 * Traduce nombre+descripcion de ~339 skills al español neutro.
 * Autor: composio | slugs a-f
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
  // Quitar sufijo -automation
  const base = slug.replace(/-automation$/, '');
  // Capitalizar cada palabra separada por guion
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
  'add-sub': {
    nombre: 'Añadir suscripción a evento de skill',
    descripcion: 'Para suscribirse a eventos de skills e inyectar contexto antes o después de que un skill se ejecute. Admite condiciones opcionales a nivel de inserción y de suscripción (AND-apiladas): fileExists, gitBranch, envSet, envEquals, fileContains con regex opcional.'
  },
  'analyzer': {
    nombre: 'Analizador de rendimiento',
    descripcion: 'Úsalo cuando necesites sintetizar hallazgos de rendimiento en recomendaciones y decisiones con respaldo de evidencia.'
  },
  'artifacts-builder': {
    nombre: 'Constructor de Artifacts HTML complejos',
    descripcion: 'Para crear artifacts HTML elaborados y multi-componente en claude.ai con tecnologías frontend modernas (React, Tailwind CSS, shadcn/ui). Úsalo para artifacts complejos que requieran gestión de estado, routing o componentes shadcn/ui, no para HTML/JSX de un solo archivo.'
  },
  'baseline': {
    nombre: 'Gestión de baselines de rendimiento',
    descripcion: 'Úsalo cuando necesites gestionar baselines de rendimiento, consolidar resultados o comparar versiones. Garantiza un único JSON de baseline por versión.'
  },
  'benchmark': {
    nombre: 'Ejecución de benchmarks de rendimiento',
    descripcion: 'Úsalo cuando necesites ejecutar benchmarks de rendimiento, establecer baselines o validar regresiones con ejecuciones secuenciales. Impone un mínimo de 60s por ejecución (30s solo para búsqueda binaria) y prohíbe benchmarks en paralelo.'
  },
  'changelog-generator': {
    nombre: 'Generador de changelog desde commits git',
    descripcion: 'Para crear automáticamente changelogs orientados al usuario a partir de commits git: analiza el historial, categoriza cambios y transforma commits técnicos en notas de release claras y comprensibles. Convierte horas de redacción manual en minutos de generación automática.'
  },
  'code-paths': {
    nombre: 'Mapeo de rutas de código y entrypoints',
    descripcion: 'Úsalo cuando necesites mapear rutas de código, entrypoints y archivos críticos antes de hacer profiling.'
  },
  'competitive-ads-extractor': {
    nombre: 'Extractor de anuncios de competidores',
    descripcion: 'Para extraer y analizar anuncios de competidores desde librerías de anuncios (Facebook, LinkedIn, etc.) y entender qué mensajes, problemas y creatividades están funcionando. Sirve de inspiración para mejorar tus propias campañas publicitarias.'
  },
  'composio': {
    nombre: 'Composio — integración con 1000+ apps',
    descripcion: 'Para conectar con más de 1000 aplicaciones externas vía Composio: desde la CLI directamente o construyendo agentes e integraciones con el SDK.'
  },
  'connect': {
    nombre: 'Conectar Claude con apps externas',
    descripcion: 'Para conectar Claude a cualquier app y ejecutar acciones reales: enviar emails, crear issues, publicar mensajes, actualizar bases de datos — integración con Gmail, Slack, GitHub, Notion y más de 1000 servicios.'
  },
  'connect-apps': {
    nombre: 'Conectar Claude a apps externas',
    descripcion: 'Para conectar Claude a aplicaciones externas como Gmail, Slack o GitHub. Úsalo cuando el usuario quiera enviar emails, crear issues, publicar mensajes o ejecutar acciones en servicios externos.'
  },
  'content-research-writer': {
    nombre: 'Investigador y redactor de contenido',
    descripcion: 'Para escribir contenido de alta calidad con investigación integrada: añade citas, mejora los hooks, itera sobre esquemas y proporciona feedback en tiempo real sobre cada sección. Transforma la redacción individual en un proceso colaborativo.'
  },
  'create-plan': {
    nombre: 'Crear un plan de tarea de código',
    descripcion: 'Para crear un plan conciso. Úsalo cuando el usuario pida explícitamente un plan relacionado con una tarea de programación.'
  },
  'developer-growth-analysis': {
    nombre: 'Análisis de crecimiento del desarrollador',
    descripcion: 'Para analizar el historial reciente de chats en Claude Code, identificar patrones de desarrollo, lagunas y áreas de mejora, seleccionar recursos de aprendizaje relevantes desde HackerNews y enviar automáticamente un informe de crecimiento personalizado a tu Slack.'
  },
  'domain-name-brainstormer': {
    nombre: 'Generador de ideas para nombres de dominio',
    descripcion: 'Para generar ideas creativas de nombres de dominio para tu proyecto y verificar disponibilidad en múltiples TLDs (.com, .io, .dev, .ai, etc.). Ahorra horas de brainstorming y verificación manual.'
  },
  'email-draft-polish': {
    nombre: 'Redactar y pulir borradores de email',
    descripcion: 'Para redactar, reescribir o condensar emails con tono, extensión y audiencia objetivo. Úsalo para outreach en frío, respuestas, actualizaciones de estado o escalaciones donde la claridad y la brevedad son esenciales.'
  },
  'file-organizer': {
    nombre: 'Organizador inteligente de archivos',
    descripcion: 'Para organizar inteligentemente archivos y carpetas en tu equipo: comprende el contexto, encuentra duplicados, sugiere mejores estructuras y automatiza tareas de limpieza. Reduce la carga cognitiva y mantiene tu espacio de trabajo digital ordenado sin esfuerzo manual.'
  },
};

// ---------------------------------------------------------------------------
// TRADUCCIONES PARA SKILLS -automation
// Se generan dinámicamente con slugToAppName + descripción genérica en español
// Traducciones específicas para apps bien conocidas donde el nombre debe quedar
// exactamente como se conoce (ej: "ActiveCampaign" no "Active Campaign")
// ---------------------------------------------------------------------------
const APP_NAME_OVERRIDES = {
  'active-campaign-automation':             'ActiveCampaign',
  'accredible-certificates-automation':     'Accredible Certificates',
  'adobe-automation':                       'Adobe',
  'agencyzoom-automation':                  'AgencyZoom',
  'agentql-automation':                     'AgentQL',
  'ahrefs-automation':                      'Ahrefs',
  'ai-ml-api-automation':                   'AI/ML API',
  'algolia-automation':                     'Algolia',
  'all-images-ai-automation':               'All Images AI',
  'alpha-vantage-automation':               'Alpha Vantage',
  'alttext-ai-automation':                  'AltText.ai',
  'amazon-automation':                      'Amazon',
  'anchor-browser-automation':              'Anchor Browser',
  'anthropic_administrator-automation':     'Anthropic Administrator',
  'anthropic-administrator-automation':     'Anthropic Administrator',
  'api-bible-automation':                   'API.Bible',
  'api-labz-automation':                    'API Labz',
  'api-ninjas-automation':                  'API Ninjas',
  'api-sports-automation':                  'API-Sports',
  'api2pdf-automation':                     'API2PDF',
  'apitemplate-io-automation':              'APITemplate.io',
  'apiverve-automation':                    'APIVerve',
  'apollo-automation':                      'Apollo',
  'appsflyer-automation':                   'AppsFlyer',
  'asin-data-api-automation':               'ASIN Data API',
  'astica-ai-automation':                   'Astica AI',
  'async-interview-automation':             'Async Interview',
  'atlassian-automation':                   'Atlassian',
  'attio-automation':                       'Attio',
  'auth0-automation':                       'Auth0',
  'backendless-automation':                 'Backendless',
  'battlenet-automation':                   'Battle.net',
  'beaconchain-automation':                 'Beaconchain',
  'beaconstac-automation':                  'Beaconstac',
  'benchmark-email-automation':             'Benchmark Email',
  'benzinga-automation':                    'Benzinga',
  'bestbuy-automation':                     'Best Buy',
  'better-proposals-automation':            'Better Proposals',
  'better-stack-automation':                'Better Stack',
  'big-data-cloud-automation':              'Big Data Cloud',
  'bigmailer-automation':                   'BigMailer',
  'bigml-automation':                       'BigML',
  'bigpicture-io-automation':               'BigPicture.io',
  'bingx-automation':                       'BingX',
  'bitwarden-automation':                   'Bitwarden',
  'bland-ai-automation':                    'Bland AI',
  'blaze-automation':                       'Blaze',
  'blastable-automation':                   'Blastable',
  'blaze-verify-automation':                'Blaze Verify',
  'bloomerang-automation':                  'Bloomerang',
  'boldsign-automation':                    'BoldSign',
  'botmother-automation':                   'BotMother',
  'botpress-automation':                    'Botpress',
  'box-automation':                         'Box',
  'braintree-automation':                   'Braintree',
  'brevo-automation':                       'Brevo',
  'browserbase-automation':                 'Browserbase',
  'browserless-automation':                 'Browserless',
  'browserstack-automation':                'BrowserStack',
  'brox-ai-automation':                     'Brox AI',
  'builtwith-automation':                   'BuiltWith',
  'bunnycdn-automation':                    'BunnyCDN',
  'cabinpanda-automation':                  'CabinPanda',
  'cal-automation':                         'Cal.com',
  'calendarhero-automation':                'CalendarHero',
  'callerapi-automation':                   'CallerAPI',
  'campaign-cleaner-automation':            'Campaign Cleaner',
  'canny-automation':                       'Canny',
  'canvas-automation':                      'Canvas',
  'capsule_crm-automation':                 'Capsule CRM',
  'capsule-crm-automation':                 'Capsule CRM',
  'cdr-platform-automation':                'CDR Platform',
  'census-bureau-automation':               'Census Bureau',
  'centralstationcrm-automation':           'CentralStationCRM',
  'chatbotkit-automation':                  'ChatBotKit',
  'chatfai-automation':                     'ChatFAI',
  'chatwork-automation':                    'Chatwork',
  'chmeetings-automation':                  'ChMeetings',
  'claid-ai-automation':                    'Claid AI',
  'cloudflare-api-key-automation':          'Cloudflare (API Key)',
  'cloudflare-automation':                  'Cloudflare',
  'cloudflare-browser-rendering-automation': 'Cloudflare Browser Rendering',
  'cloudinary-automation':                  'Cloudinary',
  'coassemble-automation':                  'Coassemble',
  'codacy-automation':                      'Codacy',
  'codeinterpreter-automation':             'Code Interpreter',
  'coinbase-automation':                    'Coinbase',
  'coinmarketcal-automation':               'CoinMarketCal',
  'coinmarketcap-automation':               'CoinMarketCap',
  'college-football-data-automation':       'College Football Data',
  'composio-automation':                    'Composio',
  'composio-search-automation':             'Composio Search',
  'contentful-automation':                  'Contentful',
  'contentful-graphql-automation':          'Contentful GraphQL',
  'control-d-automation':                   'Control D',
  'convertapi-automation':                  'ConvertAPI',
  'corrently-automation':                   'Corrently',
  'countdown-api-automation':               'Countdown API',
  'craftmypdf-automation':                  'CraftMyPDF',
  'crowdin-automation':                     'Crowdin',
  'customerio-automation':                  'Customer.io',
  'customgpt-automation':                   'CustomGPT',
  'cutt-ly-automation':                     'Cutt.ly',
  'd2lbrightspace-automation':              'D2L Brightspace',
  'dadata-ru-automation':                   'DaData.ru',
  'datarobot-automation':                   'DataRobot',
  'deepgram-automation':                    'Deepgram',
  'digital-ocean-automation':               'DigitalOcean',
  'discordbot-automation':                  'Discord Bot',
  'dnsfilter-automation':                   'DNSFilter',
  'docker_hub-automation':                  'Docker Hub',
  'docker-hub-automation':                  'Docker Hub',
  'docsbot-ai-automation':                  'DocsBot AI',
  'docugenerate-automation':                'DocuGenerate',
  'documenso-automation':                   'Documenso',
  'docupilot-automation':                   'Docupilot',
  'docupost-automation':                    'DocuPost',
  'docuseal-automation':                    'DocuSeal',
  'doppler-marketing-automation-automation': 'Doppler Marketing Automation',
  'doppler-secretops-automation':           'Doppler SecretOps',
  'dropbox-sign-automation':                'Dropbox Sign',
  'dungeon-fighter-online-automation':      'Dungeon Fighter Online',
  'dynamics365-automation':                 'Dynamics 365',
  'elevenlabs-automation':                  'ElevenLabs',
  'emailable-automation':                   'Emailable',
  'emaillistverify-automation':             'EmailListVerify',
  'emailoctopus-automation':                'EmailOctopus',
  'eodhd-apis-automation':                  'EODHD APIs',
  'epic-games-automation':                  'Epic Games',
  'esignatures-io-automation':              'eSignatures.io',
  'espocrm-automation':                     'EspoCRM',
  'eventbrite-automation':                  'Eventbrite',
  'exa-automation':                         'Exa',
  'excel-automation':                       'Microsoft Excel',
  'extracta-ai-automation':                 'Extracta AI',
  'facebook-automation':                    'Facebook',
  'factorial-automation':                   'Factorial',
  'feathery-automation':                    'Feathery',
  'fidel-api-automation':                   'Fidel API',
  'files-com-automation':                   'Files.com',
  'fillout_forms-automation':               'Fillout Forms',
  'fillout-forms-automation':               'Fillout Forms',
  'findymail-automation':                   'Findymail',
  'firecrawl-automation':                   'Firecrawl',
  'fireflies-automation':                   'Fireflies',
  'fitbit-automation':                      'Fitbit',
  'fixer-automation':                       'Fixer',
  'fixer-io-automation':                    'Fixer.io',
  'flowiseai-automation':                   'FlowiseAI',
  'flutterwave-automation':                 'Flutterwave',
  'foursquare-automation':                  'Foursquare',
  'fraudlabs-pro-automation':               'FraudLabs Pro',
  'freshbooks-automation':                  'FreshBooks',
  'fullenrich-automation':                  'Fullenrich',
};

// ---------------------------------------------------------------------------
// TRADUCCIONES — español neutro
// Para -automation: generadas dinámicamente
// Para especiales: SPECIAL dict arriba
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
    const url = `${BASE}/rest/v1/skills_catalog?author=eq.${AUTHOR}&select=slug,nombre,descripcion&slug=lt.g&order=slug.asc&limit=${limit}&offset=${offset}`;
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
  console.log(`[translate-batch4a-composio-af] Cargando skills de autor: ${AUTHOR} (slugs a-f)...`);

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
    const nombre     = (nombreOrig === null || nombreOrig === '') ? nombreOrig : t.nombre;
    const descripcion = (descOrig  === null || descOrig  === '') ? descOrig  : t.descripcion;

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
    'active-campaign-automation',
    'composio',
    'firecrawl-automation',
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
