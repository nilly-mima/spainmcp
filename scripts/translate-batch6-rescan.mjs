#!/usr/bin/env node
/**
 * translate-batch6-rescan.mjs
 * Detecta y traduce al español neutro TODAS las skills que aún tengan
 * nombre o descripcion en inglés (heurística mejorada Test A + Test B).
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

const HEADERS = {
  'apikey': KEY,
  'authorization': `Bearer ${KEY}`,
  'content-type': 'application/json',
};

// ---------------------------------------------------------------------------
// HEURÍSTICA MEJORADA
// ---------------------------------------------------------------------------

// Palabras españolas que indican que el nombre YA está en español
const SPANISH_NAME_INDICATORS = [
  /\bpara\b/i, /\bde\b/i, /\bcon\b/i, /\ben\b/i, /\by\b/i,
  /\bel\b/i, /\bla\b/i, /\blos\b/i, /\blas\b/i, /\bdel\b/i,
  /\bun\b/i, /\buna\b/i, /\bpor\b/i, /\bsu\b/i, /\bse\b/i,
  /\bsin\b/i, /\bsobre\b/i, /\bdesde\b/i, /[áéíóúàèìòùñ]/i,
  /\ba\b/i, /\bal\b/i, /\bescala\b/i, /\bintegración\b/i,
];

// Prefijos españoles en descripción
const SPANISH_DESC_PREFIXES = [
  'Úsalo', 'Úsala', 'Usa ', 'Usar ', 'Para ', 'Genera ', 'Crea ', 'Analiza ',
  'Construye ', 'Traduce ', 'Conecta ', 'Gestiona ', 'Automatiza ', 'Configura ',
  'Documenta ', 'Escribe ', 'Revisa ', 'Depura ', 'Optimiza ', 'Ayuda ',
  'Triaje ', 'Extrae ', 'Prepara ', 'Investiga ', 'Convierte ', 'Implementa ',
  'Busca ', 'Cubre ', 'Responde ', 'Arranca ', 'Añade ', 'Procesa ',
  'Envía ', 'Recibe ', 'Captura ', 'Realiza ', 'Trabaja ', 'Diseña ',
  'Ejecuta ', 'Planifica ', 'Monitoriza ', 'Valida ', 'Importa ', 'Exporta ',
  'Registra ', 'Publica ', 'Consulta ', 'Compara ', 'Evalúa ', 'Detecta ',
  'Herramienta ', 'Skill de ', 'Meta-skill ',
];

// Palabras SOLO-inglés en nombres (no existen en nombres técnicos españoles sin contexto español)
const ENGLISH_ONLY_NAME_WORDS = [
  'Creator', 'Listener', 'Handler', 'Reviewer', 'Generator', 'Helper',
  'Advisor', 'Finder', 'Checker', 'Runner', 'Planner', 'Maker', 'Launcher',
  'Validator', 'Scheduler', 'Deployer', 'Wrapper', 'Fetcher', 'Debugger',
  'Patcher', 'Optimizer', 'Scout', 'Sensor',
];

// Palabras técnicas que pueden aparecer en nombres españoles legítimos
// (SDK, Manager, Monitor, Builder, etc. son marcas/términos técnicos aceptados)
const ALLOWED_ENGLISH_TECH_WORDS = new Set([
  'SDK', 'API', 'CLI', 'MCP', 'CI', 'CD', 'UI', 'UX', 'Manager',
  'Monitor', 'Builder', 'Explorer', 'Tracker', 'Analyzer', 'Writer',
  'Assistant', 'Connector', 'Exporter', 'Importer', 'Notifier', 'Reporter',
  'Classifier', 'Predictor', 'Detector', 'Parser', 'Mapper', 'Router',
  'Filter', 'Transformer', 'Resolver', 'Evaluator', 'Executor', 'Tester',
  'Profiler', 'Recorder', 'Logger', 'Summarizer', 'Translator',
  'Recommender', 'Selector', 'Indexer', 'Processor', 'Aggregator',
  'Dispatcher', 'Subscriber', 'Publisher', 'Orchestrator', 'Integrator',
  'Loader', 'Formatter', 'Converter', 'Provisioner',
]);

function hasSpanishNameIndicator(nombre) {
  return SPANISH_NAME_INDICATORS.some(r => r.test(nombre));
}

function testA_nameIsEnglish(nombre) {
  if (!nombre) return false;

  // Si tiene indicadores españoles, NO es inglés (aunque tenga palabras técnicas en inglés)
  if (hasSpanishNameIndicator(nombre)) return false;

  // Termina en " Skill"
  if (nombre.endsWith(' Skill')) return true;

  // Contiene palabras que SOLO aparecen en nombres ingleses (no son marcas/términos técnicos)
  for (const word of ENGLISH_ONLY_NAME_WORDS) {
    if (new RegExp(`(^|\\s)${word}(\\s|$)`).test(nombre)) return true;
  }

  // Empieza por verbo inglés en 3ª persona singular
  const ENGLISH_VERBS_START = [
    'Creates', 'Generates', 'Builds', 'Analyzes', 'Manages', 'Uses', 'Handles',
    'Provides', 'Enables', 'Allows', 'Helps', 'Supports', 'Processes', 'Runs',
    'Fetches', 'Returns', 'Sends', 'Receives', 'Monitors', 'Tracks', 'Checks',
    'Validates', 'Converts', 'Extracts', 'Loads', 'Connects', 'Transforms',
    'Deploys', 'Configures', 'Schedules', 'Triggers', 'Applies', 'Registers',
  ];
  for (const verb of ENGLISH_VERBS_START) {
    if (nombre.startsWith(verb)) return true;
  }

  // Nombre completo sin indicadores españoles + patrón "X for Y" o verbos ingleses clave
  if (!/[áéíóúàèìòùâêîôûäëïöüñç]/i.test(nombre)) {
    // Patrón "X for Y" (ej "Framework for Agents")
    if (/ for /i.test(nombre)) return true;

    // Verbos ingleses en forma base (applying, creating, etc.)
    if (/\b(applying|creating|building|managing|generating|using|handling|reviewing|writing|checking|running|planning|making|tracking|analyzing|deploying|configuring|scheduling|validating|converting|extracting|loading|connecting|transforming|fetching|processing|sending|receiving|monitoring|testing|debugging|optimizing|triggering)\b/i.test(nombre)) return true;
  }

  return false;
}

function testB_descIsEnglish(descripcion) {
  if (!descripcion) return false;
  const d = descripcion.trim();
  if (!d) return false;

  // Si empieza con prefijo español → ya está en español
  for (const prefix of SPANISH_DESC_PREFIXES) {
    if (d.startsWith(prefix)) return false;
  }

  // Prefijos claramente ingleses al inicio
  const ENGLISH_DESC_STARTS = [
    'Use when', 'Use this', 'Trigger when', 'Triggers on', 'This skill',
    'This will', 'Creates ', 'Generates ', 'Builds ', 'Manages ', 'Analyzes ',
    'Handles ', 'Processes ', 'Runs ', 'Fetches ', 'Returns ', 'Sends ',
    'Monitors ', 'Tracks ', 'Checks ', 'Validates ', 'Converts ', 'Extracts ',
    'Deploys ', 'Configures ', 'Schedules ', 'Enables ', 'Allows ', 'Provides ',
    'Connects ', 'Transforms ', 'Loads ', 'Registers ', 'Subscribes ',
    'Publishes ', 'Routes ', 'Filters ', 'Maps ', 'Parses ', 'Evaluates ',
    'Executes ', 'Provisions ', 'Tests ', 'Profiles ', 'Records ', 'Logs ',
    'Summarizes ', 'Translates ', 'Recommends ', 'Selects ', 'Indexes ',
    'The ', 'When ', 'Get ', 'List ', 'Search ', 'Find ', 'Show ',
    'Display ', 'Read ', 'Write ', 'Update ', 'Delete ', 'Create ',
    'Generate ', 'Build ', 'Deploy ', 'Configure ', 'Format ', 'Convert ',
    'Extract ', 'Import ', 'Export ', 'Notify ', 'Report ', 'Classify ',
    'Predict ', 'Detect ', 'Handle ', 'Process ', 'Set up', 'Helps ',
    'A skill', 'An skill',
  ];

  for (const prefix of ENGLISH_DESC_STARTS) {
    if (d.startsWith(prefix)) return true;
  }

  // Contiene múltiples palabras funcionales inglesas
  const ENGLISH_FUNC_WORDS = [
    ' the ', ' with ', ' when ', ' for ', ' this ', ' that ', ' from ',
    ' and ', ' or ', ' should ', ' use ', ' used ', ' uses ', ' using ',
    ' make ', ' makes ', ' create ', ' creates ', ' creating ',
    ' generate ', ' generates ', ' build ', ' builds ',
    ' analyze ', ' analyzes ', ' your ', ' will ', ' can ', ' have ', ' has ',
    ' its ', ' are ', ' is ', ' was ', ' were ', ' also ', ' which ',
    ' what ', ' how ', ' where ',
  ];

  let count = 0;
  const dLower = ' ' + d.toLowerCase() + ' ';
  for (const word of ENGLISH_FUNC_WORDS) {
    if (dLower.includes(word)) {
      count++;
      if (count >= 3) return true;
    }
  }

  return false;
}

function isEnglishSkill(skill) {
  return testA_nameIsEnglish(skill.nombre) || testB_descIsEnglish(skill.descripcion);
}

// ---------------------------------------------------------------------------
// TRADUCCIONES HARDCODEADAS (generadas por Claude)
// ---------------------------------------------------------------------------
const TRANSLATIONS = {
  // anthropic
  'action-creator': {
    nombre: 'Creador de acciones rápidas de email',
    descripcion: 'Para crear plantillas de acción de un clic que ejecutan operaciones de email al pulsar en el chat. Úsalo con "crea una acción para reenviar correos urgentes", "acción para archivar newsletters" o cuando quieras automatizar tareas de email frecuentes.',
  },
  'architecture': {
    nombre: 'Registro de decisión de arquitectura',
    descripcion: 'Para crear o evaluar un ADR (Architecture Decision Record). Úsalo al elegir entre tecnologías (Kafka vs SQS), diseñar límites de sistema o documentar trade-offs de arquitectura con contexto, alternativas y consecuencias.',
  },
  'brief': {
    nombre: 'Briefing contextual para trabajo legal',
    descripcion: 'Para generar briefings contextuales para trabajo legal: resumen diario, investigación de tema o respuesta a incidente. Úsalo al empezar la jornada, preparar una reunión o cuando necesites un resumen rápido de actividad reciente.',
  },
  'campaign-plan': {
    nombre: 'Plan de campaña de marketing',
    descripcion: 'Para generar un brief completo de campaña: objetivos, audiencia, mensajes, estrategia de canales, calendario de contenido y métricas de éxito. Úsalo al planificar lanzamientos, campañas de temporada o iniciativas de generación de demanda.',
  },
  'change-request': {
    nombre: 'Solicitud de cambio con análisis de impacto',
    descripcion: 'Para crear una solicitud de cambio con análisis de impacto y plan de rollback. Úsalo al proponer un cambio de sistema o proceso que requiera revisión formal, especialmente en entornos con governance estricto.',
  },
  'clinical-trial-protocol-skill': {
    nombre: 'Protocolo de ensayo clínico',
    descripcion: 'Para generar protocolos de ensayos clínicos de dispositivos médicos o fármacos. Úsalo con "crea un protocolo de ensayo clínico para X", al redactar secciones del protocolo o cuando necesites estructura ICH E6(R2) completa.',
  },
  'compose-outreach': {
    nombre: 'Redactar mensaje de outreach personalizado',
    descripcion: 'Para generar mensajes de outreach personalizados usando señales de Common Room. Úsalo con "redacta outreach para [persona]", "escribe un email de seguimiento para [empresa]" o "genera una secuencia de outreach para este segmento".',
  },
  'create-an-asset': {
    nombre: 'Crear activo de ventas',
    descripcion: 'Para generar activos de ventas (landing pages, decks, one-pagers, demos de flujo) a partir del contexto de un deal. Describe tu situación de ventas y el tipo de activo — se generará adaptado al comprador y la etapa del ciclo.',
  },
  'create-viz': {
    nombre: 'Crear visualización de datos',
    descripcion: 'Para crear visualizaciones de calidad de publicación con Python. Úsalo al convertir resultados de una consulta o DataFrame en un gráfico, seleccionar el tipo de chart adecuado o añadir anotaciones a una visualización.',
  },
  'data-visualization': {
    nombre: 'Visualización de datos con Python',
    descripcion: 'Para crear visualizaciones de datos efectivas con Python (matplotlib, seaborn, plotly). Úsalo al construir gráficos, elegir el tipo de visualización correcto o explicar tendencias en datos a una audiencia no técnica.',
  },
  'design-handoff': {
    nombre: 'Handoff de diseño a desarrollo',
    descripcion: 'Para generar especificaciones de handoff desde un diseño. Úsalo cuando un diseño está listo para ingeniería y necesita una spec con medidas exactas, tokens de color, comportamiento de componentes y guías de accesibilidad.',
  },
  'digest': {
    nombre: 'Digest de actividad diario o semanal',
    descripcion: 'Para generar un digest diario o semanal de actividad de todas las fuentes conectadas. Úsalo al ponerte al día tras una ausencia, empezar la semana o preparar un resumen de equipo.',
  },
  'financial-statements': {
    nombre: 'Estados financieros con análisis comparativo',
    descripcion: 'Para generar estados financieros (cuenta de resultados, balance, flujo de caja) con comparativa período a período y análisis de varianzas. Úsalo al preparar reporting mensual, revisiones de cierre o presentaciones a inversores.',
  },
  'forecast': {
    nombre: 'Previsión de ventas ponderada',
    descripcion: 'Para generar una previsión de ventas ponderada con escenarios mejor/probable/peor, desglose commit vs upside y análisis de gap. Úsalo en revisiones de pipeline, reuniones de forecast o al preparar reporting de ventas para dirección.',
  },
  'interview-prep': {
    nombre: 'Preparación de entrevista estructurada',
    descripcion: 'Para crear planes de entrevista estructurados con preguntas basadas en competencias y scorecards. Úsalo con "plan de entrevista para [rol]", "preguntas para evaluar X competencia" o cuando prepares un proceso de selección.',
  },
  'legal-response': {
    nombre: 'Respuesta a consulta legal',
    descripcion: 'Para generar una respuesta a una consulta legal frecuente usando plantillas configuradas, con verificaciones de escalada para situaciones que requieren asesoría especializada. Úsalo con consultas estándar de clientes o empleados.',
  },
  'listener-creator': {
    nombre: 'Creador de listeners de email',
    descripcion: 'Para crear listeners de email por eventos que monitorizan condiciones específicas (emails urgentes del jefe, newsletters para archivar, etc.) y ejecutan acciones automáticamente. Úsalo al automatizar el procesamiento de la bandeja de entrada.',
  },
  'onboarding': {
    nombre: 'Plan de onboarding para nueva incorporación',
    descripcion: 'Para generar un checklist de onboarding y plan de primera semana para un nuevo empleado. Úsalo cuando alguien tiene fecha de inicio próxima, al crear un programa de incorporación estructurado o para estandarizar el proceso de onboarding.',
  },
  'people-report': {
    nombre: 'Informe de personas y headcount',
    descripcion: 'Para generar informes de headcount, attrition, diversidad o salud organizacional. Úsalo al preparar un snapshot de headcount para dirección, analizar tendencias de rotación o presentar métricas de diversidad a liderazgo.',
  },
  'playground': {
    nombre: 'Playground HTML interactivo',
    descripcion: 'Para crear playgrounds HTML interactivos — exploradores autocontenidos en un único archivo que permiten configurar algo visualmente y ver resultados en tiempo real. Úsalo al prototipear ideas de UI, demos interactivas o herramientas de aprendizaje.',
  },
  'runbook': {
    nombre: 'Runbook operacional',
    descripcion: 'Para crear o actualizar un runbook operacional para una tarea o procedimiento recurrente. Úsalo al documentar una tarea que el equipo de on-call u otras personas ejecutan regularmente, con pasos detallados, checks y escaladas.',
  },
  'session-report': {
    nombre: 'Informe HTML de sesión Claude Code',
    descripcion: 'Para generar un informe HTML explorable del uso de sesión de Claude Code (tokens, caché, subagentes, skills, prompts costosos) desde los logs de la sesión. Úsalo al analizar el coste y eficiencia de una sesión larga.',
  },
  'sox-testing': {
    nombre: 'Testing y workpapers SOX',
    descripcion: 'Para generar selecciones de muestra SOX, workpapers de testing y evaluaciones de controles. Úsalo al planificar testing SOX trimestral o anual, seleccionar muestras para auditoría o documentar evaluaciones de controles internos.',
  },
  'stakeholder-update': {
    nombre: 'Actualización para stakeholders',
    descripcion: 'Para generar una actualización para stakeholders adaptada a la audiencia y cadencia. Úsalo al escribir un status semanal o mensual para liderazgo, comunicar avances de proyecto a ejecutivos o preparar un resumen de sprint para partes interesadas.',
  },
  'standup': {
    nombre: 'Actualización de standup diario',
    descripcion: 'Para generar una actualización de standup a partir de actividad reciente. Úsalo al preparar el daily standup, resumir los commits de ayer o cuando necesites un resumen rápido de lo hecho/pendiente/bloqueado.',
  },
  'status-report': {
    nombre: 'Informe de estado con KPIs y riesgos',
    descripcion: 'Para generar un informe de estado con KPIs, riesgos y elementos de acción. Úsalo al escribir una actualización semanal o mensual para liderazgo, reportar el estado de un proyecto o comunicar métricas clave a un comité ejecutivo.',
  },
  'weekly-prep-brief': {
    nombre: 'Briefing de preparación semanal',
    descripcion: 'Para generar un briefing semanal completo de todas las llamadas externas de los próximos 7 días. Úsalo los lunes para preparar la semana, antes de una ronda intensa de reuniones o cuando quieras entrar a cada llamada con contexto completo.',
  },
  // microsoft
  'azure-enterprise-infra-planner': {
    nombre: 'Planificador de infraestructura Azure empresarial',
    descripcion: 'Para diseñar y aprovisionar infraestructura Azure empresarial: networking, identidad, seguridad, cumplimiento y topologías hub-spoke. Úsalo al planificar arquitecturas de landing zone, configurar políticas de seguridad o dimensionar recursos para cargas enterprise.',
  },
  // composio
  // trailofbits — ya en español con nombres técnicos
  // vercel
  'router-act': {
    nombre: 'Server Actions con App Router de Next.js',
    descripcion: 'Para trabajar con Server Actions en el App Router de Next.js. Úsalo al implementar, depurar u optimizar Server Actions, manejar envíos de formularios del lado servidor o integrar lógica de datos en Server Components.',
  },
  // spainmcp — monitor-de-competencia ya en español pero Test A lo marca por "Monitor"
  // anthropic — skill detectadas por Test A pero ya en español (con heurística mejorada no aparecen)
};

// ---------------------------------------------------------------------------
// FETCH PAGINADO
// ---------------------------------------------------------------------------
async function fetchAllSkills() {
  const all = [];
  let offset = 0;
  while (true) {
    const url = `${BASE}/rest/v1/skills_catalog?select=slug,author,nombre,descripcion&order=slug.asc&limit=1000&offset=${offset}`;
    const res = await fetch(url, { headers: HEADERS });
    if (!res.ok) throw new Error(`GET failed: ${res.status} ${await res.text()}`);
    const batch = await res.json();
    all.push(...batch);
    if (batch.length < 1000) break;
    offset += 1000;
  }
  return all;
}

// ---------------------------------------------------------------------------
// PATCH a Supabase
// ---------------------------------------------------------------------------
async function patchSkill(slug, author, nombre, descripcion) {
  const url = `${BASE}/rest/v1/skills_catalog?slug=eq.${encodeURIComponent(slug)}&author=eq.${encodeURIComponent(author)}`;
  const res = await fetch(url, {
    method: 'PATCH',
    headers: { ...HEADERS, 'prefer': 'return=minimal' },
    body: JSON.stringify({ nombre, descripcion }),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`PATCH failed for ${slug}/${author}: ${res.status} ${body}`);
  }
}

// ---------------------------------------------------------------------------
// MAIN
// ---------------------------------------------------------------------------
const startTime = Date.now();
console.log('=== translate-batch6-rescan.mjs ===');
console.log('Cargando skills desde Supabase...');

const skills = await fetchAllSkills();
console.log(`Total skills en DB: ${skills.length}`);

const toTranslate = skills.filter(isEnglishSkill);
const alreadySpanish = skills.filter(s => !isEnglishSkill(s));

console.log(`\nDetectadas en inglés: ${toTranslate.length}`);
console.log(`Ya en español:        ${alreadySpanish.length}`);

// Desglose por autor
const byAuthor = {};
for (const s of toTranslate) byAuthor[s.author] = (byAuthor[s.author] || 0) + 1;
console.log('\nDesglose por autor (inglés):');
for (const [a, c] of Object.entries(byAuthor).sort((a,b) => b[1]-a[1])) {
  console.log(`  ${a}: ${c}`);
}

// Mostrar las detectadas
console.log('\n--- SKILLS DETECTADAS EN INGLÉS ---');
for (const s of toTranslate) {
  const rA = testA_nameIsEnglish(s.nombre) ? '[A]' : '';
  const rB = testB_descIsEnglish(s.descripcion) ? '[B]' : '';
  const hasTr = TRANSLATIONS[s.slug] ? '✓ tiene traducción' : '✗ SIN traducción';
  console.log(`  ${rA}${rB} [${s.author}] ${s.slug} — ${hasTr}`);
}

// Verificar cobertura
const withTr = toTranslate.filter(s => TRANSLATIONS[s.slug]);
const withoutTr = toTranslate.filter(s => !TRANSLATIONS[s.slug]);

if (withoutTr.length > 0) {
  console.log(`\nAVISO: ${withoutTr.length} skills sin traducción hardcodeada (se saltarán):`);
  for (const s of withoutTr) {
    console.log(`  - [${s.author}] ${s.slug}: "${s.nombre}"`);
    if (s.descripcion) console.log(`    "${s.descripcion.substring(0, 100)}"`);
  }
}

// Ejemplos ya en español
console.log('\n--- MUESTRA YA EN ESPAÑOL (no tocados) ---');
for (const s of alreadySpanish.filter(s => s.author === 'anthropic').slice(0, 5)) {
  console.log(`  ✓ [${s.author}] ${s.slug}: "${s.nombre}"`);
  if (s.descripcion) console.log(`    "${s.descripcion.substring(0, 80)}"`);
}

if (withTr.length === 0) {
  console.log('\n✅ No hay skills con traducción disponible para aplicar.');
  process.exit(0);
}

// PATCH
console.log(`\n=== Aplicando ${withTr.length} traducciones ===`);

let ok = 0, fail = 0;
const examples = [];
const errors = [];

for (let i = 0; i < withTr.length; i++) {
  const skill = withTr[i];
  const tr = TRANSLATIONS[skill.slug];

  if ((i + 1) % 50 === 0) {
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`  Progreso: ${i + 1}/${withTr.length} | OK: ${ok} | FAIL: ${fail} | ${elapsed}s`);
  }

  try {
    await patchSkill(skill.slug, skill.author, tr.nombre, tr.descripcion);

    if (examples.length < 5) {
      examples.push({
        slug: skill.slug,
        author: skill.author,
        antes: { nombre: skill.nombre, descripcion: (skill.descripcion || '').substring(0, 120) },
        despues: { nombre: tr.nombre, descripcion: tr.descripcion.substring(0, 120) },
      });
    }
    ok++;
  } catch (err) {
    fail++;
    errors.push({ slug: skill.slug, author: skill.author, error: err.message });
    console.error(`  ✗ ERROR [${skill.author}/${skill.slug}]: ${err.message}`);
  }
}

// ---------------------------------------------------------------------------
// REPORTE FINAL
// ---------------------------------------------------------------------------
const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);

console.log('\n' + '='.repeat(60));
console.log('REPORTE FINAL');
console.log('='.repeat(60));
console.log(`Total skills escaneadas:  ${skills.length}`);
console.log(`Detectadas en inglés:     ${toTranslate.length}`);
console.log(`  Con traducción:         ${withTr.length}`);
console.log(`  Sin traducción (skip):  ${withoutTr.length}`);
for (const [a, c] of Object.entries(byAuthor).sort((a,b) => b[1]-a[1])) {
  console.log(`    ${a}: ${c}`);
}
console.log(`Traducidas OK:            ${ok}`);
console.log(`Fallos:                   ${fail}`);
console.log(`Tiempo total:             ${totalTime}s`);

if (examples.length > 0) {
  console.log('\n--- 5 EJEMPLOS VARIADOS ---');
  for (const ex of examples) {
    console.log(`\n  slug: ${ex.slug} | author: ${ex.author}`);
    console.log(`  ANTES  nombre:  "${ex.antes.nombre}"`);
    console.log(`  DESPUÉS nombre: "${ex.despues.nombre}"`);
    console.log(`  ANTES  desc:    "${ex.antes.descripcion}"`);
    console.log(`  DESPUÉS desc:   "${ex.despues.descripcion}"`);
  }
}

console.log('\n--- YA EN ESPAÑOL (criterio — no tocados) ---');
for (const s of alreadySpanish.filter(s => s.author === 'anthropic').slice(0, 5)) {
  console.log(`  ✓ [${s.author}] ${s.slug}: "${s.nombre}"`);
}

if (errors.length > 0) {
  console.log('\n--- ERRORES ---');
  for (const e of errors) console.log(`  ✗ [${e.author}/${e.slug}]: ${e.error}`);
}

console.log('\n=== FIN ===');
