const HEADER = (path: string) =>
  `> ## Índice de Documentación\n> Accede al índice completo en: https://mcp.lat/llms.txt\n> Usa este archivo para descubrir todas las páginas disponibles antes de explorar más.\n\n`

const FOOTER = `\n\nDocumentación de [SpainMCP](https://mcp.lat).`

export const DOCS: Record<string, string> = {
  'tools/boe': HEADER('tools/boe') + `# Herramientas BOE

> Las herramientas BOE dan acceso al Boletín Oficial del Estado — legislación, normativas y resoluciones oficiales de España.

# Herramientas BOE

Las herramientas BOE son parte del servidor MCP de SpainMCP. Permiten a cualquier agente IA consultar la legislación española directamente desde el BOE, sin autenticación.

Las herramientas se exponen bajo el namespace \`spainmcp\`. Por ejemplo, la herramienta \`boe_del_dia\` del namespace \`spainmcp\` es accesible en \`mcp.lat/api/mcp\`.

## ¿Qué incluye?

| Herramienta | Descripción |
| ----------- | ----------- |
| **boe_del_dia** | Sumario completo del BOE del día actual |
| **buscar_boe** | Búsqueda por texto libre en el archivo histórico del BOE |

## Llamar a las herramientas

Puedes llamar las herramientas via la [CLI de SpainMCP](/docs/use/connect.md):

<Tabs>
  <Tab title="CLI" icon="terminal">
    \`\`\`bash  theme={null}
    spainmcp tool call spainmcp boe_del_dia '{}'
    spainmcp tool call spainmcp buscar_boe '{"query": "convocatoria empleo"}'
    \`\`\`
  </Tab>

  <Tab title="TypeScript" icon="braces">
    \`\`\`typescript  theme={null}
    import { Client } from '@modelcontextprotocol/sdk/client/index.js'

    const result = await client.callTool({
      name: 'boe_del_dia',
      arguments: {}
    })
    \`\`\`
  </Tab>

  <Tab title="cURL" icon="globe">
    \`\`\`bash  theme={null}
    curl -X POST https://mcp.lat/api/mcp \\
      -H "Authorization: Bearer YOUR_API_KEY" \\
      -H "Content-Type: application/json" \\
      -d '{"method":"tools/call","params":{"name":"boe_del_dia","arguments":{}}}'
    \`\`\`
  </Tab>
</Tabs>

Los nombres de herramientas son en minúsculas con guión bajo, únicos dentro del namespace \`spainmcp\`.

## Límites

| Plan | Llamadas/día |
| ---- | ------------ |
| Free | Sin límite (API pública del BOE) |
| Pro  | Sin límite |

Ver la [página de precios](https://mcp.lat/pricing) para detalles completos.

## Datos y fuentes

Los datos provienen directamente de la API oficial del BOE en \`www.boe.es\`. SpainMCP actúa como proxy MCP — no almacena ni modifica los datos del BOE.` + FOOTER,

  'tools/borme': HEADER('tools/borme') + `# Herramientas BORME

> Las herramientas BORME dan acceso al Boletín Oficial del Registro Mercantil — actos mercantiles y datos de empresas españolas.

# Herramientas BORME

Las herramientas BORME son parte del servidor MCP de SpainMCP. Permiten consultar constituciones de empresas, nombramientos, disoluciones y otros actos mercantiles oficiales.

Las herramientas se exponen bajo el namespace \`spainmcp\`. La herramienta \`borme_del_dia\` del namespace \`spainmcp\` es accesible en \`mcp.lat/api/mcp\`.

## ¿Qué incluye?

| Herramienta | Descripción |
| ----------- | ----------- |
| **borme_del_dia** | Sumario de actos mercantiles del BORME del día actual |

## Llamar a las herramientas

<Tabs>
  <Tab title="CLI" icon="terminal">
    \`\`\`bash  theme={null}
    spainmcp tool call spainmcp borme_del_dia '{}'
    \`\`\`
  </Tab>

  <Tab title="TypeScript" icon="braces">
    \`\`\`typescript  theme={null}
    const result = await client.callTool({
      name: 'borme_del_dia',
      arguments: {}
    })
    \`\`\`
  </Tab>

  <Tab title="cURL" icon="globe">
    \`\`\`bash  theme={null}
    curl -X POST https://mcp.lat/api/mcp \\
      -H "Authorization: Bearer YOUR_API_KEY" \\
      -H "Content-Type: application/json" \\
      -d '{"method":"tools/call","params":{"name":"borme_del_dia","arguments":{}}}'
    \`\`\`
  </Tab>
</Tabs>

## Secciones del BORME

| Sección | Contenido |
| ------- | --------- |
| **A** | Nombramiento de cargos, poderes notariales |
| **B** | Actos inscritos: constituciones, ampliaciones, disoluciones |
| **C** | Otros actos mercantiles |

## Límites

| Plan | Llamadas/día |
| ---- | ------------ |
| Free | Sin límite (API pública del BORME) |
| Pro  | Sin límite |

## Datos y fuentes

Datos de \`www.boe.es/diario_borme\`. SpainMCP actúa como proxy MCP — no almacena ni modifica los datos del BORME.` + FOOTER,

  'tools/ine': HEADER('tools/ine') + `# Herramientas INE

> Las herramientas INE dan acceso a estadísticas oficiales de España — población, economía, demografía y más.

# Herramientas INE

Las herramientas INE son parte del servidor MCP de SpainMCP. Permiten consultar cualquier serie estadística del Instituto Nacional de Estadística directamente desde un agente.

Las herramientas se exponen bajo el namespace \`spainmcp\`. La herramienta \`datos_ine\` es accesible en \`mcp.lat/api/mcp\`.

## ¿Qué incluye?

| Herramienta | Descripción |
| ----------- | ----------- |
| **datos_ine** | Consulta series estadísticas por código de operación INE |

## Llamar a las herramientas

<Tabs>
  <Tab title="CLI" icon="terminal">
    \`\`\`bash  theme={null}
    spainmcp tool call spainmcp datos_ine '{"operacion": "IPC"}'
    spainmcp tool call spainmcp datos_ine '{"operacion": "EPA"}'
    \`\`\`
  </Tab>

  <Tab title="TypeScript" icon="braces">
    \`\`\`typescript  theme={null}
    const result = await client.callTool({
      name: 'datos_ine',
      arguments: { operacion: 'IPC' }
    })
    \`\`\`
  </Tab>

  <Tab title="cURL" icon="globe">
    \`\`\`bash  theme={null}
    curl -X POST https://mcp.lat/api/mcp \\
      -H "Authorization: Bearer YOUR_API_KEY" \\
      -H "Content-Type: application/json" \\
      -d '{"method":"tools/call","params":{"name":"datos_ine","arguments":{"operacion":"IPC"}}}'
    \`\`\`
  </Tab>
</Tabs>

## Operaciones más usadas

| Código | Descripción |
| ------ | ----------- |
| **IPC** | Índice de Precios al Consumo |
| **EPA** | Encuesta de Población Activa |
| **CNE** | Contabilidad Nacional de España |
| **Padrón** | Estadística del Padrón Municipal |
| **EPDS** | Encuesta de Presupuestos de los Hogares |

## Límites

| Plan | Llamadas/día |
| ---- | ------------ |
| Free | Sin límite (API pública del INE) |
| Pro  | Sin límite |

## Datos y fuentes

Datos de \`servicios.ine.es/wstempus/js\`. SpainMCP actúa como proxy MCP — no almacena ni modifica los datos del INE.` + FOOTER,

  'tools/aemet': HEADER('tools/aemet') + `# Herramientas AEMET

> Las herramientas AEMET dan acceso a previsiones meteorológicas y datos climáticos oficiales de España.

# Herramientas AEMET

Las herramientas AEMET son parte del servidor MCP de SpainMCP. Permiten consultar la previsión del tiempo para cualquier municipio español directamente desde un agente.

Las herramientas se exponen bajo el namespace \`spainmcp\`. La herramienta \`tiempo_aemet\` es accesible en \`mcp.lat/api/mcp\`.

## ¿Qué incluye?

| Herramienta | Descripción |
| ----------- | ----------- |
| **tiempo_aemet** | Previsión meteorológica por código de municipio INE |

## Llamar a las herramientas

<Tabs>
  <Tab title="CLI" icon="terminal">
    \`\`\`bash  theme={null}
    spainmcp tool call spainmcp tiempo_aemet '{"municipio": "28079"}'
    spainmcp tool call spainmcp tiempo_aemet '{"municipio": "08019"}'
    \`\`\`
  </Tab>

  <Tab title="TypeScript" icon="braces">
    \`\`\`typescript  theme={null}
    const result = await client.callTool({
      name: 'tiempo_aemet',
      arguments: { municipio: '28079' }
    })
    \`\`\`
  </Tab>

  <Tab title="cURL" icon="globe">
    \`\`\`bash  theme={null}
    curl -X POST https://mcp.lat/api/mcp \\
      -H "Authorization: Bearer YOUR_API_KEY" \\
      -H "Content-Type: application/json" \\
      -d '{"method":"tools/call","params":{"name":"tiempo_aemet","arguments":{"municipio":"28079"}}}'
    \`\`\`
  </Tab>
</Tabs>

## Municipios frecuentes

| Municipio | Código |
| --------- | ------ |
| Madrid | **28079** |
| Barcelona | **08019** |
| Valencia | **46250** |
| Sevilla | **41091** |
| Bilbao | **48020** |
| Zaragoza | **50297** |

## Límites

| Plan | Llamadas/día |
| ---- | ------------ |
| Free | 50 (límite API AEMET gratuita) |
| Pro  | Sin límite (cache 15 min) |

Ver la [página de precios](https://mcp.lat/pricing) para detalles completos.

## Datos y fuentes

Datos de la API Abierta de AEMET en \`opendata.aemet.es\`. Requiere API key gratuita — configurada en la infraestructura de SpainMCP.` + FOOTER,

  'use/connect': HEADER('use/connect') + `# Conectar a MCPs

> Gestiona conexiones MCP con una API REST simple — OAuth, tokens y sesiones gestionados por SpainMCP.

# Conectar

**SpainMCP Connect** es el servicio gestionado de SpainMCP para conectar a servidores MCP. En lugar de implementar el protocolo MCP directamente, gestionar flujos OAuth y manejar credenciales tú mismo, SpainMCP Connect proporciona una interfaz REST simple que lo gestiona todo.

## ¿Por qué SpainMCP Connect?

SpainMCP Connect te permite añadir integraciones de servidores MCP a tu app sin gestionar la complejidad tú mismo:

* **Sin configuración OAuth** — No hay URIs de redirección, client IDs ni secrets que configurar. SpainMCP mantiene las apps OAuth para las integraciones más populares.
* **Renovación automática de tokens** — Los tokens se renuevan automáticamente antes de expirar. Si falla la renovación, el estado de la conexión cambia a \`auth_requerida\`.
* **Almacenamiento seguro de credenciales** — Las credenciales se cifran y son de solo escritura. Se pueden usar para hacer peticiones pero nunca leer de vuelta.
* **Sin estado para ti** — SpainMCP Connect gestiona el ciclo de vida de la conexión. Haz peticiones sin preocuparte por reconexiones, keepalives ni estado de sesión.
* **Tokens de servicio con scope** — Genera tokens de corta duración para clientes de navegador o móvil para llamar herramientas directamente, con scope a usuarios y namespaces específicos.

## Quick Start

<Tabs>
  <Tab title="CLI" icon="terminal">
    \`\`\`bash  theme={null}
    # 1. Autenticarse en SpainMCP
    spainmcp auth login

    # 2. Conectar al servidor SpainMCP
    spainmcp mcp add https://mcp.lat/api/mcp --id spainmcp

    # 3. Listar herramientas disponibles
    spainmcp tool list spainmcp

    # 4. Llamar a una herramienta
    spainmcp tool call spainmcp boe_del_dia '{}'
    \`\`\`
  </Tab>

  <Tab title="AI SDK" icon="sparkles">
    \`\`\`bash  theme={null}
    npm install @spainmcp/api @ai-sdk/mcp ai @ai-sdk/anthropic
    \`\`\`

    \`\`\`typescript  theme={null}
    import { createMCPClient } from '@ai-sdk/mcp';
    import { generateText } from 'ai';
    import { anthropic } from '@ai-sdk/anthropic';
    import { createConnection } from '@spainmcp/api/mcp';

    const { transport } = await createConnection({
      mcpUrl: 'https://mcp.lat/api/mcp',
    });

    const mcpClient = await createMCPClient({ transport });
    const tools = await mcpClient.tools();

    const { text } = await generateText({
      model: anthropic('claude-sonnet-4-6'),
      tools,
      prompt: '¿Qué se publicó en el BOE hoy?',
    });

    await mcpClient.close();
    \`\`\`
  </Tab>

  <Tab title="MCP TypeScript SDK" icon="braces">
    \`\`\`bash  theme={null}
    npm install @spainmcp/api @modelcontextprotocol/sdk
    \`\`\`

    \`\`\`typescript  theme={null}
    import { Client } from '@modelcontextprotocol/sdk/client/index.js';
    import { createConnection } from '@spainmcp/api/mcp';

    const { transport } = await createConnection({
      mcpUrl: 'https://mcp.lat/api/mcp',
    });

    const mcpClient = new Client({ name: 'mi-app', version: '1.0.0' });
    await mcpClient.connect(transport);

    const { tools } = await mcpClient.listTools();
    const result = await mcpClient.callTool({
      name: 'boe_del_dia',
      arguments: {}
    });
    \`\`\`
  </Tab>
</Tabs>

## Servidores con Configuración

Algunos servidores MCP requieren configuración como API keys. Consulta la página del servidor en [mcp.lat](https://mcp.lat) para ver qué configuración requiere.

<Tabs>
  <Tab title="CLI" icon="terminal">
    \`\`\`bash  theme={null}
    spainmcp mcp add 'https://mcp.lat/api/mcp' \\
      --id mi-spainmcp \\
      --headers '{"Authorization": "Bearer sk-spainmcp-..."}'
    \`\`\`
  </Tab>

  <Tab title="TypeScript" icon="braces">
    \`\`\`typescript  theme={null}
    import SpainMCP from '@spainmcp/api';
    import { createConnection } from '@spainmcp/api/mcp';

    const spainmcp = new SpainMCP();

    const conn = await spainmcp.connections.set('mi-spainmcp', {
      namespace: 'mi-app',
      mcpUrl: 'https://mcp.lat/api/mcp',
      headers: { 'Authorization': 'Bearer sk-spainmcp-...' },
    });

    const { transport } = await createConnection({
      client: spainmcp,
      namespace: 'mi-app',
      connectionId: conn.connectionId,
    });
    \`\`\`
  </Tab>

  <Tab title="cURL" icon="globe">
    \`\`\`bash  theme={null}
    curl -X POST "https://api.mcp.lat/connect/mi-app" \\
      -H "Authorization: Bearer $SPAINMCP_API_KEY" \\
      -H "Content-Type: application/json" \\
      -d '{"mcpUrl": "https://mcp.lat/api/mcp", "headers": {"Authorization": "Bearer sk-spainmcp-..."}}'
    \`\`\`
  </Tab>
</Tabs>

## Setup Multi-Usuario

Cuando tu agente sirve a múltiples usuarios, usa el campo \`metadata\` para asociar conexiones con cada usuario.

### 1. Crear una conexión para un usuario

<Tabs>
  <Tab title="CLI" icon="terminal">
    \`\`\`bash  theme={null}
    spainmcp mcp add https://mcp.lat/api/mcp \\
      --id usuario-123-boe \\
      --name "BOE" \\
      --metadata '{"userId": "usuario-123"}'
    \`\`\`
  </Tab>

  <Tab title="TypeScript" icon="braces">
    \`\`\`typescript  theme={null}
    const conn = await spainmcp.connections.set('usuario-123-boe', {
      namespace: 'mi-app',
      mcpUrl: 'https://mcp.lat/api/mcp',
      name: 'BOE',
      metadata: { userId: 'usuario-123' }
    });

    if (conn.status === 'auth_required') {
      redirect(conn.authorizationUrl);
    }
    \`\`\`
  </Tab>
</Tabs>

### 2. Listar las conexiones de un usuario

<Tabs>
  <Tab title="CLI" icon="terminal">
    \`\`\`bash  theme={null}
    spainmcp mcp list --metadata '{"userId": "usuario-123"}'
    \`\`\`
  </Tab>

  <Tab title="TypeScript" icon="braces">
    \`\`\`typescript  theme={null}
    const connections = await spainmcp.connections.list('mi-app', {
      metadata: { userId: 'usuario-123' }
    });

    for (const conn of connections.data) {
      console.log(\`\${conn.name}: \${conn.status}\`);
    }
    \`\`\`
  </Tab>
</Tabs>

### 3. Usar herramientas de todas las conexiones

<Tabs>
  <Tab title="CLI" icon="terminal">
    \`\`\`bash  theme={null}
    spainmcp tool list usuario-123-boe
    spainmcp tool call usuario-123-boe boe_del_dia '{}'
    \`\`\`
  </Tab>

  <Tab title="TypeScript" icon="braces">
    \`\`\`typescript  theme={null}
    const allTools = [];

    for (const conn of connections.data) {
      if (conn.status === 'connected') {
        const { transport } = await createConnection({
          namespace: 'mi-app',
          connectionId: conn.connectionId,
        });
        const client = await createMCPClient({ transport });
        allTools.push(...await client.tools());
      }
    }

    const { text } = await generateText({
      model: anthropic('claude-sonnet-4-6'),
      tools: allTools,
      prompt: userMessage,
    });
    \`\`\`
  </Tab>
</Tabs>

## Conceptos Clave

### Namespaces

Un namespace es un identificador globalmente único que agrupa tus conexiones. Crea uno por aplicación o entorno (ej: \`mi-app\`, \`mi-app-staging\`).

### Conexiones

Una conexión es una sesión de larga duración a un servidor MCP. Cada conexión:

* Tiene un \`connectionId\` (definido por el desarrollador o auto-generado)
* Almacena credenciales de forma segura (solo escritura — nunca se pueden leer de vuelta)
* Puede incluir \`metadata\` personalizado para filtrado (ej: \`userId\`)
* Devuelve \`serverInfo\` con el nombre y versión del servidor MCP

### Estado de la Conexión

| Estado | Descripción |
| ------ | ----------- |
| **conectado** | La conexión está lista para usar |
| **auth_requerida** | Requiere autorización OAuth. Incluye \`authorizationUrl\` |
| **error** | La conexión falló. Incluye \`message\` de error |

### Autenticación

SpainMCP Connect usa dos métodos de autenticación:

| Token | Caso de uso | Acceso |
| ----- | ----------- | ------ |
| **API Key** | Solo backend | Acceso completo al namespace |
| **Service Token** | Navegador, móvil, agentes | Acceso con scope a conexiones específicas |

Obtén tu API key en [mcp.lat/account/api-keys](https://mcp.lat/account/api-keys).

## Tokens de Servicio

Los tokens de servicio permiten usar SpainMCP Connect desde navegadores, apps móviles y agentes sin exponer tu API key.

<Tabs>
  <Tab title="CLI" icon="terminal">
    \`\`\`bash  theme={null}
    spainmcp auth token --policy '[{
      "namespaces": "mi-app",
      "resources": "connections",
      "operations": ["read", "execute"],
      "metadata": { "userId": "usuario-123" },
      "ttl": "1h"
    }]'
    \`\`\`
  </Tab>

  <Tab title="TypeScript" icon="braces">
    \`\`\`typescript  theme={null}
    const { token } = await spainmcp.tokens.create({
      policy: [{
        namespaces: 'mi-app',
        resources: 'connections',
        operations: ['read', 'execute'],
        metadata: { userId: 'usuario-123' },
        ttl: '1h',
      }],
    })
    \`\`\`
  </Tab>

  <Tab title="cURL" icon="globe">
    \`\`\`bash  theme={null}
    curl -X POST https://api.mcp.lat/tokens \\
      -H "Authorization: Bearer $SPAINMCP_API_KEY" \\
      -H "Content-Type: application/json" \\
      -d '{"policy":[{"namespaces":"mi-app","resources":"connections","operations":["read","execute"],"metadata":{"userId":"usuario-123"},"ttl":"1h"}]}'
    \`\`\`
  </Tab>
</Tabs>

## Límites

| Plan | Conexiones simultáneas |
| ---- | ---------------------- |
| Hobby (free) | 3 |
| Pay as you Go | 100 |
| Custom | 100+ |

Ver la [página de precios](https://mcp.lat/pricing) para detalles completos.` + FOOTER,

  'use/token-scoping': HEADER('use/token-scoping') + `# Scoping de Tokens

> Controla a qué conexiones y operaciones puede acceder un token — por usuario, workspace, o cualquier dimensión personalizada.

<Warning>
  **Vista previa** — El Scoping de Tokens está en preview. La superficie de la API puede cambiar.
  [Únete a nuestro Discord](https://discord.gg/spainmcp) para soporte y feedback.
</Warning>

Los tokens de servicio te permiten exponer SpainMCP de forma segura a navegadores, apps móviles y agentes IA sin filtrar tu API key. Cada token lleva **restricciones** que limitan a qué namespaces, recursos, operaciones y metadata puede acceder.

Para la configuración general de SpainMCP Connect, consulta [SpainMCP Connect](/use/connect).

## Limitar un Token a un Usuario

Cuando tu app sirve a múltiples usuarios, querrás que el token de cada usuario solo acceda a sus propias conexiones. Para ello, etiqueta las conexiones con \`metadata\` (p.ej., \`{ userId: "usuario-123" }\`) al crearlas, y luego crea un token con la misma restricción de metadata. El token solo podrá ver las conexiones cuya metadata coincida.

<Tabs>
  <Tab title="CLI" icon="terminal">
    \`\`\`bash  theme={null}
    spainmcp auth token --policy '[{
      "namespaces": "mi-app",
      "resources": "connections",
      "operations": ["read", "execute"],
      "metadata": { "userId": "usuario-123" },
      "ttl": "1h"
    }]'
    \`\`\`
  </Tab>

  <Tab title="TypeScript" icon="braces">
    \`\`\`typescript  theme={null}
    const { token, expiresAt } = await spainmcp.tokens.create({
      policy: [
        {
          namespaces: 'mi-app',
          resources: 'connections',
          operations: ['read', 'execute'],
          metadata: { userId: 'usuario-123' },
          ttl: '1h',
        },
      ],
    })

    // Envía \`token\` al cliente — seguro para uso en navegador
    \`\`\`
  </Tab>

  <Tab title="cURL" icon="globe">
    \`\`\`bash  theme={null}
    curl -X POST https://mcp.lat/api/tokens \\
      -H "Authorization: Bearer $SPAINMCP_API_KEY" \\
      -H "Content-Type: application/json" \\
      -d '{
        "policy": [
          {
            "namespaces": "mi-app",
            "resources": "connections",
            "operations": ["read", "execute"],
            "metadata": { "userId": "usuario-123" },
            "ttl": "1h"
          }
        ]
      }'
    \`\`\`
  </Tab>
</Tabs>

Este token puede listar y llamar herramientas en conexiones de \`mi-app\` donde \`metadata.userId\` sea \`usuario-123\` — nada más. Aunque el cliente intente acceder a la conexión de otro usuario, la petición se denegará.

También puedes filtrar por múltiples campos de metadata a la vez. Los campos dentro de un único objeto de metadata se combinan con AND, por lo que el token de abajo solo coincide con conexiones donde tanto \`userId\` como \`tier\` coincidan:

<Tabs>
  <Tab title="CLI" icon="terminal">
    \`\`\`bash  theme={null}
    spainmcp auth token --policy '[{
      "namespaces": "mi-app",
      "resources": "connections",
      "operations": ["read", "execute"],
      "metadata": { "userId": "usuario-123", "tier": "pro" },
      "ttl": "1h"
    }]'
    \`\`\`
  </Tab>

  <Tab title="TypeScript" icon="braces">
    \`\`\`typescript  theme={null}
    const { token } = await spainmcp.tokens.create({
      policy: [
        {
          namespaces: 'mi-app',
          resources: 'connections',
          operations: ['read', 'execute'],
          metadata: { userId: 'usuario-123', tier: 'pro' },
          ttl: '1h',
        },
      ],
    })
    \`\`\`
  </Tab>

  <Tab title="cURL" icon="globe">
    \`\`\`bash  theme={null}
    curl -X POST https://mcp.lat/api/tokens \\
      -H "Authorization: Bearer $SPAINMCP_API_KEY" \\
      -H "Content-Type: application/json" \\
      -d '{
        "policy": [
          {
            "namespaces": "mi-app",
            "resources": "connections",
            "operations": ["read", "execute"],
            "metadata": { "userId": "usuario-123", "tier": "pro" },
            "ttl": "1h"
          }
        ]
      }'
    \`\`\`
  </Tab>
</Tabs>

## Acceso Multi-Nivel (Workspace / Org)

Las apps reales suelen tener múltiples niveles de acceso. Por ejemplo, un usuario debería ver:

* Sus propias conexiones
* Conexiones compartidas con su workspace
* Conexiones globales configuradas por un administrador

Pasa **múltiples restricciones** en el array \`policy\`. Cada restricción es un permiso independiente — el token puede acceder a cualquier cosa que coincida con **alguna** de ellas.

<Tabs>
  <Tab title="CLI" icon="terminal">
    \`\`\`bash  theme={null}
    spainmcp auth token --policy '[
      {
        "namespaces": "mi-app",
        "resources": "connections",
        "operations": ["read", "execute"],
        "metadata": { "userId": "usuario-123" },
        "ttl": "1h"
      },
      {
        "namespaces": "mi-app",
        "resources": "connections",
        "operations": ["read", "execute"],
        "metadata": { "workspaceId": "ws-acme" },
        "ttl": "1h"
      },
      {
        "namespaces": "mi-app",
        "resources": "connections",
        "operations": ["read", "execute"],
        "metadata": { "scope": "global" },
        "ttl": "1h"
      }
    ]'
    \`\`\`
  </Tab>

  <Tab title="TypeScript" icon="braces">
    \`\`\`typescript  theme={null}
    const { token } = await spainmcp.tokens.create({
      policy: [
        // Permiso 1: conexiones propias del usuario
        {
          namespaces: 'mi-app',
          resources: 'connections',
          operations: ['read', 'execute'],
          metadata: { userId: 'usuario-123' },
          ttl: '1h',
        },
        // Permiso 2: conexiones compartidas del workspace
        {
          namespaces: 'mi-app',
          resources: 'connections',
          operations: ['read', 'execute'],
          metadata: { workspaceId: 'ws-acme' },
          ttl: '1h',
        },
        // Permiso 3: conexiones globales (configuradas por admin)
        {
          namespaces: 'mi-app',
          resources: 'connections',
          operations: ['read', 'execute'],
          metadata: { scope: 'global' },
          ttl: '1h',
        },
      ],
    })
    \`\`\`
  </Tab>

  <Tab title="cURL" icon="globe">
    \`\`\`bash  theme={null}
    curl -X POST https://mcp.lat/api/tokens \\
      -H "Authorization: Bearer $SPAINMCP_API_KEY" \\
      -H "Content-Type: application/json" \\
      -d '{
        "policy": [
          {
            "namespaces": "mi-app",
            "resources": "connections",
            "operations": ["read", "execute"],
            "metadata": { "userId": "usuario-123" },
            "ttl": "1h"
          },
          {
            "namespaces": "mi-app",
            "resources": "connections",
            "operations": ["read", "execute"],
            "metadata": { "workspaceId": "ws-acme" },
            "ttl": "1h"
          },
          {
            "namespaces": "mi-app",
            "resources": "connections",
            "operations": ["read", "execute"],
            "metadata": { "scope": "global" },
            "ttl": "1h"
          }
        ]
      }'
    \`\`\`
  </Tab>
</Tabs>

El portador del token ve las conexiones que coincidan con **cualquiera** de los tres permisos. Esto elimina la necesidad de tokens separados por nivel de acceso.

<Note>
  Para que esto funcione, etiqueta tus conexiones con la metadata correcta al crearlas:

  * Conexiones de usuario: \`metadata: { userId: 'usuario-123' }\`
  * Conexiones de workspace: \`metadata: { workspaceId: 'ws-acme' }\`
  * Conexiones globales: \`metadata: { scope: 'global' }\`
</Note>

## Estrechar un Token

Puedes crear un token más restringido a partir de un token de servicio existente. El nuevo token solo puede tener permisos **iguales o menores** — no puede superar el alcance del token padre.

Esto es útil cuando tu backend tiene un token amplio y necesita distribuir tokens más restringidos por petición. Por ejemplo, usando el token multi-nivel de la sección anterior como punto de partida:

<Tabs>
  <Tab title="CLI" icon="terminal">
    \`\`\`bash  theme={null}
    # Estrechar el token amplio a las conexiones de un solo usuario
    SPAINMCP_API_KEY=$BROAD_SERVICE_TOKEN spainmcp auth token \\
      --policy '[{
        "resources": "connections",
        "operations": "read",
        "metadata": { "userId": "usuario-123" },
        "ttl": "20m"
      }]'
    \`\`\`
  </Tab>

  <Tab title="TypeScript" icon="braces">
    \`\`\`typescript  theme={null}
    // Token amplio de antes — cubre conexiones de usuario, workspace y globales
    const spainmcpWithBroadToken = new SpainMCP({ apiKey: token })

    // Estrecharlo a solo las conexiones de este usuario, solo lectura, TTL más corto
    const { token: userToken } = await spainmcpWithBroadToken.tokens.create({
      policy: [
        {
          resources: 'connections',
          operations: 'read',
          metadata: { userId: 'usuario-123' },
          ttl: '20m',
        },
      ],
    })

    // userToken solo puede leer las conexiones de usuario-123 —
    // los permisos de workspace y global del padre quedan excluidos
    \`\`\`
  </Tab>

  <Tab title="cURL" icon="globe">
    \`\`\`bash  theme={null}
    # Estrechar el token amplio a las conexiones de un solo usuario
    curl -X POST https://mcp.lat/api/tokens \\
      -H "Authorization: Bearer $BROAD_SERVICE_TOKEN" \\
      -H "Content-Type: application/json" \\
      -d '{
        "policy": [
          {
            "resources": "connections",
            "operations": "read",
            "metadata": { "userId": "usuario-123" },
            "ttl": "20m"
          }
        ]
      }'
    \`\`\`
  </Tab>
</Tabs>

**Cuándo usar esto:** Tu backend acuña un token amplio al arrancar (p.ej., todas las conexiones de un namespace). Por petición, lo estrecha para el usuario o contexto específico antes de pasarlo al código cliente.

## Scoping de Operaciones

Controla qué operaciones puede realizar un token sobre cada recurso.

| Recurso       | Operaciones     | Descripción                              |
| ------------- | --------------- | ---------------------------------------- |
| \`connections\` | \`read\`          | Listar y obtener conexiones              |
| \`connections\` | \`write\`         | Crear y eliminar conexiones              |
| \`connections\` | \`execute\`       | Llamar herramientas MCP a través de una conexión |
| \`servers\`     | \`read\`, \`write\` | Metadata y configuración del servidor    |
| \`namespaces\`  | \`read\`, \`write\` | Gestión de namespaces                    |

### Token Solo Lectura (Dashboard)

<Tabs>
  <Tab title="CLI" icon="terminal">
    \`\`\`bash  theme={null}
    spainmcp auth token --policy '[{
      "namespaces": "mi-app",
      "resources": "connections",
      "operations": "read",
      "ttl": "1h"
    }]'
    \`\`\`
  </Tab>

  <Tab title="TypeScript" icon="braces">
    \`\`\`typescript  theme={null}
    const { token } = await spainmcp.tokens.create({
      policy: [
        {
          namespaces: 'mi-app',
          resources: 'connections',
          operations: 'read',
          ttl: '1h',
        },
      ],
    })
    \`\`\`
  </Tab>

  <Tab title="cURL" icon="globe">
    \`\`\`bash  theme={null}
    curl -X POST https://mcp.lat/api/tokens \\
      -H "Authorization: Bearer $SPAINMCP_API_KEY" \\
      -H "Content-Type: application/json" \\
      -d '{
        "policy": [
          {
            "namespaces": "mi-app",
            "resources": "connections",
            "operations": "read",
            "ttl": "1h"
          }
        ]
      }'
    \`\`\`
  </Tab>
</Tabs>

### Token Solo Ejecución (Agente)

<Tabs>
  <Tab title="CLI" icon="terminal">
    \`\`\`bash  theme={null}
    spainmcp auth token --policy '[{
      "namespaces": "mi-app",
      "resources": "connections",
      "operations": "execute",
      "metadata": { "userId": "usuario-123" },
      "ttl": "30m"
    }]'
    \`\`\`
  </Tab>

  <Tab title="TypeScript" icon="braces">
    \`\`\`typescript  theme={null}
    const { token } = await spainmcp.tokens.create({
      policy: [
        {
          namespaces: 'mi-app',
          resources: 'connections',
          operations: 'execute',
          metadata: { userId: 'usuario-123' },
          ttl: '30m',
        },
      ],
    })
    \`\`\`
  </Tab>

  <Tab title="cURL" icon="globe">
    \`\`\`bash  theme={null}
    curl -X POST https://mcp.lat/api/tokens \\
      -H "Authorization: Bearer $SPAINMCP_API_KEY" \\
      -H "Content-Type: application/json" \\
      -d '{
        "policy": [
          {
            "namespaces": "mi-app",
            "resources": "connections",
            "operations": "execute",
            "metadata": { "userId": "usuario-123" },
            "ttl": "30m"
          }
        ]
      }'
    \`\`\`
  </Tab>
</Tabs>

### Token Multi-Recurso

Un único token puede conceder acceso a múltiples recursos pasando varias restricciones en el array \`policy\`:

<Tabs>
  <Tab title="CLI" icon="terminal">
    \`\`\`bash  theme={null}
    spainmcp auth token --policy '[
      {
        "namespaces": "mi-app",
        "resources": "connections",
        "operations": ["read", "execute"],
        "metadata": { "userId": "usuario-123" },
        "ttl": "1h"
      },
      {
        "namespaces": "mi-app",
        "resources": "servers",
        "operations": "read",
        "ttl": "1h"
      }
    ]'
    \`\`\`
  </Tab>

  <Tab title="TypeScript" icon="braces">
    \`\`\`typescript  theme={null}
    const { token } = await spainmcp.tokens.create({
      policy: [
        {
          namespaces: 'mi-app',
          resources: 'connections',
          operations: ['read', 'execute'],
          metadata: { userId: 'usuario-123' },
          ttl: '1h',
        },
        {
          namespaces: 'mi-app',
          resources: 'servers',
          operations: 'read',
          ttl: '1h',
        },
      ],
    })
    \`\`\`
  </Tab>

  <Tab title="cURL" icon="globe">
    \`\`\`bash  theme={null}
    curl -X POST https://mcp.lat/api/tokens \\
      -H "Authorization: Bearer $SPAINMCP_API_KEY" \\
      -H "Content-Type: application/json" \\
      -d '{
        "policy": [
          {
            "namespaces": "mi-app",
            "resources": "connections",
            "operations": ["read", "execute"],
            "metadata": { "userId": "usuario-123" },
            "ttl": "1h"
          },
          {
            "namespaces": "mi-app",
            "resources": "servers",
            "operations": "read",
            "ttl": "1h"
          }
        ]
      }'
    \`\`\`
  </Tab>
</Tabs>

## Coincidencia de Peticiones MCP (Experimental)

<Warning>
  **Inestable** — La coincidencia de peticiones MCP es experimental. El campo \`rpcReqMatch\` puede cambiar en versiones futuras.
</Warning>

Por defecto, un token con \`connections:execute\` puede invocar **cualquier** herramienta a través de una conexión. El campo \`rpcReqMatch\` te permite restringir *qué* peticiones JSON-RPC puede hacer un token, controlando al nivel de petición.

Las reglas de coincidencia inspeccionan el cuerpo JSON-RPC. Las claves son rutas con puntos (p.ej., \`params.name\` apunta al nombre de la herramienta en una petición \`tools/call\`). Los valores son **patrones regex**. Todas las entradas dentro de una restricción se combinan con AND.

### Permitir Solo Herramientas Específicas

<Tabs>
  <Tab title="TypeScript" icon="braces">
    \`\`\`typescript  theme={null}
    const { token } = await spainmcp.tokens.create({
      policy: [
        {
          namespaces: 'mi-app',
          resources: 'connections',
          operations: 'execute',
          metadata: { userId: 'usuario-123' },
          rpcReqMatch: { 'params.name': '^(boe_del_dia|buscar_boe)$' },
          ttl: '1h',
        },
      ],
    })

    // Este token solo puede llamar las herramientas "boe_del_dia" y "buscar_boe" — nada más
    \`\`\`
  </Tab>

  <Tab title="cURL" icon="globe">
    \`\`\`bash  theme={null}
    curl -X POST https://mcp.lat/api/tokens \\
      -H "Authorization: Bearer $SPAINMCP_API_KEY" \\
      -H "Content-Type: application/json" \\
      -d '{
        "policy": [
          {
            "namespaces": "mi-app",
            "resources": "connections",
            "operations": "execute",
            "metadata": { "userId": "usuario-123" },
            "rpcReqMatch": { "params.name": "^(boe_del_dia|buscar_boe)$" },
            "ttl": "1h"
          }
        ]
      }'
    \`\`\`
  </Tab>
</Tabs>

### Permisos Mixtos: Lectura + Ejecución Restringida

Un token que puede listar conexiones libremente pero solo ejecutar herramientas específicas requiere dos restricciones — una para acceso de lectura y otra para ejecución restringida:

<Tabs>
  <Tab title="TypeScript" icon="braces">
    \`\`\`typescript  theme={null}
    const { token } = await spainmcp.tokens.create({
      policy: [
        // Permiso 1: listar conexiones (sin restricción rpcReqMatch)
        {
          namespaces: 'mi-app',
          resources: 'connections',
          operations: 'read',
          metadata: { userId: 'usuario-123' },
          ttl: '1h',
        },
        // Permiso 2: ejecutar solo la herramienta "boe_del_dia"
        {
          namespaces: 'mi-app',
          resources: 'connections',
          operations: 'execute',
          metadata: { userId: 'usuario-123' },
          rpcReqMatch: { 'params.name': '^boe_del_dia$' },
          ttl: '1h',
        },
      ],
    })
    \`\`\`
  </Tab>

  <Tab title="cURL" icon="globe">
    \`\`\`bash  theme={null}
    curl -X POST https://mcp.lat/api/tokens \\
      -H "Authorization: Bearer $SPAINMCP_API_KEY" \\
      -H "Content-Type: application/json" \\
      -d '{
        "policy": [
          {
            "namespaces": "mi-app",
            "resources": "connections",
            "operations": "read",
            "metadata": { "userId": "usuario-123" },
            "ttl": "1h"
          },
          {
            "namespaces": "mi-app",
            "resources": "connections",
            "operations": "execute",
            "metadata": { "userId": "usuario-123" },
            "rpcReqMatch": { "params.name": "^boe_del_dia$" },
            "ttl": "1h"
          }
        ]
      }'
    \`\`\`
  </Tab>
</Tabs>

### Patrones de Coincidencia

Los valores de coincidencia son **patrones regex**. Usa anclas (\`^...$\`) para coincidencia exacta:

| Patrón                        | Valores de ejemplo                        | Significado           |
| ----------------------------- | ----------------------------------------- | --------------------- |
| \`"^boe_del_dia$"\`             | \`"boe_del_dia"\`                           | Coincidencia exacta   |
| \`"^(boe_del_dia\\|buscar_boe)$"\` | \`"boe_del_dia"\`, \`"buscar_boe"\`        | Uno de varios valores |
| \`"^crear_"\`                   | \`"crear_issue"\`, \`"crear_usuario"\`      | Coincidencia de prefijo |
| \`".*"\`                        | cualquier cosa                            | Coincide con todo     |

Las entradas de coincidencia se combinan con AND dentro de una restricción. Múltiples claves \`rpcReqMatch\` implican que la petición debe satisfacer **todas** ellas:

\`\`\`typescript  theme={null}
rpcReqMatch: {
  'params.name': '^boe_del_dia$',
  'params.arguments.fecha': '^2024-',
}
// Solo permite tools/call donde name es "boe_del_dia" Y fecha empieza con "2024-"
\`\`\`

<Note>
  Las rutas con puntos coinciden dentro del cuerpo de la petición JSON-RPC. Para una petición \`tools/call\` como \`{"method":"tools/call","params":{"name":"boe_del_dia","arguments":{"fecha":"2024-01-15"}}}\`, la ruta \`params.name\` coincide con \`"boe_del_dia"\` y \`params.arguments.fecha\` coincide con \`"2024-01-15"\`.
</Note>

## Referencia de Restricciones

El array \`policy\` contiene **restricciones** — cada una es un permiso autónomo que describe a qué puede acceder el token.

\`\`\`typescript  theme={null}
interface Restriccion {
  namespaces?: string | string[]
  resources?: 'connections' | 'servers' | 'namespaces' | 'skills'
    | ('connections' | 'servers' | 'namespaces' | 'skills')[]
  operations?: 'read' | 'write' | 'execute'
    | ('read' | 'write' | 'execute')[]
  metadata?: Record<string, string>
    | Record<string, string>[]
  rpcReqMatch?: Record<string, string>  // experimental — patrones regex para coincidencia de peticiones MCP
  ttl?: string | number  // p.ej., "1h", "30m", "20s", 3600
}
\`\`\`

Dos reglas gobiernan cada restricción:

* **Añadir un campo estrecha** (AND). Cada campo añade una condición. Más campos = más restrictivo.
* **Añadir a una lista amplía** (OR). Cada elemento de la lista añade una alternativa. Más elementos = más permisivo.

\`\`\`typescript  theme={null}
// Añadir campos estrecha el permiso
{ resources: 'connections' }
// → cualquier operación sobre connections

{ resources: 'connections', operations: 'read' }
// → solo leer connections

{ resources: 'connections', operations: 'read', metadata: { userId: 'usuario-123' } }
// → solo leer las connections de usuario-123

// Añadir a una lista amplía el permiso
{ operations: ['read', 'write'] }
// → read OR write

{ metadata: [{ userId: 'usuario-123' }, { workspaceId: 'ws-acme' }] }
// → userId=usuario-123 OR workspaceId=ws-acme
\`\`\`

Cuando pasas **múltiples restricciones** en el array \`policy\`, cada una es un permiso independiente. El token puede acceder a cualquier cosa que coincida con **cualquier** restricción.

<Tabs>
  <Tab title="CLI" icon="terminal">
    \`\`\`bash  theme={null}
    # Dos permisos: leer connections de alice O leer/escribir servers
    spainmcp auth token --policy '[
      {
        "resources": "connections",
        "operations": "read",
        "metadata": { "owner": "alice" }
      },
      {
        "resources": "servers",
        "operations": ["read", "write"]
      }
    ]'
    \`\`\`
  </Tab>

  <Tab title="TypeScript" icon="braces">
    \`\`\`typescript  theme={null}
    // Dos permisos: leer connections de alice O leer/escribir servers
    const { token } = await spainmcp.tokens.create({
      policy: [
        {
          resources: 'connections',
          operations: 'read',
          metadata: { owner: 'alice' },
        },
        {
          resources: 'servers',
          operations: ['read', 'write'],
        },
      ],
    })
    \`\`\`
  </Tab>

  <Tab title="cURL" icon="globe">
    \`\`\`bash  theme={null}
    # Dos permisos: leer connections de alice O leer/escribir servers
    curl -X POST https://mcp.lat/api/tokens \\
      -H "Authorization: Bearer $SPAINMCP_API_KEY" \\
      -H "Content-Type: application/json" \\
      -d '{
        "policy": [
          {
            "resources": "connections",
            "operations": "read",
            "metadata": { "owner": "alice" }
          },
          {
            "resources": "servers",
            "operations": ["read", "write"]
          }
        ]
      }'
    \`\`\`
  </Tab>
</Tabs>

<Note>
  La metadata dentro de un único objeto se combina con AND: \`{ owner: 'alice', env: 'prod' }\` significa owner es alice **y** env es prod. Usa una lista para OR: \`[{ owner: 'alice' }, { env: 'prod' }]\` significa owner es alice **o** env es prod.
</Note>

## Buenas Prácticas de Seguridad

* **Siempre establece un TTL.** Los tokens expiran tras el TTL (máximo 24 horas). Más corto es mejor — acuña tokens frescos por sesión.
* **Limita al mínimo necesario.** Un token para llamar herramientas solo necesita \`connections:execute\`, no \`connections:write\`.
* **Usa metadata para filtrado por fila.** No te fíes solo de IDs de conexión — las restricciones de metadata se aplican en el servidor.
* **Estrecha antes de pasar a código no confiable.** Si entregas un token a un navegador, agente o sandbox, restríngelp al usuario y operaciones específicas necesarias.
* **Los tokens no pueden acuñar otros tokens de la nada.** Solo las API keys o tokens existentes pueden crear tokens, y los tokens hijo nunca pueden superar el alcance del padre.` + FOOTER,

  'use/restrictions': HEADER('use/restrictions') + `# Restricciones de Herramientas (rpcReqMatch, experimental)

> Control granular de acceso a herramientas MCP específicas mediante expresiones regulares.

# Restricciones de Herramientas

Usa \`rpcReqMatch\` para restringir peticiones MCP JSON-RPC específicas con regex. Los IDs de conexión no están en el cuerpo JSON-RPC, por lo que debes combinar \`metadata\` con \`rpcReqMatch\`.

Las restricciones son útiles cuando quieres dar acceso a un agente externo a UNA herramienta específica, sin exponer el resto del servidor.

## Cuándo usar rpcReqMatch

- Restringir acceso a herramientas específicas dentro de una conexión
- Permitir solo llamadas de lectura (no escritura) a ciertas herramientas
- Filtrar por nombre de herramienta con expresiones regulares

## Crear una restricción

<Tabs>
  <Tab title="Solo BOE" icon="terminal">
    \`\`\`bash  theme={null}
    spainmcp auth token --policy '{
      "resources": "connections",
      "operations": "execute",
      "metadata": { "connectionId": "mi-spainmcp" },
      "rpcReqMatch": {
        "method": "tools/call",
        "params.name": "^boe_"
      },
      "ttl": "30m"
    }'
    \`\`\`
  </Tab>

  <Tab title="Solo lectura de tools" icon="braces">
    \`\`\`bash  theme={null}
    spainmcp auth token --policy '{
      "resources": "connections",
      "operations": "execute",
      "rpcReqMatch": {
        "method": "tools/list"
      },
      "ttl": "1h"
    }'
    \`\`\`
  </Tab>
</Tabs>

## Campos rpcReqMatch

| Campo | Descripción |
| ----- | ----------- |
| **method** | Método JSON-RPC como regex (ej: \`tools/call\`, \`tools/list\`) |
| **params.name** | Nombre de la herramienta como regex (ej: \`^boe_\`, \`^aemet_\`) |

## Combinar con metadata

Los IDs de conexión no aparecen en el cuerpo JSON-RPC. Para restricciones a nivel de conexión, combina siempre \`metadata.connectionId\` con \`rpcReqMatch\`:

\`\`\`bash
spainmcp auth token --policy '{
  "metadata": { "connectionId": "mi-spainmcp" },
  "rpcReqMatch": { "method": "tools/call", "params.name": "^boe_" }
}'
\`\`\`

Esta característica es experimental. La API puede cambiar en futuras versiones.` + FOOTER,
}

export function getDoc(slug: string[]): string | null {
  const key = slug.join('/')
  return DOCS[key] ?? null
}
