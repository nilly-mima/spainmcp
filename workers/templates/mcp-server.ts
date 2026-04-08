// ═══════════════════════════════════════════════════
// SpainMCP — MCP Server Template
// Customiza las tools y despliega en SpainMCP
// Zero dependencies — funciona como CF Worker directo
// ═══════════════════════════════════════════════════

// ── Define tus tools aquí ──

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
  {
    name: "sumar",
    description: "Suma dos números",
    inputSchema: {
      type: "object",
      properties: {
        a: { type: "number", description: "Primer número" },
        b: { type: "number", description: "Segundo número" },
      },
      required: ["a", "b"],
    },
  },
];

// ── Implementa tus tools aquí ──

async function handleTool(
  name: string,
  args: Record<string, unknown>,
): Promise<{ type: string; text: string }[]> {
  switch (name) {
    case "hello": {
      const who = (args.name as string) ?? "Mundo";
      return [{ type: "text", text: `¡Hola, ${who}! 👋` }];
    }
    case "sumar": {
      const a = Number(args.a ?? 0);
      const b = Number(args.b ?? 0);
      return [{ type: "text", text: `${a} + ${b} = ${a + b}` }];
    }
    default:
      throw new Error(`Tool no encontrada: ${name}`);
  }
}

// ═══════════════════════════════════════════════════
// MCP Protocol handler — NO TOCAR (a menos que sepas lo que haces)
// ═══════════════════════════════════════════════════

const SERVER_NAME = "mi-mcp-server";
const SERVER_VERSION = "1.0.0";

export default {
  async fetch(request: Request): Promise<Response> {
    // CORS
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization, Accept",
        },
      });
    }

    // Info page
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

    // initialize
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

    // notifications/initialized
    if (method === "notifications/initialized") {
      return Response.json({ jsonrpc: "2.0", id, result: {} });
    }

    // tools/list
    if (method === "tools/list") {
      return Response.json({
        jsonrpc: "2.0",
        id,
        result: { tools: TOOLS },
      });
    }

    // tools/call
    if (method === "tools/call") {
      const toolName = (params?.name as string) ?? "";
      const args = (params?.arguments as Record<string, unknown>) ?? {};

      const tool = TOOLS.find((t) => t.name === toolName);
      if (!tool) {
        return Response.json({
          jsonrpc: "2.0",
          id,
          error: { code: -32601, message: `Tool not found: ${toolName}` },
        });
      }

      try {
        const content = await handleTool(toolName, args);
        return Response.json({ jsonrpc: "2.0", id, result: { content } });
      } catch (err) {
        return Response.json({
          jsonrpc: "2.0",
          id,
          error: { code: -32000, message: String(err) },
        });
      }
    }

    return Response.json({
      jsonrpc: "2.0",
      id,
      error: { code: -32601, message: `Method not found: ${method}` },
    });
  },
};
