#!/usr/bin/env node
/**
 * translate-batch1.mjs — Traduce nombre+descripcion de 181 skills al español neutro.
 * Autores: dotnet (37), danielmiessler (70), trailofbits (73), smithery-ai (1)
 * NO toca: content, file_tree, repo_url, categoria, icon_url, ni ningún otro campo.
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
// TRADUCCIONES — generadas por Claude, español neutro
// Formato: { slug: { author, nombre, descripcion } }
// ---------------------------------------------------------------------------
const TRANSLATIONS = {

  // ============================================================
  // dotnet (37 skills)
  // ============================================================
  'write-xaml-tests': {
    author: 'dotnet',
    nombre: 'Crear tests XAML',
    descripcion: 'Úsalo cuando necesites crear tests unitarios XAML en el proyecto Controls.Xaml.UnitTests. Cubre parseo XAML, compilación (XamlC) y generación de código. No usar para interacciones de UI.'
  },
  'ci-test-failures': {
    author: 'dotnet',
    nombre: 'Diagnosticar fallos CI',
    descripcion: 'Para investigar fallos en GitHub Actions: extraer tests fallidos, descargar logs y crear o actualizar issues de tests fallidos. Úsalo cuando CI esté rojo o haya fallos en Helix.'
  },
  'cli-e2e-testing': {
    author: 'dotnet',
    nombre: 'Tests E2E de CLI con Aspire',
    descripcion: 'Guía para escribir tests end-to-end del CLI de Aspire usando automatización de terminal Hex1b. Úsalo para crear, modificar o depurar tests E2E de CLI.'
  },
  'create-pr': {
    author: 'dotnet',
    nombre: 'Crear pull request',
    descripcion: 'Para crear un pull request usando la plantilla del repositorio. Úsalo cuando el usuario pida: crear PR, abrir PR, enviar cambios a revisión o hacer push y abrir pull request.'
  },
  'dashboard-testing': {
    author: 'dotnet',
    nombre: 'Tests del Dashboard Aspire',
    descripcion: 'Guía para escribir tests del Dashboard de Aspire, incluyendo tests unitarios y tests de componentes Blazor. Úsalo para crear, modificar o depurar tests del dashboard.'
  },
  'hex1b': {
    author: 'dotnet',
    nombre: 'Automatización de terminal Hex1b',
    descripcion: 'Para automatizar cualquier aplicación de terminal — TUIs, shells, REPLs, herramientas CLI. Úsalo cuando necesites lanzar procesos en terminal virtual, capturar pantalla, inyectar teclas/ratón, tomar capturas o grabar sesiones.'
  },
  'add-new-jit-ee-api': {
    author: 'dotnet',
    nombre: 'Añadir API JIT-EE',
    descripcion: 'Para añadir una nueva API a la interfaz JIT-VM (JIT-EE) en el codebase de dotnet/runtime.'
  },
  'performance-benchmark': {
    author: 'dotnet',
    nombre: 'Benchmark de rendimiento',
    descripcion: 'Para generar y ejecutar benchmarks de rendimiento ad hoc que validen cambios de código en dotnet/runtime. Úsalo cuando necesites perfilar o medir el impacto de un cambio.'
  },
  'run-integration-tests': {
    author: 'dotnet',
    nombre: 'Ejecutar tests de integración .NET MAUI',
    descripcion: 'Para compilar, empaquetar y ejecutar tests de integración de .NET MAUI localmente, validando plantillas, ejemplos y escenarios end-to-end con el workload local.'
  },
  'evaluate-pr-tests': {
    author: 'dotnet',
    nombre: 'Evaluar tests de un PR',
    descripcion: 'Para evaluar los tests añadidos en un PR: cobertura, calidad, casos borde y tipo de test apropiado. Revisa si cubren el fix e identifica gaps. Preferir tests unitarios sobre tests de dispositivo.'
  },
  'pr-finalize': {
    author: 'dotnet',
    nombre: 'Finalizar PR para merge',
    descripcion: 'Para verificar título/descripción del PR e implmentar revisión de código antes del merge. Úsalo antes de mergear cualquier PR o cuando la implementación haya cambiado durante la revisión.'
  },
  'learn-from-pr': {
    author: 'dotnet',
    nombre: 'Aprender de un PR completado',
    descripcion: 'Para analizar un PR finalizado y extraer lecciones del comportamiento del agente. Úsalo tras cualquier PR con implicación de agente: identifica patrones y genera recomendaciones para skills e instrucciones.'
  },
  'run-helix-tests': {
    author: 'dotnet',
    nombre: 'Ejecutar tests en Helix',
    descripcion: 'Para enviar y monitorear tests unitarios de .NET MAUI en la infraestructura Helix. Soporta XAML, Resizetizer, Core, Essentials y otros proyectos de tests en colas Helix distribuidas.'
  },
  'write-ui-tests': {
    author: 'dotnet',
    nombre: 'Crear tests de UI',
    descripcion: 'Para crear tests de UI para un issue de GitHub y verificar que reproducen el bug. Itera hasta que los tests fallen (probando que detectan el problema). Úsalo cuando falten tests en un PR.'
  },
  'find-reviewable-pr': {
    author: 'dotnet',
    nombre: 'Encontrar PRs para revisar',
    descripcion: 'Para encontrar PRs abiertos en dotnet/maui y dotnet/docs-maui que sean buenos candidatos para revisión, priorizando por milestone, etiquetas de prioridad y estado partner/comunidad.'
  },
  'try-fix': {
    author: 'dotnet',
    nombre: 'Probar una solución alternativa',
    descripcion: 'Para intentar UNA corrección alternativa para un bug, probarla empíricamente y reportar resultados. Siempre explora un enfoque diferente al del PR existente. Úsalo cuando CI o un agente necesite alternativas independientes.'
  },
  'aspire': {
    author: 'dotnet',
    nombre: 'Operar con Aspire CLI',
    descripcion: 'Para trabajar con aplicaciones Aspire distribuidas mediante el CLI de Aspire: iniciar/reiniciar/detener el AppHost, inspeccionar recursos, logs, trazas, salud, añadir integraciones y gestionar secretos o configuración.'
  },
  'dependency-update': {
    author: 'dotnet',
    nombre: 'Actualizar dependencias NuGet',
    descripcion: 'Para guiar actualizaciones de versiones de dependencias: verifica últimas versiones en nuget.org, activa el pipeline dotnet-migrate-package en Azure DevOps y monitorea las ejecuciones.'
  },
  'pr-testing': {
    author: 'dotnet',
    nombre: 'Probar un PR de Aspire',
    descripcion: 'Para descargar y probar el CLI de Aspire desde un build de PR, verificar la versión y ejecutar escenarios de prueba basados en los cambios del PR.'
  },
  'azdo-build-investigator': {
    author: 'dotnet',
    nombre: 'Investigar fallos CI en Azure DevOps',
    descripcion: 'Para investigar fallos CI en PRs de dotnet/maui: errores de compilación, logs de Helix y análisis de binlogs. Úsalo cuando CI esté rojo, haya fallos de tests de dispositivo o errores de compilación.'
  },
  'issue-triage': {
    author: 'dotnet',
    nombre: 'Triaje de issues de GitHub',
    descripcion: 'Para consultar y triar issues abiertos de GitHub que necesiten atención: identificar issues sin milestone, sin etiquetas o que requieran investigación.'
  },
  'run-device-tests': {
    author: 'dotnet',
    nombre: 'Ejecutar tests en dispositivo',
    descripcion: 'Para compilar y ejecutar tests de dispositivo de .NET MAUI localmente con filtrado por categoría. Soporta iOS, MacCatalyst, Android en macOS y Android/Windows en Windows.'
  },
  'verify-tests-fail-without-fix': {
    author: 'dotnet',
    nombre: 'Verificar que los tests fallan sin el fix',
    descripcion: 'Para verificar que los tests de UI detectan el bug. Soporta dos modos: solo verificar fallo (creación de tests) o verificación completa (test + validación del fix).'
  },
  'api-review': {
    author: 'dotnet',
    nombre: 'Revisar superficie de API .NET',
    descripcion: 'Para revisar PRs que modifican la superficie de API de .NET: detecta violaciones de las guías de diseño del .NET Framework y convenciones de Aspire. Incluye atribución por git blame.'
  },
  'connection-properties': {
    author: 'dotnet',
    nombre: 'Agente de Connection Properties en Aspire',
    descripcion: 'Agente especializado para crear y mejorar Connection Properties en archivos de recursos Aspire y READMEs.'
  },
  'deployment-e2e-testing': {
    author: 'dotnet',
    nombre: 'Tests E2E de despliegue en Aspire',
    descripcion: 'Para escribir tests end-to-end de despliegue en Aspire que despliegan a Azure. Úsalo para crear, modificar o depurar tests E2E de despliegue.'
  },
  'startup-perf': {
    author: 'dotnet',
    nombre: 'Medir rendimiento de arranque en Aspire',
    descripcion: 'Para medir el rendimiento de arranque de aplicaciones Aspire usando dotnet-trace y TraceAnalyzer. Úsalo cuando necesites evaluar el impacto de un cambio de código en el tiempo de inicio.'
  },
  'fix-flaky-test': {
    author: 'dotnet',
    nombre: 'Corregir tests inestables',
    descripcion: 'Para reproducir y corregir tests inestables o en cuarentena. Intenta reproducción local primero (rápido) y luego cae a workflow CI. Úsalo para investigar, reproducir o arreglar tests con fallos intermitentes.'
  },
  'test-management': {
    author: 'dotnet',
    nombre: 'Gestionar tests problemáticos',
    descripcion: 'Para poner en cuarentena o deshabilitar tests inestables o problemáticos usando la utilidad QuarantineTools.'
  },
  'breaking-change-doc': {
    author: 'dotnet',
    nombre: 'Documentar cambios breaking en .NET',
    descripcion: 'Para generar documentación de cambios que rompen compatibilidad en PRs de dotnet/runtime mergeados. Úsalo para crear docs de breaking change o procesar PRs etiquetados con `needs-breaking-change-doc-created`.'
  },
  'vmr-codeflow-status': {
    author: 'dotnet',
    nombre: 'Estado del flujo VMR',
    descripcion: 'Para analizar el estado de PRs de codeflow VMR en repos de dotnet. Úsalo para investigar PRs de codeflow estancados, verificar si los fixes han propagado por el pipeline VMR o diagnosticar PRs de backflow.'
  },
  'update-container-images': {
    author: 'dotnet',
    nombre: 'Actualizar imágenes de contenedor',
    descripcion: 'Para actualizar etiquetas de imágenes Docker usadas por las integraciones de hosting de Aspire. Consulta registros con tags más nuevos y aplica actualizaciones compatibles con versión.'
  },
  'ci-analysis': {
    author: 'dotnet',
    nombre: 'Analizar estado de CI',
    descripcion: 'Para analizar el estado de compilación y tests en Azure DevOps y Helix para PRs de repos dotnet. Úsalo cuando CI esté rojo, haya fallos de tests, o necesites saber si un PR está listo para merge.'
  },
  'jit-regression-test': {
    author: 'dotnet',
    nombre: 'Crear test de regresión JIT',
    descripcion: 'Para extraer un test de regresión JIT standalone desde un issue de GitHub y guardarlo en la carpeta JitBlue. Úsalo para convertir el código de reproducción de un issue en un test xunit.'
  },
  'api-proposal': {
    author: 'dotnet',
    nombre: 'Propuesta de API con prototipo',
    descripcion: 'Para crear propuestas de API con prototipo para dotnet/runtime: desde investigación hasta prototipado, generación de ref source y publicación. No usar para bug fixes, revisión de código ni benchmarking.'
  },
  'extensions-review': {
    author: 'dotnet',
    nombre: 'Revisar código Microsoft.Extensions',
    descripcion: 'Para escribir y modificar código de `Microsoft.Extensions.*` y `System.IO.Compression` en dotnet/runtime. Cubre DI, configuración, validación de opciones, logging, caché y ciclo de vida del host.'
  },
  'update-os-coverage': {
    author: 'dotnet',
    nombre: 'Actualizar cobertura de SO en Helix',
    descripcion: 'Para actualizar referencias de versiones de SO en definiciones de colas Helix: añadir nuevas versiones, reemplazar versiones EOL o auditar cobertura frente a la matriz supported-os.'
  },

  // ============================================================
  // danielmiessler (70 skills)
  // ============================================================
  'alex-hormozi-pitch': {
    author: 'danielmiessler',
    nombre: 'Crear pitch irresistible con método Hormozi',
    descripcion: 'Para crear ofertas y pitches usando la metodología de Alex Hormozi (libro "$100M Offers"). Cubre ecuación de valor, marcos de garantía, psicología de precios y diseño de ofertas que no se pueden rechazar.'
  },
  'always-init': {
    author: 'danielmiessler',
    nombre: 'Inicializar contexto PAI',
    descripcion: 'Inicializador universal de tareas que carga automáticamente el contexto PAI para todas las solicitudes. Garantiza que contactos, preferencias y protocolos estén disponibles antes de responder.'
  },
  'prompting': {
    author: 'danielmiessler',
    nombre: 'Estándares de ingeniería de prompts',
    descripcion: 'Para aplicar estándares de ingeniería de prompts y contexto para agentes IA basados en buenas prácticas de Anthropic. Cubre claridad, estructura, descubrimiento progresivo y optimización señal/ruido.'
  },
  'create-skill': {
    author: 'danielmiessler',
    nombre: 'Crear skill en infraestructura PAI',
    descripcion: 'Para crear, actualizar o estructurar una nueva skill que extienda capacidades con conocimiento especializado, flujos de trabajo o integraciones. Sigue los estándares Anthropic y patrones PAI específicos.'
  },
  'fabric': {
    author: 'danielmiessler',
    nombre: 'Seleccionar patrón Fabric inteligentemente',
    descripcion: 'Para seleccionar automáticamente el patrón correcto de los 242+ prompts especializados de Fabric según tu intención: análisis de amenazas, resúmenes, extracción, creación de contenido y más.'
  },
  'ffuf': {
    author: 'danielmiessler',
    nombre: 'Fuzzing web con ffuf',
    descripcion: 'Para realizar fuzzing web experto con ffuf en pentesting: fuzzing autenticado con solicitudes raw, auto-calibración y análisis de resultados.'
  },
  'AnnualReports': {
    author: 'danielmiessler',
    nombre: 'Analizar informes anuales de seguridad',
    descripcion: 'Para agregar y analizar informes anuales de seguridad de principales vendors: extraer tendencias, comparar panoramas de amenazas año a año y producir resúmenes de inteligencia de amenazas sintetizada.'
  },
  'Art': {
    author: 'danielmiessler',
    nombre: 'Generar arte e imágenes',
    descripcion: 'Para generar ilustraciones, diagramas técnicos, diagramas Mermaid, infografías, imágenes de cabecera, miniaturas, cómics e iconos PAI usando múltiples backends de renderizado.'
  },
  'ExtractWisdom': {
    author: 'danielmiessler',
    nombre: 'Extraer sabiduría de contenidos',
    descripcion: 'Para extracción de sabiduría adaptada al dominio del contenido: detecta dominios presentes y construye secciones personalizadas. Produce informes de insights desde vídeos, podcasts y artículos.'
  },
  'src': {
    author: 'danielmiessler',
    nombre: 'Componer agentes personalizados',
    descripcion: 'Para componer agentes personalizados desde Rasgos Base + Voz + Especialización. Úsalo cuando necesites crear, listar, cargar o lanzar agentes paralelos con personalidades especializadas.'
  },
  'PrivateInvestigator': {
    author: 'danielmiessler',
    nombre: 'Búsqueda ética de personas',
    descripcion: 'Para búsquedas éticas de personas usando 15 agentes de investigación paralelos (45 hilos) en registros públicos, redes sociales y búsquedas inversas. Solo datos públicos, sin suplantación.'
  },
  'OSINT': {
    author: 'danielmiessler',
    nombre: 'Investigaciones OSINT estructuradas',
    descripcion: 'Para investigaciones OSINT: búsqueda de personas, inteligencia empresarial, due diligence, reconocimiento de dominio e investigación de organizaciones usando fuentes públicas con framework ético.'
  },
  'Remotion': {
    author: 'danielmiessler',
    nombre: 'Crear vídeos programáticos con Remotion',
    descripcion: 'Para creación de vídeo programático con React vía Remotion: composiciones, animaciones, motion graphics renderizados a MP4. Úsalo para vídeos de YouTube, TikTok, intros o animaciones de contenido.'
  },
  'BrightData': {
    author: 'danielmiessler',
    nombre: 'Scraping progresivo con Bright Data',
    descripcion: 'Para scraping de URLs con escalado progresivo en 4 niveles: WebFetch, curl con cabeceras Chrome, Playwright y proxy Bright Data. Se escala automáticamente cuando el nivel inferior falla.'
  },
  'Recon': {
    author: 'danielmiessler',
    nombre: 'Reconocimiento de red',
    descripcion: 'Para reconocimiento de red: enumeración de subdominios, escaneo de puertos, DNS/WHOIS/ASN, descubrimiento de endpoints desde JS, escaneo masivo y análisis CIDR. Modos pasivo y activo.'
  },
  'IterativeDepth': {
    author: 'danielmiessler',
    nombre: 'Análisis iterativo multi-perspectiva',
    descripcion: 'Para aplicar 2-8 pasadas con lentes científicas distintas y revelar requisitos ocultos que el análisis en una sola pasada perdería. Úsalo para exploración profunda y análisis multi-ángulo.'
  },
  'WorldThreatModelHarness': {
    author: 'danielmiessler',
    nombre: 'Modelo de amenazas mundiales',
    descripcion: 'Para someter ideas, estrategias e inversiones a prueba de estrés en 11 horizontes temporales (6 meses - 50 años). Actualiza y consulta modelos del mundo. Úsalo para análisis de futuro o validar estrategias.'
  },
  'Apify': {
    author: 'danielmiessler',
    nombre: 'Scraping en redes sociales con Apify',
    descripcion: 'Para scraping de redes sociales, datos empresariales y e-commerce mediante actores Apify. Cubre Twitter, Instagram, LinkedIn, TikTok, YouTube, Facebook, Google Maps, Amazon y generación de leads.'
  },
  'PromptInjection': {
    author: 'danielmiessler',
    nombre: 'Pruebas de inyección de prompts en LLMs',
    descripcion: 'Para probar aplicaciones LLM ante vulnerabilidades de inyección de prompts: jailbreaks, extracción de system prompts, manipulación de contexto, bypass de guardarraíles, inyección directa e indirecta.'
  },
  'WebAssessment': {
    author: 'danielmiessler',
    nombre: 'Evaluación de seguridad de aplicaciones web',
    descripcion: 'Para evaluación completa de seguridad web: análisis de la app, modelado de amenazas, testing OWASP, fuzzing con ffuf, automatización Playwright y análisis de vulnerabilidades asistida por IA.'
  },
  'FirstPrinciples': {
    author: 'danielmiessler',
    nombre: 'Razonamiento desde primeros principios',
    descripcion: 'Para descomponer hasta axiomas, cuestionar suposiciones heredadas y reconstruir desde verdades verificadas. Úsalo cuando necesites análisis de causa raíz o desmantelar creencias no fundamentadas.'
  },
  'Science': {
    author: 'danielmiessler',
    nombre: 'Método científico para resolución de problemas',
    descripcion: 'Para ciclos hipótesis-prueba-análisis en resolución sistemática de problemas. Meta-skill que gobierna todas las demás. Incluye definir objetivos, generar hipótesis, diseñar experimentos e iterar.'
  },
  'Xlsx': {
    author: 'danielmiessler',
    nombre: 'Crear y analizar hojas de cálculo Excel',
    descripcion: 'Para crear, leer y analizar libros Excel: fórmulas, modelos financieros, análisis de datos, recalculación y conversión CSV/TSV. Úsalo para cualquier tarea con archivos `.xlsx`.'
  },
  'SECUpdates': {
    author: 'danielmiessler',
    nombre: 'Noticias de seguridad actualizadas',
    descripcion: 'Para obtener noticias de seguridad desde tldrsec, no.security, Krebs, Schneier y otras fuentes. Úsalo cuando necesites estar al día en brechas, investigación de seguridad o novedades del sector.'
  },
  'BeCreative': {
    author: 'danielmiessler',
    nombre: 'Ideación divergente y máxima creatividad',
    descripcion: 'Para ideación divergente con Verbalized Sampling y extended thinking (diversidad 1.6-2.1x). Úsalo cuando necesites brainstorming, ideas creativas máximas, soluciones no convencionales o árbol de pensamientos.'
  },
  'RedTeam': {
    author: 'danielmiessler',
    nombre: 'Red team con 32 agentes adversariales',
    descripcion: 'Para destruir argumentos débiles y encontrar fallos fatales con 32 agentes adversariales en análisis paralelo. Úsalo para criticar ideas, hacer de abogado del diablo o validar propuestas antes de ejecutar.'
  },
  'Cloudflare': {
    author: 'danielmiessler',
    nombre: 'Desplegar y gestionar Cloudflare Workers',
    descripcion: 'Para desplegar y gestionar Cloudflare Workers, Pages y servicios via MCP (consultas API) + wrangler (despliegues). Úsalo para Workers, DNS, KV, R2, D1, Vectorize y servidores MCP.'
  },
  'Docx': {
    author: 'danielmiessler',
    nombre: 'Crear y editar documentos Word',
    descripcion: 'Para crear, editar y analizar documentos Word: cambios rastreados, tablas, imágenes, formato complejo y conversión de formatos. Úsalo para cualquier tarea con archivos `.docx`.'
  },
  'Council': {
    author: 'danielmiessler',
    nombre: 'Debate multi-agente con transcripciones',
    descripcion: 'Para debate multi-agente con transcripciones visibles donde los agentes se responden entre sí. Úsalo para deliberar opciones o contrastar perspectivas. A diferencia de RedTeam, el Council es colaborativo-adversarial.'
  },
  'Aphorisms': {
    author: 'danielmiessler',
    nombre: 'Gestionar colección de aforismos',
    descripcion: 'Para CRUD sobre la colección de aforismos curada: buscar por tema, añadir con metadatos, investigar pensadores y emparejar citas con contenido de newsletter.'
  },
  'CreateCLI': {
    author: 'danielmiessler',
    nombre: 'Generar CLIs TypeScript listos para producción',
    descripcion: 'Para generar CLIs TypeScript listos para producción con sistema de 3 niveles de plantillas (argv simple, yargs, oclif), tipado seguro, manejo de errores y documentación.'
  },
  'AudioEditor': {
    author: 'danielmiessler',
    nombre: 'Edición de audio/vídeo con IA',
    descripcion: 'Para edición de audio/vídeo asistida por IA: transcripción, detección inteligente de cortes, edición automática con crossfades y acabado en la nube. Úsalo para limpiar podcasts, eliminar muletillas o silencio muerto.'
  },
  'CreateSkill': {
    author: 'danielmiessler',
    nombre: 'Crear scaffolding de skills PAI',
    descripcion: 'Para crear scaffolding de nuevas skills PAI con front matter YAML correcto, nomenclatura TitleCase, estructura de carpetas plana (SKILL.md + Workflows/ + Tools/) y validación contra SkillSystem.md.'
  },
  'Pptx': {
    author: 'danielmiessler',
    nombre: 'Crear y editar presentaciones PowerPoint',
    descripcion: 'Para crear, editar y analizar presentaciones PowerPoint: layouts de diapositivas, notas del ponente, elementos de diseño y conversión de formatos. Úsalo para cualquier tarea con archivos `.pptx`.'
  },
  'Fabric': {
    author: 'danielmiessler',
    nombre: 'Patrones Fabric para análisis de contenido',
    descripcion: 'Para usar 240+ patrones de prompts especializados para análisis, extracción y transformación de contenido: ejecutar patrones, sincronizar desde el repo, crear modelos de amenazas y resumir.'
  },
  'media': {
    author: 'danielmiessler',
    nombre: 'Crear contenido visual y vídeo',
    descripcion: 'Para creación de contenido visual y vídeo: imágenes IA, diagramas técnicos, diagramas Mermaid, infografías, cómics y efectos especiales. Úsalo para arte, diagramas, visualizaciones o animaciones.'
  },
  'Browser': {
    author: 'danielmiessler',
    nombre: 'Automatización de navegador con Playwright',
    descripcion: 'Para verificación visual y automatización de navegador vía Playwright (headless o headed Chrome). Úsalo para capturas de pantalla, depurar UI, automatizar el navegador o revisar historias de usuario.'
  },
  'Delegation': {
    author: 'danielmiessler',
    nombre: 'Paralelizar trabajo con agentes',
    descripcion: 'Para paralelizar trabajo mediante agentes en segundo/primer plano, tipos integrados, agentes personalizados o equipos/enjambres. Úsalo cuando haya 3+ flujos de trabajo independientes o esfuerzo Extended+.'
  },
  'Documents': {
    author: 'danielmiessler',
    nombre: 'Procesar documentos en múltiples formatos',
    descripcion: 'Para leer, escribir, convertir y analizar documentos: enruta a sub-skills PDF, DOCX, XLSX, PPTX para creación, edición, extracción y conversión. Úsalo para cualquier tarea con archivos de documento.'
  },
  'PAIUpgrade': {
    author: 'danielmiessler',
    nombre: 'Mejorar el sistema PAI',
    descripcion: 'Para extraer mejoras del sistema a partir de contenido y monitorear fuentes externas (ecosistema Anthropic, YouTube). Úsalo para actualizar el sistema, revisar nuevas características de Claude o auditar vídeos recientes.'
  },
  'telos': {
    author: 'danielmiessler',
    nombre: 'Sistema de vida y análisis de proyectos',
    descripcion: 'Para el OS de vida y análisis de proyectos: objetivos, dependencias, creencias, sabiduría, libros, películas, puntos narrativos y dashboards de proyectos. Úsalo para analizar la dirección de vida o proyectos activos.'
  },
  'Pdf': {
    author: 'danielmiessler',
    nombre: 'Crear y procesar archivos PDF',
    descripcion: 'Para crear, fusionar, dividir, extraer texto/tablas de PDFs, rellenar formularios, añadir marcas de agua y convertir a/desde otros formatos. Úsalo para cualquier tarea con archivos `.pdf`.'
  },
  'Evals': {
    author: 'danielmiessler',
    nombre: 'Evaluar agentes y modelos objetivamente',
    descripcion: 'Para métricas de evaluación objetivas mediante calificadores de código/modelo/humano con puntuación pass@k. Úsalo para evaluar agentes, hacer benchmarks, pruebas de regresión o comparar modelos/prompts.'
  },
  'Prompting': {
    author: 'danielmiessler',
    nombre: 'Sistema de meta-prompting',
    descripcion: 'Para el sistema de meta-prompting que genera prompts optimizados usando plantillas, estándares y patrones. Produce prompts estructurados con rol, contexto y formato de salida.'
  },
  'investigation': {
    author: 'danielmiessler',
    nombre: 'Investigación OSINT y búsqueda de personas',
    descripcion: 'Para OSINT e investigación: búsqueda de personas, inteligencia empresarial, búsqueda de dominio, descubrimiento en redes sociales e inteligencia de amenazas.'
  },
  'security': {
    author: 'danielmiessler',
    nombre: 'Evaluación de seguridad integral',
    descripcion: 'Para evaluación de seguridad: reconocimiento, evaluación web (OWASP), análisis de vulnerabilidades, modelado de amenazas y análisis de noticias de seguridad.'
  },
  'CORE': {
    author: 'danielmiessler',
    nombre: 'Referencia central del sistema PAI',
    descripcion: 'Núcleo de infraestructura de IA personal. Se carga automáticamente al inicio de sesión. Referencia autoritativa sobre cómo funciona el sistema PAI, cómo usarlo y toda la configuración del sistema.'
  },
  'Parser': {
    author: 'danielmiessler',
    nombre: 'Extraer JSON estructurado de contenidos',
    descripcion: 'Para extraer JSON estructurado de URLs, archivos, vídeos y PDFs con extracción de entidades y soporte por lotes. Detecta automáticamente el tipo de contenido: artículos, newsletters, YouTube, PDFs.'
  },
  'content-analysis': {
    author: 'danielmiessler',
    nombre: 'Análisis de contenido y extracción de insights',
    descripcion: 'Para extracción y análisis de contenido de vídeo, podcast, artículos y YouTube. Extrae insights estructurados, puntos clave y sabiduría. Úsalo para analizar o resumir contenido multimedia.'
  },
  'scraping': {
    author: 'danielmiessler',
    nombre: 'Scraping web con escalado progresivo',
    descripcion: 'Para scraping web vía escalado progresivo y scrapers de plataformas de redes sociales. Úsalo cuando haya bloqueos por detección de bots, CAPTCHAs o necesites rastrear sitios.'
  },
  'Agents': {
    author: 'danielmiessler',
    nombre: 'Sistema de composición y gestión de agentes',
    descripcion: 'Para composición dinámica y gestión de agentes. Úsalo cuando necesites crear agentes personalizados, asignar personalidades, mapear voces u orquestar agentes en paralelo.'
  },
  'agents': {
    author: 'danielmiessler',
    nombre: 'Componer y lanzar agentes especializados',
    descripcion: 'Para componer agentes personalizados desde rasgos base, voces y especializaciones. Crea equipos de agentes para trabajo en paralelo. Úsalo para agentes con personalidades específicas o enjambres.'
  },
  'research': {
    author: 'danielmiessler',
    nombre: 'Investigación comprehensiva multi-fuente',
    descripcion: 'Para investigación comprehensiva y extracción de contenido. Modos rápido, estándar, extenso y profundo con investigación paralela multi-fuente, recuperación de contenido y análisis.'
  },
  'thinking': {
    author: 'danielmiessler',
    nombre: 'Marcos de pensamiento analítico y creativo',
    descripcion: 'Para marcos de pensamiento: primeros principios, análisis de profundidad iterativa, debate tipo council, red team adversarial, brainstorming, modelos de amenazas y método científico.'
  },
  'Research': {
    author: 'danielmiessler',
    nombre: 'Motor de investigación y análisis',
    descripcion: 'Para investigación, análisis y extracción de contenido comprehensivos. Soporta tres modos (rápido/estándar/extenso). Úsalo para buscar información, investigar, extraer sabiduría o analizar contenido web.'
  },
  'System': {
    author: 'danielmiessler',
    nombre: 'Mantenimiento del sistema PAI',
    descripcion: 'Para mantenimiento del sistema: verificación de integridad (encontrar/reparar referencias rotas), documentar sesión actual y actualizar documentación reciente. Incluye flujos de trabajo de seguridad y privacidad.'
  },
  'THEALGORITHM': {
    author: 'danielmiessler',
    nombre: 'Motor de ejecución universal',
    descripcion: 'Para motor de ejecución universal usando método científico para alcanzar el estado ideal. Úsalo en tareas complejas o multi-paso que se beneficien de ejecución estructurada con seguimiento de criterios ISC.'
  },
  'Telos': {
    author: 'danielmiessler',
    nombre: 'OS de vida y análisis de proyectos (Telos)',
    descripcion: 'Para el OS de vida y análisis de proyectos TELOS: objetivos de vida, proyectos, dependencias, libros, películas. Consultar SkillSearch para documentación completa.'
  },
  'VoiceServer': {
    author: 'danielmiessler',
    nombre: 'Gestionar servidor de voz',
    descripcion: 'Para gestionar el servidor de voz: TTS, notificaciones de voz y prosodia. Úsalo cuando necesites configurar o controlar el servidor de voz o la síntesis de texto a voz.'
  },
  'PAI': {
    author: 'danielmiessler',
    nombre: 'Núcleo de infraestructura PAI',
    descripcion: 'Núcleo de la infraestructura de IA personal. Referencia autoritativa sobre cómo funciona PAI. Úsalo para cualquier pregunta sobre identidad, configuración o funcionamiento del sistema PAI.'
  },
  'Sales': {
    author: 'danielmiessler',
    nombre: 'Flujos de trabajo de ventas',
    descripcion: 'Para flujos de trabajo de ventas: propuestas, precios y ciclos de venta. Consultar SkillSearch para documentación completa.'
  },
  'USMetrics': {
    author: 'danielmiessler',
    nombre: 'Indicadores económicos de EE.UU.',
    descripcion: 'Para indicadores económicos de Estados Unidos: PIB, inflación, desempleo, precios del gas y otras métricas económicas. Consultar SkillSearch para documentación completa.'
  },
  'WriteStory': {
    author: 'danielmiessler',
    nombre: 'Sistema de escritura de ficción por capas',
    descripcion: 'Para escritura de ficción por capas usando la ciencia del storytelling de Will Storr y figuras retóricas. Cubre novelas, cuentos, biblias de series, arcos de personajes, diálogos y construcción de mundos.'
  },
  'Media': {
    author: 'danielmiessler',
    nombre: 'Creación de contenido visual y vídeo (completo)',
    descripcion: 'Para creación de contenido visual y vídeo: ilustraciones, diagramas Mermaid, infografías, imágenes de cabecera, iconos PAI, miniaturas, cómics y vídeo programático vía Remotion.'
  },
  'Scraping': {
    author: 'danielmiessler',
    nombre: 'Scraping avanzado con Bright Data y Apify',
    descripcion: 'Para scraping web vía escalado progresivo (proxy Bright Data) y actores Apify para redes sociales. Úsalo para Twitter, Instagram, LinkedIn, TikTok, YouTube, Amazon, CAPTCHA o detección de bots.'
  },
  'ContentAnalysis': {
    author: 'danielmiessler',
    nombre: 'Análisis de contenido y extracción de sabiduría',
    descripcion: 'Para extracción y análisis de contenido de vídeos, podcasts, artículos y YouTube. Úsalo para extraer sabiduría, informes de insights, analizar podcasts o identificar puntos clave de cualquier contenido.'
  },
  'Investigation': {
    author: 'danielmiessler',
    nombre: 'OSINT y búsqueda ética de personas',
    descripcion: 'Para OSINT e investigación de personas: investigaciones estructuradas, inteligencia empresarial, due diligence y búsqueda ética de personas en registros públicos y redes sociales.'
  },
  'Security': {
    author: 'danielmiessler',
    nombre: 'Evaluación y vigilancia de seguridad',
    descripcion: 'Para evaluación de seguridad e inteligencia: reconocimiento de red, testing de aplicaciones web, pruebas de inyección de prompts, monitoreo de noticias de seguridad y análisis de informes anuales.'
  },
  'Thinking': {
    author: 'danielmiessler',
    nombre: 'Pensamiento analítico y creativo multi-modo',
    descripcion: 'Para pensamiento multi-modo: primeros principios, análisis de profundidad iterativa, brainstorming creativo, debates tipo council, red team adversarial, modelos de amenazas mundiales y método científico.'
  },
  'Utilities': {
    author: 'danielmiessler',
    nombre: 'Herramientas de desarrollo y utilidades',
    descripcion: 'Para utilidades de desarrollador: generación de CLIs, scaffolding de skills, delegación de agentes, actualizaciones de sistema, evaluaciones, documentos, parsing, edición de audio, patrones Fabric y automatización de navegador.'
  },

  // ============================================================
  // trailofbits (73 skills)
  // ============================================================
  'let-fate-decide': {
    author: 'trailofbits',
    nombre: 'Inyectar entropía con Tarot',
    descripcion: 'Para inyectar entropía en la planificación cuando los prompts son vagos, ambiguos o delegados de forma casual. Saca 4 cartas de Tarot e interpreta el spread para guiar los siguientes pasos.'
  },
  'seatbelt-sandboxer': {
    author: 'trailofbits',
    nombre: 'Generar perfiles de sandbox macOS (Seatbelt)',
    descripcion: 'Para generar configuraciones mínimas de sandbox Seatbelt en macOS. Úsalo cuando necesites aislar o restringir aplicaciones macOS con perfiles de lista blanca.'
  },
  'ossfuzz': {
    author: 'trailofbits',
    nombre: 'Configurar fuzzing continuo con OSS-Fuzz',
    descripcion: 'OSS-Fuzz ofrece fuzzing continuo gratuito para proyectos open source. Úsalo cuando necesites configurar infraestructura de fuzzing continuo o incorporar proyectos al programa.'
  },
  'wycheproof': {
    author: 'trailofbits',
    nombre: 'Validar criptografía con vectores Wycheproof',
    descripcion: 'Wycheproof proporciona vectores de prueba para validar implementaciones criptográficas. Úsalo cuando pruebes código crypto ante ataques conocidos y casos borde.'
  },
  'zeroize-audit': {
    author: 'trailofbits',
    nombre: 'Auditar zeroización de datos sensibles',
    descripcion: 'Para detectar falta de zeroización de datos sensibles en código fuente e identificar zeroización eliminada por optimizaciones del compilador, con análisis a nivel ensamblador y verificación de flujo de control.'
  },
  'solana-vulnerability-scanner': {
    author: 'trailofbits',
    nombre: 'Escáner de vulnerabilidades en Solana',
    descripcion: 'Para escanear programas Solana en busca de 6 vulnerabilidades críticas: CPI arbitrario, validación incorrecta de PDA, falta de verificaciones de signer/ownership y suplantación de sysvar.'
  },
  'audit-context-building': {
    author: 'trailofbits',
    nombre: 'Construir contexto para auditoría de código',
    descripcion: 'Para análisis de código ultra-granular, línea por línea, que construye contexto arquitectónico profundo antes de buscar vulnerabilidades o bugs.'
  },
  'code-maturity-assessor': {
    author: 'trailofbits',
    nombre: 'Evaluar madurez del código',
    descripcion: 'Para evaluación sistemática de madurez del código usando el framework de 9 categorías de Trail of Bits. Analiza seguridad aritmética, controles de acceso, complejidad, documentación, riesgos MEV y testing.'
  },
  'gh-cli': {
    author: 'trailofbits',
    nombre: 'Flujos de trabajo autenticados con gh CLI',
    descripcion: 'Para forzar flujos de trabajo autenticados con gh CLI en lugar de patrones curl/WebFetch no autenticados. Úsalo cuando trabajes con URLs de GitHub, acceso a API, pull requests o issues.'
  },
  'algorand-vulnerability-scanner': {
    author: 'trailofbits',
    nombre: 'Escáner de vulnerabilidades en Algorand',
    descripcion: 'Para escanear contratos inteligentes Algorand en busca de 11 vulnerabilidades comunes: ataques de rekeying, comisiones no verificadas, validaciones de campo faltantes y problemas de control de acceso.'
  },
  'cosmos-vulnerability-scanner': {
    author: 'trailofbits',
    nombre: 'Escáner de vulnerabilidades en Cosmos SDK',
    descripcion: 'Para escanear módulos del Cosmos SDK y contratos CosmWasm en busca de vulnerabilidades críticas de consenso: detenciones de cadena, pérdida de fondos, divergencia de estado. 25+ patrones de vulnerabilidad.'
  },
  'ask-questions-if-underspecified': {
    author: 'trailofbits',
    nombre: 'Clarificar requisitos antes de implementar',
    descripcion: 'Para clarificar requisitos antes de implementar. Úsalo cuando surjan dudas serias sobre el alcance, los requisitos o el enfoque de implementación.'
  },
  'cairo-vulnerability-scanner': {
    author: 'trailofbits',
    nombre: 'Escáner de vulnerabilidades en Cairo/StarkNet',
    descripcion: 'Para escanear contratos inteligentes Cairo/StarkNet en busca de 6 vulnerabilidades críticas: overflow aritmético en felt252, problemas de mensajería L1-L2, conversión de direcciones y replay de firma.'
  },
  'secure-workflow-guide': {
    author: 'trailofbits',
    nombre: 'Guía de flujo de trabajo seguro (Trail of Bits)',
    descripcion: 'Para guiar el flujo de desarrollo seguro en 5 pasos de Trail of Bits: escaneos con Slither, revisión de actualizabilidad/conformidad ERC, diagramas de seguridad y auditoría de áreas manuales.'
  },
  'ton-vulnerability-scanner': {
    author: 'trailofbits',
    nombre: 'Escáner de vulnerabilidades en TON',
    descripcion: 'Para escanear contratos inteligentes de TON (The Open Network) en busca de 3 vulnerabilidades críticas: uso de entero como booleano, contratos Jetton falsos y forward TON sin verificación de gas.'
  },
  'interpreting-culture-index': {
    author: 'trailofbits',
    nombre: 'Interpretar perfiles de Culture Index',
    descripcion: 'Para interpretar encuestas Culture Index (CI): perfiles individuales, composición de equipos (gas/freno/pegamento), detección de burnout, comparación de perfiles y transcripciones de entrevistas para predicción de rasgos.'
  },
  'dimensional-analysis': {
    author: 'trailofbits',
    nombre: 'Análisis dimensional para codebases',
    descripcion: 'Para anotar codebases con comentarios de análisis dimensional que documentan unidades, dimensiones y escalado decimal. Úsalo para prevenir desajustes dimensionales y detectar bugs de fórmulas en DeFi.'
  },
  'agentic-actions-auditor': {
    author: 'trailofbits',
    nombre: 'Auditar GitHub Actions con agentes IA',
    descripcion: 'Para auditar flujos de trabajo de GitHub Actions en busca de vulnerabilidades de seguridad en integraciones de agentes IA (Claude Code Action, Gemini CLI, OpenAI Codex). Detecta vectores de ataque en CI/CD.'
  },
  'audit-prep-assistant': {
    author: 'trailofbits',
    nombre: 'Preparar codebase para auditoría de seguridad',
    descripcion: 'Para preparar codebases para revisión de seguridad usando el checklist de Trail of Bits: análisis estático, cobertura de tests, eliminación de código muerto, accesibilidad y generación de documentación.'
  },
  'guidelines-advisor': {
    author: 'trailofbits',
    nombre: 'Asesor de buenas prácticas en smart contracts',
    descripcion: 'Para asesoramiento en desarrollo de contratos inteligentes basado en las mejores prácticas de Trail of Bits: documentación, arquitectura, actualizabilidad, calidad de implementación, dependencias y testing.'
  },
  'token-integration-analyzer': {
    author: 'trailofbits',
    nombre: 'Analizar integración de tokens',
    descripcion: 'Para analizar integración e implementación de tokens según el checklist de Trail of Bits: conformidad ERC20/ERC721, 20+ patrones de tokens raros, privilegios del owner y análisis on-chain.'
  },
  'constant-time-analysis': {
    author: 'trailofbits',
    nombre: 'Detectar vulnerabilidades de canal de tiempo en crypto',
    descripcion: 'Para detectar vulnerabilidades de canal lateral de tiempo en código criptográfico. Úsalo cuando implementes o revises código crypto con divisiones sobre secretos, ramas dependientes de secretos o programación en tiempo constante.'
  },
  'differential-review': {
    author: 'trailofbits',
    nombre: 'Revisión diferencial de seguridad',
    descripcion: 'Para revisión diferencial de cambios de código orientada a seguridad (PRs, commits, diffs). Adapta la profundidad al tamaño del codebase, usa el historial git para contexto y detecta regresiones de seguridad automáticamente.'
  },
  'firebase-apk-scanner': {
    author: 'trailofbits',
    nombre: 'Escanear APKs Android en busca de problemas Firebase',
    descripcion: 'Para escanear APKs Android en busca de configuraciones erróneas de seguridad en Firebase: bases de datos abiertas, buckets de almacenamiento, problemas de autenticación y funciones cloud expuestas.'
  },
  'substrate-vulnerability-scanner': {
    author: 'trailofbits',
    nombre: 'Escáner de vulnerabilidades en Substrate/Polkadot',
    descripcion: 'Para escanear pallets Substrate/Polkadot en busca de 7 vulnerabilidades críticas: overflow aritmético, DoS por pánico, pesos incorrectos y verificaciones de origen incorrectas.'
  },
  'claude-in-chrome-troubleshooting': {
    author: 'trailofbits',
    nombre: 'Solucionar problemas de Claude en Chrome',
    descripcion: 'Para diagnosticar y corregir problemas de conectividad de la extensión Claude in Chrome MCP. Úsalo cuando las herramientas `mcp__claude-in-chrome__*` fallen o devuelvan "Browser extension is not connected".'
  },
  'devcontainer-setup': {
    author: 'trailofbits',
    nombre: 'Configurar devcontainers con Claude Code',
    descripcion: 'Para crear devcontainers con Claude Code, tooling específico por lenguaje (Python/Node/Rust/Go) y volúmenes persistentes. Úsalo para añadir soporte devcontainer o configurar entornos Claude Code aislados.'
  },
  'entry-point-analyzer': {
    author: 'trailofbits',
    nombre: 'Analizar puntos de entrada de contratos inteligentes',
    descripcion: 'Para analizar codebases de contratos inteligentes e identificar puntos de entrada que modifican estado. Detecta funciones llamables externamente, las categoriza por nivel de acceso y genera informes de auditoría.'
  },
  'insecure-defaults': {
    author: 'trailofbits',
    nombre: 'Detectar valores por defecto inseguros',
    descripcion: 'Para detectar defaults inseguros de tipo fail-open: secretos hardcodeados, autenticación débil y configuraciones permisivas que permiten que apps funcionen de forma insegura en producción.'
  },
  'property-based-testing': {
    author: 'trailofbits',
    nombre: 'Testing basado en propiedades',
    descripcion: 'Para guiar testing basado en propiedades en múltiples lenguajes y contratos inteligentes. Úsalo cuando escribas tests para código con patrones de serialización, validación o parseo, donde se necesite cobertura más robusta.'
  },
  'semgrep-rule-variant-creator': {
    author: 'trailofbits',
    nombre: 'Crear variantes de reglas Semgrep para otros lenguajes',
    descripcion: 'Para crear variantes de reglas Semgrep existentes en lenguajes objetivo especificados. Toma una regla existente y lenguajes destino como entrada y produce directorios de regla+test independientes por lenguaje.'
  },
  'burpsuite-project-parser': {
    author: 'trailofbits',
    nombre: 'Analizar archivos de proyecto Burp Suite',
    descripcion: 'Para buscar y explorar archivos de proyecto Burp Suite (.burp) desde la línea de comandos: búsqueda con regex en headers/cuerpos, extracción de hallazgos, historial del proxy y mapa del sitio.'
  },
  'debug-buttercup': {
    author: 'trailofbits',
    nombre: 'Depurar Buttercup CRS en Kubernetes',
    descripcion: 'Para depurar el Sistema de Razonamiento Cibernético Buttercup en Kubernetes: crashes de pods, bucles de reinicio, fallos de Redis, presión de recursos y problemas de servicio en el namespace crs.'
  },
  'dwarf-expert': {
    author: 'trailofbits',
    nombre: 'Experto en formato de debug DWARF',
    descripcion: 'Para analizar archivos de debug DWARF y entender el estándar DWARF (v3-v5). Úsalo cuando trabajes con información DWARF, archivos de debug o código que parsee datos DWARF.'
  },
  'git-cleanup': {
    author: 'trailofbits',
    nombre: 'Limpiar ramas y worktrees de git',
    descripcion: 'Para analizar y limpiar de forma segura ramas locales de git y worktrees, categorizándolas como mergeadas, squash-mergeadas, superadas o trabajo activo.'
  },
  'mutation-testing': {
    author: 'trailofbits',
    nombre: 'Configurar campañas de mutation testing',
    descripcion: 'Para configurar campañas de mutation testing con mewt o muton: definir alcance, ajustar timeouts y optimizar ejecuciones largas. Úsalo cuando menciones mewt, muton o mutation testing.'
  },
  'semgrep-rule-creator': {
    author: 'trailofbits',
    nombre: 'Crear reglas Semgrep personalizadas',
    descripcion: 'Para crear reglas Semgrep personalizadas que detecten vulnerabilidades de seguridad, patrones de bugs y patrones de código. Úsalo cuando escribas reglas Semgrep o construyas detecciones estáticas personalizadas.'
  },
  'spec-to-code-compliance': {
    author: 'trailofbits',
    nombre: 'Verificar conformidad especificación-código',
    descripcion: 'Para verificar que el código implementa exactamente lo que especifica la documentación en auditorías blockchain. Úsalo para comparar código con whitepapers o encontrar gaps entre specs e implementación.'
  },
  'supply-chain-risk-auditor': {
    author: 'trailofbits',
    nombre: 'Auditar riesgos en la cadena de suministro',
    descripcion: 'Para identificar dependencias con mayor riesgo de explotación o takeover. Úsalo para evaluar la superficie de ataque de supply chain, valorar la salud de dependencias o delimitar el alcance de auditorías.'
  },
  'cargo-fuzz': {
    author: 'trailofbits',
    nombre: 'Fuzzing de Rust con cargo-fuzz',
    descripcion: 'cargo-fuzz es la herramienta de fuzzing estándar para proyectos Rust usando Cargo. Úsalo para hacer fuzzing de código Rust con backend libFuzzer.'
  },
  'fuzzing-obstacles': {
    author: 'trailofbits',
    nombre: 'Superar obstáculos en fuzzing',
    descripcion: 'Para técnicas de parcheo de código que superen obstáculos en fuzzing: checksums, estado global u otras barreras que bloqueen el progreso del fuzzer.'
  },
  'fp-check': {
    author: 'trailofbits',
    nombre: 'Verificar bugs para eliminar falsos positivos',
    descripcion: 'Para verificar sistemáticamente presuntos bugs de seguridad y eliminar falsos positivos. Produce veredictos TRUE POSITIVE o FALSE POSITIVE con evidencia documentada para cada bug.'
  },
  'modern-python': {
    author: 'trailofbits',
    nombre: 'Configurar proyectos Python modernos',
    descripcion: 'Para configurar proyectos Python con herramientas modernas (uv, ruff, ty). Úsalo cuando crees proyectos, escribas scripts standalone o migres desde pip/Poetry/mypy/black.'
  },
  'second-opinion': {
    author: 'trailofbits',
    nombre: 'Obtener segunda opinión de revisión de código',
    descripcion: 'Para ejecutar revisiones de código externas con OpenAI Codex o Google Gemini CLI sobre cambios sin commit, diffs de ramas o commits específicos. Úsalo cuando pidas una segunda opinión o revisión externa.'
  },
  'skill-improver': {
    author: 'trailofbits',
    nombre: 'Mejorar calidad de skills iterativamente',
    descripcion: 'Para revisar y corregir iterativamente problemas de calidad en skills de Claude Code hasta que cumplan los estándares. Ejecuta ciclos automáticos de corrección-revisión. Úsalo para mejorar descriptions o refinar skills.'
  },
  'semgrep': {
    author: 'trailofbits',
    nombre: 'Escanear código con Semgrep',
    descripcion: 'Para ejecutar análisis estático con Semgrep en un codebase mediante subagentes paralelos. Soporta dos modos: "todos los archivos" (cobertura completa) e "importantes" (vulnerabilidades de alta confianza).'
  },
  'atheris': {
    author: 'trailofbits',
    nombre: 'Fuzzing de Python con Atheris',
    descripcion: 'Atheris es un fuzzer Python guiado por cobertura basado en libFuzzer. Úsalo para hacer fuzzing de código Python puro y extensiones Python C.'
  },
  'fuzzing-dictionary': {
    author: 'trailofbits',
    nombre: 'Usar diccionarios de fuzzing',
    descripcion: 'Para usar diccionarios de fuzzing que guíen a los fuzzers con tokens específicos del dominio. Úsalo cuando hagas fuzzing de parsers, protocolos o código específico de un formato.'
  },
  'libfuzzer': {
    author: 'trailofbits',
    nombre: 'Fuzzing de C/C++ con libFuzzer',
    descripcion: 'Fuzzer guiado por cobertura integrado en LLVM para proyectos C/C++. Úsalo para hacer fuzzing de código C/C++ que pueda compilarse con Clang.'
  },
  'sharp-edges': {
    author: 'trailofbits',
    nombre: 'Identificar APIs propensas a errores',
    descripcion: 'Para identificar APIs propensas a errores, configuraciones peligrosas y diseños "footgun" que facilitan errores de seguridad. Úsalo al revisar APIs, esquemas de configuración o ergonomía de librerías criptográficas.'
  },
  'sarif-parsing': {
    author: 'trailofbits',
    nombre: 'Parsear y procesar resultados SARIF',
    descripcion: 'Para parsear y procesar archivos SARIF de herramientas de análisis estático como CodeQL, Semgrep u otros escáneres. Filtra, deduplica, convierte formatos e integra en CI/CD. No ejecuta escaneos.'
  },
  'aflpp': {
    author: 'trailofbits',
    nombre: 'Fuzzing multi-núcleo con AFL++',
    descripcion: 'AFL++ es un fork de AFL con mejor rendimiento de fuzzing y características avanzadas. Úsalo para fuzzing multi-núcleo de proyectos C/C++.'
  },
  'coverage-analysis': {
    author: 'trailofbits',
    nombre: 'Analizar cobertura de código en fuzzing',
    descripcion: 'Para análisis de cobertura que mide el código ejercido durante fuzzing. Úsalo cuando evalúes la efectividad de un harness o identifiques bloqueadores de fuzzing.'
  },
  'libafl': {
    author: 'trailofbits',
    nombre: 'Construir fuzzers personalizados con LibAFL',
    descripcion: 'LibAFL es una librería de fuzzing modular para construir fuzzers personalizados. Úsalo para necesidades avanzadas de fuzzing, mutadores personalizados u objetivos de fuzzing no estándar.'
  },
  'testing-handbook-generator': {
    author: 'trailofbits',
    nombre: 'Generar skills desde el Testing Handbook de Trail of Bits',
    descripcion: 'Meta-skill que analiza el Testing Handbook de Trail of Bits (appsec.guide) y genera skills de Claude Code para herramientas y técnicas de testing de seguridad.'
  },
  'diagramming-code': {
    author: 'trailofbits',
    nombre: 'Generar diagramas Mermaid de código',
    descripcion: 'Para generar diagramas Mermaid desde grafos de código Trailmark: grafos de llamadas, jerarquías de clases, mapas de dependencias, diagramas de complejidad y visualizaciones de flujo de datos de superficie de ataque.'
  },
  'trailmark-structural': {
    author: 'trailofbits',
    nombre: 'Análisis estructural completo con Trailmark',
    descripcion: 'Para ejecutar análisis estructural completo con Trailmark (blast radius, propagación de taint, límites de privilegio, hotspots de complejidad). Úsalo cuando vivisect necesite datos estructurales detallados.'
  },
  'codeql': {
    author: 'trailofbits',
    nombre: 'Escanear código con CodeQL',
    descripcion: 'Para escanear un codebase en busca de vulnerabilidades de seguridad usando el análisis de flujo de datos e interpolación interprocedural de CodeQL. Soporta modos "todos" (seguridad+calidad) e "importantes" (alta precisión).'
  },
  'address-sanitizer': {
    author: 'trailofbits',
    nombre: 'Detectar errores de memoria con AddressSanitizer',
    descripcion: 'AddressSanitizer detecta errores de memoria durante fuzzing. Úsalo cuando hagas fuzzing de código C/C++ para encontrar buffer overflows y bugs de use-after-free.'
  },
  'constant-time-testing': {
    author: 'trailofbits',
    nombre: 'Detectar canales de tiempo en código criptográfico',
    descripcion: 'Para detectar canales laterales de tiempo en código criptográfico. Úsalo cuando audites implementaciones crypto en busca de vulnerabilidades de timing.'
  },
  'harness-writing': {
    author: 'trailofbits',
    nombre: 'Escribir harnesses de fuzzing efectivos',
    descripcion: 'Para técnicas de escritura de harnesses de fuzzing efectivos en múltiples lenguajes. Úsalo cuando crees nuevos objetivos de fuzz o mejores código de harness existente.'
  },
  'ruzzy': {
    author: 'trailofbits',
    nombre: 'Fuzzing de Ruby con Ruzzy',
    descripcion: 'Ruzzy es un fuzzer Ruby guiado por cobertura de Trail of Bits. Úsalo para hacer fuzzing de código Ruby puro y extensiones Ruby C.'
  },
  'crypto-protocol-diagram': {
    author: 'trailofbits',
    nombre: 'Diagramar flujos de protocolos criptográficos',
    descripcion: 'Para extraer el flujo de mensajes de protocolos desde código fuente, RFCs, papers académicos o modelos ProVerif/Tamarin y generar sequenceDiagrams Mermaid con anotaciones criptográficas.'
  },
  'mermaid-to-proverif': {
    author: 'trailofbits',
    nombre: 'Convertir diagramas Mermaid a ProVerif',
    descripcion: 'Para traducir sequenceDiagrams Mermaid de protocolos criptográficos a modelos de verificación formal ProVerif (.pv). Úsalo para verificar secrecía, autenticación, forward secrecy o ataques de replay.'
  },
  'vector-forge': {
    author: 'trailofbits',
    nombre: 'Generar vectores de prueba criptográficos',
    descripcion: 'Para generación de vectores de prueba mediante mutation testing: encuentra implementaciones, ejecuta mutaciones para identificar mutantes escapados y genera vectores que ejerciten los caminos no cubiertos.'
  },
  'audit-augmentation': {
    author: 'trailofbits',
    nombre: 'Aumentar grafos de código con hallazgos de auditoría',
    descripcion: 'Para aumentar grafos de código Trailmark con hallazgos externos de auditoría: resultados SARIF y anotaciones weAudit. Mapea hallazgos a nodos del grafo por archivo y línea, crea subgrafos por severidad.'
  },
  'graph-evolution': {
    author: 'trailofbits',
    nombre: 'Analizar evolución estructural de código',
    descripcion: 'Para comparar grafos de código Trailmark en dos snapshots (commits, tags, directorios) y detectar cambios estructurales relevantes para seguridad: nuevos caminos de ataque, cambios de blast radius o taint.'
  },
  'trailmark': {
    author: 'trailofbits',
    nombre: 'Construir y consultar grafos de código con Trailmark',
    descripcion: 'Para construir y consultar grafos de código fuente multi-lenguaje para análisis de seguridad. Incluye passes de pre-análisis: blast radius, propagación de taint, límites de privilegio y enumeración de puntos de entrada.'
  },
  'yara-rule-authoring': {
    author: 'trailofbits',
    nombre: 'Crear reglas YARA-X de detección',
    descripcion: 'Para crear reglas de detección YARA-X de alta calidad para identificación de malware. Cubre convenciones de nomenclatura, selección de strings, optimización de rendimiento, migración desde YARA legacy y reducción de falsos positivos.'
  },
  'genotoxic': {
    author: 'trailofbits',
    nombre: 'Triaje de mutation testing informado por grafos',
    descripcion: 'Para triaje de mutation testing informado por grafos: parsea codebases con Trailmark, ejecuta mutation testing y usa mutantes supervivientes y datos del grafo de llamadas para identificar falsos positivos y objetivos de fuzzing.'
  },
  'trailmark-summary': {
    author: 'trailofbits',
    nombre: 'Resumen estructural rápido con Trailmark',
    descripcion: 'Para ejecutar análisis de resumen Trailmark en un codebase: detección de lenguaje, conteo de puntos de entrada y forma del grafo de dependencias. Úsalo cuando vivisect necesite un panorama estructural rápido.'
  },
  'designing-workflow-skills': {
    author: 'trailofbits',
    nombre: 'Diseñar skills de workflow en Claude Code',
    descripcion: 'Para guiar el diseño y estructuración de skills de workflow multi-paso: pipelines secuenciales, árboles de decisión, delegación de subagentes y divulgación progresiva. Úsalo al crear o refactorizar skills de flujo de trabajo.'
  },
  'variant-analysis': {
    author: 'trailofbits',
    nombre: 'Encontrar variantes de vulnerabilidades',
    descripcion: 'Para encontrar vulnerabilidades y bugs similares en codebases usando análisis basado en patrones. Úsalo para búsqueda de variantes, construcción de queries CodeQL/Semgrep o auditorías sistemáticas tras encontrar un issue inicial.'
  },

  // ============================================================
  // smithery-ai (1 skill)
  // ============================================================
  'smithery-ai-cli': {
    author: 'smithery-ai',
    nombre: 'Descubrir y conectar herramientas MCP con Smithery',
    descripcion: 'Para buscar, conectar y usar herramientas MCP y skills vía el CLI de Smithery. Úsalo cuando el usuario quiera descubrir integraciones, conectarse a un MCP, instalar una skill o interactuar con servicios externos.'
  },
};

// ---------------------------------------------------------------------------
// PATCH helpers
// ---------------------------------------------------------------------------
async function patchSkill(slug, author, nombre, descripcion) {
  const url = `${BASE}/rest/v1/skills_catalog?slug=eq.${encodeURIComponent(slug)}&author=eq.${encodeURIComponent(author)}`;
  const res = await fetch(url, {
    method: 'PATCH',
    headers: {
      'apikey': KEY,
      'authorization': `Bearer ${KEY}`,
      'content-type': 'application/json',
      'prefer': 'return=minimal',
    },
    body: JSON.stringify({ nombre, descripcion }),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`HTTP ${res.status}: ${body}`);
  }
  return true;
}

// ---------------------------------------------------------------------------
// MAIN
// ---------------------------------------------------------------------------
const startTime = Date.now();
const results = { ok: {}, fail: [] };
const authorCounts = {};

// Group by author
for (const [slug, t] of Object.entries(TRANSLATIONS)) {
  if (!authorCounts[t.author]) authorCounts[t.author] = { ok: 0, fail: 0 };
}

let processed = 0;
const entries = Object.entries(TRANSLATIONS);
const total = entries.length;

for (const [slug, t] of entries) {
  try {
    await patchSkill(slug, t.author, t.nombre, t.descripcion);
    authorCounts[t.author].ok++;
    if (!results.ok[t.author]) results.ok[t.author] = 0;
    results.ok[t.author]++;
  } catch (err) {
    authorCounts[t.author].fail++;
    results.fail.push({ slug, author: t.author, error: err.message });
    console.error(`  FAIL [${t.author}/${slug}]: ${err.message}`);
  }
  processed++;
  if (processed % 20 === 0 || processed === total) {
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`[${processed}/${total}] +${elapsed}s | dotnet OK:${authorCounts['dotnet']?.ok||0} | danielmiessler OK:${authorCounts['danielmiessler']?.ok||0} | trailofbits OK:${authorCounts['trailofbits']?.ok||0} | smithery-ai OK:${authorCounts['smithery-ai']?.ok||0} | FAIL:${results.fail.length}`);
  }
}

const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
console.log('\n==============================');
console.log('RESUMEN FINAL');
console.log('==============================');
for (const [author, c] of Object.entries(authorCounts)) {
  console.log(`  ${author}: ${c.ok} OK / ${c.fail} FAIL`);
}
console.log(`  Total OK: ${Object.values(results.ok).reduce((a,b)=>a+b,0)}`);
console.log(`  Total FAIL: ${results.fail.length}`);
if (results.fail.length > 0) {
  console.log('\nFallos:');
  for (const f of results.fail) console.log(`  [${f.author}/${f.slug}] ${f.error}`);
}
console.log(`\nTiempo total: ${elapsed}s`);
