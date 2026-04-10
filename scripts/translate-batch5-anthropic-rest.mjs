#!/usr/bin/env node
/**
 * translate-batch5-anthropic-rest.mjs
 * Traduce nombre+descripcion de ~173 skills author=anthropic al español neutro.
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
// HEURÍSTICA: detectar si descripcion está en inglés
// ---------------------------------------------------------------------------
const SPANISH_PREFIXES = [
  'Úsalo','Usa','Usar','Para','Genera','Crea','Analiza','Construye','Traduce',
  'Conecta','Gestiona','Automatiza','Configura','Documenta','Escribe','Revisa',
  'Depura','Optimiza','Caza','Ayuda','Triaje','Extrae','Prepara','Investiga',
  'Convierte','Implementa','Busca','Cubre','Responde','Arranca','Añade',
  'Procesa','Envía','Recibe','Captura','Realiza','Trabaja'
];

function isEnglish(skill) {
  const d = (skill.descripcion || '').trim();
  if (!d) return true;
  return !SPANISH_PREFIXES.some(p => d.startsWith(p));
}

// ---------------------------------------------------------------------------
// TRADUCCIONES — español neutro
// nombre: máx 60 chars | descripcion: máx 400 chars
// NO se traducen: nombres de productos, APIs, frameworks, CLIs
// ---------------------------------------------------------------------------
const TRANSLATIONS = {

  // --- knowledge-work-plugins ---
  'validate-data': {
    nombre: 'Validar datos',
    descripcion: 'Para verificar la calidad de un análisis antes de compartirlo: metodología, precisión y sesgo. Úsalo antes de presentar resultados a stakeholders o publicar un informe.'
  },
  'write-query': {
    nombre: 'Escribir consulta SQL',
    descripcion: 'Para escribir SQL optimizado según el dialecto elegido con buenas prácticas. Úsalo al traducir una necesidad de datos en lenguaje natural a SQL, optimizar consultas lentas o validar sintaxis.'
  },
  'ux-copy': {
    nombre: 'Redacción UX',
    descripcion: 'Para escribir o revisar textos UX: microcopies, mensajes de error, estados vacíos y llamadas a la acción. Úsalo con "escribe el texto para", "¿qué debería decir este botón?" o "mejora este mensaje de error".'
  },
  'design-system': {
    nombre: 'Sistema de diseño',
    descripcion: 'Para auditar, documentar o ampliar un sistema de diseño. Úsalo al detectar inconsistencias de nomenclatura, valores hardcodeados o cuando necesites generar tokens, patrones de componentes o documentación de estilo.'
  },
  'customer-research': {
    nombre: 'Investigación de clientes',
    descripcion: 'Para investigar una pregunta o tema usando múltiples fuentes con atribución. Úsalo cuando un cliente pregunte algo que requiere consultar varias fuentes antes de responder.'
  },
  'scientific-problem-selection': {
    nombre: 'Selección de problemas científicos',
    descripcion: 'Para ayudar a científicos con la selección de problemas de investigación, ideación de proyectos, resolución de bloqueos y priorización de oportunidades. Úsalo al evaluar qué investigar a continuación.'
  },
  'cowork-plugin-customizer': {
    nombre: 'Personalizador de plugins Cowork',
    descripcion: 'Para personalizar un plugin de Claude Code para las herramientas y flujos de una organización concreta. Úsalo al configurar el plugin, adaptar comandos a herramientas internas o ajustar comportamiento a convenciones del equipo.'
  },
  'research-synthesis': {
    nombre: 'Síntesis de investigación de usuarios',
    descripcion: 'Para sintetizar investigación de usuarios en temas, insights y recomendaciones. Úsalo cuando tengas transcripciones de entrevistas, resultados de encuestas o notas de investigación que necesiten estructurarse.'
  },
  'code-review': {
    nombre: 'Revisión de código',
    descripcion: 'Para revisar cambios de código en seguridad, rendimiento y corrección. Úsalo con una URL de PR o diff, "revisa esto antes de hacer merge" o "verifica si este cambio es seguro".'
  },
  'create-cowork-plugin': {
    nombre: 'Crear plugin Cowork',
    descripcion: 'Para guiar a los usuarios en la creación de un nuevo plugin desde cero en una sesión cowork. Úsalo al crear un plugin nuevo, scaffoldear estructura de plugin o establecer capacidades específicas del equipo.'
  },
  'draft-response': {
    nombre: 'Redactar respuesta a cliente',
    descripcion: 'Para redactar una respuesta profesional orientada al cliente, adaptada a la situación y las relaciones. Úsalo al responder tickets de soporte, escalar problemas o comunicar actualizaciones de incidentes.'
  },
  'build-dashboard': {
    nombre: 'Construir dashboard interactivo',
    descripcion: 'Para construir un dashboard HTML interactivo con gráficos, filtros y tablas. Úsalo al visualizar métricas de negocio, crear informes ejecutivos o presentar análisis de datos.'
  },
  'kb-article': {
    nombre: 'Artículo de base de conocimiento',
    descripcion: 'Para redactar un artículo de base de conocimiento a partir de un issue resuelto o una pregunta frecuente. Úsalo al documentar soluciones, crear guías de autoservicio o expandir la KB de soporte.'
  },
  'sql-queries': {
    nombre: 'Consultas SQL para data warehouses',
    descripcion: 'Para escribir SQL correcto y eficiente en los principales dialectos de data warehouse (Snowflake, BigQuery, Redshift, Databricks, DuckDB). Úsalo al construir análisis, optimizar consultas o traducir lógica de negocio a SQL.'
  },
  'accessibility-review': {
    nombre: 'Auditoría de accesibilidad WCAG 2.1 AA',
    descripcion: 'Para realizar una auditoría de accesibilidad WCAG 2.1 AA sobre un diseño o página. Úsalo con "audita la accesibilidad de", "comprueba el contraste de color" o "revisa este componente para lectores de pantalla".'
  },
  'ticket-triage': {
    nombre: 'Triaje de tickets de soporte',
    descripcion: 'Para clasificar y priorizar tickets de soporte o issues de clientes. Úsalo cuando llegue un ticket nuevo con urgencia poco clara, cuando necesites escalar o cuando priorices una cola de soporte.'
  },
  'analyze': {
    nombre: 'Análisis de datos',
    descripcion: 'Para responder preguntas de datos — desde consultas rápidas hasta análisis completos. Úsalo al buscar un número, explorar tendencias, comparar segmentos o construir un análisis desde cero.'
  },
  'data-context-extractor': {
    nombre: 'Extractor de contexto de datos',
    descripcion: 'Para generar o mejorar una skill de análisis de datos específica para una empresa, extrayendo conocimiento tribal sobre esquemas, métricas y convenciones de naming. Úsalo al incorporar un nuevo analista o documentar conocimiento de datos implícito.'
  },
  'statistical-analysis': {
    nombre: 'Análisis estadístico',
    descripcion: 'Para aplicar métodos estadísticos: estadística descriptiva, análisis de tendencias, detección de outliers, tests de hipótesis e interpretación de resultados. Úsalo al explorar datos, validar hipótesis o explicar hallazgos estadísticos.'
  },
  'design-critique': {
    nombre: 'Crítica de diseño estructurada',
    descripcion: 'Para obtener feedback estructurado sobre usabilidad, jerarquía y consistencia de un diseño. Úsalo con "revisa este diseño", "¿qué le falta a esta pantalla?" o "evalúa la jerarquía visual de este layout".'
  },
  'deploy-checklist': {
    nombre: 'Checklist de despliegue',
    descripcion: 'Para verificación previa al despliegue. Úsalo justo antes de lanzar una release, desplegar en producción o hacer una actualización de configuración crítica.'
  },
  'explore-data': {
    nombre: 'Explorar un dataset',
    descripcion: 'Para perfilar y explorar un dataset: forma, calidad y patrones. Úsalo al empezar con un dataset nuevo, identificar problemas de calidad o entender la estructura antes de analizar.'
  },
  'customer-escalation': {
    nombre: 'Escalada a cliente',
    descripcion: 'Para preparar una escalada para ingeniería, producto o dirección con contexto completo. Úsalo cuando un issue de soporte requiera intervención de nivel superior o comunicación ejecutiva.'
  },
  'user-research': {
    nombre: 'Investigación de usuarios',
    descripcion: 'Para planificar, ejecutar y sintetizar investigación de usuarios. Úsalo con "plan de investigación de usuarios", "diseña una guía de entrevista" o "sintetiza estos hallazgos de investigación".'
  },
  'debug': {
    nombre: 'Sesión de depuración estructurada',
    descripcion: 'Para una sesión de depuración estructurada: reproducir, aislar, diagnosticar y corregir. Úsalo con "depura esto", "¿por qué falla X?" o "ayúdame a entender este error".'
  },
  'source-management': {
    nombre: 'Gestión de fuentes MCP',
    descripcion: 'Para gestionar fuentes MCP conectadas en búsqueda empresarial. Detecta fuentes disponibles, diagnostica problemas de conectividad y guía al usuario en añadir o reconfigurar fuentes.'
  },
  'journal-entry-prep': {
    nombre: 'Preparación de asientos contables',
    descripcion: 'Para preparar asientos contables con débitos, créditos y documentación de soporte correctos. Úsalo al registrar transacciones, ajustes de fin de período o entradas de corrección.'
  },
  'variance-analysis': {
    nombre: 'Análisis de varianzas financieras',
    descripcion: 'Para descomponer varianzas financieras en factores con explicaciones narrativas y gráficos waterfall. Úsalo al investigar diferencias presupuesto vs real, cambios período a período o comparativas de escenarios.'
  },
  'policy-lookup': {
    nombre: 'Búsqueda de políticas de empresa',
    descripcion: 'Para encontrar y explicar políticas de empresa en lenguaje claro. Úsalo con "¿cuál es nuestra política de PTO?", "explica la política de gastos" o "¿qué dice nuestra política sobre trabajo remoto?".'
  },
  'tech-debt': {
    nombre: 'Gestión de deuda técnica',
    descripcion: 'Para identificar, categorizar y priorizar deuda técnica. Úsalo con "deuda técnica", "¿qué debemos refactorizar?" o "ayúdame a priorizar el trabajo de limpieza".'
  },
  'search-strategy': {
    nombre: 'Estrategia de búsqueda multi-fuente',
    descripcion: 'Para descomponer consultas y orquestar búsquedas en múltiples fuentes. Convierte lenguaje natural en una estrategia de búsqueda optimizada y sintetiza resultados de fuentes heterogéneas.'
  },
  'close-management': {
    nombre: 'Gestión del cierre contable mensual',
    descripcion: 'Para gestionar el proceso de cierre de fin de mes con secuenciación de tareas, dependencias y seguimiento de estado. Úsalo al planificar el cierre, verificar que los pasos están completos o comunicar el estado.'
  },
  'reconciliation': {
    nombre: 'Conciliación contable',
    descripcion: 'Para conciliar cuentas comparando saldos del libro mayor con subledgers, extractos bancarios u otras fuentes. Úsalo al preparar la conciliación mensual, investigar diferencias o documentar items pendientes.'
  },
  'draft-offer': {
    nombre: 'Redactar carta de oferta',
    descripcion: 'Para redactar una carta de oferta con detalles de compensación y condiciones. Úsalo cuando un candidato esté listo para recibir una oferta y necesites preparar la comunicación formal.'
  },
  'meeting-briefing': {
    nombre: 'Briefing para reuniones legales',
    descripcion: 'Para preparar briefings estructurados para reuniones con relevancia legal y registrar resultados. Úsalo antes de reuniones de negociación, revisiones de contratos o sesiones con partes externas.'
  },
  'vendor-check': {
    nombre: 'Verificación de acuerdos con proveedores',
    descripcion: 'Para comprobar el estado de acuerdos existentes con un proveedor en todos los sistemas conectados. Úsalo al revisar la cobertura contractual, verificar términos activos o investigar una relación con proveedor.'
  },
  'incident-response': {
    nombre: 'Respuesta a incidentes',
    descripcion: 'Para ejecutar un flujo de respuesta a incidentes: triaje, comunicación y redacción del postmortem. Úsalo al inicio de un incidente de producción o al redactar la revisión posterior.'
  },
  'testing-strategy': {
    nombre: 'Estrategia de testing',
    descripcion: 'Para diseñar estrategias y planes de prueba. Úsalo con "¿cómo deberíamos probar esto?", "plan de testing para X" o "¿qué falta en nuestra cobertura de pruebas?".'
  },
  'search': {
    nombre: 'Búsqueda en todas las fuentes',
    descripcion: 'Para buscar en todas las fuentes conectadas en una sola consulta. Úsalo con "encuentra ese documento sobre", "busca mensajes de" o "¿tenemos algo sobre X?".'
  },
  'performance-review': {
    nombre: 'Evaluación de rendimiento',
    descripcion: 'Para estructurar una evaluación de rendimiento con autoevaluación, plantilla para el manager y calibración. Úsalo al preparar ciclos de evaluación, guiar conversaciones de feedback o documentar objetivos de desarrollo.'
  },
  'compliance-check': {
    nombre: 'Verificación de cumplimiento normativo',
    descripcion: 'Para ejecutar una verificación de cumplimiento sobre una acción propuesta, funcionalidad de producto o iniciativa de negocio. Úsalo con "¿es esto compatible con GDPR?", "comprueba el cumplimiento de" o antes de lanzar funcionalidades con implicaciones regulatorias.'
  },
  'system-design': {
    nombre: 'Diseño de sistemas y arquitecturas',
    descripcion: 'Para diseñar sistemas, servicios y arquitecturas. Úsalo con "diseña un sistema para", "¿cómo deberíamos estructurar X?" o "ayúdame a pensar en la arquitectura de este servicio".'
  },
  'knowledge-synthesis': {
    nombre: 'Síntesis de conocimiento multi-fuente',
    descripcion: 'Para combinar resultados de búsqueda de múltiples fuentes en respuestas coherentes y sin duplicados. Úsalo cuando necesites consolidar información de repositorios, wikis, tickets y documentos dispares.'
  },
  'audit-support': {
    nombre: 'Soporte de auditoría SOX 404',
    descripcion: 'Para apoyar el cumplimiento SOX 404 con metodología de prueba de controles, selección de muestras y documentación de evidencia. Úsalo durante la preparación de auditorías internas o externas.'
  },
  'journal-entry': {
    nombre: 'Asientos contables',
    descripcion: 'Para preparar asientos contables con débitos, créditos y detalle de soporte. Úsalo al registrar transacciones, crear entradas de ajuste o documentar asientos complejos de cierre de período.'
  },
  'comp-analysis': {
    nombre: 'Análisis de compensación',
    descripcion: 'Para analizar compensación: benchmarking, posicionamiento en bandas y modelado de equity. Úsalo con "¿competitivo?", "¿dónde cae esto en la banda?" o "modela los refreshes de equity para este equipo".'
  },
  'org-planning': {
    nombre: 'Planificación organizacional',
    descripcion: 'Para planificación de headcount, diseño organizacional y optimización de estructura de equipos. Úsalo con "planificación de org", "necesito contratar X roles" o "ayúdame a pensar en cómo estructurar este equipo".'
  },
  'review-contract': {
    nombre: 'Revisión de contratos',
    descripcion: 'Para revisar un contrato frente al playbook de negociación de tu organización: marcar desviaciones, identificar cláusulas faltantes y sugerir redacciones alternativas. Úsalo al recibir un contrato de un proveedor o cliente.'
  },
  'signature-request': {
    nombre: 'Solicitud de firma electrónica',
    descripcion: 'Para preparar y enrutar un documento para firma electrónica: ejecutar un checklist pre-firma, coordinar la secuencia de firmantes y confirmar la recepción. Úsalo al finalizar un contrato o acuerdo para firma.'
  },
  'recruiting-pipeline': {
    nombre: 'Pipeline de reclutamiento',
    descripcion: 'Para hacer seguimiento y gestionar etapas del pipeline de reclutamiento. Úsalo con "actualización de reclutamiento", "¿dónde están nuestros candidatos?" o "ayúdame a priorizar roles abiertos".'
  },
  'legal-risk-assessment': {
    nombre: 'Evaluación de riesgos legales',
    descripcion: 'Para evaluar y clasificar riesgos legales usando un marco de severidad por probabilidad con escalada recomendada. Úsalo al evaluar una nueva iniciativa, partnership o antes de lanzar una funcionalidad con implicaciones legales.'
  },
  'triage-nda': {
    nombre: 'Triaje de NDAs',
    descripcion: 'Para clasificar rápidamente un NDA entrante como VERDE (aprobación estándar), AMARILLO (revisión necesaria) o ROJO (escalar a legal). Úsalo al recibir un NDA de un proveedor, socio o cliente.'
  },
  'competitive-brief': {
    nombre: 'Briefing competitivo',
    descripcion: 'Para investigar competidores y generar una comparativa de posicionamiento y mensajes. Úsalo al preparar ventas para una reunión competitiva, actualizar battlecards o analizar un nuevo entrante al mercado.'
  },
  'performance-report': {
    nombre: 'Informe de rendimiento de marketing',
    descripcion: 'Para construir un informe de rendimiento de marketing con métricas clave, análisis de tendencias, logros y próximos pasos. Úsalo al resumir resultados de campañas, preparar informes de liderazgo o revisar el rendimiento del canal.'
  },
  'compliance-tracking': {
    nombre: 'Seguimiento de cumplimiento normativo',
    descripcion: 'Para hacer seguimiento de requisitos de cumplimiento y preparación para auditorías. Úsalo con "cumplimiento", "auditoría" o "requisitos regulatorios" para gestionar un inventario de controles y fechas límite.'
  },
  'prospect': {
    nombre: 'Pipeline de prospección comercial',
    descripcion: 'Para el pipeline completo de ICP a leads. Describe tu cliente ideal en lenguaje natural y obtén un listado estructurado con criterios de cualificación y contexto de contacto.'
  },
  'brand-review': {
    nombre: 'Revisión de voz de marca',
    descripcion: 'Para revisar contenido frente a la voz de marca, guía de estilo y pilares de mensajes, marcando desviaciones con sugerencias específicas. Úsalo antes de publicar contenido externo o al incorporar a nuevos redactores.'
  },
  'draft-content': {
    nombre: 'Redactar contenido de marketing',
    descripcion: 'Para redactar posts de blog, redes sociales, newsletters, landing pages, notas de prensa y otros contenidos de marketing. Úsalo cuando necesites contenido en cualquier canal de marketing.'
  },
  'capacity-plan': {
    nombre: 'Planificación de capacidad',
    descripcion: 'Para planificar capacidad de recursos: análisis de carga de trabajo y previsión de utilización. Úsalo cuando la demanda supere la capacidad del equipo, al planificar contrataciones o preparar la planificación del trimestre.'
  },
  'process-optimization': {
    nombre: 'Optimización de procesos de negocio',
    descripcion: 'Para analizar y mejorar procesos de negocio. Úsalo con "este proceso es lento", "¿cómo automatizamos X?" o "ayúdame a rediseñar este flujo de trabajo".'
  },
  'vendor-review': {
    nombre: 'Evaluación de proveedores',
    descripcion: 'Para evaluar un proveedor: análisis de costes, evaluación de riesgos y recomendación. Úsalo al seleccionar un nuevo proveedor, renovar un contrato o comparar alternativas.'
  },
  'brand-voice-enforcement': {
    nombre: 'Aplicación de directrices de marca',
    descripcion: 'Para aplicar las directrices de marca en la creación de contenido. Úsalo cuando los usuarios creen contenido de marketing, escriban comunicaciones externas o necesiten mantener la coherencia de la marca.'
  },
  'call-prep': {
    nombre: 'Preparación de llamadas comerciales',
    descripcion: 'Para preparar una llamada con un cliente o prospect usando señales de Common Room. Úsalo antes de una llamada de descubrimiento, renovación o seguimiento para personalizar el enfoque.'
  },
  'plan-zoom-integration': {
    nombre: 'Planificar integración con Zoom',
    descripcion: 'Para convertir una idea de integración con Zoom en un plan de implementación con arquitectura, autenticación y pasos detallados. Úsalo al diseñar una integración Zoom nueva.'
  },
  'email-sequence': {
    nombre: 'Secuencia de email marketing',
    descripcion: 'Para diseñar y redactar secuencias de emails con texto completo, timing, lógica de ramificación y variantes A/B. Úsalo al crear drips de incorporación, nurturing de leads o campañas post-evento.'
  },
  'risk-assessment': {
    nombre: 'Evaluación de riesgos operativos',
    descripcion: 'Para identificar, evaluar y mitigar riesgos operativos. Úsalo con "¿cuáles son los riesgos de?", "ayúdame a pensar en qué puede salir mal" o "construye un registro de riesgos para este proyecto".'
  },
  'enrich-lead': {
    nombre: 'Enriquecimiento de leads',
    descripcion: 'Para enriquecimiento instantáneo de leads. Introduce un nombre, empresa, URL de LinkedIn o email y obtén contexto estructurado de la cuenta y el contacto antes de una llamada o alcance.'
  },
  'discover-brand': {
    nombre: 'Descubrimiento autónomo de marca',
    descripcion: 'Para orquestar el descubrimiento autónomo de materiales de marca en toda la empresa. Úsalo al incorporar a una nueva marca, actualizar directrices o construir un perfil de marca desde cero.'
  },
  'slack-messaging': {
    nombre: 'Mensajería efectiva en Slack',
    descripcion: 'Para redactar mensajes bien formateados y efectivos en Slack usando sintaxis mrkdwn. Úsalo cuando necesites comunicar actualizaciones de proyecto, compartir datos o escribir anuncios de canal de forma clara.'
  },
  'client-view': {
    nombre: 'Zoom Meeting SDK — Client View web',
    descripcion: 'Para integrar la experiencia de reunión Zoom a página completa (Client View) en web. Úsalo al implementar el SDK web de Zoom en modo Client View para reuniones en el navegador.'
  },
  'content-creation': {
    nombre: 'Creación de contenido de marketing',
    descripcion: 'Para redactar contenido de marketing en múltiples canales: posts de blog, redes sociales, newsletters y más. Úsalo al crear contenido a escala o mantener una voz de marca consistente.'
  },
  'seo-audit': {
    nombre: 'Auditoría SEO completa',
    descripcion: 'Para ejecutar una auditoría SEO completa: investigación de keywords, análisis on-page, gaps de contenido y backlinks. Úsalo al auditar un sitio web, planificar contenido o mejorar el posicionamiento orgánico.'
  },
  'process-doc': {
    nombre: 'Documentar procesos de negocio',
    descripcion: 'Para documentar un proceso de negocio con diagramas de flujo, RACI y SOPs. Úsalo al formalizar un proceso existente, incorporar a un nuevo empleado o preparar documentación de cumplimiento.'
  },
  'sequence-load': {
    nombre: 'Carga masiva en secuencias Apollo',
    descripcion: 'Para encontrar leads que cumplen criterios y añadirlos en masa a una secuencia de alcance en Apollo. Úsalo al lanzar una nueva campaña outbound o escalar el alcance a segmentos objetivo.'
  },
  'account-research': {
    nombre: 'Investigación de cuentas con Common Room',
    descripcion: 'Para investigar una empresa usando datos de Common Room. Úsalo con "investiga [empresa]", "cuéntame sobre [empresa]" o antes de una llamada comercial para preparar contexto.'
  },
  'build-zoom-bot': {
    nombre: 'Construir bot o grabador para Zoom',
    descripcion: 'Para construir un bot de reunión Zoom, grabador o flujo de medios en tiempo real. Úsalo al unirse programáticamente a reuniones, grabar audio/vídeo o procesar medios en directo.'
  },
  'component-view': {
    nombre: 'Zoom Meeting SDK — Component View web',
    descripcion: 'Para integrar componentes de reunión Zoom embebibles (Component View) en web. Úsalo al implementar el SDK web de Zoom en modo Component View para experiencias de reunión parciales en la página.'
  },
  'guideline-generation': {
    nombre: 'Generación de directrices de marca',
    descripcion: 'Para generar o construir directrices de voz de marca a partir de materiales fuente. Úsalo al crear directrices de marca, codificar la voz de marca existente o preparar documentación de onboarding para redactores.'
  },
  'contact-research': {
    nombre: 'Investigación de contactos con Common Room',
    descripcion: 'Para investigar a una persona usando datos de Common Room. Úsalo con "¿quién es [nombre]?", "cuéntame sobre [persona]" o antes de una llamada para entender el historial de un contacto.'
  },
  'slack-search': {
    nombre: 'Búsqueda efectiva en Slack',
    descripcion: 'Para buscar mensajes, archivos, canales y personas en Slack de forma efectiva. Úsalo al localizar conversaciones pasadas, encontrar documentos compartidos o identificar canales relevantes.'
  },
  'cobrowse-sdk': {
    nombre: 'Zoom Cobrowse SDK',
    descripcion: 'Para integrar el Zoom Cobrowse SDK. Úsalo al enrutar a un flujo de soporte colaborativo donde necesites implementar cobrowsing, navegación compartida o asistencia remota.'
  },
  'web': {
    nombre: 'Zoom Contact Center SDK para web',
    descripcion: 'Para integrar el Zoom Contact Center SDK en web: embeds de chat, vídeo, campaña y engagement web. Úsalo al implementar funcionalidades de contact center en una aplicación web.'
  },
  'general': {
    nombre: 'Referencia general de productos Zoom',
    descripcion: 'Para referencias cross-product de Zoom. Úsalo cuando el flujo de trabajo esté claro y necesites seleccionar endpoints, comprender modelos de recursos o navegar entre productos Zoom.'
  },
  'phone': {
    nombre: 'Zoom Phone',
    descripcion: 'Para implementar Zoom Phone. Úsalo al enrutar a un flujo de telefonía cuando necesites gestión de llamadas, configuración de extensiones, enrutamiento o integración con sistemas de telefonía empresarial.'
  },
  'build-zoom-meeting-app': {
    nombre: 'Construir app de reuniones Zoom',
    descripcion: 'Para construir o embeber un flujo de reunión Zoom. Úsalo al implementar joins con Meeting SDK, webhooks de reunión o la API REST de Zoom para gestión del ciclo de vida de reuniones.'
  },
  'android': {
    nombre: 'Zoom Contact Center SDK para Android',
    descripcion: 'Para integrar el Zoom Contact Center SDK en Android nativo: chat, vídeo, ZVA y llamadas programadas. Úsalo al implementar funcionalidades de contact center en una app Android.'
  },
  'debug-zoom': {
    nombre: 'Depurar integraciones Zoom',
    descripcion: 'Para depurar una integración Zoom rota: aislar el punto de fallo y enrutar al flujo de diagnóstico correcto. Úsalo cuando auth, webhooks, joins del SDK o llamadas a la API fallen.'
  },
  'macos': {
    nombre: 'Zoom Meeting SDK para macOS',
    descripcion: 'Para embeber reuniones Zoom en apps nativas de macOS. Úsalo al implementar el SDK nativo de Zoom para macOS con funcionalidades de reunión en aplicaciones de escritorio Apple.'
  },
  'choose-zoom-approach': {
    nombre: 'Elegir arquitectura Zoom',
    descripcion: 'Para elegir la arquitectura Zoom correcta para un caso de uso. Úsalo al decidir entre REST API, Meeting SDK, Video SDK, Contact Center SDK u otras opciones de construcción de Zoom.'
  },
  'ios': {
    nombre: 'Zoom Contact Center SDK para iOS',
    descripcion: 'Para integrar el Zoom Contact Center SDK en iOS nativo: chat, vídeo, ZVA y llamadas programadas. Úsalo al implementar funcionalidades de contact center en una app iOS.'
  },
  'design-mcp-workflow': {
    nombre: 'Diseñar flujo de trabajo con Zoom MCP',
    descripcion: 'Para diseñar un flujo de trabajo con Zoom MCP para Claude. Úsalo al decidir si Zoom MCP es adecuado para un caso de uso y al producir un plan de integración seguro.'
  },
  'electron': {
    nombre: 'Zoom Meeting SDK para Electron',
    descripcion: 'Para embeber reuniones Zoom en apps de escritorio con Electron. Úsalo al implementar el SDK de Zoom en aplicaciones Electron multiplataforma.'
  },
  'react-native': {
    nombre: 'Zoom Meeting SDK para React Native',
    descripcion: 'Para embeber reuniones Zoom en apps React Native. Úsalo al implementar el SDK de Zoom en aplicaciones móviles multiplataforma con React Native.'
  },
  'contact-center': {
    nombre: 'Zoom Contact Center',
    descripcion: 'Para implementar Zoom Contact Center. Úsalo al enrutar a un flujo de contact center cuando necesites gestión de colas, enrutamiento de agentes, analíticas o integraciones de CRM.'
  },
  'debug-zoom-integration': {
    nombre: 'Depuración rápida de integraciones Zoom',
    descripcion: 'Para depurar implementaciones Zoom rotas rápidamente. Úsalo cuando auth, webhooks, joins del SDK o llamadas a la API Zoom fallen de forma inesperada.'
  },
  'meeting-sdk': {
    nombre: 'Zoom Meeting SDK',
    descripcion: 'Para implementar el Zoom Meeting SDK. Úsalo al enrutar a un flujo de embedding de reunión cuando necesites joins del SDK, manejo de medios o gestión del ciclo de vida de reuniones.'
  },
  'linux': {
    nombre: 'Zoom Meeting SDK para Linux',
    descripcion: 'Para el SDK de Zoom en Linux: bots de reunión headless en C++ con acceso a audio/vídeo en bruto. Úsalo al construir grabadores de reunión, bots de transcripción u otras automatizaciones de reunión en Linux.'
  },
  'oauth': {
    nombre: 'Autenticación Zoom OAuth',
    descripcion: 'Para implementar autenticación Zoom. Úsalo al enrutar a un flujo de auth cuando necesites configurar credenciales de app, gestionar tokens o depurar problemas de autorización en Zoom.'
  },
  'unreal': {
    nombre: 'Zoom Meeting SDK para Unreal Engine',
    descripcion: 'Para integrar el wrapper del Zoom Meeting SDK en Unreal Engine. Úsalo al construir experiencias de reunión Zoom en aplicaciones o juegos de Unreal Engine.'
  },
  'windows': {
    nombre: 'Zoom Meeting SDK para Windows',
    descripcion: 'Para embeber reuniones Zoom en apps Windows con el SDK nativo C++. Úsalo al implementar funcionalidades de reunión en aplicaciones de escritorio Windows.'
  },
  'plan-zoom-product': {
    nombre: 'Elegir la superficie de construcción Zoom',
    descripcion: 'Para elegir la superficie de construcción Zoom correcta para un caso de uso y explicar los trade-offs. Úsalo al empezar a planificar un producto Zoom para tomar la decisión de arquitectura correcta desde el inicio.'
  },
  'memory-management': {
    nombre: 'Gestión de memoria en el lugar de trabajo',
    descripcion: 'Para un sistema de memoria de dos niveles que convierte a Claude en un colaborador real del lugar de trabajo. Decodifica notas de reunión, correos y actualizaciones de estado, y mantiene el contexto del proyecto.'
  },
  'probe-sdk': {
    nombre: 'Zoom Probe SDK',
    descripcion: 'Para implementar el Zoom Probe SDK. Úsalo al enrutar a un flujo de preflight donde necesites diagnósticos de red o preparación del entorno antes de unirse a una reunión Zoom.'
  },
  'scribe': {
    nombre: 'Zoom AI Services Scribe',
    descripcion: 'Para implementar Zoom AI Services Scribe. Úsalo al enrutar a un flujo de transcripción cuando necesites transcripción en tiempo real, resúmenes o análisis de contenido de reuniones.'
  },
  'team-chat': {
    nombre: 'Zoom Team Chat',
    descripcion: 'Para implementar Zoom Team Chat. Úsalo al enrutar a un flujo de chat cuando necesites mensajería, bots de canal o integraciones de chat en el ecosistema Zoom.'
  },
  'flutter': {
    nombre: 'Zoom Video SDK para Flutter',
    descripcion: 'Para construir apps de sesión de vídeo personalizadas en Flutter con el Zoom Video SDK. Úsalo al implementar vídeo en tiempo real en apps Flutter multiplataforma.'
  },
  'zoom-apps-sdk': {
    nombre: 'Zoom Apps SDK',
    descripcion: 'Para implementar el Zoom Apps SDK. Úsalo al enrutar a un flujo de app in-client cuando necesites construir apps embebidas dentro del cliente Zoom.'
  },
  'rivet-sdk': {
    nombre: 'Zoom Rivet SDK',
    descripcion: 'Para implementar el Zoom Rivet SDK. Úsalo al enrutar a un flujo basado en Rivet cuando necesites orquestar workflows de servidor para integraciones Zoom.'
  },
  'setup-zoom-oauth': {
    nombre: 'Configurar OAuth de Zoom',
    descripcion: 'Para implementar la autenticación Zoom correctamente. Úsalo al configurar credenciales de app, elegir el tipo de grant correcto, gestionar el ciclo de vida de tokens o depurar errores de autorización.'
  },
  'video-sdk': {
    nombre: 'Zoom Video SDK',
    descripcion: 'Para implementar el Zoom Video SDK. Úsalo al enrutar a un flujo de sesión personalizada cuando necesites vídeo, audio o datos en tiempo real fuera de las reuniones estándar de Zoom.'
  },
  'rtms': {
    nombre: 'Zoom RTMS (Real-Time Media Streaming)',
    descripcion: 'Para implementar Zoom RTMS. Úsalo al enrutar a un flujo de medios en vivo cuando necesites streaming de audio/vídeo en tiempo real desde reuniones Zoom a sistemas externos.'
  },
  'setup-zoom-mcp': {
    nombre: 'Configurar Zoom MCP',
    descripcion: 'Para decidir cuándo Zoom MCP es la solución adecuada y producir un plan de configuración seguro para Claude. Úsalo al evaluar si usar Zoom MCP o la API directa para un flujo de trabajo.'
  },
  'ui-toolkit': {
    nombre: 'Zoom Video SDK UI Toolkit',
    descripcion: 'Para implementar el Zoom Video SDK UI Toolkit. Úsalo al enrutar a un flujo de vídeo web cuando necesites componentes de interfaz de vídeo preconstruidos con el Video SDK.'
  },
  'unity': {
    nombre: 'Zoom Video SDK para Unity',
    descripcion: 'Para integrar el wrapper del Zoom Video SDK en Unity. Úsalo al construir experiencias de sesión de vídeo personalizadas en aplicaciones o juegos de Unity.'
  },
  'sprint-planning': {
    nombre: 'Planificación de sprint',
    descripcion: 'Para planificar un sprint: definir alcance, estimar capacidad, establecer objetivos y redactar el plan. Úsalo al inicio de cada ciclo de sprint para alinear al equipo y priorizar el trabajo.'
  },
  'zoom-mcp': {
    nombre: 'Conectores Zoom MCP para Claude',
    descripcion: 'Para los conectores Zoom MCP integrados. Úsalo al enrutar a un flujo MCP cuando necesites orquestar acciones Zoom mediante herramientas de Claude en lugar de código de integración directo.'
  },
  'metrics-review': {
    nombre: 'Revisión de métricas de producto',
    descripcion: 'Para revisar y analizar métricas de producto con análisis de tendencias e insights accionables. Úsalo al preparar revisiones de negocio, investigar cambios de métricas o priorizar mejoras de producto.'
  },
  'daily-briefing': {
    nombre: 'Briefing diario de ventas',
    descripcion: 'Para empezar el día con un briefing de ventas priorizado. Funciona de forma autónoma cuando indicas tu contexto de ventas o confirmas los parámetros de enfoque para el día.'
  },
  'virtual-agent': {
    nombre: 'Zoom Virtual Agent',
    descripcion: 'Para implementar Zoom Virtual Agent. Úsalo al enrutar a un flujo de agente virtual cuando necesites autoservicio conversacional o routing inteligente de soporte al cliente.'
  },
  'webhooks': {
    nombre: 'Webhooks de Zoom',
    descripcion: 'Para implementar webhooks de Zoom. Úsalo al enrutar a un flujo event-driven cuando necesites reaccionar a eventos de Zoom como inicio de reunión, unirse, salir o grabación completada.'
  },
  'whiteboard': {
    nombre: 'Conector Zoom Whiteboard MCP',
    descripcion: 'Para el conector Zoom Whiteboard MCP integrado. Úsalo con flujos MCP de Whiteboard para manipular pizarras Zoom mediante herramientas de Claude.'
  },
  'product-brainstorming': {
    nombre: 'Brainstorming de producto',
    descripcion: 'Para generar ideas de producto, explorar espacios de problemas y cuestionar supuestos como un crítico constructivo. Úsalo al explorar oportunidades de nuevas funcionalidades o evaluar ideas de producto.'
  },
  'synthesize-research': {
    nombre: 'Síntesis de investigación de usuarios',
    descripcion: 'Para sintetizar investigación de usuarios de entrevistas, encuestas y feedback en temas estructurados, insights y recomendaciones. Úsalo al transformar datos cualitativos en hallazgos accionables.'
  },
  'task-management': {
    nombre: 'Gestión de tareas con TASKS.md',
    descripcion: 'Para gestión simple de tareas usando un archivo TASKS.md compartido. Úsalo cuando el usuario necesite hacer seguimiento de trabajo, actualizar el estado de tareas o mantener una lista de pendientes accesible.'
  },
  'call-summary': {
    nombre: 'Resumen de llamadas',
    descripcion: 'Para procesar notas de llamada o una transcripción: extraer action items, redactar el email de seguimiento y actualizar el CRM. Úsalo justo después de una llamada de cliente o prospect.'
  },
  'draft-outreach': {
    nombre: 'Redactar alcance personalizado',
    descripcion: 'Para investigar a un prospect y redactar alcance personalizado. Usa investigación web por defecto, enriquece con datos de CRM si están disponibles. Úsalo antes de enviar el primer mensaje a un nuevo prospect.'
  },
  'websockets': {
    nombre: 'Zoom WebSockets',
    descripcion: 'Para implementar Zoom WebSockets. Úsalo al enrutar a un flujo de eventos de baja latencia cuando necesites suscripciones en tiempo real a eventos de Zoom sin la sobrecarga de polling.'
  },
  'view-pdf': {
    nombre: 'Visualizador de PDF interactivo',
    descripcion: 'Para un visor de PDF interactivo. Úsalo cuando el usuario quiera abrir, mostrar o visualizar un PDF y navegar por sus páginas de forma interactiva.'
  },
  'roadmap-update': {
    nombre: 'Actualización de roadmap de producto',
    descripcion: 'Para actualizar, crear o repriorizar el roadmap de producto. Úsalo al añadir una nueva iniciativa, reordenar prioridades existentes o preparar una comunicación del roadmap para stakeholders.'
  },
  'write-spec': {
    nombre: 'Escribir spec o PRD',
    descripcion: 'Para escribir una spec de funcionalidad o PRD a partir de un enunciado del problema o idea de funcionalidad. Úsalo cuando quieras alinear al equipo sobre qué construir antes de empezar el desarrollo.'
  },
  'update': {
    nombre: 'Sincronizar tareas y memoria',
    descripcion: 'Para sincronizar tareas y refrescar la memoria desde la actividad actual. Úsalo al incorporar actualizaciones de herramientas conectadas, registrar progreso reciente o preparar el contexto para la siguiente sesión.'
  },
  'competitive-intelligence': {
    nombre: 'Inteligencia competitiva',
    descripcion: 'Para investigar competidores y construir una battlecard interactiva. Genera un artefacto HTML con posicionamiento, comparativa de funcionalidades y brechas de mensajes. Úsalo al preparar ventas o actualizar la estrategia de producto.'
  },
  'writing-rules': {
    nombre: 'Reglas de escritura para plugins',
    descripcion: 'Para crear reglas "hookify", escribir directrices de escritura o configurar guías de estilo en un plugin. Úsalo cuando el usuario pida crear o actualizar reglas de escritura para un plugin de Claude Code.'
  },
  'pipeline-review': {
    nombre: 'Revisión del pipeline de ventas',
    descripcion: 'Para analizar la salud del pipeline: priorizar deals, marcar riesgos y obtener un plan de acción semanal. Úsalo en revisiones semanales de ventas o al preparar una previsión para liderazgo.'
  },
  'agent-development': {
    nombre: 'Desarrollo de agentes para plugins',
    descripcion: 'Para crear un agente, añadir un agente o construir capacidades autónomas en un plugin de Claude Code. Úsalo cuando el usuario quiera añadir comportamiento agentivo a su plugin.'
  },
  'plugin-settings': {
    nombre: 'Configuración de plugins',
    descripcion: 'Para gestionar la configuración de plugins: almacenar credenciales de API, configurar preferencias de usuario o ajustar el comportamiento del plugin. Úsalo cuando el usuario pregunte sobre ajustes o configuración del plugin.'
  },
  'configure': {
    nombre: 'Configurar canal de Discord',
    descripcion: 'Para configurar el canal de Discord: guardar el token del bot y revisar la política de acceso. Úsalo al configurar por primera vez un bot de Discord o al modificar permisos de canal existentes.'
  },
  'example-skill': {
    nombre: 'Skill de ejemplo',
    descripcion: 'Para demostrar skills, mostrar ejemplos de skills o entender cómo funcionan las skills en Claude Code. Úsalo como referencia al aprender sobre el sistema de skills.'
  },
  'claude-opus-4-5-migration': {
    nombre: 'Migración a Claude Opus 4.5',
    descripcion: 'Para migrar prompts y código desde Claude Sonnet 4.0, Sonnet 4.5 u Opus 4.1 a Opus 4.5. Úsalo al actualizar integraciones, ajustar prompts o validar compatibilidad con el nuevo modelo.'
  },
  'command-development': {
    nombre: 'Desarrollo de slash commands para plugins',
    descripcion: 'Para crear un slash command, añadir un slash command o construir comandos invocables por el usuario en un plugin de Claude Code. Úsalo cuando el usuario quiera añadir acciones explícitas al plugin.'
  },
  'plugin-structure': {
    nombre: 'Estructura de plugins para Claude Code',
    descripcion: 'Para crear un plugin, hacer scaffolding de la estructura de un plugin o entender cómo organizar un plugin de Claude Code. Úsalo al iniciar un nuevo plugin o al reorganizar uno existente.'
  },
  'claude-automation-recommender': {
    nombre: 'Recomendador de automatizaciones Claude Code',
    descripcion: 'Para analizar un codebase y recomendar automatizaciones de Claude Code (hooks, subagentes, skills, comandos). Úsalo cuando un equipo quiera sacar más provecho de Claude Code en su flujo de desarrollo.'
  },
  'hook-development': {
    nombre: 'Desarrollo de hooks para plugins',
    descripcion: 'Para crear un hook, añadir un PreToolUse hook o construir comportamiento automatizado en un plugin de Claude Code. Úsalo cuando el usuario quiera que su plugin reaccione automáticamente a eventos.'
  },
  'skill-development': {
    nombre: 'Desarrollo de skills para plugins',
    descripcion: 'Para crear una skill, añadir una skill o construir capacidades especializadas en un plugin de Claude Code. Úsalo cuando el usuario quiera añadir comportamiento contextual a su plugin.'
  },
  'claude-md-improver': {
    nombre: 'Mejorador de archivos CLAUDE.md',
    descripcion: 'Para auditar y mejorar archivos CLAUDE.md en repositorios. Úsalo cuando el usuario pida revisar, mejorar o actualizar el CLAUDE.md de un proyecto para maximizar la efectividad con Claude Code.'
  },
  'build-mcpb': {
    nombre: 'Empaquetar un servidor MCP',
    descripcion: 'Para empaquetar un servidor MCP, bundlear un MCP o preparar un servidor MCP para distribución. Úsalo cuando el usuario quiera distribuir su servidor MCP como un artefacto standalone.'
  },
  'mcp-integration': {
    nombre: 'Integrar servidor MCP en plugins',
    descripcion: 'Para añadir un servidor MCP, integrar un MCP o conectar herramientas externas a un plugin de Claude Code. Úsalo cuando el usuario quiera ampliar las capacidades de su plugin mediante MCPs.'
  },
  'access': {
    nombre: 'Gestión de acceso al canal Discord',
    descripcion: 'Para gestionar el acceso al canal de Discord: aprobar pairings, editar listas de permitidos y configurar políticas de DM/grupo. Úsalo al controlar quién puede interactuar con el bot de Discord.'
  },
  'example-command': {
    nombre: 'Comando de ejemplo',
    descripcion: 'Para demostrar opciones de frontmatter y la estructura de un skill invocable por usuario. Úsalo como referencia al aprender a crear comandos en plugins de Claude Code.'
  },
  'math-olympiad': {
    nombre: 'Problemas de olimpiadas de matemáticas',
    descripcion: 'Para resolver problemas de matemáticas de competición (IMO, Putnam, USAMO, AIME) con verificación adversarial. Úsalo con problemas de olimpiadas que requieran demostraciones rigurosas y verificación de soluciones.'
  },
  'build-mcp-app': {
    nombre: 'Construir app MCP interactiva',
    descripcion: 'Para construir una app MCP, añadir interactividad MCP o crear experiencias impulsadas por MCP. Úsalo cuando el usuario quiera construir una aplicación que use el protocolo MCP como interfaz principal.'
  },
  'build-mcp-server': {
    nombre: 'Construir servidor MCP',
    descripcion: 'Para construir un servidor MCP, crear un servidor MCP o implementar el Model Context Protocol. Úsalo cuando el usuario quiera exponer herramientas o recursos a Claude mediante MCP.'
  },

  // --- claude-cookbooks ---
  'analyzing-financial-statements': {
    nombre: 'Análisis de estados financieros',
    descripcion: 'Para calcular ratios y métricas financieras clave a partir de estados financieros: liquidez, rentabilidad, apalancamiento y eficiencia. Úsalo al evaluar la salud financiera de una empresa o comparar el rendimiento entre períodos.'
  },
  'applying-brand-guidelines': {
    nombre: 'Aplicar directrices de marca corporativa',
    descripcion: 'Para aplicar branding y estilo corporativo consistente a todos los documentos generados. Úsalo cuando el contenido de salida deba cumplir con las directrices de marca de una organización específica.'
  },
  'creating-financial-models': {
    nombre: 'Crear modelos financieros avanzados',
    descripcion: 'Para una suite avanzada de modelado financiero con análisis DCF, análisis de sensibilidad y modelado de escenarios. Úsalo al valorar empresas, proyectar flujos de caja o evaluar decisiones de inversión.'
  },
  'executive-briefing': {
    nombre: 'Briefing ejecutivo',
    descripcion: 'Para transformar hallazgos de investigación en briefings listos para ejecutivos. Úsalo automáticamente al producir outputs de investigación o análisis que necesiten presentarse a liderazgo senior.'
  },

  // --- healthcare ---
  'fhir-developer-skill': {
    nombre: 'Desarrollo FHIR para APIs de salud',
    descripcion: 'Para desarrollo de API FHIR en endpoints sanitarios. Úsalo al crear recursos FHIR R4/R5, implementar queries FHIR, integrar con sistemas EHR o construir flujos de trabajo sanitarios con cumplimiento HIPAA.'
  },
  'prior-auth-review-skill': {
    nombre: 'Revisión de preautorizaciones sanitarias',
    descripcion: 'Para automatizar la revisión de solicitudes de preautorización (PA) por parte de pagadores sanitarios. Úsalo al evaluar solicitudes PA frente a criterios de cobertura y directrices clínicas.'
  },

  // --- claude-agent-sdk-demos ---
  'cookbook-audit': {
    nombre: 'Auditoría de notebooks de Anthropic Cookbook',
    descripcion: 'Para auditar un notebook de Anthropic Cookbook basándose en una rúbrica. Úsalo cuando un notebook necesite revisión de calidad, validación de contenido o verificación de conformidad con los estándares del cookbook.'
  },

  // --- skills con nombre en inglés no captados ---
  'rest-api': {
    nombre: 'Referencia de la API REST de Zoom',
    descripcion: 'Para la API REST de Zoom. Úsalo al elegir un flujo basado en API cuando necesites selección de endpoints, modelado de recursos o autenticación para integraciones Zoom programáticas.'
  },

  // --- knowledge-work-plugins adicionales ---
  'nextflow-development': {
    nombre: 'Desarrollo con Nextflow y nf-core',
    descripcion: 'Para ejecutar pipelines de bioinformática nf-core (rnaseq, sarek, atacseq) sobre datos de secuenciación. Úsalo al analizar RNA-seq, WGS/WES o datos ATAC-seq con infraestructura de pipeline reproducible.'
  },
  'start': {
    nombre: 'Configurar entorno de bio-investigación',
    descripcion: 'Para configurar tu entorno de bio-investigación y explorar las herramientas disponibles. Úsalo al orientarte por primera vez con el plugin, comprobar qué herramientas están disponibles o restablecer el estado del entorno.'
  },
  'scvi-tools': {
    nombre: 'Deep learning para single-cell con scvi-tools',
    descripcion: 'Para análisis de single-cell con deep learning usando scvi-tools. Úsalo al modelar datos de células individuales, eliminar efectos batch, realizar integración multi-modal o clustering probabilístico.'
  },
  'instrument-data-to-allotrope': {
    nombre: 'Convertir datos de instrumentos a Allotrope',
    descripcion: 'Para convertir archivos de salida de instrumentos de laboratorio (PDF, CSV, Excel, TXT) al formato Allotrope Simple Model (ASM). Úsalo al integrar datos de instrumentos en plataformas científicas basadas en Allotrope.'
  },
  'single-cell-rna-qc': {
    nombre: 'Control de calidad de RNA-seq single-cell',
    descripcion: 'Para realizar control de calidad en datos de RNA-seq single-cell (archivos .h5ad o .h5). Úsalo al evaluar la calidad de datos scRNA-seq, filtrar células de baja calidad o preparar datos para análisis posteriores.'
  },

  // --- skills a medias (nombre en ES pero descripción en EN) ---
  'theme-factory': {
    nombre: 'Fábrica de temas para artefactos',
    descripcion: 'Para aplicar estilos y temas a artefactos como diapositivas, documentos o interfaces. Úsalo cuando necesites aplicar un tema visual consistente a múltiples artefactos o componentes de interfaz.'
  },
  'brand-guidelines': {
    nombre: 'Directrices de marca Anthropic',
    descripcion: 'Para aplicar los colores oficiales de marca y tipografía de Anthropic a cualquier tipo de artefacto. Úsalo cuando necesites generar contenido o documentos visualmente alineados con la identidad de marca de Anthropic.'
  },
  'mcp-builder': {
    nombre: 'Constructor de servidores MCP',
    descripcion: 'Para crear servidores MCP de alta calidad que permiten a los LLMs interactuar con servicios y datos externos. Úsalo al diseñar la arquitectura de un servidor MCP, implementar handlers o preparar el servidor para distribución.'
  },
  'web-artifacts-builder': {
    nombre: 'Constructor de artefactos web avanzados',
    descripcion: 'Para crear artefactos HTML elaborados y multi-componente en claude.ai usando tecnologías web frontend. Úsalo cuando necesites interfaces interactivas complejas, visualizaciones de datos o aplicaciones web como artefactos.'
  },
  'doc-coauthoring': {
    nombre: 'Coautoría de documentación',
    descripcion: 'Para guiar a los usuarios por un flujo de trabajo estructurado de coautoría de documentación. Úsalo cuando el usuario necesite escribir o mejorar documentación técnica o de producto de forma colaborativa.'
  },
  'slack-gif-creator': {
    nombre: 'Creador de GIFs para Slack',
    descripcion: 'Para crear GIFs animados optimizados para Slack con las restricciones de tamaño y formato correctas. Úsalo cuando necesites GIFs personalizados para comunicaciones en Slack.'
  },
  'webapp-testing': {
    nombre: 'Testing de aplicaciones web con Playwright',
    descripcion: 'Para probar e interactuar con aplicaciones web locales usando Playwright. Úsalo al verificar funcionalidades, automatizar flujos de usuario o depurar problemas de interfaz en apps web en desarrollo.'
  },
  'internal-comms': {
    nombre: 'Comunicaciones internas de empresa',
    descripcion: 'Para escribir todo tipo de comunicaciones internas usando los formatos y convenciones de la empresa. Úsalo al redactar anuncios, actualizaciones de equipo, memos internos o comunicaciones de liderazgo.'
  },
};

// ---------------------------------------------------------------------------
// MAIN
// ---------------------------------------------------------------------------
const t0 = Date.now();

// 1. GET todas las skills de anthropic
const res = await fetch(
  `${BASE}/rest/v1/skills_catalog?author=eq.anthropic&select=slug,nombre,descripcion&limit=500`,
  { headers: { apikey: KEY, authorization: `Bearer ${KEY}` } }
);
if (!res.ok) throw new Error(`GET failed: ${res.status} ${await res.text()}`);
const skills = await res.json();
console.log(`Total anthropic skills: ${skills.length}`);

// 2. Filtrar las que están en inglés
const toTranslate = skills.filter(isEnglish);
const skipped     = skills.length - toTranslate.length;
console.log(`En inglés (a traducir): ${toTranslate.length}`);
console.log(`Ya en español (skip):   ${skipped}\n`);

// 3. Separar las que tienen traducción vs las que no
const withTranslation    = toTranslate.filter(s => TRANSLATIONS[s.slug]);
const withoutTranslation = toTranslate.filter(s => !TRANSLATIONS[s.slug]);

if (withoutTranslation.length > 0) {
  console.log(`AVISO: ${withoutTranslation.length} skills en inglés sin traducción hardcodeada:`);
  withoutTranslation.forEach(s => console.log(`  - ${s.slug}`));
  console.log();
}

// 4. PATCH individual
let ok = 0, fail = 0;
const examples = [];

for (let i = 0; i < withTranslation.length; i++) {
  const skill = withTranslation[i];
  const tr    = TRANSLATIONS[skill.slug];

  // Progreso cada 30
  if (i > 0 && i % 30 === 0) {
    console.log(`  → Progreso: ${i}/${withTranslation.length} (OK=${ok} FAIL=${fail})`);
  }

  const patchRes = await fetch(
    `${BASE}/rest/v1/skills_catalog?slug=eq.${encodeURIComponent(skill.slug)}&author=eq.anthropic`,
    {
      method: 'PATCH',
      headers: {
        apikey: KEY,
        authorization: `Bearer ${KEY}`,
        'content-type': 'application/json',
        prefer: 'return=minimal',
      },
      body: JSON.stringify({ nombre: tr.nombre, descripcion: tr.descripcion }),
    }
  );

  if (patchRes.ok) {
    ok++;
    if (examples.length < 3) {
      examples.push({ slug: skill.slug, antes: { nombre: skill.nombre, descripcion: (skill.descripcion||'').slice(0,80) }, despues: tr });
    }
  } else {
    fail++;
    const errText = await patchRes.text();
    console.error(`  FAIL [${skill.slug}]: ${patchRes.status} ${errText}`);
  }
}

// 5. Reporte final
const elapsed = ((Date.now() - t0) / 1000).toFixed(1);
console.log('\n=== REPORTE FINAL ===');
console.log(`Total anthropic:    ${skills.length}`);
console.log(`En inglés:          ${toTranslate.length}`);
console.log(`Con traducción:     ${withTranslation.length}`);
console.log(`Sin traducción:     ${withoutTranslation.length}`);
console.log(`Ya en español:      ${skipped}`);
console.log(`PATCH OK:           ${ok}`);
console.log(`PATCH FAIL:         ${fail}`);
console.log(`Tiempo:             ${elapsed}s`);
console.log('\n--- 3 ejemplos de traducción ---');
examples.forEach(e => {
  console.log(`\n[${e.slug}]`);
  console.log(`  Antes nombre:  ${e.antes.nombre}`);
  console.log(`  Antes desc:    ${e.antes.descripcion}...`);
  console.log(`  Después nombre: ${e.despues.nombre}`);
  console.log(`  Después desc:   ${e.despues.descripcion.slice(0,100)}...`);
});
