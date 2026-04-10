#!/usr/bin/env node
/**
 * translate-batch2-microsoft.mjs — Traduce nombre+descripcion de 186 skills al español neutro.
 * Autor: microsoft
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
// TRADUCCIONES — español neutro
// Formato: { slug: { nombre, descripcion } }
// ---------------------------------------------------------------------------
const TRANSLATIONS = {

  // ============================================================
  // Azure SDKs — Java
  // ============================================================
  'azure-eventhub-java': {
    nombre: 'Azure Event Hubs SDK para Java',
    descripcion: 'Para implementar streaming de eventos en tiempo real, ingesta de datos de alto volumen o arquitecturas event-driven con Azure Event Hubs SDK para Java.'
  },
  'azure-identity-java': {
    nombre: 'Azure Identity SDK para Java',
    descripcion: 'Para autenticar aplicaciones Java con servicios Azure usando DefaultAzureCredential, managed identity, service principal u otros patrones de autenticación.'
  },
  'azure-monitor-query-java': {
    nombre: 'Azure Monitor Query SDK para Java (obsoleto)',
    descripcion: 'OBSOLETO — migrar a azure-monitor-query-logs y azure-monitor-query-metrics. Para ejecutar consultas Kusto contra Log Analytics workspaces y métricas de Azure Monitor desde Java.'
  },
  'azure-messaging-webpubsub-java': {
    nombre: 'Azure Web PubSub SDK para Java',
    descripcion: 'Para construir aplicaciones web en tiempo real con Azure Web PubSub SDK para Java: mensajería WebSocket, actualizaciones en vivo, chat o notificaciones push servidor-cliente.'
  },
  'azure-monitor-ingestion-java': {
    nombre: 'Azure Monitor Ingestion SDK para Java',
    descripcion: 'Para enviar logs personalizados a Azure Monitor mediante Data Collection Rules (DCR) y Data Collection Endpoints (DCE) desde Java usando LogsIngestionClient.'
  },
  'azure-security-keyvault-secrets-java': {
    nombre: 'Azure Key Vault Secrets SDK para Java',
    descripcion: 'Para almacenar, recuperar y gestionar contraseñas, API keys, cadenas de conexión y otros datos sensibles con Azure Key Vault Secrets SDK para Java.'
  },
  'azure-monitor-opentelemetry-exporter-java': {
    nombre: 'Azure Monitor OpenTelemetry Exporter para Java (obsoleto)',
    descripcion: 'OBSOLETO — migrar a azure-monitor-opentelemetry-autoconfigure. Para exportar trazas, métricas y logs OpenTelemetry a Azure Monitor/Application Insights desde Java.'
  },
  'azure-storage-blob-java': {
    nombre: 'Azure Blob Storage SDK para Java',
    descripcion: 'Para subir, descargar y gestionar archivos en Azure Blob Storage desde Java: contenedores, blobs, operaciones de streaming y datos en reposo.'
  },
  'azure-security-keyvault-keys-java': {
    nombre: 'Azure Key Vault Keys SDK para Java',
    descripcion: 'Para crear y gestionar claves criptográficas RSA/EC en Azure Key Vault desde Java: cifrar, descifrar, firmar, verificar y usar claves respaldadas por HSM.'
  },

  // ============================================================
  // Azure SDKs — Python
  // ============================================================
  'azure-ai-contentunderstanding-py': {
    nombre: 'Azure AI Content Understanding SDK para Python',
    descripcion: 'Para extracción multimodal de contenido (documentos, imágenes, audio, vídeo) con Azure AI Content Understanding SDK para Python: ContentUnderstandingClient.'
  },
  'agent-framework-azure-ai-py': {
    nombre: 'Azure AI Agent Framework SDK para Python',
    descripcion: 'Para construir agentes persistentes en Azure AI Foundry con AzureAIAgentsProvider, herramientas hospedadas (intérprete de código, búsqueda, web), servidores MCP, threads de conversación y respuestas en streaming.'
  },
  'azure-ai-language-conversations-py': {
    nombre: 'Azure AI Language Conversations SDK para Python',
    descripcion: 'Para implementar comprensión de lenguaje conversacional (CLU) con ConversationAnalysisClient: análisis de intención y entidades, NLP e integración de comprensión del lenguaje en aplicaciones Python.'
  },
  'agents-v2-py': {
    nombre: 'Azure AI Foundry Agents con contenedores (Python)',
    descripcion: 'Para crear agentes hospedados en Azure AI Foundry que ejecutan código personalizado en contenedores propios usando ImageBasedHostedAgentDefinition y AgentProtocol.RESPONSES.'
  },
  'azure-ai-contentsafety-py': {
    nombre: 'Azure AI Content Safety SDK para Python',
    descripcion: 'Para detectar contenido dañino en texto e imágenes con clasificación por severidad usando ContentSafetyClient de Azure AI Content Safety SDK para Python.'
  },
  'azure-ai-ml-py': {
    nombre: 'Azure Machine Learning SDK v2 para Python',
    descripcion: 'Para gestionar workspaces de ML, jobs, modelos, datasets, cómputo y pipelines con azure-ai-ml (MLClient) en Python.'
  },
  'azure-ai-projects-py': {
    nombre: 'Azure AI Projects SDK para Python',
    descripcion: 'Para construir aplicaciones AI en Azure AI Foundry: clientes de proyecto, agentes con PromptAgentDefinition, evaluaciones, conexiones, despliegues, datasets e índices. Para operaciones de bajo nivel, usar azure-ai-agents-python.'
  },
  'azure-ai-translation-text-py': {
    nombre: 'Azure AI Text Translation SDK para Python',
    descripcion: 'Para traducción de texto en tiempo real, transliteración, detección de idioma y búsqueda en diccionario con TextTranslationClient de Azure AI Translation SDK para Python.'
  },
  'azure-ai-textanalytics-py': {
    nombre: 'Azure AI Text Analytics SDK para Python',
    descripcion: 'Para análisis de texto en Python: análisis de sentimiento, reconocimiento de entidades, frases clave, detección de idioma, PII y NLP de salud con TextAnalyticsClient.'
  },
  'azure-ai-vision-imageanalysis-py': {
    nombre: 'Azure AI Vision Image Analysis SDK para Python',
    descripcion: 'Para visión computacional en Python: subtítulos, etiquetas, objetos, OCR, detección de personas y recorte inteligente con ImageAnalysisClient de Azure AI Vision SDK.'
  },
  'azure-ai-transcription-py': {
    nombre: 'Azure AI Transcription SDK para Python',
    descripcion: 'Para transcripción de voz a texto en tiempo real y por lotes con marcas de tiempo y diarización usando TranscriptionClient de Azure AI Transcription SDK para Python.'
  },
  'azure-ai-translation-document-py': {
    nombre: 'Azure AI Document Translation SDK para Python',
    descripcion: 'Para traducción por lotes de documentos (Word, PDF, Excel, PowerPoint) preservando el formato con DocumentTranslationClient de Azure AI Translation SDK para Python.'
  },
  'azure-appconfiguration-py': {
    nombre: 'Azure App Configuration SDK para Python',
    descripcion: 'Para gestión centralizada de configuración, feature flags y ajustes dinámicos con AzureAppConfigurationClient de azure-appconfiguration en Python.'
  },
  'azure-ai-voicelive-py': {
    nombre: 'Azure AI Voice Live SDK para Python',
    descripcion: 'Para aplicaciones de voz AI en tiempo real con comunicación de audio bidireccional vía WebSocket: asistentes de voz, chatbots por voz, traducción de habla en tiempo real y avatares con voz en Python.'
  },
  'azure-containerregistry-py': {
    nombre: 'Azure Container Registry SDK para Python',
    descripcion: 'Para gestionar imágenes de contenedor, artefactos y repositorios en Azure Container Registry (ACR) con ContainerRegistryClient en Python.'
  },
  'azure-eventgrid-py': {
    nombre: 'Azure Event Grid SDK para Python',
    descripcion: 'Para publicar eventos, manejar CloudEvents y construir arquitecturas event-driven con EventGridPublisherClient de azure-eventgrid en Python.'
  },
  'azure-cosmos-db-py': {
    nombre: 'Azure Cosmos DB con FastAPI (Python)',
    descripcion: 'Para construir servicios NoSQL con Azure Cosmos DB y FastAPI en Python: autenticación dual (DefaultAzureCredential + emulador), capas de servicio CRUD, estrategias de partition key, consultas parametrizadas y patrones TDD.'
  },
  'azure-eventhub-py': {
    nombre: 'Azure Event Hubs SDK para Python',
    descripcion: 'Para streaming de alto volumen en Python: productores, consumidores, checkpointing y particiones con EventHubProducerClient y EventHubConsumerClient de azure-eventhub.'
  },
  'azure-mgmt-apicenter-py': {
    nombre: 'Azure API Center Management SDK para Python',
    descripcion: 'Para gestionar inventario de APIs, metadatos y gobernanza organizacional con ApiCenterMgmtClient de azure-mgmt-apicenter en Python.'
  },
  'azure-cosmos-py': {
    nombre: 'Azure Cosmos DB SDK para Python (API NoSQL)',
    descripcion: 'Para operaciones CRUD de documentos, consultas, contenedores y datos distribuidos globalmente con CosmosClient de azure-cosmos (API NoSQL) en Python.'
  },
  'azure-identity-py': {
    nombre: 'Azure Identity SDK para Python',
    descripcion: 'Para autenticar aplicaciones Python con Microsoft Entra ID: DefaultAzureCredential, managed identity, service principals y caché de tokens con azure-identity.'
  },
  'azure-mgmt-apimanagement-py': {
    nombre: 'Azure API Management SDK para Python',
    descripcion: 'Para gestionar servicios APIM, APIs, productos, suscripciones y políticas con ApiManagementClient de azure-mgmt-apimanagement en Python.'
  },
  'azure-monitor-opentelemetry-exporter-py': {
    nombre: 'Azure Monitor OpenTelemetry Exporter para Python',
    descripcion: 'Para exportar trazas, métricas y logs OpenTelemetry a Application Insights a bajo nivel con AzureMonitorTraceExporter, AzureMonitorMetricExporter y AzureMonitorLogExporter en Python.'
  },
  'azure-servicebus-py': {
    nombre: 'Azure Service Bus SDK para Python',
    descripcion: 'Para mensajería empresarial en Python: colas, topics, suscripciones y patrones de mensajería con ServiceBusClient de azure-servicebus.'
  },
  'azure-storage-file-share-py': {
    nombre: 'Azure Storage File Share SDK para Python',
    descripcion: 'Para comparticiones de archivos SMB en la nube, directorios y operaciones de archivos con ShareServiceClient y ShareClient de azure-storage-file-share en Python.'
  },
  'azure-data-tables-py': {
    nombre: 'Azure Data Tables SDK para Python',
    descripcion: 'Para almacenamiento NoSQL clave-valor, CRUD de entidades y operaciones por lotes en Azure Table Storage o Cosmos DB con TableServiceClient y TableClient en Python.'
  },
  'azure-keyvault-py': {
    nombre: 'Azure Key Vault SDK para Python',
    descripcion: 'Para gestión de secretos, claves y certificados con almacenamiento seguro: SecretClient, KeyClient y CertificateClient de azure-keyvault en Python.'
  },
  'azure-messaging-webpubsubservice-py': {
    nombre: 'Azure Web PubSub Service SDK para Python',
    descripcion: 'Para mensajería en tiempo real, conexiones WebSocket y patrones pub/sub con WebPubSubServiceClient de azure-messaging-webpubsubservice en Python.'
  },
  'azure-mgmt-fabric-py': {
    nombre: 'Azure Fabric Management SDK para Python',
    descripcion: 'Para gestionar capacidades y recursos de Microsoft Fabric con FabricMgmtClient de azure-mgmt-fabric en Python.'
  },
  'azure-monitor-query-py': {
    nombre: 'Azure Monitor Query SDK para Python',
    descripcion: 'Para consultar Log Analytics workspaces y métricas de Azure Monitor con LogsQueryClient y MetricsQueryClient de azure-monitor-query en Python: Kusto queries y métricas Azure.'
  },
  'azure-storage-blob-py': {
    nombre: 'Azure Blob Storage SDK para Python',
    descripcion: 'Para subir, descargar, listar blobs y gestionar contenedores con BlobServiceClient, ContainerClient y BlobClient de azure-storage-blob en Python.'
  },
  'azure-mgmt-botservice-py': {
    nombre: 'Azure Bot Service Management SDK para Python',
    descripcion: 'Para crear, gestionar y configurar recursos de Azure Bot Service con AzureBotService de azure-mgmt-botservice en Python: bots conversacionales y canales.'
  },
  'azure-monitor-ingestion-py': {
    nombre: 'Azure Monitor Ingestion SDK para Python',
    descripcion: 'Para enviar logs personalizados a Log Analytics workspace vía Logs Ingestion API con LogsIngestionClient de azure-monitor-ingestion en Python: DCR y reglas de recolección de datos.'
  },
  'azure-monitor-opentelemetry-py': {
    nombre: 'Azure Monitor OpenTelemetry Distro para Python',
    descripcion: 'Para instrumentación automática de aplicaciones Python con Application Insights en una sola línea usando configure_azure_monitor de azure-monitor-opentelemetry.'
  },
  'azure-search-documents-py': {
    nombre: 'Azure AI Search SDK para Python',
    descripcion: 'Para búsqueda vectorial, híbrida y semántica, indexación y skillsets con SearchClient y SearchIndexClient de azure-search-documents en Python.'
  },
  'azure-storage-file-datalake-py': {
    nombre: 'Azure Data Lake Storage Gen2 SDK para Python',
    descripcion: 'Para sistemas de archivos jerárquicos, analítica de big data y operaciones de archivos/directorios con DataLakeServiceClient de azure-storage-file-datalake (ADLS Gen2) en Python.'
  },
  'azure-speech-to-text-rest-py': {
    nombre: 'Azure Speech to Text REST API (Python)',
    descripcion: 'Para reconocimiento de voz simple de audios de hasta 60 segundos sin el Speech SDK, usando la REST API de Azure Speech to Text en Python. No usar para audio largo, streaming o transcripción por lotes.'
  },
  'azure-storage-queue-py': {
    nombre: 'Azure Queue Storage SDK para Python',
    descripcion: 'Para colas de mensajes confiables, distribución de tareas y procesamiento asíncrono con QueueServiceClient y QueueClient de azure-storage-queue en Python.'
  },
  'azure-cosmos-rust': {
    nombre: 'Azure Cosmos DB SDK para Rust (API NoSQL)',
    descripcion: 'Para operaciones CRUD de documentos, consultas, contenedores y datos distribuidos globalmente con CosmosClient de azure-cosmos en Rust (API NoSQL).'
  },
  'azure-keyvault-keys-rust': {
    nombre: 'Azure Key Vault Keys SDK para Rust',
    descripcion: 'Para crear, gestionar y usar claves criptográficas en Azure Key Vault desde Rust: crear claves, cifrar, descifrar y firmar con KeyClient.'
  },
  'azure-eventhub-rust': {
    nombre: 'Azure Event Hubs SDK para Rust',
    descripcion: 'Para enviar y recibir eventos, ingesta de datos en streaming con ProducerClient y ConsumerClient de azure-eventhub en Rust.'
  },
  'azure-keyvault-secrets-rust': {
    nombre: 'Azure Key Vault Secrets SDK para Rust',
    descripcion: 'Para almacenar y recuperar secretos, contraseñas y API keys con SecretClient de azure-keyvault-secrets en Rust.'
  },
  'azure-identity-rust': {
    nombre: 'Azure Identity SDK para Rust',
    descripcion: 'Para autenticación con servicios Azure en Rust: DeveloperToolsCredential, ManagedIdentityCredential, ClientSecretCredential y autenticación basada en tokens.'
  },
  'azure-storage-blob-rust': {
    nombre: 'Azure Blob Storage SDK para Rust',
    descripcion: 'Para subir, descargar y gestionar blobs y contenedores en Azure Blob Storage con BlobClient de azure-storage-blob en Rust.'
  },
  'azure-keyvault-certificates-rust': {
    nombre: 'Azure Key Vault Certificates SDK para Rust',
    descripcion: 'Para crear, importar y gestionar certificados en Azure Key Vault con CertificateClient de azure-keyvault-certificates en Rust.'
  },

  // ============================================================
  // Azure SDKs — TypeScript / JavaScript
  // ============================================================
  'azure-ai-document-intelligence-ts': {
    nombre: 'Azure AI Document Intelligence SDK para TypeScript',
    descripcion: 'Para extraer texto, tablas y datos estructurados de documentos (facturas, recibos, IDs, formularios) o construir modelos de documentos personalizados con @azure-rest/ai-document-intelligence.'
  },
  'azure-appconfiguration-ts': {
    nombre: 'Azure App Configuration SDK para TypeScript',
    descripcion: 'Para gestionar ajustes de configuración, feature flags, referencias a Key Vault y actualización dinámica con @azure/app-configuration en JavaScript/TypeScript.'
  },
  'azure-keyvault-keys-ts': {
    nombre: 'Azure Key Vault Keys SDK para TypeScript',
    descripcion: 'Para crear, cifrar/descifrar, firmar y rotar claves criptográficas con @azure/keyvault-keys en JavaScript/TypeScript.'
  },
  'azure-ai-projects-ts': {
    nombre: 'Azure AI Projects SDK para TypeScript',
    descripcion: 'Para construir aplicaciones AI con Azure AI Foundry en JavaScript/TypeScript: clientes de proyecto, agentes, conexiones, despliegues, datasets, índices, evaluaciones y clientes OpenAI compatibles con @azure/ai-projects.'
  },
  'azure-ai-translation-ts': {
    nombre: 'Azure AI Translation SDK para TypeScript',
    descripcion: 'Para traducción de texto, transliteración, detección de idioma y traducción de documentos por lotes con @azure-rest/ai-translation-text y @azure-rest/ai-translation-document en JavaScript/TypeScript.'
  },
  'azure-ai-contentsafety-ts': {
    nombre: 'Azure AI Content Safety SDK para TypeScript',
    descripcion: 'Para moderar contenido generado por usuarios, detectar discurso de odio, violencia, contenido sexual o daño autoinfligido, y gestionar listas de bloqueo personalizadas con @azure-rest/ai-content-safety.'
  },
  'azure-ai-voicelive-ts': {
    nombre: 'Azure AI Voice Live SDK para TypeScript',
    descripcion: 'Para aplicaciones de voz AI en tiempo real con comunicación WebSocket bidireccional en Node.js o navegador: asistentes de voz, IA conversacional, habla a habla en tiempo real con VoiceLiveClient y VoiceLiveSession.'
  },
  'azure-identity-ts': {
    nombre: 'Azure Identity SDK para TypeScript',
    descripcion: 'Para autenticar aplicaciones JavaScript/TypeScript con servicios Azure usando DefaultAzureCredential, managed identity, service principals o login interactivo con @azure/identity.'
  },
  'azure-cosmos-ts': {
    nombre: 'Azure Cosmos DB SDK para TypeScript',
    descripcion: 'Para operaciones CRUD, consultas, bulk operations y gestión de contenedores en Azure Cosmos DB con CosmosClient de @azure/cosmos en JavaScript/TypeScript.'
  },
  'azure-keyvault-secrets-ts': {
    nombre: 'Azure Key Vault Secrets SDK para TypeScript',
    descripcion: 'Para almacenar y recuperar secretos de aplicación y valores de configuración con @azure/keyvault-secrets en JavaScript/TypeScript.'
  },
  'azure-search-documents-ts': {
    nombre: 'Azure AI Search SDK para TypeScript',
    descripcion: 'Para crear índices, implementar búsqueda vectorial/híbrida, ranking semántico y recuperación agentic con conocimiento usando @azure/search-documents en JavaScript/TypeScript.'
  },
  'azure-eventhub-ts': {
    nombre: 'Azure Event Hubs SDK para TypeScript',
    descripcion: 'Para ingesta de eventos de alto volumen, analítica en tiempo real, telemetría IoT y arquitecturas event-driven con consumidores particionados usando @azure/event-hubs en JavaScript/TypeScript.'
  },
  'azure-microsoft-playwright-testing-ts': {
    nombre: 'Azure Playwright Testing a escala',
    descripcion: 'Para ejecutar tests de Playwright a escala en navegadores hospedados en la nube, integrar con pipelines CI/CD y publicar resultados en el portal Azure con Azure Playwright Workspaces.'
  },
  'azure-servicebus-ts': {
    nombre: 'Azure Service Bus SDK para TypeScript',
    descripcion: 'Para mensajería empresarial en JavaScript/TypeScript: colas, topics/suscripciones, sesiones, dead-letter y patrones de mensajería con @azure/service-bus.'
  },
  'azure-web-pubsub-ts': {
    nombre: 'Azure Web PubSub SDK para TypeScript',
    descripcion: 'Para mensajería en tiempo real con WebSocket, pub/sub, chat grupal y notificaciones en vivo con @azure/web-pubsub y @azure/web-pubsub-client en JavaScript/TypeScript.'
  },
  'azure-monitor-opentelemetry-ts': {
    nombre: 'Azure Monitor OpenTelemetry para TypeScript',
    descripcion: 'Para instrumentar aplicaciones Node.js con trazas distribuidas, métricas y logs para Application Insights con @azure/monitor-opentelemetry.'
  },
  'azure-storage-blob-ts': {
    nombre: 'Azure Blob Storage SDK para TypeScript',
    descripcion: 'Para subir, descargar, listar y gestionar blobs y contenedores con BlobServiceClient y ContainerClient de @azure/storage-blob en JavaScript/TypeScript: block blobs, SAS tokens y streaming.'
  },
  'azure-postgres-ts': {
    nombre: 'Azure PostgreSQL Flexible Server con Node.js/TypeScript',
    descripcion: 'Para conectar a Azure Database for PostgreSQL Flexible Server desde Node.js/TypeScript con pg (node-postgres): consultas, pooling de conexiones, transacciones y autenticación sin contraseña con Microsoft Entra ID.'
  },
  'azure-storage-file-share-ts': {
    nombre: 'Azure File Share SDK para TypeScript',
    descripcion: 'Para crear comparticiones SMB, gestionar directorios, subir/descargar archivos y manejar metadatos con @azure/storage-file-share en JavaScript/TypeScript.'
  },
  'azure-storage-queue-ts': {
    nombre: 'Azure Queue Storage SDK para TypeScript',
    descripcion: 'Para enviar, recibir, inspeccionar y eliminar mensajes en colas con QueueServiceClient y QueueClient de @azure/storage-queue en JavaScript/TypeScript: timeout de visibilidad y operaciones por lotes.'
  },
  'azure-cosmos-rust': {
    nombre: 'Azure Cosmos DB SDK para Rust',
    descripcion: 'Para operaciones CRUD de documentos, consultas, contenedores y datos distribuidos globalmente con la API NoSQL de Cosmos DB en Rust.'
  },

  // ============================================================
  // Microsoft Docs y plataformas
  // ============================================================
  'microsoft-docs': {
    nombre: 'Microsoft Docs',
    descripcion: 'Para consultar la documentación oficial de Microsoft sobre cualquier tecnología: Azure, .NET, M365, Windows, Power Platform. Útil para entender conceptos, tutoriales, opciones de configuración, límites y mejores prácticas.'
  },
  'microsoft-foundry': {
    nombre: 'Microsoft Foundry — agentes end-to-end',
    descripcion: 'Para desplegar, evaluar y gestionar agentes en Foundry: build Docker, push ACR, crear agentes hospedados/prompt, iniciar contenedores, evaluación por lotes, optimización de prompts, agent.yaml y curación de datasets desde trazas.'
  },

  // ============================================================
  // Azure — plataforma y operaciones
  // ============================================================
  'azure-ai': {
    nombre: 'Azure AI — búsqueda, voz y visión',
    descripcion: 'Para Azure AI: Search, Speech, OpenAI, Document Intelligence. Cubre búsqueda vectorial/híbrida/semántica, voz a texto, texto a voz, transcripción y OCR.'
  },
  'azure-compute': {
    nombre: 'Azure Compute — VMs y VMSS',
    descripcion: 'Para recomendaciones de VMs y VMSS en Azure: precios, autoescalado, orquestación, familias de VMs, cargas de trabajo (GPU, dev/test, backend) y solución de problemas de conectividad.'
  },
  'azure-aigateway': {
    nombre: 'Azure API Management como AI Gateway',
    descripcion: 'Para configurar Azure API Management como gateway de IA: caché semántico, límites de tokens, seguridad de contenido, balanceo de carga, gobernanza de modelos, rate limiting para MCP, detección de jailbreak y políticas LLM.'
  },
  'azure-cost': {
    nombre: 'Azure Cost — gestión de costos',
    descripcion: 'Para consultar costos históricos, proyectar gasto futuro y optimizar recursos en Azure: desglose por servicio/recurso, tendencias de costos, resumen mensual y principales generadores de gasto.'
  },
  'azure-cloud-migrate': {
    nombre: 'Azure Cloud Migrate — migración entre nubes',
    descripcion: 'Para evaluar y migrar cargas de trabajo cross-cloud a Azure con informes de migración y conversión de código: AWS Lambda → Azure Functions, GCP Cloud Run → Container Apps.'
  },
  'azure-deploy': {
    nombre: 'Azure Deploy — ejecutar despliegues preparados',
    descripcion: 'Para ejecutar despliegues en Azure de aplicaciones ya preparadas con .azure/deployment-plan.md: azd up, azd deploy, terraform apply y comandos az deployment con recuperación de errores. No usar para crear nuevas aplicaciones.'
  },
  'azure-kubernetes': {
    nombre: 'Azure Kubernetes Service (AKS)',
    descripcion: 'Para planificar, crear y configurar clústeres AKS listos para producción: selección de SKU, redes, seguridad, autoescalado, estrategia de actualización y análisis de costos.'
  },
  'azure-compliance': {
    nombre: 'Azure Compliance — auditorías de seguridad',
    descripcion: 'Para ejecutar auditorías de seguridad y cumplimiento en Azure con azqr: evaluación de mejores prácticas, revisión de recursos, políticas, postura de seguridad y expiración de certificados en Key Vault.'
  },
  'azure-diagnostics': {
    nombre: 'Azure Diagnostics — depuración en producción',
    descripcion: 'Para depurar problemas en producción en Azure usando AppLens, Azure Monitor y resource health: Container Apps, Functions, AKS, kubectl, pods en CrashLoop, errores de imagen, cold starts y sondas de salud.'
  },
  'azure-kusto': {
    nombre: 'Azure Data Explorer — consultas KQL',
    descripcion: 'Para consultar y analizar datos en Azure Data Explorer (Kusto/ADX) con KQL: analítica de logs, telemetría, series temporales y detección de anomalías.'
  },
  'azure-rbac': {
    nombre: 'Azure RBAC — roles con mínimo privilegio',
    descripcion: 'Para encontrar el rol RBAC adecuado con mínimo privilegio en Azure y generar comandos CLI y código Bicep para asignarlo: roles para managed identity, blobs, recursos y definiciones de roles personalizados.'
  },
  'azure-enterprise-infra-planner': {
    nombre: 'Azure Enterprise Infrastructure Planner',
    descripcion: 'Para diseñar y aprovisionar infraestructura Azure empresarial: networking, identidad, seguridad, cumplimiento y topologías multi-recurso con alineación WAF. Genera Bicep o Terraform directamente (sin azd).'
  },
  'azure-hosted-copilot-sdk': {
    nombre: 'Azure con GitHub Copilot SDK',
    descripcion: 'Para construir, desplegar y modificar aplicaciones con @github/copilot-sdk en Azure. Usar OBLIGATORIAMENTE cuando el código contiene @github/copilot-sdk o CopilotClient, en lugar de azure-prepare.'
  },
  'azure-prepare': {
    nombre: 'Azure Prepare — preparar apps para despliegue',
    descripcion: 'Para preparar aplicaciones Azure para despliegue: infraestructura Bicep/Terraform, azure.yaml, Dockerfiles. Para crear/modernizar apps. No usar para migración cross-cloud (usar azure-cloud-migrate).'
  },
  'azure-resource-visualizer': {
    nombre: 'Azure Resource Visualizer',
    descripcion: 'Para analizar grupos de recursos Azure y generar diagramas de arquitectura Mermaid detallados con las relaciones entre recursos individuales.'
  },
  'azure-messaging': {
    nombre: 'Azure Messaging — solución de problemas',
    descripcion: 'Para solucionar problemas con los SDKs de Azure Messaging para Event Hubs y Service Bus: fallos de conexión, errores de autenticación, problemas de procesamiento de mensajes, errores AMQP y vencimiento de bloqueos.'
  },
  'azure-resource-lookup': {
    nombre: 'Azure Resource Lookup — inventario de recursos',
    descripcion: 'Para listar, encontrar y mostrar recursos Azure en suscripciones o grupos de recursos: inventario, búsqueda por etiqueta, análisis de etiquetas, discos sin adjuntar y recursos huérfanos.'
  },
  'azure-validate': {
    nombre: 'Azure Validate — validación pre-despliegue',
    descripcion: 'Para validar la preparación de apps Azure antes del despliegue: configuración, infraestructura Bicep/Terraform, asignaciones RBAC, permisos de managed identity y requisitos previos.'
  },
  'azure-quotas': {
    nombre: 'Azure Quotas — cuotas y límites de servicio',
    descripcion: 'Para verificar y gestionar cuotas de Azure entre proveedores: uso actual, solicitar aumento de cuota, capacidad regional, límites de vCPUs y validación de capacidad antes del despliegue.'
  },
  'azure-storage': {
    nombre: 'Azure Storage — todos los servicios',
    descripcion: 'Para Azure Storage: Blob, File Shares, Queue Storage, Table Storage y Data Lake. Cubre almacenamiento de objetos, comparticiones SMB, mensajería asíncrona, clave-valor NoSQL y analítica de big data con niveles de acceso y gestión del ciclo de vida.'
  },
  'azure-upgrade': {
    nombre: 'Azure Upgrade — actualizar planes y SKUs',
    descripcion: 'Para evaluar y actualizar cargas de trabajo Azure entre planes, niveles o SKUs: Consumption → Flex Consumption, planes de Functions, migración App Service → Container Apps y cambios de hosting.'
  },
  'deploy-model': {
    nombre: 'Desplegar modelos Azure OpenAI',
    descripcion: 'Para desplegar modelos Azure OpenAI con enrutamiento inteligente por intención: despliegues rápidos con presets, personalizados (versión/SKU/capacidad/política RAI) y descubrimiento de capacidad por región y proyecto.'
  },
  'capacity': {
    nombre: 'Capacidad Azure OpenAI — descubrimiento de cuotas',
    descripcion: 'Para descubrir capacidad disponible de modelos Azure OpenAI entre regiones y proyectos: análisis de cuotas, comparación de disponibilidad y recomendación de ubicaciones óptimas de despliegue.'
  },
  'customize': {
    nombre: 'Despliegue personalizado de modelos Azure OpenAI',
    descripcion: 'Para despliegue interactivo paso a paso de modelos Azure OpenAI con control total: selección de versión, SKU (GlobalStandard/Standard/ProvisionedManaged), capacidad, política RAI y opciones avanzadas.'
  },
  'entra-app-registration': {
    nombre: 'Microsoft Entra — registro de aplicaciones',
    descripcion: 'Para registro de apps en Microsoft Entra ID, autenticación OAuth 2.0 e integración MSAL: crear registro de app, configurar OAuth, permisos de API, generar service principal. No usar para RBAC ni Key Vault.'
  },
  'entra-agent-id': {
    nombre: 'Microsoft Entra Agent ID (preview)',
    descripcion: 'Para crear identidades OAuth2 de agentes AI via Microsoft Graph beta API: Agent Identity Blueprints, BlueprintPrincipals, permisos, Workload Identity Federation y autenticación políglota para contenedores (Docker/Kubernetes).'
  },

  // ============================================================
  // M365 / Teams
  // ============================================================
  'm365-agents-py': {
    nombre: 'Microsoft 365 Agents SDK para Python',
    descripcion: 'Para construir agentes multicanal para Teams/M365/Copilot Studio con aiohttp, enrutamiento con AgentApplication, respuestas en streaming y autenticación MSAL en Python.'
  },
  'm365-agents-ts': {
    nombre: 'Microsoft 365 Agents SDK para TypeScript',
    descripcion: 'Para construir agentes multicanal para Teams/M365/Copilot Studio con @microsoft/agents-hosting, enrutamiento AgentApplication, Express hosting y respuestas en streaming en Node.js/TypeScript.'
  },

  // ============================================================
  // Herramientas de análisis / operaciones internas
  // ============================================================
  'analyze-skill-issues': {
    nombre: 'Analizar fallos en tests de skills',
    descripcion: 'Para consultar la cuenta de almacenamiento de tests de integración y encontrar por qué están fallando los tests de un skill específico: leer archivos de resultados almacenados y mostrar detalles del error.'
  },
  'analyze-test-run': {
    nombre: 'Analizar ejecución de tests de integración',
    descripcion: 'Para analizar una ejecución de tests de integración en GitHub Actions y generar un informe de invocación de skills con causa raíz de los fallos: tasa de invocación, resumen y análisis de resultados.'
  },

  // ============================================================
  // Frameworks y utilidades de desarrollo
  // ============================================================
  'fastapi-router-py': {
    nombre: 'FastAPI Router con CRUD y autenticación',
    descripcion: 'Para crear routers FastAPI con operaciones CRUD, dependencias de autenticación y modelos de respuesta correctos en aplicaciones Python.'
  },
  'pydantic-models-py': {
    nombre: 'Modelos Pydantic v2 con patrón multi-modelo',
    descripcion: 'Para definir modelos Pydantic v2 con el patrón Base/Create/Update/Response/InDB: esquemas de API, modelos de base de datos y validación de datos en Python.'
  },
  'frontend-ui-dark-ts': {
    nombre: 'UI React con tema oscuro y Framer Motion',
    descripcion: 'Para construir aplicaciones React con tema oscuro usando Tailwind CSS, efectos glassmorphism y animaciones con Framer Motion: dashboards, paneles de admin e interfaces con estética oscura refinada.'
  },
  'react-flow-node-ts': {
    nombre: 'Nodos React Flow con TypeScript y Zustand',
    descripcion: 'Para crear componentes de nodo para React Flow en TypeScript con tipos, handles e integración con Zustand: editores de flujo visual e interfaces de UI basadas en nodos.'
  },
  'zustand-store-ts': {
    nombre: 'Zustand Store con TypeScript',
    descripcion: 'Para crear stores Zustand con TypeScript, middleware subscribeWithSelector y separación correcta de estado/acciones: gestión de estado global en React con patrones reactivos.'
  },
  'hosted-agents-v2-py': {
    nombre: 'Agentes hospedados Azure AI Foundry v2 (Python)',
    descripcion: 'Para construir agentes hospedados en Azure AI Foundry con ImageBasedHostedAgentDefinition que ejecutan código personalizado en contenedores propios en Python.'
  },

  // ============================================================
  // Instrumentación y observabilidad
  // ============================================================
  'appinsights-instrumentation': {
    nombre: 'Instrumentación con Application Insights',
    descripcion: 'Para instrumentar aplicaciones web con Azure Application Insights: configuración del SDK, patrones de telemetría, ejemplos de instrumentación y mejores prácticas de APM.'
  },

  // ============================================================
  // Azure SDKs — .NET (dotnet)
  // ============================================================
  'azure-ai-projects-dotnet': {
    nombre: 'Azure AI Projects SDK para .NET',
    descripcion: 'Para gestión de proyectos Azure AI Foundry desde .NET: agentes versionados, conexiones, datasets, despliegues, evaluaciones e índices con AIProjectClient.'
  },
  'azure-identity-dotnet': {
    nombre: 'Azure Identity SDK para .NET',
    descripcion: 'Para autenticar aplicaciones .NET con Microsoft Entra ID: DefaultAzureCredential, managed identity, service principals y credenciales de desarrollador con Azure.Identity.'
  },
  'azure-ai-agents-persistent-dotnet': {
    nombre: 'Azure AI Agents Persistent SDK para .NET',
    descripcion: 'Para crear y gestionar agentes AI persistentes en .NET: threads, mensajes, runs, function calling, búsqueda en archivos e intérprete de código con PersistentAgentsClient.'
  },
  'azure-ai-voicelive-dotnet': {
    nombre: 'Azure AI Voice Live SDK para .NET',
    descripcion: 'Para aplicaciones de voz AI en tiempo real en .NET con comunicación WebSocket bidireccional: asistentes de voz, IA conversacional, habla a habla y chatbots por voz con VoiceLiveClient.'
  },
  'azure-maps-search-dotnet': {
    nombre: 'Azure Maps SDK para .NET',
    descripcion: 'Para servicios basados en ubicación en .NET: geocodificación, rutas, renderizado de mapas, geolocalización IP y datos meteorológicos con MapsSearchClient y MapsRoutingClient.'
  },
  'azure-mgmt-arizeaiobservabilityeval-dotnet': {
    nombre: 'Azure SDK Arize AI Observability para .NET',
    descripcion: 'Para gestionar organizaciones Arize AI en Azure vía Azure Marketplace desde .NET: crear, actualizar y eliminar recursos de observabilidad ML con ArizeAIObservabilityEval.'
  },
  'azure-mgmt-weightsandbiases-dotnet': {
    nombre: 'Azure Weights & Biases SDK para .NET',
    descripcion: 'Para tracking de experimentos ML y gestión de modelos vía Azure Marketplace con W&B: crear instancias, gestionar SSO e integración marketplace con WeightsAndBiases SDK para .NET.'
  },
  'azure-ai-openai-dotnet': {
    nombre: 'Azure OpenAI SDK para .NET',
    descripcion: 'Para chat completions, embeddings, generación de imágenes, transcripción de audio y asistentes con AzureOpenAIClient y ChatClient de Azure OpenAI SDK para .NET: GPT-4, DALL-E, Whisper.'
  },
  'azure-eventhub-dotnet': {
    nombre: 'Azure Event Hubs SDK para .NET',
    descripcion: 'Para streaming de eventos de alto volumen en .NET: enviar eventos (EventHubProducerClient), recibir con checkpointing (EventProcessorClient), gestión de particiones e ingesta en tiempo real.'
  },
  'azure-mgmt-apimanagement-dotnet': {
    nombre: 'Azure API Management SDK para .NET (ARM)',
    descripcion: 'Para operaciones del plano de gestión de APIM en .NET: crear servicios, APIs, productos, suscripciones, políticas, usuarios, gateways y backends vía Azure Resource Manager.'
  },
  'azure-mgmt-fabric-dotnet': {
    nombre: 'Azure Fabric Management SDK para .NET (ARM)',
    descripcion: 'Para operaciones ARM de Microsoft Fabric en .NET: provisionar, escalar, suspender/reanudar capacidades Fabric y listar SKUs con FabricCapacityResource.'
  },
  'azure-ai-document-intelligence-dotnet': {
    nombre: 'Azure AI Document Intelligence SDK para .NET',
    descripcion: 'Para extraer texto, tablas y datos estructurados de documentos en .NET con modelos precompilados y personalizados: facturas, recibos, IDs y formularios con DocumentIntelligenceClient.'
  },
  'azure-eventgrid-dotnet': {
    nombre: 'Azure Event Grid SDK para .NET',
    descripcion: 'Para publicar y consumir eventos en arquitecturas event-driven con EventGridPublisherClient de .NET: CloudEvents, EventGridEvents y patrones pub/sub.'
  },
  'azure-mgmt-apicenter-dotnet': {
    nombre: 'Azure API Center SDK para .NET',
    descripcion: 'Para gestión centralizada de inventario de APIs con gobernanza, versionado y descubrimiento: servicios, workspaces, APIs, versiones, entornos y despliegues con ApiCenterService en .NET.'
  },
  'azure-mgmt-botservice-dotnet': {
    nombre: 'Azure Bot Service Management SDK para .NET',
    descripcion: 'Para operaciones ARM de Azure Bot Service en .NET: crear y gestionar bots, canales (Teams, DirectLine, Slack) y ajustes de conexión con BotResource.'
  },
  'azure-resource-manager-cosmosdb-dotnet': {
    nombre: 'Azure Resource Manager Cosmos DB SDK para .NET',
    descripcion: 'Para operaciones ARM de Cosmos DB en .NET: crear cuentas, bases de datos, contenedores y configurar throughput vía Resource Manager. No usar para operaciones de datos (CRUD de documentos).'
  },
  'azure-resource-manager-postgresql-dotnet': {
    nombre: 'Azure Resource Manager PostgreSQL SDK para .NET',
    descripcion: 'Para gestión de PostgreSQL Flexible Server en .NET: crear servidores, bases de datos, reglas de firewall, configuraciones, backups y alta disponibilidad con PostgreSqlFlexibleServer.'
  },
  'azure-mgmt-applicationinsights-dotnet': {
    nombre: 'Azure Application Insights SDK para .NET',
    descripcion: 'Para gestión de recursos Application Insights en .NET: crear componentes APM, web tests, workbooks, elementos de analítica y API keys para monitoreo de rendimiento de aplicaciones.'
  },
  'azure-mgmt-mongodbatlas-dotnet': {
    nombre: 'Azure SDK MongoDB Atlas para .NET',
    descripcion: 'Para gestionar organizaciones MongoDB Atlas como recursos ARM en Azure vía Azure Marketplace usando Azure.ResourceManager.MongoDBAtlas: crear, actualizar, listar y eliminar organizaciones.'
  },
  'azure-resource-manager-mysql-dotnet': {
    nombre: 'Azure Resource Manager MySQL SDK para .NET',
    descripcion: 'Para gestión de MySQL Flexible Server en .NET: crear servidores, bases de datos, reglas de firewall, configuraciones, backups y alta disponibilidad con MySqlFlexibleServer.'
  },
  'azure-resource-manager-sql-dotnet': {
    nombre: 'Azure Resource Manager SQL SDK para .NET',
    descripcion: 'Para operaciones ARM de Azure SQL en .NET: crear servidores SQL, bases de datos, elastic pools, reglas de firewall y grupos de failover. No usar para ejecutar consultas (usar SqlClient).'
  },
  'm365-agents-dotnet': {
    nombre: 'Microsoft 365 Agents SDK para .NET',
    descripcion: 'Para construir agentes multicanal para Teams/M365/Copilot Studio en .NET con ASP.NET Core, enrutamiento AgentApplication y autenticación MSAL con Microsoft.Agents.'
  },
  'azure-ai-contentsafety-java': {
    nombre: 'Azure AI Content Safety SDK para Java',
    descripcion: 'Para moderación de contenido con Azure AI Content Safety SDK para Java: análisis de texto/imágenes, gestión de listas de bloqueo y detección de contenido dañino (odio, violencia, sexual, autolesión).'
  },
  'azure-ai-voicelive-java': {
    nombre: 'Azure AI Voice Live SDK para Java',
    descripcion: 'Para conversaciones de voz bidireccionales en tiempo real con asistentes AI vía WebSocket en Java: streaming de audio, detección de actividad de voz y asistentes de voz con VoiceLiveClient.'
  },
  'azure-communication-chat-java': {
    nombre: 'Azure Communication Services Chat SDK para Java',
    descripcion: 'Para construir aplicaciones de chat en tiempo real con Azure Communication Services en Java: threads, mensajes, participantes, confirmaciones de lectura y notificaciones de escritura.'
  },
  'azure-resource-manager-durabletask-dotnet': {
    nombre: 'Azure Resource Manager Durable Task SDK para .NET',
    descripcion: 'Para operaciones ARM de Durable Task Scheduler en .NET: crear y gestionar schedulers, task hubs y políticas de retención con DurableTaskSchedulerResource.'
  },
  'azure-resource-manager-redis-dotnet': {
    nombre: 'Azure Resource Manager Redis SDK para .NET',
    descripcion: 'Para operaciones ARM de Azure Cache for Redis en .NET: instancias, reglas de firewall, claves de acceso, programas de parches y geo-replicación. No usar para operaciones de datos (usar StackExchange.Redis).'
  },
  'azure-servicebus-dotnet': {
    nombre: 'Azure Service Bus SDK para .NET',
    descripcion: 'Para mensajería empresarial en .NET: colas, topics, suscripciones, sesiones, dead-letter y procesamiento en background con ServiceBusClient, ServiceBusSender y ServiceBusProcessor.'
  },
  'azure-ai-anomalydetector-java': {
    nombre: 'Azure AI Anomaly Detector SDK para Java',
    descripcion: 'Para construir aplicaciones de detección de anomalías en Java: detección univariante/multivariante, análisis de series temporales y monitorización con Azure AI Anomaly Detector SDK.'
  },
  'azure-ai-vision-imageanalysis-java': {
    nombre: 'Azure AI Vision Image Analysis SDK para Java',
    descripcion: 'Para análisis de imágenes en Java: subtítulos, OCR, detección de objetos, etiquetado y recorte inteligente con Azure AI Vision SDK para Java.'
  },
  'azure-communication-callingserver-java': {
    nombre: 'Azure Communication CallingServer SDK para Java (obsoleto)',
    descripcion: 'OBSOLETO — usar azure-communication-callautomation para proyectos nuevos. Solo usar para mantener código legacy de Azure Communication Services CallingServer en Java.'
  },
  'azure-compute-batch-java': {
    nombre: 'Azure Batch SDK para Java',
    descripcion: 'Para ejecutar jobs en paralelo y HPC a gran escala en Java con Azure Batch: pools, jobs, tareas y nodos de cómputo con BatchClient.'
  },
  'azure-resource-manager-playwright-dotnet': {
    nombre: 'Azure Resource Manager Playwright Testing SDK para .NET',
    descripcion: 'Para operaciones ARM de Microsoft Playwright Testing en .NET: crear workspaces, verificar disponibilidad de nombres y gestionar cuotas. No usar para ejecutar tests (usar Azure.Developer.MicrosoftPlaywrightTesting.NUnit).'
  },
  'azure-search-documents-dotnet': {
    nombre: 'Azure AI Search SDK para .NET',
    descripcion: 'Para búsqueda full-text, vectorial, semántica e híbrida en .NET con Azure.Search.Documents: SearchClient (consultas, CRUD), SearchIndexClient (índices) y SearchIndexerClient (indexadores, skillsets).'
  },
  'microsoft-azure-webjobs-extensions-authentication-events-dotnet': {
    nombre: 'Microsoft Entra Authentication Events SDK para .NET',
    descripcion: 'Para extensiones de autenticación personalizadas en Azure Functions con Microsoft Entra ID en .NET: enriquecimiento de tokens, claims personalizados, recopilación de atributos y personalización OTP.'
  },
  'azure-ai-formrecognizer-java': {
    nombre: 'Azure Document Intelligence (Form Recognizer) SDK para Java',
    descripcion: 'Para análisis de documentos en Java con Azure Document Intelligence: extraer texto, tablas, pares clave-valor de documentos, recibos, facturas y construir modelos personalizados.'
  },
  'azure-appconfiguration-java': {
    nombre: 'Azure App Configuration SDK para Java',
    descripcion: 'Para gestión centralizada de configuración en Java: ajustes clave-valor, feature flags y snapshots con ConfigurationClient de azure-appconfiguration.'
  },
  'azure-communication-common-java': {
    nombre: 'Azure Communication Services Common SDK para Java',
    descripcion: 'Para utilidades comunes de Azure Communication Services en Java: CommunicationTokenCredential, identificadores de usuarios, refresco de tokens y autenticación compartida entre servicios ACS.'
  },
  'azure-data-tables-java': {
    nombre: 'Azure Data Tables SDK para Java',
    descripcion: 'Para Azure Table Storage o Cosmos DB Table API en Java: almacenamiento NoSQL clave-valor, esquemas flexibles y datos estructurados a escala.'
  },
  'azure-security-keyvault-keys-dotnet': {
    nombre: 'Azure Key Vault Keys SDK para .NET',
    descripcion: 'Para gestión de claves criptográficas en Azure Key Vault y Managed HSM en .NET: crear, rotar, cifrar, descifrar, firmar y verificar con KeyClient y CryptographyClient.'
  },
  'azure-ai-agents-persistent-java': {
    nombre: 'Azure AI Agents Persistent SDK para Java',
    descripcion: 'Para crear y gestionar agentes AI persistentes en Java: threads, mensajes, runs y herramientas con PersistentAgentsClient de Azure AI Agents SDK para Java.'
  },
  'azure-ai-projects-java': {
    nombre: 'Azure AI Projects SDK para Java',
    descripcion: 'Para gestión de proyectos Azure AI Foundry en Java: conexiones, datasets, índices y evaluaciones con AIProjectClient de Azure AI Projects SDK.'
  },
  'azure-communication-callautomation-java': {
    nombre: 'Azure Communication Call Automation SDK para Java',
    descripcion: 'Para flujos de automatización de llamadas en Java: IVR, enrutamiento, grabación, reconocimiento DTMF, texto a voz y flujos de llamada con IA usando Azure Communication Services.'
  },
  'azure-communication-sms-java': {
    nombre: 'Azure Communication Services SMS SDK para Java',
    descripcion: 'Para enviar SMS con Azure Communication Services en Java: notificaciones, alertas, OTP, mensajería masiva e informes de entrega.'
  },
  'azure-eventgrid-java': {
    nombre: 'Azure Event Grid SDK para Java',
    descripcion: 'Para construir aplicaciones event-driven en Java con Azure Event Grid: publicar eventos, implementar patrones pub/sub e integrar con servicios Azure vía eventos.'
  },
  'azure-cosmos-java': {
    nombre: 'Azure Cosmos DB SDK para Java',
    descripcion: 'Para operaciones NoSQL con Cosmos DB en Java: distribución global, multi-modelo y patrones reactivos con CosmosClient y CosmosAsyncClient.'
  },

  // ============================================================
  // Herramientas de desarrollo / skills meta
  // ============================================================
  'skill-reviewer': {
    nombre: 'Revisor de skills con feedback estructurado',
    descripcion: 'Para revisar PRs de skills con feedback por severidad: presupuesto de tokens, conflictos de enrutamiento, secciones requeridas y convenciones del repositorio.'
  },
  'sensei': {
    nombre: 'Sensei — mejora iterativa de skills',
    descripcion: 'Para mejorar iterativamente el cumplimiento del frontmatter de skills usando el patrón de bucle Ralph: auditoría de tokens, ejecución de tests, corrección de frontmatter y puntuación de conformidad.'
  },
  'skill-authoring': {
    nombre: 'Guía de autoría de Agent Skills',
    descripcion: 'Para escribir Agent Skills que cumplen la especificación agentskills.io: estructura, plantilla, revisión y requisitos de sección para skills nuevos o existentes.'
  },
  'skill-with-hooks': {
    nombre: 'Skill de ejemplo con hooks integrados',
    descripcion: 'Skill de ejemplo que demuestra cómo integrar hooks para validación y logging dentro de una definición de skill.'
  },
  'github-issue-creator': {
    nombre: 'Crear issues de GitHub desde notas o errores',
    descripcion: 'Para convertir notas informales, logs de error, dictado por voz o capturas de pantalla en issues estructurados de GitHub con formato Markdown. Admite imágenes/GIFs como evidencia visual.'
  },
  'podcast-generation': {
    nombre: 'Generar podcast con Azure OpenAI Realtime',
    descripcion: 'Para generar narrativas de audio estilo podcast con Azure OpenAI GPT Realtime Mini vía WebSocket: texto a voz, generación de narrativas y streaming de audio con backend FastAPI y frontend React.'
  },
  'file-test-bug': {
    nombre: 'Crear issue de bug para fallos en tests',
    descripcion: 'Para abrir un issue de GitHub cuando fallan tests de integración locales: reportar el fallo, describir el test y crear el bug de forma estructurada a partir de resultados JUnit.'
  },
  'continual-learning': {
    nombre: 'Aprendizaje continuo para agentes de código',
    descripcion: 'Para implementar infraestructura de aprendizaje continuo en agentes AI de código: hooks, scope de memoria y patrones de reflexión para aprendizaje automático del agente.'
  },
  'copilot-sdk': {
    nombre: 'GitHub Copilot SDK — integraciones programáticas',
    descripcion: 'Para construir aplicaciones con GitHub Copilot SDK en Node.js/TypeScript, Python, Go o .NET: sesiones, herramientas personalizadas, streaming, hooks, servidores MCP, proveedores BYOK y patrones de despliegue.'
  },
  'kql': {
    nombre: 'KQL — Kusto Query Language',
    descripcion: 'Para escribir, depurar y revisar consultas KQL correctas y eficientes: sintaxis, patrones de join, tipos dinámicos, pitfalls de datetime, regex, serialización, gestión de memoria y funciones avanzadas (geo, vectores, grafos).'
  },
  'markdown-token-optimizer': {
    nombre: 'Optimizador de tokens en Markdown',
    descripcion: 'Para analizar archivos Markdown y reducir tokens sin perder información: detectar verbosidad, contar tokens, reducir tamaño de archivo y optimizar para consumo por modelos de lenguaje.'
  },
  'module-development': {
    nombre: 'Desarrollo de módulos Amplifier',
    descripcion: 'Para crear nuevos módulos Amplifier: implementación de protocolo, puntos de entrada, funciones mount y patrones de tests. Usar cuando se crea un nuevo módulo o se quiere entender la arquitectura.'
  },
  'amplifier-philosophy': {
    nombre: 'Filosofía de diseño Amplifier',
    descripcion: 'Para entender la filosofía de diseño de Amplifier usando la metáfora del kernel Linux: mecanismo vs política, arquitectura de módulos, diseño event-driven y principios del kernel. Usar al diseñar nuevos módulos o tomar decisiones arquitectónicas.'
  },
  'python-standards': {
    nombre: 'Estándares Python para Amplifier',
    descripcion: 'Para escribir código Python en módulos Amplifier: type hints, patrones async, manejo de errores y formateo según los estándares del proyecto.'
  },

  // ============================================================
  // Diseño y arquitectura
  // ============================================================
  'cloud-solution-architect': {
    nombre: 'Arquitecto de Soluciones Cloud (Azure)',
    descripcion: 'Para actuar como Arquitecto de Soluciones Cloud siguiendo las mejores prácticas de Azure Architecture Center: diseñar arquitecturas, revisar sistemas, seleccionar estilos arquitectónicos, aplicar patrones cloud y realizar revisiones Well-Architected Framework.'
  },
  'frontend-design-review': {
    nombre: 'Revisión de diseño frontend',
    descripcion: 'Para revisar y crear interfaces frontend de producción con alta calidad de diseño: revisiones de PR, accesibilidad, cumplimiento del sistema de diseño, código de UI, revisiones de componentes y diseño responsivo.'
  },

  // ============================================================
  // Wiki y documentación (continuación)
  // ============================================================
  'wiki-ado-convert': {
    nombre: 'Convertir wiki a Azure DevOps Wiki',
    descripcion: 'Para convertir wikis VitePress/GFM al formato compatible con Azure DevOps Wiki: transforma sintaxis Mermaid, elimina front matter, corrige enlaces y genera copias en dist/ado-wiki/.'
  },
  'wiki-llms-txt': {
    nombre: 'Generar llms.txt para documentación de proyectos',
    descripcion: 'Para generar archivos llms.txt y llms-full.txt siguiendo la especificación llms.txt: resúmenes de proyectos legibles por modelos de lenguaje.'
  },
  'wiki-researcher': {
    nombre: 'Investigación profunda en código fuente',
    descripcion: 'Para realizar investigación iterativa y profunda sobre temas específicos en un codebase: cero tolerancia al análisis superficial, análisis multi-archivo y comprensión exhaustiva de sistemas o patrones.'
  },
  'wiki-agents-md': {
    nombre: 'Generar archivos AGENTS.md',
    descripcion: 'Para generar archivos AGENTS.md en carpetas de repositorio sin este archivo: contexto para agentes de código con comandos de build, instrucciones de tests, estilo de código y límites del proyecto.'
  },
  'wiki-onboarding': {
    nombre: 'Generar guías de onboarding por audiencia',
    descripcion: 'Para generar cuatro guías de onboarding adaptadas por audiencia en una carpeta onboarding/: Colaborador, Staff Engineer, Ejecutivo y Product Manager.'
  },
  'wiki-vitepress': {
    nombre: 'Empaquetar wiki con VitePress',
    descripcion: 'Para empaquetar páginas Markdown de wiki generadas en un sitio estático VitePress con tema oscuro, diagramas Mermaid con zoom y build de producción.'
  },
  'wiki-architect': {
    nombre: 'Analizar y documentar arquitectura de repositorio',
    descripcion: 'Para analizar repositorios de código y generar estructuras de documentación jerárquica con guías de onboarding: crear wikis, mapear la estructura del codebase y entender la arquitectura a alto nivel.'
  },
  'wiki-page-writer': {
    nombre: 'Generar páginas de documentación técnica',
    descripcion: 'Para generar páginas de documentación técnica enriquecidas con diagramas Mermaid en modo oscuro, citas de código fuente y análisis de primeros principios: wikis, documentación de sistemas y componentes.'
  },
  'wiki-changelog': {
    nombre: 'Generar changelog desde historial git',
    descripcion: 'Para analizar el historial de commits git y generar changelogs estructurados por tipo de cambio: ver cambios recientes, crear changelog o entender qué ha cambiado en el repositorio.'
  },
  'wiki-qa': {
    nombre: 'Responder preguntas sobre un repositorio',
    descripcion: 'Para responder preguntas sobre cómo funciona un repositorio con análisis de archivos fuente: entender componentes, navegar el codebase o investigar cómo está implementado algo específico.'
  },
  'preset': {
    nombre: 'Despliegue Azure OpenAI a región óptima',
    descripcion: 'Para desplegar modelos Azure OpenAI a la región óptima de forma automática: analiza capacidad en todas las regiones disponibles, comprueba la región actual primero y muestra alternativas si es necesario.'
  },
};

// ---------------------------------------------------------------------------
// EJECUCIÓN
// ---------------------------------------------------------------------------
const AUTHOR = 'microsoft';

async function fetchSkills() {
  const url = `${BASE}/rest/v1/skills_catalog?author=eq.${AUTHOR}&select=slug,nombre,descripcion&limit=500`;
  const res = await fetch(url, {
    headers: { apikey: KEY, authorization: `Bearer ${KEY}` }
  });
  if (!res.ok) throw new Error(`GET failed: ${res.status} ${await res.text()}`);
  return res.json();
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
  console.log(`[translate-batch2-microsoft] Cargando skills de autor: ${AUTHOR}...`);

  const skills = await fetchSkills();
  console.log(`Total skills en BD: ${skills.length}`);
  console.log(`Traducciones preparadas: ${Object.keys(TRANSLATIONS).length}`);

  let ok = 0;
  let fail = 0;
  let skipped = 0;
  const failures = [];
  const notInTranslations = [];

  for (let i = 0; i < skills.length; i++) {
    const { slug, nombre: nombreOrig, descripcion: descOrig } = skills[i];
    const t = TRANSLATIONS[slug];

    if (!t) {
      notInTranslations.push(slug);
      skipped++;
      continue;
    }

    // Si nombre o descripcion original están vacíos, respetar eso
    const nombre = (nombreOrig === null || nombreOrig === '') ? nombreOrig : t.nombre;
    const descripcion = (descOrig === null || descOrig === '') ? descOrig : t.descripcion;

    try {
      await patchSkill(slug, nombre, descripcion);
      ok++;
    } catch (err) {
      fail++;
      failures.push({ slug, error: err.message });
      console.error(`  FAIL: ${slug} — ${err.message}`);
    }

    if ((ok + fail) % 30 === 0) {
      console.log(`  Progreso: ${ok + fail}/${skills.length - skipped} procesados (OK=${ok}, FAIL=${fail})`);
    }
  }

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);

  console.log('\n========== RESUMEN FINAL ==========');
  console.log(`Total skills en BD: ${skills.length}`);
  console.log(`Con traducción preparada: ${Object.keys(TRANSLATIONS).length}`);
  console.log(`OK: ${ok}`);
  console.log(`FAIL: ${fail}`);
  console.log(`Sin traducción (skipped): ${skipped}`);
  console.log(`Tiempo total: ${elapsed}s`);

  if (failures.length > 0) {
    console.log('\nFallos:');
    for (const f of failures) console.log(`  - ${f.slug}: ${f.error}`);
  }

  if (notInTranslations.length > 0) {
    console.log(`\nSlugs sin traducción preparada (${notInTranslations.length}):`);
    for (const s of notInTranslations) console.log(`  - ${s}`);
  }
}

main().catch(err => {
  console.error('Error fatal:', err);
  process.exit(1);
});
