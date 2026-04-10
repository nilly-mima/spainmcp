#!/usr/bin/env node
/**
 * translate-batch4c-composio-oz.mjs
 * Traduce nombre+descripcion de skills al español neutro.
 * Autor: composio | slugs o-z (slug >= 'o')
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
  'open-api': {
    nombre: 'Integración con OpenAPI',
    descripcion: 'Para conectar con cualquier API que tenga una especificación OpenAPI/Swagger. Úsalo cuando necesites integrar servicios externos describiendo sus endpoints de forma estándar.'
  },
  'performance-report': {
    nombre: 'Informe de rendimiento',
    descripcion: 'Para generar informes detallados de rendimiento consolidando métricas, comparativas con baselines y recomendaciones de mejora. Úsalo al cerrar una sesión de optimización o sprint de rendimiento.'
  },
  'pr-description-writer': {
    nombre: 'Redactor de descripciones de PR',
    descripcion: 'Para generar automáticamente descripciones claras y completas de pull requests a partir de los cambios del código. Úsalo para ahorrar tiempo y mejorar la calidad de la revisión de código.'
  },
  'pr-review-helper': {
    nombre: 'Asistente de revisión de PR',
    descripcion: 'Para revisar pull requests de forma estructurada: identifica bugs, problemas de seguridad, deuda técnica y mejoras de legibilidad. Úsalo para hacer revisiones de código más rápidas y consistentes.'
  },
  'pre-commit': {
    nombre: 'Validación pre-commit de código',
    descripcion: 'Para validar cambios de código antes de hacer commit: ejecuta linters, tests y comprobaciones de estilo. Úsalo para prevenir errores frecuentes antes de que lleguen al repositorio.'
  },
  'product-feedback-analyzer': {
    nombre: 'Analizador de feedback de producto',
    descripcion: 'Para analizar feedback de usuarios e identificar patrones, problemas recurrentes y oportunidades de mejora del producto. Úsalo para transformar opiniones dispersas en insights accionables.'
  },
  'profile-builder': {
    nombre: 'Constructor de perfil profesional',
    descripcion: 'Para construir perfiles profesionales estructurados a partir de CV, LinkedIn u otras fuentes. Úsalo cuando necesites crear o mejorar la presentación profesional de un candidato o colaborador.'
  },
  'pull-request-helper': {
    nombre: 'Asistente de pull requests',
    descripcion: 'Para crear, gestionar y revisar pull requests de forma más eficiente. Úsalo cuando necesites abrir PRs con descripción completa, asignar revisores o gestionar el ciclo de vida de la revisión.'
  },
  'quickstart': {
    nombre: 'Inicio rápido con Composio',
    descripcion: 'Para empezar rápidamente con Composio: configura las primeras integraciones, prueba herramientas disponibles y ejecuta tu primer agente conectado a apps externas en minutos.'
  },
  'recruiter-outreach': {
    nombre: 'Outreach automatizado para reclutamiento',
    descripcion: 'Para crear y enviar mensajes de outreach personalizados a candidatos potenciales. Úsalo cuando necesites contactar a múltiples perfiles de forma escalable manteniendo un tono personal.'
  },
  'remove-sub': {
    nombre: 'Eliminar suscripción del skill-bus',
    descripcion: 'Para eliminar una suscripción activa del skill-bus por su ID. Úsalo cuando ya no necesites inyectar contexto en un skill concreto o quieras limpiar suscripciones obsoletas.'
  },
  'rename': {
    nombre: 'Renombrar archivos con patrón',
    descripcion: 'Para renombrar archivos de forma masiva siguiendo un patrón o convención de nombres. Úsalo cuando necesites reorganizar activos, normalizar nombres o preparar archivos para publicación.'
  },
  'reply-to-linkedin-posts': {
    nombre: 'Responder publicaciones de LinkedIn',
    descripcion: 'Para generar y publicar respuestas relevantes a publicaciones de LinkedIn de forma automatizada. Úsalo para mantener presencia activa en LinkedIn sin invertir tiempo manual en cada interacción.'
  },
  'research-assistant': {
    nombre: 'Asistente de investigación',
    descripcion: 'Para realizar investigaciones en profundidad sobre cualquier tema: busca fuentes, sintetiza información y presenta hallazgos organizados. Úsalo cuando necesites ir más allá de una búsqueda simple.'
  },
  'resume-analyzer': {
    nombre: 'Analizador de currículums',
    descripcion: 'Para analizar CVs y evaluar candidatos según criterios de un puesto. Úsalo en procesos de selección para comparar perfiles rápidamente e identificar los más adecuados.'
  },
  'route-optimizer': {
    nombre: 'Optimizador de rutas logísticas',
    descripcion: 'Para calcular rutas óptimas para entregas, visitas comerciales o servicios de campo. Úsalo cuando necesites minimizar tiempo y coste de desplazamientos con múltiples paradas.'
  },
  'sales-outreach': {
    nombre: 'Outreach automatizado de ventas',
    descripcion: 'Para crear y gestionar secuencias de outreach de ventas personalizadas. Úsalo para prospectar de forma escalable con mensajes adaptados al perfil de cada lead.'
  },
  'screenshot': {
    nombre: 'Captura de pantalla de páginas web',
    descripcion: 'Para capturar screenshots de páginas web de forma programática. Úsalo para monitorizar cambios visuales, documentar interfaces o generar thumbnails de URLs automáticamente.'
  },
  'security-audit': {
    nombre: 'Auditoría de seguridad de código',
    descripcion: 'Para auditar código en busca de vulnerabilidades de seguridad: inyecciones, configuraciones inseguras, exposición de secretos y dependencias con CVEs conocidos. Úsalo antes de desplegar a producción.'
  },
  'sentiment-analyzer': {
    nombre: 'Analizador de sentimiento',
    descripcion: 'Para analizar el sentimiento de textos, reseñas o conversaciones e identificar patrones positivos, negativos y neutros. Úsalo para monitorizar la percepción de marca o producto.'
  },
  'slack-notifier': {
    nombre: 'Notificador de Slack',
    descripcion: 'Para enviar notificaciones y alertas automatizadas a canales de Slack. Úsalo cuando necesites mantener al equipo informado de eventos, métricas o cambios sin intervención manual.'
  },
  'social-media-manager': {
    nombre: 'Gestor de redes sociales',
    descripcion: 'Para planificar, crear y publicar contenido en múltiples redes sociales. Úsalo cuando necesites mantener una presencia consistente en LinkedIn, Twitter, Instagram y otras plataformas.'
  },
  'sop-generator': {
    nombre: 'Generador de procedimientos (SOPs)',
    descripcion: 'Para crear procedimientos operativos estándar (SOPs) claros y detallados a partir de flujos de trabajo existentes. Úsalo para documentar procesos repetibles de forma estructurada.'
  },
  'sql-assistant': {
    nombre: 'Asistente de SQL',
    descripcion: 'Para escribir, optimizar y depurar consultas SQL. Úsalo cuando necesites generar queries complejas, entender planes de ejecución o migrar esquemas de base de datos.'
  },
  'task-manager': {
    nombre: 'Gestor de tareas del agente',
    descripcion: 'Para crear, priorizar y hacer seguimiento de tareas del agente. Úsalo cuando necesites organizar el trabajo en pasos concretos con estado y responsable asignado.'
  },
  'tech-debt-analyzer': {
    nombre: 'Analizador de deuda técnica',
    descripcion: 'Para identificar y cuantificar la deuda técnica en un codebase: código duplicado, dependencias obsoletas, patrones problemáticos y áreas de alta complejidad. Úsalo para planificar refactorizaciones.'
  },
  'test-generator': {
    nombre: 'Generador de tests automáticos',
    descripcion: 'Para generar tests unitarios e de integración a partir del código fuente. Úsalo cuando necesites aumentar la cobertura de tests sin escribirlos manualmente.'
  },
  'ticket-resolver': {
    nombre: 'Resolutor de tickets de soporte',
    descripcion: 'Para analizar tickets de soporte, identificar la causa raíz y proponer soluciones. Úsalo para reducir el tiempo de resolución y mejorar la consistencia en las respuestas de soporte.'
  },
  'time-tracker': {
    nombre: 'Seguimiento de tiempo de trabajo',
    descripcion: 'Para registrar y analizar el tiempo dedicado a tareas y proyectos. Úsalo para mejorar la estimación futura, facturar con precisión o identificar cuellos de botella de productividad.'
  },
  'transcript-summarizer': {
    nombre: 'Resumidor de transcripciones',
    descripcion: 'Para resumir transcripciones de reuniones, podcasts o vídeos en puntos clave accionables. Úsalo cuando necesites extraer lo esencial de contenido largo en formato de texto.'
  },
  'translation-helper': {
    nombre: 'Asistente de traducción',
    descripcion: 'Para traducir contenido entre idiomas manteniendo el tono, contexto y terminología técnica. Úsalo para localizar documentación, interfaces o comunicaciones de marketing.'
  },
  'update-sub': {
    nombre: 'Actualizar suscripción del skill-bus',
    descripcion: 'Para modificar las condiciones o configuración de una suscripción existente del skill-bus. Úsalo cuando necesites ajustar cuándo o cómo se inyecta contexto en un skill.'
  },
  'url-shortener': {
    nombre: 'Acortador de URLs',
    descripcion: 'Para acortar URLs largas y hacer seguimiento de clics. Úsalo en campañas de marketing, emails o redes sociales donde necesitas URLs más limpias con analytics integrados.'
  },
  'video-summarizer': {
    nombre: 'Resumidor de vídeos',
    descripcion: 'Para obtener resúmenes estructurados de vídeos de YouTube u otras plataformas. Úsalo cuando necesites capturar los puntos clave de contenido en vídeo sin verlo completo.'
  },
  'web-scraper': {
    nombre: 'Extractor de datos web',
    descripcion: 'Para extraer datos estructurados de páginas web de forma automatizada. Úsalo cuando necesites recopilar información de múltiples URLs para análisis, monitorización o enriquecimiento de datos.'
  },
  'workflow-builder': {
    nombre: 'Constructor de flujos de trabajo',
    descripcion: 'Para diseñar y ejecutar flujos de trabajo automatizados conectando múltiples herramientas y servicios. Úsalo cuando necesites orquestar procesos complejos de varios pasos.'
  },
  'writing-assistant': {
    nombre: 'Asistente de escritura',
    descripcion: 'Para mejorar, editar y adaptar textos a diferentes estilos, tonos y audiencias. Úsalo cuando necesites redactar contenido profesional, técnico o creativo con mayor eficacia.'
  },
  'youtube-digest': {
    nombre: 'Resumen de contenido de YouTube',
    descripcion: 'Para obtener resúmenes curados de canales o vídeos de YouTube relevantes para tu sector. Úsalo para mantenerte al día con contenido de vídeo sin dedicar horas a verlo completo.'
  },
};

// ---------------------------------------------------------------------------
// OVERRIDES de nombres de marca para skills -automation (o-z)
// ---------------------------------------------------------------------------
const APP_NAME_OVERRIDES = {
  // O
  'okta-automation':                          'Okta',
  'omnisend-automation':                      'Omnisend',
  'one-drive-automation':                     'OneDrive',
  'onedrive-automation':                      'OneDrive',
  'open-ai-automation':                       'OpenAI',
  'openai-automation':                        'OpenAI',
  'openai-files-automation':                  'OpenAI Files',
  'openai-moderations-automation':            'OpenAI Moderations',
  'openai_administrator-automation':          'OpenAI Administrator',
  'openai-administrator-automation':          'OpenAI Administrator',
  'openai-realtime-automation':               'OpenAI Realtime',
  'orbit-automation':                         'Orbit',
  'outlook-automation':                       'Microsoft Outlook',
  'outreach-automation':                      'Outreach',

  // P
  'pandadoc-automation':                      'PandaDoc',
  'papersign-automation':                     'PaperSign',
  'pardot-automation':                        'Pardot',
  'paylocity-automation':                     'Paylocity',
  'paymo-automation':                         'Paymo',
  'paypal-automation':                        'PayPal',
  'payproglobal-automation':                  'PayProGlobal',
  'peopledatalabs-automation':                'People Data Labs',
  'perplexity-automation':                    'Perplexity',
  'piggy-automation':                         'Piggy',
  'pinecone-automation':                      'Pinecone',
  'pipedrive-automation':                     'Pipedrive',
  'pipefy-automation':                        'Pipefy',
  'placekey-automation':                      'Placekey',
  'plaid-automation':                         'Plaid',
  'planetscale-automation':                   'PlanetScale',
  'podio-automation':                         'Podio',
  'posthog-automation':                       'PostHog',
  'postgresql-automation':                    'PostgreSQL',
  'postmark-automation':                      'Postmark',
  'product-board-automation':                 'ProductBoard',
  'productboard-automation':                  'ProductBoard',

  // Q
  'quickbooks-automation':                    'QuickBooks',
  'quora-automation':                         'Quora',

  // R
  'razorpay-automation':                      'Razorpay',
  'reddit-automation':                        'Reddit',
  'replicate-automation':                     'Replicate',
  'resend-automation':                        'Resend',
  'ringcentral-automation':                   'RingCentral',
  'rocket-chat-automation':                   'Rocket.Chat',

  // S
  'salesforce-automation':                    'Salesforce',
  'salesloft-automation':                     'Salesloft',
  'segment-automation':                       'Segment',
  'sendgrid-automation':                      'SendGrid',
  'sendinblue-automation':                    'Sendinblue',
  'sendpulse-automation':                     'SendPulse',
  'sentry-automation':                        'Sentry',
  'servicenow-automation':                    'ServiceNow',
  'shopify-automation':                       'Shopify',
  'shortcut-automation':                      'Shortcut',
  'signalwire-automation':                    'SignalWire',
  'slack-automation':                         'Slack',
  'smartsheet-automation':                    'Smartsheet',
  'snowflake-automation':                     'Snowflake',
  'soundcloud-automation':                    'SoundCloud',
  'spotify-automation':                       'Spotify',
  'square-automation':                        'Square',
  'squarespace-automation':                   'Squarespace',
  'stackexchange-automation':                 'Stack Exchange',
  'statuspage-automation':                    'Statuspage',
  'stripe-automation':                        'Stripe',
  'supabase-automation':                      'Supabase',
  'surveymonkey-automation':                  'SurveyMonkey',
  'surveysparrow-automation':                 'SurveySparrow',

  // T
  'taskade-automation':                       'Taskade',
  'telegram-bot-automation':                  'Telegram Bot',
  'textmagic-automation':                     'TextMagic',
  'tiktok-automation':                        'TikTok',
  'timely-automation':                        'Timely',
  'todoist-automation':                       'Todoist',
  'toggl-automation':                         'Toggl',
  'trello-automation':                        'Trello',
  'trustpilot-automation':                    'Trustpilot',
  'tumblr-automation':                        'Tumblr',
  'twilio-automation':                        'Twilio',
  'twitter-automation':                       'Twitter / X',
  'typeform-automation':                      'Typeform',

  // U
  'unbounce-automation':                      'Unbounce',

  // V
  'vercel-automation':                        'Vercel',
  'vero-automation':                          'Vero',
  'vimeo-automation':                         'Vimeo',

  // W
  'webflow-automation':                       'Webflow',
  'webhooks-automation':                      'Webhooks',
  'woocommerce-automation':                   'WooCommerce',
  'wordpress-automation':                     'WordPress',

  // X
  'xero-automation':                          'Xero',

  // Y
  'youtube-automation':                       'YouTube',

  // Z
  'zapier-automation':                        'Zapier',
  'zendesk-automation':                       'Zendesk',
  'zoho-books-automation':                    'Zoho Books',
  'zoho-crm-automation':                      'Zoho CRM',
  'zoho-mail-automation':                     'Zoho Mail',
  'zoho-projects-automation':                 'Zoho Projects',
  'zoom-automation':                          'Zoom',
  'zoominfo-automation':                      'ZoomInfo',
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
    const url = `${BASE}/rest/v1/skills_catalog?author=eq.${AUTHOR}&select=slug,nombre,descripcion&slug=gte.o&order=slug.asc&limit=${limit}&offset=${offset}`;
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
  console.log(`[translate-batch4c-composio-oz] Cargando skills de autor: ${AUTHOR} (slugs o-z)...`);

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
    'stripe-automation',
    'zendesk-automation',
    'zoom-automation',
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
