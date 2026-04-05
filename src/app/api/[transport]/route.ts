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

    // --- TOOL 2: BOE del día ---
    server.registerTool(
      "boe_del_dia",
      {
        title: "BOE del día",
        description:
          "Obtiene el sumario del Boletín Oficial del Estado de hoy o de una fecha concreta. " +
          "Devuelve las disposiciones, resoluciones y edictos publicados ese día.",
        inputSchema: {
          fecha: z.string().optional().describe("Fecha en formato YYYYMMDD, p.ej. '20260404'. Sin fecha = hoy."),
        },
        annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
      },
      async ({ fecha }) => {
        const d = fecha ?? new Date().toISOString().slice(0, 10).replace(/-/g, "")
        const res = await fetch(
          `https://www.boe.es/datosabiertos/api/boe/sumario/${d}`,
          { headers: { Accept: "application/json" } }
        )
        if (!res.ok) return { isError: true, content: [{ type: "text" as const, text: `Error BOE API: ${res.status} — puede que sea fin de semana o festivo` }] }
        const data = await res.json()
        return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] }
      }
    )

    // --- TOOL 3: BORME del día ---
    server.registerTool(
      "borme_del_dia",
      {
        title: "BORME del día",
        description:
          "Obtiene el sumario del Boletín Oficial del Registro Mercantil de una fecha concreta. " +
          "Lista las empresas constituidas, disueltas y actos inscritos ese día. Solo días laborables.",
        inputSchema: {
          fecha: z.string().describe("Fecha en formato YYYYMMDD, p.ej. '20260401'. Solo días laborables."),
        },
        annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
      },
      async ({ fecha }) => {
        const res = await fetch(
          `https://www.boe.es/datosabiertos/api/borme/sumario/${fecha}`,
          { headers: { Accept: "application/json" } }
        )
        if (!res.ok) return { isError: true, content: [{ type: "text" as const, text: `Error BORME API: ${res.status} — comprueba que sea un día laborable (BORME no se publica en fines de semana ni festivos)` }] }
        const data = await res.json()
        return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] }
      }
    )

    // --- TOOL 4: Datos INE ---
    server.registerTool(
      "datos_ine",
      {
        title: "Consultar datos del INE",
        description:
          "Consulta estadísticas del Instituto Nacional de Estadística español. " +
          "Busca operaciones disponibles por nombre, p.ej. 'IPC', 'EPA', 'padrón'.",
        inputSchema: {
          busqueda: z.string().describe("Término a buscar, p.ej. 'IPC' para inflación, 'EPA' para paro, 'padron' para población"),
        },
        annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
      },
      async ({ busqueda }) => {
        const res = await fetch(
          `https://servicios.ine.es/wstempus/js/ES/OPERACIONES_DISPONIBLES?busqueda=${encodeURIComponent(busqueda)}`,
          { headers: { Accept: "application/json" } }
        )
        if (!res.ok) return { isError: true, content: [{ type: "text" as const, text: `Error INE API: ${res.status} ${res.statusText}` }] }
        const data = await res.json()
        return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] }
      }
    )

    // --- TOOL 5: AEMET — Tiempo en España ---
    server.registerTool(
      "tiempo_aemet",
      {
        title: "Tiempo AEMET",
        description:
          "Obtiene la predicción meteorológica de AEMET para un municipio español. " +
          "Usa el código INE del municipio (5 dígitos), p.ej. '28079' para Madrid, '08019' para Barcelona, '46250' para Valencia.",
        inputSchema: {
          municipio: z.string().describe("Código INE del municipio (5 dígitos). Madrid=28079, Barcelona=08019, Valencia=46250, Sevilla=41091, Zaragoza=50297"),
        },
        annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: false, openWorldHint: true },
      },
      async ({ municipio }) => {
        const apiKey = process.env.AEMET_API_KEY
        if (!apiKey) return { isError: true, content: [{ type: "text" as const, text: "AEMET_API_KEY no configurada en el servidor" }] }

        // AEMET usa un patrón de dos pasos: primero obtiene la URL de datos, luego los datos
        const metaRes = await fetch(
          `https://opendata.aemet.es/opendata/api/prediccion/especifica/municipio/diaria/${municipio}`,
          { headers: { api_key: apiKey, Accept: "application/json" } }
        )
        if (!metaRes.ok) return { isError: true, content: [{ type: "text" as const, text: `Error AEMET: ${metaRes.status} — verifica que el código de municipio es correcto` }] }

        const meta = await metaRes.json() as { datos?: string; estado?: number; descripcion?: string }
        if (!meta.datos) return { isError: true, content: [{ type: "text" as const, text: `AEMET no devolvió datos: ${meta.descripcion ?? "sin descripción"}` }] }

        const dataRes = await fetch(meta.datos)
        if (!dataRes.ok) return { isError: true, content: [{ type: "text" as const, text: `Error obteniendo datos AEMET: ${dataRes.status}` }] }

        const data = await dataRes.json()
        return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] }
      }
    )
  },
  {},
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
  void supabase
    .from("api_keys")
    .update({ last_used_at: new Date().toISOString() })
    .eq("id", data.id)
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
