import { createMcpHandler, withMcpAuth } from "mcp-handler"
import { z } from "zod"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const handler = createMcpHandler(
  (server) => {
    // --- TOOL 1: Buscar en el BOE ---
    server.registerTool(
      "ping",
      {
        title: "Ping SpainMCP",
        description: "Comprueba que el servidor SpainMCP está funcionando correctamente.",
        inputSchema: {},
        annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
      },
      async () => ({
        content: [{ type: "text" as const, text: JSON.stringify({ status: "ok", server: "SpainMCP", version: "0.1.0", timestamp: new Date().toISOString() }) }],
      })
    )

    server.registerTool(
      "buscar_en_boe",
      {
        title: "Buscar en el BOE",
        description:
          "Busca documentos en el Boletín Oficial del Estado español. " +
          "Útil para encontrar leyes, resoluciones, convocatorias y edictos oficiales.",
        inputSchema: {
          termino: z.string().describe("Término de búsqueda, p.ej. 'subvenciones pymes Barcelona'"),
          fecha_desde: z.string().optional().describe("Fecha inicio YYYYMMDD, opcional"),
        },
        annotations: {
          readOnlyHint: true,
          destructiveHint: false,
          idempotentHint: true,
          openWorldHint: true,
        },
      },
      async ({ termino, fecha_desde }) => {
        // API legislación consolidada BOE — búsqueda por expresión
        const params = new URLSearchParams({ expresion: termino })
        if (fecha_desde) params.set("fechaDesde", fecha_desde)
        const res = await fetch(
          `https://www.boe.es/datosabiertos/api/legislacion-consolidada?${params}`,
          { headers: { Accept: "application/json" } }
        )
        if (!res.ok) {
          return {
            isError: true,
            content: [{ type: "text" as const, text: `Error BOE API: ${res.status} ${res.statusText}` }],
          }
        }
        const data = await res.json()
        return {
          content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }],
        }
      }
    )
  },
  {
    name: "SpainMCP",
    version: "0.1.0",
  },
  { basePath: "/api", maxDuration: 60 }
)

// ── Auth ─────────────────────────────────────────────────────────────────────

async function sha256(text: string): Promise<string> {
  const buf = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(text)
  )
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
}

const verifyToken = async (
  _req: Request,
  bearerToken?: string
): Promise<{ token: string; scopes: string[]; clientId: string; extra: Record<string, string> } | undefined> => {
  if (!bearerToken) return undefined
  const hash = await sha256(bearerToken)
  const { data } = await supabase
    .from("api_keys")
    .select("id, email, tier")
    .eq("key_hash", hash)
    .eq("is_active", true)
    .single()
  if (!data) return undefined
  // Incrementar contador (fire & forget — no bloqueamos la respuesta)
  supabase
    .from("api_keys")
    .update({ last_used_at: new Date().toISOString(), requests_count: (data as any).requests_count + 1 })
    .eq("id", data.id)
    .then(() => {})
    .catch(() => {})
  return {
    token: bearerToken,
    scopes: ["mcp"],
    clientId: data.email,
    extra: { tier: data.tier },
  }
}

const authHandler = withMcpAuth(handler, verifyToken, { required: true })

export { authHandler as GET, authHandler as POST }
export const maxDuration = 60
