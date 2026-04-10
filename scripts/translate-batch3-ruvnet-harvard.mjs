#!/usr/bin/env node
/**
 * translate-batch3-ruvnet-harvard.mjs
 * Traduce nombre+descripcion de 260 skills al español neutro.
 * Autores: ruvnet (135) + mims-harvard (125)
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
// TRADUCCIONES — español neutro
// Formato: { slug: { nombre, descripcion } }
// nombre: máx 60 chars | descripcion: máx 400 chars, empieza por "Úsalo cuando..." o "Para..."
// ---------------------------------------------------------------------------
const TRANSLATIONS = {

  // ============================================================
  // ruvnet — claude-flow, swarms, agents, v3, agentdb
  // ============================================================
  'browser': {
    nombre: 'Navegador — automatización web',
    descripcion: 'Para automatizar el navegador web con snapshots optimizados para agentes claude-flow. Úsalo cuando necesites interacción web programática dentro de un swarm de agentes.'
  },
  'github-automation': {
    nombre: 'Automatización GitHub',
    descripcion: 'Para automatizar flujos GitHub: creación de PRs, revisión de código, gestión de issues, coordinación de releases e integración con GitHub Actions. Úsalo cuando necesites PR, code review, gestión de issues o configuración de workflows. Omítelo en cambios solo locales o repos sin GitHub.'
  },
  'github-release-management': {
    nombre: 'Gestión de releases en GitHub',
    descripcion: 'Para orquestar releases completos en GitHub con coordinación de swarm: versionado automático, testing, despliegue y gestión de rollbacks con coordinación multi-agente.'
  },
  'hooks-automation': {
    nombre: 'Automatización de hooks Claude Code',
    descripcion: 'Para coordinar, formatear y aprender de operaciones Claude Code mediante hooks inteligentes con integración MCP. Incluye hooks pre/post-tarea, gestión de sesión, integración Git, coordinación de memoria y entrenamiento de patrones neurales.'
  },
  'performance-analysis': {
    nombre: 'Análisis de rendimiento — claude-flow',
    descripcion: 'Para analizar rendimiento, detectar cuellos de botella y obtener recomendaciones de optimización en swarms claude-flow. Úsalo cuando necesites diagnosticar latencia, throughput o eficiencia de agentes.'
  },
  'skill-builder': {
    nombre: 'Creador de Skills',
    descripcion: 'Para crear nuevas Skills de Claude Code con frontmatter YAML correcto, revelación progresiva y estructura estandarizada. Úsalo cuando necesites scaffoldear una nueva skill con documentación y configuración correctas.'
  },
  'security-audit': {
    nombre: 'Auditoría de seguridad',
    descripcion: 'Para escaneo de seguridad y detección de vulnerabilidades: validación de inputs, análisis de dependencias, revisión de autenticación y análisis de superficie de ataque. Omítelo para tareas de seguridad no relacionadas con el código.'
  },
  'swarm-advanced': {
    nombre: 'Orquestación avanzada de swarms',
    descripcion: 'Para patrones avanzados de orquestación de swarms en investigación, desarrollo, testing y despliegue. Úsalo cuando necesites coordinación multi-agente compleja con topologías jerárquicas, mesh o especializadas.'
  },
  'swarm-orchestration': {
    nombre: 'Coordinación de swarms multi-agente',
    descripcion: 'Para coordinación de swarms multi-agente en tareas complejas. Usa topología jerárquica con un coordinador y workers especializados. Úsalo para análisis paralelo, generación de código, investigación o tareas que se beneficien de agentes concurrentes.'
  },
  'v3-core-implementation': {
    nombre: 'Implementación del núcleo claude-flow v3',
    descripcion: 'Para implementar módulos del núcleo de claude-flow v3 con DDD, arquitectura limpia y patrones de coordinación de swarms. Úsalo en desarrollo activo de claude-flow v3.'
  },
  'v3-ddd-architecture': {
    nombre: 'Arquitectura DDD para claude-flow v3',
    descripcion: 'Para implementar arquitectura Domain-Driven Design en claude-flow v3: dominios modulares con límites claros, capas de aplicación/dominio/infraestructura y puertos/adaptadores para extensibilidad.'
  },
  'v3-performance-optimization': {
    nombre: 'Optimización de rendimiento claude-flow v3',
    descripcion: 'Para alcanzar los objetivos de rendimiento agresivos de v3: aceleración Flash Attention, reducción de memoria, operaciones matriciales con Dynamo/Inductor y optimización de workers. Úsalo en benchmarking y tuning de v3.'
  },
  'v3-integration-deep': {
    nombre: 'Integración profunda agentic-flow v3',
    descripcion: 'Para integración profunda de agentic-flow@alpha implementando ADR-001. Elimina código duplicado, unifica interfaces y establece el grafo de integración v3 completo.'
  },
  'v3-memory-unification': {
    nombre: 'Unificación de memoria en claude-flow v3',
    descripcion: 'Para unificar múltiples sistemas de memoria en AgentDB con indexación HNSW para búsqueda vectorial ultrarrápida. Úsalo cuando necesites consolidar backends de memoria fragmentados en v3.'
  },
  'v3-security-overhaul': {
    nombre: 'Revisión de seguridad claude-flow v3',
    descripcion: 'Para renovación completa de la arquitectura de seguridad en claude-flow v3: resolución de vulnerabilidades críticas, autenticación de agentes, aislamiento de sandboxes y controles de acceso.'
  },
  'verification-quality': {
    nombre: 'Verificación de verdad y calidad de código',
    descripcion: 'Para puntuación de verdad, verificación de calidad de código y rollback automático de cambios defectuosos. Úsalo cuando necesites garantizar que los outputs de agentes cumplen umbrales de calidad antes de persistirlos.'
  },
  'worker-benchmarks': {
    nombre: 'Benchmarks del sistema de workers',
    descripcion: 'Para ejecutar benchmarks exhaustivos del sistema de workers y análisis de rendimiento en claude-flow. Úsalo cuando necesites medir throughput, latencia y capacidad de workers bajo carga.'
  },
  'worker-integration': {
    nombre: 'Integración Worker-Agent',
    descripcion: 'Para integración Worker-Agent con despacho inteligente de tareas y tracking de rendimiento en claude-flow. Úsalo cuando necesites conectar workers a agentes con balanceo de carga y monitoreo.'
  },
  'add-model-descriptions': {
    nombre: 'Añadir descripciones de modelos HuggingFace',
    descripcion: 'Para añadir descripciones de nuevos modelos desde el router HuggingFace a la configuración de chat-ui. Úsalo al incorporar nuevos modelos al catálogo de chat-ui.'
  },
  'agent-agent': {
    nombre: 'Agente: agent',
    descripcion: 'Para invocar el agente `agent` dentro del ecosistema claude-flow. Úsalo con `$agent-agent` para lanzar este agente especializado en coordinación general.'
  },
  'agent-arch-system-design': {
    nombre: 'Agente: diseño de arquitectura de sistemas',
    descripcion: 'Para invocar el agente `arch-system-design` en claude-flow. Úsalo con `$agent-arch-system-design` para obtener diseño de arquitectura de sistemas con múltiples perspectivas.'
  },
  'agent-base-template-generator': {
    nombre: 'Agente: generador de plantillas base',
    descripcion: 'Para invocar el agente `base-template-generator` en claude-flow. Úsalo con `$agent-base-template-generator` para scaffoldear proyectos con plantillas estandarizadas.'
  },
  'agent-code-analyzer': {
    nombre: 'Agente: analizador de código',
    descripcion: 'Para invocar el agente `code-analyzer` en claude-flow. Úsalo con `$agent-code-analyzer` para análisis profundo de código: métricas, patrones, deuda técnica y oportunidades de refactoring.'
  },
  'agent-collective-intelligence-coordinator': {
    nombre: 'Agente: coordinador de inteligencia colectiva',
    descripcion: 'Para invocar el agente `collective-intelligence-coordinator` en claude-flow. Úsalo con `$agent-collective-intelligence-coordinator` para coordinar inteligencia emergente entre múltiples agentes.'
  },
  'agent-crdt-synchronizer': {
    nombre: 'Agente: sincronizador CRDT',
    descripcion: 'Para invocar el agente `crdt-synchronizer` en claude-flow. Úsalo con `$agent-crdt-synchronizer` para sincronización de estado distribuido sin conflictos usando CRDTs.'
  },
  'agent-github-modes': {
    nombre: 'Agente: modos GitHub',
    descripcion: 'Para invocar el agente `github-modes` en claude-flow. Úsalo con `$agent-github-modes` para operaciones GitHub con diferentes modos de interacción (PR, issue, review, release).'
  },
  'agent-hierarchical-coordinator': {
    nombre: 'Agente: coordinador jerárquico',
    descripcion: 'Para invocar el agente `hierarchical-coordinator` en claude-flow. Úsalo con `$agent-hierarchical-coordinator` para coordinar topologías de agentes jerárquicas con delegación de tareas.'
  },
  'agent-matrix-optimizer': {
    nombre: 'Agente: optimizador de matrices',
    descripcion: 'Para invocar el agente `matrix-optimizer` en claude-flow. Úsalo con `$agent-matrix-optimizer` para optimización de operaciones matriciales en pipelines de ML y computación numérica.'
  },
  'agent-multi-repo-swarm': {
    nombre: 'Agente: swarm multi-repositorio',
    descripcion: 'Para invocar el agente `multi-repo-swarm` en claude-flow. Úsalo con `$agent-multi-repo-swarm` para coordinar cambios sincronizados en múltiples repositorios simultáneamente.'
  },
  'agent-pagerank-analyzer': {
    nombre: 'Agente: analizador PageRank',
    descripcion: 'Para invocar el agente `pagerank-analyzer` en claude-flow. Úsalo con `$agent-pagerank-analyzer` para análisis de grafos de dependencias y ranking de importancia de nodos.'
  },
  'agent-analyze-code-quality': {
    nombre: 'Agente: análisis de calidad de código',
    descripcion: 'Para invocar el agente `analyze-code-quality` en claude-flow. Úsalo con `$agent-analyze-code-quality` para evaluación detallada de calidad, cobertura y estándares de código.'
  },
  'agent-authentication': {
    nombre: 'Agente: autenticación',
    descripcion: 'Para invocar el agente `authentication` en claude-flow. Úsalo con `$agent-authentication` para implementar y auditar flujos de autenticación y autorización en agentes.'
  },
  'agent-byzantine-coordinator': {
    nombre: 'Agente: coordinador Byzantine',
    descripcion: 'Para invocar el agente `byzantine-coordinator` en claude-flow. Úsalo con `$agent-byzantine-coordinator` para consenso tolerante a fallos byzantinos en sistemas distribuidos de agentes.'
  },
  'agent-adaptive-coordinator': {
    nombre: 'Agente: coordinador adaptativo',
    descripcion: 'Para invocar el agente `adaptive-coordinator` en claude-flow. Úsalo con `$agent-adaptive-coordinator` para coordinación que ajusta su estrategia dinámicamente según el rendimiento.'
  },
  'agent-app-store': {
    nombre: 'Agente: app store',
    descripcion: 'Para invocar el agente `app-store` en claude-flow. Úsalo con `$agent-app-store` para gestión y publicación de aplicaciones en el ecosistema de la plataforma.'
  },
  'agent-automation-smart-agent': {
    nombre: 'Agente: smart agent de automatización',
    descripcion: 'Para invocar el agente `automation-smart-agent` en claude-flow. Úsalo con `$agent-automation-smart-agent` para automatización inteligente que aprende y mejora sus patrones de ejecución.'
  },
  'agent-challenges': {
    nombre: 'Agente: retos y desafíos',
    descripcion: 'Para invocar el agente `challenges` en claude-flow. Úsalo con `$agent-challenges` para abordar retos técnicos complejos con estrategias de resolución estructuradas.'
  },
  'agent-coder': {
    nombre: 'Agente: programador',
    descripcion: 'Para invocar el agente `coder` en claude-flow. Úsalo con `$agent-coder` para generación, refactoring y debugging de código con contexto completo del proyecto.'
  },
  'agent-coordinator-swarm-init': {
    nombre: 'Agente: inicialización de swarm coordinador',
    descripcion: 'Para invocar el agente `coordinator-swarm-init` en claude-flow. Úsalo con `$agent-coordinator-swarm-init` para inicializar y configurar topologías de swarms coordinados.'
  },
  'agent-docs-api-openapi': {
    nombre: 'Agente: documentación API OpenAPI',
    descripcion: 'Para invocar el agente `docs-api-openapi` en claude-flow. Úsalo con `$agent-docs-api-openapi` para generar y mantener documentación OpenAPI/Swagger de APIs.'
  },
  'agent-gossip-coordinator': {
    nombre: 'Agente: coordinador gossip',
    descripcion: 'Para invocar el agente `gossip-coordinator` en claude-flow. Úsalo con `$agent-gossip-coordinator` para propagación de información entre agentes usando protocolo gossip.'
  },
  'agent-load-balancer': {
    nombre: 'Agente: balanceador de carga',
    descripcion: 'Para invocar el agente `load-balancer` en claude-flow. Úsalo con `$agent-load-balancer` para distribución inteligente de tareas entre workers según capacidad y rendimiento.'
  },
  'agent-migration-plan': {
    nombre: 'Agente: planificación de migraciones',
    descripcion: 'Para invocar el agente `migration-plan` en claude-flow. Úsalo con `$agent-migration-plan` para planificar migraciones de código, datos o infraestructura con análisis de riesgo.'
  },
  'agent-agentic-payments': {
    nombre: 'Agente: pagos agénticos',
    descripcion: 'Para invocar el agente `agentic-payments` en claude-flow. Úsalo con `$agent-agentic-payments` para integrar procesamiento de pagos en flujos de trabajo autónomos de agentes.'
  },
  'agent-architecture': {
    nombre: 'Agente: arquitectura de software',
    descripcion: 'Para invocar el agente `architecture` en claude-flow. Úsalo con `$agent-architecture` para decisiones de arquitectura de software con análisis de trade-offs y patrones.'
  },
  'agent-benchmark-suite': {
    nombre: 'Agente: suite de benchmarks',
    descripcion: 'Para invocar el agente `benchmark-suite` en claude-flow. Úsalo con `$agent-benchmark-suite` para ejecutar suites de benchmarks exhaustivas y comparar rendimiento entre versiones.'
  },
  'agent-code-goal-planner': {
    nombre: 'Agente: planificador de objetivos de código',
    descripcion: 'Para invocar el agente `code-goal-planner` en claude-flow. Úsalo con `$agent-code-goal-planner` para descomponer objetivos de desarrollo en tareas concretas y ordenadas.'
  },
  'agent-consensus-coordinator': {
    nombre: 'Agente: coordinador de consenso',
    descripcion: 'Para invocar el agente `consensus-coordinator` en claude-flow. Úsalo con `$agent-consensus-coordinator` para alcanzar consenso distribuido entre agentes en decisiones críticas.'
  },
  'agent-data-ml-model': {
    nombre: 'Agente: modelos ML sobre datos',
    descripcion: 'Para invocar el agente `data-ml-model` en claude-flow. Úsalo con `$agent-data-ml-model` para pipelines de datos y modelos de ML con coordinación multi-agente.'
  },
  'agent-github-pr-manager': {
    nombre: 'Agente: gestor de PRs en GitHub',
    descripcion: 'Para invocar el agente `github-pr-manager` en claude-flow. Úsalo con `$agent-github-pr-manager` para gestión completa de pull requests: creación, revisión y merge coordinado.'
  },
  'agent-implementer-sparc-coder': {
    nombre: 'Agente: implementador SPARC',
    descripcion: 'Para invocar el agente `implementer-sparc-coder` en claude-flow. Úsalo con `$agent-implementer-sparc-coder` para implementación de código siguiendo la metodología SPARC.'
  },
  'agent-memory-coordinator': {
    nombre: 'Agente: coordinador de memoria',
    descripcion: 'Para invocar el agente `memory-coordinator` en claude-flow. Úsalo con `$agent-memory-coordinator` para gestionar y sincronizar memoria compartida entre agentes del swarm.'
  },
  'agent-neural-network': {
    nombre: 'Agente: redes neuronales',
    descripcion: 'Para invocar el agente `neural-network` en claude-flow. Úsalo con `$agent-neural-network` para diseño, entrenamiento y evaluación de arquitecturas de redes neuronales.'
  },
  'agent-payments': {
    nombre: 'Agente: pagos',
    descripcion: 'Para invocar el agente `payments` en claude-flow. Úsalo con `$agent-payments` para integrar y gestionar flujos de pago en aplicaciones con agentes autónomos.'
  },
  'agent-performance-optimizer': {
    nombre: 'Agente: optimizador de rendimiento',
    descripcion: 'Para invocar el agente `performance-optimizer` en claude-flow. Úsalo con `$agent-performance-optimizer` para identificar y resolver cuellos de botella de rendimiento en código y sistemas.'
  },
  'agent-code-review-swarm': {
    nombre: 'Agente: swarm de revisión de código',
    descripcion: 'Para invocar el agente `code-review-swarm` en claude-flow. Úsalo con `$agent-code-review-swarm` para revisiones de código en paralelo con múltiples perspectivas especializadas.'
  },
  'agent-coordination': {
    nombre: 'Agente: coordinación y ciclo de vida',
    descripcion: 'Para lanzamiento de agentes, gestión de ciclo de vida y patrones de coordinación. Gestiona 60+ tipos de agentes. Úsalo para despacho dinámico, pools y coordinación de swarms complejos.'
  },
  'agent-dev-backend-api': {
    nombre: 'Agente: desarrollo de API backend',
    descripcion: 'Para invocar el agente `dev-backend-api` en claude-flow. Úsalo con `$agent-dev-backend-api` para desarrollo de APIs backend con diseño, implementación y documentación coordinados.'
  },
  'agent-goal-planner': {
    nombre: 'Agente: planificador de objetivos',
    descripcion: 'Para invocar el agente `goal-planner` en claude-flow. Úsalo con `$agent-goal-planner` para descomponer objetivos complejos en planes de acción concretos y ejecutables.'
  },
  'agent-issue-tracker': {
    nombre: 'Agente: rastreador de issues',
    descripcion: 'Para invocar el agente `issue-tracker` en claude-flow. Úsalo con `$agent-issue-tracker` para gestión y seguimiento de issues con priorización y análisis de impacto.'
  },
  'agent-mesh-coordinator': {
    nombre: 'Agente: coordinador mesh',
    descripcion: 'Para invocar el agente `mesh-coordinator` en claude-flow. Úsalo con `$agent-mesh-coordinator` para coordinar topologías de agentes en malla con comunicación descentralizada.'
  },
  'agent-ops-cicd-github': {
    nombre: 'Agente: CI/CD con GitHub Actions',
    descripcion: 'Para invocar el agente `ops-cicd-github` en claude-flow. Úsalo con `$agent-ops-cicd-github` para configurar y mantener pipelines CI/CD con GitHub Actions y coordinación de agentes.'
  },
  'agent-performance-analyzer': {
    nombre: 'Agente: analizador de rendimiento',
    descripcion: 'Para invocar el agente `performance-analyzer` en claude-flow. Úsalo con `$agent-performance-analyzer` para análisis profundo de métricas de rendimiento con diagnóstico de causas raíz.'
  },
  'agent-planner': {
    nombre: 'Agente: planificador',
    descripcion: 'Para invocar el agente `planner` en claude-flow. Úsalo con `$agent-planner` para planificación estratégica de proyectos y tareas con descomposición jerárquica.'
  },
  'agent-pseudocode': {
    nombre: 'Agente: pseudocódigo',
    descripcion: 'Para invocar el agente `pseudocode` en claude-flow. Úsalo con `$agent-pseudocode` para diseñar algoritmos y lógica de negocio en pseudocódigo antes de la implementación.'
  },
  'agent-refinement': {
    nombre: 'Agente: refinamiento iterativo',
    descripcion: 'Para invocar el agente `refinement` en claude-flow. Úsalo con `$agent-refinement` para mejorar iterativamente código, diseños o especificaciones con ciclos de revisión estructurados.'
  },
  'agent-researcher': {
    nombre: 'Agente: investigador',
    descripcion: 'Para invocar el agente `researcher` en claude-flow. Úsalo con `$agent-researcher` para investigación técnica exhaustiva con síntesis de múltiples fuentes y análisis comparativo.'
  },
  'agent-sandbox': {
    nombre: 'Agente: sandbox de ejecución',
    descripcion: 'Para invocar el agente `sandbox` en claude-flow. Úsalo con `$agent-sandbox` para ejecutar código en entornos aislados con monitoreo de recursos y gestión de seguridad.'
  },
  'agent-sparc-coordinator': {
    nombre: 'Agente: coordinador SPARC',
    descripcion: 'Para invocar el agente `sparc-coordinator` en claude-flow. Úsalo con `$agent-sparc-coordinator` para coordinar equipos de agentes siguiendo la metodología SPARC completa.'
  },
  'agent-swarm-memory-manager': {
    nombre: 'Agente: gestor de memoria de swarm',
    descripcion: 'Para invocar el agente `swarm-memory-manager` en claude-flow. Úsalo con `$agent-swarm-memory-manager` para gestionar memoria compartida y estado persistente de swarms.'
  },
  'agent-orchestrator-task': {
    nombre: 'Agente: orquestador de tareas',
    descripcion: 'Para invocar el agente `orchestrator-task` en claude-flow. Úsalo con `$agent-orchestrator-task` para orquestar flujos de tareas complejas con dependencias y paralelización.'
  },
  'agent-performance-benchmarker': {
    nombre: 'Agente: benchmarker de rendimiento',
    descripcion: 'Para invocar el agente `performance-benchmarker` en claude-flow. Úsalo con `$agent-performance-benchmarker` para benchmarks sistemáticos con comparativas y análisis estadístico.'
  },
  'agent-pr-manager': {
    nombre: 'Agente: gestor de pull requests',
    descripcion: 'Para invocar el agente `pr-manager` en claude-flow. Úsalo con `$agent-pr-manager` para ciclo de vida completo de PRs: creación, revisión, merge y gestión de conflictos.'
  },
  'agent-queen-coordinator': {
    nombre: 'Agente: coordinador queen',
    descripcion: 'Para invocar el agente `queen-coordinator` en claude-flow. Úsalo con `$agent-queen-coordinator` para coordinación jerárquica centralizada estilo "reina" en topologías hive-mind.'
  },
  'agent-release-manager': {
    nombre: 'Agente: gestor de releases',
    descripcion: 'Para invocar el agente `release-manager` en claude-flow. Úsalo con `$agent-release-manager` para gestión completa de releases: versionado, changelogs, tagging y despliegues.'
  },
  'agent-resource-allocator': {
    nombre: 'Agente: asignador de recursos',
    descripcion: 'Para invocar el agente `resource-allocator` en claude-flow. Úsalo con `$agent-resource-allocator` para asignación dinámica de recursos computacionales entre agentes activos.'
  },
  'agent-scout-explorer': {
    nombre: 'Agente: explorador scout',
    descripcion: 'Para invocar el agente `scout-explorer` en claude-flow. Úsalo con `$agent-scout-explorer` para exploración inicial de repositorios, APIs o dominios desconocidos antes de actuar.'
  },
  'agent-spec-mobile-react-native': {
    nombre: 'Agente: especificaciones móviles React Native',
    descripcion: 'Para invocar el agente `spec-mobile-react-native` en claude-flow. Úsalo con `$agent-spec-mobile-react-native` para especificaciones y arquitectura de apps móviles con React Native.'
  },
  'agent-swarm-pr': {
    nombre: 'Agente: swarm para pull requests',
    descripcion: 'Para invocar el agente `swarm-pr` en claude-flow. Úsalo con `$agent-swarm-pr` para gestión de PRs con swarms de agentes especializados en revisión paralela.'
  },
  'agent-performance-monitor': {
    nombre: 'Agente: monitor de rendimiento',
    descripcion: 'Para invocar el agente `performance-monitor` en claude-flow. Úsalo con `$agent-performance-monitor` para monitoreo continuo de métricas de rendimiento con alertas automáticas.'
  },
  'agent-production-validator': {
    nombre: 'Agente: validador de producción',
    descripcion: 'Para invocar el agente `production-validator` en claude-flow. Úsalo con `$agent-production-validator` para validación exhaustiva antes de despliegues a producción.'
  },
  'agent-quorum-manager': {
    nombre: 'Agente: gestor de quórum',
    descripcion: 'Para invocar el agente `quorum-manager` en claude-flow. Úsalo con `$agent-quorum-manager` para gestión de quórum en decisiones distribuidas que requieren consenso de mayoría.'
  },
  'agent-release-swarm': {
    nombre: 'Agente: swarm de releases',
    descripcion: 'Para invocar el agente `release-swarm` en claude-flow. Úsalo con `$agent-release-swarm` para orquestar releases con swarms coordinados de testing, validación y despliegue.'
  },
  'agent-reviewer': {
    nombre: 'Agente: revisor',
    descripcion: 'Para invocar el agente `reviewer` en claude-flow. Úsalo con `$agent-reviewer` para revisiones técnicas profundas con múltiples perspectivas y criterios de calidad.'
  },
  'agent-security-manager': {
    nombre: 'Agente: gestor de seguridad',
    descripcion: 'Para invocar el agente `security-manager` en claude-flow. Úsalo con `$agent-security-manager` para gestión de seguridad: auditorías, políticas de acceso y respuesta a vulnerabilidades.'
  },
  'agent-specification': {
    nombre: 'Agente: especificación',
    descripcion: 'Para invocar el agente `specification` en claude-flow. Úsalo con `$agent-specification` para crear especificaciones técnicas detalladas de funcionalidades y sistemas.'
  },
  'agent-swarm': {
    nombre: 'Agente: swarm general',
    descripcion: 'Para invocar el agente `swarm` en claude-flow. Úsalo con `$agent-swarm` para coordinar swarms de agentes generales en tareas colaborativas complejas.'
  },
  'agent-tester': {
    nombre: 'Agente: tester',
    descripcion: 'Para invocar el agente `tester` en claude-flow. Úsalo con `$agent-tester` para diseño y ejecución de suites de tests con cobertura comprehensiva y análisis de resultados.'
  },
  'agent-v3-integration-architect': {
    nombre: 'Agente: arquitecto de integración v3',
    descripcion: 'Para invocar el agente `v3-integration-architect` en claude-flow. Úsalo con `$agent-v3-integration-architect` para diseñar la arquitectura de integración de claude-flow v3.'
  },
  'agent-v3-security-architect': {
    nombre: 'Agente: arquitecto de seguridad v3',
    descripcion: 'Para invocar el agente `v3-security-architect` en claude-flow. Úsalo con `$agent-v3-security-architect` para diseñar la arquitectura de seguridad de claude-flow v3.'
  },
  'agentdb-advanced': {
    nombre: 'AgentDB — funciones avanzadas',
    descripcion: 'Para dominar funciones avanzadas de AgentDB: sincronización QUIC, gestión multi-base de datos, replicación distribuida y operaciones de alta disponibilidad. Úsalo en arquitecturas de producción con AgentDB.'
  },
  'agentdb-vector-search': {
    nombre: 'AgentDB — búsqueda vectorial semántica',
    descripcion: 'Para implementar búsqueda vectorial semántica con AgentDB: recuperación inteligente de documentos, indexación HNSW y búsqueda por similitud en bases de conocimiento de agentes.'
  },
  'agent-project-board-sync': {
    nombre: 'Agente: sincronización de project boards',
    descripcion: 'Para invocar el agente `project-board-sync` en claude-flow. Úsalo con `$agent-project-board-sync` para sincronizar GitHub Project Boards con el estado real de tareas e issues.'
  },
  'agent-raft-manager': {
    nombre: 'Agente: gestor Raft',
    descripcion: 'Para invocar el agente `raft-manager` en claude-flow. Úsalo con `$agent-raft-manager` para consenso distribuido usando el algoritmo Raft en clusters de agentes.'
  },
  'agent-repo-architect': {
    nombre: 'Agente: arquitecto de repositorios',
    descripcion: 'Para invocar el agente `repo-architect` en claude-flow. Úsalo con `$agent-repo-architect` para diseñar y reorganizar la estructura de repositorios con mejores prácticas.'
  },
  'agent-safla-neural': {
    nombre: 'Agente: SAFLA neural',
    descripcion: 'Para invocar el agente `safla-neural` en claude-flow. Úsalo con `$agent-safla-neural` para aprendizaje adaptativo con el framework SAFLA (Self-Adaptive Feedback Loop Architecture).'
  },
  'agent-sona-learning-optimizer': {
    nombre: 'Agente: optimizador de aprendizaje SONA',
    descripcion: 'Para invocar el agente `sona-learning-optimizer` en claude-flow. Úsalo con `$agent-sona-learning-optimizer` para optimización de aprendizaje con SONA (Self-Optimizing Neural Architecture).'
  },
  'agent-swarm-issue': {
    nombre: 'Agente: swarm para issues',
    descripcion: 'Para invocar el agente `swarm-issue` en claude-flow. Úsalo con `$agent-swarm-issue` para resolución de issues complejos con swarms de agentes especializados en diagnóstico.'
  },
  'agent-sync-coordinator': {
    nombre: 'Agente: coordinador de sincronización',
    descripcion: 'Para invocar el agente `sync-coordinator` en claude-flow. Úsalo con `$agent-sync-coordinator` para sincronización de estado consistente entre múltiples agentes y repos.'
  },
  'agent-topology-optimizer': {
    nombre: 'Agente: optimizador de topología',
    descripcion: 'Para invocar el agente `topology-optimizer` en claude-flow. Úsalo con `$agent-topology-optimizer` para optimizar la topología del swarm según la naturaleza de las tareas.'
  },
  'agent-v3-memory-specialist': {
    nombre: 'Agente: especialista de memoria v3',
    descripcion: 'Para invocar el agente `v3-memory-specialist` en claude-flow. Úsalo con `$agent-v3-memory-specialist` para implementar y optimizar el sistema de memoria unificado de v3.'
  },
  'agent-worker-specialist': {
    nombre: 'Agente: especialista de workers',
    descripcion: 'Para invocar el agente `worker-specialist` en claude-flow. Úsalo con `$agent-worker-specialist` para optimizar el sistema de workers: pools, scheduling y gestión de recursos.'
  },
  'agentdb-learning': {
    nombre: 'AgentDB — plugins de aprendizaje',
    descripcion: 'Para crear y entrenar plugins de aprendizaje con los 9 algoritmos de aprendizaje por refuerzo de AgentDB. Úsalo cuando necesites agentes que mejoren con la experiencia usando Q-learning, PPO u otros algoritmos.'
  },
  'agentic-jujutsu': {
    nombre: 'Agentic Jujutsu — control de versiones AI',
    descripcion: 'Para control de versiones resistente a quantum con aprendizaje propio para agentes AI usando ReasoningBank. Úsalo cuando necesites gestión avanzada de versiones en pipelines de agentes autónomos.'
  },
  'flow-nexus-platform': {
    nombre: 'Flow Nexus — gestión de plataforma',
    descripcion: 'Para gestión integral de la plataforma Flow Nexus: autenticación, sandboxes, despliegue de apps y flujos de trabajo en la nube. Úsalo para operaciones completas en el ecosistema Flow Nexus.'
  },
  'github-multi-repo': {
    nombre: 'GitHub — coordinación multi-repositorio',
    descripcion: 'Para coordinación, sincronización y gestión de arquitectura en múltiples repositorios GitHub simultáneamente. Úsalo cuando necesites cambios coordinados o refactoring cross-repo.'
  },
  'hive-mind-advanced': {
    nombre: 'Hive Mind — inteligencia colectiva avanzada',
    descripcion: 'Para el sistema avanzado de inteligencia colectiva Hive Mind: coordinación multi-agente liderada por queen con consenso Byzantine, emergencia colectiva y patrones de coordinación distribuida de alto nivel.'
  },
  'neural-training': {
    nombre: 'Entrenamiento neural con SONA y MoE',
    descripcion: 'Para entrenamiento de patrones neurales con SONA (Self-Optimizing Neural Architecture), Mixture of Experts y mecanismos de feedback adaptativo. Úsalo para optimizar el aprendizaje de agentes en claude-flow.'
  },
  'reasoningbank-intelligence': {
    nombre: 'ReasoningBank — aprendizaje adaptativo',
    descripcion: 'Para implementar aprendizaje adaptativo con ReasoningBank: reconocimiento de patrones, aprendizaje de estrategias y mejora continua de razonamiento en agentes. Úsalo cuando los agentes necesiten aprender de ejecuciones previas.'
  },
  'stream-chain': {
    nombre: 'Stream-JSON — chaining multi-agente',
    descripcion: 'Para chaining de Stream-JSON en pipelines multi-agente, transformación de datos y workflows secuenciales. Úsalo cuando necesites pasar outputs estructurados entre agentes en cadena.'
  },
  'agent-tdd-london-swarm': {
    nombre: 'Agente: swarm TDD estilo Londres',
    descripcion: 'Para invocar el agente `tdd-london-swarm` en claude-flow. Úsalo con `$agent-tdd-london-swarm` para desarrollo guiado por tests con metodología TDD estilo Londres y coordinación de swarms.'
  },
  'agent-trading-predictor': {
    nombre: 'Agente: predictor de trading',
    descripcion: 'Para invocar el agente `trading-predictor` en claude-flow. Úsalo con `$agent-trading-predictor` para modelos predictivos de trading con análisis de señales y gestión de riesgo.'
  },
  'agent-v3-performance-engineer': {
    nombre: 'Agente: ingeniero de rendimiento v3',
    descripcion: 'Para invocar el agente `v3-performance-engineer` en claude-flow. Úsalo con `$agent-v3-performance-engineer` para alcanzar los objetivos de rendimiento de claude-flow v3.'
  },
  'agent-workflow-automation': {
    nombre: 'Agente: automatización de flujos de trabajo',
    descripcion: 'Para invocar el agente `workflow-automation` en claude-flow. Úsalo con `$agent-workflow-automation` para diseñar y ejecutar flujos de trabajo automatizados con lógica condicional.'
  },
  'agentdb-memory-patterns': {
    nombre: 'AgentDB — patrones de memoria persistente',
    descripcion: 'Para implementar patrones de memoria persistente en agentes AI con AgentDB: memoria de sesión, episódica y semántica. Úsalo cuando los agentes necesiten recordar contexto entre sesiones.'
  },
  'claims': {
    nombre: 'Claims — autorización basada en claims',
    descripcion: 'Para autorización basada en claims en agentes y operaciones: otorgar, revocar y verificar permisos. Úsalo cuando necesites control de acceso granular basado en claims en swarms.'
  },
  'flow-nexus-swarm': {
    nombre: 'Flow Nexus — swarms en la nube',
    descripcion: 'Para despliegue de swarms AI en la nube y automatización de flujos event-driven con Flow Nexus. Úsalo cuando necesites escalar swarms claude-flow en infraestructura cloud gestionada.'
  },
  'github-project-management': {
    nombre: 'GitHub — gestión de proyectos con swarms',
    descripcion: 'Para gestión integral de proyectos GitHub con swarms coordinados: tracking de issues, planificación de sprints, gestión de milestones y coordinación de equipos distribuidos.'
  },
  'hive-mind': {
    nombre: 'Hive Mind — consenso tolerante a fallos',
    descripcion: 'Para consenso Byzantine fault-tolerant y coordinación distribuida. Topología jerárquica liderada por queen. Úsalo cuando necesites toma de decisiones resiliente en swarms de agentes con tolerancia a fallos.'
  },
  'pair-programming': {
    nombre: 'Pair programming asistido por AI',
    descripcion: 'Para pair programming asistido por AI con múltiples modos (driver/navigator/switch), feedback en tiempo real y coordinación entre agente-humano. Úsalo para sesiones colaborativas de desarrollo.'
  },
  'agent-test-long-runner': {
    nombre: 'Agente: tests de larga duración',
    descripcion: 'Para invocar el agente `test-long-runner` en claude-flow. Úsalo con `$agent-test-long-runner` para tests de integración, carga o endurance de larga duración con monitoreo continuo.'
  },
  'agent-user-tools': {
    nombre: 'Agente: herramientas de usuario',
    descripcion: 'Para invocar el agente `user-tools` en claude-flow. Úsalo con `$agent-user-tools` para gestión y extensión de herramientas personalizadas en el entorno de usuario.'
  },
  'agent-v3-queen-coordinator': {
    nombre: 'Agente: coordinador queen v3',
    descripcion: 'Para invocar el agente `v3-queen-coordinator` en claude-flow. Úsalo con `$agent-v3-queen-coordinator` para coordinación queen centralizada en la arquitectura de swarms v3.'
  },
  'agent-workflow': {
    nombre: 'Agente: flujos de trabajo',
    descripcion: 'Para invocar el agente `workflow` en claude-flow. Úsalo con `$agent-workflow` para diseño y ejecución de flujos de trabajo con nodos, transiciones y lógica de estado.'
  },
  'agentdb-optimization': {
    nombre: 'AgentDB — optimización de rendimiento',
    descripcion: 'Para optimizar el rendimiento de AgentDB: cuantización (reducción de memoria 4-32x), indexación HNSW y tuning de operaciones vectoriales. Úsalo en despliegues de producción con AgentDB a escala.'
  },
  'embeddings': {
    nombre: 'Embeddings vectoriales con HNSW',
    descripcion: 'Para embeddings vectoriales con indexación HNSW, persistencia sql.js y soporte hyperbólico. Úsalo cuando necesites representaciones semánticas de alta calidad con búsqueda de similitud eficiente.'
  },
  'flow-nexus-neural': {
    nombre: 'Flow Nexus — redes neurales en sandboxes E2B',
    descripcion: 'Para entrenar y desplegar redes neurales en sandboxes E2B distribuidos con Flow Nexus. Úsalo cuando necesites entrenamiento de modelos en entornos aislados y escalables en la nube.'
  },
  'github-code-review': {
    nombre: 'GitHub — revisión de código con swarms',
    descripcion: 'Para revisión de código exhaustiva en GitHub con coordinación de swarms AI: análisis multi-perspectiva, detección de bugs, mejoras de rendimiento y verificación de estándares.'
  },
  'github-workflow-automation': {
    nombre: 'GitHub Actions — automatización avanzada',
    descripcion: 'Para automatización avanzada de GitHub Actions con coordinación de swarms AI: pipelines inteligentes, despliegues condicionales, gates de calidad y recuperación automática ante fallos.'
  },
  'reasoningbank-agentdb': {
    nombre: 'ReasoningBank + AgentDB — aprendizaje vectorial',
    descripcion: 'Para implementar aprendizaje adaptativo con ReasoningBank sobre la base de datos vectorial de AgentDB. Úsalo cuando necesites agentes que aprendan rápido con búsqueda de memoria 150x más veloz.'
  },
  'sparc-methodology': {
    nombre: 'Metodología SPARC de desarrollo',
    descripcion: 'Para el flujo de desarrollo SPARC: Especificación, Pseudocódigo, Arquitectura, Refinamiento, Completitud. Úsalo cuando necesites un proceso estructurado y reproducible para implementar funcionalidades complejas.'
  },
  'v3-cli-modernization': {
    nombre: 'Modernización CLI y hooks en claude-flow v3',
    descripcion: 'Para modernizar la CLI y el sistema de hooks de claude-flow v3: interfaces interactivas mejoradas, integración de hooks con MCP y experiencia de usuario optimizada en la línea de comandos.'
  },
  'v3-mcp-optimization': {
    nombre: 'Optimización MCP en claude-flow v3',
    descripcion: 'Para optimizar el servidor MCP y la capa de transporte en claude-flow v3: reducción de latencia, multiplexación de conexiones y gestión eficiente de sesiones MCP a escala.'
  },
  'v3-swarm-coordination': {
    nombre: 'Coordinación jerárquica mesh — 15 agentes v3',
    descripcion: 'Para coordinación jerárquica en malla de 15 agentes en la implementación v3. Orquesta ejecución paralela de especialistas. Úsalo como punto de entrada para trabajo coordinado de alta complejidad en v3.'
  },
  'workflow-automation': {
    nombre: 'Automatización de flujos de trabajo',
    descripcion: 'Para creación, ejecución y gestión de plantillas de workflow. Automatiza procesos complejos multi-paso. Úsalo para secuencias repetibles de tareas que combinen agentes, código y APIs externas.'
  },

  // ============================================================
  // mims-harvard — Harvard Medical School ToolUniverse
  // ============================================================
  'create-tooluniverse-skill': {
    nombre: 'Crear skill de ToolUniverse',
    descripcion: 'Para crear skills de alta calidad para ToolUniverse siguiendo metodología test-driven e independiente de implementación. Integra herramientas de la biblioteca de 1.264+ tools, crea tools nuevas cuando es necesario y produce skills con soporte Python SDK + MCP.'
  },
  'skill_template': {
    nombre: 'Plantilla de skill ToolUniverse',
    descripcion: 'Plantilla base para crear nuevas skills de ToolUniverse. Úsala como punto de partida con la estructura de frontmatter, descripción de herramientas, disparadores de uso y ejemplos requeridos.'
  },
  'devtu-code-optimization': {
    nombre: 'Calidad de código para tools ToolUniverse',
    descripcion: 'Para aplicar patrones y guías de calidad de código en el desarrollo de tools de ToolUniverse. Úsalo al escribir, corregir o revisar tools: cobertura de tests, gestión de errores y estándares de documentación.'
  },
  'devtu-github': {
    nombre: 'GitHub workflow para ToolUniverse',
    descripcion: 'Para gestionar el flujo GitHub de ToolUniverse de forma segura: mover archivos temporales, activar hooks pre-commit, ejecutar tests y hacer push limpio. Úsalo antes de cualquier push al repositorio de ToolUniverse.'
  },
  'devtu-auto-discover-apis': {
    nombre: 'Descubrimiento automático de APIs bio',
    descripcion: 'Para descubrir automáticamente APIs de ciencias de la vida en línea, crear tools para ToolUniverse, validarlas y prepararlas para producción. Úsalo para expandir la cobertura de APIs biomédicas de ToolUniverse.'
  },
  'devtu-fix-tool': {
    nombre: 'Corregir tools fallidas de ToolUniverse',
    descripcion: 'Para corregir tools de ToolUniverse que fallan: diagnosticar fallos de tests, identificar causas raíz, implementar correcciones e iterar hasta que los tests pasen. Úsalo cuando una tool devuelve errores o resultados inesperados.'
  },
  'devtu-create-tool': {
    nombre: 'Crear nuevas tools científicas',
    descripcion: 'Para crear nuevas tools científicas para el framework ToolUniverse con estructura correcta, validación y tests completos. Úsalo cuando necesites integrar una API o fuente de datos científica nueva.'
  },
  'devtu-optimize-descriptions': {
    nombre: 'Optimizar descripciones de tools',
    descripcion: 'Para optimizar las descripciones de tools en los JSON de configuración de ToolUniverse: mayor claridad, usabilidad y precisión. Úsalo cuando las descripciones son ambiguas o dificultan la selección correcta de tools.'
  },
  'tooluniverse-acmg-variant-classification': {
    nombre: 'Clasificación de variantes ACMG/AMP',
    descripcion: 'Para clasificación sistemática de variantes genéticas según criterios ACMG/AMP con ToolUniverse. Dado un variante genético (HGVS, rsID o coordenadas), recupera evidencia de múltiples bases de datos y genera informe ACMG estructurado.'
  },
  'tooluniverse-aging-senescence': {
    nombre: 'Biología del envejecimiento y senescencia',
    descripcion: 'Para investigar biología del envejecimiento, senescencia celular y longevidad con ToolUniverse. Cubre marcadores de senescencia, vías de envejecimiento, senolíticos, SASP y bases de datos especializadas como CellAge y DrugAge.'
  },
  'tooluniverse-cancer-genomics-tcga': {
    nombre: 'Genómica del cáncer — TCGA/GDC',
    descripcion: 'Para análisis de genómica del cáncer con TCGA/GDC: construcción de cohortes, metadatos clínicos, mutaciones somáticas, CNVs, expresión y datos de supervivencia. Úsalo para análisis de datos de cáncer a nivel genómico.'
  },
  'tooluniverse-chemical-safety': {
    nombre: 'Seguridad química y toxicología',
    descripcion: 'Para evaluación integral de seguridad química y toxicología: predicciones ADMET-AI, toxicología CTD, análisis AOPWiki, datos EPA CompTox y evaluación de riesgo ambiental. Úsalo para perfiles de seguridad de compuestos.'
  },
  'devtu-docs-quality': {
    nombre: 'Calidad de documentación ToolUniverse',
    descripcion: 'PRIORIDAD MÁXIMA — para encontrar y corregir o eliminar toda la documentación incorrecta, desactualizada o redundante de ToolUniverse de forma inmediata. Úsalo antes de cualquier publicación o release.'
  },
  'devtu-optimize-skills': {
    nombre: 'Optimizar skills de ToolUniverse',
    descripcion: 'Para optimizar skills de ToolUniverse: mejor calidad de informes, gestión de evidencias y experiencia de usuario. Úsalo cuando las skills producen informes de baja calidad o los usuarios no obtienen respuestas accionables.'
  },
  'tooluniverse-admet-prediction': {
    nombre: 'Predicción ADMET de fármacos',
    descripcion: 'Para perfilado completo de ADMET (Absorción, Distribución, Metabolismo, Excreción, Toxicidad) de candidatos a fármacos. Úsalo en drug discovery temprano para evaluar drugability y filtrar compuestos por propiedades farmacocinéticas.'
  },
  'tooluniverse-antibody-engineering': {
    nombre: 'Ingeniería y optimización de anticuerpos',
    descripcion: 'Para ingeniería y optimización de anticuerpos terapéuticos: humanización, maduración de afinidad, predicción de inmunogenicidad y análisis estructural. Úsalo en desarrollo de biológicos y diseño de anticuerpos terapéuticos.'
  },
  'devtu-self-evolve': {
    nombre: 'Auto-evolución de ToolUniverse',
    descripcion: 'Para orquestar el ciclo completo de auto-mejora de ToolUniverse: descubrir APIs, crear tools, testear con benchmarks reales y preparar para producción. Úsalo para expandir y mejorar el ecosistema de forma autónoma.'
  },
  'tooluniverse-adverse-event-detection': {
    nombre: 'Detección de eventos adversos a fármacos',
    descripcion: 'Para detectar y analizar señales de eventos adversos usando datos FDA FAERS, etiquetas de fármacos y análisis de desproporción. Úsalo en farmacovigilancia y evaluación de seguridad post-comercialización.'
  },
  'tooluniverse-binder-discovery': {
    nombre: 'Descubrimiento de ligandos para proteínas',
    descripcion: 'Para descubrir ligandos de moléculas pequeñas para dianas proteicas usando enfoques structure-based y ligand-based. Úsalo en drug discovery y química medicinal para identificar hits y leads iniciales.'
  },
  'tooluniverse-cell-line-profiling': {
    nombre: 'Perfilado de líneas celulares',
    descripcion: 'Para seleccionar y caracterizar líneas celulares de cáncer para experimentos. Dado un tipo de cáncer, genera perfiles genómicos, de expresión y farmacológicos para elegir el modelo celular más apropiado.'
  },
  'tooluniverse-clinical-data-integration': {
    nombre: 'Integración de datos de seguridad clínica',
    descripcion: 'Para revisión integral de seguridad de fármacos: etiquetas FDA, informes de eventos adversos FAERS, análisis de desproporción y señales de farmacovigilancia integradas. Úsalo en evaluaciones de beneficio-riesgo.'
  },
  'setup-tooluniverse': {
    nombre: 'Instalar y configurar ToolUniverse',
    descripcion: 'Para instalar y configurar ToolUniverse en cualquier caso de uso: servidor MCP (basado en chat), CLI (línea de comandos con Python SDK) o modo desarrollo. Úsalo al iniciar un nuevo entorno de trabajo con ToolUniverse.'
  },
  'tooluniverse-adverse-outcome-pathway': {
    nombre: 'Mapeo de vías de resultado adverso (AOP)',
    descripcion: 'Para mapear químicos ambientales/industriales a vías mecanísticas de resultado adverso (AOPs) usando AOPWiki y bases de toxicología. Úsalo en evaluación de riesgo ambiental y toxicología regulatoria.'
  },
  'tooluniverse-cancer-classification': {
    nombre: 'Clasificación de cáncer — OncoTree',
    descripcion: 'Para traducir descripciones de tumores a códigos OncoTree, buscar subtipos y jerarquías de cáncer. Úsalo cuando necesites codificación estandarizada de diagnósticos oncológicos para análisis de cohortes.'
  },
  'tooluniverse-chemical-compound-retrieval': {
    nombre: 'Recuperación de compuestos químicos',
    descripcion: 'Para recuperar información de compuestos químicos de PubChem y ChEMBL con desambiguación, referencias cruzadas y propiedades. Úsalo cuando necesites identificadores, estructuras o propiedades de compuestos de química medicinal.'
  },
  'tooluniverse-cancer-variant-interpretation': {
    nombre: 'Interpretación de variantes somáticas en cáncer',
    descripcion: 'Para interpretación clínica de mutaciones somáticas en cáncer: dado un gen y variante, evalúa oncogenicidad, nivel de evidencia clínica, tratamientos disponibles e implicaciones pronósticas.'
  },
  'tooluniverse-chemical-sourcing': {
    nombre: 'Fuentes comerciales de compuestos químicos',
    descripcion: 'Para encontrar fuentes comerciales de compuestos químicos en ZINC, Enamine, eMolecules y Mcule. Úsalo cuando necesites adquirir compuestos para síntesis, screening o estudios biológicos.'
  },
  'tooluniverse-clinical-trial-matching': {
    nombre: 'Matching de pacientes con ensayos clínicos',
    descripcion: 'Para matching paciente-ensayo clínico en medicina de precisión y oncología. Dado un perfil de paciente (diagnóstico, genómica, tratamientos previos), identifica ensayos elegibles con razonamiento clínico explícito.'
  },
  'tooluniverse-custom-tool': {
    nombre: 'Herramientas locales en ToolUniverse',
    descripcion: 'Para añadir herramientas locales personalizadas a ToolUniverse y usarlas junto a las 1.000+ integradas. Úsalo cuando tengas pipelines, APIs privadas o scripts locales que necesiten integrarse en el framework.'
  },
  'tooluniverse-clinical-guidelines': {
    nombre: 'Guías clínicas y de práctica médica',
    descripcion: 'Para buscar y recuperar guías de práctica clínica de 12+ fuentes autorizadas: NICE, WHO, y sociedades médicas especializadas. Úsalo para obtener recomendaciones basadas en evidencia en decisiones clínicas.'
  },
  'tooluniverse-computational-biophysics': {
    nombre: 'Biofísica computacional y farmacocinética',
    descripcion: 'Para resolver problemas cuantitativos en biofísica, farmacocinética, epidemiología, toxicología y genética de poblaciones. Úsalo cuando necesites modelado matemático riguroso de sistemas biológicos.'
  },
  'tooluniverse-clinical-trial-design': {
    nombre: 'Diseño de ensayos clínicos',
    descripcion: 'Para evaluación de viabilidad en diseño estratégico de ensayos clínicos con ToolUniverse: población de pacientes, endpoints, tamaño muestral, competencia y riesgos regulatorios. Úsalo en fases tempranas de planificación.'
  },
  'tooluniverse-crispr-screen-analysis': {
    nombre: 'Análisis de pantallas CRISPR',
    descripcion: 'Para análisis exhaustivo de pantallas CRISPR en genómica funcional: pantallas pooled o arrayed, identificación de genes esenciales, análisis de enriquecimiento de guías y validación de hits. Úsalo en proyectos de CRISPR screen.'
  },
  'tooluniverse-dataset-discovery': {
    nombre: 'Descubrimiento de datasets científicos',
    descripcion: 'Para encontrar y evaluar datasets de investigación para cualquier pregunta científica. Enseña a razonar sobre necesidades de datos, evaluar calidad de datasets y encontrar los recursos más apropiados disponibles públicamente.'
  },
  'tooluniverse-comparative-genomics': {
    nombre: 'Genómica comparativa y conservación evolutiva',
    descripcion: 'Para comparación de genes y secuencias entre especies, análisis de ortólogos y evaluación de conservación evolutiva. Úsalo en estudios de genómica comparativa y transferencia de conocimiento entre organismos modelo.'
  },
  'tooluniverse-data-integration-analysis': {
    nombre: 'Integración de resultados estadísticos y biológicos',
    descripcion: 'Para integrar resultados de análisis estadísticos con conocimiento biológico de las tools de ToolUniverse. Úsalo después de completar análisis estadísticos para añadir contexto biológico e interpretación mecanística.'
  },
  'tooluniverse-data-wrangling': {
    nombre: 'Acceso y manipulación de datos científicos',
    descripcion: 'Para referencia universal de acceso a datos en investigación científica: descargar datos en bulk, parsear formatos, limpiar datasets. Úsalo cuando necesites orientación sobre cómo obtener y preparar datos de bases públicas.'
  },
  'tooluniverse-disease-research': {
    nombre: 'Investigación de enfermedades — informe completo',
    descripcion: 'Para generar informes exhaustivos de investigación de enfermedades usando 100+ tools de ToolUniverse: epidemiología, genómica, vías moleculares, fármacos existentes y dianas terapéuticas emergentes.'
  },
  'tooluniverse-drug-drug-interaction': {
    nombre: 'Interacciones fármaco-fármaco (DDI)',
    descripcion: 'Para predicción y evaluación de riesgo de interacciones fármaco-fármaco: mecanismos de interacción (PK/PD), severidad clínica y recomendaciones de manejo. Úsalo en revisión de medicación y seguridad farmacológica.'
  },
  'tooluniverse-drug-research': {
    nombre: 'Investigación de fármacos — informe completo',
    descripcion: 'Para generar informes exhaustivos de investigación de fármacos: desambiguación del compuesto, gradación de evidencia y análisis integral de mecanismo, eficacia, seguridad y estado regulatorio.'
  },
  'tooluniverse-epidemiological-analysis': {
    nombre: 'Análisis epidemiológico de extremo a extremo',
    descripcion: 'Para análisis epidemiológico completo: desde pregunta de investigación hasta informe estadístico. Cubre diseño de estudio, fuentes de datos, análisis de supervivencia, regresión y epidemiología genética.'
  },
  'tooluniverse-functional-genomics-screens': {
    nombre: 'Pantallas de genómica funcional (CRISPR/shRNA)',
    descripcion: 'Para interpretar resultados de pantallas genéticas CRISPR/shRNA usando datos de esencialidad DepMap, puntuaciones de constraint y contextos dependientes de línea celular. Úsalo en análisis post-screen para priorizar hits.'
  },
  'tooluniverse-gpcr-structural-pharmacology': {
    nombre: 'Farmacología estructural de GPCRs',
    descripcion: 'Para investigar receptores GPCR, estructuras de anticuerpos e interfaces proteicas usando GPCRdb, SAbDab y herramientas estructurales. Úsalo en drug discovery dirigido a GPCRs y diseño de anticuerpos.'
  },
  'tooluniverse-gwas-study-explorer': {
    nombre: 'Comparación de estudios GWAS',
    descripcion: 'Para comparar estudios GWAS, realizar meta-análisis y evaluar replicación entre cohortes. Integra NHGRI GWAS Catalog con 500k+ asociaciones. Úsalo en meta-análisis genéticos y evaluación de reproducibilidad de loci.'
  },
  'tooluniverse-drug-mechanism-research': {
    nombre: 'Investigación del mecanismo de acción de fármacos',
    descripcion: 'Para investigar el mecanismo de acción de fármacos: trazar sistemáticamente desde la diana primaria hacia vías afectadas, efectos secundarios y relación estructura-actividad. Úsalo en pharmacology y drug repurposing.'
  },
  'tooluniverse-drug-target-validation': {
    nombre: 'Validación computacional de dianas farmacológicas',
    descripcion: 'Para validación computacional integral de dianas farmacológicas en drug discovery temprano: esencialidad, druggability, asociaciones genéticas con enfermedad, expresión y seguridad. Úsalo antes de invertir en química medicinal.'
  },
  'tooluniverse-epigenomics-chromatin': {
    nombre: 'Epigenómica y accesibilidad de cromatina',
    descripcion: 'Para investigación de epigenómica y accesibilidad de cromatina: datos ChIP-seq de modificaciones de histonas de ENCODE, ATAC-seq y análisis de regiones reguladoras. Úsalo en estudios de regulación génica.'
  },
  'tooluniverse-gene-disease-association': {
    nombre: 'Asociaciones gen-enfermedad',
    descripcion: 'Para encontrar y comparar asociaciones gen-enfermedad en múltiples bases de datos: DisGeNET, OpenTargets, Monarch Initiative y OMIM. Úsalo para evaluar evidencia de asociación antes de priorizar dianas.'
  },
  'tooluniverse-gwas-drug-discovery': {
    nombre: 'GWAS a dianas farmacológicas',
    descripcion: 'Para transformar señales GWAS en dianas farmacológicas y oportunidades de repurposing: fine-mapping de loci, genes candidatos, druggability y priorización. Úsalo en estrategias de drug discovery guiadas por genética humana.'
  },
  'tooluniverse-gwas-trait-to-gene': {
    nombre: 'GWAS — de rasgo a gen',
    descripcion: 'Para descubrir genes asociados con enfermedades usando datos GWAS del GWAS Catalog (500.000+ asociaciones). Úsalo para identificar genes candidatos de un rasgo, evaluar replicación y priorizar para validación funcional.'
  },
  'tooluniverse-drug-regulatory': {
    nombre: 'Investigación regulatoria de fármacos',
    descripcion: 'Para investigación regulatoria y de aprobación de fármacos: registro de sustancias FDA, clasificación por ATC, aprobaciones por indicación y estado regulatorio global. Úsalo en due diligence regulatorio y market access.'
  },
  'tooluniverse-ecology-biodiversity': {
    nombre: 'Ecología, biodiversidad y conservación',
    descripcion: 'Para investigación en ecología, biodiversidad y biología de conservación: identificación de especies, especies invasoras, estado de conservación, distribución geográfica y análisis de ecosistemas.'
  },
  'tooluniverse-epigenomics': {
    nombre: 'Procesamiento de datos de epigenómica',
    descripcion: 'Para procesamiento de producción de datos genómicos y epigenómicos: metilación del DNA, ChIP-seq de histonas, ATAC-seq y análisis integrado. Úsalo en pipelines de análisis epigenómico listo para producción.'
  },
  'tooluniverse-gene-enrichment': {
    nombre: 'Enriquecimiento génico y análisis de vías',
    descripcion: 'Para análisis integral de enriquecimiento génico y vías metabólicas usando gseapy (ORA y GSEA), PANTHER, STRING y otras bases de datos. Úsalo tras obtener una lista de genes para interpretación biológica.'
  },
  'tooluniverse-gwas-finemapping': {
    nombre: 'Fine-mapping estadístico de loci GWAS',
    descripcion: 'Para identificar y priorizar variantes causales en loci GWAS mediante fine-mapping estadístico y análisis locus-to-gene. Úsalo para reducir el conjunto de variantes candidatas antes de validación funcional.'
  },
  'tooluniverse-hla-immunogenomics': {
    nombre: 'HLA e inmunogenómica',
    descripcion: 'Para analizar genes HLA, binding MHC, asociaciones epítopo-MHC e inmunogenómica en compatibilidad de trasplantes, enfermedades autoinmunes y desarrollo de vacunas. Úsalo en estudios de inmunogenómica clínica.'
  },
  'tooluniverse-drug-repurposing': {
    nombre: 'Repurposing de fármacos',
    descripcion: 'Para identificar candidatos de drug repurposing con ToolUniverse: enfoques basados en diana, compuesto o enfermedad. Úsalo cuando quieras encontrar nuevas indicaciones para fármacos existentes o aprobados.'
  },
  'tooluniverse-electron-microscopy': {
    nombre: 'Microscopía electrónica y cryo-EM',
    descripcion: 'Para buscar y analizar mapas cryo-EM, estructuras de single particle, datasets de tomografía y micrógrafs crudos del EMDB. Úsalo en estudios estructurales y validación de complejos macromoleculares.'
  },
  'tooluniverse-expression-data-retrieval': {
    nombre: 'Recuperación de datos de expresión génica',
    descripcion: 'Para recuperar datasets de expresión génica y omics de ArrayExpress y BioStudies con desambiguación génica. Úsalo cuando necesites datos de expresión públicos para análisis downstream.'
  },
  'tooluniverse-gene-regulatory-networks': {
    nombre: 'Redes de regulación génica',
    descripcion: 'Para analizar redes de regulación génica: factores de transcripción, targets, co-expresión y regulación diferencial. Úsalo en estudios de regulación transcripcional y construcción de modelos de red génica.'
  },
  'tooluniverse-gwas-snp-interpretation': {
    nombre: 'Interpretación de SNPs de GWAS',
    descripcion: 'Para interpretar variantes genéticas (SNPs) de estudios GWAS: agregación de evidencia de múltiples bases de datos, anotación funcional, datos eQTL y relevancia clínica. Úsalo en genómica de población y medicina de precisión.'
  },
  'tooluniverse-image-analysis': {
    nombre: 'Análisis de imágenes de microscopía',
    descripcion: 'Para análisis de imágenes de microscopía listo para producción: morfometría de colonias, cuantificación celular y análisis de datos de imaging cuantitativo. Úsalo en workflows de High Content Screening y biología celular.'
  },
  'tooluniverse-infectious-disease': {
    nombre: 'Enfermedades infecciosas y patógenos',
    descripcion: 'Para caracterización rápida de patógenos y análisis de drug repurposing en brotes de enfermedades infecciosas. Identifica agentes terapéuticos potenciales integrando genómica, dianas y datos de compuestos.'
  },
  'tooluniverse-immune-repertoire-analysis': {
    nombre: 'Análisis de repertorio inmune TCR/BCR',
    descripcion: 'Para análisis exhaustivo de repertorio inmune de datos de secuenciación de receptores T y B (TCR/BCR): diversidad, expansión clonal, similitud de secuencias y análisis de especificidad. Úsalo en inmunología traslacional.'
  },
  'tooluniverse-inorganic-physical-chemistry': {
    nombre: 'Química inorgánica y ciencia de materiales',
    descripcion: 'Para química inorgánica, fisicoquímica y ciencia de materiales: estructuras cristalinas, química de coordinación y propiedades de materiales. Úsalo en investigación de catalizadores, materiales funcionales y síntesis inorgánica.'
  },
  'tooluniverse-literature-deep-research': {
    nombre: 'Investigación profunda de literatura científica',
    descripcion: 'Para investigación exhaustiva de literatura académica en cualquier dominio usando 120+ tools de ToolUniverse: búsqueda semántica, síntesis multi-fuente e identificación de brechas de conocimiento.'
  },
  'tooluniverse-metagenomics-analysis': {
    nombre: 'Análisis de metagenómica y microbioma',
    descripcion: 'Para analizar datos de microbioma y metagenómica con MGnify, GTDB, ENA y tools de literatura. Úsalo en estudios de diversidad microbiana, composición de microbiota e impacto en salud y enfermedad.'
  },
  'tooluniverse-multiomic-disease-characterization': {
    nombre: 'Caracterización multi-ómica de enfermedades',
    descripcion: 'Para caracterización integral de enfermedades integrando genómica, transcriptómica, proteómica, epigenómica y metabolómica. Úsalo en proyectos de multi-omics para obtener una visión mecanística completa.'
  },
  'tooluniverse-organic-chemistry': {
    nombre: 'Química orgánica — razonamiento y problemas',
    descripcion: 'Para razonamiento en química orgánica: predicción de productos de reacción, espectroscopía (NMR, MS, IR), retrosíntesis y mecanismos de reacción. Úsalo en síntesis química y caracterización estructural de compuestos.'
  },
  'tooluniverse-immunology': {
    nombre: 'Inmunología — flujos de investigación',
    descripcion: 'Para workflows de investigación en inmunología con ToolUniverse: análisis estructural anticuerpo-antígeno, señalización inmune, inflamación, tolerancia y vías de respuesta inmune innata y adaptativa.'
  },
  'tooluniverse-install-skills': {
    nombre: 'Instalación automática de skills ToolUniverse',
    descripcion: 'Para detectar e instalar automáticamente skills de ToolUniverse faltantes verificando directorios de clientes comunes. Úsalo cuando una skill requerida no está disponible en el entorno actual.'
  },
  'tooluniverse-metabolomics-analysis': {
    nombre: 'Análisis de metabolómica',
    descripcion: 'Para analizar datos de metabolómica: identificación de metabolitos, cuantificación, análisis de vías y comparación de perfiles metabólicos entre condiciones. Úsalo en estudios de metabolómica cuantitativa y diferencial.'
  },
  'tooluniverse-microbiome-research': {
    nombre: 'Investigación de microbioma y metagenómica',
    descripcion: 'Para analizar datos de microbioma y metagenómica con MGnify, GTDB, ENA y literatura. Úsalo para estudios de composición de microbiota, diversidad funcional y asociaciones con salud o enfermedad.'
  },
  'tooluniverse-network-pharmacology': {
    nombre: 'Farmacología de redes',
    descripcion: 'Para construir y analizar redes compuesto-diana-enfermedad en drug repurposing, descubrimiento de polifarmacología y poliedricidad. Úsalo cuando quieras entender el mecanismo de acción desde una perspectiva de sistemas.'
  },
  'tooluniverse-pathway-disease-genetics': {
    nombre: 'Vías metabólicas y genética de enfermedades',
    descripcion: 'Para conectar variantes GWAS con vías biológicas en descubrimiento de dianas: mapeo de SNPs asociados a enfermedad a vías funcionales. Úsalo en proyectos de genetics-first drug discovery.'
  },
  'tooluniverse-plant-genomics': {
    nombre: 'Genómica de plantas',
    descripcion: 'Para investigar genes, vías y especies vegetales usando PlantReactome, Ensembl Plants, POWO, UniProt y KEGG. Úsalo en investigación de genómica vegetal, mejora de cultivos y biología vegetal comparativa.'
  },
  'tooluniverse-immunotherapy-response-prediction': {
    nombre: 'Predicción de respuesta a inmunoterapia',
    descripcion: 'Para predecir la respuesta de pacientes a inhibidores de checkpoint inmune (ICIs) con integración multi-biomarcador: carga mutacional tumoral (TMB), expresión PD-L1, estado MSI y firmas inmunes.'
  },
  'tooluniverse-kegg-disease-drug': {
    nombre: 'KEGG — enfermedad, fármaco y variantes',
    descripcion: 'Para investigación basada en KEGG de enfermedad-fármaco-variante: bases de datos KEGG Disease, Drug, Network y Variant. Úsalo cuando necesites contexto de vías metabólicas para enfermedades o mecanismos de fármacos.'
  },
  'tooluniverse-metabolomics-pathway': {
    nombre: 'Metabolómica y análisis de vías metabólicas',
    descripcion: 'Para análisis de vías en metabolómica: identificación de metabolitos, mapeo a vías metabólicas, asociaciones con enfermedades y comparativa entre condiciones. Úsalo en estudios de metabolómica funcional.'
  },
  'tooluniverse-model-organism-genetics': {
    nombre: 'Genética de organismos modelo',
    descripcion: 'Para análisis genético comparativo con bases de datos de organismos modelo: mapeo de genes humanos a ortólogos en ratón, zebrafish y otros modelos. Úsalo en estudios de genómica funcional con organismos modelo.'
  },
  'tooluniverse-neuroscience': {
    nombre: 'Neurociencia — flujos de investigación',
    descripcion: 'Para workflows de investigación en neurociencia con ToolUniverse: neurociencia computacional, conectómica, farmacología neuronal, genómica de trastornos neurológicos y análisis de datos de cerebro.'
  },
  'tooluniverse-pharmacogenomics': {
    nombre: 'Farmacogenómica (PGx)',
    descripcion: 'Para investigación farmacogenómica: interacciones fármaco-gen, guías CPIC, interpretación de variantes en genes metabolizadores e implicaciones clínicas para dosificación personalizada. Úsalo en medicina de precisión.'
  },
  'tooluniverse-polygenic-risk-score': {
    nombre: 'Puntuaciones de riesgo poligénico (PRS)',
    descripcion: 'Para construir e interpretar puntuaciones de riesgo poligénico para enfermedades complejas usando estadísticas resumen de GWAS. Úsalo en estudios de estratificación de riesgo y medicina preventiva personalizada.'
  },
  'tooluniverse-precision-oncology': {
    nombre: 'Oncología de precisión',
    descripcion: 'Para proporcionar recomendaciones de tratamiento accionables para pacientes oncológicos basadas en perfil molecular: interpretación de variantes somáticas, druggabilidad y opciones terapéuticas aprobadas o en ensayos.'
  },
  'tooluniverse-lipidomics': {
    nombre: 'Lipidómica y metabolismo lipídico',
    descripcion: 'Para analizar lípidos, metabolismo lipídico y asociaciones lípido-enfermedad usando LIPID MAPS, HMDB, PubChem y KEGG. Úsalo en estudios de lipidómica, enfermedades metabólicas y biología de membranas.'
  },
  'tooluniverse-metabolomics': {
    nombre: 'Metabolómica — investigación comprensiva',
    descripcion: 'Para investigación metabolómica integral: identificación de metabolitos, análisis de estudios, búsqueda en bases de datos y perfiles metabólicos de enfermedades. Úsalo como punto de entrada general en metabolómica.'
  },
  'tooluniverse-multi-omics-integration': {
    nombre: 'Integración multi-ómica',
    descripcion: 'Para integrar y analizar múltiples datasets de omics: transcriptómica, proteómica, epigenómica, genómica y metabolómica. Úsalo cuando necesites una visión sistémica integrando múltiples capas moleculares.'
  },
  'tooluniverse-noncoding-rna': {
    nombre: 'RNAs no codificantes (miRNA, lncRNA, circRNA)',
    descripcion: 'Para analizar RNAs no codificantes: miRNAs, lncRNAs y circRNAs usando miRBase, LNCipedia, RNAcentral y Rfam. Úsalo en estudios de regulación postranscripcional y biomarcadores de RNA.'
  },
  'tooluniverse-pharmacovigilance': {
    nombre: 'Farmacovigilancia y seguridad de fármacos',
    descripcion: 'Para analizar señales de seguridad de fármacos desde informes de eventos adversos FDA, advertencias en etiquetas y datos farmacogenómicos. Úsalo en evaluaciones de seguridad post-aprobación y monitoreo de señales.'
  },
  'tooluniverse-population-genetics-1000genomes': {
    nombre: 'Genética de poblaciones — 1000 Genomas',
    descripcion: 'Para investigación de genética de poblaciones con el Proyecto 1000 Genomas (IGSR): búsqueda de poblaciones, frecuencias alélicas, diferenciación poblacional (Fst) y análisis de estructura genética.'
  },
  'tooluniverse-phylogenetics': {
    nombre: 'Filogenética y análisis de secuencias',
    descripcion: 'Para filogenética y análisis de secuencias listo para producción: procesamiento de alineamientos, análisis de árboles filogenéticos y estudios evolutivos comparativos. Úsalo en biología evolutiva y epidemiología molecular.'
  },
  'tooluniverse-population-genetics': {
    nombre: 'Genética de poblaciones',
    descripcion: 'Para análisis de genética de poblaciones: frecuencias alélicas, diversidad genómica, estructura poblacional y análisis de selección. Úsalo en estudios de evolución, migración y variación genética humana.'
  },
  'tooluniverse-protein-modification-analysis': {
    nombre: 'Modificaciones postraduccionales de proteínas',
    descripcion: 'Para analizar modificaciones postraduccionales (PTMs) de proteínas: sitios de modificación, tipos, proteoformas y su impacto funcional. Úsalo en proteómica, señalización y regulación de la actividad proteica.'
  },
  'tooluniverse-proteomics-analysis': {
    nombre: 'Análisis de datos de proteómica',
    descripcion: 'Para analizar datos de proteómica por espectrometría de masas: cuantificación de proteínas, expresión diferencial e integración con datos de otros omics. Úsalo en proyectos de proteómica cuantitativa y traslacional.'
  },
  'tooluniverse-regulatory-genomics': {
    nombre: 'Genómica regulatoria',
    descripcion: 'Para investigar binding de factores de transcripción, elementos cis-reguladores, accesibilidad de cromatina y regulación del enhancer. Úsalo en estudios de regulación transcripcional y anotación de variantes reguladoras.'
  },
  'tooluniverse-sequence-analysis': {
    nombre: 'Análisis de secuencias biológicas',
    descripcion: 'Para recuperar y analizar secuencias biológicas: secuencias génicas y proteicas de NCBI, Ensembl y UniProt. Úsalo cuando necesites trabajo con secuencias de DNA, RNA o proteínas para análisis downstream.'
  },
  'tooluniverse-spatial-omics-analysis': {
    nombre: 'Análisis de spatial multi-omics',
    descripcion: 'Para análisis computacional de datos de spatial multi-omics: integración de datos espacialmente variables, deconvolución celular e identificación de patrones espaciales de expresión en tejidos.'
  },
  'tooluniverse-precision-medicine-stratification': {
    nombre: 'Estratificación en medicina de precisión',
    descripcion: 'Para estratificación integral de pacientes en medicina de precisión integrando datos genómicos, clínicos y de transcriptómica. Úsalo en estudios de subtipos moleculares y personalización de tratamientos.'
  },
  'tooluniverse-protein-structure-prediction': {
    nombre: 'Predicción de estructura 3D de proteínas',
    descripcion: 'Para predecir y analizar estructuras 3D de proteínas desde secuencia usando ESMFold y AlphaFold. Úsalo cuando necesites predicción estructural rápida para diseño de fármacos o análisis funcional.'
  },
  'tooluniverse-proteomics-data-retrieval': {
    nombre: 'Recuperación de datasets de proteómica',
    descripcion: 'Para encontrar y recuperar datasets de proteómica de repositorios públicos como MassIVE y ProteomeXchange. Úsalo cuando necesites datos proteómicos existentes para meta-análisis o validación.'
  },
  'tooluniverse-regulatory-variant-analysis': {
    nombre: 'Análisis de variantes reguladoras',
    descripcion: 'Para interpretación de variantes reguladoras: lookup de asociaciones GWAS, análisis eQTL, anotación de estado de cromatina y predicción de impacto regulatorio. Úsalo en variantes no codificantes de significado incierto.'
  },
  'tooluniverse-sequence-retrieval': {
    nombre: 'Recuperación de secuencias biológicas',
    descripcion: 'Para recuperar secuencias biológicas (DNA, RNA, proteína) de NCBI y ENA con desambiguación génica. Úsalo como primer paso cuando necesites obtener secuencias para análisis de alineamiento, filogenia o diseño de primers.'
  },
  'tooluniverse-spatial-transcriptomics': {
    nombre: 'Transcriptómica espacial',
    descripcion: 'Para analizar datos de transcriptómica espacial y mapear expresión génica en arquitectura tisular. Compatible con 10x Visium, Slide-seq y otras plataformas. Úsalo en patología computacional y estudios de microentorno tumoral.'
  },
  'tooluniverse-structural-variant-analysis': {
    nombre: 'Análisis de variantes estructurales (SVs)',
    descripcion: 'Para análisis de variantes estructurales (SVs) en genómica clínica: clasificación de SVs (deleciones, duplicaciones, inversiones, translocaciones), interpretación clínica y recomendaciones diagnósticas.'
  },
  'tooluniverse-vaccine-design': {
    nombre: 'Diseño computacional de vacunas',
    descripcion: 'Para diseñar y evaluar candidatos a vacunas con inmunología computacional: predicción de epítopos, presentación MHC, estimación de cobertura poblacional y selección de adyuvantes. Úsalo en desarrollo vacunal.'
  },
  'tooluniverse-protein-interactions': {
    nombre: 'Redes de interacciones proteína-proteína',
    descripcion: 'Para analizar redes de interacciones proteína-proteína usando STRING, BioGRID y SASBDB. Úsalo en estudios de interactoma, identificación de hubs proteicos y contexto de vías para proteínas de interés.'
  },
  'tooluniverse-protein-therapeutic-design': {
    nombre: 'Diseño de proteínas terapéuticas',
    descripcion: 'Para diseñar proteínas terapéuticas novedosas (binders, enzimas, scaffolds) con diseño de novo guiado por AI. Úsalo en proyectos de bioterapéuticos cuando se requieran proteínas de diseño con propiedades específicas.'
  },
  'tooluniverse-rare-disease-genomics': {
    nombre: 'Genómica de enfermedades raras',
    descripcion: 'Para investigación de genómica de enfermedades raras: identificación de enfermedades en Orphanet, descubrimiento de genes causales, interpretación de variantes y estrategias diagnósticas. Úsalo en genómica clínica de enfermedades raras.'
  },
  'tooluniverse-sdk': {
    nombre: 'ToolUniverse SDK — sistemas AI scientist',
    descripcion: 'Para construir sistemas de AI scientist usando el Python SDK de ToolUniverse para investigación científica. Úsalo cuando los usuarios necesiten acceder programáticamente a las herramientas del framework.'
  },
  'tooluniverse-small-molecule-discovery': {
    nombre: 'Descubrimiento de moléculas pequeñas',
    descripcion: 'Para encontrar, caracterizar y obtener moléculas pequeñas en chemical biology y drug discovery: búsqueda de compuestos, análisis de similitud estructural y fuentes comerciales disponibles.'
  },
  'tooluniverse-stem-cell-organoid': {
    nombre: 'Células madre, iPSCs y organoides',
    descripcion: 'Para investigar células madre, iPSCs, organoides y diferenciación celular: pluripotencia, protocolos de diferenciación, marcadores de linaje y plataformas de modelos de enfermedad basados en organoides.'
  },
  'tooluniverse-target-research': {
    nombre: 'Inteligencia integral sobre dianas biológicas',
    descripcion: 'Para obtener inteligencia biológica integral sobre dianas farmacológicas desde 9 rutas de investigación paralelas: proteína, función, estructura, genética, expresión, vías, fármacos, seguridad y literatura.'
  },
  'tooluniverse-protein-structure-retrieval': {
    nombre: 'Recuperación de estructuras proteicas — PDB',
    descripcion: 'Para recuperar datos de estructura proteica del RCSB PDB, PDBe y AlphaFold con desambiguación de proteínas. Úsalo cuando necesites estructuras 3D experimentales o predichas para docking, visualización o análisis.'
  },
  'tooluniverse-rare-disease-diagnosis': {
    nombre: 'Diagnóstico diferencial de enfermedades raras',
    descripcion: 'Para diagnóstico diferencial de pacientes con sospecha de enfermedad rara basado en fenotipo y datos genéticos: priorización de diagnósticos, genes candidatos e interpretación de variantes en contexto clínico.'
  },
  'tooluniverse-rnaseq-deseq2': {
    nombre: 'RNA-seq — análisis diferencial con DESeq2',
    descripcion: 'Para análisis de expresión diferencial de RNA-seq listo para producción usando PyDESeq2: normalización DESeq2, estadísticas de expresión diferencial, visualización y anotación funcional. Úsalo en proyectos de transcriptómica.'
  },
  'tooluniverse-single-cell': {
    nombre: 'Análisis single-cell y matrices de expresión',
    descripcion: 'Para análisis de datos single-cell y matrices de expresión listo para producción usando scanpy, anndata y scipy: clustering, UMAP, anotación de tipos celulares y análisis de expresión diferencial por clúster.'
  },
  'tooluniverse-statistical-modeling': {
    nombre: 'Modelado estadístico de datos biomédicos',
    descripcion: 'Para modelado estadístico y análisis de regresión en datasets biomédicos: regresión lineal, logística y modelos mixtos. Úsalo cuando necesites modelado estadístico riguroso para datos clínicos o experimentales.'
  },
  'tooluniverse-systems-biology': {
    nombre: 'Biología de sistemas y análisis de vías',
    descripcion: 'Para biología de sistemas y análisis de vías usando múltiples bases de datos: Reactome, KEGG, WikiPathways e integración de múltiples omics para modelos mecanísticos de sistemas biológicos.'
  },
  'tooluniverse-structural-proteomics': {
    nombre: 'Proteómica estructural',
    descripcion: 'Para integrar datos de biología estructural con proteómica en validación de dianas farmacológicas: estructuras proteicas, datos de modificaciones, interacciones y druggability. Úsalo en estructura-guided drug design.'
  },
  'tooluniverse-toxicology': {
    nombre: 'Toxicología de compuestos y fármacos',
    descripcion: 'Para evaluar toxicidad química y de fármacos vía vías de resultado adverso, señales de eventos adversos en el mundo real, predicciones in silico y datos de toxicología regulatoria. Úsalo en evaluaciones de seguridad preclínica.'
  },
  'tooluniverse-variant-interpretation': {
    nombre: 'Interpretación sistemática de variantes',
    descripcion: 'Para interpretación clínica sistemática de variantes desde llamadas crudas hasta recomendaciones clasificadas ACMG: anotación, evidencia funcional y priorización diagnóstica. Úsalo en genómica clínica y diagnóstico molecular.'
  },
  'tooluniverse-variant-analysis': {
    nombre: 'Análisis de variantes — VCF y anotación',
    descripcion: 'Para procesamiento de VCF, anotación de variantes, análisis de mutaciones y variantes estructurales listo para producción. Úsalo en pipelines de variant calling y análisis de exoma/genoma completo.'
  },
  'tooluniverse': {
    nombre: 'ToolUniverse — router principal',
    descripcion: 'Para enrutar tareas de ToolUniverse. Primero verifica si hay una skill especializada (105+ skills); si existe, la delega. Si no, ejecuta directamente con las herramientas disponibles. Úsalo como punto de entrada general.'
  },
  'tooluniverse-variant-functional-annotation': {
    nombre: 'Anotación funcional de variantes proteicas',
    descripcion: 'Para anotación funcional de variantes de proteínas: patogenicidad, frecuencia poblacional, estructura, funcionalidad y consecuencias sobre la proteína. Úsalo en interpretación de variantes de significado incierto (VUS).'
  },
  'tooluniverse-variant-to-mechanism': {
    nombre: 'De variante a mecanismo molecular',
    descripcion: 'Para análisis extremo a extremo variante-mecanismo: dado un SNP (rsID o coordenadas), traza el camino desde la variante hasta el gen afectado, la vía biológica impactada y la enfermedad asociada.'
  },
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function headers() {
  return {
    apikey: KEY,
    authorization: `Bearer ${KEY}`,
    'content-type': 'application/json',
    'Prefer': 'return=minimal',
  };
}

async function patchSkill(slug, author, nombre, descripcion) {
  const url = `${BASE}/rest/v1/skills_catalog?slug=eq.${encodeURIComponent(slug)}&author=eq.${encodeURIComponent(author)}`;
  const body = JSON.stringify({ nombre, descripcion });
  const res = await fetch(url, { method: 'PATCH', headers: headers(), body });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`HTTP ${res.status}: ${txt}`);
  }
}

async function fetchSkills(author) {
  const url = `${BASE}/rest/v1/skills_catalog?author=eq.${encodeURIComponent(author)}&select=slug,nombre,descripcion&limit=200`;
  const res = await fetch(url, { headers: { apikey: KEY, authorization: `Bearer ${KEY}` } });
  if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
  return res.json();
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
const AUTHORS = ['ruvnet', 'mims-harvard'];
const startTime = Date.now();

let totalOK = 0, totalFail = 0;
const failLog = [];
const stats = {};

for (const author of AUTHORS) {
  console.log(`\n=== Procesando autor: ${author} ===`);
  const skills = await fetchSkills(author);
  console.log(`  → ${skills.length} skills encontradas`);

  let ok = 0, fail = 0, skipped = 0;

  for (let i = 0; i < skills.length; i++) {
    const skill = skills[i];
    const tr = TRANSLATIONS[skill.slug];

    if (!tr) {
      console.log(`  [SKIP] ${skill.slug} — sin traducción definida`);
      skipped++;
      continue;
    }

    // Validate lengths
    const nombre = tr.nombre.slice(0, 60);
    const descripcion = tr.descripcion.slice(0, 400);

    try {
      await patchSkill(skill.slug, author, nombre, descripcion);
      ok++;
      totalOK++;
    } catch (err) {
      const msg = `[FAIL] ${author}/${skill.slug}: ${err.message}`;
      console.error(`  ${msg}`);
      failLog.push(msg);
      fail++;
      totalFail++;
    }

    // Progress every 40
    if ((i + 1) % 40 === 0) {
      console.log(`  → Progreso: ${i + 1}/${skills.length} (ok=${ok}, fail=${fail}, skip=${skipped})`);
    }
  }

  stats[author] = { total: skills.length, ok, fail, skipped };
  console.log(`  ✓ ${author} — OK: ${ok} | FAIL: ${fail} | SKIP: ${skipped}`);
}

const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);

console.log('\n========================================');
console.log('RESUMEN FINAL');
console.log('========================================');
for (const [author, s] of Object.entries(stats)) {
  console.log(`  ${author}: ${s.ok} OK / ${s.fail} FAIL / ${s.skipped} SKIP (de ${s.total} total)`);
}
console.log(`  Tiempo total: ${elapsed}s`);
if (failLog.length > 0) {
  console.log('\nFALLOS:');
  failLog.forEach(l => console.log('  ' + l));
}
console.log('========================================');
