export interface ServerTemplate {
  id: string
  label: string
  description: string
  code: string
}

export const SERVER_TEMPLATES: ServerTemplate[] = [
  {
    id: 'blank',
    label: 'En blanco',
    description: 'Tool de ejemplo: hola mundo',
    code: `// ═══════════════════════════════════════════════════
// SpainMCP — Plantilla en blanco
// Define tus tools en TOOLS[] e impleméntalas en handleTool()
// ═══════════════════════════════════════════════════

const TOOLS = [
  {
    name: "hello",
    description: "Saluda a alguien por su nombre",
    inputSchema: {
      type: "object",
      properties: {
        name: { type: "string", description: "Nombre de la persona" },
      },
    },
  },
];

async function handleTool(
  name: string,
  args: Record<string, unknown>,
): Promise<{ type: string; text: string }[]> {
  switch (name) {
    case "hello": {
      const who = (args.name as string) ?? "Mundo";
      return [{ type: "text", text: \`¡Hola, \${who}!\` }];
    }
    default:
      throw new Error(\`Tool no encontrada: \${name}\`);
  }
}

// ═══════════════════════════════════════════════════
// MCP Protocol handler — NO TOCAR
// ═══════════════════════════════════════════════════

const SERVER_NAME = "mi-servidor";
const SERVER_VERSION = "1.0.0";

export default {
  async fetch(request: Request): Promise<Response> {
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization, Accept",
        },
      });
    }

    if (request.method === "GET") {
      return Response.json({
        name: SERVER_NAME,
        version: SERVER_VERSION,
        protocol: "MCP Streamable HTTP",
        tools: TOOLS.length,
      });
    }

    if (request.method !== "POST") {
      return Response.json({ error: "Method not allowed" }, { status: 405 });
    }

    let body: { jsonrpc?: string; id?: unknown; method?: string; params?: Record<string, unknown> };
    try {
      body = await request.json();
    } catch {
      return Response.json(
        { jsonrpc: "2.0", error: { code: -32700, message: "Parse error" }, id: null },
        { status: 400 },
      );
    }

    const { method, id, params } = body;

    if (method === "initialize") {
      return Response.json({
        jsonrpc: "2.0",
        id,
        result: {
          protocolVersion: "2024-11-05",
          serverInfo: { name: SERVER_NAME, version: SERVER_VERSION },
          capabilities: { tools: { listChanged: false } },
        },
      });
    }

    if (method === "notifications/initialized") {
      return Response.json({ jsonrpc: "2.0", id, result: {} });
    }

    if (method === "tools/list") {
      return Response.json({ jsonrpc: "2.0", id, result: { tools: TOOLS } });
    }

    if (method === "tools/call") {
      const toolName = (params?.name as string) ?? "";
      const args = (params?.arguments as Record<string, unknown>) ?? {};
      const tool = TOOLS.find((t) => t.name === toolName);
      if (!tool) {
        return Response.json({
          jsonrpc: "2.0", id,
          error: { code: -32601, message: \`Tool not found: \${toolName}\` },
        });
      }
      try {
        const content = await handleTool(toolName, args);
        return Response.json({ jsonrpc: "2.0", id, result: { content } });
      } catch (err) {
        return Response.json({
          jsonrpc: "2.0", id,
          error: { code: -32000, message: String(err) },
        });
      }
    }

    return Response.json({
      jsonrpc: "2.0", id,
      error: { code: -32601, message: \`Method not found: \${method}\` },
    });
  },
};
`,
  },

  {
    id: 'api-proxy',
    label: 'API Proxy',
    description: 'Proxies a an external REST API and exposes its data as MCP tools',
    code: `// ═══════════════════════════════════════════════════
// SpainMCP — Plantilla API Proxy
// Conecta con una API REST externa y expone sus datos como tools MCP
// Cambia API_BASE_URL y adapta los endpoints que necesites
// ═══════════════════════════════════════════════════

const API_BASE_URL = "https://api.ejemplo.com";

const TOOLS = [
  {
    name: "buscar",
    description: "Busca elementos en la API externa",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string", description: "Término de búsqueda" },
        limit: { type: "number", description: "Número máximo de resultados (default: 10)" },
      },
      required: ["query"],
    },
  },
  {
    name: "obtener",
    description: "Obtiene un elemento por su ID",
    inputSchema: {
      type: "object",
      properties: {
        id: { type: "string", description: "ID del elemento" },
      },
      required: ["id"],
    },
  },
];

async function handleTool(
  name: string,
  args: Record<string, unknown>,
): Promise<{ type: string; text: string }[]> {
  switch (name) {
    case "buscar": {
      const query = encodeURIComponent((args.query as string) ?? "");
      const limit = Number(args.limit ?? 10);
      const res = await fetch(\`\${API_BASE_URL}/search?q=\${query}&limit=\${limit}\`, {
        headers: { "Accept": "application/json" },
      });
      if (!res.ok) throw new Error(\`API error: \${res.status}\`);
      const data = await res.json();
      return [{ type: "text", text: JSON.stringify(data, null, 2) }];
    }
    case "obtener": {
      const id = encodeURIComponent((args.id as string) ?? "");
      const res = await fetch(\`\${API_BASE_URL}/items/\${id}\`, {
        headers: { "Accept": "application/json" },
      });
      if (!res.ok) throw new Error(\`API error: \${res.status}\`);
      const data = await res.json();
      return [{ type: "text", text: JSON.stringify(data, null, 2) }];
    }
    default:
      throw new Error(\`Tool no encontrada: \${name}\`);
  }
}

// ═══════════════════════════════════════════════════
// MCP Protocol handler — NO TOCAR
// ═══════════════════════════════════════════════════

const SERVER_NAME = "api-proxy";
const SERVER_VERSION = "1.0.0";

export default {
  async fetch(request: Request): Promise<Response> {
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization, Accept",
        },
      });
    }

    if (request.method === "GET") {
      return Response.json({
        name: SERVER_NAME,
        version: SERVER_VERSION,
        protocol: "MCP Streamable HTTP",
        tools: TOOLS.length,
      });
    }

    if (request.method !== "POST") {
      return Response.json({ error: "Method not allowed" }, { status: 405 });
    }

    let body: { jsonrpc?: string; id?: unknown; method?: string; params?: Record<string, unknown> };
    try {
      body = await request.json();
    } catch {
      return Response.json(
        { jsonrpc: "2.0", error: { code: -32700, message: "Parse error" }, id: null },
        { status: 400 },
      );
    }

    const { method, id, params } = body;

    if (method === "initialize") {
      return Response.json({
        jsonrpc: "2.0",
        id,
        result: {
          protocolVersion: "2024-11-05",
          serverInfo: { name: SERVER_NAME, version: SERVER_VERSION },
          capabilities: { tools: { listChanged: false } },
        },
      });
    }

    if (method === "notifications/initialized") {
      return Response.json({ jsonrpc: "2.0", id, result: {} });
    }

    if (method === "tools/list") {
      return Response.json({ jsonrpc: "2.0", id, result: { tools: TOOLS } });
    }

    if (method === "tools/call") {
      const toolName = (params?.name as string) ?? "";
      const args = (params?.arguments as Record<string, unknown>) ?? {};
      const tool = TOOLS.find((t) => t.name === toolName);
      if (!tool) {
        return Response.json({
          jsonrpc: "2.0", id,
          error: { code: -32601, message: \`Tool not found: \${toolName}\` },
        });
      }
      try {
        const content = await handleTool(toolName, args);
        return Response.json({ jsonrpc: "2.0", id, result: { content } });
      } catch (err) {
        return Response.json({
          jsonrpc: "2.0", id,
          error: { code: -32000, message: String(err) },
        });
      }
    }

    return Response.json({
      jsonrpc: "2.0", id,
      error: { code: -32601, message: \`Method not found: \${method}\` },
    });
  },
};
`,
  },

  {
    id: 'database',
    label: 'Base de datos',
    description: 'Consulta una base de datos D1 o Supabase y expone los datos como tools',
    code: `// ═══════════════════════════════════════════════════
// SpainMCP — Plantilla Base de datos
// Consulta Supabase (REST API) y expone tablas como tools MCP
// Configura SUPABASE_URL y SUPABASE_ANON_KEY en las variables
// de entorno del Worker (Settings → Variables)
// ═══════════════════════════════════════════════════

// Variables de entorno: SUPABASE_URL, SUPABASE_ANON_KEY
// Accede con: (globalThis as Record<string, unknown>).SUPABASE_URL

function getEnv(key: string): string {
  return ((globalThis as Record<string, unknown>)[key] as string) ?? "";
}

const TOOLS = [
  {
    name: "listar_registros",
    description: "Lista los registros de una tabla",
    inputSchema: {
      type: "object",
      properties: {
        tabla: { type: "string", description: "Nombre de la tabla" },
        limite: { type: "number", description: "Máximo de registros (default: 20)" },
      },
      required: ["tabla"],
    },
  },
  {
    name: "buscar_registros",
    description: "Busca registros que coincidan con un campo y valor",
    inputSchema: {
      type: "object",
      properties: {
        tabla: { type: "string", description: "Nombre de la tabla" },
        campo: { type: "string", description: "Campo por el que filtrar" },
        valor: { type: "string", description: "Valor a buscar" },
      },
      required: ["tabla", "campo", "valor"],
    },
  },
];

async function handleTool(
  name: string,
  args: Record<string, unknown>,
): Promise<{ type: string; text: string }[]> {
  const supabaseUrl = getEnv("SUPABASE_URL");
  const supabaseKey = getEnv("SUPABASE_ANON_KEY");

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Variables de entorno SUPABASE_URL y SUPABASE_ANON_KEY no configuradas");
  }

  const headers = {
    "apikey": supabaseKey,
    "Authorization": \`Bearer \${supabaseKey}\`,
    "Accept": "application/json",
  };

  switch (name) {
    case "listar_registros": {
      const tabla = encodeURIComponent((args.tabla as string) ?? "");
      const limite = Number(args.limite ?? 20);
      const res = await fetch(
        \`\${supabaseUrl}/rest/v1/\${tabla}?limit=\${limite}\`,
        { headers },
      );
      if (!res.ok) throw new Error(\`Supabase error: \${res.status}\`);
      const data = await res.json();
      return [{ type: "text", text: JSON.stringify(data, null, 2) }];
    }
    case "buscar_registros": {
      const tabla = encodeURIComponent((args.tabla as string) ?? "");
      const campo = encodeURIComponent((args.campo as string) ?? "");
      const valor = encodeURIComponent((args.valor as string) ?? "");
      const res = await fetch(
        \`\${supabaseUrl}/rest/v1/\${tabla}?\${campo}=eq.\${valor}\`,
        { headers },
      );
      if (!res.ok) throw new Error(\`Supabase error: \${res.status}\`);
      const data = await res.json();
      return [{ type: "text", text: JSON.stringify(data, null, 2) }];
    }
    default:
      throw new Error(\`Tool no encontrada: \${name}\`);
  }
}

// ═══════════════════════════════════════════════════
// MCP Protocol handler — NO TOCAR
// ═══════════════════════════════════════════════════

const SERVER_NAME = "db-server";
const SERVER_VERSION = "1.0.0";

export default {
  async fetch(request: Request): Promise<Response> {
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization, Accept",
        },
      });
    }

    if (request.method === "GET") {
      return Response.json({
        name: SERVER_NAME,
        version: SERVER_VERSION,
        protocol: "MCP Streamable HTTP",
        tools: TOOLS.length,
      });
    }

    if (request.method !== "POST") {
      return Response.json({ error: "Method not allowed" }, { status: 405 });
    }

    let body: { jsonrpc?: string; id?: unknown; method?: string; params?: Record<string, unknown> };
    try {
      body = await request.json();
    } catch {
      return Response.json(
        { jsonrpc: "2.0", error: { code: -32700, message: "Parse error" }, id: null },
        { status: 400 },
      );
    }

    const { method, id, params } = body;

    if (method === "initialize") {
      return Response.json({
        jsonrpc: "2.0",
        id,
        result: {
          protocolVersion: "2024-11-05",
          serverInfo: { name: SERVER_NAME, version: SERVER_VERSION },
          capabilities: { tools: { listChanged: false } },
        },
      });
    }

    if (method === "notifications/initialized") {
      return Response.json({ jsonrpc: "2.0", id, result: {} });
    }

    if (method === "tools/list") {
      return Response.json({ jsonrpc: "2.0", id, result: { tools: TOOLS } });
    }

    if (method === "tools/call") {
      const toolName = (params?.name as string) ?? "";
      const args = (params?.arguments as Record<string, unknown>) ?? {};
      const tool = TOOLS.find((t) => t.name === toolName);
      if (!tool) {
        return Response.json({
          jsonrpc: "2.0", id,
          error: { code: -32601, message: \`Tool not found: \${toolName}\` },
        });
      }
      try {
        const content = await handleTool(toolName, args);
        return Response.json({ jsonrpc: "2.0", id, result: { content } });
      } catch (err) {
        return Response.json({
          jsonrpc: "2.0", id,
          error: { code: -32000, message: String(err) },
        });
      }
    }

    return Response.json({
      jsonrpc: "2.0", id,
      error: { code: -32601, message: \`Method not found: \${method}\` },
    });
  },
};
`,
  },
]
